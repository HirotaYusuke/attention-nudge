import { describe, expect, it } from "vitest";
import { createInitialState, reduceAttentionEvent } from "../src/index";

describe("attention event reducer", () => {
  it("creates an intervention when the user returns after being away", () => {
    const initial = createInitialState(0);
    const blurred = reduceAttentionEvent(initial, { type: "window_blur", now: 1_000 }).state;
    const update = reduceAttentionEvent(blurred, { type: "window_focus", now: 8_000 });

    expect(update.intervention).toMatchObject({
      reason: "return-from-away",
      strength: "medium"
    });
    expect(update.state.lastAwayAt).toBeNull();
  });

  it("does not intervene for short focus changes", () => {
    const initial = createInitialState(0);
    const blurred = reduceAttentionEvent(initial, { type: "window_blur", now: 1_000 }).state;
    const update = reduceAttentionEvent(blurred, { type: "window_focus", now: 2_000 });

    expect(update.intervention).toBeNull();
  });

  it("creates a passive idle intervention after the threshold", () => {
    const initial = createInitialState(0);
    const update = reduceAttentionEvent(initial, { type: "tick", now: 91_000 });

    expect(update.intervention?.reason).toBe("passive-idle");
  });

  it("uses a longer threshold while media is playing", () => {
    const initial = createInitialState(0);
    const playing = reduceAttentionEvent(initial, { type: "media_playing", now: 0 }).state;
    const early = reduceAttentionEvent(playing, { type: "tick", now: 91_000 });
    const late = reduceAttentionEvent(playing, { type: "tick", now: 601_000 });

    expect(early.intervention).toBeNull();
    expect(late.intervention?.reason).toBe("passive-idle");
  });

  it("respects cooldown between interventions", () => {
    const initial = createInitialState(0);
    const first = reduceAttentionEvent(initial, { type: "tick", now: 91_000 });
    const second = reduceAttentionEvent(first.state, { type: "tick", now: 120_000 });

    expect(first.intervention).not.toBeNull();
    expect(second.intervention).toBeNull();
  });

  it("does not return interventions when disabled", () => {
    const initial = createInitialState(0);
    const update = reduceAttentionEvent(initial, { type: "tick", now: 91_000 }, { enabled: false });

    expect(update.intervention).toBeNull();
  });
});
