import React, { useState, useEffect } from 'react';
import { ScheduleTask, TaskCategory } from '../../types/schedule';
import { X, Bell, Clock, Bookmark } from 'lucide-react';
import { audioAlarm } from '../../services/audioAlarmService';
import { triggerNativeAlarmShortcut } from '../../services/shortcutsBridge';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: ScheduleTask) => void;
  editingTask: ScheduleTask | null;
}

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'health', label: 'Health' },
  { id: 'routine', label: 'Routine' },
  { id: 'personal', label: 'Personal' },
  { id: 'rest', label: 'Rest' }
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [hasAlarm, setHasAlarm] = useState(true);
  const [alarmOffsetMinutes, setAlarmOffsetMinutes] = useState(0);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setCategory(editingTask.category);
      setStartTime(editingTask.startTime);
      setEndTime(editingTask.endTime);
      setHasAlarm(editingTask.hasAlarm);
      setAlarmOffsetMinutes(editingTask.alarmOffsetMinutes || 0);
    } else {
      setTitle('');
      setDescription('');
      setCategory('work');
      setStartTime('09:00');
      setEndTime('10:00');
      setHasAlarm(true);
      setAlarmOffsetMinutes(0);
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const task: ScheduleTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      startTime,
      endTime,
      date: editingTask ? editingTask.date : new Date().toISOString().split('T')[0],
      isCompleted: editingTask ? editingTask.isCompleted : false,
      hasAlarm,
      alarmOffsetMinutes: hasAlarm ? alarmOffsetMinutes : undefined
    };

    if (hasAlarm) {
      audioAlarm.playChime();
    }

    onSave(task);
    onClose();
  };

  const handleTestNativeAlarm = () => {
    audioAlarm.playAlarmBeep();
    triggerNativeAlarmShortcut(startTime, title || 'PlanFlow Reminder');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-ios-card rounded-t-3xl sm:rounded-3xl border border-ios-separator p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ios-separator/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-ios-blue" />
            {editingTask ? 'Edit Schedule Block' : 'New Schedule Block'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ios-cardElevated flex items-center justify-center text-ios-textSecondary hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-ios-textSecondary uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Work Session, Morning Cardio"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-ios-cardElevated border border-ios-separator text-white text-sm placeholder:text-ios-textTertiary focus:outline-none focus:border-ios-blue"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ios-textSecondary uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Add details, targets, or checklist..."
              className="w-full px-3.5 py-2 rounded-xl bg-ios-cardElevated border border-ios-separator text-white text-sm placeholder:text-ios-textTertiary focus:outline-none focus:border-ios-blue resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-ios-textSecondary uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    category === cat.id
                      ? 'bg-ios-blue text-white shadow-md'
                      : 'bg-ios-cardElevated text-ios-textSecondary hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ios-textSecondary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-ios-blue" />
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-ios-cardElevated border border-ios-separator text-white text-sm font-mono focus:outline-none focus:border-ios-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ios-textSecondary uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-ios-orange" />
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-ios-cardElevated border border-ios-separator text-white text-sm font-mono focus:outline-none focus:border-ios-blue"
              />
            </div>
          </div>

          {/* Alarm & Reminder Toggle */}
          <div className="p-3.5 rounded-2xl bg-ios-cardElevated border border-ios-separator">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasAlarm ? 'bg-ios-yellow/20 text-ios-yellow' : 'bg-ios-card text-ios-textSecondary'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">iOS Alarm / Reminder</h4>
                  <p className="text-xs text-ios-textSecondary">Chime + Shortcut trigger</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAlarm}
                  onChange={(e) => setHasAlarm(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-ios-card peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ios-green"></div>
              </label>
            </div>

            {hasAlarm && (
              <div className="mt-3 pt-3 border-t border-ios-separator/40 flex items-center justify-between gap-2">
                <select
                  value={alarmOffsetMinutes}
                  onChange={(e) => setAlarmOffsetMinutes(Number(e.target.value))}
                  className="bg-ios-card px-2.5 py-1.5 rounded-lg border border-ios-separator text-xs text-white focus:outline-none focus:border-ios-blue"
                >
                  <option value={0}>At time of event</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before</option>
                  <option value={15}>15 minutes before</option>
                </select>

                <button
                  type="button"
                  onClick={handleTestNativeAlarm}
                  className="text-xs text-ios-yellow hover:underline flex items-center gap-1 font-medium"
                >
                  <Bell className="w-3 h-3" />
                  Test Alarm Tone
                </button>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-ios-cardElevated hover:bg-zinc-800 text-white font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-ios-blue hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-ios-blue/20"
            >
              {editingTask ? 'Save Changes' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
