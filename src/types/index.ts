export interface User {
  _id?: string;
  email: string;
  name: string;
  role: 'employee' | 'admin';
  hashedPassword: string;
  createdAt: Date;
}

export interface Availability {
  _id?: string;
  userId: string;
  year: number;
  month: number;
  availableDays: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityWithUser extends Availability {
  user: {
    name: string;
    email: string;
  };
}