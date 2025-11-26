import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { Upload, Eye, FileText } from "lucide-react";
import jarIcon from "../../assets/jar.png";
import { Modal } from "./Modal";
import ChatHistory from "./ChatHistory";

interface PatientProfile {
  id?: string;
  auth_id: string;
  short_term_disease?: string | null;
  long_term_disease?: string | null;
}

interface SymptomsSectionProps {
  user: PatientProfile | null;
}

interface PdfEntry {
  id: string;
  url: string;
}

const SymptomsSection: React.FC<SymptomsSectionProps> = ({ user }) => {
  const [uploading, setUploading] = useState<'short' | 'long' | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shortTermPdfs, setShortTermPdfs] = useState<PdfEntry[]>([]);
  const [longTermPdfs, setLongTermPdfs] = useState<PdfEntry[]>([]);

  const shortTermInputRef = useRef<HTMLInputElement>(null);
  const longTermInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedicalHistory();
  }, [user]);

  // -----------------------------
  // Fetch PDFs from medical_history table
  // -----------------------------
  const fetchMedicalHistory = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("medical_history")
      .select("*")
      .eq("patient_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setShortTermPdfs(
      data
        .filter((d) => d.short_term_pdf_url)
        .map((d) => ({ id: d.id, url: d.short_term_pdf_url }))
    );

    setLongTermPdfs(
      data
        .filter((d) => d.long_term_pdf_url)
        .map((d) => ({ id: d.id, url: d.long_term_pdf_url }))
    );
  };

  // -----------------------------
  // Handle PDF upload
  // -----------------------------
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'short' | 'long'
  ) => {
    const files = event.target.files;
    if (!files || !user?.id) return;

    setUploading(type);

    const bucketName = type === 'short' ? 'short_term_diseases' : 'long_term_diseases';

    try {
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          alert("Only PDF files allowed.");
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random()}.${fileExt}`;

        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        // Insert into medical_history table
        await supabase.from("medical_history").insert([
          {
            patient_id: user.id,
            short_term_pdf_url: type === 'short' ? publicUrlData.publicUrl : null,
            long_term_pdf_url: type === 'long' ? publicUrlData.publicUrl : null,
            uploaded_at: new Date()
          }
        ]);
      }

      alert("PDF(s) uploaded successfully!");
      fetchMedicalHistory();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading PDFs");
    } finally {
      setUploading(null);
      if (type === 'short' && shortTermInputRef.current) shortTermInputRef.current.value = '';
      if (type === 'long' && longTermInputRef.current) longTermInputRef.current.value = '';
    }
  };

  // -----------------------------
  // Delete PDF
  // -----------------------------
  const handleDeletePdf = async (id: string, url: string, type: 'short' | 'long') => {
    const bucketName = type === 'short' ? 'short_term_diseases' : 'long_term_diseases';
    const path = url.split("/storage/v1/object/public/")[1];

    try {
      // Delete from storage
      await supabase.storage.from(bucketName).remove([path]);

      // Delete from DB
      await supabase.from("medical_history").delete().eq("id", id);

      // Refresh list
      fetchMedicalHistory();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting PDF");
    }
  };

  // -----------------------------
  // Render PDF list
  // -----------------------------
  const renderPdfList = (pdfs: PdfEntry[], type: 'short' | 'long') => (
    <div className="mt-2 space-y-2">
      {pdfs.map((pdf) => (
        <div key={pdf.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
          <span className="truncate">{pdf.url.split('/').pop()}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => { setViewingPdf(pdf.url); setIsModalOpen(true); }}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded"
            >
              View
            </button>
            <button
              onClick={() => handleDeletePdf(pdf.id, pdf.url, type)}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const shortTermDiseases = [
    "Cold & Cough", "Viral Fever or Flu", "Headache", "Sore Throat",
    "Allergies", "Food Poisoning", "Stomach Infection", "Migraine"
  ];

  const longTermDiseases = [
    "Diabetes", "Hypertension", "Skin Disease", "Asthma",
    "Arthritis", "Heart, Kidney, Liver Disease", "Thyroid Disorder", "Cancer"
  ];

  return (
    <div className="flex h-full">
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

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Medical Reports</span>
              <img src={jarIcon} alt="Jar" className="w-8 h-8" />
            </div>

            <input
              type="file"
              accept=".pdf"
              multiple
              hidden
              ref={shortTermInputRef}
              onChange={(e) => handleFileUpload(e, 'short')}
            />
            <button
              onClick={() => shortTermInputRef.current?.click()}
              disabled={uploading === 'short'}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-2"
            >
              <Upload className="w-4 h-4 mr-1" />
              {uploading === 'short' ? 'Uploading...' : 'Upload'}
            </button>

            {renderPdfList(shortTermPdfs, 'short')}
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

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Medical Reports</span>
              <img src={jarIcon} alt="Jar" className="w-8 h-8" />
            </div>

            <input
              type="file"
              accept=".pdf"
              multiple
              hidden
              ref={longTermInputRef}
              onChange={(e) => handleFileUpload(e, 'long')}
            />
            <button
              onClick={() => longTermInputRef.current?.click()}
              disabled={uploading === 'long'}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-2"
            >
              <Upload className="w-4 h-4 mr-1" />
              {uploading === 'long' ? 'Uploading...' : 'Upload'}
            </button>

            {renderPdfList(longTermPdfs, 'long')}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat History with Health Assistant</h2>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <ChatHistory />
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Medical Report" size="xl">
        {viewingPdf && (
          <iframe src={viewingPdf} className="w-full h-[80vh] border-0" title="PDF Viewer" />
        )}
      </Modal>
    </div>
  );
};

export default SymptomsSection;
