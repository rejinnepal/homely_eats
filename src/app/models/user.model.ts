export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  location?: string;
  roles: string[];
  activeRole: string;
  createdAt?: Date;
} 