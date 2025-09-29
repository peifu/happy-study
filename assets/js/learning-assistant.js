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
    }

    // 初始化学习助手
    init() {
        if (!this.assistant || !this.speechBubble) return;
        
        this.updateAssistantUI();
        this.setupAssistantInteraction();
        this.setupStorageListener();
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
                this.showEncouragement();
                
                if (settings.voiceEncouragement !== false) {
                    this.speakEncouragement();
                }
            }
        });
    }

    // 显示鼓励语
    showEncouragement() {
        const randomEncouragement = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        
        this.speechBubble.style.display = 'block';
        this.speechBubble.textContent = randomEncouragement;
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
            // 音频文件不存在或加载失败，使用语音合成
            console.error('音频加载失败:', audioFile);
            this.isPlaying = false;
            this.currentAudio = null;
            this.speakWithSynthesis();
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
            'floatAnimationToggle'
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
            name: document.getElementById('assistantNameInput')?.value || '学习助手' // 保存昵称
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