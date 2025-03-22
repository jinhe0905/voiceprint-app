/**
 * VoiceprintAnalyzer类 - 处理声纹特征提取和匹配
 * 
 * 集成DeepSeek AI提供高级声纹分析能力
 */
class VoiceprintAnalyzer {
    constructor() {
        // 存储已注册的声纹模板
        this.voiceprintTemplate = null;
        // 音频上下文用于分析
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 初始化DeepSeek API
        this.deepseekApi = new DeepSeekAPI({
            // 在实际应用中，应从安全的配置源获取API密钥
            apiKey: null // 演示模式
        });
        
        // 初始化
        this.initialize();
        
        // 活体检测和命令识别结果
        this.lastAntispoofResult = null;
        this.lastCommandResult = null;
        
        // 声纹报告
        this.voiceprintReport = null;
    }
    
    /**
     * 初始化系统
     */
    async initialize() {
        try {
            // 初始化DeepSeek API连接
            await this.deepseekApi.initialize();
            
            // 从localStorage加载声纹模板
            this.loadTemplate();
            
            return true;
        } catch (error) {
            console.error('声纹分析器初始化失败:', error);
            return false;
        }
    }

    /**
     * 从音频数据创建声纹模板
     * @param {Blob} audioBlob - 录制的音频数据
     * @returns {Promise<object>} 提取的声纹特征
     */
    async createVoiceprintTemplate(audioBlob) {
        try {
            // 使用DeepSeek API分析声纹
            const features = await this.deepseekApi.analyzeVoiceprint(audioBlob);
            
            // 存储声纹模板供将来比较
            this.voiceprintTemplate = features;
            
            // 生成声纹报告
            this.voiceprintReport = await this.deepseekApi.generateVoiceprintReport(features);
            
            return features;
        } catch (error) {
            console.error('创建声纹模板失败:', error);
            throw error;
        }
    }

    /**
     * 将音频Blob转换为AudioBuffer以进行处理
     * @param {Blob} blob - 音频数据
     * @returns {Promise<AudioBuffer>} 音频缓冲区
     */
    async blobToAudioBuffer(blob) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                    resolve(audioBuffer);
                } catch (error) {
                    reject(error);
                }
            };
            
            fileReader.onerror = reject;
            fileReader.readAsArrayBuffer(blob);
        });
    }

    /**
     * 匹配声纹，比较与存储的模板的相似度
     * @param {Blob} audioBlob - 要验证的音频
     * @returns {Promise<object>} 匹配结果和相似度分数
     */
    async matchVoiceprint(audioBlob) {
        if (!this.voiceprintTemplate) {
            throw new Error('没有保存的声纹模板可供比较');
        }
        
        try {
            // 首先执行活体检测
            this.lastAntispoofResult = await this.deepseekApi.performAntiSpoofing(audioBlob);
            
            // 如果不是活体声音，拒绝验证
            if (!this.lastAntispoofResult.isLive) {
                return {
                    isMatch: false,
                    similarityScore: 0,
                    reason: 'anti_spoofing_failed',
                    message: '检测到非实时声音，可能是录音回放',
                    antispoof: this.lastAntispoofResult
                };
            }
            
            // 尝试识别语音命令
            this.lastCommandResult = await this.deepseekApi.recognizeCommand(audioBlob);
            
            // 提取声纹特征
            const features = await this.deepseekApi.analyzeVoiceprint(audioBlob);
            
            // 比较与模板的相似度
            const comparisonResult = await this.deepseekApi.compareVoiceprints(
                features, 
                this.voiceprintTemplate
            );
            
            // 构建结果对象
            return {
                isMatch: comparisonResult.isMatch,
                similarityScore: comparisonResult.similarity,
                threshold: 0.78, // 可根据需要调整
                confidence: comparisonResult.confidence,
                recognizedCommand: this.lastCommandResult,
                antispoof: this.lastAntispoofResult
            };
        } catch (error) {
            console.error('声纹匹配失败:', error);
            throw error;
        }
    }

    /**
     * 保存声纹模板到localStorage
     */
    saveTemplate() {
        if (this.voiceprintTemplate) {
            localStorage.setItem('voiceprintTemplate', JSON.stringify(this.voiceprintTemplate));
            
            // 保存声纹报告
            if (this.voiceprintReport) {
                localStorage.setItem('voiceprintReport', JSON.stringify(this.voiceprintReport));
            }
            
            return true;
        }
        return false;
    }

    /**
     * 从localStorage加载声纹模板
     */
    loadTemplate() {
        const saved = localStorage.getItem('voiceprintTemplate');
        if (saved) {
            this.voiceprintTemplate = JSON.parse(saved);
            
            // 加载声纹报告
            const savedReport = localStorage.getItem('voiceprintReport');
            if (savedReport) {
                this.voiceprintReport = JSON.parse(savedReport);
            }
            
            return true;
        }
        return false;
    }

    /**
     * 清除存储的声纹模板
     */
    clearTemplate() {
        this.voiceprintTemplate = null;
        this.voiceprintReport = null;
        localStorage.removeItem('voiceprintTemplate');
        localStorage.removeItem('voiceprintReport');
    }
    
    /**
     * 获取声纹报告
     */
    getVoiceprintReport() {
        return this.voiceprintReport;
    }
    
    /**
     * 获取最后识别的命令
     */
    getLastRecognizedCommand() {
        return this.lastCommandResult;
    }
    
    /**
     * 获取最后的活体检测结果
     */
    getLastAntispoofResult() {
        return this.lastAntispoofResult;
    }
} 