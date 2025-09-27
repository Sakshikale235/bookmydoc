from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime

# Load API key
load_dotenv()
GEN_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEN_API_KEY)

@csrf_exempt
def analyze_symptoms(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=405)

    try:
        data = json.loads(request.body)

        # Optional user details
        height = data.get("height", "Not provided")
        weight = data.get("weight", "Not provided")
        age = data.get("age", "Not provided")
        gender = data.get("gender", "Not provided")
        symptoms = data.get("symptoms", "")
        location = data.get("location", "Not provided")

        if not symptoms:
            return JsonResponse({"error": "Please provide your symptoms"}, status=400)

        # Calculate BMI
        bmi = None
        if height != "Not provided" and weight != "Not provided":
            try:
                h_m = float(height) / 100
                w_kg = float(weight)
                bmi = round(w_kg / (h_m ** 2), 1)
            except:
                bmi = None

        # Current date
        today = datetime.today()
        date_str = today.strftime("%Y-%m-%d")
        month = today.month

        # Gemini prompt
        prompt = f"""
Hello! I am your AI health assistant. I am here to assist you.
Here is the information provided:
- Height: {height}
- Weight: {weight}
- Age: {age}
- Gender: {gender}
- BMI: {bmi if bmi else 'Not calculated'}
- Location: {location}
- Date: {date_str} (month: {month})

Please analyze the following symptoms: {symptoms}

Respond ONLY with valid JSON, no markdown or code fences.
Format strictly like this:
{{
    "possible_diseases": ["Disease 1", "Disease 2"],
    "severity": "mild / moderate / severe",
    "doctor_recommendation": "General doctor or Specialist",
    "advice": "Advice text",
    "bmi": {bmi if bmi else 'null'}
}}
"""

        # Call Gemini API - Try multiple model names
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
                break  # Success, exit the loop
            except Exception as e:
                last_error = str(e)
                continue  # Try next model
        
        if response is None:
            return JsonResponse({
                "error": f"All model attempts failed. Last error: {last_error}"
            }, status=500)

        raw_text = response.text.strip()

        # Remove possible markdown fences
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`")
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()

        # Try parsing JSON
        try:
            reply_json = json.loads(raw_text)
        except json.JSONDecodeError:
            reply_json = {"message": raw_text, "bmi": bmi}

        return JsonResponse(reply_json, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# Alternative version with model listing (for debugging)
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




# from django.shortcuts import render

# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json
# import os
# import google.generativeai as genai
# from dotenv import load_dotenv
# from datetime import datetime

# # Load API key from .env
# load_dotenv()
# GEN_API_KEY = os.getenv("GEMINI_API_KEY")
# genai.configure(api_key=GEN_API_KEY)

# @csrf_exempt
# def analyze_symptoms(request):
#     if request.method != "POST":
#         return JsonResponse({"error": "Only POST requests allowed"}, status=405)

#     try:
#         data = json.loads(request.body)

#         # Optional user details
#         height = data.get("height", "Not provided")
#         weight = data.get("weight", "Not provided")
#         age = data.get("age", "Not provided")
#         gender = data.get("gender", "Not provided")
#         symptoms = data.get("symptoms", "")
#         location = data.get("location", "Not provided")  # city or lat,lng

#         if not symptoms:
#             return JsonResponse({"error": "Please provide your symptoms"}, status=400)

#         # Calculate BMI
#         bmi = None
#         if height != "Not provided" and weight != "Not provided":
#             try:
#                 h_m = float(height) / 100
#                 w_kg = float(weight)
#                 bmi = round(w_kg / (h_m ** 2), 1)
#             except:
#                 bmi = None

#         # Current date and month
#         today = datetime.today()
#         date_str = today.strftime("%Y-%m-%d")
#         month = today.month

#         # Gemini prompt with severity handling
#         prompt = f"""
# Hello! I am your AI health assistant. I am here to assist you.
# Here is the information provided:
# - Height: {height}
# - Weight: {weight}
# - Age: {age}
# - Gender: {gender}
# - BMI: {bmi if bmi else 'Not calculated'}
# - Location: {location}
# - Date: {date_str} (month: {month})

# Please analyze the following symptoms: {symptoms}

# 1. Identify possible diseases/health issues.
# 2. Assess symptom severity (mild, moderate, severe).
# 3. Recommend the appropriate doctor:
#    - If mild: local/general doctor
#    - If severe: mention specialist required
# 4. Give advice for mild cases (if self-care or local consultation is enough)

# Respond in JSON format exactly like this:
# {{
#     "possible_diseases": ["Disease 1", "Disease 2", ...],
#     "severity": "mild / moderate / severe",
#     "doctor_recommendation": "General doctor or Specialist",
#     "advice": "Any specific advice for mild cases",
#     "bmi": {bmi if bmi else 'null'}
# }}
# """

#         # Call Gemini API
#         model = genai.GenerativeModel("gemini-1.5-flash")
#         response = model.generate_content(prompt)

#         # Try parsing JSON from Gemini response
#         try:
#             reply_json = json.loads(response.text)
#         except:
#             # fallback if Gemini returns plain text
#             reply_json = {"message": response.text, "bmi": bmi}

#         return JsonResponse(reply_json)

#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)




# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json
# import os
# import google.generativeai as genai
# from dotenv import load_dotenv

# # Load API key from .env
# load_dotenv()
# GEN_API_KEY = os.getenv("GEMINI_API_KEY")
# genai.configure(api_key=GEN_API_KEY)

# @csrf_exempt
# def analyze_symptoms(request):
#     if request.method != "POST":
#         return JsonResponse({"error": "Only POST requests allowed"}, status=405)

#     try:
#         print("Request body:", request.body)
#         data = json.loads(request.body)
#         # Optional user details
#         height = data.get("height", "Not provided")
#         weight = data.get("weight", "Not provided")
#         age = data.get("age", "Not provided")
#         gender = data.get("gender", "Not provided")
#         symptoms = data.get("symptoms", "")

#         if not symptoms:
#             return JsonResponse({"error": "Please provide your symptoms"}, status=400)

#         # Build dynamic Gemini prompt
#         prompt = f"""
# Hello! I am your AI health assistant. I am here to assist you.
# Before analyzing your symptoms, here is the information you provided:
# - Height: {height}
# - Weight: {weight}
# - Age: {age}
# - Gender: {gender}

# Now, please analyze the following symptoms: {symptoms} and calculate the BMI if height and weight are provided.

# 1. Possible Diseases/Health Issues
# - Disease 1
# - Disease 2
# ...

# 2. Doctor Recommendation
# - General doctor or Specialist (if applicable)
# Be as brief and clear as possible.
# Please respond in a clear, user-friendly format.
# """

#         # Call Gemini API
#         model = genai.GenerativeModel("gemini-1.5-flash")
#         response = model.generate_content(prompt)

#         return JsonResponse({"reply": response.text})

#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)

