export type ActivityEventType =
  | "tick"
  | "tab_hidden"
  | "tab_visible"
  | "window_blur"
  | "window_focus"
  | "keyboard_activity"
  | "pointer_activity"
  | "scroll_activity"
  | "media_playing"
  | "media_paused";

export type InterventionReason = "return-from-away" | "passive-idle";

export type InterventionStrength = "low" | "medium" | "high";

export interface AttentionSettings {
  enabled: boolean;
  interventionStrength: InterventionStrength;
  cooldownMinutes: number;
  passiveThresholdMs: number;
  mediaPassiveThresholdMs: number;
  minAwayMs: number;
}

export interface ActivityEvent {
  type: ActivityEventType;
  now: number;
}

export interface AttentionState {
  isActive: boolean;
  mediaPlaying: boolean;
  lastActivityAt: number;
  lastAwayAt: number | null;
  lastInterventionAt: number | null;
}

export interface InterventionRequest {
  reason: InterventionReason;
  now: number;
  strength: InterventionStrength;
}

export interface AttentionUpdate {
  state: AttentionState;
  intervention: InterventionRequest | null;
}

export const DEFAULT_SETTINGS: AttentionSettings = {
  enabled: true,
  interventionStrength: "medium",
  cooldownMinutes: 3,
  passiveThresholdMs: 90_000,
  mediaPassiveThresholdMs: 600_000,
  minAwayMs: 5_000
};

export function createInitialState(now = Date.now()): AttentionState {
  return {
    isActive: true,
    mediaPlaying: false,
    lastActivityAt: now,
    lastAwayAt: null,
    lastInterventionAt: null
  };
}

export function normalizeSettings(settings: Partial<AttentionSettings> = {}): AttentionSettings {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  return {
    enabled: merged.enabled,
    interventionStrength: merged.interventionStrength,
    cooldownMinutes: clampNumber(merged.cooldownMinutes, 1, 60),
    passiveThresholdMs: clampNumber(merged.passiveThresholdMs, 15_000, 3_600_000),
    mediaPassiveThresholdMs: clampNumber(merged.mediaPassiveThresholdMs, 60_000, 7_200_000),
    minAwayMs: clampNumber(merged.minAwayMs, 1_000, 300_000)
  };
}

export function reduceAttentionEvent(
  state: AttentionState,
  event: ActivityEvent,
  rawSettings: Partial<AttentionSettings> = {}
): AttentionUpdate {
  const settings = normalizeSettings(rawSettings);
  let next: AttentionState = { ...state };
  let intervention: InterventionRequest | null = null;

  switch (event.type) {
    case "tab_hidden":
    case "window_blur":
      next = {
        ...next,
        isActive: false,
        lastAwayAt: next.lastAwayAt ?? event.now
      };
      break;
    case "tab_visible":
    case "window_focus":
      intervention = maybeCreateReturnIntervention(next, event.now, settings);
      next = {
        ...next,
        isActive: true,
        lastActivityAt: event.now,
        lastAwayAt: null,
        lastInterventionAt: intervention ? event.now : next.lastInterventionAt
      };
      break;
    case "keyboard_activity":
    case "pointer_activity":
    case "scroll_activity":
      next = {
        ...next,
        isActive: true,
        lastActivityAt: event.now
      };
      break;
    case "media_playing":
      next = {
        ...next,
        mediaPlaying: true,
        lastActivityAt: event.now
      };
      break;
    case "media_paused":
      next = {
        ...next,
        mediaPlaying: false,
        lastActivityAt: event.now
      };
      break;
    case "tick":
      intervention = maybeCreateIdleIntervention(next, event.now, settings);
      next = {
        ...next,
        lastInterventionAt: intervention ? event.now : next.lastInterventionAt
      };
      break;
  }

  if (!settings.enabled) {
    return { state: next, intervention: null };
  }

  return { state: next, intervention };
}

function maybeCreateReturnIntervention(
  state: AttentionState,
  now: number,
  settings: AttentionSettings
): InterventionRequest | null {
  if (!settings.enabled || state.lastAwayAt === null) {
    return null;
  }
  const awayDuration = now - state.lastAwayAt;
  if (awayDuration < settings.minAwayMs || isInCooldown(state, now, settings)) {
    return null;
  }
  return {
    reason: "return-from-away",
    now,
    strength: settings.interventionStrength
  };
}

function maybeCreateIdleIntervention(
  state: AttentionState,
  now: number,
  settings: AttentionSettings
): InterventionRequest | null {
  if (!settings.enabled || !state.isActive || isInCooldown(state, now, settings)) {
    return null;
  }
  const threshold = state.mediaPlaying ? settings.mediaPassiveThresholdMs : settings.passiveThresholdMs;
  if (now - state.lastActivityAt < threshold) {
    return null;
  }
  return {
    reason: "passive-idle",
    now,
    strength: settings.interventionStrength
  };
}

function isInCooldown(state: AttentionState, now: number, settings: AttentionSettings): boolean {
  if (state.lastInterventionAt === null) {
    return false;
  }
  return now - state.lastInterventionAt < settings.cooldownMinutes * 60_000;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}
