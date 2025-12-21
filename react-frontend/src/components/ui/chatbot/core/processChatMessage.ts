// processChatMessage.ts

import { normalizeInput } from "../intents/normalization/normalizer";
import { extractEntities } from "../intents/entityDetector";
import { detectIntent } from "../intents/intentDetector";

import { buildMedicalContext } from "../medical/medicalContext";
import { evaluateDiseaseRisk } from "../medical/diseaseRiskEvaluator";
import { recommendSpecialist } from "../medical/specialistRecommender";

import { ConversationContext } from "../csm/context";
import { ConversationState } from "../csm/states";
import { handleConversation } from "../csm/handler";
import {
  parseAge,
  parseGender,
  parseHeight,
  parseWeight,
  parseLocation
} from "../csm/inputParsers";

import { validators, normalizeGender } from "../intents/validators";

/**
 * PURE CHAT PROCESSOR
 */
export function processChatMessage(

    userMessage: string,
    prevContext: ConversationContext
): {
    reply: string;
    context: ConversationContext;
    backendRequest?: { endpoint: string; data: any };
} {
    // -----------------------------
    // 1. NORMALIZATION
    // -----------------------------
    console.log("🧠 processChatMessage CALLED with:", userMessage);

    const normalized = normalizeInput(userMessage);
    console.log("🔄 NORMALIZED:", normalized);

    // -----------------------------
    // 2. ENTITY EXTRACTION
    // -----------------------------
    const entities = extractEntities(normalized.cleanedText);
    console.log("🔍 ENTITIES:", entities);

    // -----------------------------
    // 3. INTENT DETECTION
    // -----------------------------
    const intent = detectIntent(normalized, entities);
    console.log("🎯 DETECTED INTENT:", intent);


    // =====================================================
    // 🔴 INTENT-FIRST HANDLING (CRITICAL FIX)
    // =====================================================

    // -----------------------------
    // SYMPTOM INTENT (HIGHEST PRIORITY)
    // -----------------------------
    if (intent.type === "report_symptom") {
        const p = prevContext.patientProfile;

        const newContext: ConversationContext = {
            ...prevContext,
            collected: {
                age: p?.age,
                gender: p?.gender,
                height: p?.height,
                weight: p?.weight,
                location: p?.address,
                symptoms: [
                    ...(prevContext.collected.symptoms ?? []),
                    normalized.normalizedText
                ]
            },
            state: ConversationState.CONFIRM_PROFILE
        };

        const profileText =
            `Here are your details:\n` +
            `Age: ${p?.age ?? "Not provided"}\n` +
            `Gender: ${p?.gender ?? "Not provided"}\n` +
            `Height: ${p?.height ?? "Not provided"}\n` +
            `Weight: ${p?.weight ?? "Not provided"}\n` +
            `Location: ${p?.address ?? "Not provided"}\n\n` +
            `Are these correct? (yes / no)`;

        // Create session for first symptom
        const sessionData = {
            symptoms: newContext.collected.symptoms ?? [],
            age: newContext.collected.age,
            gender: newContext.collected.gender,
            height: newContext.collected.height,
            weight: newContext.collected.weight,
            location: newContext.collected.location
        };

        return {
            reply:
                "Okay, I’ve noted your symptom.\nFor better analysis, please confirm your profile details.\n\n" +
                profileText,
            context: newContext,
            backendRequest: {
                endpoint: "/create-symptom-session/",
                data: sessionData
            }
        };
    }

    // -----------------------------
    // GREETING INTENT
    // -----------------------------
    if (intent.type === "greeting") {
        console.log("👋 GREETING RETURN EXECUTED");

        return {
            reply: "Hi 😊 How can I help you today?",
            context: prevContext
        };
    }

    // -----------------------------
    // THANKS INTENT
    // -----------------------------
    if (intent.type === "thanks") {
        console.log("🙏 THANKS RETURN EXECUTED");

        return {
            reply: "You're welcome! Feel free to ask if you need anything else.",
            context: prevContext
        };
    }

    // =====================================================
    // NOW LET CSM HANDLE STRUCTURED FLOW
    // =====================================================
    const updatedContext = handleConversation(
        prevContext,
        intent,
        normalized.rawText
    );

    let reply = "";

    // YES / NO handling for profile confirmation
    if (
        prevContext.state === ConversationState.CONFIRM_PROFILE &&
        intent.type === "no"
    ) {
        return {
            reply:
                "Okay. Which field is incorrect?\n(age / gender / height / weight / location)",
            context: {
                ...prevContext,
                state: ConversationState.UPDATE_PROFILE_FIELD
            }
        };
    }

    if (
        prevContext.state === ConversationState.CONFIRM_PROFILE &&
        intent.type === "yes"
    ) {
        const payload = {
            symptoms: (prevContext.collected.symptoms ?? []).join(", "),
            age: prevContext.collected.age,
            gender: prevContext.collected.gender,
            height: prevContext.collected.height,
            weight: prevContext.collected.weight,
            location: prevContext.collected.location
        };

        return {
            reply: "Great. I’ll proceed with the analysis.",
            context: {
                ...prevContext,
                state: ConversationState.MEDICAL_CONTEXT_ANALYSIS
            },
            backendRequest: {
                endpoint: "/analyze-symptoms/",
                data: payload
            }
        };
    }

    // Handle UPDATE_PROFILE_FIELD: user selects which field to update
    if (prevContext.state === ConversationState.UPDATE_PROFILE_FIELD) {
        const input = normalized.rawText.toLowerCase().trim();

        // More flexible field matching - check if input contains field name
        if (input.includes("age")) {
            return {
                reply: "Please enter your new age.",
                context: {
                    ...prevContext,
                    state: ConversationState.ASK_NEW_FIELD_VALUE,
                    fieldToUpdate: "age"
                }
            };
        } else if (input.includes("gend") || input.includes("sex")) {
            return {
                reply: "Please enter your new gender (male / female / trans).",
                context: {
                    ...prevContext,
                    state: ConversationState.ASK_NEW_FIELD_VALUE,
                    fieldToUpdate: "gender"
                }
            };
        } else if (input.includes("height") || input.includes("tall")) {
            return {
                reply: "Please enter your new height in cm.",
                context: {
                    ...prevContext,
                    state: ConversationState.ASK_NEW_FIELD_VALUE,
                    fieldToUpdate: "height"
                }
            };
        } else if (input.includes("weight") || input.includes("kg")) {
            return {
                reply: "Please enter your new weight in kg.",
                context: {
                    ...prevContext,
                    state: ConversationState.ASK_NEW_FIELD_VALUE,
                    fieldToUpdate: "weight"
                }
            };
        } else if (input.includes("location") || input.includes("city") || input.includes("place")) {
            return {
                reply: "Please enter your new location.",
                context: {
                    ...prevContext,
                    state: ConversationState.ASK_NEW_FIELD_VALUE,
                    fieldToUpdate: "location"
                }
            };
        } else {
            return {
                reply: "Please choose a valid field: age, gender, height, weight, or location.",
                context: prevContext
            };
        }
    }

    // Handle ASK_NEW_FIELD_VALUE: user provides new value for selected field
    if (prevContext.state === ConversationState.ASK_NEW_FIELD_VALUE) {
        // Allow user to cancel the update by saying "no"
        if (intent.type === "no") {
            return {
                reply: "Okay, let's keep your current profile details.\n\n" +
                       "Here are your details:\n" +
                       `Age: ${prevContext.collected.age ?? "Not provided"}\n` +
                       `Gender: ${prevContext.collected.gender ?? "Not provided"}\n` +
                       `Height: ${prevContext.collected.height ?? "Not provided"}\n` +
                       `Weight: ${prevContext.collected.weight ?? "Not provided"}\n` +
                       `Location: ${prevContext.collected.location ?? "Not provided"}\n\n` +
                       `Are these correct? (yes / no)`,
                context: {
                    ...prevContext,
                    state: ConversationState.CONFIRM_PROFILE,
                    fieldToUpdate: undefined
                }
            };
        }

        const field = prevContext.fieldToUpdate;
        let newValue: any = null;
        let isValid = false;

        switch (field) {
            case "age":
                newValue = parseAge(normalized.rawText);
                isValid = newValue !== null;
                break;
            case "gender":
                newValue = normalizeGender(normalized.rawText);
                isValid = newValue !== null;
                break;
            case "height":
                newValue = parseHeight(normalized.rawText);
                isValid = newValue !== null;
                break;
            case "weight":
                newValue = parseWeight(normalized.rawText);
                isValid = newValue !== null;
                break;
            case "location":
                newValue = parseLocation(normalized.rawText);
                isValid = newValue !== null;
                break;
        }

        if (!isValid) {
            return {
                reply: `Please provide a valid ${field}.`,
                context: prevContext
            };
        }

        // Update the collected data
        const updatedContext = {
            ...prevContext,
            collected: {
                ...prevContext.collected,
                [field]: newValue
            },
            state: ConversationState.CONFIRM_PROFILE,
            fieldToUpdate: undefined
        };

        // Show updated profile for confirmation
        const p = updatedContext.collected;
        const profileText =
            `Here are your updated details:\n` +
            `Age: ${p.age ?? "Not provided"}\n` +
            `Gender: ${p.gender ?? "Not provided"}\n` +
            `Height: ${p.height ?? "Not provided"}\n` +
            `Weight: ${p.weight ?? "Not provided"}\n` +
            `Location: ${p.location ?? "Not provided"}\n\n` +
            `Are these correct? (yes / no)`;

        return {
            reply: profileText,
            context: updatedContext
        };
    }


    switch (updatedContext.state) {

        case ConversationState.CONFIRM_PROFILE: {
            const p = updatedContext.collected;

            reply =
                "Okay, I’ve noted your symptom.\n\n" +
                "Here are your details:\n\n" +
                `• Age: ${p?.age ?? "Not provided"}\n` +
                `• Gender: ${p?.gender ?? "Not provided"}\n` +
                `• Height: ${p?.height ?? "Not provided"} cm\n` +
                `• Weight: ${p?.weight ?? "Not provided"} kg\n` +
                `• Location: ${p?.location ?? "Not provided"}\n\n` +
                "Are these correct? (yes / no)";

        }

        case ConversationState.ASK_AGE: {
            if (!validators.age(normalized.rawText)) {
                reply = "Please enter a valid age (1–119).";
                break;
            }
            updatedContext.collected.age = parseInt(normalized.rawText);
            updatedContext.state = ConversationState.ASK_GENDER;
            reply = "Got it. Please tell me your gender.";
            break;
        }

        case ConversationState.ASK_GENDER: {
            const gender = normalizeGender(normalized.rawText);
            if (!validators.gender(gender)) {
                reply = "Please enter a valid gender (male / female / trans).";
                break;
            }
            updatedContext.collected.gender = gender!;
            updatedContext.state = ConversationState.ASK_HEIGHT;
            reply = "What is your height in cm?";
            break;
        }

        case ConversationState.ASK_HEIGHT: {
            if (!validators.height(normalized.rawText)) {
                reply = "Please enter a valid height in cm (30–300).";
                break;
            }
            updatedContext.collected.height = parseFloat(normalized.rawText);
            updatedContext.state = ConversationState.ASK_WEIGHT;
            reply = "What is your weight in kg?";
            break;
        }

        case ConversationState.ASK_WEIGHT: {
            if (!validators.weight(normalized.rawText)) {
                reply = "Please enter a valid weight in kg (2–600).";
                break;
            }
            updatedContext.collected.weight = parseFloat(normalized.rawText);
            updatedContext.state = ConversationState.ASK_LOCATION;
            reply = "Which city do you live in?";
            break;
        }

        case ConversationState.ASK_LOCATION: {
            if (!validators.location(normalized.rawText)) {
                reply = "Please enter a valid city or location.";
                break;
            }
            updatedContext.collected.location = normalized.rawText;
            updatedContext.state = ConversationState.MEDICAL_CONTEXT_ANALYSIS;
            reply = "Thanks. I’m analyzing your details now.";
            break;
        }

        case ConversationState.MEDICAL_CONTEXT_ANALYSIS: {
            const payload = {
                symptoms: (updatedContext.collected.symptoms ?? []).join(", "),
                age: updatedContext.collected.age,
                gender: updatedContext.collected.gender,
                height: updatedContext.collected.height,
                weight: updatedContext.collected.weight,
                location: updatedContext.collected.location
            };

            return {
                reply: "Thanks. I’m sending your details for analysis.",
                context: updatedContext,
                backendRequest: {
                    endpoint: "/analyze-symptoms/",
                    data: payload
                }
            };
        }
    }

    // -----------------------------
    // FALLBACK FOR UNKNOWN MESSAGES
    // -----------------------------
    if (!reply || reply.trim() === "") {
        if (intent.type === "other") {
            reply = "I'm sorry, I didn't understand that. I can help you with:\n\n" +
                   "• Reporting symptoms (fever, cough, headache, etc.)\n" +
                   "• Updating your profile (age, gender, height, weight)\n" +
                   "• Booking appointments with specialists\n\n" +
                   "Please try rephrasing your message.";
        } else {
            reply = "I'm here to help! Please tell me about your symptoms or ask about booking an appointment.";
        }
    }

    console.log("📦 FINAL RETURN, reply =", reply);

    return {
        reply,
        context: updatedContext
    };
}
