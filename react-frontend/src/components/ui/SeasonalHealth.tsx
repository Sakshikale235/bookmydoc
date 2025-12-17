import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ShieldAlert } from "lucide-react";

interface SeasonalHealthProps {
  chatbotRef?: React.RefObject<any>;
}

const SeasonalHealth: React.FC<SeasonalHealthProps> = ({ chatbotRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const smoothScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const pills = containerRef.current.querySelectorAll(".disease-pill");

      pills.forEach((pill) => {
        pill.addEventListener("mouseenter", () => {
          gsap.to(pill, {
            scale: 1.1,
            y: -6,
            borderColor: "#3B82F6", // blue-500
            boxShadow: "0px 6px 15px rgba(59,130,246,0.3)",
            duration: 0.3,
            ease: "power2.out",
          });
        });

        pill.addEventListener("mouseleave", () => {
          gsap.to(pill, {
            scale: 1,
            y: 0,
            borderColor: "#E5E7EB", // gray-200
            boxShadow: "0px 0px 0px rgba(0,0,0,0)",
            duration: 0.3,
            ease: "power2.inOut",
          });
        });
      });
    }
  }, []);

  return (
    <section id="seasonal" className="py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            AI Health Assistant
          </h2>

          {/* Disease List */}
          <div
            ref={containerRef}
            className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
          >
            {[
              "Common Cold",
              "Flu",
              "Cough",
              "Asthma",
              "Fever",
              "Allergies",
              "Skin Dryness",
              "Sinus Infection",
              "Joint Pain",
              "Skin Rashes",
            ].map((disease, idx) => (
              <span
                key={idx}
                className="disease-pill flex items-center space-x-1 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-gray-700 text-sm cursor-pointer transition-all duration-200"
                onClick={() => {
                  if (chatbotRef?.current?.sendDiseaseMessage) {
                    chatbotRef.current.sendDiseaseMessage(disease);
                  }
                  // Scroll to chatbot
                  const chatbot = document.getElementById("chatbot-container");
                  if (chatbot) {
                    window.scrollTo({
                      top: chatbot.offsetTop - 80,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <ShieldAlert className="h-4 w-4 text-blue-500" />
                <span>{disease}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonalHealth;
