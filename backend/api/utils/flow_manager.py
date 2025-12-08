def get_next_stage(stage, message):
    message = message.lower()

    if stage == "profile_update":
        if message in ["yes", "ok", "done"]:
            return "symptom_intake"
        return "profile_update"

    if stage == "symptom_intake":
        if any(x in message for x in ["how long", "since when", "burning", "fever", "cold", "pain"]):
            return "symptom_followup"
        return "symptom_intake"

    if stage == "symptom_followup":
        if message in ["yes", "no", "consult doctor", "doctor", "help"]:
            return "doctor_recommend"
        return "symptom_followup"

    if stage == "doctor_recommend":
        return "doctor_recommend"

    return stage


 