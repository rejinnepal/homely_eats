export interface DinnerListing {
  id?: string;
  host: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  menu: {
    name: string;
    description: string;
  }[];
  images: string[];
  cuisine: string;
  maxGuests: number;
  currentGuests: number;
  price: number;
  dietaryRestrictions: string[];
  status: 'available' | 'full' | 'cancelled';
} 