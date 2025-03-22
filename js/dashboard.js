/**
 * 仪表盘页面JavaScript
 * 智能车门解锁系统
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面元素
    initializePage();
    
    // 初始化雷达图
    initializeRadarChart();
    
    // 设置交互事件
    setupEventListeners();
    
    // 演示数据更新
    simulateDataUpdates();
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
    // 车辆选择变更
    const vehicleSelect = document.getElementById('vehicleSelect');
    if (vehicleSelect) {
        vehicleSelect.addEventListener('change', function() {
            updateVehicleDisplay(this.value);
        });
    }
    
    // 快速设置开关
    const preferenceSwitches = document.querySelectorAll('.preference-item .switch input');
    preferenceSwitches.forEach(switchElem => {
        switchElem.addEventListener('change', function() {
            const prefTitle = this.closest('.preference-item').querySelector('.preference-title').textContent;
            savePreference(prefTitle, this.checked);
        });
    });
    
    // 车辆操作按钮
    const vehicleActionButtons = document.querySelectorAll('.vehicle-actions button');
    vehicleActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.trim();
            handleVehicleAction(action);
        });
    });
}

/**
 * 初始化雷达图
 */
function initializeRadarChart() {
    const ctx = document.getElementById('radarChart');
    if (!ctx) return;
    
    const radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['唯一性', '稳定性', '清晰度', '识别率', '安全性'],
            datasets: [{
                label: '声纹质量',
                data: [85, 90, 95, 92, 98],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
            }]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 50,
                    suggestedMax: 100
                }
            }
        }
    });
}

/**
 * 更新车辆显示
 */
function updateVehicleDisplay(vehicleId) {
    const vehicles = {
        car1: {
            name: '奔驰 S级',
            plate: '京A12345',
            status: {
                locked: true,
                engineOff: true,
                windowsClosed: true
            }
        },
        car2: {
            name: '宝马 5系',
            plate: '京B54321',
            status: {
                locked: true,
                engineOff: true,
                windowsClosed: false
            }
        },
        car3: {
            name: '特斯拉 Model 3',
            plate: '京C98765',
            status: {
                locked: false,
                engineOff: false,
                windowsClosed: true
            }
        }
    };
    
    const vehicle = vehicles[vehicleId];
    if (!vehicle) return;
    
    // 更新车辆信息
    document.querySelector('.vehicle-name').textContent = vehicle.name;
    document.querySelector('.vehicle-plate').textContent = vehicle.plate;
    
    // 更新状态指示器
    const lockedIndicator = document.querySelector('.vehicle-indicator.locked span');
    lockedIndicator.textContent = vehicle.status.locked ? '已锁定' : '未锁定';
    document.querySelector('.vehicle-indicator.locked').className = 
        `vehicle-indicator locked ${vehicle.status.locked ? '' : 'inactive'}`;
    
    const engineIndicator = document.querySelector('.vehicle-indicator.engine-off span');
    engineIndicator.textContent = vehicle.status.engineOff ? '发动机关闭' : '发动机运行中';
    document.querySelector('.vehicle-indicator.engine-off').className = 
        `vehicle-indicator engine-off ${vehicle.status.engineOff ? '' : 'inactive'}`;
    
    const windowsIndicator = document.querySelector('.vehicle-indicator.windows-closed span');
    windowsIndicator.textContent = vehicle.status.windowsClosed ? '车窗关闭' : '车窗开启';
    document.querySelector('.vehicle-indicator.windows-closed').className = 
        `vehicle-indicator windows-closed ${vehicle.status.windowsClosed ? '' : 'inactive'}`;
}

/**
 * 处理车辆操作
 */
function handleVehicleAction(action) {
    // 获取当前选择的车辆
    const vehicleSelect = document.getElementById('vehicleSelect');
    const selectedVehicle = vehicleSelect.options[vehicleSelect.selectedIndex].text;
    
    let actionType, actionSuccess;
    
    if (action.includes('解锁')) {
        actionType = '解锁车门';
        actionSuccess = true;
    } else if (action.includes('后备箱')) {
        actionType = '开启后备箱';
        actionSuccess = true;
    } else {
        actionType = '车辆操作';
        actionSuccess = Math.random() > 0.2; // 80%的成功率
    }
    
    // 显示操作反馈
    showActionFeedback(actionType, actionSuccess, selectedVehicle);
    
    // 如果操作成功，更新活动列表
    if (actionSuccess) {
        addNewActivity(actionType, selectedVehicle);
    }
}

/**
 * 显示操作反馈
 */
function showActionFeedback(actionType, success, vehicle) {
    // 创建一个临时通知元素
    const notification = document.createElement('div');
    notification.className = `action-notification ${success ? 'success' : 'error'}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="bi bi-${success ? 'check-circle' : 'x-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${actionType}${success ? '成功' : '失败'}</div>
            <div class="notification-message">${vehicle}</div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * 添加新活动
 */
function addNewActivity(actionType, vehicle) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    // 创建活动图标映射
    const iconMap = {
        '解锁车门': 'unlock',
        '开启后备箱': 'box',
        '锁定车门': 'lock',
        '车辆操作': 'gear'
    };
    
    // 获取当前时间
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 创建新活动元素
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item';
    newActivity.innerHTML = `
        <div class="activity-icon success">
            <i class="bi bi-${iconMap[actionType] || 'gear'}"></i>
        </div>
        <div class="activity-details">
            <div class="activity-title">${actionType}</div>
            <div class="activity-meta">
                <span class="activity-vehicle">${vehicle}</span>
                <span class="activity-time">现在 ${timeString}</span>
            </div>
        </div>
    `;
    
    // 添加新活动到列表顶部
    activityList.insertBefore(newActivity, activityList.firstChild);
    
    // 删除超过5个的活动记录
    while (activityList.children.length > 5) {
        activityList.removeChild(activityList.lastChild);
    }
    
    // 添加动画效果
    newActivity.classList.add('new-activity');
    setTimeout(() => {
        newActivity.classList.remove('new-activity');
    }, 1000);
}

/**
 * 保存用户偏好设置
 */
function savePreference(title, value) {
    console.log(`保存设置: ${title} = ${value}`);
    
    // 模拟设置保存
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences[title] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // 显示保存成功的通知
    showActionFeedback('保存设置', true, title);
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

/**
 * 演示数据更新
 */
function simulateDataUpdates() {
    // 定时更新仪表盘数据
    setInterval(() => {
        updateStatCards();
    }, 30000); // 每30秒更新一次
}

/**
 * 更新统计卡片
 */
function updateStatCards() {
    // 这里只是演示随机更新，实际应用中应该从API获取数据
    const statValues = document.querySelectorAll('.stat-value');
    const statChanges = document.querySelectorAll('.stat-change');
    
    // 更新成功验证次数
    if (statValues[0]) {
        const currentValue = parseInt(statValues[0].textContent);
        const newValue = currentValue + (Math.random() > 0.7 ? 1 : 0);
        if (newValue !== currentValue) {
            animateNumberChange(statValues[0], currentValue, newValue);
            statChanges[0].textContent = `+${Math.round((newValue - 26) / 26 * 100)}%`;
        }
    }
    
    // 更新识别率
    if (statValues[2]) {
        const currentValue = parseInt(statValues[2].textContent);
        const newValue = Math.min(99, currentValue + (Math.random() > 0.8 ? 1 : 0));
        if (newValue !== currentValue) {
            animateNumberChange(statValues[2], currentValue, newValue, '%');
            statChanges[2].textContent = `+${newValue - 95}%`;
        }
    }
}

/**
 * 动画显示数字变化
 */
function animateNumberChange(element, startValue, endValue, suffix = '') {
    let currentValue = startValue;
    const duration = 1000; // 动画持续时间(毫秒)
    const interval = 50; // 每次更新间隔(毫秒)
    const steps = duration / interval;
    const increment = (endValue - startValue) / steps;
    
    // 添加动画类
    element.classList.add('updating');
    
    const timer = setInterval(() => {
        currentValue += increment;
        if ((increment > 0 && currentValue >= endValue) || 
            (increment < 0 && currentValue <= endValue)) {
            currentValue = endValue;
            clearInterval(timer);
            
            // 移除动画类
            setTimeout(() => {
                element.classList.remove('updating');
            }, 500);
        }
        
        element.textContent = Math.round(currentValue) + suffix;
    }, interval);
} 