import { DoctorCard } from "@/components/ui/DoctorCard";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  distance: string;
  availableSlots: string[];
  image: string;
  consultationFee: number;
  patients: string;
  awards?: string;
}

const DoctorsCarousel = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real doctors from Supabase
  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .not("full_name", "is", null); // Only real doctors

    if (error) {
      console.error("Error loading doctors:", error);
      setLoading(false);
      return;
    }

    // Shuffle doctors randomly
    const shuffled = data.sort(() => Math.random() - 0.5);

    // Take only 9 doctors
    const limited = shuffled.slice(0, 9);

    // Map Supabase doctor fields → match UI format
    const formatted = limited.map((doc: any) => ({
      id: doc.id,
      name: doc.full_name || doc.name,
      specialty: doc.specialty || "General Physician",
      rating: doc.rating || 4.8,
      experience: doc.experience || "5+ years",
      location: doc.location || "Your City",
      distance: "",
      availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
      image: doc.image_url || "/doctors/doctor1.jpg",
      consultationFee: doc.consultation_fee || 500,
      patients: doc.patients || "1000+",
      awards: doc.awards || ""
    }));

    setDoctors(formatted);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-[#F0FAFD]">
        <div className="text-center text-lg text-muted-foreground">
          Loading doctors...
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#F0FAFD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Meet Our Famous Doctors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Renowned specialists with years of experience and thousands of satisfied patients
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              index={index}
              onBook={() => {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsCarousel;
