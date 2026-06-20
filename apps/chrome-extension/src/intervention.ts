import type { InterventionRequest, InterventionStrength } from "@attention-nudge/core";

const ROOT_ID = "attention-nudge-root";

export function showVisualIntervention(request: InterventionRequest): void {
  const root = ensureRoot();
  const { overlayOpacity, ringOpacity } = getStrengthValues(request.strength);

  root.style.setProperty("--attention-nudge-overlay-opacity", String(overlayOpacity));
  root.style.setProperty("--attention-nudge-ring-opacity", String(ringOpacity));
  root.dataset.reason = request.reason;
  root.classList.remove("attention-nudge-active");

  window.requestAnimationFrame(() => {
    root.classList.add("attention-nudge-active");
  });

  window.setTimeout(() => {
    root.classList.remove("attention-nudge-active");
  }, 2_800);
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

  const style = document.createElement("style");
  style.textContent = `
    #${ROOT_ID} {
      --attention-nudge-overlay-opacity: 0.08;
      --attention-nudge-ring-opacity: 0.5;
      pointer-events: none;
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      opacity: 0;
      transition: opacity 800ms ease;
    }

    #${ROOT_ID}::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, var(--attention-nudge-overlay-opacity));
      mix-blend-mode: screen;
    }

    #${ROOT_ID}::after {
      content: "";
      position: absolute;
      inset: 10px;
      border: 2px solid rgba(77, 139, 255, var(--attention-nudge-ring-opacity));
      box-shadow: 0 0 24px rgba(77, 139, 255, 0.18);
    }

    #${ROOT_ID}.attention-nudge-active {
      opacity: 1;
    }

    @media (prefers-color-scheme: dark) {
      #${ROOT_ID}::before {
        background: rgba(255, 255, 255, calc(var(--attention-nudge-overlay-opacity) * 0.7));
      }
    }
  `;

  document.documentElement.append(style, root);
  return root;
}

function getStrengthValues(strength: InterventionStrength): { overlayOpacity: number; ringOpacity: number } {
  switch (strength) {
    case "low":
      return { overlayOpacity: 0.04, ringOpacity: 0.35 };
    case "high":
      return { overlayOpacity: 0.14, ringOpacity: 0.75 };
    case "medium":
      return { overlayOpacity: 0.08, ringOpacity: 0.5 };
  }
}
