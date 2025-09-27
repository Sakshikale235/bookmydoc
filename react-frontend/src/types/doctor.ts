export interface Doctor {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  specialization: string;
  degree: string;
  experience: number;
  hospital: string;
  phone: string;
  email: string;
  photo?: string;
}