import React from 'react';
import { MapPin, Clock, DollarSign, Calendar, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Doctor {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  specialization: string;
  qualification?: string;
  experience: number;
  clinic_name: string;
  consultation_fee: number;
  location: string;
  bio?: string;
  latitude?: number;
  longitude?: number;
}

interface DoctorCardHorizontalProps {
  doctor: Doctor;
  onBookAppointment?: (doctor: Doctor) => void;
  onViewProfile?: (doctor: Doctor) => void;
}

export const DoctorCardHorizontal: React.FC<DoctorCardHorizontalProps> = ({
  doctor,
  onBookAppointment,
  onViewProfile
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - Doctor Image & Basic Info */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.full_name)}&size=128&background=3b82f6&color=fff&bold=true`}
                alt={doctor.full_name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                {doctor.experience}+ Years
              </div>
            </div>
          </div>

          {/* Middle Section - Doctor Details */}
          <div className="flex-grow space-y-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {doctor.full_name}
              </h3>
              <p className="text-blue-600 font-semibold text-lg">
                {doctor.specialization}
              </p>
              {doctor.qualification && (
                <p className="text-gray-600 text-sm mt-1">
                  {doctor.qualification}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                <span className="text-sm truncate">{doctor.clinic_name}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-orange-600 flex-shrink-0" />
                <span className="text-sm truncate">{doctor.location}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Award className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0" />
                <span className="text-sm">{doctor.experience} years experience</span>
              </div>

              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                <span className="text-sm font-semibold text-green-700">
                  ${doctor.consultation_fee}
                </span>
              </div>
            </div>

            {doctor.bio && (
              <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                {doctor.bio}
              </p>
            )}

            {/* Rating/Reviews placeholder */}
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <span className="text-gray-600 text-sm ml-2">(4.9)</span>
            </div>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex flex-col justify-center space-y-3 lg:min-w-[180px]">
            <Link
               to={`/book_appointment/${doctor.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
            </Link>
            
            <button
              onClick={() => onViewProfile?.(doctor)}
              className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold text-center transition-all duration-200 hover:border-blue-600 hover:text-blue-600"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};