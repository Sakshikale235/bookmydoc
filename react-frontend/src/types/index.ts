export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface HealthInfo {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  prevention: string[];
  category: 'respiratory' | 'skin' | 'allergies' | 'general';
}