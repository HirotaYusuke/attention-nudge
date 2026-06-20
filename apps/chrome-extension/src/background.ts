import { incrementDailyStats } from "./storage";

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isStatsMessage(message)) {
    return false;
  }

  incrementDailyStats({
    interventionCount: message.intervention ? 1 : 0,
    awayReturnCount: message.awayReturn ? 1 : 0
  })
    .then((stats) => sendResponse({ ok: true, stats }))
    .catch((error: unknown) => sendResponse({ ok: false, error: String(error) }));

  return true;
});

function isStatsMessage(message: unknown): message is { type: "attention-nudge:stats"; intervention?: boolean; awayReturn?: boolean } {
  return typeof message === "object" && message !== null && (message as { type?: unknown }).type === "attention-nudge:stats";
}
