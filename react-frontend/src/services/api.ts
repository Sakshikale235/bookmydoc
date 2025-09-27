import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';  // Django API URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const analyzeSymptoms = async (symptoms: string[]) => {
    try {
        const response = await api.post('/analyze-symptoms/', { symptoms });
        return response.data;
    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        throw error;
    }
};

// Add more API endpoints here
export const getDoctors = async () => {
    try {
        const response = await api.get('/doctors/');
        return response.data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

export const bookAppointment = async (appointmentData: any) => {
    try {
        const response = await api.post('/appointments/', appointmentData);
        return response.data;
    } catch (error) {
        console.error('Error booking appointment:', error);
        throw error;
    }
};

export default api;