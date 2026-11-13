import { AppleHealthSummary } from '../types/health';
import { storageService } from './storageService';

export interface ShortcutPayload {
  steps?: number;
  sleepHours?: number;
  activeCalories?: number;
  waterOunces?: number;
  restingHeartRate?: number;
}

export const DEFAULT_SHORTCUT_NAMES = ['PlanFlowHealtSync', 'PlanFlowHealthSync'];
export const SHORTCUT_NAME_ALARM = 'PlanFlowSetAlarm';

/**
 * Parses health data from a raw URL or string containing query parameters or JSON
 */
export function parseHealthFromParams(searchOrHash: string): Partial<AppleHealthSummary> | null {
  if (!searchOrHash || searchOrHash.length < 2) return null;

  try {
    // Normalize string: strip leading ? or # or #/
    let queryStr = searchOrHash;
    if (queryStr.startsWith('#')) {
      const qIndex = queryStr.indexOf('?');
      if (qIndex !== -1) {
        queryStr = queryStr.substring(qIndex + 1);
      } else {
        queryStr = queryStr.substring(1);
      }
    } else if (queryStr.startsWith('?')) {
      queryStr = queryStr.substring(1);
    }

    const params = new URLSearchParams(queryStr);

    // 1. Check for JSON in ?health= or ?healthData= or ?data=
    const jsonParam = params.get('health') || params.get('healthData') || params.get('data');
    if (jsonParam) {
      try {
        let decodedStr = decodeURIComponent(jsonParam);
        // Handle base64 encoded JSON
        if (decodedStr.startsWith('eyJ')) {
          decodedStr = atob(decodedStr);
        }
        const decoded = JSON.parse(decodedStr);
        return {
          steps: Number(decoded.steps || decoded.stepCount || decoded.step) || 0,
          sleepHours: Number(decoded.sleepHours || decoded.sleep || decoded.timeInBed) || 0,
          activeCalories: Number(decoded.activeCalories || decoded.calories || decoded.activeEnergy) || 0,
          waterOunces: Number(decoded.waterOunces || decoded.water) || 0,
          restingHeartRate: decoded.restingHeartRate || decoded.heartRate || decoded.hr ? Number(decoded.restingHeartRate || decoded.heartRate || decoded.hr) : undefined,
          lastSyncedAt: new Date().toISOString(),
          syncedViaShortcut: true
        };
      } catch (e) {
        console.warn('Failed to parse jsonParam:', e);
      }
    }

    // 2. Check for flat parameters: ?steps=8500&calories=450&sleep=7.5
    const stepsVal = params.get('steps') || params.get('step') || params.get('stepCount');
    const caloriesVal = params.get('calories') || params.get('activeCalories') || params.get('cal') || params.get('activeEnergy');
    const sleepVal = params.get('sleep') || params.get('sleepHours') || params.get('timeInBed');
    const waterVal = params.get('water') || params.get('waterOunces');
    const hrVal = params.get('hr') || params.get('heartRate') || params.get('restingHeartRate');

    if (stepsVal !== null || caloriesVal !== null || sleepVal !== null || waterVal !== null || hrVal !== null) {
      const result: Partial<AppleHealthSummary> = {
        lastSyncedAt: new Date().toISOString(),
        syncedViaShortcut: true
      };

      if (stepsVal !== null) result.steps = Math.max(0, parseInt(stepsVal, 10) || 0);
      if (caloriesVal !== null) result.activeCalories = Math.max(0, parseInt(caloriesVal, 10) || 0);
      if (sleepVal !== null) result.sleepHours = Math.max(0, parseFloat(sleepVal) || 0);
      if (waterVal !== null) result.waterOunces = Math.max(0, parseInt(waterVal, 10) || 0);
      if (hrVal !== null) result.restingHeartRate = Math.max(0, parseInt(hrVal, 10) || 0);

      return result;
    }
  } catch (err) {
    console.warn('Error parsing health from params:', err);
  }

  return null;
}

/**
 * Parses health data passed via URL query parameters or hash when returning from an iOS Shortcut
 * Cleans the URL query without triggering a page reload.
 */
export function parseIncomingShortcutData(): Partial<AppleHealthSummary> | null {
  if (typeof window === 'undefined') return null;

  // Check search query (?steps=...)
  let result = parseHealthFromParams(window.location.search);

  // If not in search, check hash (#steps=... or #/health?steps=...)
  if (!result && window.location.hash) {
    result = parseHealthFromParams(window.location.hash);
  }

  if (result) {
    try {
      // Clean query parameter from URL without page reload
      const cleanPath = window.location.pathname;
      window.history.replaceState({}, '', cleanPath);
    } catch {
      // Ignore URL replacement errors
    }
    return result;
  }

  return null;
}

/**
 * Parses health data from arbitrary text (such as clipboard contents)
 * E.g. {"steps": 8500, "sleepHours": 7.5} or "steps: 8500, calories: 450"
 */
export function parseHealthFromText(text: string): Partial<AppleHealthSummary> | null {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();

  // Try parsing as JSON
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);
      return {
        steps: Number(data.steps || data.stepCount) || 0,
        sleepHours: Number(data.sleepHours || data.sleep) || 0,
        activeCalories: Number(data.activeCalories || data.calories) || 0,
        waterOunces: Number(data.waterOunces || data.water) || 0,
        restingHeartRate: data.restingHeartRate || data.heartRate ? Number(data.restingHeartRate || data.heartRate) : undefined,
        lastSyncedAt: new Date().toISOString(),
        syncedViaShortcut: true
      };
    } catch {
      // Continue to regex
    }
  }

  // Try parsing as query string or URL if contains & or ? or =
  if (trimmed.includes('&') || trimmed.includes('?') || trimmed.includes('=')) {
    const fromParams = parseHealthFromParams(trimmed);
    if (fromParams) return fromParams;
  }

  // Try extracting with regex (e.g. steps: 8400 or steps=8400)
  const stepsMatch = trimmed.match(/steps?[:=]\s*(\d+)/i);
  const caloriesMatch = trimmed.match(/(?:calories|cal|active energy)[:=]\s*(\d+)/i);
  const sleepMatch = trimmed.match(/(?:sleep|hours)[:=]\s*(\d+(?:\.\d+)?)/i);

  if (stepsMatch || caloriesMatch || sleepMatch) {
    const res: Partial<AppleHealthSummary> = {
      lastSyncedAt: new Date().toISOString(),
      syncedViaShortcut: true
    };
    if (stepsMatch) res.steps = parseInt(stepsMatch[1], 10);
    if (caloriesMatch) res.activeCalories = parseInt(caloriesMatch[1], 10);
    if (sleepMatch) res.sleepHours = parseFloat(sleepMatch[1]);
    return res;
  }

  return null;
}

/**
 * Triggers the native iOS Shortcuts app to read Apple Health
 */
export function triggerHealthSyncShortcut(customShortcutName?: string): void {
  const settings = storageService.getSettings();
  const shortcutName = customShortcutName || settings.shortcutName || 'PlanFlowHealtSync';

  // Base URL pointing back to current application
  const returnBase = window.location.origin + window.location.pathname;
  const shortcutUrl = `shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}&input=text&text=${encodeURIComponent(returnBase)}`;

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
 * Returns the exact return URL template to be used inside Apple Shortcuts
 */
export function getRecommendedReturnUrlTemplate(): string {
  if (typeof window === 'undefined') return 'https://your-site.github.io/repo/?steps=[Steps]&calories=[Calories]&sleep=[Sleep]';
  const base = window.location.origin + window.location.pathname;
  return `${base}?steps=[Step Count]&calories=[Active Energy]&sleep=[Time in Bed]`;
}
