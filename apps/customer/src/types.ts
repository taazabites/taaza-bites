import { Timestamp } from 'firebase/firestore';

export interface HealthProgress {
  id: string;
  userId: string;
  date: string;
  weight: number;
  bmi: number;
  bodyFatPercentage?: number;
  measurements: {
    waist?: number;
    chest?: number;
    arms?: number;
  };
  waterIntake: number; // ml
  sleepHours: number;
  workoutMinutes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  weight: number;
  energyLevel: number; // 1-10
  mood: string;
  sleepHours: number;
  waterIntake: number; // ml
  workoutMinutes: number;
  createdAt: Timestamp;
}

export interface NutritionReport {
  id: string;
  userId: string;
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  mealAdherencePercentage: number;
  subscriptionAdherencePercentage: number;
  createdAt: Timestamp;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weight: number;
  createdAt: Timestamp;
}

export interface MealAnalytics {
  id: string;
  userId: string;
  mealId: string;
  status: 'consumed' | 'skipped' | 'customized';
  createdAt: Timestamp;
}
