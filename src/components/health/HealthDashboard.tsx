import React, { useState } from 'react';
import { AppleHealthSummary } from '../../types/health';
import { Footprints, Flame, Moon, Droplets, Heart, RefreshCw, Sparkles, CheckCircle2, Clipboard, Timer, Play } from 'lucide-react';
import { ShortcutSyncModal } from './ShortcutSyncModal';
import { triggerHealthSyncShortcut } from '../../services/shortcutsBridge';
import { audioAlarm } from '../../services/audioAlarmService';

interface HealthDashboardProps {
  summary: AppleHealthSummary;
  onUpdateHealth: (data: Partial<AppleHealthSummary>) => void;
  onClipboardIngest: () => Promise<boolean>;
  autoSyncEnabled: boolean;
  secondsUntilNextSync: number;
  isSyncing: boolean;
  onToggleAutoSync: () => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  summary,
  onUpdateHealth,
  onClipboardIngest,
  autoSyncEnabled,
  secondsUntilNextSync,
  isSyncing,
  onToggleAutoSync
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clipboardStatus, setClipboardStatus] = useState<string | null>(null);

  const stepPercent = Math.min(100, Math.round((summary.steps / summary.stepGoal) * 100));
  const caloriePercent = Math.min(100, Math.round((summary.activeCalories / summary.calorieGoal) * 100));
  const sleepPercent = Math.min(100, Math.round((summary.sleepHours / summary.sleepGoal) * 100));
  const waterPercent = Math.min(100, Math.round((summary.waterOunces / summary.waterGoal) * 100));

  const formatLastSync = (isoString?: string) => {
    if (!isoString) return 'Not synced yet';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handle1TapSync = () => {
    audioAlarm.playChime();
    try {
      sessionStorage.setItem('planflow_sync_pending', 'true');
    } catch {
      // Ignore storage errors
    }
    triggerHealthSyncShortcut();
  };

  const handlePasteClipboard = async () => {
    setClipboardStatus('Reading...');
    const ok = await onClipboardIngest();
    if (ok) {
      setClipboardStatus('Synced!');
      setTimeout(() => setClipboardStatus(null), 2000);
    } else {
      setClipboardStatus('No health data in clipboard');
      setTimeout(() => setClipboardStatus(null), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Realtime 5-Minute Auto-Sync Heartbeat Bar */}
      <div className="px-4 py-2.5 rounded-2xl bg-ios-cardElevated/90 border border-ios-separator flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {autoSyncEnabled && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSyncing ? 'bg-ios-yellow' : 'bg-ios-green'} opacity-75`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoSyncEnabled ? (isSyncing ? 'bg-ios-yellow' : 'bg-ios-green') : 'bg-ios-textTertiary'}`}></span>
          </span>
          <span className="font-medium text-white flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-ios-blue" />
            {autoSyncEnabled ? (
              isSyncing ? (
                <span className="text-ios-yellow font-semibold">Syncing live data...</span>
              ) : (
                <span>Next auto-sync in <span className="font-mono text-ios-blue font-bold">{formatCountdown(secondsUntilNextSync)}</span></span>
              )
            ) : (
              <span className="text-ios-textSecondary">5-min auto-sync paused</span>
            )}
          </span>
        </div>

        <button
          onClick={onToggleAutoSync}
          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
            autoSyncEnabled ? 'bg-ios-green/20 text-ios-green' : 'bg-ios-card text-ios-textSecondary'
          }`}
        >
          {autoSyncEnabled ? 'Active' : 'Turn On'}
        </button>
      </div>

      {/* Sync Hero Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-ios-card via-ios-cardElevated to-zinc-900 border border-ios-separator shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white">Apple Health</h3>
                {summary.syncedViaShortcut && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-ios-green/20 text-ios-green px-1.5 py-0.2 rounded-full font-semibold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Live Bridge
                  </span>
                )}
              </div>
              <p className="text-xs text-ios-textSecondary">
                Last synced: {formatLastSync(summary.lastSyncedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-xl bg-ios-cardElevated hover:bg-zinc-800 text-ios-textSecondary hover:text-white border border-ios-separator text-xs transition-colors"
              title="Shortcut Setup & Settings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handle1TapSync}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Sync Now</span>
            </button>
          </div>
        </div>

        {/* 1-Tap Clipboard Ingest Fallback */}
        <div className="mt-3 pt-3 border-t border-ios-separator/40 flex items-center justify-between text-xs">
          <span className="text-[11px] text-ios-textSecondary">
            Shortcut copied data to clipboard?
          </span>
          <button
            onClick={handlePasteClipboard}
            className="flex items-center gap-1 text-ios-blue hover:underline text-[11px] font-semibold"
          >
            <Clipboard className="w-3 h-3" />
            <span>{clipboardStatus || 'Ingest from Clipboard'}</span>
          </button>
        </div>

        {/* Circular Progress Overview */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-ios-separator/40 text-center">
          <div>
            <div className="text-sm font-bold text-ios-red font-mono">{stepPercent}%</div>
            <div className="text-[10px] text-ios-textSecondary mt-0.5">Steps</div>
          </div>
          <div>
            <div className="text-sm font-bold text-ios-pink font-mono">{caloriePercent}%</div>
            <div className="text-[10px] text-ios-textSecondary mt-0.5">Calories</div>
          </div>
          <div>
            <div className="text-sm font-bold text-ios-indigo font-mono">{sleepPercent}%</div>
            <div className="text-[10px] text-ios-textSecondary mt-0.5">Sleep</div>
          </div>
          <div>
            <div className="text-sm font-bold text-ios-teal font-mono">{waterPercent}%</div>
            <div className="text-[10px] text-ios-textSecondary mt-0.5">Water</div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Steps */}
        <div className="p-4 rounded-2xl bg-ios-card border border-ios-separator">
          <div className="flex items-center justify-between text-xs text-ios-textSecondary">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Footprints className="w-4 h-4 text-ios-red" />
              Steps Today
            </span>
            <span className="font-mono text-ios-textSecondary">{summary.steps.toLocaleString()} / {summary.stepGoal.toLocaleString()}</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {summary.steps.toLocaleString()}
            <span className="text-xs font-normal text-ios-textSecondary ml-1">steps</span>
          </div>
          <div className="w-full h-2 rounded-full bg-ios-cardElevated mt-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-ios-red rounded-full transition-all duration-500"
              style={{ width: `${stepPercent}%` }}
            />
          </div>
        </div>

        {/* Active Calories */}
        <div className="p-4 rounded-2xl bg-ios-card border border-ios-separator">
          <div className="flex items-center justify-between text-xs text-ios-textSecondary">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Flame className="w-4 h-4 text-ios-pink" />
              Active Energy
            </span>
            <span className="font-mono text-ios-textSecondary">{summary.activeCalories} / {summary.calorieGoal} kcal</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {summary.activeCalories}
            <span className="text-xs font-normal text-ios-textSecondary ml-1">kcal</span>
          </div>
          <div className="w-full h-2 rounded-full bg-ios-cardElevated mt-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Sleep Analysis */}
        <div className="p-4 rounded-2xl bg-ios-card border border-ios-separator">
          <div className="flex items-center justify-between text-xs text-ios-textSecondary">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Moon className="w-4 h-4 text-ios-indigo" />
              Sleep Rest
            </span>
            <span className="font-mono text-ios-textSecondary">{summary.sleepHours}h / {summary.sleepGoal}h</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {summary.sleepHours}
            <span className="text-xs font-normal text-ios-textSecondary ml-1">hours</span>
          </div>
          <div className="w-full h-2 rounded-full bg-ios-cardElevated mt-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${sleepPercent}%` }}
            />
          </div>
        </div>

        {/* Water Hydration */}
        <div className="p-4 rounded-2xl bg-ios-card border border-ios-separator">
          <div className="flex items-center justify-between text-xs text-ios-textSecondary">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Droplets className="w-4 h-4 text-ios-teal" />
              Hydration
            </span>
            <span className="font-mono text-ios-textSecondary">{summary.waterOunces} / {summary.waterGoal} oz</span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {summary.waterOunces}
            <span className="text-xs font-normal text-ios-textSecondary ml-1">oz</span>
          </div>
          <div className="w-full h-2 rounded-full bg-ios-cardElevated mt-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-ios-blue rounded-full transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Schedule & Health Correlation Insight */}
      <div className="p-4 rounded-2xl bg-ios-cardElevated border border-ios-separator">
        <div className="flex items-center gap-2 text-xs font-bold text-ios-blue uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Schedule & Wellness Alignment
        </div>
        <p className="text-xs text-ios-textSecondary leading-relaxed">
          {summary.steps >= 8000
            ? '🔥 Excellent movement today! Your planned schedule gave you ample active breaks.'
            : '💡 Tip: You have a gap between your deep work blocks. Take a 15-minute brisk walk to hit your 10k step goal!'}
        </p>
      </div>

      {/* Sync Modal */}
      <ShortcutSyncModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onManualImport={onUpdateHealth}
      />
    </div>
  );
};
