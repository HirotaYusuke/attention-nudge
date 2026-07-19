import { incrementDailyStats } from "./storage";

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.runtime.openOptionsPage();
});

// incrementDailyStats は read-modify-write なので、同時に届いた統計メッセージを
// 並行実行すると加算が失われる。キューで直列化する。
let statsWriteQueue: Promise<unknown> = Promise.resolve();

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isStatsMessage(message)) {
    return false;
  }

  statsWriteQueue = statsWriteQueue
    .then(() =>
      incrementDailyStats({
        interventionCount: message.intervention ? 1 : 0,
        awayReturnCount: message.awayReturn ? 1 : 0
      })
    )
    .then(
      (stats) => sendResponse({ ok: true, stats }),
      (error: unknown) => sendResponse({ ok: false, error: String(error) })
    );

  return true;
});

function isStatsMessage(message: unknown): message is { type: "attention-nudge:stats"; intervention?: boolean; awayReturn?: boolean } {
  return typeof message === "object" && message !== null && (message as { type?: unknown }).type === "attention-nudge:stats";
}
