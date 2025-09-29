// 公共导航功能
function setupNavLinks(navElements, pages) {
    navElements.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 更新活动导航链接
            navElements.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应页面
            const targetPage = this.getAttribute('data-page');
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage + 'Page') {
                    page.classList.add('active');
                }
            });
        });
    });
}

// 切换页面通用函数
function switchPageCommon(pageId, navElements, pages) {
    // 更新活动导航链接
    navElements.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId.replace('Page', '')) {
            link.classList.add('active');
        }
    });
    
    // 显示对应页面
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageId) {
            page.classList.add('active');
        }
    });
}

// 主页链接设置
function setupHomeLink(elementId, homeUrl) {
    document.getElementById(elementId).addEventListener('click', function() {
        window.location.href = homeUrl;
    });
}

// 同步主题
function syncThemeFromIndex() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
}

// 应用主题
function applyTheme(theme) {
    document.body.classList.remove('light-theme');
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else if (theme === 'auto') {
        // 跟随系统
        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light-theme');
        }
    }
}

// 获取保存的主题
function getSavedTheme() {
    return localStorage.getItem('theme');
}