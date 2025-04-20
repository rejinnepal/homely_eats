export interface Profile {
  userId: string;
  name: string;
  bio: string;
  location: string;
  cuisineSpecialties: string[];
  ratings: number;
  reviewCount: number;
  profileImage?: string;
  hostingSince?: Date;
} 