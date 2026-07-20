import type { InterventionRequest, InterventionStrength } from "@attention-nudge/core";

const ROOT_ID = "attention-nudge-root";
const RING_CLASS = "attention-nudge-ring";
const ACTIVE_CLASS = "attention-nudge-active";

// 表示継続時間。脈動アニメは 900ms × 3 回 = 2,700ms なので、
// それを覆う長さにしてからフェードアウトさせる。
const VISIBLE_MS = 2_800;

export function showVisualIntervention(request: InterventionRequest): void {
  const root = ensureRoot();
  const { ringOpacity, glow, glowBlur, glowSpread } = getStrengthValues(request.strength);

  root.style.setProperty("--attention-nudge-ring-opacity", String(ringOpacity));
  root.style.setProperty("--attention-nudge-glow", glow);
  root.style.setProperty("--attention-nudge-glow-blur", `${glowBlur}px`);
  root.style.setProperty("--attention-nudge-glow-spread", `${glowSpread}px`);
  root.dataset.reason = request.reason;

  // クラスを一度外し、次フレームで付け直すことでアニメーションを毎回リスタートさせる。
  root.classList.remove(ACTIVE_CLASS);

  window.requestAnimationFrame(() => {
    root.classList.add(ACTIVE_CLASS);
  });

  window.setTimeout(() => {
    root.classList.remove(ACTIVE_CLASS);
  }, VISIBLE_MS);
}

export function showManualTestIntervention(): void {
  showVisualIntervention({
    reason: "passive-idle",
    now: Date.now(),
    strength: "medium"
  });
}

function ensureRoot(): HTMLElement {
  const existing = document.getElementById(ROOT_ID);
  if (existing) {
    return existing;
  }

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.setAttribute("aria-hidden", "true");

  const ring = document.createElement("div");
  ring.className = RING_CLASS;
  root.append(ring);

  const style = document.createElement("style");
  style.textContent = `
    #${ROOT_ID} {
      --attention-nudge-ring-opacity: 0.9;
      --attention-nudge-glow: rgba(120, 180, 255, 0.5);
      --attention-nudge-glow-blur: 30px;
      --attention-nudge-glow-spread: 5px;
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      opacity: 0;
      transition: opacity 400ms ease;
    }

    #${ROOT_ID}.${ACTIVE_CLASS} {
      opacity: 1;
    }

    /*
     * 背景の明暗に依存させないため、暗転オーバーレイは使わない。
     * リングを「白い線 + その内外を挟む黒い線 + 青いグロー」の多層で描くことで、
     * 明るい / 暗い / カラフルな背景やダークモード拡張下でも視認できるようにする。
     */
    #${ROOT_ID} .${RING_CLASS} {
      position: absolute;
      inset: 14px;
      border-radius: 10px;
      border: 2px solid rgba(255, 255, 255, var(--attention-nudge-ring-opacity));
      box-shadow:
        0 0 0 2px rgba(0, 0, 0, 0.55),
        inset 0 0 0 2px rgba(0, 0, 0, 0.55),
        0 0 var(--attention-nudge-glow-blur) var(--attention-nudge-glow-spread) var(--attention-nudge-glow),
        inset 0 0 40px 4px var(--attention-nudge-glow);
    }

    #${ROOT_ID}.${ACTIVE_CLASS} .${RING_CLASS} {
      animation: attention-nudge-pulse 900ms ease-in-out 3;
    }

    @keyframes attention-nudge-pulse {
      0%, 100% { transform: scale(1); opacity: 0.85; }
      50% { transform: scale(0.987); opacity: 1; }
    }

    /* 動きに敏感なユーザー向け: 脈動をやめ、静止したリングを表示するだけにする。 */
    @media (prefers-reduced-motion: reduce) {
      #${ROOT_ID}.${ACTIVE_CLASS} .${RING_CLASS} {
        animation: none;
      }
    }
  `;

  document.documentElement.append(style, root);
  return root;
}

function getStrengthValues(strength: InterventionStrength): {
  ringOpacity: number;
  glow: string;
  glowBlur: number;
  glowSpread: number;
} {
  switch (strength) {
    case "low":
      return { ringOpacity: 0.85, glow: "rgba(120, 180, 255, 0.5)", glowBlur: 26, glowSpread: 5 };
    case "high":
      return { ringOpacity: 1, glow: "rgba(120, 180, 255, 0.95)", glowBlur: 46, glowSpread: 12 };
    case "medium":
      return { ringOpacity: 0.92, glow: "rgba(120, 180, 255, 0.72)", glowBlur: 34, glowSpread: 8 };
  }
}
