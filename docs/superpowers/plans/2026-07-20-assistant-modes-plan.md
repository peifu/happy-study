# Assistant Three-Mode System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the learning assistant from binary game/non-game into Study/Game/Music modes with streak-based points rewards, beat-synced music animation, and optimized display page.

**Architecture:** The `LearningAssistant` class gains `detectMode()` and `applyMode()` to switch CSS classes + behavior based on `body[data-assistant-mode]`. `common.js` gains streak tracking that modifies `addStudyPoints()`. Music mode uses dynamic CSS animation-duration driven by BPM. Ten HTML pages get a single attribute. No new files — all changes are in existing files.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage for persistence, CSS custom properties + @keyframes for animations

---

### Task 1: Add mode detection and switching to learning-assistant.js

**Files:**
- Modify: `assets/js/learning-assistant.js`

- [ ] **Step 1: Add detectMode() and applyMode() methods**

In `learning-assistant.js`, after the constructor (line 28), add new methods. Replace the `init()` method's isGamePage detection (lines 32-42) to use the new mode system.

Read current constructor and init:

```javascript
// Current constructor (lines 3-28):
constructor() {
    this.assistant = document.getElementById('learningAssistant');
    this.speechBubble = document.getElementById('assistantSpeechBubble');
    this.assistantName = document.getElementById('assistantName');
    this.encouragements = [...];
    this.currentAudio = null;
    this.isPlaying = false;
    this.celebratePhrases = [...];
    this.isCelebrating = false;
    this.isGamePage = false;
    this.progressPercent = 0;
    this.progressRingFill = null;
    this.progressRing = null;
}
```

Add `this.mode = 'normal';` after `this.isGamePage = false;`:

```javascript
this.isGamePage = false;
this.mode = 'normal';
this.beatBpm = 100;
this.beatInterval = null;
```

Replace the `init()` method's mode detection (lines 32-42):

Old:
```javascript
// 检测是否为游戏页面
this.isGamePage = /game/i.test(window.location.pathname);

// 初始化进度环
this.progressRing = document.getElementById('assistantProgressRing');
this.progressRingFill = document.getElementById('progressRingFill');
if (this.isGamePage && this.progressRing) {
    this.progressRing.classList.add('show');
}
```

New:
```javascript
this.progressRing = document.getElementById('assistantProgressRing');
this.progressRingFill = document.getElementById('progressRingFill');
this.detectMode();
this.applyMode();
```

After the constructor, add these new methods (before `init()`):

```javascript
// 检测当前模式
detectMode() {
    var bodyMode = document.body.dataset.assistantMode;
    if (bodyMode === 'study' || bodyMode === 'game' || bodyMode === 'music') {
        this.mode = bodyMode;
    } else if (/game/i.test(window.location.pathname)) {
        this.mode = 'game';
    } else {
        this.mode = 'normal';
    }
    this.isGamePage = (this.mode === 'game');
}

// 应用模式样式和行为
applyMode() {
    var cls = this.mode === 'normal' ? '' : 'mode-' + this.mode;
    this.assistant.className = 'learning-assistant';
    if (cls) this.assistant.classList.add(cls);

    if (this.mode === 'game' && this.progressRing) {
        this.progressRing.classList.add('show');
    } else if (this.progressRing) {
        this.progressRing.classList.remove('show');
    }
}
```

- [ ] **Step 2: Update setupAssistantInteraction to be mode-aware**

Replace the click handler in `setupAssistantInteraction()` (lines 293-307):

```javascript
this.assistant.addEventListener('click', function() {
    var settings = self.getSettings();
    if (settings.clickInteraction === false) return;

    if (self.mode === 'game') {
        self.celebrate();
    } else if (self.mode === 'music') {
        // Toggle beat speed: cycle 60 → 100 → 140 → 180 → 60
        var bpms = [60, 100, 140, 180];
        var idx = bpms.indexOf(self.beatBpm);
        var next = bpms[(idx + 1) % bpms.length];
        self.setBeat(next);
        if (self.beatInterval) {
            self.stopMusicBeat();
            self.startMusicBeat();
        }
        self.showEncouragement();
    } else {
        self.showEncouragement();
        if (settings.voiceEncouragement !== false) {
            self.speakEncouragement();
        }
    }
});
```

- [ ] **Step 3: Update celebrate() to not override mode animations for music**

In `celebrate()` (line 505-507), modify the animation save/restore to also exclude music mode:

Old:
```javascript
var savedAnimation = this.assistant.style.animation;
var hadFloatAnimation = !!(savedAnimation && savedAnimation.indexOf('float') !== -1);
```

New:
```javascript
var savedAnimation = this.assistant.style.animation;
var hadFloatAnimation = !!(savedAnimation && (savedAnimation.indexOf('float') !== -1 || savedAnimation.indexOf('musicBounce') !== -1));
```

Also in the cleanup (lines 536-545), update the restore logic:

Old:
```javascript
if (hadFloatAnimation) {
    this.assistant.style.animation = savedAnimation;
} else {
    this.assistant.style.animation = '';
}
```

New:
```javascript
if (hadFloatAnimation) {
    this.assistant.style.animation = savedAnimation;
} else {
    this.assistant.style.animation = '';
}
// Music mode: restart beat after celebrate
if (self.mode === 'music' && self.beatInterval === null && self.beatBpm) {
    self.startMusicBeat();
}
```

- [ ] **Step 4: Commit**

```bash
git add assets/js/learning-assistant.js
git commit -m "assistant: add mode detection and switching system"
```

---

### Task 2: Add mode-specific CSS styles

**Files:**
- Modify: `assets/css/learning-assistant.css`

- [ ] **Step 1: Add mode glow color variables and class styles**

After the `.learning-assistant.dragging:hover` rule (line 35), add:

```css
/* ===== Mode Styles ===== */
.learning-assistant.mode-study {
    box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);
    animation: floatStudy 3s ease-in-out infinite;
}
.learning-assistant.mode-study:hover {
    box-shadow: 0 6px 25px rgba(0, 212, 255, 0.6);
}
.learning-assistant.mode-study.dragging {
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.55);
}

.learning-assistant.mode-game {
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
    animation: floatGame 1.5s ease-in-out infinite;
}
.learning-assistant.mode-game:hover {
    box-shadow: 0 6px 25px rgba(255, 107, 53, 0.6);
}
.learning-assistant.mode-game.dragging {
    box-shadow: 0 8px 32px rgba(255, 107, 53, 0.55);
}

.learning-assistant.mode-music {
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
}
.learning-assistant.mode-music:hover {
    box-shadow: 0 6px 25px rgba(168, 85, 247, 0.6);
}
.learning-assistant.mode-music.dragging {
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.55);
}
```

- [ ] **Step 2: Add mode-specific float animations**

After the existing `@keyframes float` rule (line 138), add:

```css
@keyframes floatStudy {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
}

@keyframes floatGame {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-6px) scale(1.05); }
}
```

- [ ] **Step 3: Add music bounce animation**

After `floatGame`, add:

```css
/* 音乐节拍跳动 */
@keyframes musicBounce {
    0%, 100% {
        transform: translateY(0) scale(1);
    }
    15% {
        transform: translateY(-18px) scale(1.15);
    }
    30% {
        transform: translateY(0) scale(1);
    }
}

/* 音乐粒子 */
.music-note-particle {
    position: fixed;
    font-size: 20px;
    pointer-events: none;
    z-index: 10002;
    animation: noteFloat 1.5s ease-out forwards;
}

@keyframes noteFloat {
    0% {
        opacity: 1;
        transform: translate(0, 0) scale(0.5) rotate(0deg);
    }
    100% {
        opacity: 0;
        transform: translate(var(--nx), var(--ny)) scale(1.2) rotate(var(--nr));
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add assets/css/learning-assistant.css
git commit -m "assistant: add mode-specific CSS styles and music beat animation"
```

---

### Task 3: Add music beat sync methods to learning-assistant.js

**Files:**
- Modify: `assets/js/learning-assistant.js`

- [ ] **Step 1: Add setBeat, startMusicBeat, stopMusicBeat methods**

After `applyMode()`, add:

```javascript
// 设置节拍BPM
setBeat(bpm) {
    this.beatBpm = bpm || 100;
}

// 开始音乐节拍跳动
startMusicBeat() {
    if (this.mode !== 'music') return;
    this.stopMusicBeat();
    var self = this;
    var interval = Math.round(60000 / this.beatBpm);
    this.assistant.style.animation = 'musicBounce ' + (interval / 1000) + 's ease-out infinite';

    // 每拍释放音乐音符粒子
    this.beatInterval = setInterval(function() {
        self.spawnMusicNotes();
    }, interval);
}

// 停止音乐节拍
stopMusicBeat() {
    if (this.beatInterval) {
        clearInterval(this.beatInterval);
        this.beatInterval = null;
    }
    this.assistant.style.animation = '';
}

// 音乐音符粒子
spawnMusicNotes() {
    var notes = ['🎵', '🎶', '♪', '♫', '🎼'];
    var rect = this.assistant.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top;
    var count = 2 + Math.floor(Math.random() * 2);

    for (var i = 0; i < count; i++) {
        var note = document.createElement('span');
        note.className = 'music-note-particle';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.left = (cx + (Math.random() - 0.5) * 40) + 'px';
        note.style.top = cy + 'px';
        note.style.setProperty('--nx', ((Math.random() - 0.5) * 80) + 'px');
        note.style.setProperty('--ny', -(40 + Math.random() * 80) + 'px');
        note.style.setProperty('--nr', (Math.random() * 180 - 90) + 'deg');
        document.body.appendChild(note);
        setTimeout(function() {
            if (note.parentNode) note.parentNode.removeChild(note);
        }, 1600);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/js/learning-assistant.js
git commit -m "assistant: add music beat sync with note particles"
```

---

### Task 4: Add streak system to common.js

**Files:**
- Modify: `assets/js/common.js`

- [ ] **Step 1: Add streak helper functions**

After `getStudyPoints()` (line 130), add:

```javascript
function getStreakData() {
    var d = JSON.parse(localStorage.getItem('studyStreak') || '{"currentStreak":0,"lastStudyDate":"","maxStreak":0}');
    if (!d.currentStreak) d.currentStreak = 0;
    if (!d.maxStreak) d.maxStreak = 0;
    return d;
}

function updateStreak() {
    var streak = getStreakData();
    var today = new Date().toISOString().slice(0, 10);
    if (streak.lastStudyDate === today) return streak;

    var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (streak.lastStudyDate === yesterday) {
        streak.currentStreak += 1;
    } else if (streak.lastStudyDate === '') {
        streak.currentStreak = 1;
    } else {
        streak.currentStreak = 1;
    }
    streak.lastStudyDate = today;
    if (streak.currentStreak > streak.maxStreak) {
        streak.maxStreak = streak.currentStreak;
    }
    localStorage.setItem('studyStreak', JSON.stringify(streak));
    return streak;
}

function getStreakMultiplier() {
    var streak = getStreakData();
    var days = streak.currentStreak;
    if (days >= 30) return 3.0;
    if (days >= 7) return 2.0;
    if (days >= 3) return 1.5;
    return 1.0;
}
```

- [ ] **Step 2: Update addStudyPoints to use streak multiplier**

Replace the existing `addStudyPoints` (lines 132-145):

```javascript
function addStudyPoints(subject, points, reason) {
    var streak = updateStreak();
    var multiplier = getStreakMultiplier();
    var actualPoints = Math.round(points * multiplier);

    var data = getStudyPoints();
    data.total += actualPoints;
    if (!data.subjects[subject]) data.subjects[subject] = { points: 0, count: 0 };
    data.subjects[subject].points += actualPoints;
    data.subjects[subject].count += 1;
    data.history.push({ time: new Date().toISOString(), subject: subject, reason: reason, points: actualPoints });
    localStorage.setItem('studyPoints', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('studyPointsUpdated', { detail: data }));
    showPointsNotification(actualPoints, reason, multiplier, streak.currentStreak);
    return data;
}
```

- [ ] **Step 3: Update showPointsNotification signature and content**

Replace `showPointsNotification(points, reason)` (lines 147-178):

```javascript
function showPointsNotification(points, reason, multiplier, streakDays) {
    var assistant = document.getElementById('learningAssistant');
    if (!assistant || assistant.style.display === 'none') return;

    var rect = assistant.getBoundingClientRect();
    var ax = rect.left + rect.width / 2;
    var ay = rect.top + rect.height / 2;
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;

    var coinCount = Math.min(Math.ceil(points / 2), 8);
    for (var i = 0; i < coinCount; i++) {
        setTimeout(function() {
            spawnCoin(ax, ay, cx, cy);
        }, i * 60);
    }

    var bubble = document.getElementById('assistantSpeechBubble');
    if (bubble) {
        var msg = '+' + points + ' 积分！' + reason;
        if (multiplier && multiplier > 1) {
            msg += '  (🔥×' + multiplier.toFixed(1) + ' 连学' + streakDays + '天)';
        }
        bubble.textContent = msg;
        bubble.style.display = 'block';
        if (window.learningAssistant) {
            window.learningAssistant.updateBubblePosition();
        }
        bubble.classList.add('show');
        setTimeout(function() {
            bubble.classList.remove('show');
            setTimeout(function() {
                bubble.style.display = 'none';
            }, 300);
        }, 2500);
    }
}
```

Note: Also update the existing `spawnCoin` to use the image approach (already done in earlier conversation).

- [ ] **Step 4: Commit**

```bash
git add assets/js/common.js
git commit -m "assistant: add streak multiplier system to study points"
```

---

### Task 5: Update assistant.html points page with streak and daily stats

**Files:**
- Modify: `assistant.html`

- [ ] **Step 1: Add streak section to points-summary HTML**

In `assistant.html`, find the `points-summary` div (around line 674) and add streak display between the total points and badge count:

```html
<div class="points-summary">
    <div class="points-total-wrap">
        <div class="points-total" id="pointsTotal">0</div>
        <div class="points-total-label">总积分</div>
    </div>
    <div class="points-streak-wrap" id="streakWrap">
        <div class="streak-fire" id="streakIcon">🔥</div>
        <div class="streak-num" id="streakDays">0</div>
        <div class="streak-label">连续学习天数</div>
        <div class="streak-max" id="streakMax">最高纪录: 0 天</div>
    </div>
    <div class="points-badge-count">
        <div class="badge-count-num" id="badgeCountTotal">0</div>
        <div class="badge-count-label">徽章总数</div>
    </div>
</div>
```

- [ ] **Step 2: Add streak CSS**

In the `<style>` block, after `.badge-count-label`:

```css
.points-streak-wrap {
    text-align: center;
    position: relative;
}
.points-streak-wrap::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 10%;
    height: 80%;
    width: 1px;
    background: var(--border-subtle);
}
.streak-fire { font-size: 32px; margin-bottom: 2px; }
.streak-num {
    font-size: 38px;
    font-weight: 800;
    background: linear-gradient(135deg, #ff6b6b, #ff8c00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
}
.streak-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
}
.streak-max {
    font-size: 11px;
    color: var(--text-secondary);
    margin-top: 2px;
    opacity: 0.7;
}
```

- [ ] **Step 3: Add "today harvest" section HTML**

After the badges grid div (line 686), add:

```html
<!-- 今日收获 -->
<div class="today-harvest" id="todayHarvest" style="display:none;">
    <div class="harvest-item">
        <div class="harvest-icon">🪙</div>
        <div class="harvest-num" id="todayPoints">0</div>
        <div class="harvest-label">今日积分</div>
    </div>
    <div class="harvest-item">
        <div class="harvest-icon">📝</div>
        <div class="harvest-num" id="todayItems">0</div>
        <div class="harvest-label">今日掌握</div>
    </div>
    <div class="harvest-item">
        <div class="harvest-icon">🎯</div>
        <div class="harvest-num" id="dailyGoal">0/100</div>
        <div class="harvest-label">每日目标</div>
    </div>
</div>
```

- [ ] **Step 4: Add harvest CSS**

```css
/* 今日收获 */
.today-harvest {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
}
.harvest-item {
    flex: 1;
    background: var(--card-bg-color);
    border-radius: 14px;
    padding: 18px;
    border: 1px solid var(--border-card);
    text-align: center;
}
.harvest-icon { font-size: 28px; margin-bottom: 4px; }
.harvest-num {
    font-size: 24px;
    font-weight: 700;
    color: #ffd700;
}
.harvest-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
}
```

- [ ] **Step 5: Update renderPoints() to populate new sections**

In `renderPoints()`, after setting `badgeCountTotal`, add:

```javascript
// 连续天数
var streak = typeof getStreakData === 'function' ? getStreakData() : { currentStreak: 0, maxStreak: 0 };
document.getElementById('streakDays').textContent = streak.currentStreak || 0;
document.getElementById('streakMax').textContent = '最高纪录: ' + (streak.maxStreak || 0) + ' 天';

// 今日收获
var today = new Date().toISOString().slice(0, 10);
var todayPoints = 0;
var todayItems = 0;
for (var i = data.history.length - 1; i >= 0; i--) {
    var h = data.history[i];
    if (h.time && h.time.slice(0, 10) === today) {
        todayPoints += h.points;
        todayItems++;
    }
}
document.getElementById('todayPoints').textContent = todayPoints;
document.getElementById('todayItems').textContent = todayItems;
var goal = 100;
document.getElementById('dailyGoal').textContent = Math.min(todayPoints, goal) + '/' + goal;
document.getElementById('todayHarvest').style.display = 'flex';
```

- [ ] **Step 6: Update responsive CSS**

Add to the `@media (max-width: 768px)` block:

```css
.points-streak-wrap::before { left: -12px; }
.streak-num { font-size: 30px; }
.today-harvest { flex-direction: column; }
```

- [ ] **Step 7: Commit**

```bash
git add assistant.html
git commit -m "assistant: add streak display, daily goal, and harvest stats to points page"
```

---

### Task 6: Add data-assistant-mode attributes to all HTML pages

**Files:**
- Modify: `english.html`, `chinese.html`, `baike.html`, `math.html`, `science.html`
- Modify: `game.html`, `game-car.html`, `game-english.html`, `game-math.html`
- Modify: `music.html`

- [ ] **Step 1: Add study mode to 5 study pages**

Find the `<body` tag in each file and add `data-assistant-mode="study"`:

english.html — find `<body` and change to `<body data-assistant-mode="study"`
chinese.html — find `<body` and change to `<body data-assistant-mode="study"`
baike.html — find `<body` and change to `<body data-assistant-mode="study"`
math.html — find `<body` and change to `<body data-assistant-mode="study"`
science.html — find `<body` and change to `<body data-assistant-mode="study"`

- [ ] **Step 2: Add game mode to 4 game pages**

game.html — find `<body` and change to `<body data-assistant-mode="game"`
game-car.html — find `<body` and change to `<body data-assistant-mode="game"`
game-english.html — find `<body` and change to `<body data-assistant-mode="game"`
game-math.html — find `<body` and change to `<body data-assistant-mode="game"`

- [ ] **Step 3: Add music mode to music.html + beat sync integration**

music.html — find `<body` and change to `<body data-assistant-mode="music"`

Then find the `initLearningAssistant()` call in music.html and add beat sync after it. Search for the pattern around the audio player play/pause events. In `music.html`, find `function togglePlay()` and add:

At the end of `togglePlay()`, after play starts:
```javascript
if (window.learningAssistant) {
    if (!audioPlayer.paused) {
        window.learningAssistant.setBeat(currentSongBpm || 100);
        window.learningAssistant.startMusicBeat();
    } else {
        window.learningAssistant.stopMusicBeat();
    }
}
```

And in the song loading function (where songs are loaded), add a BPM lookup:

```javascript
// BPM lookup from style tag
function getBpmFromStyle(style) {
    if (!style) return 100;
    if (style.indexOf('欢快') !== -1) return 140;
    if (style.indexOf('舒缓') !== -1) return 70;
    if (style.indexOf('动感') !== -1) return 120;
    return 100;
}
```

- [ ] **Step 4: Commit**

```bash
git add english.html chinese.html baike.html math.html science.html game.html game-car.html game-english.html game-math.html music.html
git commit -m "assistant: add data-assistant-mode attributes to all pages"
```

---

### Task 7: Final verification

**Files:**
- Verify all modified files

- [ ] **Step 1: Verify all files are consistent**

Check that all 10 HTML pages have the correct `data-assistant-mode` attribute.
Check that `learning-assistant.js` has all new methods.
Check that `learning-assistant.css` has all mode styles.
Check that `common.js` has streak functions.

```bash
grep -rn 'data-assistant-mode' *.html
grep -rn 'detectMode\|applyMode\|setBeat\|startMusicBeat\|stopMusicBeat' assets/js/learning-assistant.js
grep -rn 'getStreak\|updateStreak\|getStreakMultiplier' assets/js/common.js
grep -rn 'mode-study\|mode-game\|mode-music\|musicBounce' assets/css/learning-assistant.css
```

- [ ] **Step 2: Commit any final fixes**

```bash
git add -A
git commit -m "assistant: final verification and fixes for three-mode system"
```
