import { DEFAULT_SETTINGS, type AttentionSettings } from "@attention-nudge/core";

export interface ExtensionSettings extends AttentionSettings {
  disabledSites: string[];
}

export interface DailyStats {
  date: string;
  interventionCount: number;
  awayReturnCount: number;
}

const SETTINGS_KEY = "settings";
const DAILY_STATS_KEY = "dailyStats";

export const DEFAULT_EXTENSION_SETTINGS: ExtensionSettings = {
  ...DEFAULT_SETTINGS,
  disabledSites: []
};

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  const settings = result[SETTINGS_KEY] as Partial<ExtensionSettings> | undefined;
  return {
    ...DEFAULT_EXTENSION_SETTINGS,
    ...settings,
    disabledSites: Array.isArray(settings?.disabledSites) ? settings.disabledSites : []
  };
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

export async function getDailyStats(now = new Date()): Promise<DailyStats> {
  const today = toDateKey(now);
  const result = await chrome.storage.local.get(DAILY_STATS_KEY);
  const stats = result[DAILY_STATS_KEY] as DailyStats | undefined;
  if (stats?.date === today) {
    return stats;
  }
  return {
    date: today,
    interventionCount: 0,
    awayReturnCount: 0
  };
}

export async function incrementDailyStats(delta: Partial<Omit<DailyStats, "date">>): Promise<DailyStats> {
  const current = await getDailyStats();
  const next: DailyStats = {
    ...current,
    interventionCount: current.interventionCount + (delta.interventionCount ?? 0),
    awayReturnCount: current.awayReturnCount + (delta.awayReturnCount ?? 0)
  };
  await chrome.storage.local.set({ [DAILY_STATS_KEY]: next });
  return next;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
