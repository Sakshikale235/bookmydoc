import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  GraduationCap, 
  Stethoscope, 
  Clock,
  UserCheck
} from 'lucide-react';
import { Doctor } from '@/types/doctor';

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctor: Doctor) => void;
  onViewProfile: (doctor: Doctor) => void;
}

export const DoctorCardHorizontal: React.FC<DoctorCardProps> = ({ 
  doctor, 
  onBookAppointment, 
  onViewProfile 
}) => {
  const getSpecializationColor = (specialization: string) => {
    const colors = {
      'General Physician': 'bg-blue-50 text-blue-700 border-blue-200',
      'Dermatologist': 'bg-green-50 text-green-700 border-green-200',
      'Gynaecologist': 'bg-purple-50 text-purple-700 border-purple-200',
      'Cardiologist': 'bg-red-50 text-red-700 border-red-200',
      'Neurologist': 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colors[specialization as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'Female' ? '♀' : '♂';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Profile Photo */}
        <div className="flex-shrink-0 self-center sm:self-start">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              {doctor.photo ? (
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=2563eb&color=ffffff&size=112`;
                  }}
                />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=2563eb&color=ffffff&size=112`}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1.5">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="flex-grow space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {doctor.name}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border self-start ${getSpecializationColor(doctor.specialization)}`}>
                {doctor.specialization}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{doctor.gender} {getGenderIcon(doctor.gender)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{doctor.age} years</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{doctor.experience} years experience</span>
              </div>
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Qualifications:</span>
            </div>
            <p className="text-gray-600 text-sm ml-6">{doctor.degree}</p>
          </div>

          {/* Hospital */}
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">{doctor.hospital}</span>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`tel:${doctor.phone}`}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group/contact"
              >
                <Phone className="w-4 h-4 group-hover/contact:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium">{doctor.phone}</span>
              </a>
              <a
                href={`mailto:${doctor.email}`}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group/contact"
              >
                <Mail className="w-4 h-4 group-hover/contact:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium truncate">{doctor.email}</span>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
           {/* <Link to="/book_appointment" className="no-underline"> */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
                      to={`/book_appointment/${doctor.id}`}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </Link>

            <button
              onClick={() => onViewProfile(doctor)}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              <UserCheck className="w-4 h-4" />
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};