from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import math
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime
import jwt
from supabase import create_client, Client
from functools import wraps
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from django.shortcuts import get_object_or_404
from django.conf import settings

# -----------------------------
# Load environment variables
# -----------------------------
load_dotenv()
GEN_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEN_API_KEY)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# -----------------------------
# Optional JWT authentication
# -----------------------------
def require_auth(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({"error": "Authorization header missing or invalid"}, status=401)
        token = auth_header.split(' ')[1]
        try:
            # Decode without verifying signature (for dev/testing)
            payload = jwt.decode(token, options={"verify_signature": False})
            request.user_id = payload.get('sub')
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

# -----------------------------
# Main endpoint
# -----------------------------
@csrf_exempt
# @require_auth  # Uncomment after login/signup setup
def analyze_symptoms(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=405)

    try:
        data = json.loads(request.body)

        # -----------------------------
        # Extract user info
        # -----------------------------
        height = data.get("height", None)
        weight = data.get("weight", None)
        age = data.get("age", None)
        gender = data.get("gender", None)
        symptoms = data.get("symptoms", "")
        location = data.get("location", None)
        user_lat = data.get("latitude", None)
        user_lng = data.get("longitude", None)
        # Optional conversation context (frontend may pass a conversation_id)
        conversation_id = data.get("conversation_id") or data.get("convo_id")
        context_messages = []
        if conversation_id:
            try:
                # load_recent_messages_for_llm returns list[dict] with role/text
                context_messages = load_recent_messages_for_llm(conversation_id, limit=8)
            except Exception as e:
                print(f"Failed to load conversation history for convo {conversation_id}: {e}")
                context_messages = []

        # -----------------------------
        # Validate gender value
        # -----------------------------
        if gender:
            valid_genders = {'male', 'female', 'trans'}
            if gender.lower() not in valid_genders:
                return None
                # return JsonResponse({"error": f"Invalid gender value: {gender}. Valid values are: male, female, trans."}, status=400)

        # -----------------------------
        # Validate age
        # -----------------------------
        if age is not None:
            try:
                age_n = int(age)
                if age_n <= 0 or age_n >= 120:
                    return JsonResponse({"error": f"Invalid age value: {age}. Must be an integer >0 and <120."}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({"error": f"Invalid age value: {age}. Must be an integer >0 and <120."}, status=400)

        # -----------------------------
        # Validate height
        # -----------------------------
        if height is not None:
            try:
                height_n = float(height)
                if height_n <= 30 or height_n >= 300:
                    return JsonResponse({"error": f"Invalid height value: {height}. Must be >30 and <300 (cm)."}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({"error": f"Invalid height value: {height}. Must be >30 and <300 (cm)."}, status=400)

        # -----------------------------
        # Validate weight
        # -----------------------------
        if weight is not None:
            try:
                weight_n = float(weight)
                if weight_n <= 2 or weight_n >= 600:
                    return JsonResponse({"error": f"Invalid weight value: {weight}. Must be >2 and <600 (kg)."}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({"error": f"Invalid weight value: {weight}. Must be >2 and <600 (kg)."}, status=400)

        if not symptoms:
            return JsonResponse({"error": "Please provide your symptoms"}, status=400)

        # -----------------------------
        # Calculate BMI
        # -----------------------------
        bmi = None
        if height and weight:
            try:
                h_m = float(height) / 100
                w_kg = float(weight)
                bmi = round(w_kg / (h_m ** 2), 1)
            except:
                bmi = None

        # -----------------------------
        # Prepare Gemini prompt
        # -----------------------------
        today = datetime.today()
        date_str = today.strftime("%Y-%m-%d")
        month = today.month

        # Include recent conversation context (if any) to give the LLM additional signals
        history_fragment = ""
        try:
            if context_messages:
                # represent the last messages as role: text lines for context
                history_lines = [f"{m.get('role', 'user')}: {m.get('text', '')}" for m in context_messages]
                history_fragment = "\nConversation history (most recent first):\n" + "\n".join(history_lines)
        except Exception:
            history_fragment = ""

        prompt = f"""
    Hello! I am your AI health assistant.
    Height: {height}, Weight: {weight}, Age: {age}, Gender: {gender}, BMI: {bmi if bmi else 'null'}, Location: {location}, Date: {date_str} (month: {month})
    Symptom description: {symptoms}
    {history_fragment}
    Respond ONLY with valid JSON like:
    {{"possible_diseases": ["Disease1"], "severity": "mild/moderate/severe", "doctor_recommendation": "Specialization", "advice": "Advice text", "bmi": {bmi if bmi else 'null'}}}
    """

        # -----------------------------
        # Call Gemini API (try dynamic list of supported models)
        # -----------------------------
        response = None
        last_error = None
        try:
            # Get models supporting 'generateContent'
            available_models = [
                model.name for model in genai.list_models() 
                if 'generateContent' in model.supported_generation_methods
            ]
        except Exception as e:
            available_models = [
                "gemini-1.5-flash-latest",
                "gemini-1.5-flash",
                "gemini-2.0-flash-exp"
            ]  # Fallback list if list_models call fails

        for model_name in available_models:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                break
            except Exception as e:
                last_error = str(e)
                # Log the error for better debugging
                print(f"Model {model_name} failed with error: {last_error}")
                continue

        if response is None:
            return JsonResponse({"error": f"All models failed. Last error: {last_error}"}, status=500)

        raw_text = response.text.strip()

        # -----------------------------
        # Clean markdown/code fences
        # -----------------------------
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`")
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()

        # -----------------------------
        # Parse JSON safely
        # -----------------------------
        try:
            reply_json = json.loads(raw_text)
        except json.JSONDecodeError:
            reply_json = {"message": raw_text, "bmi": bmi}

        # -----------------------------
        # Fetch recommended doctors from Supabase
        # -----------------------------
        doctors_list = []
        recommended_specialty = reply_json.get("doctor_recommendation")
        if recommended_specialty:
            try:
                query = supabase.table("doctors") \
                    .select("""
                        *,
                        doctor_specialties!inner(
                            specialties!inner(name)
                        )
                    """) \
                    .ilike("doctor_specialties.specialties.name", f"%{recommended_specialty}%")

                # Add location filter for 2km radius (approximate bounding box)
                if user_lat is not None and user_lng is not None:
                    # Approximate 2km: ~0.018 degrees lat, lng adjusted
                    lat_delta = 0.018
                    lng_delta = 0.018 / math.cos(math.radians(user_lat)) if user_lat != 0 else 0.018
                    query = query \
                        .gte("latitude", user_lat - lat_delta) \
                        .lte("latitude", user_lat + lat_delta) \
                        .gte("longitude", user_lng - lng_delta) \
                        .lte("longitude", user_lng + lng_delta)

                doctors_data = query \
                    .order("experience", desc=True) \
                    .limit(3) \
                    .execute()

                if doctors_data.data:
                    for doc in doctors_data.data:
                        doctors_list.append({
                            "full_name": doc.get("full_name"),
                            "clinic_name": doc.get("clinic_name"),
                            "experience": doc.get("experience"),
                            "phone": doc.get("phone"),
                            "consultation_fee": doc.get("consultation_fee")
                        })
            except Exception as e:
                print(f"Error fetching doctors: {e}")
                doctors_list = []

        # ...after building doctors_list and before returning...
        # reply_json["recommended_doctors"] = doctors_list
        reply_json["recommended_specialization"] = recommended_specialty  # <-- Add this line

        # Insert symptom session record
        try:
            # Fetch patient_id by auth_id (request.user_id)
            patient_resp = supabase.table("patients").select("id").eq("auth_id", request.user_id).maybe_single().execute()
            patient_id = None
            if patient_resp.data and "id" in patient_resp.data:
                patient_id = patient_resp.data["id"]

            if patient_id:
                personal_info = {
                    "age": age,
                    "gender": gender,
                    "height": height,
                    "weight": weight
                }
                location_info = {
                    "location": location,
                    "latitude": user_lat,
                    "longitude": user_lng
                }
                supabase.table("symptom_sessions").insert({
                    "patient_id": patient_id,
                    "started_at": datetime.utcnow().isoformat(),
                    "ended_at": datetime.utcnow().isoformat(),
                    "symptoms": symptoms.split(",") if isinstance(symptoms, str) else symptoms,
                    "personal_info": personal_info,
                    "location": location_info,
                    "analysis_result": reply_json,
                    "recommended_doctors": doctors_list,
                    "created_at": datetime.utcnow().isoformat()
                }).execute()
        except Exception as e:
            print(f"Failed to insert symptom session: {e}")

        return JsonResponse(reply_json, safe=False)
    
    

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# -----------------------------
# Conversation management endpoints
# -----------------------------

# Create or return conversation (optionally pass auth_id)
@api_view(["POST"])
def create_conversation(request):
    auth_id = request.data.get("auth_id")
    metadata = request.data.get("metadata", {})
    # Optionally you could try to find an existing open conversation for auth_id
    convo = Conversation.objects.create(auth_id=auth_id, metadata=metadata)
    return Response(ConversationSerializer(convo).data, status=status.HTTP_201_CREATED)

# Append a message to a conversation (frontend calls for user and also saves ai messages)
@api_view(["POST"])
def append_message(request):
    conv_id = request.data.get("conversation_id")
    role = request.data.get("role")
    text = request.data.get("text")
    meta = request.data.get("meta", {})

    if not conv_id or not role or text is None:
        return Response({"error": "conversation_id, role and text required"},
                        status=status.HTTP_400_BAD_REQUEST)

    conversation = get_object_or_404(Conversation, pk=conv_id)

    # Update stage ONLY if it's a user message
    if role == "user":
        old_stage = conversation.conversation_stage
        new_stage = get_next_stage(old_stage, text)
        conversation.conversation_stage = new_stage
        conversation.save()

    msg = Message.objects.create(
        conversation=conversation, role=role, text=text, meta=meta
    )

    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)

    """
    body: { conversation_id: <uuid>, role: "user"|"ai"|"system", text: "...", meta: {...} }
    """
    conv_id = request.data.get("conversation_id")
    role = request.data.get("role")
    text = request.data.get("text")
    meta = request.data.get("meta", {})

    if not conv_id or not role or text is None:
        return Response({"error": "conversation_id, role and text required"}, status=status.HTTP_400_BAD_REQUEST)

    conversation = get_object_or_404(Conversation, pk=conv_id)
    msg = Message.objects.create(conversation=conversation, role=role, text=text, meta=meta)
    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)

# Get conversation history (with optional limit)
@api_view(["GET"])
def conversation_history(request, convo_id):
    limit = int(request.query_params.get("limit", 100))
    conversation = get_object_or_404(Conversation, pk=convo_id)
    qs = conversation.messages.all().order_by("created_at")[:limit]
    data = MessageSerializer(qs, many=True).data
    return Response({"conversation": conversation.id, "messages": data})

# Helper: load last N messages as plain text for LLM context
def load_recent_messages_for_llm(conversation_id, limit=10):
    conversation = Conversation.objects.get(pk=conversation_id)
    qs = conversation.messages.all().order_by("-created_at")[:limit]  # latest first
    # produce ordered oldest->newest
    msgs = list(reversed(list(qs)))
    # convert to simple list of dicts or string
    history = [{"role": m.role, "text": m.text} for m in msgs]
    return history

# -----------------------------
# Helper endpoint: list available Gemini models
# -----------------------------
@csrf_exempt
def list_available_models(request):
    """Helper endpoint to list available Gemini models"""
    try:
        models = []
        for model in genai.list_models():
            if 'generateContent' in model.supported_generation_methods:
                models.append({
                    'name': model.name,
                    'display_name': model.display_name,
                    'description': model.description
                })
        return JsonResponse({"available_models": models})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
