import { ScheduleTask } from '../types/schedule';

/**
 * Formats a date string 'YYYY-MM-DD' and time string 'HH:mm' into ICS datetime format: YYYYMMDDTHHmm00
 */
function toIcsDateTime(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Generates an RFC 5545 compliant .ics string for a single task or full day schedule
 * Includes VALARM triggers so iOS native calendar and clock alert the user.
 */
export function generateIcsContent(tasks: ScheduleTask[], calendarTitle: string = 'PlanFlow Schedule'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlanFlow//iOS Schedule & Alarms//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`
  ];

  tasks.forEach((task) => {
    const dtStart = toIcsDateTime(task.date, task.startTime);
    const dtEnd = toIcsDateTime(task.date, task.endTime);
    const uid = `${task.id}@planflow.local`;
    const offsetMin = task.alarmOffsetMinutes || 0;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${toIcsDateTime(new Date().toISOString().split('T')[0], '00:00')}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:${task.description ? task.description.replace(/\n/g, '\\n') : 'Scheduled via PlanFlow'}`,
      `CATEGORIES:${task.category.toUpperCase()}`
    );

    // If alarm is enabled, attach native alarm trigger
    if (task.hasAlarm) {
      lines.push(
        'BEGIN:VALARM',
        `TRIGGER:-PT${offsetMin}M`,
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${task.title}`,
        'END:VALARM'
      );
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Prompts iOS Safari / device to download or open the .ics calendar file
 * On iOS, this triggers the native "Add to Calendar" sheet.
 */
export function exportTasksToAppleCalendar(tasks: ScheduleTask[], title?: string): void {
  const icsData = generateIcsContent(tasks, title);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `planflow-schedule-${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

