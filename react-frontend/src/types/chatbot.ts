export type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
  meta?: any;
};

export interface UserInfo {
  id?: string;
  auth_id?: string;
  full_name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  blood_group?: string;
  address?: string;
  location?: string;
  symptoms?: string;
  latitude?: number;
  longitude?: number;
}
