import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SpecialistsCarousel from "@/components/SpecialistsCarousel";
import DoctorsCarousel from "@/components/DoctorsCarousel";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import Footer from "@/components/Footer";
import NotificationCenter from "@/components/NotificationCenter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const Index = () => {
  const [authId, setAuthId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      setAuthId(user?.id ?? null);

      if (user?.id) {
        const { data: patientData } = await supabase
          .from("patients")
          .select("id")
          .eq("auth_id", user.id)
          .single();

        setPatientId(patientData?.id ?? null);
      }
    })();
  }, []);

  useEffect(() => {
    const onToggle = () => setNotifOpen((s) => !s);
    // if panel opened we should stop bell shake; emit small event so bell can stop if needed
    const onOpen = () => {
      // nothing else required here, panel open state will stop shaking automatically (nav listens to shake events only)
    };

    window.addEventListener("bm_notify_toggle", onToggle);
    window.addEventListener("bm_notify_new", onOpen);

    return () => {
      window.removeEventListener("bm_notify_toggle", onToggle);
      window.removeEventListener("bm_notify_new", onOpen);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F0FAFD]">
      <NotificationCenter authId={authId} patientId={patientId} open={notifOpen} onRequestClose={() => setNotifOpen(false)} />

      <Navigation />
      <HeroSection />
      <SpecialistsCarousel />
      <DoctorsCarousel />
      <TestimonialsCarousel />
      <Footer />
    </div>
  );
};

export default Index;
