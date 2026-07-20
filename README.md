# Attention Nudge

Attention Nudge is a privacy-first Chrome extension prototype for subtle focus recovery.

It estimates likely attention drift from local browser interaction signals and applies short, non-verbal visual interventions in the current page. The project is based on the concept of recovering attention without explicit alarms, warnings, webcam monitoring, or administrator-facing surveillance.

## Concept

Online learning and browser-based work often lose the social pressure and environmental cues that help people stay engaged. Attention Nudge takes a lightweight approach: when the user appears to have stepped away or become inactive, it gently changes the visual environment for a few seconds to invite attention back.

The current prototype intentionally avoids messages like "Please focus" and does not use sound, camera input, or face/gaze recognition.

## Features

- Chrome extension, Manifest V3
- Operation-log based attention drift estimation
  - tab hidden / visible
  - window blur / focus
  - keyboard, pointer, and scroll activity
  - video / audio play state
- Visual intervention only
  - a background-independent contrast ring around the viewport
    (light + dark layered stroke with a soft glow, so it stays visible on
    light, dark, colorful pages and under dark-mode extensions)
  - a gentle pulse animation, disabled automatically when the user prefers
    reduced motion
- Lightweight settings UI
  - enable / disable
  - intervention strength
  - inactivity threshold
  - cooldown
  - disabled sites
- Local-only storage
  - settings
  - daily intervention count
  - daily away / return count

## Privacy

The prototype stores data only in `chrome.storage.local`.

It does not collect or store:

- webcam images
- microphone audio
- gaze or face data
- page text
- form input
- full browsing history
- remote telemetry

No data is sent to a server.

## Project Structure

```text
attention-nudge/
  apps/
    chrome-extension/     Chrome extension implementation
  packages/
    core/                 Shared attention state and trigger logic
```

The `packages/core` package is kept independent from Chrome APIs so the same logic can later be reused by a VS Code extension or desktop app.

## Development

Requirements:

- Node.js 23.x or compatible recent Node.js
- npm 10.x

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run type checks:

```bash
npm run typecheck
```

Build the Chrome extension:

```bash
npm run build
```

The build output is generated at:

```text
apps/chrome-extension/dist
```

## Load in Chrome

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click "Load unpacked".
4. Select:

```text
/Users/hirotayusuke/attention-nudge/apps/chrome-extension/dist
```

After loading, open any normal web page and use the extension popup to:

- enable or disable Attention Nudge
- view today's intervention count
- trigger a test nudge on the current page
- open the settings page

## Current Trigger Rules

- If the user leaves a tab/window and returns after at least 5 seconds, a short visual nudge is shown.
- If the page remains active but there is no keyboard, pointer, or scroll activity for 90 seconds, a passive-idle nudge is shown.
- If media is playing, the idle threshold is longer by default: 10 minutes.
- After a nudge, a 3-minute cooldown prevents repeated interventions.

These defaults can be adjusted in the settings UI.

## Verification

The current implementation has been verified with:

```bash
npm run typecheck
npm test
npm run build
```

## Roadmap

- Improve intervention tuning through user testing.
- Add optional export of local logs for research analysis.
- Add a VS Code extension using the same `packages/core` trigger logic.
- Explore richer but still non-intrusive visual cues.
- Consider webcam or gaze-based detection only as an explicit opt-in research mode.
