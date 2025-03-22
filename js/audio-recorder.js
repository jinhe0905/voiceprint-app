/**
 * AudioRecorder类 - 负责处理音频录制和可视化
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
    }

    /**
     * 初始化录音设备
     */
    async init() {
        try {
            // 请求麦克风访问权限
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 设置音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建分析器节点用于可视化
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            
            // 连接音频源到分析器
            const source = this.audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);
            
            // 设置媒体录制器
            this.mediaRecorder = new MediaRecorder(this.stream);
            
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
     * 开始录制音频
     */
    startRecording() {
        if (!this.mediaRecorder) return false;
        
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
        
        // 如果有可视化画布，开始绘制
        if (this.canvasContext) {
            this.visualize();
        }
        
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
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.isRecording = false;
                resolve(audioBlob);
            };
            
            this.mediaRecorder.stop();
        });
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
            
            this.canvasContext.fillStyle = '#f2f2f7';
            this.canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
            
            this.canvasContext.lineWidth = 2;
            this.canvasContext.strokeStyle = '#0071e3';
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
     * 释放资源
     */
    release() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.stream = null;
        this.mediaRecorder = null;
        this.audioContext = null;
        this.analyser = null;
    }
} 