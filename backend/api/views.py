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

        prompt = f"""
Hello! I am your AI health assistant.
Height: {height}, Weight: {weight}, Age: {age}, Gender: {gender}, BMI: {bmi if bmi else 'null'}, Location: {location}, Date: {date_str} (month: {month})
Symptoms: {symptoms}
Respond ONLY with valid JSON like:
{{"possible_diseases": ["Disease1"], "severity": "mild/moderate/severe", "doctor_recommendation": "Specialization", "advice": "Advice text", "bmi": {bmi if bmi else 'null'}}}
"""

        # -----------------------------
        # Call Gemini API (try multiple models)
        # -----------------------------
        model_names = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro-latest",
            "gemini-1.5-pro"
        ]
        response = None
        last_error = None
        for model_name in model_names:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                break
            except Exception as e:
                last_error = str(e)
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
        return JsonResponse(reply_json, safe=False)
    
    

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

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
