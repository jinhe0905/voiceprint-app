/**
 * 声纹识别应用主控制逻辑 - DeepSeek AI 增强版
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const startRecordingBtn = document.getElementById('startRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    const saveVoiceprintBtn = document.getElementById('saveVoiceprint');
    const recordingStatus = document.getElementById('recordingStatus');
    const visualizerCanvas = document.getElementById('visualizer');
    
    const startVerificationBtn = document.getElementById('startVerification');
    const stopVerificationBtn = document.getElementById('stopVerification');
    const verificationStatus = document.getElementById('verificationStatus');
    const verificationResult = document.getElementById('verificationResult');
    
    const doorStatus = document.getElementById('doorStatus');
    const toggleDoorBtn = document.getElementById('toggleDoor');
    
    // DeepSeek特性相关元素
    const voiceprintReportElem = document.getElementById('voiceprintReport');
    const uniquenessValueElem = document.getElementById('uniqueness-value');
    const stabilityValueElem = document.getElementById('stability-value');
    const clarityValueElem = document.getElementById('clarity-value');
    const uniquenessNumberElem = document.getElementById('uniqueness-number');
    const stabilityNumberElem = document.getElementById('stability-number');
    const clarityNumberElem = document.getElementById('clarity-number');
    const reportRecommendationsElem = document.getElementById('reportRecommendations');
    
    const commandResultElem = document.getElementById('commandResult');
    const commandTextElem = document.getElementById('commandText');
    const commandConfidenceElem = document.getElementById('commandConfidence');
    
    const livenessCheckElem = document.getElementById('livenessCheck');
    const voiceprintCheckElem = document.getElementById('voiceprintCheck');
    
    // 获取所有卡片元素
    const cards = document.querySelectorAll('.card');
    
    // 调整画布大小
    visualizerCanvas.width = visualizerCanvas.parentNode.clientWidth;
    visualizerCanvas.height = visualizerCanvas.parentNode.clientHeight;
    
    // 初始化音频录制器和声纹分析器
    const audioRecorder = new AudioRecorder(visualizerCanvas);
    const voiceprintAnalyzer = new VoiceprintAnalyzer();
    
    // 保存的音频数据
    let recordedAudio = null;
    let doorLocked = true;
    
    // 添加按钮图标
    function addButtonIcons() {
        // 使用Unicode图标作为临时方案
        startRecordingBtn.innerHTML = '&#128354; 开始录音';
        stopRecordingBtn.innerHTML = '&#9209; 停止录音';
        saveVoiceprintBtn.innerHTML = '&#128190; 保存声纹';
        startVerificationBtn.innerHTML = '&#128480; 开始验证';
        stopVerificationBtn.innerHTML = '&#9209; 停止验证';
        toggleDoorBtn.innerHTML = '&#128274; 解锁车门';
    }
    
    // 添加按钮图标
    addButtonIcons();
    
    // 重置安全检查状态
    function resetSecurityChecks() {
        livenessCheckElem.className = 'security-check';
        voiceprintCheckElem.className = 'security-check';
        
        livenessCheckElem.querySelector('.check-status').textContent = '待验证';
        voiceprintCheckElem.querySelector('.check-status').textContent = '待验证';
        
        livenessCheckElem.querySelector('.check-icon').textContent = '●';
        voiceprintCheckElem.querySelector('.check-icon').textContent = '●';
    }
    
    // 初始化重置安全检查
    resetSecurityChecks();
    
    // 卡片动画效果
    function animateCards() {
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200 * index);
        });
    }
    
    // 设置卡片初始样式
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // 执行卡片动画
    setTimeout(animateCards, 300);
    
    // 更新声纹报告UI
    function updateVoiceprintReport(report) {
        if (!report) return;
        
        // 显示报告区域
        voiceprintReportElem.style.display = 'block';
        
        // 更新指标条
        const uniquenessPercent = Math.round(report.uniquenessScore * 100);
        const stabilityPercent = Math.round(report.stabilityScore * 100);
        const clarityPercent = Math.round(report.qualityMetrics.clarity * 100);
        
        // 设置指标值和动画
        setTimeout(() => {
            uniquenessValueElem.style.width = uniquenessPercent + '%';
            stabilityValueElem.style.width = stabilityPercent + '%';
            clarityValueElem.style.width = clarityPercent + '%';
            
            uniquenessNumberElem.textContent = uniquenessPercent + '%';
            stabilityNumberElem.textContent = stabilityPercent + '%';
            clarityNumberElem.textContent = clarityPercent + '%';
        }, 300);
        
        // 添加建议
        reportRecommendationsElem.innerHTML = '';
        if (report.recommendations && report.recommendations.length > 0) {
            report.recommendations.forEach(rec => {
                const p = document.createElement('p');
                p.textContent = rec;
                reportRecommendationsElem.appendChild(p);
            });
        }
    }
    
    // 显示语音命令结果
    function showCommandResult(commandResult) {
        if (!commandResult) return;
        
        commandResultElem.style.display = 'block';
        commandTextElem.textContent = commandResult.command || '未识别到命令';
        
        if (commandResult.confidence) {
            const confidencePercent = Math.round(commandResult.confidence * 100);
            commandConfidenceElem.textContent = confidencePercent + '%';
        } else {
            commandConfidenceElem.textContent = '';
        }
        
        // 如果是开启车门命令，自动触发车门操作
        if (commandResult.action === 'unlock_door' && 
            commandResult.confidence > 0.8 && 
            !toggleDoorBtn.disabled) {
            toggleDoorBtn.click();
        }
    }
    
    // 更新安全检查状态
    function updateSecurityChecks(result) {
        // 活体检测状态
        if (result.antispoof) {
            if (result.antispoof.isLive) {
                livenessCheckElem.className = 'security-check passed';
                livenessCheckElem.querySelector('.check-status').textContent = '通过';
                livenessCheckElem.querySelector('.check-icon').textContent = '✓';
            } else {
                livenessCheckElem.className = 'security-check failed';
                livenessCheckElem.querySelector('.check-status').textContent = '失败';
                livenessCheckElem.querySelector('.check-icon').textContent = '✗';
            }
        }
        
        // 声纹匹配状态
        if (result.isMatch !== undefined) {
            if (result.isMatch) {
                voiceprintCheckElem.className = 'security-check passed';
                voiceprintCheckElem.querySelector('.check-status').textContent = '通过';
                voiceprintCheckElem.querySelector('.check-icon').textContent = '✓';
            } else {
                voiceprintCheckElem.className = 'security-check failed';
                voiceprintCheckElem.querySelector('.check-status').textContent = '失败';
                voiceprintCheckElem.querySelector('.check-icon').textContent = '✗';
            }
        }
    }
    
    // 尝试加载已保存的声纹模板
    if (voiceprintAnalyzer.loadTemplate()) {
        recordingStatus.textContent = '已加载保存的声纹模板';
        recordingStatus.style.color = '#3498db';
        startVerificationBtn.disabled = false;
        
        // 显示声纹报告（如果有）
        const report = voiceprintAnalyzer.getVoiceprintReport();
        if (report) {
            updateVoiceprintReport(report);
        }
    }
    
    // 初始化音频录制
    const initAudioRecorder = async () => {
        const initialized = await audioRecorder.init();
        if (!initialized) {
            recordingStatus.textContent = '无法访问麦克风，请检查浏览器权限设置';
            recordingStatus.style.color = '#e74c3c';
            return false;
        }
        return true;
    };
    
    // 注册事件监听器
    
    // 开始录音
    startRecordingBtn.addEventListener('click', async () => {
        if (!(await initAudioRecorder())) return;
        
        if (audioRecorder.startRecording()) {
            startRecordingBtn.disabled = true;
            stopRecordingBtn.disabled = false;
            saveVoiceprintBtn.disabled = true;
            recordingStatus.textContent = '正在录音...';
            recordingStatus.style.color = '#3498db';
            recordingStatus.parentElement.classList.add('recording');
            
            // 添加录音中的视觉反馈
            visualizerCanvas.parentElement.style.boxShadow = '0 0 15px rgba(52, 152, 219, 0.5)';
            visualizerCanvas.parentElement.style.borderColor = '#3498db';
        }
    });
    
    // 停止录音
    stopRecordingBtn.addEventListener('click', async () => {
        recordedAudio = await audioRecorder.stopRecording();
        
        startRecordingBtn.disabled = false;
        stopRecordingBtn.disabled = true;
        recordingStatus.parentElement.classList.remove('recording');
        
        // 恢复可视化器样式
        visualizerCanvas.parentElement.style.boxShadow = '';
        visualizerCanvas.parentElement.style.borderColor = '';
        
        if (recordedAudio) {
            saveVoiceprintBtn.disabled = false;
            recordingStatus.textContent = '录音完成，可以保存声纹模板';
            recordingStatus.style.color = '#2ecc71';
            
            // 添加保存按钮的视觉提示
            saveVoiceprintBtn.classList.add('pulse');
            setTimeout(() => saveVoiceprintBtn.classList.remove('pulse'), 2000);
        } else {
            recordingStatus.textContent = '录音失败，请重试';
            recordingStatus.style.color = '#e74c3c';
        }
    });
    
    // 保存声纹模板
    saveVoiceprintBtn.addEventListener('click', async () => {
        if (!recordedAudio) {
            recordingStatus.textContent = '没有可用的录音数据';
            recordingStatus.style.color = '#e74c3c';
            return;
        }
        
        try {
            recordingStatus.textContent = '正在处理声纹...';
            recordingStatus.style.color = '#f39c12';
            saveVoiceprintBtn.disabled = true;
            
            await voiceprintAnalyzer.createVoiceprintTemplate(recordedAudio);
            voiceprintAnalyzer.saveTemplate();
            
            recordingStatus.textContent = '声纹模板已保存！';
            recordingStatus.style.color = '#2ecc71';
            startVerificationBtn.disabled = false;
            
            // 添加视觉提示到验证部分
            cards[1].style.boxShadow = '0 10px 30px rgba(52, 152, 219, 0.4)';
            setTimeout(() => cards[1].style.boxShadow = '', 2000);
            
            // 显示声纹报告
            const report = voiceprintAnalyzer.getVoiceprintReport();
            if (report) {
                updateVoiceprintReport(report);
            }
        } catch (error) {
            recordingStatus.textContent = '保存声纹模板失败: ' + error.message;
            recordingStatus.style.color = '#e74c3c';
            saveVoiceprintBtn.disabled = false;
        }
    });
    
    // 开始验证
    startVerificationBtn.addEventListener('click', async () => {
        if (!(await initAudioRecorder())) return;
        
        // 重置UI元素
        resetSecurityChecks();
        commandResultElem.style.display = 'none';
        
        if (audioRecorder.startRecording()) {
            startVerificationBtn.disabled = true;
            stopVerificationBtn.disabled = false;
            verificationStatus.textContent = '请说话以验证身份...';
            verificationStatus.style.color = '#3498db';
            verificationResult.textContent = '';
            verificationResult.className = 'result';
            
            // 添加录音中的视觉反馈
            visualizerCanvas.parentElement.style.boxShadow = '0 0 15px rgba(52, 152, 219, 0.5)';
            visualizerCanvas.parentElement.style.borderColor = '#3498db';
            verificationStatus.parentElement.classList.add('recording');
        }
    });
    
    // 停止验证并进行声纹匹配
    stopVerificationBtn.addEventListener('click', async () => {
        const verificationAudio = await audioRecorder.stopRecording();
        
        startVerificationBtn.disabled = false;
        stopVerificationBtn.disabled = true;
        verificationStatus.parentElement.classList.remove('recording');
        
        // 恢复可视化器样式
        visualizerCanvas.parentElement.style.boxShadow = '';
        visualizerCanvas.parentElement.style.borderColor = '';
        
        if (!verificationAudio) {
            verificationStatus.textContent = '录音失败，请重试';
            verificationStatus.style.color = '#e74c3c';
            return;
        }
        
        try {
            verificationStatus.textContent = '正在分析声纹...';
            verificationStatus.style.color = '#f39c12';
            
            // 添加分析中的视觉反馈
            verificationResult.textContent = '分析中...';
            verificationResult.className = 'result';
            verificationResult.style.background = 'rgba(243, 156, 18, 0.1)';
            verificationResult.style.color = '#f39c12';
            
            const result = await voiceprintAnalyzer.matchVoiceprint(verificationAudio);
            
            // 更新安全检查状态
            updateSecurityChecks(result);
            
            // 处理语音命令
            if (result.recognizedCommand) {
                showCommandResult(result.recognizedCommand);
            }
            
            if (result.isMatch) {
                verificationResult.textContent = `验证成功！相似度: ${(result.similarityScore * 100).toFixed(2)}%，置信度: ${(result.confidence * 100).toFixed(1)}%`;
                verificationResult.className = 'result success';
                toggleDoorBtn.disabled = false;
                
                // 添加成功的视觉反馈到车门控制
                cards[2].style.boxShadow = '0 10px 30px rgba(46, 204, 113, 0.4)';
                setTimeout(() => {
                    toggleDoorBtn.classList.add('pulse');
                    setTimeout(() => toggleDoorBtn.classList.remove('pulse'), 2000);
                }, 500);
            } else {
                // 检查失败原因
                if (result.reason === 'anti_spoofing_failed') {
                    verificationResult.textContent = result.message || `验证失败：检测到非实时语音`;
                } else {
                    verificationResult.textContent = `验证失败。相似度: ${(result.similarityScore * 100).toFixed(2)}%，低于阈值: ${(result.threshold * 100).toFixed(2)}%`;
                }
                
                verificationResult.className = 'result error';
                toggleDoorBtn.disabled = true;
                
                // 添加失败的视觉反馈
                cards[2].style.boxShadow = '0 10px 30px rgba(231, 76, 60, 0.2)';
                setTimeout(() => cards[2].style.boxShadow = '', 2000);
            }
            
            verificationStatus.textContent = '声纹验证完成';
            verificationStatus.style.color = '#bdc3c7';
        } catch (error) {
            verificationStatus.textContent = '声纹验证失败: ' + error.message;
            verificationStatus.style.color = '#e74c3c';
            verificationResult.textContent = '';
            verificationResult.className = 'result';
            
            // 重置安全检查
            resetSecurityChecks();
        }
    });
    
    // 车门控制
    toggleDoorBtn.addEventListener('click', () => {
        doorLocked = !doorLocked;
        
        if (doorLocked) {
            doorStatus.textContent = '已锁定';
            doorStatus.classList.remove('unlocked');
            toggleDoorBtn.innerHTML = '&#128274; 解锁车门';
            
            // 添加锁定动画
            doorStatus.style.transform = 'scale(0.95)';
            setTimeout(() => doorStatus.style.transform = '', 300);
        } else {
            doorStatus.textContent = '已解锁';
            doorStatus.classList.add('unlocked');
            toggleDoorBtn.innerHTML = '&#128275; 锁定车门';
            
            // 添加解锁动画
            doorStatus.style.transform = 'scale(1.1)';
            setTimeout(() => doorStatus.style.transform = '', 300);
            
            // 模拟自动锁定
            let countdown = 10;
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    if (!doorLocked) {
                        doorLocked = true;
                        doorStatus.textContent = '已锁定';
                        doorStatus.classList.remove('unlocked');
                        toggleDoorBtn.innerHTML = '&#128274; 解锁车门';
                        
                        // 添加锁定动画
                        doorStatus.style.transform = 'scale(0.95)';
                        setTimeout(() => doorStatus.style.transform = '', 300);
                    }
                } else {
                    doorStatus.textContent = `已解锁 (${countdown}秒后自动锁定)`;
                }
            }, 1000);
        }
    });
    
    // 处理窗口大小调整
    window.addEventListener('resize', () => {
        visualizerCanvas.width = visualizerCanvas.parentNode.clientWidth;
        visualizerCanvas.height = visualizerCanvas.parentNode.clientHeight;
    });
    
    // 添加脉动动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .pulse {
            animation: pulse 0.5s ease-in-out 3;
        }
    `;
    document.head.appendChild(style);
}); 