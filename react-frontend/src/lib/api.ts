import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// Symptom checker API
export const analyzeSymptoms = async (data: {
    symptoms: string;
    height?: string;
    weight?: string;
    age?: string;
    gender?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
}) => {
    try {
        console.log('🔍 API Request:', { endpoint: '/analyze-symptoms/', data });
        const response = await api.post('/analyze-symptoms/', data, { timeout: 30000 });
        console.log('✅ API Response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ API Error Details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config?.url,
        });
        
        // Return mock data if backend is not available (for development)
        if (error.response?.status === 404 || error.code === 'ECONNREFUSED') {
            console.warn('⚠️ Backend not available, returning mock data');
            return {
                possible_diseases: ['Common Cold', 'Mild Fever'],
                severity: 'mild',
                advice: 'Rest well, drink plenty of water, and monitor your symptoms.',
                recommended_specialization: 'General Physician',
                recommended_doctors: [],
                message: 'Analysis complete (mock data)'
            };
        }
        
        throw error;
    }
};

// Auth functions
export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export default api;
