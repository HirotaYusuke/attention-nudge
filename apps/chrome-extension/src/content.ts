import {
  createInitialState,
  reduceAttentionEvent,
  type ActivityEventType,
  type AttentionState
} from "@attention-nudge/core";
import { showManualTestIntervention, showVisualIntervention } from "./intervention";
import { getSettings, type ExtensionSettings } from "./storage";

let settings: ExtensionSettings | null = null;
let state: AttentionState = createInitialState();
let tickTimer: number | null = null;

void bootstrap();

async function bootstrap(): Promise<void> {
  settings = await getSettings();
  if (isCurrentSiteDisabled(settings)) {
    return;
  }

  attachPageListeners();
  attachMediaListeners();
  attachExtensionListeners();
  tickTimer = window.setInterval(() => dispatchActivity("tick"), 10_000);
}

function attachPageListeners(): void {
  document.addEventListener("visibilitychange", () => {
    dispatchActivity(document.visibilityState === "hidden" ? "tab_hidden" : "tab_visible");
  });
  window.addEventListener("blur", () => dispatchActivity("window_blur"));
  window.addEventListener("focus", () => dispatchActivity("window_focus"));

  const activityOptions: AddEventListenerOptions = { passive: true, capture: true };
  document.addEventListener("keydown", () => dispatchActivity("keyboard_activity"), activityOptions);
  document.addEventListener("pointerdown", () => dispatchActivity("pointer_activity"), activityOptions);
  document.addEventListener("scroll", () => dispatchActivity("scroll_activity"), activityOptions);
}

function attachMediaListeners(): void {
  for (const media of document.querySelectorAll("video, audio")) {
    observeMedia(media);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        if (node.matches("video, audio")) {
          observeMedia(node);
        }
        for (const media of node.querySelectorAll("video, audio")) {
          observeMedia(media);
        }
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function observeMedia(element: Element): void {
  if (!(element instanceof HTMLMediaElement) || element.dataset.attentionNudgeObserved === "true") {
    return;
  }
  element.dataset.attentionNudgeObserved = "true";
  element.addEventListener("play", () => dispatchActivity("media_playing"), { passive: true });
  element.addEventListener("pause", () => dispatchActivity("media_paused"), { passive: true });
  element.addEventListener("ended", () => dispatchActivity("media_paused"), { passive: true });
  if (!element.paused && !element.ended) {
    dispatchActivity("media_playing");
  }
}

function attachExtensionListeners(): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (isTestMessage(message)) {
      showManualTestIntervention();
      sendResponse({ ok: true });
      return true;
    }

    if (isSettingsChangedMessage(message)) {
      settings = message.settings;
      if (tickTimer !== null && isCurrentSiteDisabled(settings)) {
        window.clearInterval(tickTimer);
        tickTimer = null;
      }
      sendResponse({ ok: true });
      return true;
    }

    return false;
  });
}

function dispatchActivity(type: ActivityEventType): void {
  if (!settings || isCurrentSiteDisabled(settings)) {
    return;
  }

  const previousAwayAt = state.lastAwayAt;
  const update = reduceAttentionEvent(state, { type, now: Date.now() }, settings);
  state = update.state;

  if (previousAwayAt !== null && (type === "tab_visible" || type === "window_focus")) {
    void chrome.runtime.sendMessage({ type: "attention-nudge:stats", awayReturn: true });
  }

  if (!update.intervention) {
    return;
  }

  showVisualIntervention(update.intervention);
  void chrome.runtime.sendMessage({ type: "attention-nudge:stats", intervention: true });
}

function isCurrentSiteDisabled(currentSettings: ExtensionSettings): boolean {
  const host = window.location.hostname.toLowerCase();
  return currentSettings.disabledSites.some((site) => {
    const normalized = site.trim().toLowerCase();
    return normalized !== "" && (host === normalized || host.endsWith(`.${normalized}`));
  });
}

function isTestMessage(message: unknown): message is { type: "attention-nudge:test" } {
  return typeof message === "object" && message !== null && (message as { type?: unknown }).type === "attention-nudge:test";
}

function isSettingsChangedMessage(message: unknown): message is { type: "attention-nudge:settings-changed"; settings: ExtensionSettings } {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as { type?: unknown }).type === "attention-nudge:settings-changed" &&
    typeof (message as { settings?: unknown }).settings === "object"
  );
}
