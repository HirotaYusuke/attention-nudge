# Privacy and Verification

## Purpose

Attention Nudge is a privacy-first Chrome extension prototype for subtle focus recovery. This document makes the privacy model, permission rationale, and manual verification procedure explicit so that the project can be evaluated without relying on implicit assumptions in the README.

## Privacy model

The prototype should remain local-first by default.

### Collected or inferred locally

The extension may use the following browser interaction signals only inside the local extension runtime:

- tab hidden / visible events
- window blur / focus events
- keyboard, pointer, and scroll activity signals
- video / audio play state
- local settings
- daily intervention count
- daily away / return count

### Not collected

The extension must not collect, store, or transmit:

- webcam images
- microphone audio
- gaze or face data
- page text
- form input
- full browsing history
- remote telemetry
- administrator-facing monitoring data

### Storage boundary

Data should be stored only in `chrome.storage.local` unless a future explicit opt-in export feature is added.

No server endpoint is required for the current prototype.

## Permission rationale

The current Manifest V3 configuration uses:

- `storage`
- `<all_urls>` host permission
- content script execution on normal web pages

### `storage`

Required for:

- enabled / disabled state
- intervention strength
- inactivity threshold
- cooldown
- disabled sites
- daily intervention count
- daily away / return count

### `<all_urls>` and content script

Required because the nudge is rendered in the current web page and because attention drift signals are page-local. The prototype needs to observe user activity and render a short visual intervention across arbitrary browser-based work or learning pages.

The permission should not be interpreted as permission to read page content. The implementation should avoid reading DOM text, form inputs, or page-specific private content unless a future feature explicitly requires it and explains why.

## Manual verification checklist

Run the baseline checks:

```bash
npm install
npm run typecheck
npm test
npm run build
```

Load the built extension from:

```text
apps/chrome-extension/dist
```

Then verify the following in Chrome.

### 1. Installation

- Open `chrome://extensions`.
- Enable Developer mode.
- Load unpacked extension from `apps/chrome-extension/dist`.
- Confirm the extension appears as `Attention Nudge`.
- Confirm the popup opens.

### 2. Settings

- Toggle enable / disable.
- Change intervention strength.
- Change inactivity threshold.
- Change cooldown.
- Add a disabled site.
- Reload the page and confirm settings persist.

### 3. Return nudge

- Open a normal web page.
- Leave the tab or window.
- Return after the configured minimum away duration.
- Confirm a short visual nudge appears.
- Confirm repeated nudges are blocked during cooldown.

### 4. Passive idle nudge

- Open a normal web page.
- Keep the page active but avoid keyboard, pointer, and scroll activity until the idle threshold is exceeded.
- Confirm a passive idle nudge appears.
- Confirm normal input resets idle state.

### 5. Media behavior

- Open a page with playing video or audio.
- Confirm the idle threshold is longer while media is playing.
- Confirm the extension does not interrupt media with sound or explicit warnings.

### 6. Disabled site behavior

- Add the current domain to disabled sites.
- Reload the page.
- Confirm nudges do not appear on that domain.

### 7. Privacy spot check

- Inspect extension storage.
- Confirm storage contains only settings and aggregate local counts.
- Confirm no page text, form input, full URL history, screenshots, audio, or webcam/gaze data is stored.
- Confirm there are no network requests caused by the extension during normal use.

## FAQ draft

### Does the extension send data to a server?

No. The current prototype is intended to run locally and store only local settings and aggregate counts in `chrome.storage.local`.

### Does it use the camera, microphone, gaze, or face recognition?

No. The current prototype avoids camera, microphone, gaze, and face recognition entirely.

### Does it read the text of pages or form inputs?

No. The current prototype should rely on interaction signals and should not read page text or form inputs.

### Why does it need access to pages?

The extension needs a content script so it can observe local interaction signals and render a short visual nudge in the current page. This is different from collecting page content.

### Can the user turn it off?

Yes. The settings UI should allow the user to enable or disable the extension and configure thresholds and cooldown.

### Is this a productivity surveillance tool?

No. The design goal is personal focus recovery, not monitoring by an administrator or third party. The current prototype does not transmit telemetry or expose user behavior to an external dashboard.

## Acceptance criteria

This documentation is sufficient when:

- the permission rationale is clear enough for a reviewer to understand why `storage` and `<all_urls>` exist;
- the manual verification procedure can be followed after `npm run build`;
- the privacy boundary is explicit;
- future export or research features are clearly treated as opt-in extensions, not default behavior.
