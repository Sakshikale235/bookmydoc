import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Jennifer Martinez",
      location: "New York, NY",
      rating: 5,
      review: "Dr. Johnson saved my life with her exceptional cardiac care. The entire team was professional, caring, and made me feel comfortable throughout my treatment. I couldn't have asked for better medical care.",
      treatment: "Cardiac Surgery",
      doctor: "Dr. Sarah Johnson"
    },
    {
      id: 2,
      name: "David Thompson",
      location: "Los Angeles, CA",
      rating: 5,
      review: "The neurological treatment I received was outstanding. Dr. Chen's expertise and the advanced facilities made all the difference in my recovery. Highly recommend this medical center.",
      treatment: "Neurological Care",
      doctor: "Dr. Michael Chen"
    },
    {
      id: 3,
      name: "Maria Gonzalez",
      location: "Miami, FL",
      rating: 5,
      review: "As a mother, finding the right pediatrician was crucial. Dr. Rodriguez has been amazing with my children, providing excellent care with a gentle and understanding approach.",
      treatment: "Pediatric Care",
      doctor: "Dr. Emily Rodriguez"
    },
    {
      id: 4,
      name: "Robert Kim",
      location: "Chicago, IL",
      rating: 4,
      review: "After my sports injury, Dr. Wilson provided exceptional orthopedic care. The rehabilitation program was comprehensive and I'm back to playing sports stronger than ever.",
      treatment: "Orthopedic Surgery",
      doctor: "Dr. James Wilson"
    },
    {
      id: 5,
      name: "Sarah Davis",
      location: "Houston, TX",
      rating: 5,
      review: "Dr. Thompson's dermatological expertise helped me regain confidence in my skin. The treatment was effective and the staff made every visit comfortable and informative.",
      treatment: "Dermatological Treatment",
      doctor: "Dr. Lisa Thompson"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real patients who experienced exceptional care
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 z-10 bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-medical hidden md:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 z-10 bg-background border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-medical hidden md:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Main Testimonial Card */}
          {/*  <Card className="bg-[#F0FAFD] border-border shadow-testimonial hover:shadow-medical transition-all duration-500"> */}
          <Card className="bg-[#F0FAFD] border-border shadow-2xl border-2 hover:scale-105 hover:-translate-y-2  hover:shadow-medical transition-all duration-500">
            <CardContent className="p-10 md:p-16 text-center">
              {/* Quote Icon */}
              <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Quote className="h-8 w-8 text-white" />
              </div>
              
              {/* Star Rating */}
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Review Text */}
              <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
                "{currentTestimonial.review}"
              </blockquote>
              
              {/* Patient Info */}
              <div className="border-t border-border pt-6">
                <h4 className="text-xl font-semibold text-foreground mb-2">
                  {currentTestimonial.name}
                </h4>
                <p className="text-muted-foreground mb-2">
                  {currentTestimonial.location}
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-primary">
                  <span className="font-medium">{currentTestimonial.treatment}</span>
                  <span className="hidden sm:block">•</span>
                  <span>Treated by {currentTestimonial.doctor}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Navigation */}
          <div className="flex justify-center mt-8 space-x-4 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-muted-foreground">Patient Satisfaction</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">15,000+</div>
            <div className="text-muted-foreground">Happy Patients</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9</div>
            <div className="text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;