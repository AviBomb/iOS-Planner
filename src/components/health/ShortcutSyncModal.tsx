import React, { useState } from 'react';
import { X, Play, Copy, Check, ExternalLink, Sparkles, AlertTriangle } from 'lucide-react';
import { triggerHealthSyncShortcut } from '../../services/shortcutsBridge';
import { AppleHealthSummary } from '../../types/health';
import { audioAlarm } from '../../services/audioAlarmService';
import { storageService } from '../../services/storageService';

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
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [shortcutName, setShortcutName] = useState(() => storageService.getSettings().shortcutName || 'PlanFlowHealtSync');
  const [manualJson, setManualJson] = useState('{\n  "steps": 9250,\n  "sleepHours": 7.8,\n  "activeCalories": 520,\n  "waterOunces": 64,\n  "restingHeartRate": 61\n}');
  const [activeTab, setActiveTab] = useState<'run' | 'guide' | 'manual'>('run');

  if (!isOpen) return null;

  const handleShortcutNameChange = (newName: string) => {
    setShortcutName(newName);
    storageService.saveSettings({ shortcutName: newName });
  };

  const handleRunShortcut = () => {
    audioAlarm.playChime();
    triggerHealthSyncShortcut(shortcutName);
  };

  const returnUrlBase = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://your-site.github.io/repo/';
  const urlTemplate = `${returnUrlBase}?steps=[Step Count]&calories=[Active Energy]&sleep=[Time in Bed]`;

  const handleCopyUrlTemplate = () => {
    navigator.clipboard.writeText(urlTemplate);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyGuide = () => {
    const text = `PlanFlow Apple Shortcuts Recipe:
Shortcut Name: ${shortcutName}

1. Action 1: "Find Health Samples" -> Type: Steps (Today)
2. Action 2: "Find Health Samples" -> Type: Active Energy (Today)
3. Action 3: "Find Health Samples" -> Type: Sleep Analysis (Today)
4. Action 4: "URL" -> Set to: ${urlTemplate}
5. Action 5: "Open URLs" -> Point to the URL above.
IMPORTANT: Delete any "Show Result" action so iOS does not halt on a "Done" screen!`;

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
            Fix "Done" Screen
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
            {/* Shortcut Name Selector */}
            <div className="p-3.5 rounded-2xl bg-ios-cardElevated border border-ios-separator">
              <label className="block text-[11px] font-bold text-ios-textSecondary uppercase tracking-wider mb-1">
                Shortcut Name on Your iPhone
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shortcutName}
                  onChange={(e) => handleShortcutNameChange(e.target.value)}
                  placeholder="e.g. PlanFlowHealtSync"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-ios-card border border-ios-separator text-white text-xs font-mono focus:outline-none focus:border-ios-pink"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleShortcutNameChange('PlanFlowHealtSync')}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    shortcutName === 'PlanFlowHealtSync' ? 'bg-ios-blue text-white border-ios-blue' : 'text-ios-textSecondary border-ios-separator'
                  }`}
                >
                  PlanFlowHealtSync
                </button>
                <button
                  type="button"
                  onClick={() => handleShortcutNameChange('PlanFlowHealthSync')}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    shortcutName === 'PlanFlowHealthSync' ? 'bg-ios-blue text-white border-ios-blue' : 'text-ios-textSecondary border-ios-separator'
                  }`}
                >
                  PlanFlowHealthSync
                </button>
              </div>
            </div>

            {/* Launch Action */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-ios-cardElevated to-zinc-900 border border-ios-separator">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-ios-pink" />
                Launch '{shortcutName}'
              </h3>
              <p className="text-xs text-ios-textSecondary mt-1 leading-relaxed">
                Tapping below launches your shortcut on your iPhone. It queries Apple Health and redirects back into PlanFlow with live values.
              </p>

              <button
                onClick={handleRunShortcut}
                className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25"
              >
                <Play className="w-4 h-4 fill-white" />
                Sync Apple Health Now
              </button>
            </div>

            {/* Done Screen Tip Alert */}
            <div className="p-3.5 rounded-2xl bg-ios-yellow/10 border border-ios-yellow/20 text-xs text-ios-yellow flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Seeing a "Done" button on your phone?</span>
                <p className="text-[11px] text-ios-yellow/80 mt-0.5 leading-relaxed">
                  Switch to the "Fix 'Done' Screen" tab above. Make sure your shortcut's final action is <strong>"Open URLs"</strong>, not "Show Result"!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Guide & Fix Done Screen */}
        {activeTab === 'guide' && (
          <div className="mt-4 space-y-3">
            <div className="p-3.5 rounded-2xl bg-ios-red/10 border border-ios-red/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ios-red">
                <AlertTriangle className="w-4 h-4" />
                Why it halted on "Done" with data on screen:
              </div>
              <p className="text-xs text-ios-textSecondary mt-1 leading-relaxed">
                If an iOS Shortcut outputs a value without opening a URL, or has a <strong>"Show Result"</strong> action, iOS stops and waits for you to tap "Done".
                To send the data into PlanFlow automatically, the shortcut must end with <strong>Open URLs</strong>.
              </p>
            </div>

            {/* Copy Return URL action */}
            <div className="p-3.5 rounded-2xl bg-ios-cardElevated border border-ios-separator">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ios-textSecondary uppercase">Your Return URL</span>
                <button
                  onClick={handleCopyUrlTemplate}
                  className="text-xs text-ios-blue hover:underline flex items-center gap-1 font-semibold"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-ios-green" /> : <Copy className="w-3 h-3" />}
                  {copiedUrl ? 'Copied URL!' : 'Copy URL'}
                </button>
              </div>
              <p className="text-xs text-white font-mono bg-ios-card p-2 rounded-lg mt-1.5 break-all select-all">
                {urlTemplate}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ios-textSecondary uppercase">Exact 3-Step Setup</span>
              <button
                onClick={handleCopyGuide}
                className="text-xs text-ios-blue hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-ios-green" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied Recipe!' : 'Copy Recipe'}
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-ios-cardElevated border border-ios-separator/60">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-ios-blue/20 text-ios-blue flex items-center justify-center text-[11px]">1</span>
                  Find Health Samples
                </div>
                <p className="text-xs text-ios-textSecondary mt-1 ml-7 leading-relaxed">
                  Add "Find Health Samples" for Steps (Today), Active Energy (Today), and Sleep (Today).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-ios-cardElevated border border-ios-separator/60">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-5 h-5 rounded-full bg-ios-blue/20 text-ios-blue flex items-center justify-center text-[11px]">2</span>
                  Add URL Action
                </div>
                <p className="text-xs text-ios-textSecondary mt-1 ml-7 leading-relaxed">
                  Add a "URL" action, paste your Return URL from above, and insert the Health sample variables into [Step Count], [Active Energy], and [Sleep].
                </p>
              </div>

              <div className="p-3 rounded-xl bg-ios-green/10 border border-ios-green/30">
                <div className="flex items-center gap-2 text-xs font-bold text-ios-green">
                  <span className="w-5 h-5 rounded-full bg-ios-green/20 text-ios-green flex items-center justify-center text-[11px]">3</span>
                  Add "Open URLs" Action (Final Step)
                </div>
                <p className="text-xs text-ios-textSecondary mt-1 ml-7 leading-relaxed">
                  Add "Open URLs" targeting the URL from Step 2. Delete any "Show Result" action. Now iOS immediately redirects with live metrics!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-ios-blue/10 border border-ios-blue/20 text-xs text-ios-blue flex items-center gap-2">
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>Personal Automation: In Shortcuts &gt; Automations, create an automation to run this shortcut every morning or when PlanFlow opens!</span>
            </div>
          </div>
        )}

        {/* Tab 3: Manual JSON Test */}
        {activeTab === 'manual' && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-ios-textSecondary">
              Apply sample health data to verify the dashboard widgets and health ring animations:
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
