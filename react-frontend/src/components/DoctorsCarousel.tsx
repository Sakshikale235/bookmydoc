// import { DoctorCard } from "@/components/ui/DoctorCard";
// import { Button } from "@/components/ui/button";
// import { Star, Award, Clock, MapPin } from "lucide-react";
// import { useState, useEffect } from "react";

// interface Doctor {
//   id: number;
//   name: string;
//   specialty: string;
//   rating: number;
//   experience: string;
//   location: string;
//   distance: string;
//   availableSlots: string[];
//   image: string;
//   consultationFee: number;
//   patients: string;
//   awards?: string;
// }

// const DoctorsCarousel = () => {
//   const famousDoctors = [
//     {
//       id: 1,
//       name: "Dr. Sarah Johnson",
//       specialty: "Cardiologist",
//       rating: 4.9,
//       experience: "15+ years",
//       location: "New York",
//       distance: "2.5 km",
//       availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
//       image: "/doctors/doctor1.jpg",
//       consultationFee: 1500,
//       patients: "2000+"
//     },
//     {
//       id: 2,
//       name: "Dr. Michael Chen",
//       specialty: "Neurologist",
//       rating: 4.8,
//       experience: "12+ years",
//       location: "California",
//       availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
//       patients: "1800+",
//       awards: "Excellence in Neurology",
//        image: "/doctors/doctor1.jpg",
//       consultationFee: 1500,
  
//     },
//     {
//       id: 3,
//       name: "Dr. Emily Rodriguez",
//       specialty: "Pediatrician",
//       rating: 4.9,
//       experience: "10+ years",
//       location: "Texas",
//       availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
//       patients: "2500+",
//       awards: "Top Pediatrician 2023",
//       image: "/doctors/doctor1.jpg",
//       consultationFee: 500,
  
//     },
//     {
//       id: 4,
//       name: "Dr. James Wilson",
//       specialty: "Orthopedic Surgeon",
//       rating: 4.7,
//       experience: "18+ years",
//       location: "Florida",
//       patients: "1500+",
//       availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
//       awards: "Surgical Excellence Award",
//       image: "/doctors/doctor1.jpg",
//       consultationFee: 1500,
  
//     },
//     {
//       id: 5,
//       name: "Dr. Lisa Thompson",
//       specialty: "Dermatologist",
//       rating: 4.8,
//       experience: "14+ years",
//       location: "Illinois",
//       patients: "2200+",
//       availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
//       awards: "Dermatology Innovation Award",
//       image: "/doctors/doctor1.jpg",
//       consultationFee: 1200,
  
//     },
//     {
//       id: 6,
//       name: "Dr. Robert Kumar",
//       specialty: "Oncologist",
//       rating: 4.9,
//       experience: "20+ years",
//       location: "Massachusetts",
//       patients: "1200+",
//       availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
//       awards: "Cancer Care Excellence",
//       image: "/doctors/doctor1.jpg",
//       consultationFee: 2000,
  
//     }
//   ];

//   const handleBookAppointment = (doctor: any) => {
//     // Handle booking logic here
//     console.log("Booking appointment with", doctor.name);
//   };

//   return (
//     // #F0FAFD <section className="py-20 bg-gradient-hero">
//     <section className="py-20 bg-[#F0FAFD]">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
//             Meet Our Famous Doctors
//           </h2>
//           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
//             Renowned specialists with years of experience and thousands of satisfied patients
//           </p>
//         </div>

//         {/* Doctors Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {famousDoctors.map((doctor, index) => (
//             <DoctorCard
//               key={doctor.id}
//               doctor={{
//               id: doctor.id,
//               name: doctor.name,
//               specialty: doctor.specialty,
//               rating: doctor.rating,
//               experience: doctor.experience,
//               location: doctor.location,
//               distance: doctor.distance ?? "",
//               availableSlots: doctor.availableSlots ?? [],
//               image: doctor.image ?? "",
//               consultationFee: doctor.consultationFee ?? 0,
            
//               }}
//               index={index}
//               onBook={() => handleBookAppointment(doctor)}
//             />
//             ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DoctorsCarousel;



import { DoctorCard } from "@/components/ui/DoctorCard";
import { Button } from "@/components/ui/button";
import { Star, Award, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, Variants } from 'framer-motion';

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
  const famousDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      rating: 4.9,
      experience: "15+ years",
      location: "New York",
      distance: "2.5 km",
      availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
      image: "https://www.rawpixel.com/image/15386675/female-indian-doctor-confident-smiling-person",
      consultationFee: 1500,
      patients: "2000+"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      rating: 4.8,
      experience: "12+ years",
      location: "California",
      availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
      patients: "1800+",
      awards: "Excellence in Neurology",
       image: "https://www.rawpixel.com/image/15386689/male-indian-doctor-confident-smiling-person",
      consultationFee: 1500,
  
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrician",
      rating: 4.9,
      experience: "10+ years",
      location: "Texas",
      availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
      patients: "2500+",
      awards: "Top Pediatrician 2023",
      image: "/doctors/doctor1.jpg",
      consultationFee: 500,
  
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialty: "Orthopedic Surgeon",
      rating: 4.7,
      experience: "18+ years",
      location: "Florida",
      patients: "1500+",
      availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
      awards: "Surgical Excellence Award",
      image: "/doctors/doctor1.jpg",
      consultationFee: 1500,
  
    },
    {
      id: 5,
      name: "Dr. Lisa Thompson",
      specialty: "Dermatologist",
      rating: 4.8,
      experience: "14+ years",
      location: "Illinois",
      patients: "2200+",
      availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
      awards: "Dermatology Innovation Award",
      image: "/doctors/doctor1.jpg",
      consultationFee: 1200,
  
    },
    {
      id: 6,
      name: "Dr. Robert Kumar",
      specialty: "Oncologist",
      rating: 4.9,
      experience: "20+ years",
      location: "Massachusetts",
      patients: "1200+",
      availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM"],
      awards: "Cancer Care Excellence",
      image: "/doctors/doctor1.jpg",
      consultationFee: 2000,
  
    }
  ];

  const handleBookAppointment = (doctor: any) => {
    console.log("Booking appointment with", doctor.name);
  };

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
          {famousDoctors.map((doctor, index) => (
            <DoctorCard
              key={doctor.id}
              doctor={{
                id: doctor.id,
                name: doctor.name,
                specialty: doctor.specialty,
                rating: doctor.rating,
                experience: doctor.experience,
                location: doctor.location,
                distance: doctor.distance ?? "",
                availableSlots: doctor.availableSlots ?? [],
                image: doctor.image ?? "",
                consultationFee: doctor.consultationFee ?? 0,
                patients: doctor.patients,
                awards: doctor.awards,
              }}
              index={index}
              onBook={() => handleBookAppointment(doctor)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsCarousel;