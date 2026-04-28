export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role: 'user' | 'admin' | 'provider';
  providerId?: string; // Linked provider profile ID if they are a pro
  createdAt: any;
}

export interface Application {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  city: string;
  specialty: string;
  experience: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: string;
  includes: string[];
}

export interface Provider {
  id: string;
  userId?: string; // Linked user ID
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  phone: string;
  location: string;
  bio: string;
  categoryId: string;
  imageUrl: string;
  price: number;
  isAvailable: boolean;
  badges?: string[];
  packages?: Package[];
  operatingHours?: {
    [key: string]: { open: string; close: string; active: boolean };
  };
  qualifications?: string[];
  updatedAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  serviceDate: string;
  serviceTime?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
  userName?: string;
  userPhone?: string;
  providerName?: string;
  specialty?: string;
  price?: number;
  items?: string[];
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
}
