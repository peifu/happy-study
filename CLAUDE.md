# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

快乐学习 (Happy Study) is a static HTML/JS/CSS educational website for Chinese elementary school students. No build tools, no framework, no package manager — open any `.html` file directly in a browser. CDNs provide Font Awesome 6.4.0 and (on `game-car.html`) Tailwind CSS, Anime.js, and PixiJS.

## Commands

No build, lint, or test commands exist. Development is entirely manual:
- Open `.html` files in a browser to preview.
- No local dev server is required, but `npx serve .` or `python3 -m http.server` can be used to serve files locally.
- `tools/qiboshi-token.py` — Utility script for QiBoshi token generation (run with `python3 tools/qiboshi-token.py`).

## Architecture

**Entry points (standalone HTML pages):**

| Page | Description |
|------|-------------|
| `index.html` | Main hub — subject cards (English, Chinese, Math, PE, Science/Baike, Music), learning assistant settings, Pomodoro timer, game links. Navigates to dedicated pages. |
| `english.html` | Smart word learning system with flashcards, quizzes, and spelling practice. |
| `chinese.html` | Ancient poetry and daily vocabulary accumulation. |
| `math.html` | Math practice. |
| `pe.html` | Physical education guides (jump rope with metronome audio, running guides). |
| `baike.html` | Encyclopedia: science concepts, space simulation, life knowledge (Chinese Zodiac). |
| `science.html` | Science knowledge learning system (split from baike). |
| `music.html` | Music player with preloaded songs. |
| `pomodoro.html` | Pomodoro focus timer. |
| `game.html` | Game hub — links to all games (word racing, word match, math adventure). |
| `game-car.html` | Word racing game — collect correct English words while dodging obstacles. Uses PixiJS canvas rendering, Tailwind CSS, Anime.js. |
| `game-english.html` | Word matching game (单词消消乐). |
| `game-math.html` | Math adventure (数学大冒险) — Grade 3 knowledge challenges. |
| `qiboshi.html` | QiBoshi AI learning assistant (七博士 AI 学习助手). |

**Shared assets:**
- `assets/css/common.css` — Theme CSS variables (dark/light via `.light-theme` class), layout, nav, card, button styles shared across all pages.
- `assets/css/learning-assistant.css` — Styles for the floating mascot/assistant widget.
- `assets/js/common.js` — `WordSelector` class for loading wordlist JSONs and cycling through words. Also contains `applyTheme`, `syncThemeFromIndex`, `switchPageCommon`, `setupNavLinks`, `setupHomeLink` (theme + generic page switching utilities).
- `assets/js/learning-assistant.js` — `LearningAssistant` class: floating mascot with speech bubble, encouragements, voice output (Web Speech API or pre-recorded audio), persisted settings via `localStorage`.
- `assets/js/word-system.js` — `WordLearningSystem` class: embedded hardcoded word database organized by difficulty levels.
- `assets/js/car-game.js` — `WordRacingGame` class for `game-car.html` (canvas-based word racing).

**Data files (`data/`):**
- `data/english/` — Grade-level wordlists (3A–6B) as JSON, KET vocabulary, grammar data, book index. `wordlists.json` is the index mapping list names to files.
- `data/chinese/` — `chinese-poems.json` (full poem database), `chinese-poems-grade3a.json` (subset), `daily-accumulation.json`.
- `data/math/` — Grade-level math problem JSONs (grade1–3, grade3b, grade4b) plus markdown reference.
- `data/baike/` — Earth data (`earth.json`, `earth.md`), science concepts, zodiac animals, zodiac PPT.
- `data/pe/` — Jump rope metronome MP3s at different BPMs.
- `data/music/` — Preloaded MP3/OGG music files with LRC/JSON lyrics and playlist indices.

**Audio assets (`assets/audio/`):**
- Character voice clips (bear, cat, nezha, peppa) for the learning assistant's speech feedback.

**Image assets (`assets/resources/`):**
- Car game sprites (player car, barriers, barrels, highway backgrounds, game-over background, heart/star icons).

**Character avatars (`assets/logo/`):**
- PNG avatars for assistant mascots (bear, cat, jerry, nezha, peppa, shixinxiong, tom).

**Other directories:**
- `docs/` — Project documentation (superpowers specs).
- `tools/` — Utility scripts (`qiboshi-token.py`).
- `.claude/` — Claude Code settings (permissions).
- `.omc/` — OMC plugin state.

## Key patterns

- **Theme**: Dark/light theme uses CSS custom properties on `:root` and `.light-theme`, toggled via `localStorage.getItem('theme')`. Individual pages must duplicate the theme variables in a `<style>` block — they are not fully centralized.
- **Page switching**: `index.html` uses in-page tab switching (nav links + `.page` divs). Subject pages are separate HTML files navigated via `window.location.href`.
- **State persistence**: All user data (assistant settings, game progress, learned words) is stored in `localStorage` by key prefix. There is no backend.
- **Inline styles**: Each HTML page contains its own `<style>` block for page-specific CSS. `common.css` only covers shared chrome.
- **Script loading**: Pages load shared scripts as: `assets/js/common.js`, `assets/js/learning-assistant.js`, `assets/js/word-system.js`. Most pages include both `common.js` and `learning-assistant.js`.
- **Game scripts**: `game-car.html` loads `assets/js/car-game.js`. Game pages may use CDN extras (Tailwind, Anime.js, PixiJS).

## Git workflow

Commits are made directly to `main` with Chinese-language messages prefixed by the affected area (e.g., "english:", "pe:", "assistant:", "clock:").
