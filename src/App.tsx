import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { NavigationBar, TabType } from './components/layout/NavigationBar';
import { IosInstallBanner } from './components/onboarding/IosInstallBanner';
import { TimelineView } from './components/schedule/TimelineView';
import { TaskModal } from './components/schedule/TaskModal';
import { HealthDashboard } from './components/health/HealthDashboard';
import { AlarmManagerView } from './components/reminders/AlarmManagerView';
import { storageService } from './services/storageService';
import { parseIncomingShortcutData } from './services/shortcutsBridge';
import { ScheduleTask } from './types/schedule';
import { AppleHealthSummary } from './types/health';
import { audioAlarm } from './services/audioAlarmService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [tasks, setTasks] = useState<ScheduleTask[]>(() => storageService.getTasks());
  const [healthSummary, setHealthSummary] = useState<AppleHealthSummary>(() => storageService.getHealthSummary());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check iOS Standalone and incoming Shortcut payload on mount
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Parse incoming data from iOS Shortcut if redirected back
    const incomingHealth = parseIncomingShortcutData();
    if (incomingHealth) {
      setHealthSummary((prev) => {
        const updated = { ...prev, ...incomingHealth };
        storageService.saveHealthSummary(updated);
        return updated;
      });
      setActiveTab('health');
      audioAlarm.playChime();
    }
  }, []);

  // Sync state changes to storage
  const handleSaveTask = (task: ScheduleTask) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      const updated = exists ? prev.map((t) => (t.id === task.id ? task : t)) : [...prev, task];
      storageService.saveTasks(updated);
      return updated;
    });
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
      storageService.saveTasks(updated);
      return updated;
    });
  };

  const handleToggleAlarm = (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, hasAlarm: !t.hasAlarm } : t));
      storageService.saveTasks(updated);
      return updated;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storageService.saveTasks(updated);
      return updated;
    });
  };

  const handleUpdateHealth = (data: Partial<AppleHealthSummary>) => {
    setHealthSummary((prev) => {
      const updated = { ...prev, ...data };
      storageService.saveHealthSummary(updated);
      return updated;
    });
  };

  const pendingAlarmsCount = tasks.filter((t) => t.hasAlarm && !t.isCompleted).length;

  return (
    <div className="flex flex-col h-full bg-black text-white max-w-lg mx-auto overflow-hidden relative shadow-2xl">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onAddTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        isStandalone={isStandalone}
      />

      {/* Main Content Area (Scrollable with iOS inertia) */}
      <main className="flex-1 overflow-y-auto px-4 pt-2 -webkit-overflow-scrolling-touch">
        <IosInstallBanner />

        {activeTab === 'schedule' && (
          <TimelineView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'health' && (
          <HealthDashboard
            summary={healthSummary}
            onUpdateHealth={handleUpdateHealth}
          />
        )}

        {activeTab === 'alarms' && (
          <AlarmManagerView
            tasks={tasks}
            onToggleAlarm={handleToggleAlarm}
          />
        )}
      </main>

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />

      {/* Bottom Navigation Tab Bar */}
      <NavigationBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingAlarmsCount={pendingAlarmsCount}
      />
    </div>
  );
};

export default App;

