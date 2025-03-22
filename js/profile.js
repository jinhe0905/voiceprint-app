/**
 * 个人资料页面JavaScript
 * 智能车门解锁系统
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面元素
    initializePage();
    
    // 设置交互事件
    setupEventListeners();
    
    // 初始化波形图
    initializeWaveforms();
});

/**
 * 初始化页面元素
 */
function initializePage() {
    // 侧边栏切换
    const menuToggle = document.getElementById('menuToggle');
    const appContainer = document.querySelector('.app-container');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }
    
    // 检查移动设备
    checkMobileDevice();
    
    // 检查通知
    updateNotificationBadge();
}

/**
 * 设置交互事件
 */
function setupEventListeners() {
    // 编辑个人资料按钮
    const editProfileBtn = document.querySelector('.profile-actions .btn-primary');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            showEditProfileModal();
        });
    }
    
    // 个人信息编辑按钮
    const sectionEditBtn = document.querySelector('.section-edit-btn');
    if (sectionEditBtn) {
        sectionEditBtn.addEventListener('click', function() {
            showEditInfoModal();
        });
    }
    
    // 录制新模板按钮
    const recordTemplateBtn = document.querySelector('.template-actions .btn-primary');
    if (recordTemplateBtn) {
        recordTemplateBtn.addEventListener('click', function() {
            showRecordTemplateModal();
        });
    }
    
    // 更新模板按钮
    const updateTemplateBtn = document.querySelector('.template-actions .btn-ghost');
    if (updateTemplateBtn) {
        updateTemplateBtn.addEventListener('click', function() {
            updateTemplates();
        });
    }
    
    // 模板播放按钮
    const playButtons = document.querySelectorAll('.template-actions .btn-icon:first-child');
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const templateItem = this.closest('.template-item');
            playTemplate(templateItem);
        });
    });
    
    // 模板删除按钮
    const deleteButtons = document.querySelectorAll('.template-actions .btn-icon:last-child');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const templateItem = this.closest('.template-item');
            showDeleteConfirmation(templateItem);
        });
    });
    
    // 安全设置按钮
    const securityButtons = document.querySelectorAll('.security-action .btn');
    securityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const securityItem = this.closest('.security-item');
            const securityTitle = securityItem.querySelector('.security-details h4').textContent;
            showSecurityModal(securityTitle);
        });
    });
    
    // 安全设置开关
    const securitySwitches = document.querySelectorAll('.security-action .switch input');
    securitySwitches.forEach(switchInput => {
        switchInput.addEventListener('change', function() {
            const securityItem = this.closest('.security-item');
            const securityTitle = securityItem.querySelector('.security-details h4').textContent;
            toggleSecuritySetting(securityTitle, this.checked);
        });
    });
    
    // 更换头像按钮
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            showAvatarModal();
        });
    }
}

/**
 * 初始化波形图
 */
function initializeWaveforms() {
    const waveforms = document.querySelectorAll('.waveform-visual');
    
    // 为每个波形创建随机波形图案
    waveforms.forEach(waveform => {
        // 在实际应用中，这里应该加载真实的波形数据
        // 这里仅作演示，创建随机效果
        animateWaveform(waveform);
    });
}

/**
 * 为波形元素创建动画效果
 */
function animateWaveform(waveformElement) {
    // 此处仅为演示效果
    // 实际应用中应当使用Web Audio API进行可视化
    
    // 创建随机波形数据
    const data = [];
    for (let i = 0; i < 100; i++) {
        data.push(Math.random() * 0.5 + 0.25); // 25%-75%高度
    }
    
    // 动画计数器
    let animationFrame;
    let counter = 0;
    
    // 波形动画函数
    function animate() {
        counter += 0.02;
        
        // 移动波形数据
        const shiftedData = [...data];
        for (let i = 0; i < shiftedData.length; i++) {
            shiftedData[i] = data[(i + Math.floor(counter * 10)) % data.length];
        }
        
        // 更新波形样式
        const backgroundPositions = [];
        for (let i = 0; i < 20; i++) {
            const position = i * 5;
            const height = shiftedData[i] * 100;
            backgroundPositions.push(`rgba(108, 99, 255, ${shiftedData[i]}) ${position}px ${50 - height/2}% / 2px ${height}% no-repeat`);
        }
        
        // 应用波形样式
        waveformElement.style.boxShadow = backgroundPositions.join(', ');
        
        // 循环动画
        animationFrame = requestAnimationFrame(animate);
    }
    
    // 启动动画
    animate();
    
    // 存储animationFrame以便清理
    waveformElement.dataset.animationFrame = animationFrame;
}

/**
 * 显示编辑资料模态框
 */
function showEditProfileModal() {
    // 模拟显示模态框
    showNotification('编辑资料功能即将上线', 'info');
}

/**
 * 显示编辑个人信息模态框
 */
function showEditInfoModal() {
    // 模拟显示模态框
    showNotification('编辑个人信息功能即将上线', 'info');
}

/**
 * 显示录制模板模态框
 */
function showRecordTemplateModal() {
    // 模拟显示模态框
    showNotification('录制新声纹模板功能即将上线', 'info');
}

/**
 * 更新声纹模板
 */
function updateTemplates() {
    // 模拟更新过程
    showNotification('正在更新声纹模板...', 'info');
    
    // 模拟加载延迟
    setTimeout(() => {
        // 更新模板质量评估
        updateTemplateQuality();
        
        // 显示成功通知
        showNotification('声纹模板更新成功', 'success');
    }, 2000);
}

/**
 * 更新模板质量评估
 */
function updateTemplateQuality() {
    // 获取评估指标元素
    const uniquenessBar = document.querySelector('.metric:nth-child(1) .metric-value');
    const uniquenessNumber = document.querySelector('.metric:nth-child(1) .metric-number');
    const stabilityBar = document.querySelector('.metric:nth-child(2) .metric-value');
    const stabilityNumber = document.querySelector('.metric:nth-child(2) .metric-number');
    const clarityBar = document.querySelector('.metric:nth-child(3) .metric-value');
    const clarityNumber = document.querySelector('.metric:nth-child(3) .metric-number');
    
    // 生成新的随机值
    const uniqueness = Math.floor(Math.random() * 10) + 90; // 90-99
    const stability = Math.floor(Math.random() * 10) + 85; // 85-94
    const clarity = Math.floor(Math.random() * 10) + 88; // 88-97
    
    // 更新UI
    if (uniquenessBar && uniquenessNumber) {
        uniquenessBar.style.width = `${uniqueness}%`;
        uniquenessNumber.textContent = `${uniqueness}%`;
    }
    
    if (stabilityBar && stabilityNumber) {
        stabilityBar.style.width = `${stability}%`;
        stabilityNumber.textContent = `${stability}%`;
    }
    
    if (clarityBar && clarityNumber) {
        clarityBar.style.width = `${clarity}%`;
        clarityNumber.textContent = `${clarity}%`;
    }
    
    // 更新总体评分
    const overallQuality = Math.floor((uniqueness + stability + clarity) / 3);
    const qualityValue = document.querySelector('.stat-item:nth-child(2) .stat-value');
    if (qualityValue) {
        qualityValue.textContent = `${overallQuality}%`;
    }
    
    // 更新最后更新时间
    const lastUpdate = document.querySelector('.stat-item:nth-child(3) .stat-value');
    if (lastUpdate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        lastUpdate.textContent = `${year}-${month}-${day}`;
    }
}

/**
 * 播放声纹模板
 */
function playTemplate(templateItem) {
    if (!templateItem) return;
    
    // 获取模板名称
    const templateName = templateItem.querySelector('.template-title span').textContent;
    
    // 获取波形元素
    const waveformVisual = templateItem.querySelector('.waveform-visual');
    
    // 添加播放状态类
    templateItem.classList.add('playing');
    
    // 显示通知
    showNotification(`正在播放: ${templateName}`, 'info');
    
    // 在实际应用中，这里应该播放实际的声纹音频
    // 这里仅作演示，增强波形动画效果
    
    // 增强波形动画
    if (waveformVisual) {
        // 取消当前动画
        if (waveformVisual.dataset.animationFrame) {
            cancelAnimationFrame(parseInt(waveformVisual.dataset.animationFrame));
        }
        
        // 使用更生动的波形
        waveformVisual.style.backgroundColor = 'rgba(108, 99, 255, 0.1)';
        animateWaveform(waveformVisual);
        
        // 5秒后恢复
        setTimeout(() => {
            templateItem.classList.remove('playing');
            waveformVisual.style.backgroundColor = 'rgba(108, 99, 255, 0.05)';
            showNotification(`播放完成: ${templateName}`, 'success');
        }, 5000);
    }
}

/**
 * 显示删除确认
 */
function showDeleteConfirmation(templateItem) {
    if (!templateItem) return;
    
    // 获取模板名称
    const templateName = templateItem.querySelector('.template-title span').textContent;
    
    // 在真实应用中，这里应该显示一个确认对话框
    // 这里仅作演示，直接显示通知
    
    if (confirm(`确定要删除"${templateName}"吗？此操作无法撤销。`)) {
        deleteTemplate(templateItem);
    }
}

/**
 * 删除声纹模板
 */
function deleteTemplate(templateItem) {
    if (!templateItem) return;
    
    // 获取模板名称
    const templateName = templateItem.querySelector('.template-title span').textContent;
    
    // 添加删除动画
    templateItem.classList.add('deleting');
    
    // 显示通知
    showNotification(`正在删除: ${templateName}`, 'info');
    
    // 模拟删除过程
    setTimeout(() => {
        // 从DOM中移除
        templateItem.remove();
        
        // 更新计数
        updateTemplateCount();
        
        // 显示成功通知
        showNotification(`已删除: ${templateName}`, 'success');
    }, 1000);
}

/**
 * 更新模板计数
 */
function updateTemplateCount() {
    const templateItems = document.querySelectorAll('.template-item');
    const countElement = document.querySelector('.stat-item:first-child .stat-value');
    
    if (countElement) {
        countElement.textContent = templateItems.length;
    }
}

/**
 * 切换安全设置
 */
function toggleSecuritySetting(settingName, enabled) {
    // 显示通知
    const status = enabled ? '已启用' : '已停用';
    showNotification(`${settingName} ${status}`, enabled ? 'success' : 'warning');
}

/**
 * 显示安全设置模态框
 */
function showSecurityModal(settingName) {
    // 模拟显示模态框
    showNotification(`${settingName}设置页面即将上线`, 'info');
}

/**
 * 显示更换头像模态框
 */
function showAvatarModal() {
    // 模拟显示模态框
    showNotification('更换头像功能即将上线', 'info');
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // 根据类型设置图标
    let icon;
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
        case 'error':
            icon = 'x-circle';
            break;
        default:
            icon = 'info-circle';
    }
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="bi bi-${icon}"></i>
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加关闭按钮事件
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.classList.add('hiding');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭（3秒后）
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

/**
 * 检查移动设备
 */
function checkMobileDevice() {
    const isMobile = window.innerWidth <= 768;
    const appContainer = document.querySelector('.app-container');
    
    if (isMobile && appContainer) {
        appContainer.classList.add('sidebar-collapsed');
    }
    
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && appContainer) {
            appContainer.classList.add('sidebar-collapsed');
        }
    });
}

/**
 * 更新通知徽章
 */
function updateNotificationBadge() {
    const badge = document.querySelector('.notifications .badge');
    const count = 3; // 示例通知数量
    
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
} 