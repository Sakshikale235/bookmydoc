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

  return (
    <div className="min-h-screen bg-[#F0FAFD]">
      {/* add NotificationCenter at top level */}
      <NotificationCenter authId={authId} patientId={patientId} />

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
