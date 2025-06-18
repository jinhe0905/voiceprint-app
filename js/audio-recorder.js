/**
 * AudioRecorder类 - 负责处理音频录制和可视化
 * 增强版 - 提供更专业的录音体验和音频处理功能
 */
class AudioRecorder {
    constructor(visualizerCanvas) {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.stream = null;
        this.audioChunks = [];
        this.analyser = null;
        this.visualizerCanvas = visualizerCanvas;
        this.canvasContext = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;
        this.isRecording = false;
        this.audioProcessor = null;
        this.recordingStartTime = null;
        this.recordingDuration = 0;
        this.maxRecordingTime = 30000; // 最大录音时长（毫秒）
        this.minRecordingTime = 2000;  // 最小录音时长（毫秒）
        this.recordingTimer = null;
        this.audioLevel = 0;
        this.onAudioLevelUpdate = null;
        this.onRecordingTimeUpdate = null;
        this.onMaxDurationReached = null;
    }

    /**
     * 初始化录音设备
     */
    async init() {
        try {
            // 请求麦克风访问权限
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            // 设置音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 44100,
                latencyHint: 'interactive'
            });
            
            // 创建分析器节点用于可视化
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // 连接音频源到分析器
            const source = this.audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);
            
            // 创建音频处理节点用于监测音量
            this.audioProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
            this.analyser.connect(this.audioProcessor);
            this.audioProcessor.connect(this.audioContext.destination);
            
            // 监测音频电平
            this.audioProcessor.onaudioprocess = (e) => {
                const input = e.inputBuffer.getChannelData(0);
                let sum = 0;
                
                // 计算音频电平
                for (let i = 0; i < input.length; i++) {
                    sum += input[i] * input[i];
                }
                
                this.audioLevel = Math.sqrt(sum / input.length);
                
                // 回调函数通知音频电平更新
                if (this.onAudioLevelUpdate) {
                    this.onAudioLevelUpdate(this.audioLevel);
                }
            };
            
            // 设置媒体录制器
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: this.getSupportedMimeType(),
                audioBitsPerSecond: 128000
            });
            
            // 处理录制的数据
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            return true;
        } catch (error) {
            console.error('初始化麦克风失败:', error);
            return false;
        }
    }

    /**
     * 获取支持的音频MIME类型
     */
    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
            'audio/mpeg',
            'audio/wav'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return '';
    }

    /**
     * 开始录制音频
     */
    startRecording() {
        if (!this.mediaRecorder) return false;
        
        this.audioChunks = [];
        this.recordingStartTime = Date.now();
        this.recordingDuration = 0;
        
        // 开始录制
        this.mediaRecorder.start(100); // 每100ms触发一次dataavailable事件
        this.isRecording = true;
        
        // 如果有可视化画布，开始绘制
        if (this.canvasContext) {
            this.visualize();
        }
        
        // 启动录音计时器
        this.recordingTimer = setInterval(() => {
            this.recordingDuration = Date.now() - this.recordingStartTime;
            
            // 回调函数通知录音时间更新
            if (this.onRecordingTimeUpdate) {
                this.onRecordingTimeUpdate(this.recordingDuration);
            }
            
            // 检查是否达到最大录音时长
            if (this.recordingDuration >= this.maxRecordingTime) {
                if (this.onMaxDurationReached) {
                    this.onMaxDurationReached();
                }
                this.stopRecording();
            }
        }, 100);
        
        return true;
    }

    /**
     * 停止录制音频
     */
    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || !this.isRecording) {
                resolve(null);
                return;
            }
            
            // 清除计时器
            if (this.recordingTimer) {
                clearInterval(this.recordingTimer);
                this.recordingTimer = null;
            }
            
            // 检查最小录音时长
            const currentDuration = Date.now() - this.recordingStartTime;
            if (currentDuration < this.minRecordingTime) {
                setTimeout(() => {
                    this._finalizeRecording(resolve);
                }, this.minRecordingTime - currentDuration);
            } else {
                this._finalizeRecording(resolve);
            }
        });
    }
    
    /**
     * 完成录音过程
     */
    _finalizeRecording(resolve) {
        this.mediaRecorder.onstop = () => {
            // 根据支持的MIME类型创建音频Blob
            const mimeType = this.getSupportedMimeType() || 'audio/wav';
            const audioBlob = new Blob(this.audioChunks, { type: mimeType });
            
            // 创建音频URL
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 创建音频元素用于播放
            const audio = new Audio(audioUrl);
            
            this.isRecording = false;
            resolve({
                blob: audioBlob,
                url: audioUrl,
                audio: audio,
                duration: this.recordingDuration,
                play: () => audio.play(),
                stop: () => {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        };
        
        this.mediaRecorder.stop();
    }

    /**
     * 可视化音频输入
     */
    visualize() {
        if (!this.canvasContext || !this.analyser) return;
        
        const WIDTH = this.visualizerCanvas.width;
        const HEIGHT = this.visualizerCanvas.height;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
        
        const draw = () => {
            if (!this.isRecording) return;
            
            requestAnimationFrame(draw);
            
            this.analyser.getByteTimeDomainData(dataArray);
            
            this.canvasContext.fillStyle = '#000000';
            this.canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
            
            this.canvasContext.lineWidth = 2;
            this.canvasContext.strokeStyle = '#1890ff';
            this.canvasContext.beginPath();
            
            const sliceWidth = WIDTH / bufferLength;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * HEIGHT / 2;
                
                if (i === 0) {
                    this.canvasContext.moveTo(x, y);
                } else {
                    this.canvasContext.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            this.canvasContext.lineTo(WIDTH, HEIGHT / 2);
            this.canvasContext.stroke();
        };
        
        draw();
    }

    /**
     * 获取当前音频电平（0-1）
     */
    getAudioLevel() {
        return this.audioLevel;
    }
    
    /**
     * 获取当前录音时长（毫秒）
     */
    getRecordingDuration() {
        return this.recordingDuration;
    }
    
    /**
     * 设置最大录音时长（毫秒）
     */
    setMaxRecordingTime(maxTime) {
        this.maxRecordingTime = maxTime;
    }
    
    /**
     * 设置最小录音时长（毫秒）
     */
    setMinRecordingTime(minTime) {
        this.minRecordingTime = minTime;
    }

    /**
     * 释放资源
     */
    release() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
        
        if (this.audioProcessor) {
            this.audioProcessor.disconnect();
            this.audioProcessor = null;
        }
        
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.stream = null;
        this.mediaRecorder = null;
        this.audioContext = null;
    }
} 