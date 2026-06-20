# Attention Nudge

Attention Nudge is a privacy-first Chrome extension prototype for subtle focus recovery. It estimates likely attention drift from local interaction signals and applies short, non-verbal visual interventions in the current page.

## Current scope

- Chrome extension, Manifest V3
- Local-only settings and daily counters
- No webcam, gaze tracking, cloud sync, or remote telemetry
- Visual intervention only: soft overlay and focus ring

## Development

```bash
npm install
npm test
npm run build
```

Load `apps/chrome-extension/dist` as an unpacked extension in Chrome.
