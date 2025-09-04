import React, { useState } from 'react';

const SymptomChecker: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const diseases = {
    "Common Cold": ["sneezing", "coughing", "stuffiness", "fatigue"],
    "Flu (Influenza)": ["fever", "achiness", "fatigue"],
    "COVID-19": ["sore throat", "congestion", "respiratory distress", "extreme fatigue", "body aches"],
    "RSV": ["wheezing", "coughing", "chest congestion", "decreased appetite", "difficulty breathing"],
    "Bronchitis": ["achiness", "chills", "fever", "congestion", "wheezing", "labored breathing"],
    "Pneumonia": ["high fever", "sweats", "severe breathing difficulty", "chest pain"],
    "Pink Eye": ["redness", "itching", "goopy discharge", "light sensitivity"],
    "Strep Throat": ["fever", "aches", "fatigue", "white spots", "headaches", "rash"],
    "Sinus Infection": ["runny nose", "headaches", "sinus pain", "fever"],
    "Norovirus": ["nausea", "loss of appetite", "diarrhea"]
  };

  const sendMessage = () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const prediction = predictDisease(input);
      const botMessage = { text: prediction, sender: 'bot' as const };
      setMessages(prev => [...prev, botMessage]);
    }, 600);

    setInput('');
  };

  const predictDisease = (symptomInput: string) => {
    const userSymptoms = symptomInput.toLowerCase().split(',').map(s => s.trim());
    let bestMatch = null;
    let maxCount = 0;

    for (const [disease, symptoms] of Object.entries(diseases)) {
      const count = userSymptoms.filter(userSym => symptoms.some(sym => userSym.includes(sym) || sym.includes(userSym))).length;
      if (count > maxCount) {
        maxCount = count;
        bestMatch = disease;
      }
    }

    if (bestMatch && maxCount > 0) {
      return `Possible disease: ${bestMatch}. Note: This is not medical advice; consult a doctor.`;
    } else {
      return 'No matching disease found. Try entering more symptoms.';
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, background: 'linear-gradient(to bottom right, #eef6f9, #d6eaf8)', lineHeight: '1.6' }}>
      <nav style={{ background: 'linear-gradient(90deg, #004080, #0073e6)', color: 'white', padding: '15px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 3px 6px rgba(0,0,0,0.2)' }}>
        <a href="/" style={{ color: 'white', margin: '0 20px', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.3s ease, transform 0.2s ease' }}>Home</a>
        <a href="#about" style={{ color: 'white', margin: '0 20px', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.3s ease, transform 0.2s ease' }}>About</a>
        <a href="#contact" style={{ color: 'white', margin: '0 20px', textDecoration: 'none', fontWeight: 'bold', transition: 'color 0.3s ease, transform 0.2s ease' }}>Contact</a>
      </nav>

      <section id="diseases" style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
        <h1 onClick={() => setIsExpanded(!isExpanded)} style={{ textAlign: 'center', color: '#333', fontSize: '2.2em', marginBottom: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'color 0.3s ease' }}>
          Winter Season Common Diseases {isExpanded ? '▲' : '▼'}
        </h1>
        <div className={`diseases-content ${isExpanded ? 'active' : ''}`} style={{ maxHeight: isExpanded ? '1000px' : '0', overflow: 'hidden', transition: 'max-height 0.5s ease-out' }}>
          <p>Below is a list of common diseases that occur during the winter season, along with their typical symptoms.</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '40px', marginBottom: '20px' }}>
            <li><strong>Common Cold:</strong> Sneezing, Coughing, Stuffiness, Fatigue</li>
            <li><strong>Flu (Influenza):</strong> Fever, Achiness, Fatigue</li>
            <li><strong>COVID-19:</strong> Sore throat, Congestion, Respiratory distress, Extreme fatigue, Body aches</li>
            <li><strong>RSV:</strong> Wheezing, Coughing, Chest congestion, Decreased appetite, Difficulty breathing</li>
            <li><strong>Bronchitis:</strong> Achiness, Chills, Fever, Congestion, Wheezing, Labored breathing</li>
            <li><strong>Pneumonia:</strong> High fever, Sweats, Severe breathing difficulty, Chest pain</li>
            <li><strong>Pink Eye:</strong> Redness, Itching, Goopy discharge, Light sensitivity</li>
            <li><strong>Strep Throat:</strong> Fever, Aches, Fatigue, White spots, Headaches, Rash</li>
            <li><strong>Sinus Infection:</strong> Runny nose, Headaches, Sinus pain, Fever</li>
            <li><strong>Norovirus:</strong> Nausea, Loss of appetite, Diarrhea</li>
          </ul>
        </div>
      </section>

      <section id="chatbot" style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#004080', fontSize: '1.8em', marginBottom: '15px' }}>Symptom Checker Chatbot</h2>
        <div className="chat-container" style={{ width: '100%', maxWidth: '700px', background: '#fdfdfd', borderRadius: '10px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', margin: 'auto' }}>
          <div className="chat-box" style={{ flex: 1, padding: '15px', overflowY: 'auto', borderBottom: '1px solid #ddd', maxHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}-message`} style={{
                margin: '8px 0',
                maxWidth: '75%',
                padding: '10px',
                borderRadius: '8px',
                wordWrap: 'break-word',
                background: msg.sender === 'user' ? '#007bff' : '#e9ecef',
                color: msg.sender === 'user' ? 'white' : '#333',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                borderBottomRightRadius: msg.sender === 'user' ? '0' : '8px',
                borderBottomLeftRadius: msg.sender === 'bot' ? '0' : '8px'
              }}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="input-area" style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter symptoms separated by commas..."
              style={{ flex: 1, padding: '10px', border: 'none', outline: 'none', fontSize: '16px' }}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} style={{ padding: '10px 15px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px' }}>Send</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SymptomChecker;
