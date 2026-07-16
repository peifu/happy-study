class WordRacingGame {
    constructor() {
        // 先检查DOM元素是否存在
        this.gameContainer = document.getElementById('gameContainer');
        this.playerCar = document.getElementById('playerCar');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.levelDisplay = document.getElementById('levelDisplay');
        this.livesContainer = document.getElementById('livesContainer');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        
        // 检查必要元素是否存在
        if (!this.gameContainer || !this.playerCar || !this.startScreen) {
            console.error('必要DOM元素缺失:', {
                gameContainer: !!this.gameContainer,
                playerCar: !!this.playerCar,
                startScreen: !!this.startScreen
            });
            return;
        }
        
        this.gameWidth = 1200;
        this.gameHeight = 750;
        this.laneWidth = this.gameWidth / 6;
        this.currentLane = 2; // 0-5 lanes
        this.playerY = this.gameHeight - 150;
        
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.gameRunning = false;
        this.backgroundY = 0;
        this.difficulty = 'normal'; // easy/normal/hard
        this.speedMap = { easy: 1.2, normal: 1.8, hard: 2.4 };
        this.fallSpeed = this.speedMap.normal;

        this.wordItems = [];
        this.wordBarrels = [];
        this.learnedWords = new Set();
        this.consecutiveCollections = 0;
        this.perfectLevelBonus = 0;
        this.currentTargetWord = null;
        this.correctHits = 0;
        this.empCharges = 0;
        this.chineseHint = document.getElementById('chineseHint');
        this.onCorrectHit = null;
        this.spawnTimer = null;
        this.animFrameId = null;
        this.gameSpeed = 3;
        this.currentBook = 'grade3a';  // 当前单词本 ID
        this.wordIndex = null;         // book-index.json 内容
        this.audioCtx = null;          // Web Audio API 上下文
        this.bgmAudio = null;          // BGM 音频元素
        this.bgmVolume = 0.25;
        this.bgmSongs = [               // 随机播放列表
            'data/music/songs/Sia-Unstoppable.mp3',
            'data/music/songs/Sia-Move Your Body.mp3',
            'data/music/songs/王力宏-天地龙鳞.mp3',
            'data/music/songs/班得瑞-敲击.mp3'
        ];
        this.bgmIndex = -1;
        this.paused = false;
        this.bgmEnabled = true;
        this.pauseOverlay = null;
        
        // 键盘状态控制
        this.keys = {
            left: false,
            right: false,
            leftPressed: false,
            rightPressed: false
        };
        
        // 单词列表（从 JSON 加载）
        this.wordList = [];
        
        this.init();
    }
    
    // ========== 音频系统 ==========

    initAudioContext() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    startBgm() {
        this.stopBgm();
        if (!this.bgmEnabled) return;
        // 随机选一首（不重复上一首）
        var idx;
        do { idx = Math.floor(Math.random() * this.bgmSongs.length); }
        while (idx === this.bgmIndex && this.bgmSongs.length > 1);
        this.bgmIndex = idx;
        try {
            var audio = new Audio(this.bgmSongs[idx]);
            audio.loop = false;
            audio.volume = this.bgmVolume;
            audio.play().catch(function(){});
            audio.addEventListener('ended', function() { this.startBgm(); }.bind(this));
            this.bgmAudio = audio;
        } catch(e) { console.warn('BGM 加载失败:', e); }
    }

    stopBgm() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio = null;
        }
    }

    playCorrectSound() {
        if (!this.audioCtx) return;
        var now = this.audioCtx.currentTime;
        [523.25, 659.25].forEach(function(freq, i) {
            var osc = this.audioCtx.createOscillator();
            var gain = this.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.3, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        }, this);
    }

    playWrongSound() {
        if (!this.audioCtx) return;
        var now = this.audioCtx.currentTime;
        var osc = this.audioCtx.createOscillator();
        var gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playEmpSound() {
        if (!this.audioCtx) return;
        var now = this.audioCtx.currentTime;
        var osc = this.audioCtx.createOscillator();
        var gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(3000, now + 0.6);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
    }

    // ========== 暂停 / BGM 控制 ==========

    togglePause() {
        if (!this.gameRunning) return;
        this.paused = !this.paused;
        if (this.paused) {
            this.showPauseOverlay();
            if (this.bgmAudio) this.bgmAudio.pause();
        } else {
            this.hidePauseOverlay();
            if (this.bgmAudio) this.bgmAudio.play().catch(function(){});
        }
        var btn = document.getElementById('pauseBtn');
        if (btn) btn.textContent = this.paused ? '▶' : '⏸';
    }

    showPauseOverlay() {
        if (this.pauseOverlay) return;
        var div = document.createElement('div');
        div.className = 'pause-overlay';
        div.innerHTML = '<div class="pause-text">⏸ 暂停</div><div class="pause-hint">点击 ▶ 继续游戏</div>';
        div.addEventListener('click', function() { this.togglePause(); }.bind(this));
        this.gameContainer.appendChild(div);
        this.pauseOverlay = div;
    }

    hidePauseOverlay() {
        if (this.pauseOverlay) {
            this.pauseOverlay.remove();
            this.pauseOverlay = null;
        }
    }

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.startBgm();
        } else {
            this.stopBgm();
        }
        var btn = document.getElementById('musicBtn');
        if (btn) btn.classList.toggle('muted', !this.bgmEnabled);
    }

    init() {
        console.log('游戏初始化开始');
        try {
            this.setupEventListeners();
            this.positionPlayerCar();
            this.updateLivesDisplay();
            this.loadTestedWords();
            console.log('游戏初始化完成');
        } catch (error) {
            console.error('游戏初始化失败:', error);
        }
    }
    
    setupEventListeners() {
        console.log('设置事件监听器');
        
        // 键盘控制 - 使用keypress事件确保单次按键单次移动
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && !this.keys.leftPressed) {
                this.keys.leftPressed = true;
                this.moveLeft();
                e.preventDefault();
            } else if (e.key === 'ArrowRight' && !this.keys.rightPressed) {
                this.keys.rightPressed = true;
                this.moveRight();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') {
                this.keys.leftPressed = false;
            } else if (e.key === 'ArrowRight') {
                this.keys.rightPressed = false;
            }
        });
        
        // 按钮控制 - 添加防抖
        let leftBtnPressed = false;
        let rightBtnPressed = false;
        
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                if (!leftBtnPressed) {
                    leftBtnPressed = true;
                    this.moveLeft();
                    setTimeout(() => { leftBtnPressed = false; }, 200);
                }
            });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                if (!rightBtnPressed) {
                    rightBtnPressed = true;
                    this.moveRight();
                    setTimeout(() => { rightBtnPressed = false; }, 200);
                }
            });
        }
        
        // 游戏控制
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('开始游戏按钮点击事件触发');
                this.startGame();
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartGame();
            });
        }
        
        console.log('事件监听器设置完成');
    }
    
    positionPlayerCar() {
        const laneCenterX = (this.currentLane + 0.5) * this.laneWidth - 40;
        this.playerCar.style.left = laneCenterX + 'px';
        this.playerCar.style.top = this.playerY + 'px';
    }
    
    moveLeft() {
        if (this.currentLane > 1 && this.gameRunning) {
            this.currentLane--;
            this.positionPlayerCar();
            this.addMoveEffect();
        }
    }

    moveRight() {
        if (this.currentLane < 4 && this.gameRunning) {
            this.currentLane++;
            this.positionPlayerCar();
            this.addMoveEffect();
        }
    }
    
    addMoveEffect() {
        anime({
            targets: this.playerCar,
            scale: [1, 1.1, 1],
            duration: 200,
            easing: 'easeOutQuad'
        });
    }
    
    startGame() {
        console.log('开始游戏按钮被点击');
        try {
            // 取消旧循环（防止重复启动导致多个循环链）
            if (this.spawnTimer) clearTimeout(this.spawnTimer);
            if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

            // 清理旧物品
            this.wordItems.forEach(function(item) { item.element.remove(); });
            this.wordItems = [];
            this.correctHits = 0;
            this.empCharges = 0;
            this.playerCar.classList.remove('emp-aura');
            this.updateBombBtn();

            this.startScreen.classList.add('hidden');
            this.gameRunning = true;
            this.currentLane = 2; // 固定在中间车道
            this.positionPlayerCar();
            this.initAudioContext();
            this.startBgm();
            this.spawnNextWave(); // 生成第一波单词并设置中文提示
            this.gameLoop();
            console.log('游戏启动成功');
        } catch (error) {
            console.error('游戏启动失败:', error);
        }
    }
    
    restartGame() {
        // 取消旧循环（防止重复启动导致多个循环链）
        if (this.spawnTimer) clearTimeout(this.spawnTimer);
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

        // 清理游戏状态
        this.wordItems.forEach(function(item) { item.element.remove(); });
        this.wordBarrels.forEach(function(b) { b.element.remove(); });

        // 重置游戏数据
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.currentLane = 2;
        this.fallSpeed = this.speedMap[this.difficulty];
        this.correctHits = 0;
        this.empCharges = 0;
        this.playerCar.classList.remove('emp-aura');
        this.updateBombBtn();
        this.wordItems = [];
        this.wordBarrels = [];
        this.initAudioContext();
        this.startBgm();
        
        // 更新显示
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateLivesDisplay();
        this.positionPlayerCar();
        
        // 隐藏游戏结束界面
        this.gameOverScreen.classList.add('hidden');
        
        // 重新开始游戏
        this.gameRunning = true;
        this.spawnNextWave();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.paused) {
            this.updateBackground();
            this.updateWordItems();
            this.checkCollisions();
            this.checkLevelUp();

            // 当前波次结束后（无目标且无物品），自动发起下一波
            if (!this.currentTargetWord && this.wordItems.length === 0) {
                this.spawnNextWave();
            }
        }
        
        // 继续游戏循环，保存引用以便取消
        this.animFrameId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // 发起新的一波：先挑选所有单词（确保不重复），再生成，最后更新提示
    spawnNextWave() {
        if (!this.gameRunning) return;

        // 收集屏幕上已有单词，防止跨波重复
        var usedWords = {};
        this.wordItems.forEach(function(it) { usedWords[it.wordObj.word] = true; });

        // 挑选正确单词
        var target = this.getRandomWord();
        this.currentTargetWord = target;
        usedWords[target.word] = true;

        // 挑选 3 个不重复的错误单词（4条车道，1条给正确单词）
        var wrongCount = 3;
        var wrongWords = [];
        var tries = 0;
        while (wrongWords.length < wrongCount && tries < 100) {
            tries++;
            var w = this.getRandomWord();
            if (!usedWords[w.word]) {
                usedWords[w.word] = true;
                wrongWords.push(w);
            }
        }

        // 分配车道并生成
        var lanes = [1, 2, 3, 4];
        for (var i = lanes.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = lanes[i]; lanes[i] = lanes[j]; lanes[j] = tmp;
        }
        this.spawnWordItem(target, true, lanes[0]);

        // 约30%概率将其中一个错误单词替换为炸弹
        var spawnBomb = Math.random() < 0.3;
        for (var k = 0; k < wrongWords.length; k++) {
            if (spawnBomb && k === wrongWords.length - 1) {
                this.spawnBombItem(lanes[k + 1]);
            } else {
                this.spawnWordItem(wrongWords[k], false, lanes[k + 1]);
            }
        }

        // 最后更新提示 — 此时 target 确定已生成
        if (this.chineseHint && target) {
            this.chineseHint.textContent = target.translation || target.word;
        }
    }

    getFreeLane(usedInWave) {
        var occupied = usedInWave || {};
        this.wordItems.forEach(function(item) { if (item.y < this.playerY - 50) occupied[item.lane] = true; }, this);
        var freeLanes = [];
        for (var l = 1; l <= 4; l++) { if (!occupied[l]) freeLanes.push(l); }
        if (freeLanes.length === 0) return 1 + Math.floor(Math.random() * 4);
        return freeLanes[Math.floor(Math.random() * freeLanes.length)];
    }

    // 从 book-index.json 加载单词数据
    async loadWordData(bookId) {
        if (!this.wordIndex) {
            try {
                var resp = await fetch('data/english/book-index.json');
                this.wordIndex = await resp.json();
            } catch (e) {
                console.error('加载单词本索引失败:', e);
                return;
            }
        }
        // 切换单词本时：先保存当前词库的已测单词，再加载新词库的
        this.saveTestedWords();
        this.learnedWords.clear();
        this.currentBook = bookId;
        var fileMap = {};
        this.wordIndex.forEach(function(entry) { fileMap[entry.id] = entry.file; });
        var file = fileMap[bookId];
        if (!file) { console.error('未知的单词本:', bookId); return; }
        try {
            var resp = await fetch(file);
            var data = await resp.json();
            // 统一格式：将 JSON 中的 meaning/phonetic 映射为 translation/pronunciation
            this.wordList = data.map(function(w) {
                return { word: w.word, translation: w.meaning, pronunciation: w.phonetic };
            });
            console.log('单词数据加载成功:', this.wordList.length, '个单词');
            this.loadTestedWords();
        } catch (error) {
            console.error('加载单词数据失败:', error);
            this.wordList = [];
        }
    }

    // 从已加载的词表中随机选一个单词（排除已测试过的单词）
    getRandomWord() {
        if (this.wordList.length === 0) {
            return { word: 'HELLO', translation: '你好', pronunciation: 'həˈloʊ' };
        }
        // 排除在已经测试/掌握的单词，防止重复出现
        var available = this.wordList.filter(function(w) { return !this.learnedWords.has(w.word); }.bind(this));
        if (available.length === 0) {
            // 所有单词都测试过了，回退到完整词表
            available = this.wordList;
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    // ========== 已测试单词持久化（跨局的 localStorage） ==========

    loadTestedWords() {
        try {
            var key = 'carGame_testedWords_' + this.currentBook;
            var stored = localStorage.getItem(key);
            if (stored) {
                var words = JSON.parse(stored);
                var self = this;
                words.forEach(function(w) { self.learnedWords.add(w); });
                console.log('加载已测试单词:', this.learnedWords.size, '个');
            }
        } catch (e) {
            console.warn('加载已测试单词失败:', e);
        }
    }

    saveTestedWords() {
        try {
            var key = 'carGame_testedWords_' + this.currentBook;
            localStorage.setItem(key, JSON.stringify(Array.from(this.learnedWords)));
        } catch (e) {
            console.warn('保存已测试单词失败:', e);
        }
    }

    celebrateEMP() {
        var emojis = ['⚡', '✨', '💥', '🌟', '🔥', '🎉', '⭐', '💫'];
        for (var i = 0; i < 40; i++) {
            var p = document.createElement('span');
            p.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;font-size:28px;left:' +
                (100 + Math.random() * 800) + 'px;top:' + (50 + Math.random() * 500) + 'px;';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            document.body.appendChild(p);
            anime({ targets: p,
                translateX: (Math.random() - 0.5) * 600,
                translateY: (Math.random() - 0.5) * 500,
                rotate: Math.random() * 720,
                opacity: [1, 0], scale: [0.5, 1.5],
                duration: 1200, easing: 'easeOutExpo',
                complete: function() { p.remove(); }
            });
        }
    }

    updateBombBtn() {
        var bombBtn = document.getElementById('bombBtn');
        if (!bombBtn) return;
        if (this.empCharges > 0) {
            bombBtn.classList.add('active');
            bombBtn.textContent = '⚡x' + this.empCharges;
        } else {
            bombBtn.classList.remove('active');
            bombBtn.textContent = '⚡';
        }
    }

    spawnWordItem(wordObj, isCorrect, optLane) {
        var lane = optLane !== undefined ? optLane : this.getFreeLane();
        var el = document.createElement('div');
        el.className = 'word-barrel';
        el.dataset.correct = isCorrect ? '1' : '0';
        var label = document.createElement('span');
        label.className = 'word-label';
        label.textContent = wordObj.word.toLowerCase();
        el.appendChild(label);
        var x = (lane + 0.5) * this.laneWidth - 65;
        el.style.left = x + 'px';
        el.style.top = '-80px';
        this.gameContainer.appendChild(el);
        this.wordItems.push({
            element: el, lane: lane, y: -80,
            wordObj: wordObj, isCorrect: isCorrect,
            speed: this.fallSpeed, alreadyHit: false, isBomb: false
        });
    }

    spawnBombItem(optLane) {
        var lane = optLane !== undefined ? optLane : this.getFreeLane();
        var el = document.createElement('div');
        el.className = 'bomb-only';
        var x = (lane + 0.5) * this.laneWidth - 40;
        el.style.left = x + 'px';
        el.style.top = '-80px';
        el.textContent = '💣';
        this.gameContainer.appendChild(el);
        this.wordItems.push({
            element: el, lane: lane, y: -80,
            wordObj: null, isCorrect: false,
            speed: this.fallSpeed * 1.5, alreadyHit: false, isBomb: true
        });
    }

    updateWordItems() {
        var wasCorrectRemoved = false;
        this.wordItems = this.wordItems.filter(function(item) {
            item.y += item.speed;
            item.element.style.top = item.y + 'px';
            if (item.y > this.playerY + 20) {
                if (item.isCorrect) wasCorrectRemoved = true;
                item.element.remove();
                return false;
            }
            return true;
        }, this);
        // 正确单词未被命中就落出屏幕 → 清除剩余单词，准备下一波
        if (wasCorrectRemoved) {
            this.wordItems.forEach(function(item) { item.element.remove(); });
            this.wordItems = [];
            this.currentTargetWord = null;
        }
    }
    
    checkCollisions() {
        const playerRect = {
            x: this.currentLane * this.laneWidth,
            y: this.playerY,
            width: 80,
            height: 120
        };

        // 单词碰撞 — 倒序遍历避免 splice 导致索引偏移
        for (var i = this.wordItems.length - 1; i >= 0; i--) {
            var item = this.wordItems[i];
            if (item.alreadyHit) continue;
            var itemRect = { x: item.lane * this.laneWidth, y: item.y, width: 130, height: 130 };
            if (this.isColliding(playerRect, itemRect)) {
                item.alreadyHit = true;
                if (item.isBomb) {
                    this.handleBombHit(item, i);
                    continue;
                }
                // 必须同时匹配 isCorrect 标记和 currentTargetWord，防止多波重叠时错配
                if (item.isCorrect && this.currentTargetWord && item.wordObj.word === this.currentTargetWord.word) {
                    this.handleCorrectHit(item, i);
                } else {
                    this.handleWrongHit(item, i);
                }
            }
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    handleCorrectHit(item, index) {
        // 命中正确单词后，清除所有其他掉落中的单词
        this.wordItems.forEach(function(other) {
            if (other !== item) other.element.remove();
        });
        this.wordItems = [item]; // 只保留被命中的这个等待动画

        this.score += 20;
        this.correctHits++;
        this.learnedWords.add(item.wordObj.word);
        this.currentTargetWord = null; // 让 spawnLoop 选下一个目标
        this.updateScoreDisplay();
        this.playCorrectSound();
        // 在移除 DOM 前读取位置并触发动画
        var el = item.element;
        this.showScorePopup(el.offsetLeft, el.offsetTop, '+20');
        this.addCollectionEffect(item);
        // 延迟移除，让收集动画播放完成，然后从 wordItems 清除以便下一波
        var self = this;
        setTimeout(function() {
            el.remove();
            var idx = self.wordItems.indexOf(item);
            if (idx !== -1) self.wordItems.splice(idx, 1);
        }, 800);

        // 每4个正确单词 = 1次EMP充能（可叠加），触发庆祝
        if (this.correctHits >= 4) {
            this.correctHits = 0;
            this.empCharges++;
            this.playerCar.classList.add('emp-aura');
            this.updateBombBtn();
            this.celebrateEMP();
        }
        if (this.onCorrectHit) this.onCorrectHit(item.wordObj);
    }

    handleWrongHit(item, index) {
        this.wordItems.splice(index, 1);
        item.element.remove();
        this.lives--;
        this.updateLivesDisplay();
        this.playWrongSound();
        this.addCollisionEffect();
        if (this.lives <= 0) this.gameOver();
    }

    handleBombHit(item, index) {
        var el = item.element;
        var left = el.offsetLeft;
        var top = el.offsetTop;
        this.wordItems.splice(index, 1);
        el.remove();
        this.lives--;
        this.updateLivesDisplay();
        this.playWrongSound();
        this.addCollisionEffect();
        this.showScorePopup(left, top, '💣-1');
        if (this.lives <= 0) this.gameOver();
    }

    setDifficulty(level) {
        if (!this.speedMap[level]) return;
        this.difficulty = level;
        this.fallSpeed = this.speedMap[level];
    }

    useBomb() {
        if (this.empCharges <= 0 || !this.gameRunning) return;
        this.empCharges--;
        if (this.empCharges <= 0) {
            this.playerCar.classList.remove('emp-aura');
        }
        this.updateBombBtn();

        var count = this.wordItems.length;
        this.wordItems.forEach(function(item) { item.element.remove(); });
        this.wordItems = [];
        this.currentTargetWord = null; // 清屏后触发下一波
        this.playEmpSound();

        if (count > 0) {
            this.score += count * 10;
            this.updateScoreDisplay();
        }
    }

    addCollisionEffect() {
        this.gameContainer.classList.add('collision-effect');
        setTimeout(() => {
            this.gameContainer.classList.remove('collision-effect');
        }, 500);
        
        // 汽车闪烁效果
        anime({
            targets: this.playerCar,
            opacity: [1, 0.3, 1, 0.3, 1],
            duration: 500,
            easing: 'easeInOutQuad'
        });
    }
    
    updateBackground() {
        this.backgroundY += this.gameSpeed * 0.5;
        this.gameContainer.style.backgroundPosition = `0 ${this.backgroundY}px`;
    }
    
    addCollectionEffect(barrel) {
        barrel.element.classList.add('collect-effect');
        
        // 创建粒子效果
        this.createParticleEffect(
            barrel.element.offsetLeft + 30,
            barrel.element.offsetTop + 40
        );
    }
    
    showWordInfoPopup(wordObj, x, y) {
        const popup = document.createElement('div');
        popup.style.position = 'absolute';
        popup.style.left = x + 'px';
        popup.style.top = (y - 60) + 'px';
        popup.style.background = 'rgba(255, 255, 255, 0.95)';
        popup.style.padding = '8px 12px';
        popup.style.borderRadius = '8px';
        popup.style.fontSize = '14px';
        popup.style.fontWeight = 'bold';
        popup.style.color = '#2F4F4F';
        popup.style.textAlign = 'center';
        popup.style.zIndex = '25';
        popup.style.pointerEvents = 'none';
        popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        
        popup.innerHTML = `
            <div style="color: #FFD700; margin-bottom: 4px;">${wordObj.word}</div>
            <div style="font-size: 12px; color: #666;">${wordObj.translation}</div>
            <div style="font-size: 10px; color: #999;">[${wordObj.pronunciation}]</div>
        `;
        
        this.gameContainer.appendChild(popup);
        
        // 动画显示和隐藏
        anime({
            targets: popup,
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutBack',
            complete: () => {
                setTimeout(() => {
                    anime({
                        targets: popup,
                        translateY: [0, -20],
                        opacity: [1, 0],
                        duration: 300,
                        complete: () => popup.remove()
                    });
                }, 2000);
            }
        });
    }
    
    createParticleEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.backgroundColor = '#FFD700';
            particle.style.borderRadius = '50%';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '25';
            
            this.gameContainer.appendChild(particle);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            anime({
                targets: particle,
                left: endX,
                top: endY,
                opacity: [1, 0],
                scale: [1, 0],
                duration: 800,
                easing: 'easeOutQuad',
                complete: () => particle.remove()
            });
        }
    }
    
    showScorePopup(x, y, text) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = text;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        
        this.gameContainer.appendChild(popup);
        
        setTimeout(() => popup.remove(), 1000);
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.score / 50) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.updateLevelDisplay();
            this.gameSpeed = 3 + (this.level - 1) * 0.5;
            
            // 显示关卡提升效果
            this.showLevelUpEffect();
        }
    }
    
    showLevelUpEffect() {
        const levelUpText = document.createElement('div');
        levelUpText.style.position = 'absolute';
        levelUpText.style.top = '50%';
        levelUpText.style.left = '50%';
        levelUpText.style.transform = 'translate(-50%, -50%)';
        levelUpText.style.fontSize = '48px';
        levelUpText.style.fontWeight = 'bold';
        levelUpText.style.color = '#FFD700';
        levelUpText.style.textShadow = '3px 3px 6px rgba(0,0,0,0.7)';
        levelUpText.style.zIndex = '35';
        levelUpText.textContent = `关卡 ${this.level}!`;
        
        this.gameContainer.appendChild(levelUpText);
        
        anime({
            targets: levelUpText,
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0],
            duration: 2000,
            easing: 'easeOutElastic(1, .8)',
            complete: () => levelUpText.remove()
        });
    }
    
    updateScoreDisplay() {
        if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
    }

    updateLevelDisplay() {
        if (this.levelDisplay) this.levelDisplay.textContent = '🏁 关卡 ' + this.level;
    }

    updateLivesDisplay() {
        if (this.livesContainer) this.livesContainer.textContent = '❤️ x' + this.lives;
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // 取消动画和生成循环
        if (this.spawnTimer) clearTimeout(this.spawnTimer);
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        this.spawnTimer = null;
        this.animFrameId = null;

        // 更新游戏结束界面
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        
        // 显示学到的单词
        const wordsList = document.getElementById('wordsList');
        wordsList.innerHTML = '';
        if (this.learnedWords.size > 0) {
            const wordsArray = Array.from(this.learnedWords);
            wordsList.innerHTML = wordsArray.join(', ');
        } else {
            wordsList.innerHTML = '继续加油，下次一定能学到更多单词！';
        }
        
        this.gameOverScreen.classList.remove('hidden');
        this.stopBgm();
        this.hidePauseOverlay();
        this.saveTestedWords();
        
        // 添加游戏结束动画
        anime({
            targets: this.gameOverScreen,
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 800,
            easing: 'easeOutBack'
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    try {
        var game = new WordRacingGame();
        window.carGame = game;

        // 触控按钮
        var touchLeftBtn = document.getElementById('touchLeftBtn');
        var touchRightBtn = document.getElementById('touchRightBtn');
        var bombBtnEl = document.getElementById('bombBtn');
        if (touchLeftBtn) touchLeftBtn.addEventListener('click', function() { game.moveLeft(); });
        if (touchRightBtn) touchRightBtn.addEventListener('click', function() { game.moveRight(); });
        if (bombBtnEl) bombBtnEl.addEventListener('click', function() { game.useBomb(); });

        // 难度选择器
        var diffSelect = document.getElementById('difficultySelect');
        if (diffSelect) {
            diffSelect.addEventListener('change', function() {
                game.setDifficulty(this.value);
            });
        }

        // 单词本选择器
        var bookSelector = document.getElementById('bookSelector');
        if (bookSelector) {
            bookSelector.addEventListener('change', function() {
                game.loadWordData(this.value);
            });
        }
        // 初始化加载默认单词本
        game.loadWordData('grade3a');

        // 新控制按钮
        var pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) pauseBtn.addEventListener('click', function() { game.togglePause(); });
        var musicBtn = document.getElementById('musicBtn');
        if (musicBtn) musicBtn.addEventListener('click', function() { game.toggleBgm(); });
        var restartBtn2 = document.getElementById('restartBtn2');
        if (restartBtn2) restartBtn2.addEventListener('click', function() { game.restartGame(); });

        // 正确撞击回调
        game.onCorrectHit = function(wordObj) {
            var audio = new Audio('assets/audio/correct.mp3');
            audio.play().catch(function() {
                var u = new SpeechSynthesisUtterance('正确！');
                u.lang = 'zh-CN'; u.rate = 1.2; u.pitch = 1.3;
                speechSynthesis.cancel(); speechSynthesis.speak(u);
            });
            if (window.learningAssistant && window.learningAssistant.setProgress) {
                window.learningAssistant.setProgress(game.correctHits * 25);
            }
        };

        // 开始游戏时重置进度
        var origStart = game.startGame.bind(game);
        game.startGame = function() {
            if (window.learningAssistant && window.learningAssistant.resetProgress) {
                window.learningAssistant.resetProgress();
            }
            origStart();
        };
    } catch (error) {
        console.error('创建游戏实例时出错:', error);
    }
});