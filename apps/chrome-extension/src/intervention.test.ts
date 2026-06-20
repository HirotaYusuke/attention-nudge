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
});
