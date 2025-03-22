/**
 * 移动设备优化
 * 为PWA和移动设备提供特殊功能和体验优化
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检测设备类型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    // 添加设备特定类到body
    const body = document.body;
    if (isMobile) body.classList.add('mobile-device');
    if (isIOS) body.classList.add('ios-device');
    if (isAndroid) body.classList.add('android-device');
    
    // 侧边栏处理
    setupSidebar();
    
    // 表单输入优化
    optimizeInputs();
    
    // 添加触摸反馈
    addTouchFeedback();
    
    // 缩放图像处理
    setupImageZoom();
    
    // 调整顶部状态栏
    adjustStatusBar();
    
    // 页面切换动画
    setupPageTransitions();
    
    // 检测网络状态
    monitorNetworkStatus();
    
    // 禁用长按菜单
    disableLongPressMenu();
    
    // 添加下拉刷新功能
    setupPullToRefresh();
    
    console.log('移动设备优化已加载');
});

/**
 * 侧边栏优化
 */
function setupSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const menuToggle = document.getElementById('menuToggle');
    
    if (!sidebar || !menuToggle) return;
    
    // 在移动设备上默认隐藏侧边栏
    if (window.innerWidth < 768) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('expanded');
    }
    
    // 添加滑动手势开关侧边栏
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;
        
        // 从左向右滑动，打开侧边栏
        if (swipeDistance > 100 && touchStartX < 50) {
            sidebar.classList.remove('collapsed');
            if (mainContent) mainContent.classList.remove('expanded');
        }
        
        // 从右向左滑动，关闭侧边栏
        if (swipeDistance < -50 && !sidebar.classList.contains('collapsed')) {
            sidebar.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('expanded');
        }
    }
}

/**
 * 输入控件优化
 */
function optimizeInputs() {
    // 优化输入框，聚焦时滚动到可见区域
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // 延迟滚动，等待键盘弹出
            setTimeout(() => {
                const rect = this.getBoundingClientRect();
                const isVisible = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.right <= window.innerWidth
                );
                
                if (!isVisible) {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 300);
        });
        
        // 对数字输入框添加移动优化
        if (input.type === 'number') {
            input.setAttribute('pattern', '[0-9]*');
            input.setAttribute('inputmode', 'numeric');
        }
        
        // 对电话输入框添加移动优化
        if (input.type === 'tel') {
            input.setAttribute('inputmode', 'tel');
        }
    });
}

/**
 * 添加触摸反馈
 */
function addTouchFeedback() {
    const buttons = document.querySelectorAll('button, .btn, [role="button"]');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        ['touchend', 'touchcancel'].forEach(event => {
            button.addEventListener(event, function() {
                this.classList.remove('touch-active');
            });
        });
    });
}

/**
 * 设置图像缩放功能
 */
function setupImageZoom() {
    const images = document.querySelectorAll('.zoomable-image');
    
    images.forEach(img => {
        img.addEventListener('click', function() {
            // 创建覆盖层
            const overlay = document.createElement('div');
            overlay.className = 'image-zoom-overlay';
            
            // 创建缩放图像
            const zoomedImg = new Image();
            zoomedImg.src = this.src;
            zoomedImg.className = 'zoomed-image';
            
            overlay.appendChild(zoomedImg);
            document.body.appendChild(overlay);
            
            // 点击覆盖层关闭
            overlay.addEventListener('click', function() {
                document.body.removeChild(this);
            });
        });
    });
    
    // 添加图像缩放覆盖层样式
    if (images.length > 0 && !document.getElementById('zoom-styles')) {
        const style = document.createElement('style');
        style.id = 'zoom-styles';
        style.textContent = `
            .image-zoom-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .zoomed-image {
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 调整状态栏
 */
function adjustStatusBar() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) {
        // 调整顶部内边距以适应状态栏
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.style.paddingTop = 'env(safe-area-inset-top)';
        }
    }
}

/**
 * 设置页面切换动画
 */
function setupPageTransitions() {
    // 为所有内部链接添加过渡动画
    const internalLinks = document.querySelectorAll('a[href^="/"]:not([target]), a[href^="./"]:not([target]), a[href^="../"]:not([target])');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            
            // 添加退出动画
            document.body.classList.add('page-exit');
            
            // 等待动画完成后导航
            setTimeout(() => {
                window.location.href = target;
            }, 300);
        });
    });
    
    // 页面加载时添加入场动画
    window.addEventListener('pageshow', function() {
        document.body.classList.add('page-enter');
        
        setTimeout(() => {
            document.body.classList.remove('page-enter');
        }, 300);
    });
}

/**
 * 监控网络状态
 */
function monitorNetworkStatus() {
    function updateNetworkStatus() {
        const isOnline = navigator.onLine;
        
        if (!isOnline) {
            showNotification('您当前处于离线状态，部分功能可能不可用', 'warning');
        }
    }
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // 初始检查
    updateNetworkStatus();
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    if (document.getElementById('mobile-notification')) {
        return;
    }
    
    const notification = document.createElement('div');
    notification.id = 'mobile-notification';
    notification.className = `mobile-notification ${type}`;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // 添加动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动消失
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // 点击关闭
    notification.addEventListener('click', function() {
        this.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // 添加通知样式
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .mobile-notification {
                position: fixed;
                top: 20px;
                left: 20px;
                right: 20px;
                padding: 15px;
                border-radius: 8px;
                background-color: #4fbea0;
                color: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                transform: translateY(-100px);
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            
            .mobile-notification.show {
                transform: translateY(0);
                opacity: 1;
            }
            
            .mobile-notification.warning {
                background-color: #f0ad4e;
            }
            
            .mobile-notification.error {
                background-color: #d9534f;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 禁用长按菜单
 */
function disableLongPressMenu() {
    document.addEventListener('contextmenu', function(e) {
        if (e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'TEXTAREA') {
            e.preventDefault();
            return false;
        }
    });
}

/**
 * 设置下拉刷新
 */
function setupPullToRefresh() {
    let touchStartY = 0;
    let touchEndY = 0;
    let isRefreshing = false;
    
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchmove', function(e) {
        if (isRefreshing) return;
        
        touchEndY = e.touches[0].clientY;
        const distance = touchEndY - touchStartY;
        
        // 页面顶部下拉刷新
        if (window.scrollY === 0 && distance > 0) {
            // 显示下拉指示器
            if (!document.getElementById('pull-indicator') && distance > 50) {
                const indicator = document.createElement('div');
                indicator.id = 'pull-indicator';
                indicator.innerHTML = `
                    <div class="pull-spinner"></div>
                    <div>下拉刷新</div>
                `;
                document.body.insertBefore(indicator, document.body.firstChild);
                
                // 添加样式
                if (!document.getElementById('pull-styles')) {
                    const style = document.createElement('style');
                    style.id = 'pull-styles';
                    style.textContent = `
                        #pull-indicator {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            padding: 20px 0;
                            background-color: #4fbea0;
                            color: white;
                            text-align: center;
                            z-index: 999;
                            transform: translateY(-100%);
                            transition: transform 0.3s ease;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        
                        #pull-indicator.visible {
                            transform: translateY(0);
                        }
                        
                        .pull-spinner {
                            width: 30px;
                            height: 30px;
                            border: 3px solid rgba(255, 255, 255, 0.3);
                            border-radius: 50%;
                            border-top-color: white;
                            animation: spin 1s ease-in-out infinite;
                            margin-bottom: 10px;
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
            
            // 更新指示器位置
            const indicator = document.getElementById('pull-indicator');
            if (indicator) {
                if (distance > 100) {
                    indicator.classList.add('visible');
                } else {
                    indicator.classList.remove('visible');
                }
            }
        }
    }, false);
    
    document.addEventListener('touchend', function() {
        const distance = touchEndY - touchStartY;
        
        // 松开时如果拖动足够，触发刷新
        if (window.scrollY === 0 && distance > 100) {
            const indicator = document.getElementById('pull-indicator');
            
            if (indicator) {
                isRefreshing = true;
                
                // 执行刷新
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } else {
            // 不满足刷新条件，移除指示器
            const indicator = document.getElementById('pull-indicator');
            if (indicator) {
                indicator.classList.remove('visible');
                setTimeout(() => {
                    indicator.parentNode.removeChild(indicator);
                }, 300);
            }
        }
    }, false);
} 