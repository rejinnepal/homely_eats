export interface Booking {
  _id: string;
  dinner: {
    _id: string;
    title: string;
    host: {
      _id: string;
      name: string;
    };
  };
  guest: {
    _id: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  guestCount: number;
  createdAt: string;
  updatedAt: string;
} 