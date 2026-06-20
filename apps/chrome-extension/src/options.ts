import type { InterventionStrength } from "@attention-nudge/core";
import { getSettings, saveSettings, type ExtensionSettings } from "./storage";

const form = mustGet<HTMLFormElement>("settingsForm");
const enabledInput = mustGet<HTMLInputElement>("enabled");
const strengthSelect = mustGet<HTMLSelectElement>("interventionStrength");
const passiveThresholdInput = mustGet<HTMLInputElement>("passiveThresholdSeconds");
const cooldownInput = mustGet<HTMLInputElement>("cooldownMinutes");
const disabledSitesInput = mustGet<HTMLTextAreaElement>("disabledSites");
const status = mustGet<HTMLElement>("status");

void init();

async function init(): Promise<void> {
  renderSettings(await getSettings());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const next = readSettings();
    await saveSettings(next);
    await notifySettingsChanged(next);
    status.textContent = "保存しました";
  });
}

function renderSettings(settings: ExtensionSettings): void {
  enabledInput.checked = settings.enabled;
  strengthSelect.value = settings.interventionStrength;
  passiveThresholdInput.value = String(Math.round(settings.passiveThresholdMs / 1000));
  cooldownInput.value = String(settings.cooldownMinutes);
  disabledSitesInput.value = settings.disabledSites.join("\n");
}

function readSettings(): ExtensionSettings {
  return {
    enabled: enabledInput.checked,
    interventionStrength: strengthSelect.value as InterventionStrength,
    cooldownMinutes: Number(cooldownInput.value),
    passiveThresholdMs: Number(passiveThresholdInput.value) * 1000,
    mediaPassiveThresholdMs: 600_000,
    minAwayMs: 5_000,
    disabledSites: disabledSitesInput.value
      .split("\n")
      .map((site) => site.trim())
      .filter(Boolean)
  };
}

async function notifySettingsChanged(settings: ExtensionSettings): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(
    tabs.flatMap((tab) => (tab.id === undefined ? [] : [chrome.tabs.sendMessage(tab.id, { type: "attention-nudge:settings-changed", settings })]))
  );
}

function mustGet<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element: ${id}`);
  }
  return element as T;
}
