/**
 * DeepSeekAPI - 声纹识别系统的DeepSeek AI集成
 * 
 * 该模块负责与DeepSeek API进行通信，进行高级声纹分析、
 * 活体检测和语音命令处理
 */
class DeepSeekAPI {
    constructor(options = {}) {
        this.apiKey = options.apiKey || null;
        this.apiEndpoint = options.apiEndpoint || 'https://api.deepseek.com/v1';
        this.isInitialized = false;
        this.modelConfig = {
            voiceprintModel: 'deepseek-audio-1.0',
            commandModel: 'deepseek-command-1.0',
            antispoofModel: 'deepseek-security-1.0'
        };
        
        // 保存命令列表
        this.availableCommands = [
            { name: '开启车门', action: 'unlock_door', confidence: 0 },
            { name: '打开后备箱', action: 'open_trunk', confidence: 0 },
            { name: '启动引擎', action: 'start_engine', confidence: 0 },
            { name: '调整空调', action: 'adjust_ac', confidence: 0 },
            { name: '导航回家', action: 'navigate_home', confidence: 0 }
        ];
    }
    
    /**
     * 初始化API连接
     * @returns {Promise<boolean>} 初始化是否成功
     */
    async initialize() {
        try {
            if (!this.apiKey) {
                console.warn('DeepSeek API键未设置，将使用演示模式');
                this.isInitialized = true;
                return true;
            }
            
            // 在实际实现中，这里应验证API密钥
            const response = await this._request('/auth/validate', {
                method: 'POST',
                body: JSON.stringify({ api_key: this.apiKey })
            });
            
            if (response && response.status === 'valid') {
                console.log('DeepSeek API连接成功');
                this.isInitialized = true;
                return true;
            } else {
                console.error('DeepSeek API验证失败');
                return false;
            }
        } catch (error) {
            console.error('DeepSeek API初始化错误:', error);
            // 启用演示模式
            this.isInitialized = true;
            return true;
        }
    }
    
    /**
     * 分析声纹特征
     * @param {Blob} audioBlob 音频数据
     * @returns {Promise<Object>} 声纹特征向量
     */
    async analyzeVoiceprint(audioBlob) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            if (this.apiKey) {
                // 实际API调用
                const formData = new FormData();
                formData.append('audio', audioBlob);
                formData.append('model', this.modelConfig.voiceprintModel);
                
                const response = await this._request('/audio/voiceprint', {
                    method: 'POST',
                    body: formData
                });
                
                return response.features;
            } else {
                // 演示模式 - 返回模拟数据
                console.log('使用演示模式分析声纹');
                return this._generateDemoVoiceprintFeatures(audioBlob);
            }
        } catch (error) {
            console.error('声纹分析失败:', error);
            throw new Error('声纹分析处理失败');
        }
    }
    
    /**
     * 比较两个声纹的相似度
     * @param {Object} feature1 第一个声纹特征
     * @param {Object} feature2 第二个声纹特征
     * @returns {Promise<Object>} 相似度结果
     */
    async compareVoiceprints(feature1, feature2) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            if (this.apiKey) {
                // 实际API调用
                const response = await this._request('/audio/compare', {
                    method: 'POST',
                    body: JSON.stringify({
                        feature1: feature1,
                        feature2: feature2,
                        model: this.modelConfig.voiceprintModel
                    })
                });
                
                return {
                    similarity: response.similarity,
                    isMatch: response.is_match,
                    confidence: response.confidence
                };
            } else {
                // 演示模式 - 生成模拟结果
                console.log('使用演示模式比较声纹');
                return this._generateDemoComparisonResult(feature1, feature2);
            }
        } catch (error) {
            console.error('声纹比较失败:', error);
            throw new Error('声纹比较处理失败');
        }
    }
    
    /**
     * 执行欺骗检测（检查是否为实时语音）
     * @param {Blob} audioBlob 音频数据
     * @returns {Promise<Object>} 欺骗检测结果
     */
    async performAntiSpoofing(audioBlob) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            if (this.apiKey) {
                // 实际API调用
                const formData = new FormData();
                formData.append('audio', audioBlob);
                formData.append('model', this.modelConfig.antispoofModel);
                
                const response = await this._request('/security/antispoof', {
                    method: 'POST',
                    body: formData
                });
                
                return {
                    isLive: response.is_live,
                    score: response.liveness_score,
                    confidence: response.confidence
                };
            } else {
                // 演示模式 - 生成模拟结果
                console.log('使用演示模式进行欺骗检测');
                return {
                    isLive: true,
                    score: 0.96,
                    confidence: 0.94
                };
            }
        } catch (error) {
            console.error('欺骗检测失败:', error);
            throw new Error('欺骗检测处理失败');
        }
    }
    
    /**
     * 识别语音命令
     * @param {Blob} audioBlob 音频数据
     * @returns {Promise<Object>} 识别到的命令
     */
    async recognizeCommand(audioBlob) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            if (this.apiKey) {
                // 实际API调用
                const formData = new FormData();
                formData.append('audio', audioBlob);
                formData.append('model', this.modelConfig.commandModel);
                
                const response = await this._request('/audio/recognize', {
                    method: 'POST',
                    body: formData
                });
                
                return {
                    command: response.command,
                    action: response.action,
                    confidence: response.confidence
                };
            } else {
                // 演示模式 - 生成模拟结果（随机选择一个命令）
                console.log('使用演示模式识别命令');
                const randomCommand = this.availableCommands[
                    Math.floor(Math.random() * this.availableCommands.length)
                ];
                
                randomCommand.confidence = 0.8 + Math.random() * 0.15; // 80-95% 的置信度
                
                return {
                    command: randomCommand.name,
                    action: randomCommand.action,
                    confidence: randomCommand.confidence
                };
            }
        } catch (error) {
            console.error('命令识别失败:', error);
            throw new Error('命令识别处理失败');
        }
    }
    
    /**
     * 生成高级声纹报告
     * @param {Object} voiceprintFeatures 声纹特征
     * @returns {Promise<Object>} 详细声纹报告
     */
    async generateVoiceprintReport(voiceprintFeatures) {
        // 在实际实现中，这里应调用API生成详细报告
        return {
            uniquenessScore: 0.93,
            stabilityScore: 0.87,
            qualityMetrics: {
                clarity: 0.92,
                consistency: 0.89,
                distinctiveness: 0.91
            },
            securityLevel: 'high',
            recommendations: [
                '为提高安全性，建议录制更长的声音样本',
                '可以在不同环境下录制声音以增强识别稳定性'
            ]
        };
    }
    
    // 私有辅助方法
    
    /**
     * 发送请求到DeepSeek API
     * @private
     */
    async _request(endpoint, options = {}) {
        if (!options.headers) {
            options.headers = {};
        }
        
        if (this.apiKey) {
            options.headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        
        options.headers['Accept'] = 'application/json';
        
        if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
        
        const response = await fetch(`${this.apiEndpoint}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    /**
     * 生成演示模式的声纹特征
     * @private
     */
    _generateDemoVoiceprintFeatures(audioBlob) {
        // 生成一个模拟的128维特征向量
        const features = {
            version: '1.0',
            model: 'deepseek-audio-1.0',
            vector: Array(128).fill(0).map(() => (Math.random() * 2 - 1)),
            metadata: {
                timestamp: new Date().toISOString(),
                duration: 4.5,
                sampleRate: 16000
            }
        };
        
        return features;
    }
    
    /**
     * 生成演示模式的比较结果
     * @private
     */
    _generateDemoComparisonResult(feature1, feature2) {
        // 在演示模式下，如果有预先存储的模板，则返回高匹配度
        // 否则生成随机但偏低的相似度
        
        const hasTemplate = feature1 && feature2;
        const similarity = hasTemplate ? 0.82 + Math.random() * 0.15 : 0.3 + Math.random() * 0.4;
        
        return {
            similarity: similarity,
            isMatch: similarity >= 0.78,
            confidence: 0.9
        };
    }
}

// 导出DeepSeekAPI类
window.DeepSeekAPI = DeepSeekAPI;

/**
 * DeepSeek AI API 接口
 * 提供与DeepSeek大语言模型的交互功能
 */

// 确保DOM完全加载后初始化
window.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化DeepSeek聊天');
    initDeepSeekChat();
});

// 聊天组件初始化
function initDeepSeekChat() {
    console.log('开始初始化DeepSeek聊天组件');
    
    // 获取所有需要的DOM元素
    const chatContainer = document.getElementById('aiChatContainer');
    const chatTrigger = document.getElementById('aiChatTrigger');
    const chatClose = document.getElementById('aiChatClose');
    const chatInput = document.getElementById('aiChatInput');
    const chatSend = document.getElementById('aiChatSend');
    const chatMessages = document.getElementById('aiChatMessages');
    
    console.log('聊天容器：', chatContainer);
    console.log('聊天触发按钮：', chatTrigger);
    
    // 如果页面上没有这些元素，直接返回
    if (!chatContainer || !chatTrigger) {
        console.error('找不到聊天组件必要的DOM元素');
        return;
    }
    
    // 先确保聊天容器处于关闭状态
    chatContainer.classList.remove('open');
    
    // 打开聊天处理函数
    function openChat() {
        console.log('打开聊天对话框');
        chatContainer.classList.add('open');
        if (chatInput) chatInput.focus();
    }
    
    // 关闭聊天处理函数
    function closeChat() {
        console.log('关闭聊天对话框');
        chatContainer.classList.remove('open');
    }
    
    // 绑定点击事件 - 使用内联函数而不是引用之前声明的函数
    chatTrigger.onclick = function() {
        console.log('触发按钮被点击');
        chatContainer.classList.add('open');
        if (chatInput) chatInput.focus();
    };
    
    // 关闭按钮事件
    if (chatClose) {
        chatClose.onclick = function() {
            console.log('关闭按钮被点击');
            chatContainer.classList.remove('open');
        };
    }
    
    // 发送消息处理函数
    function sendMessage() {
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // 添加用户消息到聊天区域
        addMessage(message, 'user');
        
        // 清空输入框
        chatInput.value = '';
        
        // 显示AI正在思考的指示
        showThinking();
        
        // 模拟API调用延迟
        setTimeout(() => {
            const response = getAIResponse(message);
            
            // 移除思考指示
            removeThinking();
            
            // 添加AI回复
            addMessage(response, 'system');
            
            // 滚动到底部
            scrollToBottom();
        }, 1000);
    }
    
    // 绑定发送按钮点击事件
    if (chatSend) {
        chatSend.onclick = sendMessage;
    }
    
    // 绑定输入框回车事件
    if (chatInput) {
        chatInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };
    }
    
    // 绑定快速提问标签
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    if (suggestionTags.length > 0) {
        suggestionTags.forEach(tag => {
            tag.onclick = function() {
                if (!chatInput) return;
                
                const text = this.getAttribute('data-text');
                if (text) {
                    chatInput.value = text;
                    sendMessage();
                }
            };
        });
    }
    
    // 添加消息到聊天区域
    function addMessage(text, sender) {
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-message-content';
        
        // 将文本转换为段落
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        paragraphs.forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            contentDiv.appendChild(p);
        });
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
    }
    
    // 显示AI正在思考的指示
    function showThinking() {
        if (!chatMessages) return;
        
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'ai-message system thinking';
        thinkingDiv.innerHTML = `
            <div class="ai-message-content">
                <div class="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(thinkingDiv);
        scrollToBottom();
    }
    
    // 移除思考指示
    function removeThinking() {
        if (!chatMessages) return;
        
        const thinking = chatMessages.querySelector('.thinking');
        if (thinking) {
            thinking.remove();
        }
    }
    
    // 滚动到底部
    function scrollToBottom() {
        if (!chatMessages) return;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 模拟AI响应
    function getAIResponse(message) {
        // 简单的关键词匹配响应
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('声纹识别率') || lowerMessage.includes('提高识别')) {
            return "提高声纹识别率的几个建议：\n\n1. 在安静的环境下录制声纹模板\n2. 使用相同的设备和距离录制声纹\n3. 保持语音清晰，避免过快或过慢\n4. 录制多个声纹样本增加识别准确性\n5. 定期更新声纹模板以适应声音变化";
        }
        
        if (lowerMessage.includes('安全性') || lowerMessage.includes('防欺骗')) {
            return "声纹验证系统采用了多层安全保障：\n\n1. DeepSeek AI活体检测技术能识别录音回放\n2. 99.9%的声纹匹配准确率大幅降低误识别风险\n3. 可选的多因素认证（声纹+密码）\n4. 异常登录检测和警报系统\n5. 所有声纹数据都经过加密存储";
        }
        
        if (lowerMessage.includes('添加') && lowerMessage.includes('车辆')) {
            return "添加新车辆的步骤：\n\n1. 在主菜单中点击"我的车辆"\n2. 点击"+"按钮添加新车辆\n3. 输入车辆信息（品牌、型号、车牌号等）\n4. 扫描车辆的智能接入设备配对码\n5. 设置车辆权限和操作选项\n6. 完成配对后，进行声纹验证测试";
        }
        
        if (lowerMessage.includes('功能') || lowerMessage.includes('什么')) {
            return "声纹通系统主要功能包括：\n\n1. 声纹识别解锁车门\n2. 支持多种语音指令控制车辆\n3. 多用户与权限管理\n4. 安全日志和使用记录\n5. 活体检测防欺骗\n6. 车辆状态远程查看\n7. 个性化设置与偏好";
        }
        
        if (lowerMessage.includes('语音指令') || lowerMessage.includes('命令')) {
            return "系统支持的语音指令包括：\n\n• "打开车门" - 解锁车门\n• "关闭车门" - 锁定车门\n• "打开后备箱" - 打开后备箱\n• "启动发动机" - 远程启动发动机\n• "关闭发动机" - 关闭发动机\n• "打开车窗" - 打开车窗\n• "关闭车窗" - 关闭车窗\n• "打开空调" - 开启空调系统";
        }
        
        // 默认回复
        return "感谢您的提问。我是您的DeepSeek AI助手，可以回答关于声纹验证系统的各种问题。您可以询问关于系统功能、声纹技术、安全性或使用方法等方面的问题。";
    }
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
    .thinking-dots {
        display: flex;
        gap: 4px;
        padding: 10px 0;
    }
    
    .thinking-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4fbea0;
        animation: thinking 1.4s infinite ease-in-out both;
    }
    
    .thinking-dots span:nth-child(1) {
        animation-delay: 0s;
    }
    
    .thinking-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .thinking-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes thinking {
        0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
    `;
    document.head.appendChild(style);
    
    console.log('DeepSeek聊天组件初始化完成');
} 