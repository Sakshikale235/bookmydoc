import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Bot } from "lucide-react";

type SymptomSession = {
  id: string;
  patient_id: string;
  started_at: string;
  ended_at: string;
  symptoms: string[];
  personal_info: {
    age?: number | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
  };
  location: {
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  analysis_result: {
    possible_diseases?: string[];
    severity?: string;
    doctor_recommendation?: string;
    advice?: string;
    [key: string]: any;
  };
  recommended_doctors: Array<{
    full_name?: string;
    clinic_name?: string;
    experience?: number;
    phone?: string;
    consultation_fee?: number;
  }>;
  created_at: string;
};

const ChatHistory: React.FC = () => {
  const [sessions, setSessions] = useState<SymptomSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SymptomSession | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data, error } = await supabase
          .from("symptom_sessions")
          .select("*")
          .eq("patient_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        console.error("Error fetching symptom sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No symptom sessions available</p>
        <p className="text-sm">Start a conversation with the symptom checker to see your session history here.</p>
      </div>
    );
  }

  // Render detailed view if a session is selected
  if (selectedSession) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedSession(null)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to sessions
        </button>
        <h2 className="text-2xl mb-4">Symptom Session Details</h2>
        <p><strong>Date:</strong> {new Date(selectedSession.created_at).toLocaleString()}</p>
        <p><strong>Symptoms:</strong> {selectedSession.symptoms.join(", ")}</p>
        <p><strong>Personal Info:</strong></p>
        <ul className="list-disc list-inside">
          <li>Age: {selectedSession.personal_info.age ?? "N/A"}</li>
          <li>Gender: {selectedSession.personal_info.gender ?? "N/A"}</li>
          <li>Height: {selectedSession.personal_info.height ? selectedSession.personal_info.height + " cm" : "N/A"}</li>
          <li>Weight: {selectedSession.personal_info.weight ? selectedSession.personal_info.weight + " kg" : "N/A"}</li>
        </ul>
        <p><strong>Location:</strong> {selectedSession.location.location ?? "N/A"}</p>
        <p><strong>Analysis Result:</strong></p>
        <pre className="bg-gray-100 p-2 rounded mb-4 overflow-x-auto">
          {JSON.stringify(selectedSession.analysis_result, null, 2)}
        </pre>
        <p><strong>Recommended Doctors:</strong></p>
        {selectedSession.recommended_doctors.length > 0 ? (
          <ul className="list-disc list-inside">
            {selectedSession.recommended_doctors.map((doc, idx) => (
              <li key={idx} className="mb-2">
                <p><strong>Dr. {doc.full_name}</strong></p>
                {doc.clinic_name && <p>🏥 {doc.clinic_name}</p>}
                {doc.experience !== undefined && <p>📚 {doc.experience} years of experience</p>}
                {doc.consultation_fee !== undefined && <p>💰 Fee: ₹{doc.consultation_fee}</p>}
                {doc.phone && <p>📞 {doc.phone}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p>No doctor recommendations available.</p>
        )}
      </div>
    );
  }

  // Session list view
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 max-h-96 overflow-y-auto">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="p-4 border rounded cursor-pointer hover:bg-blue-50"
          onClick={() => setSelectedSession(session)}
        >
          <p><strong>Date:</strong> {new Date(session.created_at).toLocaleString()}</p>
          <p><strong>Symptoms:</strong> {session.symptoms.join(", ")}</p>
          <p><strong>Summary:</strong> {session.analysis_result?.advice || "No summary available"}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
