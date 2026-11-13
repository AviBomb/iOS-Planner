import React, { useState } from 'react';
import { X, Play, Copy, Check, ExternalLink, HelpCircle, Sparkles } from 'lucide-react';
import { triggerHealthSyncShortcut, getAppleHealthShortcutGuide } from '../../services/shortcutsBridge';
import { AppleHealthSummary } from '../../types/health';
import { audioAlarm } from '../../services/audioAlarmService';

interface ShortcutSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualImport: (data: Partial<AppleHealthSummary>) => void;
}

export const ShortcutSyncModal: React.FC<ShortcutSyncModalProps> = ({
  isOpen,
  onClose,
  onManualImport
}) => {
  const [copied, setCopied] = useState(false);
  const [manualJson, setManualJson] = useState('{\n  "steps": 9250,\n  "sleepHours": 7.8,\n  "activeCalories": 520,\n  "waterOunces": 64,\n  "restingHeartRate": 61\n}');
  const [activeTab, setActiveTab] = useState<'run' | 'guide' | 'manual'>('run');

  if (!isOpen) return null;

  const guideSteps = getAppleHealthShortcutGuide();

  const handleRunShortcut = () => {
    audioAlarm.playChime();
    triggerHealthSyncShortcut();
  };

  const handleCopyGuide = () => {
    const text = guideSteps.map(s => `${s.step}. ${s.title}: ${s.instruction}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyManual = () => {
    try {
      const parsed = JSON.parse(manualJson);
      onManualImport({
        steps: Number(parsed.steps) || 0,
        sleepHours: Number(parsed.sleepHours) || 0,
        activeCalories: Number(parsed.activeCalories) || 0,
        waterOunces: Number(parsed.waterOunces) || 0,
        restingHeartRate: parsed.restingHeartRate ? Number(parsed.restingHeartRate) : undefined,
        lastSyncedAt: new Date().toISOString(),
        syncedViaShortcut: true
      });
      audioAlarm.playChime();
      onClose();
    } catch {
      alert('Invalid JSON format. Please verify the syntax.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-ios-card rounded-t-3xl sm:rounded-3xl border border-ios-separator p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ios-separator/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">iOS Apple Health Sync</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-ios-cardElevated flex items-center justify-center text-ios-textSecondary hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab pills */}
        <div className="flex bg-ios-cardElevated p-1 rounded-xl mt-4">
          <button
            onClick={() => setActiveTab('run')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'run' ? 'bg-ios-blue text-white shadow-sm' : 'text-ios-textSecondary hover:text-white'}`}
          >
            1-Tap Sync
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'guide' ? 'bg-ios-blue text-white shadow-sm' : 'text-ios-textSecondary hover:text-white'}`}
          >
            Setup Recipe
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'manual' ? 'bg-ios-blue text-white shadow-sm' : 'text-ios-textSecondary hover:text-white'}`}
          >
            Quick Test JSON
          </button>
        </div>

        {/* Tab 1: Run Shortcut */}
        {activeTab === 'run' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-ios-cardElevated to-zinc-900 border border-ios-separator">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-ios-pink" />
                Launch 'PlanFlowHealthSync'
              </h3>
              <p className="text-xs text-ios-textSecondary mt-1 leading-relaxed">
                Tapping the button below launches the native Apple Shortcuts engine on your iPhone. It queries HealthKit for your steps, sleep duration, and active calories, then redirects back to PlanFlow with your live metrics.
              </p>

              <button
                onClick={handleRunShortcut}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25"
              >
                <Play className="w-4 h-4 fill-white" />
                Sync Apple Health Now
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-ios-cardElevated border border-ios-separator text-xs text-ios-textSecondary space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <HelpCircle className="w-3.5 h-3.5 text-ios-blue" />
                How it works without Swift code
              </div>
              <p className="leading-relaxed">
                iOS web browsers cannot access Apple Health directly due to Apple sandboxing. iOS Shortcuts acts as the authorized native bridge: it has built-in permission to read HealthKit and pass values securely into your web app.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Guide */}
        {activeTab === 'guide' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ios-textSecondary uppercase">3-Minute Setup Recipe</span>
              <button
                onClick={handleCopyGuide}
                className="text-xs text-ios-blue hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-ios-green" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy Steps'}
              </button>
            </div>

            <div className="space-y-2.5">
              {guideSteps.map((step) => (
                <div key={step.step} className="p-3 rounded-xl bg-ios-cardElevated border border-ios-separator/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-ios-blue/20 text-ios-blue flex items-center justify-center text-[11px]">
                      {step.step}
                    </span>
                    {step.title}
                  </div>
                  <p className="text-xs text-ios-textSecondary mt-1 ml-7 leading-relaxed">
                    {step.instruction}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-ios-blue/10 border border-ios-blue/20 text-xs text-ios-blue flex items-center gap-2">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Tip: Set an iOS Personal Automation to run this every day at 8:00 AM automatically!</span>
            </div>
          </div>
        )}

        {/* Tab 3: Manual JSON Test */}
        {activeTab === 'manual' && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-ios-textSecondary">
              You can test the Apple Health metrics visualization right now by applying sample health data:
            </p>
            <textarea
              value={manualJson}
              onChange={(e) => setManualJson(e.target.value)}
              rows={6}
              className="w-full p-3 rounded-xl bg-ios-cardElevated border border-ios-separator text-white text-xs font-mono focus:outline-none focus:border-ios-pink resize-none"
            />
            <button
              onClick={handleApplyManual}
              className="w-full py-2.5 rounded-xl bg-ios-cardElevated hover:bg-zinc-800 border border-ios-separator text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-ios-green" />
              Apply Test Health Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

