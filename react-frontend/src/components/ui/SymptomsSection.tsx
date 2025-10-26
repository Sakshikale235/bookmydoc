import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Upload, Eye, FileText } from "lucide-react";
import jarIcon from "../../assets/jar.png";
import { Modal } from "./Modal";
import ChatHistory from "./ChatHistory";

interface PatientProfile {
  id?: number;
  auth_id: string;
  short_term_disease?: string | null;
  long_term_disease?: string | null;
}

interface SymptomsSectionProps {
  user: PatientProfile | null;
}

const SymptomsSection: React.FC<SymptomsSectionProps> = ({ user }) => {
  const [shortTermPdf, setShortTermPdf] = useState<string | null>(null);
  const [longTermPdf, setLongTermPdf] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'short' | 'long' | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shortTermInputRef = useRef<HTMLInputElement>(null);
  const longTermInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.short_term_disease) {
      setShortTermPdf(user.short_term_disease);
    }
    if (user?.long_term_disease) {
      setLongTermPdf(user.long_term_disease);
    }
  }, [user]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'short' | 'long'
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    setUploading(type);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id || user.auth_id}-${Date.now()}.${fileExt}`;
      const bucketName = type === 'short' ? 'short_term_diseases' : 'long_term_diseases';
      const columnName = type === 'short' ? 'short_term_disease' : 'long_term_disease';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error('Could not get public URL');

      const { error: updateError } = await supabase
        .from('patients')
        .update({ [columnName]: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (type === 'short') {
        setShortTermPdf(publicUrl);
      } else {
        setLongTermPdf(publicUrl);
      }

      alert('PDF uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading PDF. Please try again.');
    } finally {
      setUploading(null);
      // Reset file input
      if (type === 'short' && shortTermInputRef.current) {
        shortTermInputRef.current.value = '';
      } else if (type === 'long' && longTermInputRef.current) {
        longTermInputRef.current.value = '';
      }
    }
  };

  const handleViewPdf = (pdfUrl: string) => {
    setViewingPdf(pdfUrl);
    setIsModalOpen(true);
  };

  const shortTermDiseases = [
    "Cold & Cough",
    "Viral Fever or Flu",
    "Headache",
    "Sore Throat",
    "Allergies",
    "Food Poisoning",
    "Stomach Infection",
    "Migraine"
  ];

  const longTermDiseases = [
    "Diabetes",
    "Hypertension",
    "Skin Disease",
    "Asthma",
    "Arthritis",
    "Heart, Kidney, Liver Disease",
    "Thyroid Disorder",
    "Cancer"
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
        {/* Short-term Diseases */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Short-term Diseases
          </h3>
          <div className="space-y-2 mb-4">
            {shortTermDiseases.map((disease) => (
              <div key={disease} className="text-sm text-gray-700 bg-white p-2 rounded-lg">
                • {disease}
              </div>
            ))}
          </div>

          {/* Short-term PDF Upload/View */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Medical Reports</span>
              <img src={jarIcon} alt="Jar" className="w-8 h-8" />
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".pdf"
                ref={shortTermInputRef}
                onChange={(e) => handleFileUpload(e, 'short')}
                className="hidden"
              />
              <button
                onClick={() => shortTermInputRef.current?.click()}
                disabled={uploading === 'short'}
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploading === 'short' ? 'Uploading...' : 'Edit'}
              </button>
              {shortTermPdf && (
                <button
                  onClick={() => handleViewPdf(shortTermPdf)}
                  className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Long-term Diseases */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-red-600" />
            Long-term Diseases
          </h3>
          <div className="space-y-2 mb-4">
            {longTermDiseases.map((disease) => (
              <div key={disease} className="text-sm text-gray-700 bg-white p-2 rounded-lg">
                • {disease}
              </div>
            ))}
          </div>

          {/* Long-term PDF Upload/View */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Medical Reports</span>
              <img src={jarIcon} alt="Jar" className="w-8 h-8" />
            </div>
            <div className="flex space-x-2">
              <input
                type="file"
                accept=".pdf"
                ref={longTermInputRef}
                onChange={(e) => handleFileUpload(e, 'long')}
                className="hidden"
              />
              <button
                onClick={() => longTermInputRef.current?.click()}
                disabled={uploading === 'long'}
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploading === 'long' ? 'Uploading...' : 'Edit'}
              </button>
              {longTermPdf && (
                <button
                  onClick={() => handleViewPdf(longTermPdf)}
                  className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Chat History */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat History with Health Assistant</h2>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <ChatHistory />
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Medical Report"
        size="xl"
      >
        <div className="w-full h-full h-[400vh]">
          {viewingPdf && (
            <iframe
              src={viewingPdf}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SymptomsSection;
