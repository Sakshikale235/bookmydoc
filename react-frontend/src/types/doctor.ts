export interface Doctor {
  id: string;
  auth_id?: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification?: string;
  experience: number;
  clinic_name: string;
  consultation_fee: number;
  location: string;
  bio?: string;
  latitude?: number;
  longitude?: number;
  assistant_contact?: string;
  common_conditions?: string[];
  advance_notice?: string;
  home_visits?: boolean;
  auto_confirm_appointments?: boolean;
  monthly_feedback_summaries?: boolean;
  created_at?: string;
}