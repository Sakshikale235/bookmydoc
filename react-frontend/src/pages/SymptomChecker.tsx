import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import Navigation from '@/components/Navigation';
import SeasonalHealth from '@/components/ui/SeasonalHealth';
import Chatbot from '@/components/ui/Chatbot';
import Footer from '@/components/Footer'; 
import gsap from 'gsap';

const SymptomChecker: React.FC = () =>  {
  // const [user, setUser] = useState(supabase.auth.user()); // current user
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [loading, setLoading] = useState(true);

  // Refs for gsap animations
  const navRef = useRef<HTMLDivElement>(null);
  const seasonalRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const symptomsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.out" } });

    tl.from(navRef.current, { y: -80, opacity: 0 })
      .from(seasonalRef.current, { y: 50, opacity: 0 }, "-=0.5")
      .from(chatbotRef.current, { scale: 0.8, opacity: 0 }, "-=0.3")
      .from(footerRef.current, { y: 80, opacity: 0 }, "-=0.4");
  }, []);

  //  useEffect(() => {
  //   // Listen to auth state changes
  //   const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null);
  //     setLoading(false);
  //   });

  //   setLoading(false); // initial load

  //   return () => {
  //     listener.subscription.unsubscribe();
  //   };
  // }, []);

  // Animate symptoms list on mount + hover
  useEffect(() => {
    if (symptomsRef.current) {
      gsap.from(symptomsRef.current.children, {
        opacity: 0,
        x: -30,
        stagger: 0.2,
        duration: 0.6,
        ease: "power2.out"
      });

      // Add hover animations for each symptom <li>
      Array.from(symptomsRef.current.children).forEach((el, idx) => {
        const li = el as HTMLElement;

        li.addEventListener("mouseenter", () => {
          gsap.to(li, {
            scale: 1.05,
            backgroundColor: idx % 2 === 0 ? "#f0f9ff" : "#f0fff4", // blue for odd, green for even
            duration: 0.3,
            ease: "power2.out"
          });
        });

        li.addEventListener("mouseleave", () => {
          gsap.to(li, {
            scale: 1,
            backgroundColor: "transparent",
            duration: 0.3,
            ease: "power2.inOut"
          });
        });
      });
    }
  }, []);

  const smoothScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navigation 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      /> */}

       <Navigation />
        <SeasonalHealth />
      <Chatbot />
       <Footer />

        

      {/* Seasonal Health */}
      <div id="seasonal" ref={seasonalRef}>
        <SeasonalHealth />
      </div>

      {/* Chatbot */}
      <div id="chatbot" ref={chatbotRef}>
        <Chatbot />
      </div>

      {/* Footer */}
      <div ref={footerRef}>
        <Footer />
      </div>
      
     
    </div>
  );
}

export default SymptomChecker;


// ----------------- COMMENTED OLDER VERSION -----------------
// I’ve kept your entire older inline SymptomChecker with chatbot + diseases
// untouched below so you can still refer to it if needed.


// import React, { useState } from 'react';
// const SymptomChecker: React.FC = () => {
//   const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
//   const [input, setInput] = useState('');
//   const [isExpanded, setIsExpanded] = useState(false);

//   const diseases = {
//     "Common Cold": ["sneezing", "coughing", "stuffiness", "fatigue"],
//     "Flu (Influenza)": ["fever", "achiness", "fatigue"],
//     "COVID-19": ["sore throat", "congestion", "respiratory distress", "extreme fatigue", "body aches"],
//     "RSV": ["wheezing", "coughing", "chest congestion", "decreased appetite", "difficulty breathing"],
//     "Bronchitis": ["achiness", "chills", "fever", "congestion", "wheezing", "labored breathing"],
//     "Pneumonia": ["high fever", "sweats", "severe breathing difficulty", "chest pain"],
//     "Pink Eye": ["redness", "itching", "goopy discharge", "light sensitivity"],
//     "Strep Throat": ["fever", "aches", "fatigue", "white spots", "headaches", "rash"],
//     "Sinus Infection": ["runny nose", "headaches", "sinus pain", "fever"],
//     "Norovirus": ["nausea", "loss of appetite", "diarrhea"]
//   };

//   const sendMessage = () => {
//     if (input.trim() === '') return;

//     const userMessage = { text: input, sender: 'user' as const };
//     setMessages(prev => [...prev, userMessage]);

//     setTimeout(() => {
//       const prediction = predictDisease(input);
//       const botMessage = { text: prediction, sender: 'bot' as const };
//       setMessages(prev => [...prev, botMessage]);
//     }, 600);

//     setInput('');
//   };

//   const predictDisease = (symptomInput: string) => {
//     const userSymptoms = symptomInput.toLowerCase().split(',').map(s => s.trim());
//     let bestMatch = null;
//     let maxCount = 0;

//     for (const [disease, symptoms] of Object.entries(diseases)) {
//       const count = userSymptoms.filter(userSym => symptoms.some(sym => userSym.includes(sym) || sym.includes(userSym))).length;
//       if (count > maxCount) {
//         maxCount = count;
//         bestMatch = disease;
//       }
//     }

//     if (bestMatch && maxCount > 0) {
//       return `Possible disease: ${bestMatch}. Note: This is not medical advice; consult a doctor.`;
//     } else {
//       return 'No matching disease found. Try entering more symptoms.';
//     }
//   };

//   return (
//     <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, background: 'linear-gradient(to bottom right, #eef6f9, #d6eaf8)', lineHeight: '1.6' }}>
//       <nav style={{ background: 'linear-gradient(90deg, #004080, #0073e6)', color: 'white', padding: '15px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 3px 6px rgba(0,0,0,0.2)' }}>
//         <a href="/" style={{ color: 'white', margin: '0 20px', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.3s ease, transform 0.2s ease' }}>Home</a>
//         <a href="#about" style={{ color: 'white', margin: '0 20px', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.3s ease, transform 0.2s ease' }}>About</a>
//         <a href="#contact" style={{ color: 'white', margin: '0 20px', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.3s ease, transform 0.2s ease' }}>Contact</a>
//       </nav>

//       <section id="diseases" style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
//         <h1 onClick={() => setIsExpanded(!isExpanded)} style={{ textAlign: 'center', color: '#333', fontSize: '2.2em', marginBottom: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'color 0.3s ease' }}>
//           Winter Season Common Diseases {isExpanded ? '▲' : '▼'}
//         </h1>
//         <div className={`diseases-content ${isExpanded ? 'active' : ''}`} style={{ maxHeight: isExpanded ? '1000px' : '0', overflow: 'hidden', transition: 'max-height 0.5s ease-out' }}>
//           <p>Below is a list of common diseases that occur during the winter season, along with their typical symptoms.</p>
//           <ul ref={symptomsRef} style={{ listStyleType: 'disc', paddingLeft: '40px', marginBottom: '20px' }}>
//             <li><strong>Common Cold:</strong> Sneezing, Coughing, Stuffiness, Fatigue</li>
//             <li><strong>Flu (Influenza):</strong> Fever, Achiness, Fatigue</li>
//             <li><strong>COVID-19:</strong> Sore throat, Congestion, Respiratory distress, Extreme fatigue, Body aches</li>
//             <li><strong>RSV:</strong> Wheezing, Coughing, Chest congestion, Decreased appetite, Difficulty breathing</li>
//             <li><strong>Bronchitis:</strong> Achiness, Chills, Fever, Congestion, Wheezing, Labored breathing</li>
//             <li><strong>Pneumonia:</strong> High fever, Sweats, Severe breathing difficulty, Chest pain</li>
//             <li><strong>Pink Eye:</strong> Redness, Itching, Goopy discharge, Light sensitivity</li>
//             <li><strong>Strep Throat:</strong> Fever, Aches, Fatigue, White spots, Headaches, Rash</li>
//             <li><strong>Sinus Infection:</strong> Runny nose, Headaches, Sinus pain, Fever</li>
//             <li><strong>Norovirus:</strong> Nausea, Loss of appetite, Diarrhea</li>
//           </ul>
//         </div>
//       </section>

//       <section id="chatbot" style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
//         <h2 style={{ textAlign: 'center', color: '#004080', fontSize: '1.8em', marginBottom: '15px' }}>Symptom Checker Chatbot</h2>
//         <div className="chat-container" style={{ width: '100%', maxWidth: '700px', background: '#fdfdfd', borderRadius: '10px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', margin: 'auto' }}>
//           <div className="chat-box" style={{ flex: 1, padding: '15px', overflowY: 'auto', borderBottom: '1px solid #ddd', maxHeight: '300px', display: 'flex', flexDirection: 'column' }}>
//             {messages.map((msg, index) => (
//               <div key={index} className={`message ${msg.sender}-message`} style={{
//                 margin: '8px 0',
//                 maxWidth: '75%',
//                 padding: '10px',
//                 borderRadius: '8px',
//                 wordWrap: 'break-word',
//                 background: msg.sender === 'user' ? '#007bff' : '#e9ecef',
//                 color: msg.sender === 'user' ? 'white' : '#333',
//                 alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
//                 borderBottomRightRadius: msg.sender === 'user' ? '0' : '8px',
//                 borderBottomLeftRadius: msg.sender === 'bot' ? '0' : '8px'
//               }}>
//                 {msg.text}
//               </div>
//             ))}
//           </div>
//           <div className="input-area" style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Enter symptoms separated by commas..."
//               style={{ flex: 1, padding: '10px', border: 'none', outline: 'none', fontSize: '16px' }}
//               onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//             />
//             <button onClick={sendMessage} style={{ padding: '10px 15px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px' }}>Send</button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default SymptomChecker;
