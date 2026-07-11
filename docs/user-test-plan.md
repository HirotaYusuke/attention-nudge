# User Test Plan

## Purpose

This plan defines a small manual user test for Attention Nudge. The goal is to evaluate whether subtle visual nudges help users return to browser-based work without feeling like an alarm, warning, or surveillance mechanism.

## Research questions

1. Do users notice the visual nudge at the right moment?
2. Does the nudge help users return to the current task?
3. Does the nudge feel too distracting or annoying?
4. Are false positives frequent enough to harm trust?
5. Are the default thresholds reasonable for learning or desk-work contexts?

## Test scope

The first test should remain small and qualitative.

Recommended scale:

- 3 to 5 participants
- 15 to 30 minutes per participant
- browser-based learning, reading, or documentation work
- local prototype only
- no webcam, microphone, gaze tracking, or remote telemetry

## Test setup

### Environment

- Chrome or Chromium browser
- built extension loaded from `apps/chrome-extension/dist`
- default settings first
- optional second run with adjusted inactivity threshold and cooldown

### Tasks

Use ordinary browser-based work tasks such as:

- reading technical documentation
- watching a short learning video
- writing notes in a web app
- comparing two web pages
- searching for a specific answer across multiple pages

Avoid highly sensitive pages such as banking, healthcare, personal messaging, or password forms.

## Procedure

### 1. Introduction

Explain:

- the extension is a local prototype;
- it uses browser interaction signals, not page content;
- it does not use webcam, microphone, gaze, or face recognition;
- the user can stop the test at any time.

### 2. Baseline task

Ask the participant to work normally for 5 to 10 minutes without explaining every trigger rule in detail. Observe whether the participant notices nudges and how they react.

### 3. Controlled drift scenario

Ask the participant to intentionally leave the tab or window, then return after several seconds. Check whether the return nudge appears and whether it feels appropriate.

### 4. Passive idle scenario

Ask the participant to keep a page open without keyboard, pointer, or scroll activity until the idle threshold is exceeded. Check whether the passive idle nudge appears and whether it feels too strong or too weak.

### 5. Media scenario

Ask the participant to play a video or audio page. Confirm that the nudge behavior does not interfere with media consumption and that the longer threshold feels appropriate.

### 6. Settings scenario

Ask the participant to change strength, threshold, cooldown, and disabled sites. Confirm whether the settings labels are understandable.

## Observation log

Use the following table format.

| Field | Description |
|---|---|
| participant_id | Anonymous ID such as P01 |
| task_context | Reading, video, notes, search, etc. |
| scenario | baseline / return / idle / media / settings |
| nudge_seen | yes / no |
| reaction | ignored / returned to task / annoyed / confused |
| false_positive | yes / no / unclear |
| too_subtle | yes / no |
| too_intrusive | yes / no |
| settings_issue | free text |
| comment | free text |

## Post-test questions

Ask each participant:

1. Did the nudge feel helpful?
2. Did it feel like a warning or surveillance?
3. Was the visual strength appropriate?
4. Was the timing appropriate?
5. Were there moments when it appeared unnecessarily?
6. Were there moments when you expected it but it did not appear?
7. Which setting would you most want to adjust?
8. Would you keep this enabled during real work or study?

## Success criteria

The prototype is promising if:

- most participants understand that the tool is local and non-surveillance oriented;
- users notice nudges without describing them as alarming;
- return-to-task nudges are perceived as more helpful than annoying;
- false positives are understandable and not frequent enough to break trust;
- users can explain the settings in their own words.

## Failure signals

Prioritize redesign if:

- users interpret the tool as monitoring or policing them;
- visual intervention feels like an error state or warning;
- nudges appear repeatedly during normal flow;
- media pages are interrupted;
- users cannot understand how to disable or configure it;
- users want per-site controls but cannot find them.

## Next iteration decisions

After the first test, decide:

1. whether the default idle threshold should change;
2. whether the cooldown should be longer;
3. whether the visual overlay should be weaker or stronger;
4. whether disabled sites need better UI;
5. whether optional local log export is needed for future research analysis.
