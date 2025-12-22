import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Award,
  Building,
  FileText,
  CheckCircle,
  Stethoscope
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import BasicInfoStep from '@/components/doctor-registration/BasicInfoStep';
import ProfessionalDetailsStep from '@/components/doctor-registration/ProfessionalDetailsStep';
import PracticeInfoStep from '@/components/doctor-registration/PracticeInfoStep';
import AdditionalSettingsStep from '@/components/doctor-registration/AdditionalSettingsStep';
import backgroundImg from '@/assets/doctor_register.jpg';

interface DoctorFormData {
  // Basic Information
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;

  // Professional Information
  degrees: string[];
  specialization: string;
  registrationNumber: string;
  councilName: string;
  registrationDate: string;
  experience: string;

  // Practice Information
  clinics: Array<{
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isPrimary: boolean;
  }>;

  // Optional Information
  bio: string;
  assistantContact: string;
  homeVisits: boolean;
  autoConfirm: boolean;
  conditions: string[];
  advanceNotice: string;
  feedbackSummary: boolean;
}

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DoctorFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    degrees: [''],
    specialization: '',
    registrationNumber: '',
    councilName: '',
    registrationDate: '',
    experience: '',
    clinics: [{
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isPrimary: true
    }],
    bio: '',
    assistantContact: '',
    homeVisits: false,
    autoConfirm: false,
    conditions: [''],
    advanceNotice: '',
    feedbackSummary: false
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [medicalLicenseFile, setMedicalLicenseFile] = useState<File | null>(null);
  const [medicalCertificatesFile, setMedicalCertificatesFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Professional Details', icon: Award },
    { id: 3, title: 'Practice Information', icon: Building },
    { id: 4, title: 'Additional Settings', icon: FileText }
  ];

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const arr = (prev[field as keyof DoctorFormData] as string[]);
      const newArr = arr.map((item: string, i: number) => (i === index ? value : item));
      return {
        ...prev,
        [field]: newArr
      } as DoctorFormData;
    });
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof DoctorFormData] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof DoctorFormData] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleClinicChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      clinics: prev.clinics.map((clinic, i) =>
        i === index ? { ...clinic, [field]: value } : clinic
      )
    }));
  };

  const addClinic = () => {
    setFormData(prev => ({
      ...prev,
      clinics: [...prev.clinics, {
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isPrimary: false
      }]
    }));
  };

  const removeClinic = (index: number) => {
    if (formData.clinics.length > 1) {
      setFormData(prev => ({
        ...prev,
        clinics: prev.clinics.filter((_, i) => i !== index)
      }));
    }
  };

  const setPrimaryClinic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      clinics: prev.clinics.map((clinic, i) => ({
        ...clinic,
        isPrimary: i === index
      }))
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitAsync = async () => {
    setUploading(true);
    try {
      // Sign up with Supabase Auth (auto-confirm for development)
      const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  alert("You must be logged in to complete registration");
  return;
}

      let profilePhotoUrl: string | null = null;
      let medicalLicenseUrl: string | null = null;
      let medicalCertificatesUrl: string | null = null;

      // Upload profile photo
      if (profilePhotoFile) {
        const ext = profilePhotoFile.name.split('.').pop();
        const fileName = `doctor_${user.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('doctor_photo')
          .upload(fileName, profilePhotoFile, { upsert: false });

        if (uploadError) {
          console.error('Profile photo upload error', uploadError);
          alert('Failed to upload profile photo.');
        } else if (uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from('doctor_photo')
            .getPublicUrl(uploadData.path);
          profilePhotoUrl = publicUrlData.publicUrl || null;
        }
      }

      // Upload medical license
      if (medicalLicenseFile) {
        const ext = medicalLicenseFile.name.split('.').pop();
        const fileName = `license_${user.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('medical_license')
          .upload(fileName, medicalLicenseFile, { upsert: false });

        if (uploadError) {
          console.error('Medical license upload error', uploadError);
          alert('Failed to upload medical license.');
        } else if (uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from('medical_license')
            .getPublicUrl(uploadData.path);
          medicalLicenseUrl = publicUrlData.publicUrl || null;
        }
      }

      // Upload medical certificates
      if (medicalCertificatesFile) {
        const ext = medicalCertificatesFile.name.split('.').pop();
        const fileName = `certificates_${user.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(fileName, medicalCertificatesFile, { upsert: false });

        if (uploadError) {
          console.error('Medical certificates upload error', uploadError);
          alert('Failed to upload medical certificates.');
        } else if (uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from('certificates')
            .getPublicUrl(uploadData.path);
          medicalCertificatesUrl = publicUrlData.publicUrl || null;
        }
      }
      const doctorUpdateData = {
  full_name: formData.fullName,
  phone: formData.mobile || null,
  specialization: formData.specialization,
  qualification: formData.degrees.join(", "),
  experience: formData.experience
    ? Number(formData.experience)
    : null,
  clinic_name: formData.clinics[0]?.name || null,
  location: formData.clinics[0]?.address || null,
  bio: formData.bio || null,
  assistant_contact: formData.assistantContact || null,
  common_conditions: formData.conditions.length
    ? formData.conditions
    : null,
  advance_notice: formData.advanceNotice || null,
  home_visits: formData.homeVisits,
  auto_confirm_appointments: formData.autoConfirm,
  monthly_feedback_summaries: formData.feedbackSummary,
  medical_license: medicalLicenseUrl,
  medical_certificates: medicalCertificatesUrl,
  profile_completed: true,
  ...(profilePhotoUrl && { profile_photo: profilePhotoUrl }),
};

const { error: updateError } = await supabase
  .from("doctors")
  .update(doctorUpdateData)
  .eq("auth_id", user.id);

if (updateError) {
  console.error("Doctor update error:", updateError);
  alert("Could not complete doctor registration");
  return;
}

      alert('Doctor registration successful');
      navigate('/doctor_selfprofile');
    } finally {
      setUploading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && isValidEmail(formData.email) &&
               formData.password && formData.confirmPassword && formData.mobile &&
               formData.password === formData.confirmPassword;
      case 2:
        return formData.degrees.some(d => d.trim()) &&
               formData.specialization &&
               formData.registrationNumber && formData.councilName &&
               formData.registrationDate && formData.experience;
      case 3:
        return formData.clinics.some(c => c.name && c.address && c.city && c.state && c.pincode);
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center py-8"
      style={{ backgroundImage: `url(${backgroundImg})` }} >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as a Doctor</h1>
            <p className="text-gray-600">Join our network of healthcare professionals</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-600 text-center max-w-20">
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-16 h-0.5 bg-gray-200 mx-4 mt-6"></div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData}
              handleInputChange={handleInputChange}
              profilePhotoFile={profilePhotoFile}
              setProfilePhotoFile={setProfilePhotoFile}
            />
          )}

          {currentStep === 2 && (
            <ProfessionalDetailsStep
              formData={formData}
              handleInputChange={handleInputChange}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
              medicalLicenseFile={medicalLicenseFile}
              setMedicalLicenseFile={setMedicalLicenseFile}
              medicalCertificatesFile={medicalCertificatesFile}
              setMedicalCertificatesFile={setMedicalCertificatesFile}
            />
          )}

          {currentStep === 3 && (
            <PracticeInfoStep
              clinics={formData.clinics}
              handleClinicChange={handleClinicChange}
              addClinic={addClinic}
              removeClinic={removeClinic}
              setPrimaryClinic={setPrimaryClinic}
            />
          )}

          {currentStep === 4 && (
            <AdditionalSettingsStep
              formData={formData}
              handleInputChange={handleInputChange}
              handleArrayChange={handleArrayChange}
              addArrayItem={addArrayItem}
              removeArrayItem={removeArrayItem}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitAsync}
                disabled={uploading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorRegistration;
