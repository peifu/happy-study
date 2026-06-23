// 学习助手功能模块
class LearningAssistant {
    constructor() {
        this.assistant = document.getElementById('learningAssistant');
        this.speechBubble = document.getElementById('assistantSpeechBubble');
        this.assistantName = document.getElementById('assistantName');
        this.encouragements = [
            '加油，努力，学习要用力！',
            '好好学习，天天向上！',
            '学习真有趣，我们齐努力！',
            '学习让人进步，努力可能更酷！',
            '每天向前一小步，终会长成参天树！'
        ];
        this.currentAudio = null; // 当前正在播放的音频
        this.isPlaying = false;   // 是否正在播放音频
        this.celebratePhrases = [
            '太棒了！',
            '继续加油！',
            '好厉害！',
            '你真棒！',
            '满分表现！'
        ];
        this.isCelebrating = false;
        this.isGamePage = false;
    }

    // 初始化学习助手
    init() {
        if (!this.assistant || !this.speechBubble) return;

        // 检测是否为游戏页面
        this.isGamePage = /game/i.test(window.location.pathname);

        this.updateAssistantUI();
        this.restorePosition();
        this.setupAssistantInteraction();
        this.setupDrag();
        this.setupStorageListener();
        this.updateBubblePosition();
        // 窗口大小变化时重新定位气泡
        var self = this;
        window.addEventListener('resize', function() { self.updateBubblePosition(); });
    }

    // 将气泡位置同步到助手当前位置，根据窗口边界自动调整方向
    updateBubblePosition() {
        if (!this.assistant || !this.speechBubble) return;
        var rect = this.assistant.getBoundingClientRect();
        var bubbleW = this.speechBubble.offsetWidth;
        var bubbleH = this.speechBubble.offsetHeight;
        var gap = 12;
        var aW = this.assistant.offsetWidth;
        var aH = this.assistant.offsetHeight;

        var spaceOnLeft = (rect.left - bubbleW - gap) >= 0;
        var spaceAbove = (rect.top - bubbleH - gap) >= 0;

        var left, top, arrow;
        this.speechBubble.style.bottom = 'auto';
        this.speechBubble.style.right = 'auto';
        this.speechBubble.style.transform = 'none';

        if (spaceOnLeft && spaceAbove) {
            // 默认：气泡在助手左侧，顶部对齐 (left-top)
            left = rect.left - bubbleW - gap;
            top = rect.top;
            arrow = 'right';
        } else if (!spaceOnLeft && spaceAbove) {
            // 左侧空间不足：气泡在助手右侧，顶部对齐 (right-top)
            left = rect.left + aW + gap;
            top = rect.top;
            arrow = 'left';
        } else if (spaceOnLeft && !spaceAbove) {
            // 上方空间不足：气泡在助手右侧，底部对齐 (right-bottom)
            left = rect.left + aW + gap;
            top = rect.top + aH - bubbleH;
            arrow = 'left';
        } else {
            // 左侧和上方都不足：右侧底部 (right-bottom)
            left = rect.left + aW + gap;
            top = rect.top + aH - bubbleH;
            arrow = 'left';
        }

        // 限制在窗口内
        left = Math.max(0, Math.min(left, window.innerWidth - bubbleW));
        top = Math.max(0, Math.min(top, window.innerHeight - bubbleH));

        this.speechBubble.style.left = left + 'px';
        this.speechBubble.style.top = top + 'px';
        this.speechBubble.setAttribute('data-arrow', arrow);
    }

    // 恢复保存的位置
    restorePosition() {
        var saved = localStorage.getItem('assistantPosition');
        if (saved) {
            try {
                var pos = JSON.parse(saved);
                this.assistant.style.bottom = 'auto';
                this.assistant.style.right = 'auto';
                this.assistant.style.left = pos.left + 'px';
                this.assistant.style.top = pos.top + 'px';
            } catch (e) {}
        }
    }

    // 保存位置
    savePosition() {
        var rect = this.assistant.getBoundingClientRect();
        localStorage.setItem('assistantPosition', JSON.stringify({
            left: rect.left,
            top: rect.top
        }));
    }

    // 拖拽功能
    setupDrag() {
        var self = this;
        var isDragging = false;
        var hasMoved = false;
        var mouseDown = false;
        var startX, startY, startLeft, startTop;
        var DRAG_THRESHOLD = 3; // 移动超过3px才算拖拽

        function onStart(e) {
            // 检查拖拽是否启用（默认开启）
            if (self.getSettings().dragEnabled === false) return;
            // 只响应主鼠标按钮或单指触摸
            if (e.type === 'mousedown' && e.button !== 0) return;
            // 不在 touchstart 上 preventDefault，否则会阻止 click 事件
            if (e.type !== 'touchstart') {
                e.preventDefault();
            }
            mouseDown = true;
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            var rect = self.assistant.getBoundingClientRect();
            startX = clientX;
            startY = clientY;
            startLeft = rect.left;
            startTop = rect.top;
            hasMoved = false;
        }

        function onMove(e) {
            if (!mouseDown) return;
            if (hasMoved === false && isDragging === false) {
                var clientX = e.touches ? e.touches[0].clientX : e.clientX;
                var clientY = e.touches ? e.touches[0].clientY : e.clientY;
                var dx = clientX - startX;
                var dy = clientY - startY;
                if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;

                // 超过阈值，进入拖拽模式
                hasMoved = true;
                isDragging = true;
                document.body.style.userSelect = 'none';
                document.body.style.webkitUserSelect = 'none';
                self.assistant.style.bottom = 'auto';
                self.assistant.style.right = 'auto';
                self.assistant.style.left = startLeft + 'px';
                self.assistant.style.top = startTop + 'px';
                self.assistant.classList.add('dragging');
            }
            if (!isDragging) return;
            e.preventDefault();
            var clientX = e.touches ? e.touches[0].clientX : e.clientX;
            var clientY = e.touches ? e.touches[0].clientY : e.clientY;
            var dx = clientX - startX;
            var dy = clientY - startY;
            var newLeft = Math.max(0, Math.min(startLeft + dx, window.innerWidth - self.assistant.offsetWidth));
            var newTop = Math.max(0, Math.min(startTop + dy, window.innerHeight - self.assistant.offsetHeight));
            self.assistant.style.left = newLeft + 'px';
            self.assistant.style.top = newTop + 'px';

            // 气泡跟随助手移动
            if (self.speechBubble && self.speechBubble.style.display !== 'none') {
                self.updateBubblePosition();
            }
        }

        function onEnd(e) {
            mouseDown = false;
            if (!isDragging) return;
            isDragging = false;
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            self.assistant.classList.remove('dragging');
            self.savePosition();
        }

        this.assistant.addEventListener('mousedown', onStart);
        this.assistant.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    // 更新助手UI
    updateAssistantUI() {
        const settings = this.getSettings();
        
        if (settings.enabled) {
            this.assistant.style.display = 'block';
            this.assistant.style.width = `${settings.size || 100}px`;
            this.assistant.style.height = `${settings.size || 100}px`;
            this.assistant.style.opacity = `${(settings.opacity || 100) / 100}`;
            
            if (settings.floatAnimation) {
                this.assistant.style.animation = 'float 3s ease-in-out infinite';
            } else {
                this.assistant.style.animation = 'none';
            }

            // 拖拽开关影响光标样式
            this.assistant.style.cursor = (settings.dragEnabled !== false) ? 'grab' : 'pointer';

            // 拖拽关闭时，重置助手到默认位置
            if (settings.dragEnabled === false) {
                this.assistant.style.left = '';
                this.assistant.style.top = '';
                this.assistant.style.bottom = '';
                this.assistant.style.right = '';
                localStorage.removeItem('assistantPosition');
            }

            // 更新助手昵称
            if (this.assistantName) {
                this.assistantName.textContent = settings.name || '学习助手';
            }
            
            this.updateAssistantImage(settings.animal || 'bear');
        } else {
            this.assistant.style.display = 'none';
            this.speechBubble.style.display = 'none';
        }
    }

    // 更新助手图片
    updateAssistantImage(animal) {
        const img = this.assistant.querySelector('.assistant-image');
        if (!img) return;
        
        if (animal === 'bear') {
            img.src = 'assets/logo/bear.png';
            img.alt = '学习助手';
            img.textContent = '';
        } else if (animal === 'cat') {
            img.src = 'assets/logo/cat.png';
            img.alt = '学习助手';
            img.textContent = '';
        } else if (animal === 'peppa') {
            img.src = 'assets/logo/peppa.png';
            img.alt = '学习助手';
            img.textContent = '';
        } else if (animal === 'nezha') {
            img.src = 'assets/logo/nezha.png';
            img.alt = '学习助手';
            img.textContent = '';
        } else if (animal === 'tom') {
            img.src = 'assets/logo/tom.png';
            img.alt = '学习助手';
            img.textContent = '';
        } else if (animal === 'jerry') {
            img.src = 'assets/logo/jerry.png';
            img.alt = '学习助手';
            img.textContent = '';
        } else if (animal === 'shixinxiong') {
            img.src = 'assets/logo/shixinxiong.png';
            img.alt = '学习助手';
            img.textContent = '';
        } else {
            img.src = '';
            img.alt = `${animal}学习助手`;
            img.textContent = animal === 'dog' ? '🐶' : '🐰';
        }
    }

    // 设置点击交互
    setupAssistantInteraction() {
        this.assistant.addEventListener('click', () => {
            const settings = this.getSettings();

            if (settings.clickInteraction !== false) {
                if (this.isGamePage) {
                    this.celebrate();
                } else {
                    this.showEncouragement();

                    if (settings.voiceEncouragement !== false) {
                        this.speakEncouragement();
                    }
                }
            }
        });
    }

    // 显示鼓励语
    showEncouragement() {
        const randomEncouragement = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];

        this.speechBubble.style.display = 'block';
        this.speechBubble.textContent = randomEncouragement;
        this.updateBubblePosition();
        this.speechBubble.classList.add('show');
        
        // 3秒后隐藏语音气泡
        setTimeout(() => {
            this.speechBubble.classList.remove('show');
            setTimeout(() => {
                this.speechBubble.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // 语音鼓励
    speakEncouragement() {
        // 如果已经有音频正在播放，先停止并清理
        if (this.isPlaying && this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.isPlaying = false;
        }
        
        const settings = this.getSettings();
        const animal = settings.animal || 'bear';
        // 获取当前显示的鼓励语在数组中的索引
        const encouragementIndex = this.encouragements.indexOf(this.speechBubble.textContent);
        // 构造音频文件名，格式为 animal-1.mp3, animal-2.mp3 等
        const audioFile = `assets/audio/${animal}-${encouragementIndex + 1}.mp3`;
        
        // 创建新的音频对象
        this.currentAudio = new Audio(audioFile);
        this.isPlaying = true;
        
        // 设置音频播放结束后的清理逻辑
        this.currentAudio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.currentAudio = null;
        });
        
        this.currentAudio.addEventListener('error', () => {
            // 音频文件不存在，尝试使用默认音效
            if (animal !== 'bear') {
                console.warn('音频加载失败，尝试默认音效:', audioFile);
                this.isPlaying = false;
                this.currentAudio = null;
                this.playDefaultAudio(encouragementIndex);
            } else {
                console.error('音频加载失败:', audioFile);
                this.isPlaying = false;
                this.currentAudio = null;
                this.speakWithSynthesis();
            }
        });
        
        this.currentAudio.addEventListener('canplaythrough', () => {
            // 音频文件存在，播放音频
            this.currentAudio.play().catch(error => {
                console.error('音频播放失败:', error);
                this.isPlaying = false;
                this.currentAudio = null;
            });
        });
        
        // 尝试加载音频文件
        this.currentAudio.load();
    }
    
    // 播放默认音效（bear）
    playDefaultAudio(index) {
        const defaultFile = `assets/audio/bear-${index + 1}.mp3`;
        this.currentAudio = new Audio(defaultFile);
        this.isPlaying = true;

        this.currentAudio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.currentAudio = null;
        });

        this.currentAudio.addEventListener('error', () => {
            console.error('默认音频加载失败:', defaultFile);
            this.isPlaying = false;
            this.currentAudio = null;
            this.speakWithSynthesis();
        });

        this.currentAudio.addEventListener('canplaythrough', () => {
            this.currentAudio.play().catch(error => {
                console.error('默认音频播放失败:', error);
                this.isPlaying = false;
                this.currentAudio = null;
            });
        });

        this.currentAudio.load();
    }

    // 使用语音合成
    speakWithSynthesis() {
        // 检查是否已经在播放语音，如果是则取消
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        // 如果音频正在播放，先停止音频
        if (this.isPlaying && this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.isPlaying = false;
        }
        
        const utterance = new SpeechSynthesisUtterance(this.speechBubble.textContent);
        utterance.lang = 'zh-CN';
        
        // 使用index.html中保存的发音设置
        const savedRate = localStorage.getItem('speechRateZh');
        const savedPitch = localStorage.getItem('speechPitchZh');
        const savedVoiceName = localStorage.getItem('selectedVoiceZh');
        
        // 设置发音速度，默认为1.0
        utterance.rate = savedRate ? parseFloat(savedRate) : 1.0;
        
        // 设置发音音调，默认为1.0
        utterance.pitch = savedPitch ? parseFloat(savedPitch) : 1.0;
        
        // 设置发音人
        const voices = speechSynthesis.getVoices();
        if (savedVoiceName) {
            const selectedVoice = voices.find(voice => voice.name === savedVoiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }
        
        // 如果没有选择发音人，使用中文发音人
        if (!utterance.voice) {
            const chineseVoice = voices.find(voice =>
                voice.lang.includes('zh') || voice.lang.includes('CN') || voice.lang.includes('zh-CN')
            );
            if (chineseVoice) {
                utterance.voice = chineseVoice;
            }
        }
        
        speechSynthesis.speak(utterance);
    }

    // 庆祝效果（游戏页面专用）
    celebrate() {
        if (this.isCelebrating) return;
        this.isCelebrating = true;

        // ★ 解决 inline animation 与 CSS class 冲突
        // updateAssistantUI() 在 floatAnimation 开启时设置了 inline style animation，
        // 这会覆盖 .celebrating 类添加的 celebrateJump 动画。此处暂时清除。
        var savedAnimation = this.assistant.style.animation;
        var hadFloatAnimation = !!(savedAnimation && savedAnimation.indexOf('float') !== -1);
        this.assistant.style.animation = '';

        // ① 旋转跳跃动画
        this.assistant.classList.add('celebrating');

        // ② 粒子爆发（延迟50ms，与跳跃同步）
        setTimeout(() => { this.spawnParticles(); }, 50);

        // ③ 气泡庆祝文字
        var phrase = this.celebratePhrases[Math.floor(Math.random() * this.celebratePhrases.length)];
        this.speechBubble.style.display = 'block';
        this.speechBubble.textContent = phrase;
        this.updateBubblePosition();
        this.speechBubble.classList.add('show');

        // ④ 庆祝音效
        this.playCelebrateAudio();

        // 动画结束后清理
        setTimeout(() => {
            this.assistant.classList.remove('celebrating');
            // 还原 float 动画（如果之前有这个设置）
            if (hadFloatAnimation) {
                this.assistant.style.animation = savedAnimation;
            } else {
                this.assistant.style.animation = '';
            }
            this.isCelebrating = false;
        }, 600);

        // 气泡自动隐藏
        setTimeout(() => {
            this.speechBubble.classList.remove('show');
            setTimeout(() => {
                this.speechBubble.style.display = 'none';
            }, 300);
        }, 2000);
    }

    // 粒子庆祝效果
    spawnParticles() {
        var emojis = ['🎉', '⭐', '✨', '🎊', '💫', '🌟'];
        var rect = this.assistant.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var fragment = document.createDocumentFragment();

        for (var i = 0; i < 8; i++) {
            var particle = document.createElement('span');
            particle.className = 'celebrate-particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            // 随机方向偏移：左右 -80~80px，向上 -60~-120px
            var dx = (Math.random() - 0.5) * 160;
            var dy = -(60 + Math.random() * 60);
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            // 随机延迟，错落感
            particle.style.animationDelay = (Math.random() * 0.15) + 's';
            fragment.appendChild(particle);
        }

        document.body.appendChild(fragment);

        // 动画结束后清理 DOM
        setTimeout(() => {
            var particles = document.querySelectorAll('.celebrate-particle');
            for (var p = 0; p < particles.length; p++) {
                particles[p].remove();
            }
        }, 1200);
    }

    // 庆祝音效
    playCelebrateAudio() {
        // 先停止已在播放的音频
        if (this.isPlaying && this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.isPlaying = false;
        }

        var audio = new Audio('assets/audio/celebrate.mp3');

        audio.addEventListener('canplaythrough', () => {
            audio.play().catch(() => {
                this.speakCelebratePhrase();
            });
        });

        audio.addEventListener('error', () => {
            this.speakCelebratePhrase();
        });

        audio.load();
    }

    // 语音合成庆祝短语（音频不可用时的降级）
    speakCelebratePhrase() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        var utterance = new SpeechSynthesisUtterance('太棒了！');
        utterance.lang = 'zh-CN';
        utterance.rate = 1.2;
        utterance.pitch = 1.3;
        speechSynthesis.speak(utterance);
    }

    // 设置存储监听
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'assistantSettings') {
                this.updateAssistantUI();
            }
        });
    }

    // 获取设置
    getSettings() {
        return JSON.parse(localStorage.getItem('assistantSettings') || '{}');
    }

    // 保存设置
    saveSettings(settings) {
        localStorage.setItem('assistantSettings', JSON.stringify(settings));
    }

    // 初始化设置页面
    initSettingsPage() {
        this.loadAssistantSettings();
        this.setupSettingsEventListeners();
    }

    // 加载设置
    loadAssistantSettings() {
        const settings = this.getSettings();

        document.getElementById('assistantToggle').checked = settings.enabled || false;
        document.getElementById('clickInteractionToggle').checked = settings.clickInteraction !== false;
        document.getElementById('voiceEncouragementToggle').checked = settings.voiceEncouragement !== false;
        document.getElementById('alwaysShowToggle').checked = settings.alwaysShow !== false;
        document.getElementById('floatAnimationToggle').checked = settings.floatAnimation !== false;
        document.getElementById('dragEnabledToggle').checked = settings.dragEnabled !== false;
        document.getElementById('assistantSizeSlider').value = settings.size || 100;
        document.getElementById('opacitySlider').value = settings.opacity || 100;
        document.getElementById('encouragementFrequencySlider').value = settings.frequency || 3;
        
        document.getElementById('assistantNameInput').value = settings.name || '学习助手';
        document.getElementById('assistantName').value = settings.name || '学习助手';

        // 更新显示值
        document.getElementById('assistantSizeValue').textContent = `${settings.size || 100}px`;
        document.getElementById('opacityValue').textContent = `${settings.opacity || 100}%`;
        document.getElementById('encouragementFrequencyValue').textContent = settings.frequency || 3;
        
        // 选择动物
        const animal = settings.animal || 'bear';
        document.querySelectorAll('.animal-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.animal === animal) {
                option.classList.add('selected');
            }
        });
    }

    // 设置事件监听
    setupSettingsEventListeners() {
        // 动物选择
        document.querySelectorAll('.animal-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.animal-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                this.saveCurrentSettings();
            });
        });

        // 滑块事件
        const sliders = [
            { id: 'assistantSizeSlider', output: 'assistantSizeValue', format: v => `${v}px` },
            { id: 'opacitySlider', output: 'opacityValue', format: v => `${v}%` },
            { id: 'encouragementFrequencySlider', output: 'encouragementFrequencyValue', format: v => v }
        ];

        sliders.forEach(({ id, output, format }) => {
            const slider = document.getElementById(id);
            const outputElement = document.getElementById(output);
            if (slider && outputElement) {
                slider.addEventListener('input', () => {
                    outputElement.textContent = format(slider.value);
                    this.saveCurrentSettings();
                });
            }
        });

        // 开关事件
        const toggles = [
            'assistantToggle',
            'clickInteractionToggle',
            'voiceEncouragementToggle',
            'alwaysShowToggle',
            'floatAnimationToggle',
            'dragEnabledToggle'
        ];

        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', () => {
                    this.saveCurrentSettings();
                });
            }
        });
        
        // 助手昵称输入事件
        const nameInput = document.getElementById('assistantNameInput');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.saveCurrentSettings();
                
                // 实时更新显示
                if (this.assistantName) {
                    this.assistantName.textContent = nameInput.value || '学习助手';
                }
            });
        }
    }

    // 保存当前设置
    saveCurrentSettings() {
        const settings = {
            enabled: document.getElementById('assistantToggle').checked,
            animal: document.querySelector('.animal-option.selected')?.dataset.animal || 'bear',
            size: parseInt(document.getElementById('assistantSizeSlider').value),
            opacity: parseInt(document.getElementById('opacitySlider').value),
            frequency: parseInt(document.getElementById('encouragementFrequencySlider').value),
            clickInteraction: document.getElementById('clickInteractionToggle').checked,
            voiceEncouragement: document.getElementById('voiceEncouragementToggle').checked,
            alwaysShow: document.getElementById('alwaysShowToggle').checked,
            floatAnimation: document.getElementById('floatAnimationToggle').checked,
            dragEnabled: document.getElementById('dragEnabledToggle').checked,
            name: document.getElementById('assistantNameInput')?.value || '学习助手'
        };
        
        this.saveSettings(settings);
        this.updateAssistantUI();
    }
}

// 全局实例
window.learningAssistant = new LearningAssistant();

// 初始化函数
function initGlobalAssistant() {
    window.learningAssistant.init();
}

// 初始化设置页面
function initAssistantSettings() {
    window.learningAssistant.initSettingsPage();
}

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是设置页面
    if (document.getElementById('assistantPage')) {
        initAssistantSettings();
    }
    
    // 初始化全局助手
    initGlobalAssistant();
});
