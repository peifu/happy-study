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
        this.gameHeight = 675;
        this.laneWidth = this.gameWidth / 6;
        this.currentLane = 2; // 0-5 lanes
        this.playerY = this.gameHeight - 150;
        
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.gameRunning = false;
        this.backgroundY = 0;
        this.difficulty = 'normal'; // easy/normal/hard
        this.speedMap = { easy: 1.8, normal: 2.5, hard: 3.2 };
        this.fallSpeed = this.speedMap.normal;

        this.wordItems = [];
        this.wordBarrels = [];
        this.learnedWords = new Set();
        this.consecutiveCollections = 0;
        this.perfectLevelBonus = 0;
        this.currentTargetWord = null;
        this.correctHits = 0;
        this.chineseHint = document.getElementById('chineseHint');
        this.onCorrectHit = null;
        
        // 键盘状态控制
        this.keys = {
            left: false,
            right: false,
            leftPressed: false,
            rightPressed: false
        };
        
        // 初始化单词学习系统
        this.wordSystem = new WordLearningSystem();
        this.learningStats = new LearningStats();
        this.pronunciationSystem = new PronunciationSystem();
        
        this.init();
    }
    
    init() {
        console.log('游戏初始化开始');
        try {
            this.setupEventListeners();
            this.positionPlayerCar();
            this.updateLivesDisplay();
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
            // 清理旧物品
            this.wordItems.forEach(function(item) { item.element.remove(); });
            this.wordItems = [];
            this.correctHits = 0;

            this.startScreen.classList.add('hidden');
            this.gameRunning = true;
            this.currentLane = 2; // 固定在中间车道
            this.positionPlayerCar();
            this.pickNewTarget(); // 立即显示第一条中文提示
            this.gameLoop();
            this.spawnLoop();
            console.log('游戏启动成功');
        } catch (error) {
            console.error('游戏启动失败:', error);
        }
    }
    
    restartGame() {
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
        this.wordItems = [];
        this.wordBarrels = [];
        this.learnedWords.clear();
        
        // 更新显示
        this.updateScoreDisplay();
        this.updateLevelDisplay();
        this.updateLivesDisplay();
        this.positionPlayerCar();
        
        // 隐藏游戏结束界面
        this.gameOverScreen.classList.add('hidden');
        
        // 重新开始游戏
        this.gameRunning = true;
        this.gameLoop();
        this.spawnLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.updateBackground();
        this.updateWordItems();
        this.checkCollisions();
        this.checkLevelUp();
        
        // 继续游戏循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    spawnLoop() {
        if (!this.gameRunning) return;
        this.pickNewTarget();
        this.spawnWordWave();
        const spawnDelay = 4000;
        setTimeout(() => this.spawnLoop(), spawnDelay);
    }

    pickNewTarget() {
        this.currentTargetWord = this.wordSystem.getRandomWord(this.level);
        if (this.chineseHint && this.currentTargetWord) {
            this.chineseHint.textContent = this.currentTargetWord.translation || this.currentTargetWord.word;
        }
        this.wordItems = [];
    }

    getFreeLane(usedInWave) {
        var occupied = usedInWave || {};
        this.wordItems.forEach(function(item) { if (item.y < this.playerY - 50) occupied[item.lane] = true; }, this);
        var freeLanes = [];
        for (var l = 1; l <= 4; l++) { if (!occupied[l]) freeLanes.push(l); }
        if (freeLanes.length === 0) return 1 + Math.floor(Math.random() * 4);
        return freeLanes[Math.floor(Math.random() * freeLanes.length)];
    }

    spawnWordWave() {
        var usedInWave = {};
        // 1个正确单词
        var lane = this.getFreeLane(usedInWave); usedInWave[lane] = true;
        this.spawnWordItem(this.currentTargetWord, true, lane);
        // 3-4个错误单词
        var wrongCount = 3 + Math.floor(Math.random() * 2);
        for (var i = 0; i < wrongCount; i++) {
            lane = this.getFreeLane(usedInWave); usedInWave[lane] = true;
            var wrongWord = this.wordSystem.getRandomWord(this.level);
            var tries = 0;
            while (wrongWord.word === this.currentTargetWord.word && tries < 20) {
                wrongWord = this.wordSystem.getRandomWord(this.level);
                tries++;
            }
            this.spawnWordItem(wrongWord, false, lane);
        }
    }

    updateBombBtn() {
        var bombBtn = document.getElementById('bombBtn');
        if (!bombBtn) return;
        if (this.bombAvailable && !this.bombCooldown) {
            bombBtn.classList.add('active');
        } else {
            bombBtn.classList.remove('active');
        }
    }

    spawnWordItem(wordObj, isCorrect, optLane) {
        var lane = optLane !== undefined ? optLane : this.getFreeLane();
        var el = document.createElement('div');
        el.className = 'word-barrel';
        el.textContent = wordObj.word;
        el.dataset.correct = isCorrect ? '1' : '0';
        var x = (lane + 0.5) * this.laneWidth - 65;
        el.style.left = x + 'px';
        el.style.top = '-80px';
        this.gameContainer.appendChild(el);
        this.wordItems.push({
            element: el, lane: lane, y: -80,
            wordObj: wordObj, isCorrect: isCorrect,
            speed: this.fallSpeed
        });
    }

    updateWordItems() {
        this.wordItems = this.wordItems.filter(function(item) {
            item.y += item.speed;
            item.element.style.top = item.y + 'px';
            if (item.y > this.playerY + 20) {
                item.element.remove();
                return false;
            }
            return true;
        }, this);
    }
    
    checkCollisions() {
        const playerRect = {
            x: this.currentLane * this.laneWidth,
            y: this.playerY,
            width: 80,
            height: 120
        };
        
        // 单词碰撞
        this.wordItems.forEach(function(item, index) {
            var itemRect = { x: item.lane * this.laneWidth, y: item.y, width: 130, height: 130 };
            if (this.isColliding(playerRect, itemRect)) {
                if (item.isCorrect) {
                    this.handleCorrectHit(item, index);
                } else {
                    this.handleWrongHit(item, index);
                }
            }
        }, this);
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    handleCorrectHit(item, index) {
        item.element.remove();
        this.wordItems.splice(index, 1);
        this.score += 20;
        this.correctHits++;
        this.updateScoreDisplay();
        this.addCollectionEffect(item);
        this.showScorePopup(item.element.offsetLeft, item.element.offsetTop, '+20');
        if (this.onCorrectHit) this.onCorrectHit(item.wordObj);
    }

    handleWrongHit(item, index) {
        item.element.remove();
        this.wordItems.splice(index, 1);
        this.lives--;
        this.updateLivesDisplay();
        this.addCollisionEffect();
        if (this.lives <= 0) this.gameOver();
    }

    setDifficulty(level) {
        if (!this.speedMap[level]) return;
        this.difficulty = level;
        this.fallSpeed = this.speedMap[level];
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
        if (touchLeftBtn) touchLeftBtn.addEventListener('click', function() { game.moveLeft(); });
        if (touchRightBtn) touchRightBtn.addEventListener('click', function() { game.moveRight(); });

        // 难度选择器
        var diffSelect = document.getElementById('difficultySelect');
        if (diffSelect) {
            diffSelect.addEventListener('change', function() {
                game.setDifficulty(this.value);
            });
        }

        // 正确撞击回调
        game.onCorrectHit = function(wordObj) {
            var audio = new Audio('assets/audio/correct.mp3');
            audio.play().catch(function() {
                var u = new SpeechSynthesisUtterance('正确！');
                u.lang = 'zh-CN'; u.rate = 1.2; u.pitch = 1.3;
                speechSynthesis.cancel(); speechSynthesis.speak(u);
            });
            if (window.learningAssistant && window.learningAssistant.setProgress) {
                window.learningAssistant.setProgress(game.correctHits * 20);
            }
            if (game.correctHits >= 5) {
                game.correctHits = 0;
                if (window.learningAssistant) window.learningAssistant.resetProgress();
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