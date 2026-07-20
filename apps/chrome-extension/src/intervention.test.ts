import { beforeEach, describe, expect, it, vi } from "vitest";
import { showVisualIntervention } from "./intervention";

describe("visual intervention", () => {
  beforeEach(() => {
    document.documentElement.innerHTML = "<head></head><body></body>";
    vi.useFakeTimers();
  });

  it("adds and removes the active intervention class", () => {
    showVisualIntervention({
      reason: "passive-idle",
      now: 1,
      strength: "high"
    });

    const root = document.getElementById("attention-nudge-root");
    expect(root).not.toBeNull();
    expect(root?.dataset.reason).toBe("passive-idle");

    vi.advanceTimersByTime(16);
    expect(root?.classList.contains("attention-nudge-active")).toBe(true);

    vi.advanceTimersByTime(2_800);
    expect(root?.classList.contains("attention-nudge-active")).toBe(false);
  });

  it("renders a contrast ring instead of a dimming overlay", () => {
    showVisualIntervention({
      reason: "return-from-away",
      now: 1,
      strength: "medium"
    });

    const root = document.getElementById("attention-nudge-root");
    const ring = root?.querySelector(".attention-nudge-ring");
    expect(ring).not.toBeNull();
    // 背景を暗くするオーバーレイ要素は持たない（明暗非依存の設計）。
    expect(root?.style.getPropertyValue("--attention-nudge-glow")).not.toBe("");
  });

  it("reuses a single root across repeated interventions", () => {
    showVisualIntervention({ reason: "passive-idle", now: 1, strength: "low" });
    showVisualIntervention({ reason: "passive-idle", now: 2, strength: "high" });

    expect(document.querySelectorAll("#attention-nudge-root")).toHaveLength(1);
    expect(document.querySelectorAll(".attention-nudge-ring")).toHaveLength(1);
  });
});
