// components/appointment/DoctorProfileCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Award, DollarSign, Phone, Mail, Building2 } from 'lucide-react';

interface Doctor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  experience: number;
  clinic_name: string;
  consultation_fee: number;
  location: string;
  bio?: string;
}

interface DoctorProfileCardProps {
  doctor: Doctor;
  averageRating?: string;
  totalReviews?: number;
}

export const DoctorProfileCard: React.FC<DoctorProfileCardProps> = ({
  doctor,
  averageRating = '0',
  totalReviews = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden "
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 bg-[#1c5a6a] text-white">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                doctor.full_name
              )}&size=80&background=3b82f6&color=fff&bold=true`}
              alt={doctor.full_name}
              className="w-20 h-20 rounded-full"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{doctor.full_name}</h2>
            <p className="text-blue-100">{doctor.specialization}</p>
            {doctor.qualification && (
              <p className="text-blue-200 text-sm mt-1">{doctor.qualification}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        {totalReviews > 0 && (
          <div className="flex items-center mt-4 space-x-2">
            <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <span className="font-semibold">{averageRating}</span>
            </div>
            <span className="text-blue-100 text-sm">({totalReviews} reviews)</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Bio Section */}
        {doctor.bio && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-1 h-5 bg-blue-600 rounded-full mr-3"></div>
              About
            </h3>
            <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-blue-600 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Experience</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {doctor.experience}+ years
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 text-green-600 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Consultation Fee</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${doctor.consultation_fee}
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 pt-2 border-t">
          <h3 className="font-semibold text-gray-900 flex items-center mb-4">
            <div className="w-1 h-5 bg-blue-600 rounded-full mr-3"></div>
            Contact Information
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Building2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Hospital/Clinic</p>
                <p className="text-gray-900 font-medium">{doctor.clinic_name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Location</p>
                <p className="text-gray-900 font-medium">{doctor.location}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Phone className="w-5 h-5 text-purple-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <a href={`tel:${doctor.phone}`} className="text-gray-900 font-medium hover:text-blue-600">
                  {doctor.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <a href={`mailto:${doctor.email}`} className="text-gray-900 font-medium hover:text-blue-600 break-all">
                  {doctor.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};