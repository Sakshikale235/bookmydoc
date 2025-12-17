import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import Navigation from '@/components/Navigation';
import SeasonalHealth from '@/components/ui/SeasonalHealth';
import Chatbot from '@/components/ui/Chatbot';
import Footer from '@/components/Footer'; 
import gsap from 'gsap';

const SymptomChecker: React.FC = () =>  {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refs for gsap animations
  const navRef = useRef<HTMLDivElement>(null);
  const seasonalRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const symptomsRef = useRef<HTMLUListElement>(null);
  const chatbotComponentRef = useRef<any>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power3.out" } });

    tl.from(navRef.current, { y: -80, opacity: 0 })
      .from(seasonalRef.current, { y: 50, opacity: 0 }, "-=0.5")
      .from(chatbotRef.current, { scale: 0.8, opacity: 0 }, "-=0.3")
      .from(footerRef.current, { y: 80, opacity: 0 }, "-=0.4");
  }, []);

  useEffect(() => {
    if (symptomsRef.current) {
      gsap.from(symptomsRef.current.children, {
        opacity: 0,
        x: -30,
        stagger: 0.2,
        duration: 0.6,
        ease: "power2.out"
      });

      Array.from(symptomsRef.current.children).forEach((el, idx) => {
        const li = el as HTMLElement;

        li.addEventListener("mouseenter", () => {
          gsap.to(li, {
            scale: 1.05,
            backgroundColor: idx % 2 === 0 ? "#f0f9ff" : "#f0fff4",
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
      <div ref={navRef}>
        <Navigation />
      </div>
      <div id="seasonal" ref={seasonalRef}>
        <SeasonalHealth chatbotRef={chatbotComponentRef} />
      </div>
      <div id="chatbot" ref={chatbotRef}>
        <Chatbot ref={chatbotComponentRef} />
      </div>
      <div ref={footerRef}>
        <Footer />
      </div>
    </div>
  );
}

export default SymptomChecker;