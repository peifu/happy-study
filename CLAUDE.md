# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

快乐学习 (Happy Study) is a static HTML/JS/CSS educational website for Chinese elementary school students. No build tools, no framework, no package manager — open any `.html` file directly in a browser. CDNs provide Font Awesome 6.4.0 and (on car-game.html) Tailwind CSS, Anime.js, and PixiJS.

## Commands

No build, lint, or test commands exist. Development is entirely manual:
- Open `.html` files in a browser to preview.
- No local dev server is required, but `npx serve .` or `python3 -m http.server` can be used to serve files locally.

## Architecture

**Entry points (standalone HTML pages):**
- `index.html` — Main hub with subject cards (English, Chinese, Math, PE, Science, Music), learning assistant settings, Pomodoro timer, and game links. Each card navigates to a dedicated subject page.
- `english.html` — Smart word learning system with flashcard games, quizzes, and spelling practice.
- `chinese.html` — Ancient poetry and daily vocabulary accumulation.
- `math.html` — Math practice.
- `pe.html` — Physical education guides (jump rope pacing with metronome audio, running guides).
- `baike.html` — Encyclopedia: science concepts, space simulation, and life knowledge (Chinese Zodiac).
- `music.html` — Music player with preloaded songs.
- `car-game.html` — Word racing game (collect correct English words while dodging obstacles on a highway). Uses PixiJS canvas rendering.
- `pomodoro.html` — Pomodoro focus timer.

**Shared assets:**
- `common.js` (root) — Theme switching (`applyTheme`, `syncThemeFromIndex`), generic page switching (`switchPageCommon`, `setupNavLinks`), and logo-to-home navigation (`setupHomeLink`).
- `assets/css/common.css` — Theme CSS variables (dark/light via `.light-theme` class), layout, nav, card, button styles shared across all pages.
- `assets/css/learning-assistant.css` — Styles for the floating mascot/assistant widget.
- `assets/js/learning-assistant.js` — `LearningAssistant` class: floating mascot with speech bubble, encouragements, voice output (Web Speech API or pre-recorded audio), persisted settings via `localStorage`.
- `assets/js/common.js` — `WordSelector` class for loading wordlist JSONs and cycling through words.
- `assets/js/word-system.js` — `WordLearningSystem` class: embedded hardcoded word database organized by difficulty levels.
- `assets/js/car-game.js` — `WordRacingGame` class for the car game (canvas-based word racing).

**Data files (`data/`):**
- `data/english/` — Grade-level wordlists (3A–6B) as JSON, plus KET vocabulary. `wordlists.json` is the index mapping list names to files.
- `data/chinese/` — `chinese-poems.json` (full poem database), `chinese-poems-grade3a.json` (subset), `daily-accumulation.json`.
- `data/pe/` — Jump rope metronome MP3s at different BPMs.
- `data/music/` — Preloaded MP3/OGG music files.

**Audio assets (`assets/audio/`):**
- Character voice clips (bear, cat, nezha, peppa) for the learning assistant's speech feedback.

**Image assets (`assets/resources/`):**
- Car game sprites (player car, barriers, barrels, highway background, game-over background, heart/star icons).

## Key patterns

- **Theme**: Dark/light theme uses CSS custom properties on `:root` and `.light-theme`, toggled via `localStorage.getItem('theme')`. Individual pages must duplicate the theme variables in a `<style>` block — they are not fully centralized.
- **Page switching**: `index.html` uses in-page tab switching (nav links + `.page` divs). Subject pages are separate HTML files navigated via `window.location.href`.
- **State persistence**: All user data (assistant settings, game progress, learned words) is stored in `localStorage` by key prefix. There is no backend.
- **Inline styles**: Each HTML page contains its own `<style>` block for page-specific CSS. `common.css` only covers shared chrome.

## Git workflow

Commits are made directly to `main` with Chinese-language messages prefixed by the affected area (e.g., "english:", "pe:", "assistant:", "clock:").
