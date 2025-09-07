import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-medical.jpg";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import medicalEquipment from "@/assets/medical-equipment.jpg";
import specialistsGroup from "@/assets/specialists-group.jpg";
import TypingText from "@/components/ui/TypingText";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const slides = [
    {
      image: heroImage,
      title: " Your Health, Our Priority",
      subtitle: "Connect with top-rated doctors and specialists in your area"
    },
    {
      image: medicalEquipment,
      title: " Advanced Medical Care",
      subtitle: "State-of-the-art equipment and expert medical professionals"
    },
    {
      image: specialistsGroup,
      title: " Expert Specialists",
      subtitle: "Access to a wide range of medical specialists and healthcare providers"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative bg-gradient-hero min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-30" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6 leading-tight">
              {slides[currentSlide].title}
            </h1> */}
            <TypingText
  text={slides[currentSlide].title}
  speed={120}
  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6 leading-tight"
/>


            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0">
              {slides[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
              <Button
                size="lg"
                className="bg-blue-gradient hover:bg-blue-gradient/90 transition-all duration-300 text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 hover:shadow-glow-blue hover:translate-y-[-5px] active:translate-y-0"
              >
                <Calendar className="mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                Book Appointment
              </Button>
              {/* order-blue-gradient text-blue-gradient hover:bg-[#56CCF2] hover:text-primary-foreground text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 */}
              <Button 
                variant="outline" 
                size="lg"
            
                className="border-[#1c5a6a] text-[#1c5a6a] hover:bg-[#56CCF2] hover:text-primary-foreground text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 transition-all hover:scale-[1.05] hover:border-[#56CCF2] hover:shadow-glow-blue hover:translate-x-[7px] active:translate-x-0"
              >
                Emergency Care
              </Button>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-medical p-4 sm:p-6 lg:p-8 border border-border order-1 lg:order-2 mt-4 sm:mt-6 lg:mt-8 hover:scale-105 hover:-translate-y-2 transition-all duration-300">
            {/* <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 lg:mb-6 text-center">
              Find Your Doctor
            </h3> */}
            <AnimatedHeading />

            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search by doctor name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-border focus:border-primary"
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Enter your location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-12 text-base border-border focus:border-primary"
                />
              </div>
              {/* blue-600 */}
              <Button 
                className="w-full h-12 text-base bg-blue-gradient hover:[#56CCF2] transition-all duration-300 hover:shadow-glow-blue hover:translate-y-[-5px] active:translate-y-0"
              >
                <Search className="mr-2 h-5 w-5" />
                Search Doctors
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-primary shadow-medical" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;