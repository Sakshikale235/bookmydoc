import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

type UserInfo = {
  age?: string | "*";
  gender?: string | "*";
  height?: string | "*";
  weight?: string | "*";
  location?: string | "*";
  symptoms?: string;
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! Welcome to your AI health assistant. I'm here to help analyze your symptoms and provide guidance. To get started, please say 'Hi' or 'Hello' and I'll begin asking you some questions.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const [step, setStep] = useState<number>(-1); // Start with -1 to wait for greeting
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "What is your age?",
    "What is your gender?",
    "Height in cm?",
    "Weight in kg?",
    "Your location (city)? ",
    "Please describe your symptoms *. Be as specific as possible.",
  ];

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const pushMessage = (msg: Message) => setMessages((p) => [...p, msg]);

  const handleNext = (value: string) => {
    // Check if it's the initial greeting
    if (step === -1) {
      const greeting = value.toLowerCase().trim();
      if (greeting.includes('hi') || greeting.includes('hello') || greeting.includes('hey')) {
        // Add user greeting
        pushMessage({
          id: Date.now().toString(),
          text: value,
          sender: "user",
          timestamp: new Date(),
        });

        // Start the questions
        setStep(0);
        pushMessage({
          id: (Date.now() + 1).toString(),
          text: "Great! I'll ask you a few questions to help analyze your symptoms. You can skip optional questions by typing '*' or clicking Skip. Let's start:\n\n" + steps[0],
          sender: "ai",
          timestamp: new Date(),
        });
        setInputText("");
        return;
      } else {
        // Add user message
        pushMessage({
          id: Date.now().toString(),
          text: value,
          sender: "user",
          timestamp: new Date(),
        });

        // Ask for proper greeting
        pushMessage({
          id: (Date.now() + 1).toString(),
          text: "Please greet me with 'Hi' or 'Hello' to start our conversation!",
          sender: "ai",
          timestamp: new Date(),
        });
        setInputText("");
        return;
      }
    }

    let val = value.trim() || "*"; // treat empty input as skipped
    switch (step) {
      case 0:
        setUserInfo((p) => ({ ...p, age: val }));
        break;
      case 1:
        setUserInfo((p) => ({ ...p, gender: val }));
        break;
      case 2:
        setUserInfo((p) => ({ ...p, height: val }));
        break;
      case 3:
        setUserInfo((p) => ({ ...p, weight: val }));
        break;
      case 4:
        setUserInfo((p) => ({ ...p, location: val }));
        break;
      case 5:
        setUserInfo((p) => ({ ...p, symptoms: val }));
        break;
    }

    // Add user message
    pushMessage({
      id: Date.now().toString(),
      text: val,
      sender: "user",
      timestamp: new Date(),
    });

    // Move to next step
    if (step < steps.length - 1) {
      setStep(step + 1);
      pushMessage({
        id: (Date.now() + 1).toString(),
        text: steps[step + 1],
        sender: "ai",
        timestamp: new Date(),
      });
    } else {
      sendToBackend({ ...userInfo, symptoms: val });
    }

    setInputText("");
  };


  // perfectly working function
  const sendToBackend = async (data: UserInfo) => {
    setIsTyping(true);
    pushMessage({
      id: "ai-typing",
      text: "Analyzing your inputs — please wait...",
      sender: "ai",
      timestamp: new Date(),
    });

    try {
      const res = await fetch("http://localhost:8000/api/analyze-symptoms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json(); // <-- declare result here ✅

      // remove typing message
      setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));

      // format result
      let formattedText = "";

      if (result.possible_diseases) {
        formattedText += "🧾 **Analysis Result**\n\n";
        formattedText += `• **Possible Diseases:** ${result.possible_diseases.join(", ")}\n`;
        formattedText += `• **Severity:** ${result.severity || "Not available"}\n`;
        formattedText += `• **Doctor Recommendation:** ${result.doctor_recommendation || "Not available"}\n`;
        formattedText += `• **Advice:** ${result.advice || "No advice given"}\n`;
        if (result.bmi !== null && result.bmi !== undefined) {
          formattedText += `• **BMI:** ${result.bmi}\n`;
        }
      } else if (result.message) {
        formattedText = result.message;
      } else {
        formattedText = "⚠️ Unexpected response format.";
      }

      pushMessage({
        id: "ai-result",
        text: formattedText,
        sender: "ai",
        timestamp: new Date(),
      });

    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));
      pushMessage({
        id: "ai-error",
        text: "❌ Network error or server not responding.",
        sender: "ai",
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

//   const sendToBackend = async (data: UserInfo) => {
//   setIsTyping(true);

//   // Optional: show typing indicator
//   pushMessage({
//     id: "ai-typing",
//     text: "Analyzing your inputs — please wait...",
//     sender: "ai",
//     timestamp: new Date(),
//   });

//   try {
//     const res = await fetch("http://localhost:8000/api/analyze-symptoms/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     const result = await res.json(); // ✅ declare result here

//     // remove typing message
//     setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));

//     // Send each piece of result as a separate message
//     if (result.possible_diseases) {
//       result.possible_diseases.forEach((disease: string, idx: number) => {
//         pushMessage({
//           id: `ai-disease-${idx}`,
//           text: `🧾 Possible disease: ${disease}`,
//           sender: "ai",
//           timestamp: new Date(),
//         });
//       });

//       pushMessage({
//         id: "ai-severity",
//         text: `⚠️ Severity: ${result.severity || "Not available"}`,
//         sender: "ai",
//         timestamp: new Date(),
//       });

//       pushMessage({
//         id: "ai-doctor",
//         text: `👨‍⚕️ Doctor Recommendation: ${result.doctor_recommendation || "Not available"}`,
//         sender: "ai",
//         timestamp: new Date(),
//       });

//       pushMessage({
//         id: "ai-advice",
//         text: `💡 Advice: ${result.advice || "No advice given"}`,
//         sender: "ai",
//         timestamp: new Date(),
//       });

//       if (result.bmi !== null && result.bmi !== undefined) {
//         pushMessage({
//           id: "ai-bmi",
//           text: `⚖️ BMI: ${result.bmi}`,
//           sender: "ai",
//           timestamp: new Date(),
//         });
//       }
//     } else if (result.message) {
//       pushMessage({
//         id: "ai-message",
//         text: result.message,
//         sender: "ai",
//         timestamp: new Date(),
//       });
//     } else {
//       pushMessage({
//         id: "ai-error-format",
//         text: "⚠️ Unexpected response format.",
//         sender: "ai",
//         timestamp: new Date(),
//       });
//     }
//   } catch (err) {
//     setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));
//     pushMessage({
//       id: "ai-error",
//       text: "❌ Network error or server not responding.",
//       sender: "ai",
//       timestamp: new Date(),
//     });
//   } finally {
//     setIsTyping(false);
//   }
// };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext(inputText);
    }
  };

  return (
    <div className="h-screen bg-gray-190   flex items-center justify-center p-6 m-(-5)">
      <div className="w-full max-w-5xl bg-blue-100 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-blue-gradient max-h-96"
        >
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div
                className={`flex items-start space-x-3 ${message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {message.sender === "ai" && (
                  <div className="bg-white rounded-full p-2 flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${message.sender === "user"
                    ? "bg-white text-gray-800 rounded-br-sm"
                    : "bg-white text-gray-800 shadow-md rounded-bl-sm"
                    }`}
                >
                  {/* <div className="text-sm">{message.text}</div>
                   */}
                  <div
                    className="text-sm whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }}
                  ></div>

                  {/* Skip button appears only for optional AI questions */}
                  {message.sender === "ai" &&
                    step >= 0 &&
                    message.text.includes("* skip") && (
                      <button
                        onClick={() => handleNext("*")}
                        className="self-start mt-2 ml-12 px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400 transition-colors"
                      >
                        Skip
                      </button>
                    )}

                </div>
                {message.sender === "user" && (
                  <div className="bg-white rounded-full p-2 flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Skip button appears only for AI questions with * skip and not during greeting phase */}
              {message.sender === "ai" &&
                step >= 0 &&
                message.text.includes("* skip") && (
                  <button
                    onClick={() => handleNext("*")}
                    className="self-start mt-2 ml-12 px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400 transition-colors"
                  >
                    Skip
                  </button>
                )}
            </div>
          ))}
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

        {/* Input */}
        <div className="border-t border-gray-300 p-4 flex space-x-3 items-center">
          <input
            ref={inputRef}
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



// // src/components/ui/Chatbot.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { Send, Bot, User, Loader } from 'lucide-react';
// import { Message } from '@/types';

// type UserInfo = {
//   age?: string | null;
//   gender?: string | null;
//   height?: string | null;
//   weight?: string | null;
// };

// type Step =
//   | 'greet'
//   | 'ask_age'
//   | 'ask_gender'
//   | 'ask_height'
//   | 'ask_weight'
//   | 'ask_symptoms'
//   | 'waiting'
//   | 'done';

// const Chatbot: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       text:
//         "Hi! I'm your AI health assistant. I'll help analyze symptoms. I'll ask a few optional questions (age, gender, height, weight). You can skip any except symptoms. Ready?",
//       sender: 'ai',
//       timestamp: new Date()
//     }
//   ]);

//   const [step, setStep] = useState<Step>('greet');
//   const [userInfo, setUserInfo] = useState<UserInfo>({});
//   const [inputText, setInputText] = useState('');
//   const [isTyping, setIsTyping] = useState(false);

//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   // auto-scroll
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [messages, isTyping]);

//   // helper to add messages
//   const pushMessage = (msg: Message) => {
//     setMessages((p) => [...p, msg]);
//   };

//   // when user sends text
//   const handleSubmit = async () => {
//     const text = inputText.trim();
//     if (!text) return;

//     // add user message
//     const userMsg: Message = {
//       id: Date.now().toString(),
//       text,
//       sender: 'user',
//       timestamp: new Date()
//     };
//     pushMessage(userMsg);
//     setInputText('');

//     // step handling
//     if (step === 'greet') {
//       setStep('ask_age');
//       pushMessage({ id: 'ai-ask-age', text: 'Optional: What is your age? (or Skip)', sender: 'ai', timestamp: new Date() });
//       return;
//     }

//     if (step === 'ask_age') {
//       setUserInfo((p) => ({ ...p, age: text }));
//       setStep('ask_gender');
//       pushMessage({ id: 'ai-ask-gender', text: 'Optional: What is your gender? (or Skip)', sender: 'ai', timestamp: new Date() });
//       return;
//     }

//     if (step === 'ask_gender') {
//       setUserInfo((p) => ({ ...p, gender: text }));
//       setStep('ask_height');
//       pushMessage({ id: 'ai-ask-height', text: 'Optional: Height in cm? (or Skip)', sender: 'ai', timestamp: new Date() });
//       return;
//     }

//     if (step === 'ask_height') {
//       setUserInfo((p) => ({ ...p, height: text }));
//       setStep('ask_weight');
//       pushMessage({ id: 'ai-ask-weight', text: 'Optional: Weight in kg? (or Skip)', sender: 'ai', timestamp: new Date() });
//       return;
//     }

//     if (step === 'ask_weight') {
//       setUserInfo((p) => ({ ...p, weight: text }));
//       setStep('ask_symptoms');
//       pushMessage({ id: 'ai-ask-symptoms', text: 'Please describe your symptoms (required). Be as specific as possible.', sender: 'ai', timestamp: new Date() });
//       return;
//     }

//     if (step === 'ask_symptoms') {
//       // symptoms required
//       const symptoms = text;
//       await sendToBackend({ ...userInfo, symptoms });
//       return;
//     }

//     // if at greet and user typed anything else, start flow
//     if (step === 'greet') {
//       setStep('ask_age');
//     }
//   };

//   // Skip button for optional steps
//   const handleSkip = () => {
//     if (step === 'ask_age') {
//       setUserInfo((p) => ({ ...p, age: null }));
//       setStep('ask_gender');
//       pushMessage({ id: 'ai-ask-gender', text: 'Optional: What is your gender? (or Skip)', sender: 'ai', timestamp: new Date() });
//     } else if (step === 'ask_gender') {
//       setUserInfo((p) => ({ ...p, gender: null }));
//       setStep('ask_height');
//       pushMessage({ id: 'ai-ask-height', text: 'Optional: Height in cm? (or Skip)', sender: 'ai', timestamp: new Date() });
//     } else if (step === 'ask_height') {
//       setUserInfo((p) => ({ ...p, height: null }));
//       setStep('ask_weight');
//       pushMessage({ id: 'ai-ask-weight', text: 'Optional: Weight in kg? (or Skip)', sender: 'ai', timestamp: new Date() });
//     } else if (step === 'ask_weight') {
//       setUserInfo((p) => ({ ...p, weight: null }));
//       setStep('ask_symptoms');
//       pushMessage({ id: 'ai-ask-symptoms', text: 'Please describe your symptoms (required). Be as specific as possible.', sender: 'ai', timestamp: new Date() });
//     }
//   };

//   // send payload to Django backend which calls Gemini
//   const sendToBackend = async (payload: { age?: string | null; gender?: string | null; height?: string | null; weight?: string | null; symptoms: string }) => {
//     setIsTyping(true);
//     setStep('waiting');

//     // show typing indicator in chat
//     pushMessage({ id: 'ai-typing', text: 'Analyzing your inputs — please wait a moment...', sender: 'ai', timestamp: new Date() });

//     try {
//       const res = await fetch('/api/diagnose/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userInfo: payload, symptoms: payload.symptoms })
//       });
//       const data = await res.json();

//       // remove the temporary typing message
//       setMessages((prev) => prev.filter((m) => m.id !== 'ai-typing'));

//       if (!res.ok) {
//         pushMessage({ id: 'ai-error', text: data.error || 'Server error', sender: 'ai', timestamp: new Date() });
//       } else {
//         // if backend returned parsed JSON in 'parsed', show a friendly formatted summary:
//         if (data.parsed) {
//           const pretty = formatParsed(data.parsed);
//           pushMessage({ id: 'ai-result', text: pretty, sender: 'ai', timestamp: new Date() });
//         } else {
//           // fallback: show raw reply
//           pushMessage({ id: 'ai-result-raw', text: data.reply || 'No reply', sender: 'ai', timestamp: new Date() });
//         }
//       }
//     } catch (err: any) {
//       setMessages((prev) => prev.filter((m) => m.id !== 'ai-typing'));
//       pushMessage({ id: 'ai-err-fetch', text: 'Network error: ' + (err.message || err), sender: 'ai', timestamp: new Date() });
//     } finally {
//       setIsTyping(false);
//       setStep('done');
//     }
//   };

//   const formatParsed = (p: any) => {
//     // p expected to have: summary, possible_conditions[], recommended_action, recommended_specialist, what_to_tell_doctor
//     let out = `${p.summary || ''}\n\n`;
//     if (p.possible_conditions && Array.isArray(p.possible_conditions)) {
//       out += 'Possible conditions:\n';
//       p.possible_conditions.forEach((c: any) => {
//         out += `• ${c.name} (${c.likelihood || 'unknown'}${c.confidence ? `, ${c.confidence}%` : ''}) — ${c.reasoning || ''}\n`;
//       });
//       out += '\n';
//     }
//     out += `Recommended action: ${p.recommended_action || 'see doctor if concerned'}\n`;
//     out += `Suggested specialist: ${p.recommended_specialist || 'General physician'}\n\n`;
//     if (p.what_to_tell_doctor) {
//       out += `What to tell your doctor:\n${p.what_to_tell_doctor.map((line: string) => `• ${line}\n`).join('')}\n`;
//     }
//     return out;
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };

//   // initial kickoff: if user clicks into input and still at greet, ask to start
//   useEffect(() => {
//     if (step === 'greet') {
//       // do nothing — initial ai greeting already present
//     } else if (step === 'ask_age') {
//       // focus
//       inputRef.current?.focus();
//     }
//   }, [step]);

//   return (
//     <section id="chatbot" className="py-16 bg-white">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-gray-50 rounded-2xl shadow-xl overflow-hidden">
//           <div ref={chatContainerRef} className="h-96 overflow-y-auto p-6 space-y-4">
//             {messages.map((message) => (
//               <div key={message.id} className={`flex items-start space-x-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
//                 {message.sender === 'ai' && (
//                   <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
//                     <Bot className="h-4 w-4 text-white" />
//                   </div>
//                 )}
//                 <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${message.sender === 'user' ? 'bg-[#2D9CDB] text-white rounded-br-sm' : 'bg-white text-gray-800 shadow-md rounded-bl-sm'}`}>
//                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
//                 </div>
//                 {message.sender === 'user' && (
//                   <div className="bg-gray-300 rounded-full p-2 flex-shrink-0">
//                     <User className="h-4 w-4 text-gray-600" />
//                   </div>
//                 )}
//               </div>
//             ))}

//             {isTyping && (
//               <div className="flex items-start space-x-3">
//                 <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
//                   <Bot className="h-4 w-4 text-white" />
//                 </div>
//                 <div className="bg-white text-gray-800 shadow-md px-4 py-3 rounded-2xl rounded-bl-sm">
//                   <div className="flex space-x-1">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Input */}
//           <div className="border-t border-gray-200 p-4">
//             <div className="flex space-x-3 items-center">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={inputText}
//                 onChange={(e) => setInputText(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder={
//                   step === 'greet'
//                     ? 'Type anything to begin...'
//                     : step === 'ask_age'
//                     ? 'Enter age (or click Skip)'
//                     : step === 'ask_gender'
//                     ? 'Enter gender (or Skip)'
//                     : step === 'ask_height'
//                     ? 'Enter height in cm (or Skip)'
//                     : step === 'ask_weight'
//                     ? 'Enter weight in kg (or Skip)'
//                     : step === 'ask_symptoms'
//                     ? 'Describe symptoms (required)'
//                     : ''
//                 }
//                 className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 disabled={isTyping || step === 'waiting' || step === 'done'}
//               />
//               <button
//                 onClick={handleSubmit}
//                 disabled={isTyping || step === 'waiting' || (step === 'ask_symptoms' && !inputText.trim())}
//                 className="bg-[#2D9CDB] text-white p-3 rounded-xl hover:bg-[#56CCF2] transition-colors duration-200 disabled:opacity-60"
//               >
//                 {isTyping ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
//               </button>

//               {/* Show Skip for optional steps */}
//               {['ask_age', 'ask_gender', 'ask_height', 'ask_weight'].includes(step) && (
//                 <button onClick={handleSkip} className="ml-2 px-3 py-2 rounded-md border border-gray-300 text-sm">
//                   Skip
//                 </button>
//               )}
//             </div>

//             <div className="mt-3 text-center">
//               <p className="text-xs text-gray-500">
//                 This assistant gives general information only — not a medical diagnosis. For emergencies call local emergency services.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Chatbot;


// // The server route is /api/diagnose/ (Django). Edit the path if you use a different route.

// // Optional fields are stored as null if skipped. Symptoms are required.

// // The component attempts to parse structured JSON returned in data.parsed — your backend will try to parse model output to JSON (see backend).