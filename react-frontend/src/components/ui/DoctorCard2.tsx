import React from 'react';
import { MapPin, Clock, Star, Award, Calendar } from 'lucide-react';

interface DoctorCardProps {
  id: number;
  name: string;
  profileImage: string;
  qualification: string;
  specialization: string;
  experience: string;
  clinicAddress: string;
  availabilityHours: string;
  rating: number;
  consultationFee: string;
  nextAvailable: string;
}

const DoctorCard2: React.FC<DoctorCardProps> = ({
  name,
  profileImage,
  qualification,
  specialization,
  experience,
  clinicAddress,
  availabilityHours,
  rating,
  consultationFee,
  nextAvailable,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-w-[380px] max-w-[400px]">
      {/* Doctor Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <img
            src={profileImage}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
          <p className="text-blue-600 font-semibold mb-1">{qualification}</p>
          <div className="flex items-center space-x-1 mb-2">
            <Award className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{specialization}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-700">{rating}</span>
            <span className="text-xs text-gray-500">(234 reviews)</span>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Experience:</span> {experience}
        </p>
      </div>

      {/* Clinic Address */}
      <div className="flex items-start space-x-2 mb-3">
        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-600 line-clamp-2">{clinicAddress}</p>
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="h-4 w-4 text-gray-500" />
        <p className="text-sm text-gray-600">{availabilityHours}</p>
      </div>

      {/* Next Available & Fee */}
      <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Next: {nextAvailable}</span>
        </div>
        <span className="text-lg font-bold text-gray-900">{consultationFee}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
          Book Appointment
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default DoctorCard2;