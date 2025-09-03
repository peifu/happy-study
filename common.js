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
    // 自动同步下拉框
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = theme;
}

// 主题同步（跟随系统）
function syncThemeFromIndex() {
    const theme = localStorage.getItem('theme') || 'dark';
    applyTheme(theme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if ((localStorage.getItem('theme') || 'dark') === 'auto') {
            applyTheme('auto');
        }
    });
}

// 页面切换（通用，需传入navLinks和pages）
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

// 导航事件绑定（通用，需传入navLinks, pages, 可选回调）
function setupNavLinks(navLinks, pages, onPageSwitch) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const pageId = link.getAttribute('data-page');
            switchPageCommon(pageId, navLinks, pages);
            if (typeof onPageSwitch === 'function') onPageSwitch(pageId);
        });
    });
}

// 主页logo跳转
function setupHomeLink(homeLinkId, url = 'index.html') {
    const homeLink = document.getElementById(homeLinkId);
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            window.location.href = url;
        });
    }
}
