/**
 * 声纹验证页面交互逻辑
 * 包含声纹验证、语音命令和车门控制功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面元素
    initPageElements();
    
    // 初始化选项卡切换
    initTabs();
    
    // 初始化声纹验证面板
    initVoiceprintPanel();
    
    // 初始化语音命令面板
    initCommandPanel();
    
    // 初始化车门控制面板
    initDoorPanel();
    
    // 初始化侧边栏折叠功能
    initSidebar();
    
    // 初始化音频波形显示
    initWaveform();
});

// 初始化页面元素引用
function initPageElements() {
    // 通用页面元素
    window.elements = {
        // 声纹验证面板元素
        voiceprintPanel: document.getElementById('voiceprint-panel'),
        startRecording: document.getElementById('startRecording'),
        stopRecording: document.getElementById('stopRecording'),
        verifyVoiceprint: document.getElementById('verifyVoiceprint'),
        statusMessage: document.getElementById('status-message'),
        resultMessage: document.getElementById('result-message'),
        voiceprintReport: document.getElementById('voiceprint-report'),
        livenessCheck: document.getElementById('liveness-check'),
        voiceprintMatch: document.getElementById('voiceprint-match'),
        recognizedCommand: document.getElementById('recognized-command'),
        commandConfidence: document.getElementById('command-confidence'),
        recordingTimer: document.getElementById('recording-timer'),
        recordingIndicator: document.getElementById('recording-indicator'),
        recordingText: document.querySelector('.recording-text'),
        audioLevelBar: document.getElementById('audio-level-bar'),
        
        // 语音命令面板元素
        commandPanel: document.getElementById('command-panel'),
        startCommandRecording: document.getElementById('startCommandRecording'),
        stopCommandRecording: document.getElementById('stopCommandRecording'),
        commandStatusMessage: document.getElementById('command-status-message'),
        commandResultMessage: document.getElementById('command-result-message'),
        
        // 车门控制面板元素
        doorPanel: document.getElementById('door-panel'),
        vehicleSelect: document.getElementById('vehicle-select'),
        doorStatus: document.getElementById('door-status'),
        autoLockInfo: document.getElementById('auto-lock-info'),
        unlockDoor: document.getElementById('unlock-door'),
        lockDoor: document.getElementById('lock-door'),
        trunkBtn: document.getElementById('trunk-btn'),
        windowBtn: document.getElementById('window-btn'),
        
        // 音频可视化元素
        visualizer: document.getElementById('visualizer'),
        commandVisualizer: document.getElementById('command-visualizer'),
        audioWaveform: document.getElementById('audio-waveform')
    };
    
    // 初始化选项卡元素
    window.tabs = document.querySelectorAll('.verify-tab');
    window.panels = document.querySelectorAll('.verify-panel');
}

// 初始化选项卡切换功能
function initTabs() {
    window.tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有选项卡的活动状态
            window.tabs.forEach(t => t.classList.remove('active'));
            // 添加当前选项卡的活动状态
            this.classList.add('active');
            
            // 隐藏所有面板
            window.panels.forEach(panel => panel.classList.remove('active'));
            
            // 显示目标面板
            const targetPanel = document.getElementById(this.dataset.target);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// 初始化声纹验证面板
function initVoiceprintPanel() {
    const { 
        startRecording, stopRecording, verifyVoiceprint, 
        statusMessage, visualizer, audioLevelBar 
    } = window.elements;
    
    // 录音实例
    const audioRecorder = new AudioRecorder(visualizer);
    
    // 录音状态
    let isRecording = false;
    let recordedAudioData = null;
    
    // 初始化录音设备
    audioRecorder.init().then(() => {
        console.log('录音设备初始化成功');
        startRecording.disabled = false;
        statusMessage.textContent = '录音设备已就绪，请点击"开始录音"按钮进行声纹验证。';
    }).catch(error => {
        console.error('录音设备初始化失败:', error);
        statusMessage.textContent = '无法访问麦克风，请检查浏览器权限设置。';
        startRecording.disabled = true;
    });
    
    // 设置音频电平更新回调
    audioRecorder.onAudioLevelUpdate = (level) => {
        // 将0-1的电平值转换为百分比（0-100%）
        const levelPercent = Math.min(Math.floor(level * 500), 100);
        audioLevelBar.style.width = `${levelPercent}%`;
        
        // 根据电平值设置颜色
        if (levelPercent < 30) {
            audioLevelBar.style.backgroundColor = '#52c41a'; // 低电平 - 绿色
        } else if (levelPercent < 70) {
            audioLevelBar.style.backgroundColor = '#1890ff'; // 中电平 - 蓝色
        } else {
            audioLevelBar.style.backgroundColor = levelPercent > 85 ? '#cf1322' : '#faad14'; // 高电平 - 黄色/红色
        }
    };
    
    // 设置录音时间更新回调
    audioRecorder.onRecordingTimeUpdate = (duration) => {
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        // 更新录音计时器显示
        window.elements.recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    // 设置最大录音时长回调
    audioRecorder.onMaxDurationReached = () => {
        statusMessage.textContent = '已达到最大录音时长，录音已自动停止。';
    };
    
    // 开始录音按钮点击事件
    startRecording.addEventListener('click', function() {
        // 重置UI状态
        resetVoiceprintUI();
        
        // 开始录音
        if (audioRecorder.startRecording()) {
                // 更新UI状态
                isRecording = true;
                startRecording.disabled = true;
                stopRecording.disabled = false;
                verifyVoiceprint.disabled = true;
                statusMessage.textContent = '正在录音，请朗读屏幕上的文字...';
                
            // 更新录音指示器
            window.elements.recordingText.textContent = '正在录音';
            document.querySelector('.recording-dot').classList.add('active');
            
            // 激活波形动画
            activateWaveform();
        } else {
            statusMessage.textContent = '无法启动录音，请检查麦克风权限。';
        }
    });
    
    // 停止录音按钮点击事件
    stopRecording.addEventListener('click', function() {
        if (!isRecording) return;
        
        // 停止录音
        audioRecorder.stopRecording()
            .then(audioData => {
                // 保存录制的音频
                recordedAudioData = audioData;
                
                // 更新UI状态
                isRecording = false;
                startRecording.disabled = false;
                stopRecording.disabled = true;
                verifyVoiceprint.disabled = false;
                statusMessage.textContent = '录音已完成，请点击"验证身份"按钮进行验证。';
                
                // 更新录音指示器
                window.elements.recordingText.textContent = '录音完成';
                document.querySelector('.recording-dot').classList.remove('active');
                
                // 停止波形动画
                deactivateWaveform();
                
                // 重置音频电平显示
                audioLevelBar.style.width = '0%';
            })
            .catch(error => {
                console.error('停止录音失败:', error);
                statusMessage.textContent = '停止录音失败: ' + error.message;
            });
    });
    
    // 验证声纹按钮点击事件
    verifyVoiceprint.addEventListener('click', function() {
        if (!recordedAudioData) {
            statusMessage.textContent = '没有可用的录音数据，请先录音。';
            return;
        }
        
        // 显示正在处理消息
        statusMessage.textContent = '正在验证声纹，请稍候...';
        verifyVoiceprint.disabled = true;
        
        // 播放录制的音频（可选）
        // recordedAudioData.play();
        
        // 模拟声纹验证过程
        simulateVoiceprintVerification(recordedAudioData)
            .then(result => {
                // 处理验证结果
                handleVerificationResult(result);
            })
            .catch(error => {
                console.error('声纹验证失败:', error);
                showResultMessage('error', '声纹验证失败: ' + error.message);
                verifyVoiceprint.disabled = false;
            });
    });
    
    // 模拟声纹验证过程
    function simulateVoiceprintVerification(audioData) {
        return new Promise((resolve) => {
            // 显示加载动画
            statusMessage.textContent = '正在分析声纹特征...';
            
            // 模拟验证延迟
            setTimeout(() => {
                statusMessage.textContent = '正在匹配声纹特征...';
                
                setTimeout(() => {
                    statusMessage.textContent = '正在进行活体检测...';
                    
                    setTimeout(() => {
                        // 返回验证结果
                        resolve({
                            success: true,
                            livenessCheck: true,
                            voiceprintMatch: true,
                            recognizedText: "智能声纹，安全出行",
                            confidence: 98,
                            voiceprintQuality: {
                                uniquenessScore: 0.85,
                                stabilityScore: 0.92,
                                clarity: 0.78
                            }
                        });
                    }, 800);
                }, 700);
            }, 1000);
        });
    }
}

// 处理声纹验证结果
function handleVerificationResult(result) {
    const { 
        resultMessage, voiceprintReport, statusMessage, 
        verifyVoiceprint, livenessCheck, voiceprintMatch,
        recognizedCommand, commandConfidence
    } = window.elements;
    
    // 更新验证状态
    verifyVoiceprint.disabled = false;
    
    if (result.success) {
        // 显示成功结果
        showResultMessage('success', '身份验证成功! 您的声纹已确认。');
        
        // 更新安全检查状态
        updateSecurityCheck(livenessCheck, result.livenessCheck);
        updateSecurityCheck(voiceprintMatch, result.voiceprintMatch);
        
        // 更新识别到的命令
        if (recognizedCommand) {
            recognizedCommand.textContent = result.recognizedText;
            commandConfidence.textContent = `${result.confidence}%`;
        }
        
        // 显示声纹报告
        showVoiceprintReport(result.voiceprintQuality);
        
        // 如果在车门控制面板，更新车门状态
        if (document.querySelector('.door-panel')) {
            setTimeout(() => {
            updateDoorStatus('unlocked');
            }, 500);
        }
    } else {
        // 显示失败结果
        showResultMessage('error', '身份验证失败，声纹不匹配。');
        
        // 更新安全检查状态
        updateSecurityCheck(livenessCheck, result.livenessCheck);
        updateSecurityCheck(voiceprintMatch, false);
    }
}

// 更新安全检查状态
function updateSecurityCheck(element, isPassed) {
    if (!element) return;
    
    if (isPassed) {
        element.classList.remove('failed');
        element.classList.add('passed');
        element.querySelector('.check-icon i').className = 'bi bi-check-circle-fill';
        element.querySelector('.check-status').textContent = '通过';
    } else {
        element.classList.remove('passed');
        element.classList.add('failed');
        element.querySelector('.check-icon i').className = 'bi bi-x-circle-fill';
        element.querySelector('.check-status').textContent = '未通过';
    }
}

// 显示声纹质量报告
function showVoiceprintReport(quality) {
    if (!quality) return;
    
    const voiceprintReport = window.elements.voiceprintReport;
    if (!voiceprintReport) return;
    
    // 更新质量指标
    const metrics = voiceprintReport.querySelectorAll('.metric-value');
    const metricNumbers = voiceprintReport.querySelectorAll('.metric-number');
    
    if (metrics.length >= 3 && metricNumbers.length >= 3) {
    // 唯一性
        const uniquenessPercent = Math.round(quality.uniquenessScore * 100);
        metrics[0].style.width = `${uniquenessPercent}%`;
        metricNumbers[0].textContent = `${uniquenessPercent}%`;
    
    // 稳定性
        const stabilityPercent = Math.round(quality.stabilityScore * 100);
        metrics[1].style.width = `${stabilityPercent}%`;
        metricNumbers[1].textContent = `${stabilityPercent}%`;
    
    // 清晰度
        const clarityPercent = Math.round(quality.clarity * 100);
        metrics[2].style.width = `${clarityPercent}%`;
        metricNumbers[2].textContent = `${clarityPercent}%`;
    }
    
    // 显示报告
    voiceprintReport.style.display = 'block';
}

// 显示结果消息
function showResultMessage(type, message) {
    const resultMessage = window.elements.resultMessage;
    if (!resultMessage) return;
    
    resultMessage.className = 'result-message ' + type;
    resultMessage.textContent = message;
    resultMessage.style.display = 'block';
}

// 重置声纹验证UI
function resetVoiceprintUI() {
    const { resultMessage, voiceprintReport } = window.elements;
    
    // 隐藏结果消息和报告
    if (resultMessage) resultMessage.style.display = 'none';
    if (voiceprintReport) voiceprintReport.style.display = 'none';
    
    // 重置安全检查状态
    resetSecurityCheck(window.elements.livenessCheck);
    resetSecurityCheck(window.elements.voiceprintMatch);
}

// 重置安全检查状态
function resetSecurityCheck(element) {
    if (!element) return;
    
    element.classList.remove('passed', 'failed');
    element.querySelector('.check-icon i').className = 'bi bi-dash-circle';
    element.querySelector('.check-status').textContent = '等待验证';
}

// 初始化语音命令面板
function initCommandPanel() {
    const { 
        startCommandRecording, stopCommandRecording, 
        commandStatusMessage, commandVisualizer 
    } = window.elements;
    
    // 如果没有找到语音命令面板元素，直接返回
    if (!startCommandRecording || !stopCommandRecording) return;
    
    // 录音实例
    const commandRecorder = new AudioRecorder(commandVisualizer);
    
    // 录音状态
    let isRecording = false;
    let recordedAudioData = null;
    
    // 初始化录音设备
    commandRecorder.init().then(() => {
        console.log('命令录音设备初始化成功');
    }).catch(error => {
        console.error('命令录音设备初始化失败:', error);
        commandStatusMessage.textContent = '无法访问麦克风，请检查浏览器权限设置。';
        startCommandRecording.disabled = true;
    });
    
    // 开始录音按钮点击事件
    startCommandRecording.addEventListener('click', function() {
        // 重置UI状态
        resetCommandUI();
        
        // 开始录音
        if (commandRecorder.startRecording()) {
                // 更新UI状态
                isRecording = true;
                startCommandRecording.disabled = true;
                stopCommandRecording.disabled = false;
                commandStatusMessage.textContent = '正在录音，请说出您的命令...';
        } else {
            commandStatusMessage.textContent = '无法启动录音，请检查麦克风权限。';
        }
    });
    
    // 停止录音按钮点击事件
    stopCommandRecording.addEventListener('click', function() {
        if (!isRecording) return;
        
        // 停止录音
        commandRecorder.stopRecording()
            .then(audioData => {
                // 保存录制的音频
                recordedAudioData = audioData;
                
                // 更新UI状态
                isRecording = false;
                startCommandRecording.disabled = false;
                stopCommandRecording.disabled = true;
                commandStatusMessage.textContent = '正在处理您的语音命令...';
                
                // 处理语音命令
                processVoiceCommand(audioData);
            })
            .catch(error => {
                console.error('停止录音失败:', error);
                commandStatusMessage.textContent = '停止录音失败: ' + error.message;
            });
    });
}

// 处理语音命令
function processVoiceCommand(audioData) {
    const { commandStatusMessage, commandResultMessage } = window.elements;
    
    // 模拟命令处理延迟
    setTimeout(() => {
        // 模拟命令识别结果
        const commands = [
            '打开车门',
            '锁定车门',
            '打开后备箱',
            '关闭车窗',
            '打开车灯'
        ];
    
        // 随机选择一个命令
        const recognizedCommand = commands[Math.floor(Math.random() * commands.length)];
        
        // 显示识别结果
        showCommandResult('success', `已识别命令: "${recognizedCommand}"`);
        commandStatusMessage.textContent = '命令已识别，正在执行...';
        
        // 执行命令
        executeCommand(recognizedCommand);
    }, 1500);
}

// 执行语音命令
function executeCommand(command) {
    const { commandStatusMessage } = window.elements;
    
    // 根据命令执行不同操作
    switch (command.toLowerCase()) {
        case '打开车门':
            // 切换到车门控制面板
            switchToTab('door-panel');
            // 模拟点击解锁按钮
            setTimeout(() => {
                simulateButtonAction(window.elements.unlockDoor);
                commandStatusMessage.textContent = '已执行: 打开车门';
            }, 500);
            break;
            
        case '锁定车门':
            // 切换到车门控制面板
            switchToTab('door-panel');
            // 模拟点击锁定按钮
            setTimeout(() => {
                simulateButtonAction(window.elements.lockDoor);
                commandStatusMessage.textContent = '已执行: 锁定车门';
            }, 500);
            break;
            
        case '打开后备箱':
            // 切换到车门控制面板
            switchToTab('door-panel');
            // 模拟点击后备箱按钮
            setTimeout(() => {
            simulateButtonAction(window.elements.trunkBtn);
                commandStatusMessage.textContent = '已执行: 打开后备箱';
            }, 500);
            break;
            
        default:
            commandStatusMessage.textContent = `已识别命令: "${command}"，但当前不支持此操作。`;
            break;
    }
}

// 切换到指定选项卡
function switchToTab(tabId) {
    const tab = document.querySelector(`.verify-tab[data-target="${tabId}"]`);
    if (tab) tab.click();
}

// 模拟按钮点击
function simulateButtonAction(button) {
    if (!button) return;
    
    // 添加活动状态类
    button.classList.add('active');
    
    // 移除活动状态类
    setTimeout(() => {
        button.classList.remove('active');
        
        // 如果有点击事件，触发它
        if (button.click) {
            button.click();
        }
    }, 300);
}

// 显示命令结果
function showCommandResult(type, message) {
    const commandResultMessage = window.elements.commandResultMessage;
    if (!commandResultMessage) return;
    
    commandResultMessage.className = 'result-message ' + type;
    commandResultMessage.textContent = message;
    commandResultMessage.style.display = 'block';
}

// 重置命令UI
function resetCommandUI() {
    const { commandResultMessage } = window.elements;
    
    // 隐藏结果消息
    if (commandResultMessage) commandResultMessage.style.display = 'none';
}

// 初始化车门控制面板
function initDoorPanel() {
    const { doorPanel, unlockDoor, lockDoor } = window.elements;
    
    // 如果没有找到车门控制面板元素，直接返回
    if (!doorPanel || !unlockDoor || !lockDoor) return;
        
    // 初始化车门状态
    updateDoorStatus('locked');
    
    // 解锁车门按钮点击事件
    unlockDoor.addEventListener('click', function() {
        // 显示加载状态
        this.classList.add('loading');
        this.disabled = true;
        
        // 模拟解锁延迟
        setTimeout(() => {
            // 更新车门状态
            updateDoorStatus('unlocked');
            
            // 移除加载状态
            this.classList.remove('loading');
            this.disabled = false;
            
            // 启动自动锁定倒计时
            startAutoLockCountdown(30);
        }, 1000);
    });
    
    // 锁定车门按钮点击事件
    lockDoor.addEventListener('click', function() {
        // 显示加载状态
        this.classList.add('loading');
        this.disabled = true;
        
        // 模拟锁定延迟
        setTimeout(() => {
        // 更新车门状态
        updateDoorStatus('locked');
            
            // 移除加载状态
            this.classList.remove('loading');
            this.disabled = false;
            
            // 清除自动锁定倒计时
            clearAutoLockCountdown();
        }, 1000);
    });
    
    // 其他车门控制按钮
    const otherButtons = [window.elements.trunkBtn, window.elements.windowBtn];
    otherButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                // 显示加载状态
                this.classList.add('loading');
                this.disabled = true;
    
                // 模拟操作延迟
                setTimeout(() => {
                    // 移除加载状态
                    this.classList.remove('loading');
                    this.disabled = false;
                    
                    // 显示操作成功消息
                    alert('操作成功!');
                }, 1000);
            });
        }
    });
}

// 更新车门状态
function updateDoorStatus(status) {
    const { doorStatus, unlockDoor, lockDoor, autoLockInfo } = window.elements;
    
    if (!doorStatus) return;
    
    if (status === 'locked') {
        // 更新状态文本和样式
        doorStatus.textContent = '已锁定';
        doorStatus.className = 'door-status locked';
        
        // 更新按钮状态
        if (unlockDoor) unlockDoor.disabled = false;
        if (lockDoor) lockDoor.disabled = true;
        
        // 隐藏自动锁定信息
        if (autoLockInfo) autoLockInfo.style.display = 'none';
    } else if (status === 'unlocked') {
        // 更新状态文本和样式
        doorStatus.textContent = '已解锁';
        doorStatus.className = 'door-status unlocked';
        
        // 更新按钮状态
        if (unlockDoor) unlockDoor.disabled = true;
        if (lockDoor) lockDoor.disabled = false;
        
        // 显示自动锁定信息
        if (autoLockInfo) autoLockInfo.style.display = 'block';
    }
}

// 自动锁定倒计时
let autoLockCountdownTimer;

// 启动自动锁定倒计时
function startAutoLockCountdown(seconds) {
    const { autoLockInfo, lockDoor } = window.elements;
    
    // 清除现有倒计时
    clearAutoLockCountdown();
    
    let remainingSeconds = seconds;
    
    // 更新倒计时文本
    updateCountdownText(remainingSeconds);
    
    // 启动倒计时
    autoLockCountdownTimer = setInterval(() => {
        remainingSeconds--;
        
        // 更新倒计时文本
        updateCountdownText(remainingSeconds);
        
        // 检查倒计时是否结束
        if (remainingSeconds <= 0) {
            clearInterval(autoLockCountdownTimer);
            
            // 自动锁定车门
            if (lockDoor) lockDoor.click();
        }
    }, 1000);
}

// 更新倒计时文本
function updateCountdownText(seconds) {
    const { autoLockInfo } = window.elements;
    
    if (autoLockInfo) {
        autoLockInfo.textContent = `车门将在 ${seconds} 秒后自动锁定`;
    }
}

// 清除自动锁定倒计时
function clearAutoLockCountdown() {
    if (autoLockCountdownTimer) {
        clearInterval(autoLockCountdownTimer);
        autoLockCountdownTimer = null;
    }
}

// 初始化侧边栏折叠功能
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const appContainer = document.querySelector('.app-container');
    
    if (menuToggle && appContainer) {
        menuToggle.addEventListener('click', function() {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }
}

// 初始化波形显示
function initWaveform() {
    const audioWaveform = window.elements.audioWaveform;
    
    if (!audioWaveform) return;
    
    // 创建波形条
    for (let i = 0; i < 60; i++) {
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        audioWaveform.appendChild(bar);
    }
}

// 激活波形动画
function activateWaveform() {
    const waveformBars = document.querySelectorAll('.waveform-bar');
    
    waveformBars.forEach((bar, index) => {
        // 使用不同的动画延迟创建波浪效果
        const delay = index % 5 * 0.1;
        bar.style.animation = `waveform-animation 0.5s infinite ${delay}s`;
        
        // 随机高度
        const randomHeight = 5 + Math.random() * 25;
        bar.style.height = `${randomHeight}px`;
    });
}

// 停用波形动画
function deactivateWaveform() {
    const waveformBars = document.querySelectorAll('.waveform-bar');
    
    waveformBars.forEach(bar => {
        bar.style.animation = 'none';
        bar.style.height = '5px';
    });
} 