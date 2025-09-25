import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Symptom checker API
export const analyzeSymptoms = async (data: {
    symptoms: string;
    height?: string;
    weight?: string;
    age?: string;
    gender?: string;
    location?: string;
}) => {
    try {
        const response = await api.post('/analyze-symptoms/', data);
        return response.data;
    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        throw error;
    }
};

export default api;