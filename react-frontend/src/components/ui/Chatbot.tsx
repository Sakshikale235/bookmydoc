import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, User, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import MessageList from "./chatbot/MessageList";
import MessageInput from "./chatbot/MessageInput";
import SummaryCard from "./SummaryCard";
import { Message, UserInfo } from "../../types/chatbot";
import { fieldNames } from "./chatbot/intents/steps";
import { validators } from "./chatbot/intents/validators";
import { createConversation, appendMessage, fetchHistory } from "../../lib/chatApi";
// Provide local wrappers so the component can call validateAge/Height/Weight
// without depending on named exports (keeps call sites unchanged).
const validateAge = (v: string) => validators.age(v);
const validateHeight = (v: string) => validators.height(v);
const validateWeight = (v: string) => validators.weight(v);
import { detectEmergency, detectIntent } from "./chatbot/intents/intentDetector";
import { correctSentence } from "./chatbot/intents/keywordCorrection";
import { extractEntities } from "./chatbot/intents/entityDetector";
import { getNextAction, ConversationState } from "./chatbot/intents/steps";

// Simple intent detection based on keywords
type IntentResult = {
  intent: "answer" | "edit" | "doctor_search" | "doctor_detail" | "emergency" | "summary" | "other";
  target?: string;
  value?: string;
};

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function detectSimpleIntent(text: string): IntentResult {
  const t = text.toLowerCase();
  if (/^(change|edit|update)\b/.test(t)) {
    const match = t.match(/\b(age|height|weight|gender|location|blood group)\b/);
    const valueMatch = t.match(/to\s+(.+)$/);
    return { intent: "edit", target: match?.[1], value: valueMatch?.[1]?.trim() };
  }
  if (/\b(show|find|list)\b.*\bdoctor\b/.test(t)) return { intent: "doctor_search" };
  if (/^details?\s+of|show\s+dr|dr\./i.test(t)) return { intent: "doctor_detail" };
  if (/\b(emergency|chest pain|shortness of breath|unconscious)\b/.test(t)) return { intent: "emergency" };
  if (/\b(summary|recap|what.*said|tell.*again)\b/.test(t)) return { intent: "summary" };
  return { intent: "answer" };
}

const Chatbot: React.FC<{}> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdRef = useRef(1);
  const [patientDataFetched, setPatientDataFetched] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [detailsShown, setDetailsShown] = useState(false);

  const [step, setStep] = useState<number | "doctor_suggestion">(-1);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const pushMessage = (msg: Message) =>
    setMessages((prev) => [...prev, msg]);

  const getMessageId = () => (messageIdRef.current++).toString();

  // Conversation state (backend conversation for chat history persistence)
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Push a message locally and also append it to backend conversation when available
  const pushAndSave = async (sender: "ai" | "user", text: string, meta?: any) => {
    const msg: Message = { id: getMessageId(), text, sender, timestamp: new Date(), meta };
    setMessages((prev) => [...prev, msg]);
    if (conversationId) {
      try {
        await appendMessage(conversationId, sender, text, meta || {});
      } catch (e) {
        console.warn("appendMessage failed", e);
      }
    }
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        await pushAndSave("ai", "Hi, I am your health assistant");
        const { data: authData } = await supabase.auth.getUser();
        const authUser = (authData as any)?.user;
        if (!authUser) {
          await pushAndSave("ai", "Hello! Please sign in to use the symptom assistant.");
          setStep(0);
          return authUser;
        }

        const { data: patient } = await supabase
          .from("patients")
          .select("*")
          .eq("auth_id", authUser.id)
          .maybeSingle();
        if (patient) {
          setUserInfo({
            id: patient.id,
            auth_id: patient.auth_id,
            full_name: patient.full_name,
            age: patient.age,
            gender: patient.gender,
            height: patient.height,
            weight: patient.weight,
            blood_group: patient.blood_group,
            address: patient.address,
            location: patient.address,
          });
          setPatientDataFetched(true);
        } else {
          await pushAndSave("ai", "Hello! I can help analyze symptoms. To begin, please tell me your age.");
          setStep(0);
        }
        return authUser;
      } catch (e) {
        await pushAndSave("ai", "Hello! I can help analyze symptoms. To begin, please tell me your age.");
        setStep(0);
        return null;
      }
    };

    const initConversation = async (authUser: any) => {
      try {
        const authId = (authUser as any)?.id ?? null;
        const convo = await createConversation(authId, { source: "chatbot_ui" });
        if (convo && convo.id) {
          setConversationId(convo.id);
          // load history
          const hist = await fetchHistory(convo.id, 200);
          if (hist && hist.messages && hist.messages.length > 0) {
            // Map backend messages into local Message shape and append
            const mapped = hist.messages.map((m: any) => ({
              id: (m.id ?? getMessageId()).toString(),
              text: m.text,
              sender: m.role === "ai" ? "ai" : "user",
              timestamp: m.created_at ? new Date(m.created_at) : new Date(),
              meta: m.meta || {},
            }));
            setMessages((prev) => [...prev, ...mapped]);
          }
        }
      } catch (e) {
        console.warn("conversation create failed", e);
      }
    };

    (async () => {
      const authUser = await fetchPatient();
      await initConversation(authUser);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  const steps = [
    "What is your age?",
    "What is your gender? (male/female/trans)",
    "Height in cm?",
    "Weight in kg?",
    "Your location (city)?",
    "Please describe your symptoms in detail.",
  ];

  const extractName = (text: string) => {
    const patterns = [
      /my name is (\w+)/i,
      /i am (\w+)/i,
      /call me (\w+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleNext = async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    await pushAndSave("user", value);

    // Extract name if provided (only for greeting, don't update profile)
    const extractedName = extractName(value);

    // Check if user is greeting back and we need to show details
    if (patientDataFetched && !detailsShown && (value.toLowerCase().includes("hi") || value.toLowerCase().includes("hello"))) {
      const nameToUse = extractedName || userInfo.full_name || "";
      await pushAndSave(
        "ai",
        `Hello ${nameToUse}! I have your saved details. Are these correct? Reply 'yes' or 'no'.\n\nAge: ${userInfo.age ?? "Not provided"}\nGender: ${userInfo.gender ?? "Not provided"}\nHeight: ${
          userInfo.height ? userInfo.height + " cm" : "Not provided"
        }\nWeight: ${userInfo.weight ? userInfo.weight + " kg" : "Not provided"}\nBlood Group: ${
          userInfo.blood_group ?? "Not provided"
        }\nAddress: ${userInfo.address ?? "Not provided"}`
      );
      setDetailsShown(true);
      setInputText("");
      return;
    }

    // Handle confirmation response after showing details (only if not in update mode)
    if (detailsShown && !dataConfirmed && !updatingField) {
      if (value.toLowerCase() === "yes") {
        setDataConfirmed(true);
        await pushAndSave("ai", "Great! Now, please describe your symptoms in detail.");
        setStep(5);
      } else if (value.toLowerCase() === "no") {
        await pushAndSave("ai", "Which information would you like to update?\n\n1. age\n2. gender\n3. height\n4. weight\n5. blood group\n6. address\n\nPlease enter the number or the field name.");
        setUpdatingField("select_field");
      } else {
        await pushAndSave("ai", "Please reply 'yes' or 'no' to confirm your details.");
      }
      setInputText("");
      return;
    }

    // Handle field selection for update
    if (updatingField === "select_field") {
      const input = value.toLowerCase().trim();
      const numMatch = input.match(/^(\d+)/);
      const key = numMatch ? numMatch[1] : input;
      const fieldMap: { [key: string]: string } = {
        "1": "age",
        "age": "age",
        "2": "gender",
        "gender": "gender",
        "3": "height",
        "height": "height",
        "4": "weight",
        "weight": "weight",
        "5": "blood group",
        "blood group": "blood group",
        "6": "address",
        "address": "address",
      };
      let selectedField = fieldMap[key];
      if (!selectedField && !numMatch) {
        // Fuzzy matching for field names
        const fields = ["age", "gender", "height", "weight", "blood group", "address"];
        let minDistance = Infinity;
        let bestMatch = "";
        for (const field of fields) {
          const distance = levenshtein(input, field);
          if (distance < minDistance) {
            minDistance = distance;
            bestMatch = field;
          }
        }
        if (minDistance <= 2) { // Allow up to 2 edits
          selectedField = bestMatch;
        }
      }
      if (selectedField) {
        setUpdatingField(selectedField);
        await pushAndSave("ai", `Please provide your new ${selectedField}.`);
      } else {
        await pushAndSave("ai", "Please specify a valid field: age, gender, height, weight, blood group, or address.");
      }
      setInputText("");
      return;
    }

    // Handle field updates if we're in update mode
    if (updatingField) {
      await handleFieldUpdate(updatingField, value);
      setUpdatingField(null);
      setInputText("");
      return;
    }

    // Process through the sequential flow
    const correctedText = correctSentence(value);
    const entities = extractEntities(correctedText);
    const intent = detectIntent(correctedText, entities);

    const currentState: ConversationState = {
      step: step as any,
      userInfo,
      intent,
      entities,
      lastMessage: value,
    };

    const action = getNextAction(currentState, value, intent, entities);

    // Handle the action
    switch (action.type) {
      case "message":
        if (action.message) {
          await pushAndSave("ai", action.message);
        }
        if (action.nextStep) {
          setStep(action.nextStep as any);
        }
        break;
      case "ask_question":
        if (action.message) {
          await pushAndSave("ai", action.message);
        }
        if (action.nextStep) {
          setStep(action.nextStep as any);
        }
        if (action.fieldToUpdate) {
          setUpdatingField(action.fieldToUpdate);
        }
        break;
      case "analyze_symptoms":
        if (action.message) {
          await pushAndSave("ai", action.message);
        }
        await sendToBackend({ ...userInfo, symptoms: value });
        break;
      case "error":
        if (action.message) {
          await pushAndSave("ai", action.message);
        }
        break;
      case "update_state":
        if (action.nextStep) {
          setStep(action.nextStep as any);
        }
        break;
    }

    setInputText("");
  };

  const handleFieldUpdate = async (field: string, value: string) => {
    let updateData: Partial<UserInfo> = {};
    let isValid = true;
    let errorMsg = "";

    switch (field) {
      case "age":
        if (!validators.age(value)) {
          isValid = false;
          errorMsg = "Age must be between 1 and 119";
        } else {
          updateData.age = parseInt(value);
        }
        break;
      case "gender":
        if (!validators.gender(value)) {
          isValid = false;
          errorMsg = "Gender must be male, female, or trans";
        } else {
          updateData.gender = value;
        }
        break;
      case "height":
        if (!validators.height(value)) {
          isValid = false;
          errorMsg = "Height must be between 30 and 300 cm";
        } else {
          updateData.height = parseFloat(value);
        }
        break;
      case "weight":
        if (!validators.weight(value)) {
          isValid = false;
          errorMsg = "Weight must be between 2 and 600 kg";
        } else {
          updateData.weight = parseFloat(value);
        }
        break;
      case "blood_group":
        if (!validators.blood_group(value)) {
          isValid = false;
          errorMsg = "Invalid blood group";
        } else {
          updateData.blood_group = value;
        }
        break;
      case "address":
        if (!validators.address(value)) {
          isValid = false;
          errorMsg = "Please enter a valid address";
        } else {
          updateData.address = value;
          updateData.location = value;
        }
        break;
    }

    if (!isValid) {
      await pushAndSave("ai", `❌ ${errorMsg}. Please try again.`);
      return;
    }

    // Update local state
    setUserInfo(prev => ({ ...prev, ...updateData }));

    // Update database if user is logged in
    if (userInfo.id) {
      try {
        const { error } = await supabase.from("patients").update(updateData).eq("id", userInfo.id);
        if (error) throw error;
        await pushAndSave("ai", `✅ Your ${field} has been updated successfully.`);
      } catch (e) {
        await pushAndSave("ai", "❌ Failed to update your information. Please try again.");
      }
    } else {
      await pushAndSave("ai", `✅ Your ${field} has been updated locally.`);
    }
  };

  const sendToBackend = async (data: UserInfo) => {
    setIsTyping(true);
    pushMessage({
      id: "ai-typing",
      text: "Analyzing your symptoms and finding suitable doctors...",
      sender: "ai",
      timestamp: new Date(),
    });

    try {
      const formattedData = {
        height: data.height,
        weight: data.weight,
        age: data.age,
        gender: data.gender,
        location: data.location,
        address: data.address,
        symptoms: data.symptoms,
        conversation_id: conversationId,
        // include session_id for backend session tracking (some backends expect this key)
        session_id: conversationId,
        // include the user message text for LLM context
        message: data.symptoms,
        latitude: userInfo.latitude,
        longitude: userInfo.longitude,
        date: new Date().toISOString()
      };

      const res = await fetch("http://localhost:8000/api/analyze-symptoms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await res.json();

      setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));

      if (!res.ok) {
        throw new Error(result.error || 'Server error');
      }

      let parsedResult = result;
      if (typeof result === 'string') {
        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          parsedResult = { message: result };
        }
      }

      setLastAnalysisResult(parsedResult);

      let formattedText = "";
      if (parsedResult.possible_diseases) {
        formattedText += "🧾 **Based on your symptoms, location, and the current season, here's my analysis:**\n\n";
        formattedText += `• **Possible Conditions:** ${parsedResult.possible_diseases.join(", ")}\n\n`;
        formattedText += `⚠️ **Severity:** ${parsedResult.severity || "Not available"}\n\n`;
        formattedText += `💡 **Advice:** ${parsedResult.advice || "No specific advice available"}\n\n`;

        await pushAndSave("ai", formattedText, { analysis: parsedResult });

        if (parsedResult.recommended_doctors && parsedResult.recommended_doctors.length > 0) {
          let doctorText = "👨‍⚕️ **Recommended doctors for you:**\n\n";
          parsedResult.recommended_doctors.forEach((doc: any) => {
            doctorText += `• **Dr. ${doc.full_name}**\n`;
            if (doc.clinic_name) doctorText += `  🏥 ${doc.clinic_name}\n`;
            if (doc.experience) doctorText += `  📚 ${doc.experience} years of experience\n`;
            if (doc.consultation_fee) doctorText += `  💰 Fee: ₹${doc.consultation_fee}\n`;
            if (doc.phone) doctorText += `  📞 ${doc.phone}\n\n`;
          });

          await pushAndSave("ai", doctorText, { doctors: parsedResult.recommended_doctors });
        } else {
          setTimeout(() => {
            const promptMsg = {
              id: getMessageId(),
              text: "Would you like me to suggest some doctors nearby? (yes/no)",
              sender: "ai",
              timestamp: new Date(),
            } as Message;
            // keep special id behaviour for UI buttons
            setMessages((prev) => [...prev, { ...promptMsg, id: "ai-doctor-prompt" }]);
            if (conversationId) {
              appendMessage(conversationId, "ai", promptMsg.text, {}).catch((e) => console.warn("appendMessage failed", e));
            }
            setStep("doctor_suggestion");
          }, 1000);
        }
      }

    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));
      await pushAndSave("ai", `❌ ${err instanceof Error ? err.message : "Network error or server not responding."}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEditIntent = async (target: string, value: string) => {
    if (!userInfo.id) {
      pushMessage({
        id: getMessageId(),
        text: "I need to know your information first. Please start by saying 'Hi' or 'Hello'.",
        sender: "ai",
        timestamp: new Date(),
      });
      return;
    }

    let updateData: Partial<UserInfo> = {};

    switch (target) {
      case "age":
        if (!validateAge(value)) {
          pushMessage({
            id: getMessageId(),
            text: "That doesn't look like a valid age. Please enter a number between 1 and 100.",
            sender: "ai",
            timestamp: new Date(),
          });
          return;
        }
        updateData.age = parseInt(value);
        break;
      case "gender":
        if (!["male", "female", "trans"].includes(value.toLowerCase())) {
          pushMessage({
            id: getMessageId(),
            text: "That doesn't look like a valid gender. Please enter male, female, or trans.",
            sender: "ai",
            timestamp: new Date(),
          });
          return;
        }
        updateData.gender = value;
        break;
      case "height":
        if (!validateHeight(value)) {
          pushMessage({
            id: getMessageId(),
            text: "That doesn't look like a valid height. Please enter a number in cm between 30 and 300.",
            sender: "ai",
            timestamp: new Date(),
          });
          return;
        }
        updateData.height = parseFloat(value);
        break;
      case "weight":
        if (!validateWeight(value)) {
          pushMessage({
            id: getMessageId(),
            text: "That doesn't look like a valid weight. Please enter a number in kg between 2 and 600.",
            sender: "ai",
            timestamp: new Date(),
          });
          return;
        }
        updateData.weight = parseFloat(value);
        break;
      case "location":
        updateData.location = value;
        updateData.address = value;
        break;
      case "blood group":
        const validBloodGroups = ["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"];
        if (!validBloodGroups.includes(value.toLowerCase())) {
          pushMessage({
            id: getMessageId(),
            text: "That doesn't look like a valid blood group. Please enter one of: A+, A-, B+, B-, AB+, AB-, O+, O-.",
            sender: "ai",
            timestamp: new Date(),
          });
          return;
        }
        updateData.blood_group = value;
        break;
      default:
        pushMessage({
          id: getMessageId(),
          text: "I can help you update: age, height, weight, gender, blood group, or location. Please specify which one you'd like to change.",
          sender: "ai",
          timestamp: new Date(),
        });
        return;
    }

    try {
      const { error } = await supabase.from("patients").update(updateData).eq("id", userInfo.id);
      if (error) throw error;
      setUserInfo((prev) => ({ ...prev, ...updateData }));
      pushMessage({
        id: getMessageId(),
        text: `✅ Your ${target} has been updated to ${value}.`,
        sender: "ai",
        timestamp: new Date(),
      });
    } catch (error) {
      pushMessage({
        id: getMessageId(),
        text: "There was an error updating your information. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      });
    }
  };

  const handleDoctorSearchIntent = () => {
    const specialization =
      lastAnalysisResult?.recommended_specialization ||
      lastAnalysisResult?.specialization ||
      "General Physician";
    navigate(`/doctor_consultation?specialization=${encodeURIComponent(specialization)}`);
  };

  const handleDoctorDetailIntent = (text: string) => {
    const doctorMatch = text.match(/(?:dr\.?\s*|doctor\s+)(.+)/i);
    if (doctorMatch) {
      const doctorName = doctorMatch[1].trim();
      pushMessage({
        id: getMessageId(),
        text: `I'll help you find details about Dr. ${doctorName}. Let me search for them.`,
        sender: "ai",
        timestamp: new Date(),
      });
      navigate(`/doctor_consultation?search=${encodeURIComponent(doctorName)}`);
    } else {
      pushMessage({
        id: getMessageId(),
        text: "Please specify the doctor's name you'd like details for (e.g., 'show Dr. Smith').",
        sender: "ai",
        timestamp: new Date(),
      });
    }
  };

  const handleEmergencyIntent = () => {
    pushMessage({
      id: getMessageId(),
      text: "🚨 **EMERGENCY ALERT!**\n\nThis appears to be a medical emergency. Please:\n\n1. **Call emergency services immediately** (911 or local emergency number)\n2. Stay calm and follow their instructions\n3. If possible, provide your location\n\n**Do not wait - seek immediate medical attention!**\n\nIf this is not an emergency, please describe your symptoms normally.",
      sender: "ai",
      timestamp: new Date(),
    });
  };

  const handleSummaryIntent = () => {
    let summaryText = "📋 **Conversation Summary:**\n\n";

    // User info summary
    summaryText += "**Your Information:**\n";
    summaryText += `• Age: ${userInfo.age || "Not provided"}\n`;
    summaryText += `• Gender: ${userInfo.gender || "Not provided"}\n`;
    summaryText += `• Height: ${userInfo.height ? userInfo.height + " cm" : "Not provided"}\n`;
    summaryText += `• Weight: ${userInfo.weight ? userInfo.weight + " kg" : "Not provided"}\n`;
    summaryText += `• Location: ${userInfo.location || "Not provided"}\n\n`;

    // Last analysis summary
    if (lastAnalysisResult) {
      summaryText += "**Last Symptom Analysis:**\n";
      if (lastAnalysisResult.possible_diseases) {
        summaryText += `• Possible Conditions: ${lastAnalysisResult.possible_diseases.join(", ")}\n`;
      }
      if (lastAnalysisResult.severity) {
        summaryText += `• Severity: ${lastAnalysisResult.severity}\n`;
      }
      if (lastAnalysisResult.advice) {
        summaryText += `• Advice: ${lastAnalysisResult.advice}\n`;
      }
      if (lastAnalysisResult.recommended_doctors && lastAnalysisResult.recommended_doctors.length > 0) {
        summaryText += `• Recommended Doctors: ${lastAnalysisResult.recommended_doctors.length} found\n`;
      }
    } else {
      summaryText += "No symptom analysis performed yet.\n";
    }

    pushMessage({
      id: getMessageId(),
      text: summaryText,
      sender: "ai",
      timestamp: new Date(),
    });
  };

const handleNearbyDoctors = () => {
  let specialization =
    lastAnalysisResult?.recommended_specialization ||
    lastAnalysisResult?.specialization ||
    "General Physician";

  // Keep only the first specialization segment before any comma, "and", or parentheses
  if (specialization.includes("(")) {
    specialization = specialization.split("(")[0].trim();
  }
  if (specialization.includes(" and ")) {
    specialization = specialization.split(" and ")[0].trim();
  }
  if (specialization.includes(",")) {
    specialization = specialization.split(",")[0].trim();
  }

  navigate(`/doctor_consultation?specialization=${encodeURIComponent(specialization)}`);
};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext(inputText);
    }
  };

  return (
    <div className="h-screen bg-gray-190 flex items-center justify-center p-6 m-(-5)">
      <div className="w-full max-w-5xl bg-blue-100 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-blue-gradient max-h-96"
        >
          <MessageList messages={messages} step={step} handleNext={handleNext} />
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="bg-white rounded-full p-2 flex-shrink-0">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div className="bg-white text-gray-800 shadow-md px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-300 p-4 flex space-x-3 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer or press Enter..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={() => handleNext(inputText)}
            disabled={isTyping}
            className="bg-blue-gradient text-white p-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;