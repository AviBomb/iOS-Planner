import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/layout/Header';
import { NavigationBar, TabType } from './components/layout/NavigationBar';
import { IosInstallBanner } from './components/onboarding/IosInstallBanner';
import { TimelineView } from './components/schedule/TimelineView';
import { TaskModal } from './components/schedule/TaskModal';
import { HealthDashboard } from './components/health/HealthDashboard';
import { AlarmManagerView } from './components/reminders/AlarmManagerView';
import { storageService, AppSettings } from './services/storageService';
import { parseIncomingShortcutData, parseHealthFromText } from './services/shortcutsBridge';
import { ScheduleTask } from './types/schedule';
import { AppleHealthSummary } from './types/health';
import { audioAlarm } from './services/audioAlarmService';
import { Sparkles, Check } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [tasks, setTasks] = useState<ScheduleTask[]>(() => storageService.getTasks());
  const [healthSummary, setHealthSummary] = useState<AppleHealthSummary>(() => storageService.getHealthSummary());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduleTask | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [secondsUntilNextSync, setSecondsUntilNextSync] = useState(300);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncBanner, setShowSyncBanner] = useState(false);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Checks and applies incoming health data from URL query/hash or clipboard
  const checkIncomingHealth = useCallback(() => {
    const incoming = parseIncomingShortcutData();
    if (incoming) {
      setHealthSummary((prev) => {
        const updated = { ...prev, ...incoming };
        storageService.saveHealthSummary(updated);
        return updated;
      });
      setActiveTab('health');
      audioAlarm.playChime();
      sessionStorage.removeItem('planflow_sync_pending');
      setShowSyncBanner(false);
      return true;
    }
    return false;
  }, []);

  // Paste / Ingest directly from clipboard (iOS fallback)
  const handleClipboardIngest = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const parsed = parseHealthFromText(text);
        if (parsed) {
          setHealthSummary((prev) => {
            const updated = { ...prev, ...parsed };
            storageService.saveHealthSummary(updated);
            return updated;
          });
          audioAlarm.playChime();
          sessionStorage.removeItem('planflow_sync_pending');
          setShowSyncBanner(false);
          return true;
        }
      }
    } catch {
      // Browser may require an explicit touch gesture
    }
    return false;
  }, []);

  // Check iOS Standalone & listen to app lifecycle resume events (visibilitychange, focus, hashchange)
  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Initial check on load
    checkIncomingHealth();

    // Critical for iOS: Listen to resume when user returns from Shortcuts or Safari
    const handleResume = async () => {
      if (document.visibilityState === 'visible') {
        const fromUrl = checkIncomingHealth();
        if (!fromUrl) {
          // If a sync was triggered before leaving, try auto-reading clipboard or prompt user
          const wasSyncPending = sessionStorage.getItem('planflow_sync_pending') === 'true';
          const success = await handleClipboardIngest();
          if (!success && wasSyncPending) {
            setShowSyncBanner(true);
          }
        }
      }
    };

    const handleFocus = async () => {
      const fromUrl = checkIncomingHealth();
      if (!fromUrl) {
        await handleClipboardIngest();
      }
    };

    const handleHashChange = () => {
      checkIncomingHealth();
    };

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [checkIncomingHealth, handleClipboardIngest]);

  // 5-Minute Auto-Sync Heartbeat Timer
  useEffect(() => {
    if (!settings.autoSyncEnabled) return;

    const intervalId = window.setInterval(() => {
      setSecondsUntilNextSync((prev) => {
        if (prev <= 1) {
          // Trigger 5-minute auto-refresh
          setIsSyncing(true);
          checkIncomingHealth();
          setTimeout(() => setIsSyncing(false), 1200);
          return settingsRef.current.autoSyncIntervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [settings.autoSyncEnabled, checkIncomingHealth]);

  const handleToggleAutoSync = () => {
    const updated = storageService.saveSettings({ autoSyncEnabled: !settings.autoSyncEnabled });
    setSettings(updated);
    if (updated.autoSyncEnabled) {
      setSecondsUntilNextSync(updated.autoSyncIntervalMinutes * 60);
    }
  };

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

      {/* Floating Sync Banner (When returning from Shortcuts) */}
      {showSyncBanner && (
        <div className="mx-4 mt-2 p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-between shadow-lg shadow-pink-500/25 animate-fade-in z-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 fill-white" />
            <span className="text-xs font-semibold">New Health Data Ready</span>
          </div>
          <button
            onClick={handleClipboardIngest}
            className="px-3 py-1 bg-white text-pink-600 rounded-full text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Apply Now
          </button>
        </div>
      )}

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
            onClipboardIngest={handleClipboardIngest}
            autoSyncEnabled={settings.autoSyncEnabled}
            secondsUntilNextSync={secondsUntilNextSync}
            isSyncing={isSyncing}
            onToggleAutoSync={handleToggleAutoSync}
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
