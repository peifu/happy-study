# 七博士 (Dr. Seven) — Design Spec

## Overview

七博士 is an AI-powered learning assistant page for the 快乐学习 platform. Students can chat with an AI (powered by DeepSeek) via text or voice, ask academic questions, and get spoken answers — all within a student-friendly UI matching the existing dark/light theme.

## Architecture

- **Standalone HTML page**: `qiboshi.html`, following the same pattern as `english.html`, `chinese.html`, etc.
- **No backend**: All API calls go directly from the browser to DeepSeek API.
- **API Key**: User-provided, stored in `localStorage`. First visit prompts for key entry.
- **Shared assets**: Uses `common.css`, `learning-assistant.css`, and the existing learning assistant widget.

## Modules

### 1. Chat UI
- Message list with auto-scroll, distinct styling for user (right-aligned, accent color) and AI (left-aligned, card bg) bubbles.
- Input area: text input + send button + voice input toggle button.
- Loading indicator while waiting for API response.
- Markdown rendering for AI responses (code blocks, lists, bold).
- Each AI message has a 🔊 speak button to read it aloud.

### 2. DeepSeek API Integration
- Endpoint: DeepSeek Chat Completions API (`https://api.deepseek.com/v1/chat/completions`).
- API Key from localStorage (`deepseek_api_key`).
- System prompt: "你是七博士，一位专门帮助小学生学习的AI助手。你善于用通俗易懂的方式解释知识，鼓励学生思考。请用中文回答，保持友好、鼓励的语气。"
- Conversation history: last N messages sent as context (managed client-side).
- Model: `deepseek-chat` by default, configurable.
- Error handling: show friendly error messages for network failures, invalid key, rate limits.

### 3. Voice Input (SpeechRecognition)
- Web Speech API `SpeechRecognition` for Chinese (`zh-CN`).
- Microphone button toggles listening mode.
- Visual indicator when listening (pulsing mic icon).
- Result fills the text input (user can edit before sending).
- Graceful fallback if browser doesn't support SpeechRecognition.

### 4. Voice Output (SpeechSynthesis)
- 🔊 button on each AI message bubble.
- Uses `SpeechSynthesisUtterance` with `zh-CN` language.
- Reuses speech settings (rate, pitch, voice) from `localStorage` keys already used in the app (`speechRateZh`, `speechPitchZh`, `selectedVoiceZh`).
- Clicking another speak button cancels the current utterance.

### 5. Settings Panel
- Accessible via ⚙ icon in top bar.
- API Key input (masked, with show/hide toggle).
- Clear conversation history button.
- Model selection dropdown (optional, default `deepseek-chat`).

### 6. Data Persistence (localStorage)
| Key | Content |
|-----|---------|
| `deepseek_api_key` | User's DeepSeek API key |
| `qiboshi_history` | JSON array of chat messages (max 50) |
| `qiboshi_model` | Selected model name (default: `deepseek-chat`) |

## Page Layout

```
┌──────────────────────────────────────────────┐
│  ← 返回首页      七博士 AI 学习助手      ⚙   │  Top nav
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────┐ 🔊     │
│  │ 🤖 你好！我是七博士，            │        │
│  │ 有什么学习问题想问我？            │        │  Message list
│  └──────────────────────────────────┘        │  (flex-grow, scrollable)
│                                              │
│       ┌───────────────────────────┐          │
│       │ 光合作用的原理是什么？     │          │
│       └───────────────────────────┘          │
│                                              │
│  ┌──────────────────────────────────┐ 🔊     │
│  │ 光合作用是植物利用阳光...        │        │
│  └──────────────────────────────────┘        │
│                                              │
├──────────────────────────────────────────────┤
│  [🎤] [输入你的问题...____________] [➤ 发送]  │  Input bar
└──────────────────────────────────────────────┘
```

## Navigation

- Added as a subject card in `index.html` (same grid, with `qiboshi-card` class).
- Card ID: `qiboshiCard`, links to `qiboshi.html`.
- Color: a new CSS variable `--qiboshi` (e.g., purple/indigo) distinct from existing subject colors.
- Card icon: `fa-robot` (Font Awesome).

## Error Handling

- **No API Key**: Show setup prompt with API key input inline.
- **Invalid API Key**: Show error message with link to DeepSeek console.
- **Network Error**: Show retry button on the failed message.
- **SpeechRecognition Not Supported**: Hide voice input button, no error shown.
- **SpeechRecognition Error**: Show a brief toast notification.
- **Rate Limit / Quota**: Show friendly "AI博士有点累了，请稍后再试" message.

## Theme Integration

- Uses existing CSS custom properties from `common.css` (`--primary`, `--secondary`, `--bg-color`, `--text-color`, `--card-bg-color`, `--border-subtle`, etc.).
- Light theme via `.light-theme` class on `<body>` — applied by `common.js`.
- Page-specific overrides in a `<style>` block (matching the pattern of other subject pages).

## Dependencies

- **Font Awesome 6.4.0** (CDN) — icons
- **common.css** — theme variables, layout, shared styles
- **learning-assistant.css / .js** — floating mascot widget
- **common.js** — theme sync
- No additional CDN dependencies. Markdown rendering done with a lightweight inline function.
