import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { Message } from '@/types';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI health assistant. I can help you with information about symptoms, general health advice, and seasonal health concerns. How can I assist you today?',
      sender: 'ai', 
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Auto-scroll only inside chat window
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return; // skip initial scroll
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Simulate AI responses
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('cough') || message.includes('cold')) {
      return 'For cough and cold symptoms, I recommend staying hydrated, getting plenty of rest, and using a humidifier. If symptoms persist for more than 7-10 days or worsen, please consult a healthcare professional.';
    }
    
    if (message.includes('fever') || message.includes('temperature')) {
      return 'Fever is often a sign that your body is fighting an infection. Stay hydrated, rest, and monitor your temperature. If fever exceeds 103°F (39.4°C) or persists for more than 3 days, seek medical attention immediately.';
    }
    
    return 'Thank you for your question. For specific medical concerns, I always recommend consulting with a qualified healthcare professional.';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputText),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="chatbot" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
         
          <p className="text-lg text-gray-600">
            Get instant answers to your health questions from our AI-powered assistant
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-6 space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#2D9CDB] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-md rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>

                {message.sender === 'user' && (
                  <div className="bg-gray-300 rounded-full p-2 flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 rounded-full p-2 flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white text-gray-800 shadow-md px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about symptoms, prevention, or health concerns..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="bg-[#2D9CDB] text-white p-3 rounded-xl hover:bg-[#56CCF2] transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isTyping ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                This AI assistant provides general health information only. Always consult a healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Quick Questions
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'What are winter allergy symptoms?',
              'How to prevent dry skin?',
              'Winter exercise tips',
              'Vitamin D deficiency signs'
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputText(question);
                  inputRef.current?.focus();
                }}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 text-sm"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Find Doctors Button */}
          <div className="mt-8 text-center">
            <button className="bg-[#2D9CDB] text-white px-6 py-3 rounded-lg hover:bg-[#56CCF2] transition-colors duration-200 font-medium">
              Find Doctors
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chatbot;
