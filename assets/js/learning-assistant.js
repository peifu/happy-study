// 学习助手功能模块
class LearningAssistant {
    constructor() {
        this.assistant = document.getElementById('learningAssistant');
        this.speechBubble = document.getElementById('assistantSpeechBubble');
        this.encouragements = [
            '加油，努力，学习要用力！',
            '好好学习，天天向上！',
            '学习真有趣，我们齐努力！',
            '学习让人进步，努力可能更酷！',
            '每天向前一小步，终会长成参天树！'
        ];
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
        const utterance = new SpeechSynthesisUtterance(this.speechBubble.textContent);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.0;
        utterance.pitch = 1.2;
        
        const voices = speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice =>
            voice.lang.includes('zh') || voice.lang.includes('CN') || voice.lang.includes('zh-CN')
        );
        
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }
        
        speechSynthesis.cancel();
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
            floatAnimation: document.getElementById('floatAnimationToggle').checked
        };
        
        this.saveSettings(settings);
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