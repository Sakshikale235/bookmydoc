import React, { useState } from "react";
import { Search, Filter, Crosshair } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSpecialization: string;
  onSpecializationChange: (value: string) => void;
  specializations: string[];
  location: string; // prop to hold location
  onLocationChange: (value: string) => void;
}

export const SearchBarHorizontal: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSpecialization,
  onSpecializationChange,
  specializations,
  location,
  onLocationChange,
}) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Coordinates:", latitude, longitude);

        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          if (data?.display_name) {
            console.log("📍 Resolved Address:", data.display_name);
            onLocationChange(data.display_name);
          } else {
            alert("Could not fetch address. Try again.");
          }
        } catch (err) {
          console.error("❌ Error fetching location:", err);
          alert("Failed to fetch location.");
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error("❌ Error getting geolocation:", error);
        alert("Unable to retrieve your location.");
        setLoadingLocation(false);
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-3">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 flex gap-2">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by doctor name, specialization, or hospital..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={loadingLocation}
            className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 bg-[#1c5a6a] hover:bg-[#0dbaaf] transition-all"
          >
            <Crosshair className="h-4 w-4" />
            {loadingLocation ? "Locating..." : "Use"}
          </button>
        </div>

        {/* Specialization Filter */}
        <div className="relative sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={selectedSpecialization}
            onChange={(e) => onSpecializationChange(e.target.value)}
            className="block w-full pl-12 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-gray-900 appearance-none bg-white cursor-pointer"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Display */}
      {location && (
        <div className="text-sm text-gray-600 bg-gray-100 rounded-md px-3 py-2">
          📍 Current Location: {location}
        </div>
      )}
    </div>
  );
};
