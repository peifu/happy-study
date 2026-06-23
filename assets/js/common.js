// 主题切换
function applyTheme(theme) {
    document.body.classList.remove('light-theme');
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else if (theme === 'auto') {
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light-theme');
        }
    }
    localStorage.setItem('theme', theme);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = theme;
}

function syncThemeFromIndex() {
    const theme = localStorage.getItem('theme') || 'dark';
    applyTheme(theme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if ((localStorage.getItem('theme') || 'dark') === 'auto') {
            applyTheme('auto');
        }
    });
}

function getSavedTheme() {
    return localStorage.getItem('theme');
}

// 页面切换（通用）
function switchPageCommon(pageId, navLinks, pages) {
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    pages.forEach(page => {
        if (page.id === pageId + 'Page') {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

function setupNavLinks(navLinks, pages, onPageSwitch) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pageId = link.getAttribute('data-page');
            switchPageCommon(pageId, navLinks, pages);
            if (typeof onPageSwitch === 'function') onPageSwitch(pageId);
        });
    });
}

function setupHomeLink(homeLinkId, url) {
    const homeLink = document.getElementById(homeLinkId);
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            window.location.href = url || 'index.html';
        });
    }
}

// 学习助手初始化
function initLearningAssistant() {
    const assistantEnabled = localStorage.getItem('assistantEnabled') !== 'false';
    if (typeof LearningAssistant !== 'undefined' && assistantEnabled) {
        window.learningAssistant = new LearningAssistant();
        window.learningAssistant.init();
    }
}

// HTML模板注入
function injectNav(navItems) {
    const container = document.querySelector('.container');
    if (!container) return;
    const html = '<div class="nav-container">' +
        '<div class="logo" id="homeLink">' +
        '<i class="fas fa-brain"></i>' +
        '<span>快乐学习</span>' +
        '</div>' +
        '<div class="nav-links">' +
        navItems.map(item =>
            '<div class="nav-link' + (item.active ? ' active' : '') + '" data-page="' + item.page + '">' +
            '<i class="fas ' + item.icon + '"></i>' +
            '<span>' + item.label + '</span>' +
            '</div>'
        ).join('') +
        '</div>' +
        '</div>';
    container.insertAdjacentHTML('afterbegin', html);
}

function injectFooter() {
    const container = document.querySelector('.container');
    if (!container) return;
    const html = '<footer><p>(c) 2025 快乐学习 - Sevenking Studio</p></footer>';
    container.insertAdjacentHTML('beforeend', html);
}

function injectAssistant() {
    const html = '<div class="learning-assistant" id="learningAssistant">' +
        '<img src="assets/logo/bear.png" alt="学习助手" class="assistant-image">' +
        '<svg class="assistant-progress-ring" id="assistantProgressRing" viewBox="0 0 100 100">' +
            '<defs>' +
                '<linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#00e5ff" />' +
                    '<stop offset="50%" stop-color="#7c4dff" />' +
                    '<stop offset="100%" stop-color="#ff4081" />' +
                '</linearGradient>' +
            '</defs>' +
            '<circle class="progress-ring-bg" cx="50" cy="50" r="44" />' +
            '<circle class="progress-ring-fill" id="progressRingFill" cx="50" cy="50" r="44" />' +
        '</svg>' +
        '<div class="assistant-name" id="assistantName">学习助手</div>' +
        '</div>' +
        '<div class="assistant-speech-bubble" id="assistantSpeechBubble">加油，你是最棒的！</div>';
    document.body.insertAdjacentHTML('beforeend', html);
}
