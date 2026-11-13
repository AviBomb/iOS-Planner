export interface AppleHealthSummary {
  date: string;
  steps: number;
  stepGoal: number;
  activeCalories: number;
  calorieGoal: number;
  sleepHours: number;
  sleepGoal: number;
  waterOunces: number;
  waterGoal: number;
  restingHeartRate?: number;
  lastSyncedAt?: string;
  syncedViaShortcut: boolean;
}

export interface HealthMetricProgress {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
}

