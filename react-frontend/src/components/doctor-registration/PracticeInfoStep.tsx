import React from 'react';
import { Building, Plus, X } from 'lucide-react';

interface Clinic {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isPrimary: boolean;
}

interface PracticeInfoStepProps {
  clinics: Clinic[];
  handleClinicChange: (index: number, field: string, value: any) => void;
  addClinic: () => void;
  removeClinic: (index: number) => void;
  setPrimaryClinic: (index: number) => void;
}

const PracticeInfoStep: React.FC<PracticeInfoStepProps> = ({
  clinics,
  handleClinicChange,
  addClinic,
  removeClinic,
  setPrimaryClinic,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Building className="w-6 h-6 mr-2" />
        Practice Information
      </h2>

      {clinics.map((clinic, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Clinic/Hospital {index + 1}
              {clinic.isPrimary && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Primary
                </span>
              )}
            </h3>
            <div className="flex space-x-2">
              {!clinic.isPrimary && (
                <button
                  onClick={() => setPrimaryClinic(index)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Set as Primary
                </button>
              )}
              {clinics.length > 1 && (
                <button
                  onClick={() => removeClinic(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic/Hospital Name *
              </label>
              <input
                type="text"
                value={clinic.name}
                onChange={(e) => handleClinicChange(index, 'name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mount Sinai Hospital"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                value={clinic.address}
                onChange={(e) => handleClinicChange(index, 'address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Medical Center Drive"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={clinic.city}
                onChange={(e) => handleClinicChange(index, 'city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="eg. Mumbai"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <input
                type="text"
                value={clinic.state}
                onChange={(e) => handleClinicChange(index, 'state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="eg. Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                value={clinic.pincode}
                onChange={(e) => handleClinicChange(index, 'pincode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="400001"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addClinic}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Another Clinic/Hospital
      </button>
    </div>
  );
};

export default PracticeInfoStep;
