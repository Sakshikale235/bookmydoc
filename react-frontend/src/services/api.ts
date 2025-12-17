import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ---------------------------------------------
// NEW: Unified Medical Analysis Service
// ---------------------------------------------
export const analyzeMedicalData = async (data: {
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  symptoms: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}) => {
  try {
    const response = await api.post("/analyze-symptoms/", data);
    const r = response.data;

    // Format AI output for Chatbot.tsx (frontend-ready)
    const formattedText = formatAnalysisText(r);
    return { raw: r, formattedText };
  } catch (err) {
    console.error("Error analyzing medical data:", err);
    throw err;
  }
};

// ---------------------------------------------
// Helper: Format AI Analysis Result
// ---------------------------------------------
function formatAnalysisText(r: any) {
  let text = `🧾 **Health Analysis Report**\n\n`;

  if (r.possible_diseases)
    text += `• **Possible Conditions:** ${r.possible_diseases.join(", ")}\n`;

  if (r.severity) text += `• **Severity:** ${r.severity}\n`;

  if (r.advice) text += `• **Advice:** ${r.advice}\n`;

  if (r.recommended_specialization)
    text += `• **Recommended Specialist:** ${r.recommended_specialization}\n`;

  if (r.recommended_doctors?.length > 0) {
    text += `\n👨‍⚕️ **Nearby Doctors:**\n`;
    r.recommended_doctors.forEach((doc: any) => {
      text += `• **${doc.full_name}** — ${doc.clinic_name || ""}\n`;
      if (doc.experience) text += `  Experience: ${doc.experience} yrs\n`;
      if (doc.consultation_fee)
        text += `  Fee: ₹${doc.consultation_fee}\n`;
      text += `\n`;
    });
  }

  return text;
}

// ---------------------------------------------
// Existing exported APIs
// ---------------------------------------------
export default api;

export const getDoctors = async () => {
  try {
    const res = await api.get("/doctors/");
    return res.data;
  } catch (e) {
    console.error("Error fetching doctors:", e);
    throw e;
  }
};

export const bookAppointment = async (appointmentData: any) => {
  try {
    const res = await api.post("/appointments/", appointmentData);
    return res.data;
  } catch (e) {
    console.error("Error booking appointment:", e);
    throw e;
  }
};
