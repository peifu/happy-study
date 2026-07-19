# Assistant Three-Mode System Design

## Overview

Refactor the learning assistant from a binary (game/non-game) model into three explicit modes: Study, Game, and Music. Each mode has distinct visual styling, animation behavior, and interaction patterns. Also redesign the points rewards mechanism with streak bonuses and optimize the display page.

## Mode System

### Mode Declaration

Each HTML page declares its mode via a `data-assistant-mode` attribute on `<body>`:

| Attribute | Pages |
|---|---|
| `data-assistant-mode="study"` | english.html, chinese.html, baike.html, math.html, science.html |
| `data-assistant-mode="game"` | game-car.html, game-english.html, game-math.html, game.html |
| `data-assistant-mode="music"` | music.html |
| _(no attribute)_ | index.html, pomodoro.html, assistant.html, pe.html, qiboshi.html |

### Mode Detection

`LearningAssistant.detectMode()`:
1. Read `document.body.dataset.assistantMode`
2. Fallback: URL regex `/game/i` → `"game"` for backward compatibility
3. Default: `"normal"`

### Per-Mode Behavior

| Aspect | Study | Game | Music | Normal |
|---|---|---|---|---|
| Glow color | `#00d4ff` cyan | `#ff6b35` orange | `#a855f7` purple | default pink |
| Float animation | Gentle float (3s) | Quick bounce (1.5s) | BPM-synced bounce | Gentle float (3s) |
| Progress ring | Study progress 0→100 | Game progress 0→100 | Hidden | Hidden |
| Click interaction | Show encouragement + voice | Celebrate animation | Toggle beat speed | Show encouragement |
| Speech bubble | Points earned display | Celebration phrases | Song info | Encouragements |
| CSS class on `.learning-assistant` | `.mode-study` | `.mode-game` | `.mode-music` | _(none)_ |

## Points Rewards — AB-Mix

### Base Points (unchanged)
- English word mastered: +10
- Chinese poem memorized: +20
- Science concept learned: +10

### Streak Multiplier

Track `studyStreak` in localStorage: `{ currentStreak: N, lastStudyDate: "YYYY-MM-DD", maxStreak: N }`

| Streak Days | Multiplier |
|---|---|
| 1-2 | ×1.0 |
| 3-6 | ×1.5 |
| 7-29 | ×2.0 |
| 30+ | ×3.0 |

On each `addStudyPoints()` call:
1. Check if today > lastStudyDate
2. If consecutive (yesterday), increment streak
3. If gap, reset streak to 1
4. Calculate `actualPoints = basePoints × multiplier`
5. Store updated streak

### Notification Bubble Update

`showPointsNotification()` shows:
- Base points
- Current streak multiplier (if > 1.0)
- Final points earned
- Animated coin particles from assistant to center

## Music Beat Sync

### BPM Resolution Strategy
1. Song JSON `bpm` field → exact match
2. Song style tag: "欢快"→140, "舒缓"→70, "动感"→120
3. Default: 100 BPM

### Beat Animation

`LearningAssistant` new methods:
- `setBeat(bpm)` — set beats per minute
- `startMusicBeat()` — begin CSS bounce animation at beat interval
- `stopMusicBeat()` — stop animation (pause/leave page)

Animation: `@keyframes musicBounce` — scale 1.0→1.15 + translateY(0→-15px), duration = `60000/bpm` ms, ease-out.

### music.html Integration
- On song load: `learningAssistant.setBeat(bpm)`
- On play: `learningAssistant.startMusicBeat()`
- On pause: `learningAssistant.stopMusicBeat()`
- On song change: update BPM + restart

## File Changes

### Core (heavy changes)
- **`assets/js/learning-assistant.js`** — Add `detectMode()`, `applyMode()`, `setBeat()`, `startMusicBeat()`, `stopMusicBeat()`. Modify `init()` to call mode setup. Modify `celebrate()` to be mode-aware.
- **`assets/css/learning-assistant.css`** — Add `.mode-study`, `.mode-game`, `.mode-music` class styles, `@keyframes musicBounce`, mode-specific glow colors.

### Shared (medium changes)
- **`assets/js/common.js`** — Add `getStreakData()`, `updateStreak()`, `getStreakMultiplier()`. Modify `addStudyPoints()` to apply multiplier. Update `showPointsNotification()` bubble content.

### Display page (medium changes)
- **`assistant.html`** — Add streak display, today's harvest, weekly chart, daily goal to points page.

### HTML pages (light changes — add attribute)
- `english.html` — `<body data-assistant-mode="study">`
- `chinese.html` — `<body data-assistant-mode="study">`
- `baike.html` — `<body data-assistant-mode="study">`
- `math.html` — `<body data-assistant-mode="study">`
- `science.html` — `<body data-assistant-mode="study">`
- `game.html` — `<body data-assistant-mode="game">`
- `game-car.html` — `<body data-assistant-mode="game">`
- `game-english.html` — `<body data-assistant-mode="game">`
- `game-math.html` — `<body data-assistant-mode="game">`
- `music.html` — `<body data-assistant-mode="music">` + beat sync calls

## Data Flow

```
Page loads → body[data-assistant-mode] set
  → injectAssistant() → initLearningAssistant()
    → new LearningAssistant()
      → detectMode() reads attribute
      → applyMode() sets CSS class + behavior
      → [music] setBeat(bpm), startMusicBeat()
      → [study] listen for study events
      → [game] show progress ring

User masters word/poem
  → addStudyPoints(subject, basePoints, reason)
    → getStreakData() → compute multiplier
    → actual = basePoints × multiplier
    → save to localStorage
    → dispatch studyPointsUpdated event
    → showPointsNotification(actual, reason) with multiplier info
```

## Backward Compatibility

- No `data-assistant-mode` attribute → behaves as `"normal"` (same as current non-game behavior)
- Existing `isGamePage` URL regex kept as fallback
- `addStudyPoints()` signature unchanged
- All existing localStorage keys preserved
