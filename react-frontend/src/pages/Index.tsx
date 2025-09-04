import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import SpecialistsCarousel from "@/components/SpecialistsCarousel";
import DoctorsCarousel from "@/components/DoctorsCarousel";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F0FAFD]">
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
