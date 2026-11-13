export type TaskCategory = 'work' | 'health' | 'personal' | 'routine' | 'rest';

export interface ScheduleTask {
  id: string;
  title: string;
  description?: string;
  startTime: string; // "08:30"
  endTime: string;   // "09:30"
  date: string;      // "2026-11-14"
  category: TaskCategory;
  isCompleted: boolean;
  hasAlarm: boolean;
  alarmOffsetMinutes?: number; // 0 for exact time, 10 for 10 min before
  iosAlarmId?: string;
}

export interface DaySchedule {
  date: string;
  tasks: ScheduleTask[];
}

