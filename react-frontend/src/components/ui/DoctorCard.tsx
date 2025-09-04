 import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Video, Calendar } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  distance?: string;
  availableSlots: string[];
  image: string;
  consultationFee: number;
  patients?: string;
  awards?: string;
}

interface doctorcardprops {
  doctor: Doctor;
  index: number;
  onBook: () => void;
}

export const DoctorCard: React.FC<doctorcardprops> = ({ doctor, index, onBook }) => {
  return (
    <motion.div
      className="dashboard-card bg-white rounded-2xl shadow-md border border-2 border-gray-200 overflow-hidden hover:shadow-lg hover:scale-105 hover:-translate-y-2 transform transition-all duration-500"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.2 }}
      // whileHover={{ y: -10 }}
      whileHover={{ scale: 1.05, y: -10, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
    >
      {/* Doctor Image & Basic Info */}
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          <motion.img
            src={doctor.image}
            alt={doctor.name}
            className="w-16 h-16 rounded-xl object-cover"
            whileHover={{ scale: 1.05 }}
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
            <p className="text-blue-600 font-medium">{doctor.specialty}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{doctor.rating}</span>
              </div>
              <span className="text-sm text-gray-600">{doctor.experience}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Distance */}
      <div className="px-6 pb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{doctor.location}</span>
          {doctor.distance && <span className="text-sm text-blue-600 font-medium">{doctor.distance}</span>}
        </div>
      </div>

      {/* Available Slots */}
      <div className="px-6 pb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Available Today</p>
        <div className="flex flex-wrap gap-2">
          {doctor.availableSlots.slice(0, 3).map((slot, idx) => (
            <motion.span
              key={slot}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index * 0.1) + (idx * 0.05) }}
            >
              {slot}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Consultation Fee */}
      <div className="px-6 pb-4">
        <p className="text-lg font-semibold text-gray-900">
          ₹{doctor.consultationFee} <span className="text-sm font-normal text-gray-600">consultation</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-12 pb-12 flex space-x-3">
        {/* className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2" */}
        <motion.button
          className="flex-1 bg-[#2D9CDB] bg-blue-gradient text-white py-3 rounded-xl font-medium hover:bg-[#56CCF2] transition-colors duration-200 flex items-center hover:shadow-glow-blue hover:translate-y-[-5px] active:translate-y-0 justify-center space-x-2"
          onClick={onBook}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Calendar className="h-4 w-4" />
          <span>Book</span>
        </motion.button>
        {/* <motion.button
          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Video className="h-4 w-4" />
          <span>Video</span>
        </motion.button> */}
      </div>
    </motion.div>
  );
};

export default DoctorCard;

