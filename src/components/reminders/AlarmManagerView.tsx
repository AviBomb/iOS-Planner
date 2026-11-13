import React, { useState, useEffect } from 'react';
import { ScheduleTask } from '../../types/schedule';
import { Bell, Calendar, Play, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';
import { audioAlarm } from '../../services/audioAlarmService';
import { notificationService } from '../../services/notificationService';
import { exportTasksToAppleCalendar } from '../../services/calendarService';
import { triggerNativeAlarmShortcut } from '../../services/shortcutsBridge';

interface AlarmManagerViewProps {
  tasks: ScheduleTask[];
  onToggleAlarm: (id: string) => void;
}

export const AlarmManagerView: React.FC<AlarmManagerViewProps> = ({ tasks, onToggleAlarm }) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    if (notificationService.isSupported()) {
      setNotificationPermission(notificationService.getPermission());
    }
  }, []);

  const alarmTasks = tasks.filter((t) => t.hasAlarm);

  const handleRequestPermission = async () => {
    const perm = await notificationService.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      notificationService.showNotification({
        title: 'PlanFlow Alarms Enabled',
        body: 'You will receive reminders for your scheduled tasks.'
      });
      audioAlarm.playChime();
    }
  };

  const handleTestChime = () => {
    audioAlarm.playChime();
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 2000);
  };

  const handleExportIcs = () => {
    audioAlarm.playChime();
    exportTasksToAppleCalendar(tasks, 'PlanFlow Daily Alarms');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Native Alert Bridges Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-ios-card via-ios-cardElevated to-zinc-900 border border-ios-separator shadow-lg space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-ios-yellow/20 text-ios-yellow flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Native iOS Alarms & Alerts</h3>
            <p className="text-xs text-ios-textSecondary">Sync with Clock & Apple Calendar</p>
          </div>
        </div>

        {/* 1-Tap Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Export to Apple Calendar (.ics) */}
          <button
            onClick={handleExportIcs}
            className="p-3 rounded-2xl bg-ios-cardElevated hover:bg-zinc-800 border border-ios-separator text-left transition-all active:scale-95"
          >
            <Calendar className="w-5 h-5 text-ios-blue mb-1" />
            <div className="text-xs font-bold text-white">Apple Calendar</div>
            <div className="text-[10px] text-ios-textSecondary mt-0.5">Add with native alerts</div>
          </button>

          {/* Test Sound Chime */}
          <button
            onClick={handleTestChime}
            className="p-3 rounded-2xl bg-ios-cardElevated hover:bg-zinc-800 border border-ios-separator text-left transition-all active:scale-95"
          >
            <Volume2 className="w-5 h-5 text-ios-yellow mb-1" />
            <div className="text-xs font-bold text-white">{testSuccess ? 'Chime Played!' : 'Test Sound'}</div>
            <div className="text-[10px] text-ios-textSecondary mt-0.5">In-app synthesizer tone</div>
          </button>
        </div>

        {/* Web Push Notification Permission Bar */}
        <div className="pt-2 border-t border-ios-separator/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs">
            {notificationPermission === 'granted' ? (
              <span className="text-ios-green flex items-center gap-1 font-medium">
                <ShieldCheck className="w-4 h-4" />
                iOS Push Permitted
              </span>
            ) : (
              <span className="text-ios-orange flex items-center gap-1 font-medium">
                <AlertCircle className="w-4 h-4" />
                Push: {notificationPermission}
              </span>
            )}
          </div>

          {notificationPermission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="text-xs font-bold bg-ios-blue hover:bg-blue-500 text-white px-3 py-1 rounded-full transition-all active:scale-95"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Active Scheduled Alarms List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ios-textSecondary px-1">
          Active Alarms ({alarmTasks.length})
        </h3>

        {alarmTasks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-ios-card border border-ios-separator text-ios-textSecondary text-xs">
            No alarms set. Enable alarms on tasks in the Schedule tab.
          </div>
        ) : (
          alarmTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-2xl bg-ios-card border border-ios-separator flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    audioAlarm.playAlarmBeep();
                    triggerNativeAlarmShortcut(task.startTime, task.title);
                  }}
                  className="w-9 h-9 rounded-xl bg-ios-yellow/20 text-ios-yellow flex items-center justify-center hover:bg-ios-yellow/30 active:scale-90 transition-all"
                  title="Trigger native Clock Alarm"
                >
                  <Play className="w-4 h-4 fill-ios-yellow" />
                </button>
                <div>
                  <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                    {task.startTime}
                    <span className="text-[11px] font-sans font-normal text-ios-textSecondary">
                      ({task.alarmOffsetMinutes || 0}m before)
                    </span>
                  </div>
                  <div className="text-xs text-ios-textSecondary truncate max-w-[180px]">
                    {task.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleAlarm(task.id)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-ios-cardElevated border border-ios-separator text-ios-textSecondary hover:text-white"
                >
                  Turn Off
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
