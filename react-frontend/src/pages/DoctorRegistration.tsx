import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Building, 
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  X,
  Stethoscope
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface DoctorFormData {
  // Basic Information
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  
  // Professional Information
  degrees: string[];
  specializations: string[];
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
    specializations: [''],
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
  const [uploading, setUploading] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Professional Details', icon: Award },
    { id: 3, title: 'Practice Information', icon: Building },
    { id: 4, title: 'Additional Settings', icon: FileText }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const arr = (prev as any)[field] as any[];
      const newArr = arr.map((item: any, i: number) => (i === index ? value : item));
      return {
        ...prev,
        [field]: newArr
      } as unknown as DoctorFormData;
    });
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof DoctorFormData] as any[], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof DoctorFormData] as any[]).filter((_, i) => i !== index)
    }));
  };

  const handleClinicChange = (index: number, field: string, value: any) => {
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

  const handleSubmit = () => {
    // noop - replaced by async handler below
    return;
  };

  const handleSubmitAsync = async () => {
    setUploading(true);
    try {
      // ensure user signed in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        alert('Please sign in before registering as a doctor.');
        return;
      }

      let profilePhotoUrl: string | null = null;

      if (profilePhotoFile) {
        // upload to 'profile-photos' bucket
        const ext = profilePhotoFile.name.split('.').pop();
        const fileName = `doctor_${user.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('doctor_photo')
          .upload(fileName, profilePhotoFile, { upsert: false });

        if (uploadError) {
          console.error('Upload error', uploadError);
          alert('Failed to upload profile photo.');
        } else if (uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from('doctor_photo')
            .getPublicUrl(uploadData.path);
          profilePhotoUrl = publicUrlData.publicUrl || null;
        }
      }

      // build insert payload, include profile_photo only if available
      const doctorData: any = {
        auth_id: user.id,
        full_name: formData.fullName,
        email: formData.email || null,
        phone: formData.mobile || null,
        specialization: formData.specializations.join(', '),
        qualification: formData.degrees.join(', '),
        experience: formData.experience ? Number(formData.experience) : null,
        clinic_name: formData.clinics[0]?.name || null,
        consultation_fee: null,
        location: formData.clinics[0]?.address || null,
        bio: formData.bio || null,
        assistant_contact: formData.assistantContact || null,
        common_conditions: formData.conditions && formData.conditions.length ? formData.conditions : null,
        advance_notice: formData.advanceNotice || null,
        home_visits: formData.homeVisits,
        auto_confirm_appointments: formData.autoConfirm,
        monthly_feedback_summaries: formData.feedbackSummary
      };
      if (profilePhotoUrl) doctorData.profile_photo = profilePhotoUrl;

      console.log('Doctor insert payload:', doctorData);
      const { error: insertError } = await supabase.from('doctors').insert([doctorData]);

      if (insertError) {
        console.error('Insert doctor error:', insertError);
        alert('Could not save profile. Please try again.');
        return;
      }

      alert('Doctor registration successful');
      navigate('/doctor_selfprofile');
    } finally {
      setUploading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.password && 
               formData.confirmPassword && formData.mobile && 
               formData.password === formData.confirmPassword;
      case 2:
        return formData.degrees.some(d => d.trim()) && 
               formData.specializations.some(s => s.trim()) &&
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (as per medical registration) *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. John Smith"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 XXXXX-XXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="doctor@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a strong password"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                  )}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePhotoFile(e.target.files ? e.target.files[0] : null)}
                    />
                    {profilePhotoFile && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(profilePhotoFile)}
                          alt="preview"
                          className="w-24 h-24 object-cover rounded-full border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Details</h2>
              
              {/* Medical Degrees */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Degrees and Specializations *
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

              {/* Specializations */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations *
                </label>
                {formData.specializations.map((spec, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => handleArrayChange('specializations', index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Interventional Cardiology"
                    />
                    {formData.specializations.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('specializations', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('specializations')}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Another Specialization
                </button>
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
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Information</h2>
              
              {formData.clinics.map((clinic, index) => (
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
                      {formData.clinics.length > 1 && (
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
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio (50-100 words)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide a brief professional bio highlighting your expertise and approach to patient care..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assistant/Receptionist Contact (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.assistantContact}
                    onChange={(e) => handleInputChange('assistantContact', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact number for patient queries"
                  />
                </div>

                {/* Common Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Common Medical Conditions You Handle
                  </label>
                  {formData.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={condition}
                        onChange={(e) => handleArrayChange('conditions', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Hypertension, Diabetes"
                      />
                      {formData.conditions.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('conditions', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addArrayItem('conditions')}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Another Condition
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Notice Required (e.g., 24 hours)
                  </label>
                  <input
                    type="text"
                    value={formData.advanceNotice}
                    onChange={(e) => handleInputChange('advanceNotice', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="24 hours"
                  />
                </div>

                {/* Toggle Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Home Visits</h3>
                      <p className="text-sm text-gray-600">Do you conduct home visits?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.homeVisits}
                        onChange={(e) => handleInputChange('homeVisits', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Auto-Confirm Appointments</h3>
                      <p className="text-sm text-gray-600">Enable automatic appointment confirmation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.autoConfirm}
                        onChange={(e) => handleInputChange('autoConfirm', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Monthly Feedback Summaries</h3>
                      <p className="text-sm text-gray-600">Receive monthly feedback to improve service</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.feedbackSummary}
                        onChange={(e) => handleInputChange('feedbackSummary', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
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