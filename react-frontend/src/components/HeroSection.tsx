import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Heart, Clock, Shield, Crosshair } from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-medical.jpg";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import medicalEquipment from "@/assets/medical-equipment.jpg";
import specialistsGroup from "@/assets/specialists-group.jpg";
import TypingText from "@/components/ui/TypingText";
import { motion } from "framer-motion";

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const navigate = useNavigate();


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

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);

    // getting location using LocationIQ api
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Coordinates:", latitude, longitude); // <-- log lat/lon

        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          console.log("📍 LocationIQ Response:", data); // <-- log full response

          if (data?.display_name) {
            console.log("📍 Resolved Address:", data.display_name); // <-- log address
            setLocation(data.display_name);
          } else {
            alert("Could not fetch address. Try again.");
          }
        } catch (err) {
          console.error("❌ Error fetching location:", err);
          alert("Failed to fetch location.");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("❌ Error getting geolocation:", error);
        alert("Unable to retrieve your location.");
        setLoadingLocation(false);
      }
    );
  };

  return (
    <section className="relative bg-gradient-hero min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-30" : "opacity-0"
              }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <TypingText
              text={slides[currentSlide].title}
              speed={120}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6 leading-tight"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            {/* Feature highlights */}
            {/* <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col items-center lg:items-start"
              >
                <div className="bg-blue-100 p-2 rounded-full mb-2">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Expert Care</span>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col items-center lg:items-start"
              >
                <div className="bg-blue-100 p-2 rounded-full mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">24/7 Service</span>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col items-center lg:items-start"
              >
                <div className="bg-blue-100 p-2 rounded-full mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Secure & Private</span>
              </motion.div>
            </div> */}

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
              <Button
                size="lg"
                className="bg-blue-gradient hover:bg-blue-gradient/90 transition-all duration-300 text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 hover:shadow-glow-blue"
                onClick={() => navigate("/doctor_consultation")}
              >
                <Calendar className="mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                 Book Appointment
              </Button>

              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, x: 7 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#1c5a6a] text-[#1c5a6a] hover:bg-[#56CCF2] hover:text-primary-foreground text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 transition-all hover:border-[#56CCF2] hover:shadow-glow-blue"
                >
                  Emergency Care
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="bg-card/95 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-border order-1 lg:order-2 mt-4 sm:mt-6 lg:mt-8"
          >
            <AnimatedHeading />

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search by doctor name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Location input + Use Current Location */}
              <div className="relative flex gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Enter your location..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <Button
  onClick={handleUseCurrentLocation}
  disabled={loadingLocation}
  className="h-12 px-4 flex items-center gap-2 bg-blue-gradient hover:opacity-90 transition-all duration-300 text-white"
>
  <Crosshair className="h-5 w-5" />
  {loadingLocation ? "Locating..." : "Use"}
</Button>

              </div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="w-full h-12 text-base bg-blue-gradient hover:bg-[#56CCF2] transition-all duration-300 hover:shadow-glow-blue"
                  onClick={() =>
                    navigate(
                      `/doctor_consultation?search=${encodeURIComponent(
                        searchQuery
                      )}&location=${encodeURIComponent(location)}`
                    )
                  }
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search Doctors
                </Button>

              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.5 }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? "bg-primary shadow-lg"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;