// 音效管理器
class AudioManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            // 创建音频上下文（需要用户交互后才能启用）
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API 不支持');
        }
    }

    // 恢复音频上下文（某些浏览器需要用户交互）
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // 播放选中音效 - 轻快的点击声
    playSelect() {
        if (!this.enabled || !this.audioContext) return;
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 可爱的高音点击
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.08);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.08);
    }

    // 播放消除音效 - 可爱的叮咚声
    playMatch() {
        if (!this.enabled || !this.audioContext) return;
        this.resumeAudioContext();
        
        // 播放可爱的双音叮咚声
        const notes = [1047, 1319, 1568]; // 高音 C-E-G
        const duration = 0.12;
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = this.audioContext.currentTime + (index * 0.08);
            gainNode.gain.setValueAtTime(0.15, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    }
    
    // 播放提示音效
    playHint() {
        if (!this.enabled || !this.audioContext) return;
        this.resumeAudioContext();
        
        // 播放两个上升音调
        const notes = [659, 880]; // E-A
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = this.audioContext.currentTime + (index * 0.15);
            gainNode.gain.setValueAtTime(0.1, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        });
    }

    // 播放无效移动音效
    playInvalid() {
        if (!this.enabled || !this.audioContext) return;
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    // 播放胜利音效 - 欢快的旋律
    playWin() {
        if (!this.enabled || !this.audioContext) return;
        this.resumeAudioContext();
        
        // 欢快的上升旋律
        const notes = [523, 659, 784, 1047, 1319, 1568, 2093]; // C-E-G-C-E-G-C (更高)
        const duration = 0.12;
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = this.audioContext.currentTime + (index * 0.1);
            gainNode.gain.setValueAtTime(0.15, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration + 0.1);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration + 0.1);
        });
    }

    // 播放失败音效
    playLose() {
        if (!this.enabled || !this.audioContext) return;
        this.resumeAudioContext();
        
        const notes = [392, 349.23, 293.66]; // G-F-D
        const duration = 0.2;
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = this.audioContext.currentTime + (index * duration);
            gainNode.gain.setValueAtTime(0.15, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    }

    // 播放下落音效 - 轻柔的落下声
    playDrop() {
        if (!this.enabled || !this.audioContext) return;
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // 柔和的下落音
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.15);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    // 切换音效开关
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // 设置音效开关
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // 获取当前状态
    isEnabled() {
        return this.enabled;
    }
}

// 导出单例
const audioManager = new AudioManager();

