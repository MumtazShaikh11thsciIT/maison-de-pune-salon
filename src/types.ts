export type ServiceCategory = 'bridal' | 'spa' | 'hair' | 'skin';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  title: string;
  tagline: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image: string;
  features: string[];
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  rating: number;
  completedJobs: number;
  image: string;
  specialties: string[];
  bio: string;
}

export interface PuneLocation {
  id: string;
  name: string;
  region: string;
  description: string;
}

export interface Booking {
  id: string;
  service: ServiceItem;
  stylist: Stylist;
  location: PuneLocation;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  totalPrice: number;
  createdAt: string;
  status: 'confirmed' | 'completed' | 'cancelled';
}
