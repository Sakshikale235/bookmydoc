import React from 'react';
import { ShieldAlert } from 'lucide-react';


const SeasonalHealth: React.FC = () => {
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
    <section id="seasonal" className="py-10 bg-[#1B4F72] ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ">
        
        {/* Title */}
        <div className="text-center mb-6">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Health Guide
          </h2> */}

           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            AI Health Assistant
          </h2>

          {/* Compact Disease List */}
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              'Common Cold',
              'Flu',
              'Cough',
              'Asthma',
              'Bronchitis',
              'Allergies',
              'Skin Dryness',
              'Sinus Infection',
              'Joint Pain',
              'Low Immunity'
            ].map((disease, idx) => (
              <span
                key={idx}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-700 text-sm hover:border-blue-400 hover:shadow-md transition"
              >
                <ShieldAlert className="h-4 w-4 text-blue-500" />
                <span>{disease}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Ask AI Assistant button */}
        {/* <div className="mt-10 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Need Personalized Advice?
            </h3>
            <p className="text-blue-700 mb-4 text-sm">
              Our AI assistant below can provide personalized health guidance based on your specific symptoms and concerns.
            </p>
            <button 
              onClick={() => smoothScroll('chatbot')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Ask AI Assistant
            </button>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default SeasonalHealth;
