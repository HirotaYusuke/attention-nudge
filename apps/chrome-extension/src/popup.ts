import { getDailyStats, getSettings, saveSettings } from "./storage";

const enabledInput = mustGet<HTMLInputElement>("enabled");
const interventionCount = mustGet<HTMLElement>("interventionCount");
const awayCount = mustGet<HTMLElement>("awayCount");
const testButton = mustGet<HTMLButtonElement>("testNudge");
const status = mustGet<HTMLElement>("status");

void init();

async function init(): Promise<void> {
  const [settings, stats] = await Promise.all([getSettings(), getDailyStats()]);
  enabledInput.checked = settings.enabled;
  interventionCount.textContent = String(stats.interventionCount);
  awayCount.textContent = String(stats.awayReturnCount);

  enabledInput.addEventListener("change", async () => {
    const next = { ...(await getSettings()), enabled: enabledInput.checked };
    await saveSettings(next);
    await notifySettingsChanged(next);
    status.textContent = next.enabled ? "有効にしました" : "無効にしました";
  });

  testButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id === undefined) {
      status.textContent = "対象タブが見つかりません";
      return;
    }
    await chrome.tabs.sendMessage(tab.id, { type: "attention-nudge:test" });
    status.textContent = "現在のページで介入を表示しました";
  });
}

async function notifySettingsChanged(settings: unknown): Promise<void> {
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
