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
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityWithUser extends Availability {
  user: {
    name: string;
    email: string;
  };
}

export interface Schedule {
  _id?: string;
  year: number;
  month: number;
  assignments: DayAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DayAssignment {
  day: number;
  bagiety?: string; // userId - null for Tuesdays
  widok?: string;   // userId
}

export interface ScheduleWithUsers {
  _id?: string;
  year: number;
  month: number;
  assignments: DayAssignmentWithUsers[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DayAssignmentWithUsers {
  day: number;
  bagiety?: {
    userId: string;
    name: string;
    email: string;
  };
  widok?: {
    userId: string;
    name: string;
    email: string;
  };
}

export interface HourLog {
  _id?: string;
  userId: string;
  year: number;
  month: number;
  day: number;
  hours: number;
  location: 'bagiety' | 'widok';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HourLogWithUser extends HourLog {
  user: {
    name: string;
    email: string;
  };
}