import { ScheduleTask } from '../types/schedule';
import { AppleHealthSummary } from '../types/health';

const STORAGE_KEYS = {
  TASKS: 'planflow_tasks_v1',
  HEALTH: 'planflow_health_v1',
  SETTINGS: 'planflow_settings_v1'
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_TASKS: ScheduleTask[] = [
  {
    id: 'task-1',
    title: 'Morning Routine & Hydration',
    description: 'Glass of water, 10 min light stretching, plan priority blocks.',
    startTime: '07:30',
    endTime: '08:00',
    date: getTodayString(),
    category: 'routine',
    isCompleted: true,
    hasAlarm: true,
    alarmOffsetMinutes: 0
  },
  {
    id: 'task-2',
    title: 'Deep Work: Project Planning & Architecture',
    description: 'Review system specs, build components, and verify iOS integration.',
    startTime: '09:00',
    endTime: '11:30',
    date: getTodayString(),
    category: 'work',
    isCompleted: false,
    hasAlarm: true,
    alarmOffsetMinutes: 5
  },
  {
    id: 'task-3',
    title: 'Midday Walk & Sunshine',
    description: 'Brisk 25-minute walk to hit step goal and reset focus.',
    startTime: '12:30',
    endTime: '13:00',
    date: getTodayString(),
    category: 'health',
    isCompleted: false,
    hasAlarm: false
  },
  {
    id: 'task-4',
    title: 'Sprint Review & Async Updates',
    description: 'Sync with team, update task boards, close open PRs.',
    startTime: '14:30',
    endTime: '15:30',
    date: getTodayString(),
    category: 'work',
    isCompleted: false,
    hasAlarm: false
  },
  {
    id: 'task-5',
    title: 'Gym & Cardio Session',
    description: 'Strength training and zone 2 cardio.',
    startTime: '17:30',
    endTime: '18:45',
    date: getTodayString(),
    category: 'health',
    isCompleted: false,
    hasAlarm: true,
    alarmOffsetMinutes: 10
  },
  {
    id: 'task-6',
    title: 'Wind-down & Reading',
    description: 'Screen-off time, prepare for deep sleep.',
    startTime: '22:00',
    endTime: '22:45',
    date: getTodayString(),
    category: 'rest',
    isCompleted: false,
    hasAlarm: true,
    alarmOffsetMinutes: 0
  }
];

const INITIAL_HEALTH: AppleHealthSummary = {
  date: getTodayString(),
  steps: 6420,
  stepGoal: 10000,
  activeCalories: 380,
  calorieGoal: 600,
  sleepHours: 7.2,
  sleepGoal: 8.0,
  waterOunces: 48,
  waterGoal: 80,
  restingHeartRate: 64,
  lastSyncedAt: new Date().toISOString(),
  syncedViaShortcut: false
};

export const storageService = {
  getTasks(): ScheduleTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
    }
    return INITIAL_TASKS;
  },

  saveTasks(tasks: ScheduleTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage', e);
    }
  },

  getHealthSummary(): AppleHealthSummary {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HEALTH);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load health summary from localStorage', e);
    }
    return INITIAL_HEALTH;
  },

  saveHealthSummary(summary: AppleHealthSummary): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(summary));
    } catch (e) {
      console.error('Failed to save health summary to localStorage', e);
    }
  }
};

