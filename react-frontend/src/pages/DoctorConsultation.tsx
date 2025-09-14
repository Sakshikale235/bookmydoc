import React, { useState, useMemo } from 'react';
import { Heart, Users, MapPin, Phone } from 'lucide-react';
import { DoctorCardHorizontal } from '@/components/ui/DoctorCardHorizontal';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { SearchBarHorizontal } from '@/components/ui/SearchBarHorizontal';
import { doctorsData } from '@/data/doctors';
import { Doctor } from '@/types/doctor';

const DoctorConsultation: React.FC = () =>  {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  // Get unique specializations for filter
  const specializations = useMemo(() => {
    return Array.from(new Set(doctorsData.map(doctor => doctor.specialization))).sort();
  }, []);

  // Filter doctors based on search criteria
  const filteredDoctors = useMemo(() => {
    return doctorsData.filter(doctor => {
      const matchesSearch = searchTerm === '' || 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialization = selectedSpecialization === '' || 
        doctor.specialization === selectedSpecialization;
      
      return matchesSearch && matchesSpecialization;
    });
  }, [searchTerm, selectedSpecialization]);

  const handleBookAppointment = (doctor: Doctor) => {
    alert(`Booking appointment with ${doctor.name}. This would typically open a booking modal or redirect to a booking page.`);
  };

  const handleViewProfile = (doctor: Doctor) => {
    alert(`Viewing profile for ${doctor.name}. This would typically show detailed doctor information.`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSpecializationChange = (value: string) => {
    setSelectedSpecialization(value);
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Navigation />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Your Doctor</h1>
                <p className="text-gray-600 text-sm sm:text-base">Discover trusted healthcare professionals near you</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="hidden sm:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span>{doctorsData.length}+ Doctors</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Multiple Locations</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4 text-purple-600" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBarHorizontal
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedSpecialization={selectedSpecialization}
            onSpecializationChange={handleSpecializationChange}
            specializations={specializations}
          />
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
            {filteredDoctors.length === 0 ? 'No doctors found' : 
             filteredDoctors.length === 1 ? '1 Doctor Available' : 
             `${filteredDoctors.length} Doctors Available`}
          </h2>
          {(searchTerm || selectedSpecialization) && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedSpecialization && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                  {selectedSpecialization}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Doctor Cards */}
        {filteredDoctors.length > 0 ? (
          <div className="space-y-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCardHorizontal
                key={doctor.id}
                doctor={doctor}
                onBookAppointment={handleBookAppointment}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all available doctors.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialization('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>


<Footer/>

      {/* Footer */}
      {/* <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2025 Find Your Doctor. Connecting patients with trusted healthcare professionals.
            </p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}

export default DoctorConsultation;