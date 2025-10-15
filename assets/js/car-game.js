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
        this.gameSpeed = 3;
        this.backgroundY = 0;
        
        this.obstacles = [];
        this.wordBarrels = [];
        this.learnedWords = new Set();
        this.consecutiveCollections = 0;
        this.perfectLevelBonus = 0;
        
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
        if (this.currentLane > 0 && this.gameRunning) {
            this.currentLane--;
            this.positionPlayerCar();
            this.addMoveEffect();
        }
    }
    
    moveRight() {
        if (this.currentLane < 5 && this.gameRunning) {
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
            this.startScreen.classList.add('hidden');
            this.gameRunning = true;
            this.gameLoop();
            this.spawnLoop();
            console.log('游戏启动成功');
        } catch (error) {
            console.error('游戏启动失败:', error);
        }
    }
    
    restartGame() {
        // 清理游戏状态
        this.obstacles.forEach(obs => obs.element.remove());
        this.wordBarrels.forEach(barrel => barrel.element.remove());
        
        // 重置游戏数据
        this.score = 0;
        this.level = 1;
        this.lives = 5;
        this.currentLane = 2;
        this.gameSpeed = 3;
        this.obstacles = [];
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
        
        // 移除键盘连续移动逻辑，改为单次按键单次移动
        // 更新游戏元素
        this.updateBackground();
        this.updateObstacles();
        this.updateWordBarrels();
        this.checkCollisions();
        this.checkLevelUp();
        
        // 继续游戏循环
        requestAnimationFrame(() => this.gameLoop());
    }
    
    spawnLoop() {
        if (!this.gameRunning) return;
        
        // 随机生成障碍物或单词油箱
        if (Math.random() < 0.6) {
            this.spawnObstacle();
        } else {
            this.spawnWordBarrel();
        }
        
        // 根据关卡调整生成频率
        const spawnDelay = Math.max(800, 2000 - (this.level * 100));
        setTimeout(() => this.spawnLoop(), spawnDelay);
    }
    
    spawnObstacle() {
        const lane = Math.floor(Math.random() * 6);
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.backgroundImage = `url('assets/resources/road-barrier.png')`;
        
        const laneCenterX = (lane + 0.5) * this.laneWidth - 40;
        obstacle.style.left = laneCenterX + 'px';
        obstacle.style.top = '-120px';
        
        this.gameContainer.appendChild(obstacle);
        
        this.obstacles.push({
            element: obstacle,
            lane: lane,
            y: -120,
            speed: this.gameSpeed + Math.random() * 2
        });
    }
    
    spawnWordBarrel() {
        const lane = Math.floor(Math.random() * 6);
        const wordObj = this.wordSystem.getRandomWord(this.level);
        
        const barrel = document.createElement('div');
        barrel.className = 'word-barrel';
        barrel.textContent = wordObj.word;
        barrel.title = `${wordObj.translation} [${wordObj.pronunciation}]`;
        barrel.style.cursor = 'pointer';
        
        // 添加点击发音功能
        barrel.addEventListener('click', () => {
            this.pronunciationSystem.speakWord(wordObj.word);
        });
        
        const laneCenterX = (lane + 0.5) * this.laneWidth - 30;
        barrel.style.left = laneCenterX + 'px';
        barrel.style.top = '-80px';
        
        this.gameContainer.appendChild(barrel);
        
        this.wordBarrels.push({
            element: barrel,
            lane: lane,
            y: -80,
            word: wordObj.word,
            wordObj: wordObj,
            speed: this.gameSpeed + Math.random() * 1.5
        });
    }
    
    updateObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y += obstacle.speed;
            obstacle.element.style.top = obstacle.y + 'px';
            
            // 移除超出屏幕的障碍物
            if (obstacle.y > this.gameHeight) {
                obstacle.element.remove();
                return false;
            }
            return true;
        });
    }
    
    updateWordBarrels() {
        this.wordBarrels = this.wordBarrels.filter(barrel => {
            barrel.y += barrel.speed;
            barrel.element.style.top = barrel.y + 'px';
            
            // 移除超出屏幕的单词油箱
            if (barrel.y > this.gameHeight) {
                barrel.element.remove();
                return false;
            }
            return true;
        });
    }
    
    checkCollisions() {
        const playerRect = {
            x: this.currentLane * this.laneWidth,
            y: this.playerY,
            width: 80,
            height: 120
        };
        
        // 检查与障碍物的碰撞
        this.obstacles.forEach((obstacle, index) => {
            const obstacleRect = {
                x: obstacle.lane * this.laneWidth,
                y: obstacle.y,
                width: 80,
                height: 120
            };
            
            if (this.isColliding(playerRect, obstacleRect)) {
                this.handleCollision(obstacle, index);
            }
        });
        
        // 检查与单词油箱的碰撞
        this.wordBarrels.forEach((barrel, index) => {
            const barrelRect = {
                x: barrel.lane * this.laneWidth,
                y: barrel.y,
                width: 60,
                height: 80
            };
            
            if (this.isColliding(playerRect, barrelRect)) {
                this.handleWordCollection(barrel, index);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    handleCollision(obstacle, index) {
        // 移除障碍物
        obstacle.element.remove();
        this.obstacles.splice(index, 1);
        
        // 减少生命值
        this.lives--;
        this.updateLivesDisplay();
        
        // 重置连续收集
        this.consecutiveCollections = 0;
        this.perfectLevelBonus = 0;
        
        // 记录失败尝试
        this.learningStats.addAttempt(false);
        
        // 添加碰撞效果
        this.addCollisionEffect();
        
        // 检查游戏结束
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    handleWordCollection(barrel, index) {
        // 移除单词油箱
        barrel.element.remove();
        this.wordBarrels.splice(index, 1);
        
        // 增加基础分数
        let points = 10;
        
        // 连续收集奖励
        this.consecutiveCollections++;
        if (this.consecutiveCollections >= 3) {
            points += 5;
            this.showScorePopup(barrel.element.offsetLeft, barrel.element.offsetTop, '连击 +5');
        }
        
        // 完美关卡奖励（如果一关内没有碰撞）
        this.perfectLevelBonus++;
        
        // 更新分数
        this.score += points;
        this.updateScoreDisplay();
        
        // 记录学到的单词和统计
        this.learnedWords.add(barrel.word);
        this.learningStats.addLearnedWord(barrel.word, this.level, barrel.wordObj.category);
        this.learningStats.addAttempt(true);
        
        // 播放单词发音
        this.pronunciationSystem.speakWord(barrel.word);
        
        // 添加收集效果
        this.addCollectionEffect(barrel);
        
        // 显示分数弹出
        this.showScorePopup(barrel.element.offsetLeft, barrel.element.offsetTop, `+${points}`);
        
        // 显示单词信息
        this.showWordInfoPopup(barrel.wordObj, barrel.element.offsetLeft, barrel.element.offsetTop);
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
        this.scoreDisplay.textContent = this.score;
    }
    
    updateLevelDisplay() {
        this.levelDisplay.textContent = `关卡 ${this.level}`;
    }
    
    updateLivesDisplay() {
        this.livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart-icon';
            this.livesContainer.appendChild(heart);
        }
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded事件触发，准备初始化游戏');
    try {
        const game = new WordRacingGame();
        console.log('游戏实例创建成功:', game);
        
        // 测试开始按钮是否存在并可点击
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            console.log('开始按钮存在，类型:', startBtn.tagName);
            console.log('开始按钮类名:', startBtn.className);
            console.log('开始按钮文本:', startBtn.textContent);
            
            // 手动测试点击事件
            startBtn.addEventListener('click', () => {
                console.log('开始按钮点击测试 - 事件正常触发');
            });
        } else {
            console.error('开始按钮不存在！');
        }
    } catch (error) {
        console.error('创建游戏实例时出错:', error);
    }
});