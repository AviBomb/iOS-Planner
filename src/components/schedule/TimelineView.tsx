import React from 'react';
import { ScheduleTask, TaskCategory } from '../../types/schedule';
import { Bell, CheckCircle2, Circle, Clock, Flame, Briefcase, Heart, Coffee, User } from 'lucide-react';
import { triggerNativeAlarmShortcut } from '../../services/shortcutsBridge';
import { audioAlarm } from '../../services/audioAlarmService';

interface TimelineViewProps {
  tasks: ScheduleTask[];
  onToggleComplete: (id: string) => void;
  onEditTask: (task: ScheduleTask) => void;
  onDeleteTask: (id: string) => void;
}

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; badge: string; icon: React.FC<{ className?: string }> }> = {
  work: {
    label: 'Work',
    color: 'border-l-ios-blue bg-ios-blue/10 text-ios-blue',
    badge: 'bg-ios-blue/20 text-ios-blue',
    icon: Briefcase
  },
  health: {
    label: 'Health',
    color: 'border-l-ios-green bg-ios-green/10 text-ios-green',
    badge: 'bg-ios-green/20 text-ios-green',
    icon: Heart
  },
  routine: {
    label: 'Routine',
    color: 'border-l-ios-orange bg-ios-orange/10 text-ios-orange',
    badge: 'bg-ios-orange/20 text-ios-orange',
    icon: Flame
  },
  personal: {
    label: 'Personal',
    color: 'border-l-ios-purple bg-ios-purple/10 text-ios-purple',
    badge: 'bg-ios-purple/20 text-ios-purple',
    icon: User
  },
  rest: {
    label: 'Rest',
    color: 'border-l-ios-indigo bg-ios-indigo/10 text-ios-indigo',
    badge: 'bg-ios-indigo/20 text-ios-indigo',
    icon: Coffee
  }
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask
}) => {
  // Sort tasks by startTime
  const sortedTasks = [...tasks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAlarmClick = (e: React.MouseEvent, task: ScheduleTask) => {
    e.stopPropagation();
    audioAlarm.playChime();
    triggerNativeAlarmShortcut(task.startTime, task.title);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-ios-cardElevated flex items-center justify-center text-ios-textSecondary mb-3">
          <Clock className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-semibold text-white">No tasks scheduled</h3>
        <p className="text-sm text-ios-textSecondary max-w-xs mt-1">
          Tap "+ Add" above to schedule a block with native iOS alarm reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      {sortedTasks.map((task) => {
        const cat = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.work;
        const CatIcon = cat.icon;

        return (
          <div
            key={task.id}
            onClick={() => onEditTask(task)}
            className={`group relative p-3.5 rounded-2xl bg-ios-card border border-ios-separator/60 shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
              task.isCompleted ? 'opacity-60 bg-ios-card/50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task.id);
                }}
                className="mt-0.5 text-ios-textSecondary hover:text-ios-blue transition-colors"
                aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-ios-green fill-ios-green/20" />
                ) : (
                  <Circle className="w-5 h-5 text-ios-textSecondary hover:text-white" />
                )}
              </button>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cat.badge}`}>
                    <CatIcon className="w-3 h-3" />
                    {cat.label}
                  </span>

                  <span className="text-xs text-ios-textSecondary font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.startTime} – {task.endTime}
                  </span>

                  {task.hasAlarm && (
                    <button
                      onClick={(e) => handleAlarmClick(e, task)}
                      title="Tap to sync native iOS Alarm"
                      className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-ios-yellow/15 text-ios-yellow border border-ios-yellow/20 active:scale-90"
                    >
                      <Bell className="w-3 h-3" />
                      <span>{task.startTime}</span>
                    </button>
                  )}
                </div>

                <h3 className={`text-base font-semibold text-white leading-snug ${task.isCompleted ? 'line-through text-ios-textSecondary' : ''}`}>
                  {task.title}
                </h3>

                {task.description && (
                  <p className="text-xs text-ios-textSecondary mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Quick delete on hover / swipe */}
            <div className="mt-2 pt-2 border-t border-ios-separator/30 flex justify-end gap-3 text-xs text-ios-textSecondary">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="text-ios-red/80 hover:text-ios-red font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

