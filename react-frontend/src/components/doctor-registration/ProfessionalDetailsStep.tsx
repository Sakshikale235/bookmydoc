import React from 'react';
import { Award, Plus, X } from 'lucide-react';

interface ProfessionalDetailsStepProps {
  formData: {
    degrees: string[];
    specialization: string;
    registrationNumber: string;
    councilName: string;
    registrationDate: string;
    experience: string;
  };
  handleInputChange: (field: string, value: any) => void;
  handleArrayChange: (field: string, index: number, value: string) => void;
  addArrayItem: (field: string) => void;
  removeArrayItem: (field: string, index: number) => void;
  medicalLicenseFile: File | null;
  setMedicalLicenseFile: (file: File | null) => void;
  medicalCertificatesFile: File | null;
  setMedicalCertificatesFile: (file: File | null) => void;
}

const SPECIALIZATION_OPTIONS = [
  'Gyneacologist',
  'General Physician',
  'Dermatologist',
  'Cardiologist',
  'Orthopedic Surgeon'
];

const ProfessionalDetailsStep: React.FC<ProfessionalDetailsStepProps> = ({
  formData,
  handleInputChange,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  medicalLicenseFile,
  setMedicalLicenseFile,
  medicalCertificatesFile,
  setMedicalCertificatesFile,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Award className="w-6 h-6 mr-2" />
        Professional Details
      </h2>

      {/* Medical Degrees */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medical Degrees and Qualifications *
        </label>
        {formData.degrees.map((degree, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={degree}
              onChange={(e) => handleArrayChange('degrees', index, e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., MBBS, MD - Cardiology"
            />
            {formData.degrees.length > 1 && (
              <button
                onClick={() => removeArrayItem('degrees', index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addArrayItem('degrees')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Another Degree
        </button>
      </div>

      {/* Specializations - Changed to dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialization *
        </label>
        <select
          value={formData.specialization}
          onChange={(e) => handleInputChange('specialization', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a specialization</option>
          {SPECIALIZATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Council Registration Number *
          </label>
          <input
            type="text"
            value={formData.registrationNumber}
            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Registration number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name of Registering Council *
          </label>
          <input
            type="text"
            value={formData.councilName}
            onChange={(e) => handleInputChange('councilName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Medical Council of India"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registration Date *
          </label>
          <input
            type="date"
            value={formData.registrationDate}
            onChange={(e) => handleInputChange('registrationDate', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience *
          </label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="15"
            min="0"
          />
        </div>
      </div>

      {/* File Uploads */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical License *
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setMedicalLicenseFile(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {medicalLicenseFile && (
            <p className="text-sm text-gray-600 mt-1">{medicalLicenseFile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medical Certificates *
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setMedicalCertificatesFile(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {medicalCertificatesFile && (
            <p className="text-sm text-gray-600 mt-1">{medicalCertificatesFile.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Group all certificates in one PDF file
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetailsStep;
