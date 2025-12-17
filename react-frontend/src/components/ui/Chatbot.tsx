import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Bot, Send } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { analyzeSymptoms } from "../../lib/api";
// CORE BRAIN
import { processChatMessage } from "./chatbot/core/processChatMessage";
import {
  ConversationContext,
  createInitialContext
} from "./chatbot/csm/context";

/* ----------------------------------
   Types
----------------------------------- */
type Message = {
  id: string;
  text: string;
  action?: { label: string; url: string };
  isTyping?: boolean;
  sender: "user" | "ai";
};

interface ChatbotProps {
  onDiseaseSelect?: (disease: string) => void;
}

/* ----------------------------------
   Chatbot Component
----------------------------------- */
const ChatbotContent = ({ onDiseaseSelect }: ChatbotProps, ref: React.Ref<any>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

const [hasGreeted, setHasGreeted] = useState(false);
  // SINGLE SOURCE OF TRUTH (memory)
  const [context, setContext] =
    useState<ConversationContext>(createInitialContext());

  const messageId = useRef(1);
const chatRef = useRef<HTMLDivElement | null>(null);

  // Expose method to send disease message
  useImperativeHandle(ref, () => ({
    sendDiseaseMessage: (disease: string) => {
      const messageText = `I have ${disease}`;
      setInputText("");
      
      // Trigger send with the disease message
      setTimeout(() => {
        pushUserMessage(messageText);
        const result: any = processChatMessage(messageText, context);
        if (result.reply) pushAIMessage(result.reply);
        setContext(result.context);

        if (result.backendRequest) {
          pushAIMessage("Analyzing your details and finding nearby doctors...");
          handleBackendAnalysis(result);
        }
      }, 0);
    }
  }));

useEffect(() => {
  if (chatRef.current) {
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }
}, [messages]);

    /* ----------------------------------
     Initial Greeting (once)
  ----------------------------------- */
  

  

  useEffect(() => {
  async function fetchPatient() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    const { data } = await supabase
      .from("patients")
      .select("age, gender, height, weight, address")
      .eq("auth_id", auth.user.id)
      .single();

      
    if (data) {
      setContext(prev => ({
        ...prev,
        patientProfile: data
      }));
    }
  }

  fetchPatient();
}, []);


  /* ----------------------------------
     Helpers
  ----------------------------------- */
  const pushUserMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: (messageId.current++).toString(),
        text,
        sender: "user"
      }
    ]);
  };

  // AI queue + typewriter support
  const [aiQueue, setAiQueue] = useState<Array<{ text: string; action?: { label: string; url: string } }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  const queueAIMessage = (text: string, action?: { label: string; url: string }) => {
    setAiQueue(prev => [...prev, { text, action }]);
  };

  // enqueue helpers (used across the component)
  const pushAIMessage = (text: string) => queueAIMessage(text);
  const pushAIActionMessage = (text: string, label: string, url: string) => queueAIMessage(text, { label, url });

  // Worker: process aiQueue sequentially
  useEffect(() => {
    if (isProcessingRef.current) return;
    if (aiQueue.length === 0) return;

    isProcessingRef.current = true;
    let cancelled = false;

    const process = async () => {
      setIsTyping(true);

      const item = aiQueue[0];

      // show temporary typing placeholder (optional)
      const typingId = (messageId.current++).toString();
      setMessages(prev => [
        ...prev,
        { id: typingId, text: '', sender: 'ai', isTyping: true }
      ]);

      // Show typing indicator during 5 second delay
      setShowTypingIndicator(true);

      // WAIT 5 seconds before starting to type
      await new Promise(res => setTimeout(res, 1000));
      setShowTypingIndicator(false);
      if (cancelled) return;

      // Start typewriter: create empty message entry to update
      const msgId = (messageId.current++).toString();
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, { id: msgId, text: '', sender: 'ai' }]);

      const chars = Array.from(item.text || '');
      let idx = 0;

      await new Promise<void>(resolve => {
        typingIntervalRef.current = window.setInterval(() => {
          idx += 1;
          setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, text: chars.slice(0, idx).join('') } : m)));
          if (idx >= chars.length) {
            if (typingIntervalRef.current) window.clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
            resolve();
          }
        }, 50);
      });

      // attach action when done
      if (item.action) {
        setMessages(prev => prev.map(m => (m.id === msgId ? { ...m, action: item.action } : m)));
      }

      // dequeue
      setAiQueue(prev => prev.slice(1));
      setIsTyping(false);
      isProcessingRef.current = false;
    };

    process();

    return () => {
      cancelled = true;
      if (typingIntervalRef.current) {
        window.clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setIsTyping(false);
      isProcessingRef.current = false;
    };
  }, [aiQueue.length]);

  // Enqueue the initial greeting now that queue helpers are defined
  useEffect(() => {
    if (!hasGreeted) {
      pushAIMessage("Hello 👋 I’m your health assistant.");
      pushAIMessage(
        "I can help you with symptom analysis, appointment booking, and general health-related questions."
      );
      setHasGreeted(true);
    }
  }, [hasGreeted]);
  // Handle disease selection from SeasonalHealth
  useEffect(() => {
    if (onDiseaseSelect) {
      // This won't be called from here, but this demonstrates the pattern
    }
  }, [onDiseaseSelect]);
  /* ----------------------------------
     MAIN MESSAGE HANDLER
  ----------------------------------- */
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    // If we're waiting for user consent to show nearby doctors, handle that first
    if ((context as any).awaitingDoctorConsent) {
      const vLower = text.toLowerCase().trim();
      if (vLower === "yes" || vLower === "y") {
        pushUserMessage(text);
        pushAIMessage("Okay — here is a link to consult doctors for the recommended specialization.");
        let specialization = (context as any).analysisResult?.recommended_specialization || (context as any).analysisResult?.specialization || "General Physician";

        if (specialization.includes("(")) {
          specialization = specialization.split("(")[0].trim();
        }
        if (specialization.includes(" and ")) {
          specialization = specialization.split(" and ")[0].trim();
        }
        if (specialization.includes(",")) {
          specialization = specialization.split(",")[0].trim();
        }

        const url = `/doctor_consultation?specialization=${encodeURIComponent(specialization)}`;
        pushAIActionMessage("Open doctor listings", "Consult Doctor", url);
        setContext(prev => ({ ...(prev as any), awaitingDoctorConsent: false }));
        setInputText("");
        return;
      } else if (vLower === "no" || vLower === "n") {
        pushUserMessage(text);
        pushAIMessage("Okay — if you need anything else, feel free to ask anytime.");
        setContext(prev => ({ ...(prev as any), awaitingDoctorConsent: false }));
        setInputText("");
        return;
      } else {
        pushUserMessage(text);
        pushAIMessage("Please reply 'yes' or 'no'.");
        setInputText("");
        return;
      }
    }

    // 1. Show user message
    pushUserMessage(text);

    // 2. Call brain
    const result: any = processChatMessage(text, context);

    // 3. Show bot reply
    if (result.reply) pushAIMessage(result.reply);

    // 4. Save updated context
    setContext(result.context);

    setInputText("");

    // 5. If the brain requests a backend analysis, perform it async
    if (result.backendRequest) {
      pushAIMessage("Analyzing your details and finding nearby doctors...");
      handleBackendAnalysis(result);
    }
  };

  const handleBackendAnalysis = async (result: any) => {
    let latitude: number | undefined = undefined;
    let longitude: number | undefined = undefined;
    if (navigator && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch (err) {
        console.warn("Geolocation not available or denied", err);
      }
    }

    try {
      const payload = {
        ...result.backendRequest.data,
        latitude,
        longitude
      };

      const analysis = await analyzeSymptoms(payload);

      // Build a concise reply for the user
      let replyText = "";
      if (analysis.possible_diseases) {
        replyText += `Possible conditions: ${analysis.possible_diseases.join(", ")}\n`;
      }
      if (analysis.severity) replyText += `Severity: ${analysis.severity}\n`;
      if (analysis.advice) replyText += `Advice: ${analysis.advice}\n`;
      if (analysis.recommended_specialization) replyText += `Recommended specialist: ${analysis.recommended_specialization}\n`;
      if (analysis.recommended_doctors && analysis.recommended_doctors.length) {
        replyText += "Nearby doctors:\n" + analysis.recommended_doctors.map((d: any) =>
          `• ${d.full_name} — ${d.clinic_name} — Fee: ${d.consultation_fee}`
        ).join("\n");
      }

      if (!replyText) replyText = analysis.message || "Analysis complete.";

      pushAIMessage(replyText);

      // store analysis result in context for later use
      setContext(prev => ({ ...prev, analysisResult: analysis }));

      // If there are no nearby doctors, ask user if they'd like suggestions
      if (!(analysis.recommended_doctors && analysis.recommended_doctors.length)) {
        pushAIMessage("Would you like me to suggest some doctors nearby? (yes/no)");
        setContext(prev => ({ ...prev, awaitingDoctorConsent: true, analysisResult: analysis }));
      }
    } catch (err) {
      console.error("Error calling analyzeSymptoms:", err);
      pushAIMessage("Sorry, I couldn't complete the analysis. Please try again later.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-like formatter: escapes HTML, converts **bold** and newlines
  const formatMessageToHtml = (text: string) => {
    if (!text) return "";
    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Escape then apply lightweight formatting (no truncation for Advice)
    const processed = text;
    let escaped = escapeHtml(processed);
    // Bold specific keywords (case-insensitive)
    escaped = escaped.replace(/Possible conditions:/gi, '<strong>Possible Conditions:</strong>');
    escaped = escaped.replace(/Severity:/gi, '<strong>Severity:</strong>');
    escaped = escaped.replace(/Advice:/gi, '<strong>Advice:</strong>');
    escaped = escaped.replace(/Recommended specialist:/gi, '<strong>Recommended Specialist:</strong>');
    // bold **text** -> <strong>text</strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert simple bullet lines starting with • or - into list items
    const lines = escaped.split(/\r?\n/);
    let out = '';
    let inList = false;
    for (const line of lines) {
      if (/^\s*(•|-)\s+/.test(line)) {
        if (!inList) { out += '<ul class="ml-4">'; inList = true; }
        const li = line.replace(/^\s*(•|-)\s+/, '');
        out += `<li>${li}</li>`;
      } else {
        if (inList) { out += '</ul>'; inList = false; }
        out += `<div>${line}</div>`;
      }
    }
    if (inList) out += '</ul>';

    return out;
  };

  /* ----------------------------------
     UI (simple & replaceable)
  ----------------------------------- */
  return (
  <div id="chatbot-container" className="h-screen bg-gray-190 flex items-center justify-center p-6 m-(-5)">
    <div className="w-full max-w-5xl bg-blue-100 rounded-2xl shadow-lg overflow-hidden flex flex-col">

      {/* Chat area */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-blue-gradient max-h-[75vh]"
      >
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-xl whitespace-pre-line ${
                m.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 shadow"
              }`}
            >
              {m.sender === "ai" && (
                <Bot className="inline-block w-4 h-4 mr-1 text-blue-600" />
              )}
              {m.isTyping && showTypingIndicator ? (
                <div className="flex items-center space-x-1 py-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <div
                  className="message-text transition-opacity duration-300 ease-in-out"
                  dangerouslySetInnerHTML={{ __html: formatMessageToHtml(m.text) }}
                />
              )}
              {m.action && m.action.url && (
                <div className="mt-3">
                  <button
                    onClick={() => window.open(m.action!.url, "_blank")}
                    className="ml-0 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {m.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-300 p-4 flex space-x-3 items-center">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer or press Enter..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-gradient text-white p-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

    </div>
  </div>
);
};

const Chatbot = forwardRef(ChatbotContent);
export default Chatbot;
