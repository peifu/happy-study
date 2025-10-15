class WordLearningSystem {
    constructor() {
        this.wordDatabase = {
            1: [
                { word: 'CAT', translation: '猫', pronunciation: 'kæt', category: '动物' },
                { word: 'DOG', translation: '狗', pronunciation: 'dɔːg', category: '动物' },
                { word: 'BOOK', translation: '书', pronunciation: 'bʊk', category: '学习用品' },
                { word: 'PEN', translation: '钢笔', pronunciation: 'pen', category: '学习用品' },
                { word: 'BAG', translation: '包', pronunciation: 'bæg', category: '生活用品' },
                { word: 'HAT', translation: '帽子', pronunciation: 'hæt', category: '服装' },
                { word: 'BALL', translation: '球', pronunciation: 'bɔːl', category: '玩具' },
                { word: 'CUP', translation: '杯子', pronunciation: 'kʌp', category: '生活用品' },
                { word: 'BIRD', translation: '鸟', pronunciation: 'bɜːrd', category: '动物' },
                { word: 'FISH', translation: '鱼', pronunciation: 'fɪʃ', category: '动物' }
            ],
            2: [
                { word: 'TREE', translation: '树', pronunciation: 'triː', category: '植物' },
                { word: 'HOUSE', translation: '房子', pronunciation: 'haʊs', category: '建筑' },
                { word: 'CAR', translation: '汽车', pronunciation: 'kɑːr', category: '交通工具' },
                { word: 'BIKE', translation: '自行车', pronunciation: 'baɪk', category: '交通工具' },
                { word: 'GAME', translation: '游戏', pronunciation: 'geɪm', category: '娱乐' },
                { word: 'TOY', translation: '玩具', pronunciation: 'tɔɪ', category: '玩具' },
                { word: 'APPLE', translation: '苹果', pronunciation: 'æpəl', category: '水果' },
                { word: 'BANANA', translation: '香蕉', pronunciation: 'bəˈnænə', category: '水果' },
                { word: 'SCHOOL', translation: '学校', pronunciation: 'skuːl', category: '场所' },
                { word: 'FRIEND', translation: '朋友', pronunciation: 'frend', category: '人物' }
            ],
            3: [
                { word: 'FAMILY', translation: '家庭', pronunciation: 'ˈfæməli', category: '人物' },
                { word: 'WATER', translation: '水', pronunciation: 'ˈwɔːtər', category: '自然' },
                { word: 'FOOD', translation: '食物', pronunciation: 'fuːd', category: '生活' },
                { word: 'MUSIC', translation: '音乐', pronunciation: 'ˈmjuːzɪk', category: '艺术' },
                { word: 'DANCE', translation: '跳舞', pronunciation: 'dæns', category: '活动' },
                { word: 'SMILE', translation: '微笑', pronunciation: 'smaɪl', category: '表情' },
                { word: 'CHAIR', translation: '椅子', pronunciation: 'tʃer', category: '家具' },
                { word: 'TABLE', translation: '桌子', pronunciation: 'ˈteɪbəl', category: '家具' },
                { word: 'DOOR', translation: '门', pronunciation: 'dɔːr', category: '建筑' },
                { word: 'WINDOW', translation: '窗户', pronunciation: 'ˈwɪndoʊ', category: '建筑' }
            ],
            4: [
                { word: 'ANIMAL', translation: '动物', pronunciation: 'ˈænɪməl', category: '生物' },
                { word: 'FLOWER', translation: '花', pronunciation: 'ˈflaʊər', category: '植物' },
                { word: 'GARDEN', translation: '花园', pronunciation: 'ˈɡɑːrdən', category: '场所' },
                { word: 'KITCHEN', translation: '厨房', pronunciation: 'ˈkɪtʃən', category: '房间' },
                { word: 'BEDROOM', translation: '卧室', pronunciation: 'ˈbedruːm', category: '房间' },
                { word: 'BATHROOM', translation: '浴室', pronunciation: 'ˈbæθruːm', category: '房间' },
                { word: 'LIVING', translation: '客厅', pronunciation: 'ˈlɪvɪŋ', category: '房间' },
                { word: 'DINING', translation: '餐厅', pronunciation: 'ˈdaɪnɪŋ', category: '房间' },
                { word: 'ORANGE', translation: '橙子', pronunciation: 'ˈɔːrɪndʒ', category: '水果' },
                { word: 'PURPLE', translation: '紫色', pronunciation: 'ˈpɜːrpəl', category: '颜色' }
            ],
            5: [
                { word: 'COMPUTER', translation: '电脑', pronunciation: 'kəmˈpjuːtər', category: '科技' },
                { word: 'TELEPHONE', translation: '电话', pronunciation: 'ˈtelɪfoʊn', category: '通讯' },
                { word: 'TELEVISION', translation: '电视', pronunciation: 'ˈtelɪvɪʒən', category: '电器' },
                { word: 'REFRIGERATOR', translation: '冰箱', pronunciation: 'rɪˈfrɪdʒəreɪtər', category: '电器' },
                { word: 'MICROWAVE', translation: '微波炉', pronunciation: 'ˈmaɪkroʊweɪv', category: '电器' },
                { word: 'CALCULATOR', translation: '计算器', pronunciation: 'ˈkælkjəleɪtər', category: '工具' },
                { word: 'KEYBOARD', translation: '键盘', pronunciation: 'ˈkiːbɔːrd', category: '电脑配件' },
                { word: 'MOUSE', translation: '鼠标', pronunciation: 'maʊs', category: '电脑配件' },
                { word: 'MONITOR', translation: '显示器', pronunciation: 'ˈmɑːnɪtər', category: '电脑配件' },
                { word: 'PRINTER', translation: '打印机', pronunciation: 'ˈprɪntər', category: '设备' }
            ],
            6: [
                { word: 'BEAUTIFUL', translation: '美丽的', pronunciation: 'ˈbjuːtɪfəl', category: '形容词' },
                { word: 'WONDERFUL', translation: '精彩的', pronunciation: 'ˈwʌndərfəl', category: '形容词' },
                { word: 'EXCELLENT', translation: '优秀的', pronunciation: 'ˈeksələnt', category: '形容词' },
                { word: 'AMAZING', translation: '惊人的', pronunciation: 'əˈmeɪzɪŋ', category: '形容词' },
                { word: 'FANTASTIC', translation: '极好的', pronunciation: 'fænˈtæstɪk', category: '形容词' },
                { word: 'TERRIFIC', translation: '太棒了', pronunciation: 'təˈrɪfɪk', category: '形容词' },
                { word: 'FABULOUS', translation: '极好的', pronunciation: 'ˈfæbjələs', category: '形容词' },
                { word: 'INCREDIBLE', translation: '难以置信的', pronunciation: 'ɪnˈkredəbəl', category: '形容词' },
                { word: 'IMPORTANT', translation: '重要的', pronunciation: 'ɪmˈpɔːrtənt', category: '形容词' },
                { word: 'INTERESTING', translation: '有趣的', pronunciation: 'ˈɪntrəstɪŋ', category: '形容词' }
            ],
            7: [
                { word: 'ADVENTURE', translation: '冒险', pronunciation: 'ədˈventʃər', category: '名词' },
                { word: 'CHALLENGE', translation: '挑战', pronunciation: 'ˈtʃælɪndʒ', category: '名词' },
                { word: 'OPPORTUNITY', translation: '机会', pronunciation: 'ˌɑːpərˈtuːnəti', category: '名词' },
                { word: 'EXPERIENCE', translation: '经验', pronunciation: 'ɪkˈspɪriəns', category: '名词' },
                { word: 'KNOWLEDGE', translation: '知识', pronunciation: 'ˈnɑːlɪdʒ', category: '名词' },
                { word: 'IMAGINATION', translation: '想象力', pronunciation: 'ɪˌmædʒɪˈneɪʃən', category: '名词' },
                { word: 'CREATIVITY', translation: '创造力', pronunciation: 'ˌkriːeɪˈtɪvəti', category: '名词' },
                { word: 'INTELLIGENCE', translation: '智力', pronunciation: 'ɪnˈtelɪdʒəns', category: '名词' },
                { word: 'CONCENTRATION', translation: '专注', pronunciation: 'ˌkɑːnsənˈtreɪʃən', category: '名词' },
                { word: 'DETERMINATION', translation: '决心', pronunciation: 'dɪˌtɜːrmɪˈneɪʃən', category: '名词' }
            ],
            8: [
                { word: 'CONGRATULATION', translation: '祝贺', pronunciation: 'kənˌɡrætʃəˈleɪʃən', category: '表达' },
                { word: 'APPRECIATION', translation: '感激', pronunciation: 'əˌpriːʃiˈeɪʃən', category: '表达' },
                { word: 'ENCOURAGEMENT', translation: '鼓励', pronunciation: 'ɪnˈkɜːrɪdʒmənt', category: '表达' },
                { word: 'INSPIRATION', translation: '灵感', pronunciation: 'ˌɪnspəˈreɪʃən', category: '抽象' },
                { word: 'ACHIEVEMENT', translation: '成就', pronunciation: 'əˈtʃiːvmənt', category: '抽象' },
                { word: 'PROGRESS', translation: '进步', pronunciation: 'ˈprɑːɡres', category: '抽象' },
                { word: 'SUCCESS', translation: '成功', pronunciation: 'səkˈses', category: '抽象' },
                { word: 'VICTORY', translation: '胜利', pronunciation: 'ˈvɪktəri', category: '抽象' },
                { word: 'TRIUMPH', translation: '凯旋', pronunciation: 'ˈtraɪʌmf', category: '抽象' },
                { word: 'CELEBRATION', translation: '庆祝', pronunciation: 'ˌselɪˈbreɪʃən', category: '活动' }
            ]
        };
        
        this.wordTranslations = this.createTranslationMap();
    }
    
    createTranslationMap() {
        const map = new Map();
        Object.values(this.wordDatabase).forEach(levelWords => {
            levelWords.forEach(wordObj => {
                map.set(wordObj.word, wordObj);
            });
        });
        return map;
    }
    
    getRandomWord(level) {
        const words = this.wordDatabase[level] || this.wordDatabase[8];
        return words[Math.floor(Math.random() * words.length)];
    }
    
    getWordInfo(word) {
        return this.wordTranslations.get(word);
    }
    
    getWordsByCategory(level, category) {
        const words = this.wordDatabase[level] || this.wordDatabase[8];
        return words.filter(word => word.category === category);
    }
    
    getAllWords() {
        const allWords = [];
        Object.values(this.wordDatabase).forEach(levelWords => {
            allWords.push(...levelWords);
        });
        return allWords;
    }
    
    searchWords(query) {
        const allWords = this.getAllWords();
        return allWords.filter(wordObj => 
            wordObj.word.toLowerCase().includes(query.toLowerCase()) ||
            wordObj.translation.includes(query) ||
            wordObj.category.includes(query)
        );
    }
    
    getWordsByLevel(level) {
        return this.wordDatabase[level] || [];
    }
    
    getTotalWordCount() {
        return Object.values(this.wordDatabase).reduce((total, levelWords) => total + levelWords.length, 0);
    }
    
    getLevelWordCount(level) {
        return this.wordDatabase[level] ? this.wordDatabase[level].length : 0;
    }
    
    getProgressPercentage(learnedWords) {
        const totalWords = this.getTotalWordCount();
        const learnedCount = learnedWords.size;
        return Math.round((learnedCount / totalWords) * 100);
    }
}

// 单词学习统计类
class LearningStats {
    constructor() {
        this.learnedWords = new Set();
        this.sessionStats = {
            wordsLearned: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            categoriesLearned: new Set(),
            levelsCompleted: new Set()
        };
    }
    
    addLearnedWord(word, level, category) {
        this.learnedWords.add(word);
        this.sessionStats.wordsLearned++;
        this.sessionStats.categoriesLearned.add(category);
        this.sessionStats.levelsCompleted.add(level);
    }
    
    addAttempt(isCorrect) {
        this.sessionStats.totalAttempts++;
        if (isCorrect) {
            this.sessionStats.correctAnswers++;
        }
    }
    
    getAccuracy() {
        if (this.sessionStats.totalAttempts === 0) return 0;
        return Math.round((this.sessionStats.correctAnswers / this.sessionStats.totalAttempts) * 100);
    }
    
    getStatsSummary() {
        return {
            totalWordsLearned: this.learnedWords.size,
            sessionWordsLearned: this.sessionStats.wordsLearned,
            accuracy: this.getAccuracy(),
            categoriesExplored: this.sessionStats.categoriesLearned.size,
            levelsCompleted: this.sessionStats.levelsCompleted.size
        };
    }
    
    resetSessionStats() {
        this.sessionStats = {
            wordsLearned: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            categoriesLearned: new Set(),
            levelsCompleted: new Set()
        };
    }
}

// 发音系统（使用Web Speech API）
class PronunciationSystem {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.loadVoices();
    }
    
    loadVoices() {
        this.voices = this.synth.getVoices();
        // 如果没有立即加载，等待voiceschanged事件
        if (this.voices.length === 0) {
            this.synth.addEventListener('voiceschanged', () => {
                this.voices = this.synth.getVoices();
            });
        }
    }
    
    getEnglishVoice() {
        // 优先选择英文语音
        const englishVoices = this.voices.filter(voice => 
            voice.lang.startsWith('en') || voice.name.includes('English')
        );
        return englishVoices[0] || this.voices[0];
    }
    
    speakWord(word) {
        if (!this.synth) return;
        
        const utterance = new SpeechSynthesisUtterance(word);
        const voice = this.getEnglishVoice();
        
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.rate = 0.8; // 稍慢的速度，便于学习
        utterance.pitch = 1.1; // 稍微提高音调，更适合儿童
        utterance.volume = 0.7;
        
        this.synth.speak(utterance);
    }
    
    stopSpeaking() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}

// 导出系统供主游戏使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WordLearningSystem,
        LearningStats,
        PronunciationSystem
    };
}