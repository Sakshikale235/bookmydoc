# backend/api/agents/symptom_agent.py
from api.utils import flow_manager  # we'll add this
# from .ai.symptom_analyzer import analyze_with_gemini  # your existing analyzer
from api.ai.symptom_analyzer import analyze_symptoms

def handle_message(conversation, message_text, user_info=None):
    """
    Simple rule + LLM hybrid agent.
    Returns dict: { reply, action, next_stage, analysis (optional) }
    """
    stage = conversation.conversation_stage or "symptom_intake"
    # quick rules:
    text = message_text.lower().strip()

    # If user is editing profile:
    if stage == "profile_update":
        # implement your profile edit logic (or delegate to profile agent)
        return {"reply": "Profile updated — continue.", "action": "update_profile", "next_stage": "symptom_intake"}

    # If in symptom intake, call LLM analyzer for initial summary and ask followup:
    if stage == "symptom_intake":
        # run lightweight LLM to parse symptoms & produce initial analysis
        analysis = analyze_with_gemini(symptoms=message_text, age=user_info.get("age"), gender=user_info.get("gender"))
        # do NOT auto-suggest doctors; ask followups first
        reply = f"Based on that, possible conditions: {', '.join(analysis.get('possible_diseases', [])[:3])}. Do you have fever or vomiting?"
        return {"reply": reply, "action": "ask_followup", "next_stage": "symptom_followup", "analysis": analysis}

    if stage == "symptom_followup":
        # use analysis + followup to refine severity
        analysis = analyze_with_gemini(symptoms=message_text, context=[conversation], age=user_info.get("age"))
        # now offer doctor suggestion but only if user confirms
        reply = f"Thanks. Severity: {analysis.get('severity')}. Would you like doctor suggestions? (yes/no)"
        return {"reply": reply, "action": "offer_doctor", "next_stage": "doctor_recommend", "analysis": analysis}

    if stage == "doctor_recommend":
        # if user says 'yes' -> return action to find doctors
        if any(k in text for k in ["yes", "sure", "ok", "please"]):
            return {"reply": "Searching doctors...", "action": "find_doctors", "next_stage": "doctor_recommend"}
        else:
            return {"reply": "Okay — I won't suggest doctors. Anything else?", "action": "none", "next_stage": "end"}

    # default fallback
    return {"reply": "I am sorry, I didn't get that. Can you rephrase?", "action": "none", "next_stage": stage}
