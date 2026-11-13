import { AppleHealthSummary } from '../types/health';

export interface ShortcutPayload {
  steps?: number;
  sleepHours?: number;
  activeCalories?: number;
  waterOunces?: number;
  restingHeartRate?: number;
}

export const SHORTCUT_NAME_HEALTH = 'PlanFlowHealthSync';
export const SHORTCUT_NAME_ALARM = 'PlanFlowSetAlarm';

/**
 * Parses health data passed via URL query parameters when returning from an iOS Shortcut
 * Example: https://<site>/?health={"steps":8200,"sleepHours":7.5,"activeCalories":420}
 */
export function parseIncomingShortcutData(): Partial<AppleHealthSummary> | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const healthParam = urlParams.get('health') || urlParams.get('healthData');
    
    if (healthParam) {
      const decoded = JSON.parse(decodeURIComponent(healthParam));
      // Clean query parameter from URL without page reload
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);

      return {
        steps: Number(decoded.steps) || 0,
        sleepHours: Number(decoded.sleepHours) || 0,
        activeCalories: Number(decoded.activeCalories) || 0,
        waterOunces: Number(decoded.waterOunces) || 0,
        restingHeartRate: decoded.restingHeartRate ? Number(decoded.restingHeartRate) : undefined,
        lastSyncedAt: new Date().toISOString(),
        syncedViaShortcut: true
      };
    }
  } catch (err) {
    console.warn('Failed to parse incoming Apple Health shortcut data:', err);
  }
  return null;
}

/**
 * Triggers the native iOS Shortcuts app to read Apple Health
 */
export function triggerHealthSyncShortcut(): void {
  // Return URL points right back to current PWA location
  const returnUrl = encodeURIComponent(window.location.href);
  const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME_HEALTH)}&input=text&text=${returnUrl}`;
  
  window.location.href = shortcutUrl;
}

/**
 * Triggers an iOS Shortcut to create or toggle a native Clock alarm
 */
export function triggerNativeAlarmShortcut(time: string, label: string): void {
  const inputData = encodeURIComponent(JSON.stringify({ time, label }));
  const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(SHORTCUT_NAME_ALARM)}&input=text&text=${inputData}`;
  window.location.href = shortcutUrl;
}

/**
 * Returns user-friendly step-by-step instructions to configure the shortcut in iOS Shortcuts app
 */
export function getAppleHealthShortcutGuide(): { step: number; title: string; instruction: string }[] {
  return [
    {
      step: 1,
      title: "Open iOS 'Shortcuts' App",
      instruction: "Tap the '+' icon at the top right to create a new shortcut named 'PlanFlowHealthSync'."
    },
    {
      step: 2,
      title: "Add Health Actions",
      instruction: "Add 'Find Health Samples' for: 1) Steps (Today), 2) Sleep Analysis (Time in Bed), and 3) Active Energy."
    },
    {
      step: 3,
      title: "Format as JSON / Text",
      instruction: "Add a 'Dictionary' or 'Text' action with keys: steps, sleepHours, activeCalories."
    },
    {
      step: 4,
      title: "Open Return URL",
      instruction: "Add 'Open URLs' pointing to your PlanFlow URL with ?health={JSON} appended. You can also run it automatically every morning via Shortcuts Automations!"
    }
  ];
}

