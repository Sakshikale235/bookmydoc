import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, User, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import MessageList from "./chatbot/MessageList";
import MessageInput from "./chatbot/MessageInput";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

type UserInfo = {
  id?: string;
  auth_id?: string;
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  location?: string | null;
  address?: string | null;
  symptoms?: string;
  blood_group?: string | null;
  full_name?: string;
  latitude?: number | null;
  longitude?: number | null;
};

// Validation functions
const validateAge = (v: string) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 120;
};
const validateHeight = (v: string) => {
  const n = Number(v);
  return !Number.isNaN(n) && n > 30 && n < 300;
};
const validateWeight = (v: string) => {
  const n = Number(v);
  return !Number.isNaN(n) && n > 2 && n < 600;
};

// Simple intent detection based on keywords
type IntentResult = {
  intent: "answer" | "edit" | "doctor_search" | "doctor_detail" | "emergency" | "summary" | "other";
  target?: string;
  value?: string;
};

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

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = (authData as any)?.user;
        if (!authUser) {
          pushMessage({
            id: getMessageId(),
            text: "Hello! Please sign in to use the symptom assistant.",
            sender: "ai",
            timestamp: new Date(),
          });
          setStep(0);
          return;
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
          pushMessage({
            id: getMessageId(),
            text: `Hello ${patient.full_name || ""}! I have your saved details. Are these correct? Reply 'yes' or 'no'.\n\nAge: ${patient.age ?? "Not provided"}\nGender: ${patient.gender ?? "Not provided"}\nHeight: ${
              patient.height ? patient.height + " cm" : "Not provided"
            }\nWeight: ${patient.weight ? patient.weight + " kg" : "Not provided"}\nBlood Group: ${
              patient.blood_group ?? "Not provided"
            }\nAddress: ${patient.address ?? "Not provided"}`,
            sender: "ai",
            timestamp: new Date(),
          });
        } else {
          pushMessage({
            id: getMessageId(),
            text: "Hello! I can help analyze symptoms. To begin, please tell me your age.",
            sender: "ai",
            timestamp: new Date(),
          });
          setStep(0);
        }
      } catch (e) {
        pushMessage({
          id: getMessageId(),
          text: "Hello! I can help analyze symptoms. To begin, please tell me your age.",
          sender: "ai",
          timestamp: new Date(),
        });
        setStep(0);
      }
    };
    fetchPatient();
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

  const handleNext = async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    pushMessage({
      id: getMessageId(),
      text: value,
      sender: "user",
      timestamp: new Date(),
    });

    const vLower = value.toLowerCase();

    // Detect intent for natural language commands
    const intent = detectSimpleIntent(value);

    // Intent-based commands handling
    if (intent.intent === "edit" && intent.target && intent.value) {
      await handleEditIntent(intent.target, intent.value);
      setInputText("");
      return;
    } else if (intent.intent === "doctor_search") {
      handleDoctorSearchIntent();
      setInputText("");
      return;
    } else if (intent.intent === "doctor_detail") {
      handleDoctorDetailIntent(value);
      setInputText("");
      return;
    } else if (intent.intent === "emergency") {
      handleEmergencyIntent();
      setInputText("");
      return;
    } else if (intent.intent === "summary") {
      handleSummaryIntent();
      setInputText("");
      return;
    }

    if (patientDataFetched && !dataConfirmed) {
      if (vLower === "yes") {
        setDataConfirmed(true);
        pushMessage({
          id: getMessageId(),
          text: "Great! Please describe your symptoms in detail so I can help you find the right specialist.",
          sender: "ai",
          timestamp: new Date(),
        });
        setStep(5);
        setInputText("");
        return;
      }
      if (vLower === "no") {
        pushMessage({
          id: getMessageId(),
          text: "Which information needs to be updated? Please specify the field (age/gender/height/weight/blood group/address).",
          sender: "ai",
          timestamp: new Date(),
        });
        setUpdatingField("select");
        setInputText("");
        return;
      }
      if (updatingField === "select") {
        const allowed = ["age", "gender", "height", "weight", "blood group", "address", "location"];
        if (!allowed.includes(vLower)) {
          pushMessage({
            id: getMessageId(),
            text: "Please choose one of: age, gender, height, weight, blood group, address, location",
            sender: "ai",
            timestamp: new Date(),
          });
          setInputText("");
          return;
        }
        setUpdatingField(vLower);
        pushMessage({
          id: getMessageId(),
          text: `Please provide the new value for ${vLower}:`,
          sender: "ai",
          timestamp: new Date(),
        });
        setInputText("");
        return;
      }
      if (updatingField && updatingField !== "select") {
        const field = updatingField;
        let ok = true;
        let msg = "";
        const updateData: Partial<UserInfo> = {};
        switch (field) {
          case "age":
            if (!validateAge(value)) {
              ok = false;
              msg = "That doesn't look like a valid age. Please enter valid age (1-119).";
            } else updateData.age = parseInt(value);
            break;
          case "gender":
            if (!["male", "female", "trans"].includes(vLower)) {
              ok = false;
              msg = "That doesn't look like a valid gender. Please enter male, female, or trans.";
            } else updateData.gender = value;
            break;
          case "height":
            if (!validateHeight(value)) {
              ok = false;
              msg = "That doesn't look like a valid height. Please enter height in cm (30-300).";
            } else updateData.height = parseFloat(value);
            break;
          case "weight":
            if (!validateWeight(value)) {
              ok = false;
              msg = "That doesn't look like a valid weight. Please enter weight in kg (2-600).";
            } else updateData.weight = parseFloat(value);
            break;
          case "blood group":
            if (!["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"].includes(vLower)) {
              ok = false;
              msg = "That doesn't look like a valid blood group. Please enter valid blood group (e.g., A+).";
            } else updateData.blood_group = value;
            break;
          case "address":
          case "location":
            if (value.length < 3) {
              ok = false;
              msg = "Please enter a valid address or location.";
            } else {
              updateData.address = value;
              updateData.location = value;
            }
            break;
          default:
            ok = false;
        }
        if (!ok) {
          pushMessage({
            id: getMessageId(),
            text: msg,
            sender: "ai",
            timestamp: new Date(),
          });
          setInputText("");
          return;
        }
        if (userInfo.id) {
          try {
            const { error } = await supabase.from("patients").update(updateData).eq("id", userInfo.id);
            if (error) throw error;
            setUserInfo((prev) => ({ ...prev, ...updateData }));
            pushMessage({
              id: getMessageId(),
              text: `${field} updated. Are all other details correct now? (yes/no)`,
              sender: "ai",
              timestamp: new Date(),
            });
            setUpdatingField(null);
            setInputText("");
            return;
          } catch (e) {
            pushMessage({
              id: getMessageId(),
              text: "Failed to update — please try again later.",
              sender: "ai",
              timestamp: new Date(),
            });
            setInputText("");
            return;
          }
        }
      }
    }

    if (step === "doctor_suggestion") {
      if (vLower === "yes") {
        handleNearbyDoctors();
      } else if (vLower === "no") {
        pushMessage({
          id: getMessageId(),
          text: "Okay — if you need anything else, feel free to ask anytime.",
          sender: "ai",
          timestamp: new Date(),
        });
      } else {
        pushMessage({
          id: getMessageId(),
          text: "Please reply 'yes' or 'no'.",
          sender: "ai",
          timestamp: new Date(),
        });
      }
      setInputText("");
      return;
    }

    if (typeof step === "number" && step >= 0) {
      let isValid = true;
      let errMsg = "";
      switch (step) {
        case 0:
          if (!validateAge(value)) {
            isValid = false;
            errMsg = "That doesn't look like a valid age. Please enter age between 1 and 119.";
          }
          break;
        case 1:
          if (!["male", "female", "trans"].includes(vLower)) {
            isValid = false;
            errMsg = "That doesn't look like a valid gender. Please enter male, female, or trans.";
          }
          break;
        case 2:
          if (!validateHeight(value)) {
            isValid = false;
            errMsg = "That doesn't look like a valid height. Please enter height in cm (30-300).";
          }
          break;
        case 3:
          if (!validateWeight(value)) {
            isValid = false;
            errMsg = "That doesn't look like a valid weight. Please enter weight in kg (2-600).";
          }
          break;
        case 4:
          if (value.length < 2) {
            isValid = false;
            errMsg = "Please enter valid location.";
          }
          break;
        case 5:
          if (value.length < 5) {
            isValid = false;
            errMsg = "Describe symptoms with at least 5 characters.";
          }
          break;
      }
      if (!isValid) {
        pushMessage({
          id: getMessageId(),
          text: errMsg,
          sender: "ai",
          timestamp: new Date(),
        });
        setInputText("");
        return;
      }
      if (step === 0) setUserInfo((p) => ({ ...p, age: parseInt(value) }));
      if (step === 1) setUserInfo((p) => ({ ...p, gender: value }));
      if (step === 2) setUserInfo((p) => ({ ...p, height: parseFloat(value) }));
      if (step === 3) setUserInfo((p) => ({ ...p, weight: parseFloat(value) }));
      if (step === 4) setUserInfo((p) => ({ ...p, location: value }));
      if (step === 5) setUserInfo((p) => ({ ...p, symptoms: value }));

      if (step < steps.length - 1) {
        const next = step + 1;
        setStep(next);
        pushMessage({
          id: getMessageId(),
          text: steps[next],
          sender: "ai",
          timestamp: new Date(),
        });
      } else {
        await sendToBackend({ ...userInfo, symptoms: value });
      }
      setInputText("");
      return;
    }

    // If no recognized step, prompt starting conversation
    if (step === -1) {
      setStep(0);
      pushMessage({ id: getMessageId(), text: steps[0], sender: "ai", timestamp: new Date() });
      setInputText("");
      return;
    }

    // Fallback response
    pushMessage({
      id: getMessageId(),
      text: "I'm sorry, I didn't understand that. Could you please rephrase or provide more details?",
      sender: "ai",
      timestamp: new Date(),
    });
    setInputText("");
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

        pushMessage({
          id: "ai-result",
          text: formattedText,
          sender: "ai",
          timestamp: new Date(),
        });

        if (parsedResult.recommended_doctors && parsedResult.recommended_doctors.length > 0) {
          let doctorText = "👨‍⚕️ **Recommended doctors for you:**\n\n";
          parsedResult.recommended_doctors.forEach((doc: any) => {
            doctorText += `• **Dr. ${doc.full_name}**\n`;
            if (doc.clinic_name) doctorText += `  🏥 ${doc.clinic_name}\n`;
            if (doc.experience) doctorText += `  📚 ${doc.experience} years of experience\n`;
            if (doc.consultation_fee) doctorText += `  💰 Fee: ₹${doc.consultation_fee}\n`;
            if (doc.phone) doctorText += `  📞 ${doc.phone}\n\n`;
          });

          pushMessage({
            id: "ai-doctors",
            text: doctorText,
            sender: "ai",
            timestamp: new Date(),
          });
        } else {
          setTimeout(() => {
            pushMessage({
              id: "ai-doctor-prompt",
              text: "Would you like me to suggest some doctors nearby? (yes/no)",
              sender: "ai",
              timestamp: new Date(),
            });
            setStep("doctor_suggestion");
          }, 1000);
        }
      }

    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));
      pushMessage({
        id: "ai-error",
        text: `❌ ${err instanceof Error ? err.message : "Network error or server not responding."}`,
        sender: "ai",
        timestamp: new Date(),
      });
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
