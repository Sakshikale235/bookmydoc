import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Baby, Eye, Bone, Scissors, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useTransform, useViewportScroll } from 'framer-motion';
import { useState, useEffect } from "react";

const SpecialistsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1; // mobile
      if (window.innerWidth < 768) return 2; // tablet
      if (window.innerWidth < 1024) return 3; // small desktop
    }
    return 4; // large desktop
  };

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(getItemsPerView());
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const specialists = [
    {
      id: 1,
      name: "Cardiology",
      icon: Heart,
      description: "Heart and cardiovascular system specialists",
      doctorsCount: "25+ Doctors",
      color: "text-red-500"
    },
    {
      id: 2,
      name: "Neurology",
      icon: Brain,
      description: "Brain and nervous system experts",
      doctorsCount: "18+ Doctors",
      color: "text-purple-500"
    },
    {
      id: 3,
      name: "Pediatrics",
      icon: Baby,
      description: "Child healthcare specialists",
      doctorsCount: "30+ Doctors",
      color: "text-pink-500"
    },
    {
      id: 4,
      name: "Ophthalmology",
      icon: Eye,
      description: "Eye care and vision specialists",
      doctorsCount: "15+ Doctors",
      color: "text-blue-500"
    },
    {
      id: 5,
      name: "Orthopedics",
      icon: Bone,
      description: "Bone and joint specialists",
      doctorsCount: "22+ Doctors",
      color: "text-orange-500"
    },
    {
      id: 6,
      name: "Surgery",
      icon: Scissors,
      description: "General and specialized surgery",
      doctorsCount: "20+ Doctors",
      color: "text-green-500"
    }
  ];

  const maxIndex = Math.max(0, specialists.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  return (
    // #F0FAFD  <section className="py-16 bg-background">
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Medical Specialties
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive healthcare services with expert specialists in every field
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-medical hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-medical hidden sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform w-100 duration-500 ease-in-out"
              style={{ transform: `translateX(-${(currentIndex * 100) / itemsPerView}%)` }}
            >
              {specialists.map((specialist) => {
                const IconComponent = specialist.icon;
                return (
                  <div key={specialist.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 px-2 lg:px-3">
                    {/* bg-[#f0fafd]/100 */}
                     <Card className="bg-[#F0FAFD] border-border shadow-card hover:shadow-medical transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer h-full">
                       <CardContent className="p-4 sm:p-5 lg:p-6 text-center h-full flex flex-col justify-between">
                         <div>
                           <div className="bg-gradient-primary rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                             <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                           </div>
                           
                           <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                             {specialist.name}
                           </h3>
                           
                           <p className="text-muted-foreground text-xs sm:text-sm mb-3 line-clamp-2">
                             {specialist.description}
                           </p>
                        
                           <div className="flex items-center justify-center space-x-2 text-primary font-medium text-xs sm:text-sm mb-3 lg:mb-4">
                             <span>{specialist.doctorsCount}</span>
                           </div>
                         </div>
                         
                         <Button 
                           size="sm" 
                           className="w-full bg-[#2D9CDB] hover:shadow-medical transition-all hover:bg-[#56CCF2] duration-300 text-xs sm:text-sm"
                         >
                           View Doctors
                         </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex justify-center mt-6 space-x-4 sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-primary shadow-medical" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialistsCarousel;