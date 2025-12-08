// 音效管理器
class AudioManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.synth = window.speechSynthesis;
        this.voiceAudios = {};
        this.initAudioContext();
        this.initVoiceAudios();
    }

    initAudioContext() {
        try {
            // 创建音频上下文（需要用户交互后才能启用）
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API 不支持');
        }
    }

    // 初始化语音音效
    initVoiceAudios() {
        // 使用时间戳强制刷新缓存
        const cacheBreaker = Date.now();
        
        // 背景音乐
        this.backgroundMusic = new Audio('sounds/0-background.mp3?t=' + cacheBreaker);
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.loop = true;  // 循环播放
        this.backgroundMusic.preload = 'auto';  // 预加载
        this.hasBackgroundMusic = false;
        this.backgroundMusicStarted = false;  // 跟踪是否已启动
        
        this.backgroundMusic.addEventListener('canplaythrough', () => {
            this.hasBackgroundMusic = true;
            console.log('✓ 已加载背景音乐');
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.log('✗ 背景音乐加载失败', e);
        });
        
        // 强制加载
        this.backgroundMusic.load();
        
        // Excellent 音效（match时）
        this.excellentAudio = new Audio('sounds/1-excellent.mp3?t=' + cacheBreaker);
        this.excellentAudio.volume = 0.8;
        this.hasExcellentAudio = false;
        
        this.excellentAudio.addEventListener('canplaythrough', () => {
            this.hasExcellentAudio = true;
            console.log('✓ 已加载 Excellent 音效');
        });
        this.excellentAudio.addEventListener('error', () => {
            this.hasExcellentAudio = false;
            console.log('ℹ Excellent 音效未找到，使用合成音效');
        });
        
        // Unbelievable 音效（达成目标时）
        this.unbelievableAudio = new Audio('sounds/2-unbelievable.mp3?t=' + cacheBreaker);
        this.unbelievableAudio.volume = 0.8;
        this.hasUnbelievableAudio = false;
        
        this.unbelievableAudio.addEventListener('canplaythrough', () => {
            this.hasUnbelievableAudio = true;
            console.log('✓ 已加载 Unbelievable 音效');
        });
        
        // 福利时间音效
        this.fuliTimeAudio = new Audio('sounds/3-fuli-time.mp3?t=' + cacheBreaker);
        this.fuliTimeAudio.volume = 0.4;
        this.hasFuliTimeAudio = false;
        
        this.fuliTimeAudio.addEventListener('canplaythrough', () => {
            this.hasFuliTimeAudio = true;
            console.log('✓ 已加载福利时间音效');
        });
        
        // 备用：创建自定义可爱音效
        this.createCuteExcellentSound();
        
        // iOS 需要用户交互后才能加载音频
        this.audioLoaded = false;
    }
    
    // 强制加载所有音频（在用户交互时调用）
    forceLoadAllAudios() {
        if (this.audioLoaded) return;
        this.audioLoaded = true;
        
        console.log('📱 iOS: 强制加载所有音频...');
        
        // 强制加载所有音频文件
        [this.excellentAudio, this.unbelievableAudio, this.fuliTimeAudio].forEach(audio => {
            if (audio) {
                audio.load();
                // iOS 需要播放一下才能加载
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }).catch(() => {
                    // 忽略播放失败
                });
            }
        });
    }

    // 播放背景音乐
    playBackgroundMusic() {
        if (!this.enabled) return;
        
        // iOS: 用户交互时强制加载所有音频
        this.forceLoadAllAudios();
        
        if (this.backgroundMusicStarted && !this.backgroundMusic.paused) return; // 已在播放

        // 尝试播放，不管是否已加载完成
        const playPromise = this.backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.backgroundMusicStarted = true;
                console.log('▶ 背景音乐开始播放');
            }).catch((error) => {
                console.log('背景音乐播放失败:', error.message);
                // 如果失败，稍后重试
                setTimeout(() => {
                    if (this.enabled && !this.backgroundMusicStarted) {
                        this.backgroundMusic.play().catch(() => {});
                    }
                }, 1000);
            });
        }
    }

    // 暂停背景音乐
    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    // 恢复背景音乐
    resumeBackgroundMusic() {
        if (!this.enabled) return;
        if (this.backgroundMusic && this.backgroundMusic.paused && this.backgroundMusicStarted) {
            this.backgroundMusic.play().catch(() => {});
        }
    }

    // 停止背景音乐
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusicStarted = false;
        }
    }

    // 播放福利时间音效
    playFuliTime() {
        if (!this.enabled) return;
        
        if (this.hasFuliTimeAudio) {
            this.fuliTimeAudio.currentTime = 0;
            this.fuliTimeAudio.play().catch(() => {});
        } else {
            // 备用音效
            this.playCuteSynthSound();
        }
    }

    // 创建可爱的 Excellent 合成音效（作为备用）
    createCuteExcellentSound() {
        // 预加载合成音效参数
        this.cuteNotes = [
            { freq: 880, duration: 0.1 },   // A5
            { freq: 1108, duration: 0.1 },  // C#6
            { freq: 1318, duration: 0.15 }, // E6
            { freq: 1760, duration: 0.2 },  // A6
        ];
    }

    // 播放可爱的合成音效
    playCuteSynthSound() {
        if (!this.audioContext) return;
        this.resumeAudioContext();
        
        this.cuteNotes.forEach((note, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = note.freq;
            oscillator.type = 'sine';
            
            const startTime = this.audioContext.currentTime + (index * 0.12);
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + note.duration);
        });
    }

    // 播放可爱的语音（使用TTS作为备用）
    playVoice(text, pitch = 1.5, rate = 1.0) {
        if (!this.enabled || !this.synth) return;
        
        // 取消之前的语音
        this.synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = Math.min(pitch, 2);
        utterance.rate = rate;
        utterance.volume = 1.0;
        
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes('Samantha') ||
            v.name.includes('Princess') ||
            v.name.includes('Junior')
        ) || voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        this.synth.speak(utterance);
    }

    // 播放 Excellent 音效（match时）- 可爱小孩声音
    playExcellent() {
        if (!this.enabled) return;
        
        // 优先使用本地音效文件
        if (this.hasExcellentAudio) {
            this.excellentAudio.currentTime = 0;
            this.excellentAudio.play().catch(() => {});
        } else {
            // 备用：合成音效 + TTS
            this.playCuteSynthSound();
            setTimeout(() => {
                this.playVoice('Excellent!', 2.0, 1.3);
            }, 200);
        }
    }

    // 播放 Unbelievable 语音（胜利时）
    playUnbelievable() {
        if (!this.enabled) return;
        
        // 优先使用本地音效文件
        if (this.hasUnbelievableAudio) {
            this.unbelievableAudio.currentTime = 0;
            this.unbelievableAudio.play().catch(() => {});
        } else {
            // 备用：合成音效 + TTS
            this.playCuteSynthSound();
            setTimeout(() => {
                this.playVoice('Unbelievable!', 2.0, 1.0);
            }, 400);
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

// 调试功能
document.addEventListener('DOMContentLoaded', () => {
    const debugBtn = document.getElementById('debugBtn');
    const debugInfo = document.getElementById('debugInfo');
    
    if (debugBtn && debugInfo) {
        debugBtn.addEventListener('click', () => {
            const info = [
                '=== 音效加载状态 ===',
                '背景音乐: ' + (audioManager.hasBackgroundMusic ? '✅ 已加载' : '❌ 未加载'),
                'Excellent: ' + (audioManager.hasExcellentAudio ? '✅ 已加载' : '❌ 未加载'),
                'Unbelievable: ' + (audioManager.hasUnbelievableAudio ? '✅ 已加载' : '❌ 未加载'),
                '福利时间: ' + (audioManager.hasFuliTimeAudio ? '✅ 已加载' : '❌ 未加载'),
                '',
                '=== 音频文件信息 ===',
                'Excellent src: ' + (audioManager.excellentAudio ? audioManager.excellentAudio.src : 'N/A'),
                'Excellent readyState: ' + (audioManager.excellentAudio ? audioManager.excellentAudio.readyState : 'N/A'),
                '',
                '=== 浏览器信息 ===',
                'UserAgent: ' + navigator.userAgent.substring(0, 80) + '...'
            ];
            
            debugInfo.innerHTML = info.join('<br>');
            debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
        });
    }
});

