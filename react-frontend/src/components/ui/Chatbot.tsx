import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

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

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdRef = useRef(1);
  const [patientDataFetched, setPatientDataFetched] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  const [step, setStep] = useState<number | 'doctor_suggestion'>(-1); // Start with -1 to wait for greeting
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data: patientData, error } = await supabase
          .from("patients")
          .select("*")
          .eq("auth_id", authUser.id)
          .single();

        if (error) throw error;

        if (patientData) {
          setUserInfo({
            id: patientData.id,
            auth_id: patientData.auth_id,
            full_name: patientData.full_name,
            age: patientData.age,
            gender: patientData.gender,
            height: patientData.height,
            weight: patientData.weight,
            blood_group: patientData.blood_group,
            address: patientData.address,
            location: patientData.address // Using address as location
          });
          setPatientDataFetched(true);

          // Initial greeting with patient data
          setMessages([{
            id: getMessageId(),
            text: `Hello ${patientData.full_name}! I have your health information. Let me confirm if these details are correct:\n\n` +
                  `Age: ${patientData.age || 'Not provided'}\n` +
                  `Gender: ${patientData.gender || 'Not provided'}\n` +
                  `Height: ${patientData.height ? patientData.height + ' cm' : 'Not provided'}\n` +
                  `Weight: ${patientData.weight ? patientData.weight + ' kg' : 'Not provided'}\n` +
                  `Blood Group: ${patientData.blood_group || 'Not provided'}\n` +
                  `Address: ${patientData.address || 'Not provided'}\n\n` +
                  `Are these details correct? Please reply with 'yes' or 'no'.`,
            sender: "ai",
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        // Fall back to default greeting if fetch fails
        setMessages([{
          id: getMessageId(),
          text: "Hello! Welcome to your AI health assistant. I'm here to help analyze your symptoms and provide guidance. To get started, please say 'Hi' or 'Hello'.",
          sender: "ai",
          timestamp: new Date(),
        }]);
      }
    };

    fetchPatientData();
  }, []);

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
  // Generate unique message ID
  const getMessageId = () => {
    return (messageIdRef.current++).toString();
  };

  const handleNext = async (value: string) => {
    const userResponse = value.toLowerCase().trim();
    
    // Add user message to chat (only once per input)
    pushMessage({
      id: getMessageId(),
      text: value,
      sender: "user",
      timestamp: new Date(),
    });

    // Handle data confirmation flow
    if (patientDataFetched && !dataConfirmed) {
      if (userResponse === 'yes') {
        setDataConfirmed(true);
        pushMessage({
          id: Date.now().toString(),
          text: "Great! Please describe your symptoms in detail so I can help you find the right specialist.",
          sender: "ai",
          timestamp: new Date(),
        });
        setStep(5); // Skip to symptoms step
      } else if (userResponse === 'no') {
        pushMessage({
          id: Date.now().toString(),
          text: "Which information needs to be updated? Please specify the field (age/gender/height/weight/blood group).",
          sender: "ai",
          timestamp: new Date(),
        });
        setUpdatingField('waiting_for_field');
      } else if (updatingField === 'waiting_for_field') {
        // Handle field selection
        const field = userResponse;
        let validField = true;
        switch (field) {
          case 'age':
          case 'gender':
          case 'height':
          case 'weight':
          case 'blood group':
          case 'address':
            setUpdatingField(field);
            pushMessage({
              id: Date.now().toString(),
              text: `Please enter your new ${field}:`,
              sender: "ai",
              timestamp: new Date(),
            });
            break;
          default:
            validField = false;
            pushMessage({
              id: Date.now().toString(),
              text: "Please specify a valid field (age/gender/height/weight/blood group/address):",
              sender: "ai",
              timestamp: new Date(),
            });
        }
        if (!validField) return;
      } else if (updatingField) {
        // Handle field update
        const updateData: Partial<UserInfo> = {};
        const newValue = userResponse;

        switch (updatingField) {
          case 'age':
            updateData.age = parseInt(newValue) || null;
            break;
          case 'gender':
            updateData.gender = newValue;
            break;
          case 'height':
            updateData.height = parseFloat(newValue) || null;
            break;
          case 'weight':
            updateData.weight = parseFloat(newValue) || null;
            break;
          case 'blood group':
            updateData.blood_group = newValue;
            break;
          case 'address':
            updateData.address = newValue;
            break;
        }

        // Update in database
        if (userInfo.id) {
          try {
            const { error } = await supabase
              .from("patients")
              .update(updateData)
              .eq("id", userInfo.id);

            if (error) throw error;

            setUserInfo(prev => ({ ...prev, ...updateData }));
            pushMessage({
              id: Date.now().toString(),
              text: `${updatingField} updated successfully. Are all other details correct now? (yes/no)`,
              sender: "ai",
              timestamp: new Date(),
            });
            setUpdatingField(null);
          } catch (error) {
            console.error('Error updating patient data:', error);
            pushMessage({
              id: Date.now().toString(),
              text: "There was an error updating your information. Please try again.",
              sender: "ai",
              timestamp: new Date(),
            });
          }
        }
        return;
      }
      setInputText("");
      return;
    }

    // Handle doctor suggestion response
    if (step === 'doctor_suggestion') {
      if (userResponse === 'yes') {
        setIsTyping(true);
        try {
          if (!lastAnalysisResult?.recommended_specialty) {
            throw new Error("No specialty recommendation available");
          }

          const { data: doctors, error } = await supabase
            .from('doctors')
            .select(`
              *,
              doctor_specialties!inner(
                specialties!inner(name)
              )
            `)
            .eq('doctor_specialties.specialties.name', lastAnalysisResult.recommended_specialty)
            .order('experience', { ascending: false })
            .limit(3);

          if (error) throw error;

          if (doctors && doctors.length > 0) {
            let doctorText = "👨‍⚕️ **Here are some recommended doctors in your area:**\n\n";
            doctors.forEach((doctor: any) => {
              doctorText += `• **Dr. ${doctor.full_name}**\n`;
              doctorText += `  📚 ${doctor.experience} years of experience\n`;
              doctorText += `  🏥 ${doctor.clinic_name}\n`;
              doctorText += `  💰 Consultation Fee: ₹${doctor.consultation_fee}\n`;
              doctorText += `  📞 ${doctor.phone}\n\n`;
            });
            pushMessage({
              id: "ai-doctors",
              text: doctorText,
              sender: "ai",
              timestamp: new Date(),
            });
          } else {
            pushMessage({
              id: "ai-no-doctors",
              text: "I couldn't find any specialists in your area at the moment. Please consider consulting a general physician.",
              sender: "ai",
              timestamp: new Date(),
            });
          }
        } catch (err) {
          console.error('Error fetching doctors:', err);
          pushMessage({
            id: "ai-error",
            text: "Sorry, I encountered an error while searching for doctors. Please try again later.",
            sender: "ai",
            timestamp: new Date(),
          });
        } finally {
          setIsTyping(false);
        }
      } else if (userResponse === 'no') {
        pushMessage({
          id: "ai-goodbye",
          text: "Alright! If you need any other assistance, feel free to ask. Take care!",
          sender: "ai",
          timestamp: new Date(),
        });
      } else {
        pushMessage({
          id: "ai-invalid",
          text: "Please reply with 'yes' or 'no'.",
          sender: "ai",
          timestamp: new Date(),
        });
      }
      setInputText("");
      return;
    }

    // If data is confirmed, proceed with regular flow
    if (!dataConfirmed) return;

    const val = value.trim() || "*"; // treat empty input as skipped
    if (typeof step === 'number') {
      switch (step) {
        case 0:
          setUserInfo((p) => ({ ...p, age: parseInt(val) || null }));
          break;
        case 1:
          setUserInfo((p) => ({ ...p, gender: val }));
          break;
        case 2:
          setUserInfo((p) => ({ ...p, height: parseFloat(val) || null }));
          break;
        case 3:
          setUserInfo((p) => ({ ...p, weight: parseFloat(val) || null }));
          break;
        case 4:
          setUserInfo((p) => ({ ...p, location: val }));
          break;
        case 5:
          setUserInfo((p) => ({ ...p, symptoms: val }));
          break;
      }
    }

    // Don't push user message again here (already pushed above)

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
      text: "Analyzing your symptoms and finding suitable doctors...",
      sender: "ai",
      timestamp: new Date(),
    });

    try {
      // Format the data for the backend including current date
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

      // First get the analysis and recommended specialties
      const res = await fetch("http://localhost:8000/api/analyze-symptoms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await res.json();

      // remove typing message
      setMessages((prev) => prev.filter((m) => m.id !== "ai-typing"));

      if (!res.ok) {
        throw new Error(result.error || 'Server error');
      }

      // Try to parse the response if it's a string
      let parsedResult = result;
      if (typeof result === 'string') {
        try {
          parsedResult = JSON.parse(result);
        } catch (e) {
          parsedResult = { message: result };
        }
      }

      // Store the parsed result for later use
      setLastAnalysisResult(parsedResult);

      // format result
      let formattedText = "";
      if (parsedResult.possible_diseases) {
        formattedText += "🧾 **Based on your symptoms, location, and the current season, here's my analysis:**\n\n";
        formattedText += `• **Possible Conditions:** ${parsedResult.possible_diseases.join(", ")}\n\n`;
        if (parsedResult.recommended_specialty) {
          formattedText += `🔎 **Recommended Specialist:** ${parsedResult.recommended_specialty}\n\n`;
        }
        if (parsedResult.seasonal_analysis) {
          formattedText += `🌡️ **Seasonal Context:**\n${parsedResult.seasonal_analysis}\n\n`;
        }
        formattedText += `💡 **Advice:** ${parsedResult.advice || "No specific advice available"}\n\n`;
        // Send analysis result
        pushMessage({
          id: "ai-result",
          text: formattedText,
          sender: "ai",
          timestamp: new Date(),
        });
        // Ask about doctor suggestions
        setTimeout(() => {
          pushMessage({
            id: "ai-doctor-prompt",
            text: "Would you like me to suggest some doctors nearby who specialize in treating these conditions? (yes/no)",
            sender: "ai",
            timestamp: new Date(),
          });
          setStep("doctor_suggestion");
        }, 1000);
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
                    typeof step === 'number' &&
                    typeof step === 'number' && step >= 0 &&
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
                typeof step === 'number' && step >= 0 &&
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