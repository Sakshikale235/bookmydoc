import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSpecialization: string;
  onSpecializationChange: (value: string) => void;
  specializations: string[];
}

export const SearchBarHorizontal: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSpecialization,
  onSpecializationChange,
  specializations,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
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
    </div>
  );
};