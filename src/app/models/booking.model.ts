export interface Booking {
  _id?: string;
  dinnerId: string;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  specialRequests?: string;
  totalPrice?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notification?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  dinner?: {
    _id: string;
    title: string;
    date: string;
    time: string;
    price: number;
    location?: string | { address: string };
    host: {
      _id: string;
      name: string;
      email: string;
    };
  };
  host?: {
    _id: string;
    name: string;
    email: string;
  };
  guest?: {
    _id: string;
    name: string;
  };
} 