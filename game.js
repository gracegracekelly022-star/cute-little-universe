// 游戏配置
const CONFIG = {
    BOARD_SIZE: 6,
    GHOST_TYPES: ['👻', '👹', '👺', '🤡', '🎃', '😈'],
    INITIAL_MOVES: 25,
    TOTAL_LEVELS: 3,
    LEVEL_TARGETS: [520, 520, 520], // 每关目标分数
    MATCH_MIN: 3,
    ANIMATION_DURATION: 300
};

// 游戏模式
const THEMES = {
    spongebob: {
        name: '海绵宝宝',
        icon: '🧽',
        types: [], // 动态填充
        isImage: true,
        folder: 'spongebob',
        pool: 'SPONGEBOB_POOL',
        fallbackEmoji: ['🧽', '⭐', '🦑', '🦀', '🐿️', '👻']
    },
    moon: {
        name: '月亮模式',
        icon: '🌙',
        types: [], // 动态填充
        isImage: true,
        folder: 'moon',
        pool: 'IMAGE_POOL',
        fallbackEmoji: ['🌙', '⭐', '🌟', '✨', '💫', '🌠']
    }
};

// 从图片池中随机选择6张图片
function selectRandomImages(themeName) {
    const theme = THEMES[themeName];
    const poolName = theme.pool;
    const folder = theme.folder;
    
    // 获取对应的图片池
    const pool = window[poolName];
    
    // 检查图片池是否存在且有图片
    if (!pool || pool.length === 0) {
        console.warn(`${poolName} 未定义或为空，使用emoji作为备用`);
        return { useEmoji: true, types: theme.fallbackEmoji };
    }
    
    // 复制数组并打乱顺序
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    
    // 取前6张（如果不足6张则全部使用，循环补齐）
    const selected = [];
    for (let i = 0; i < 6; i++) {
        selected.push(folder + '/' + shuffled[i % shuffled.length]);
    }
    
    return { useEmoji: false, types: selected };
}

// 主题管理器
class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
    }

    loadTheme() {
        try {
            const saved = localStorage.getItem('ghostTheme');
            // 兼容旧的主题名
            if (saved === 'emoji' || saved === 'ghost') return 'spongebob';
            if (saved === 'preset') return 'moon';
            return saved || 'spongebob';
        } catch (e) {
            return 'spongebob';
        }
    }

    saveTheme(theme) {
        this.currentTheme = theme;
        try {
            localStorage.setItem('ghostTheme', theme);
        } catch (e) {
            console.warn('无法保存主题设置');
        }
    }

    // 获取当前主题的显示内容
    getDisplay(typeIndex) {
        const theme = THEMES[this.currentTheme];
        const type = theme.types[typeIndex];
        
        // 检查是否使用emoji模式（图片池为空时的备用）
        if (this.useEmoji) {
            return { type: 'emoji', content: type };
        }
        return { type: 'image', content: type };
    }

    // 获取类型索引
    getTypeIndex(ghostType) {
        const theme = THEMES[this.currentTheme];
        return theme.types.indexOf(ghostType);
    }

    // 获取当前主题的类型列表
    getCurrentTypes() {
        return THEMES[this.currentTheme].types;
    }
}

const themeManager = new ThemeManager();

// 游戏状态
class Game {
    constructor() {
        this.board = [];
        this.score = 0;
        this.moves = CONFIG.INITIAL_MOVES;
        this.target = CONFIG.TARGET_SCORE;
        this.selectedCell = null;
        this.isAnimating = false;
        this.gameOver = false;
        
        this.initElements();
        this.initGame();
        this.bindEvents();
    }

    initElements() {
        this.boardElement = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.movesElement = document.getElementById('moves');
        this.targetElement = document.getElementById('target');
        this.modal = document.getElementById('gameOverModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.finalScoreElement = document.getElementById('finalScore');
    }

    initGame() {
        this.score = 0;
        this.moves = CONFIG.INITIAL_MOVES;
        this.level = 1;
        this.target = CONFIG.LEVEL_TARGETS[0];
        this.gameOver = false;
        this.selectedCell = null;
        
        // 每次新游戏随机选择6张图片
        const result = selectRandomImages(themeManager.currentTheme);
        THEMES[themeManager.currentTheme].types = result.types;
        themeManager.useEmoji = result.useEmoji;
        
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        this.modal.classList.remove('show');
        
        // 重置胜利弹窗状态
        const winStage1 = document.getElementById('winStage1');
        const winStage2 = document.getElementById('winStage2');
        if (winStage1) {
            winStage1.style.display = 'block';
            winStage1.classList.remove('stage-fade-out');
            winStage1.querySelector('.stars-overlay')?.remove();
        }
        if (winStage2) {
            winStage2.style.display = 'none';
            winStage2.classList.remove('stage-fade-in');
            winStage2.querySelector('.stars-overlay')?.remove();
        }
        
        // 恢复背景音乐（如果之前暂停了）
        audioManager.resumeBackgroundMusic();
    }

    // 进入下一关
    nextLevel() {
        this.level++;
        this.score = 0;
        this.target = CONFIG.LEVEL_TARGETS[this.level - 1];
        this.selectedCell = null;
        
        // 重新生成棋盘
        const result = selectRandomImages(themeManager.currentTheme);
        THEMES[themeManager.currentTheme].types = result.types;
        themeManager.useEmoji = result.useEmoji;
        
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        
        // 显示下一关提示
        this.showLevelNotice();
    }

    // 显示关卡提示
    showLevelNotice() {
        const notice = document.createElement('div');
        notice.className = 'level-notice';
        notice.innerHTML = `<span>🎯 第 ${this.level} 关</span>`;
        document.body.appendChild(notice);
        
        setTimeout(() => {
            notice.classList.add('fade-out');
            setTimeout(() => notice.remove(), 500);
        }, 1500);
    }

    createBoard() {
        // 创建初始棋盘
        this.board = [];
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            this.board[row] = [];
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                this.board[row][col] = this.randomGhost();
            }
        }

        // 确保初始棋盘没有匹配
        while (this.hasMatches()) {
            for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
                for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                    if (this.isPartOfMatch(row, col)) {
                        this.board[row][col] = this.randomGhost();
                    }
                }
            }
        }
    }

    randomGhost() {
        const types = themeManager.getCurrentTypes();
        return types[Math.floor(Math.random() * types.length)];
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                const ghostType = this.board[row][col];
                const typeIndex = themeManager.getTypeIndex(ghostType);
                const display = themeManager.getDisplay(typeIndex);
                
                if (display.type === 'image') {
                    const img = document.createElement('img');
                    img.src = display.content;
                    img.alt = ghostType;
                    img.draggable = false;
                    img.onerror = () => {
                        // 图片加载失败时显示emoji
                        cell.innerHTML = '';
                        cell.textContent = CONFIG.GHOST_TYPES[typeIndex] || '❓';
                    };
                    cell.appendChild(img);
                } else {
                    cell.textContent = display.content;
                }
                
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.ghost = ghostType;
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        document.getElementById('newGameBtn').addEventListener('click', () => this.initGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('restartBtn').addEventListener('click', () => this.initGame());
        document.getElementById('restartBtnLose').addEventListener('click', () => this.initGame());
        
        // 分享按钮
        document.getElementById('shareBtn').addEventListener('click', () => this.shareGame());
        
        // 音效按钮
        const audioBtn = document.getElementById('audioBtn');
        audioBtn.addEventListener('click', () => {
            const enabled = audioManager.toggle();
            audioBtn.textContent = enabled ? '🔊' : '🔇';
            audioBtn.classList.toggle('muted', !enabled);
            if (enabled) {
                audioManager.playSelect();
                audioManager.playBackgroundMusic();
            } else {
                audioManager.pauseBackgroundMusic();
            }
        });

        // 用户交互时尝试启动背景音乐（浏览器安全策略要求）
        const tryPlayBackgroundMusic = () => {
            audioManager.playBackgroundMusic();
        };
        
        // 监听多种用户交互事件来启动背景音乐
        document.addEventListener('click', tryPlayBackgroundMusic);
        document.addEventListener('touchstart', tryPlayBackgroundMusic);
        document.addEventListener('keydown', tryPlayBackgroundMusic, { once: true });

        // 模式切换按钮
        this.initModeToggle();
    }

    initModeToggle() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        
        // 更新按钮状态
        const updateModeButtons = () => {
            modeButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === themeManager.currentTheme);
            });
        };
        
        // 初始化按钮状态
        updateModeButtons();
        
        // 点击选择模式
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newTheme = btn.dataset.mode;
                if (newTheme === themeManager.currentTheme) return; // 已经是当前模式
                
                themeManager.saveTheme(newTheme);
                updateModeButtons();
                
                // 重新开始游戏
                this.initGame();
                
                // 播放音效
                audioManager.playSelect();
            });
        });
    }

    handleCellClick(e) {
        if (this.isAnimating || this.gameOver) return;
        
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.selectedCell === null) {
            // 第一次选择
            this.selectedCell = { row, col, element: cell };
            cell.classList.add('selected');
            audioManager.playSelect();
        } else {
            // 第二次选择
            const { row: selectedRow, col: selectedCol, element: selectedElement } = this.selectedCell;
            
            // 检查是否点击同一个格子
            if (row === selectedRow && col === selectedCol) {
                selectedElement.classList.remove('selected');
                this.selectedCell = null;
                return;
            }

            // 检查是否相邻
            if (this.isAdjacent(selectedRow, selectedCol, row, col)) {
                this.swapCells(selectedRow, selectedCol, row, col);
            } else {
                // 不相邻，重新选择
                selectedElement.classList.remove('selected');
                this.selectedCell = { row, col, element: cell };
                cell.classList.add('selected');
                audioManager.playSelect();
            }
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    async swapCells(row1, col1, row2, col2) {
        this.isAnimating = true;

        // 交换数据
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;

        // 更新显示
        this.renderBoard();

        // 检查是否有匹配
        if (this.hasMatches()) {
            // 有效移动
            this.updateUI();
            
            // 清除选择状态
            if (this.selectedCell) {
                this.selectedCell.element.classList.remove('selected');
                this.selectedCell = null;
            }

            // 处理匹配和下落
            await this.processMatches();
            
            // 检查是否有可能的移动，没有则洗牌
            if (!this.hasPossibleMoves() && !this.gameOver) {
                await this.delay(300);
                this.shuffleBoard();
            }
            
            this.isAnimating = false;
            
            // 检查游戏是否结束
            this.checkGameOver();
        } else {
            // 无效移动，交换回来
            audioManager.playInvalid();
            setTimeout(() => {
                const temp = this.board[row1][col1];
                this.board[row1][col1] = this.board[row2][col2];
                this.board[row2][col2] = temp;
                this.renderBoard();
                
                // 添加无效动画
                const cells = this.boardElement.querySelectorAll('.cell');
                cells[row1 * CONFIG.BOARD_SIZE + col1].classList.add('invalid');
                cells[row2 * CONFIG.BOARD_SIZE + col2].classList.add('invalid');
                
                setTimeout(() => {
                    if (this.selectedCell) {
                        this.selectedCell.element.classList.remove('selected');
                        this.selectedCell = null;
                    }
                    this.isAnimating = false;
                }, 300);
            }, 300);
        }
    }

    hasMatches() {
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                if (this.isPartOfMatch(row, col)) {
                    return true;
                }
            }
        }
        return false;
    }

    isPartOfMatch(row, col) {
        const ghost = this.board[row][col];
        
        // 检查水平匹配
        let horizontalCount = 1;
        // 向左
        for (let c = col - 1; c >= 0 && this.board[row][c] === ghost; c--) {
            horizontalCount++;
        }
        // 向右
        for (let c = col + 1; c < CONFIG.BOARD_SIZE && this.board[row][c] === ghost; c++) {
            horizontalCount++;
        }
        
        if (horizontalCount >= CONFIG.MATCH_MIN) return true;

        // 检查垂直匹配
        let verticalCount = 1;
        // 向上
        for (let r = row - 1; r >= 0 && this.board[r][col] === ghost; r--) {
            verticalCount++;
        }
        // 向下
        for (let r = row + 1; r < CONFIG.BOARD_SIZE && this.board[r][col] === ghost; r++) {
            verticalCount++;
        }
        
        return verticalCount >= CONFIG.MATCH_MIN;
    }

    async processMatches() {
        let hasMatch = true;
        
        while (hasMatch) {
            const matches = this.findAllMatches();
            
            if (matches.length === 0) {
                hasMatch = false;
                break;
            }

            // 标记匹配的格子
            matches.forEach(({ row, col }) => {
                const index = row * CONFIG.BOARD_SIZE + col;
                const cell = this.boardElement.children[index];
                if (cell) {
                    cell.classList.add('matched');
                    this.createParticles(cell);
                }
            });
            
            // 播放消除音效
            audioManager.playMatch();
            
            // 播放可爱的语音称赞
            audioManager.playExcellent();

            // 计算得分 - 每次消除固定50分
            this.score += 50;
            this.updateUI();

            // 等待动画
            await this.delay(CONFIG.ANIMATION_DURATION);

            // 移除匹配的格子
            matches.forEach(({ row, col }) => {
                this.board[row][col] = null;
            });

            // 下落
            this.applyGravity();
            this.renderBoard();
            audioManager.playDrop();

            // 等待下落动画
            await this.delay(CONFIG.ANIMATION_DURATION);
        }
    }

    findAllMatches() {
        const matches = [];
        const checked = new Set();

        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                const key = `${row},${col}`;
                if (checked.has(key)) continue;

                if (this.isPartOfMatch(row, col)) {
                    const matchCells = this.getMatchGroup(row, col);
                    matchCells.forEach(cell => {
                        const cellKey = `${cell.row},${cell.col}`;
                        if (!checked.has(cellKey)) {
                            matches.push(cell);
                            checked.add(cellKey);
                        }
                    });
                }
            }
        }

        return matches;
    }

    getMatchGroup(row, col) {
        const ghost = this.board[row][col];
        const group = [];

        // 水平匹配
        const horizontal = [{ row, col }];
        for (let c = col - 1; c >= 0 && this.board[row][c] === ghost; c--) {
            horizontal.push({ row, col: c });
        }
        for (let c = col + 1; c < CONFIG.BOARD_SIZE && this.board[row][c] === ghost; c++) {
            horizontal.push({ row, col: c });
        }
        if (horizontal.length >= CONFIG.MATCH_MIN) {
            group.push(...horizontal);
        }

        // 垂直匹配
        const vertical = [{ row, col }];
        for (let r = row - 1; r >= 0 && this.board[r][col] === ghost; r--) {
            vertical.push({ row: r, col });
        }
        for (let r = row + 1; r < CONFIG.BOARD_SIZE && this.board[r][col] === ghost; r++) {
            vertical.push({ row: r, col });
        }
        if (vertical.length >= CONFIG.MATCH_MIN) {
            group.push(...vertical);
        }

        // 去重
        const unique = [];
        const seen = new Set();
        group.forEach(cell => {
            const key = `${cell.row},${cell.col}`;
            if (!seen.has(key)) {
                unique.push(cell);
                seen.add(key);
            }
        });

        return unique;
    }

    applyGravity() {
        // 从下往上处理每一列
        for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
            let writeRow = CONFIG.BOARD_SIZE - 1;
            
            // 从下往上读取非空格子
            for (let row = CONFIG.BOARD_SIZE - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    this.board[writeRow][col] = this.board[row][col];
                    if (writeRow !== row) {
                        this.board[row][col] = null;
                    }
                    writeRow--;
                }
            }
            
            // 填充顶部空格
            while (writeRow >= 0) {
                this.board[writeRow][col] = this.randomGhost();
                writeRow--;
            }
        }
    }

    createParticles(cell) {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 检查是否有自定义图片
        const img = cell.querySelector('img');

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            if (img) {
                // 使用图片作为粒子
                const particleImg = document.createElement('img');
                particleImg.src = img.src;
                particleImg.style.width = '20px';
                particleImg.style.height = '20px';
                particleImg.style.borderRadius = '50%';
                particleImg.style.objectFit = 'cover';
                particle.appendChild(particleImg);
            } else {
                particle.textContent = cell.textContent;
            }
            
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.fontSize = '1em';
            particle.style.zIndex = '1000';
            
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 50 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 600);
        }
    }

    showHint() {
        if (this.isAnimating || this.gameOver) return;

        // 查找一个可能的移动
        const possibleMove = this.findPossibleMove();
        
        if (possibleMove) {
            this.highlightHint(possibleMove.row1, possibleMove.col1, possibleMove.row2, possibleMove.col2);
        } else {
            // 没有可能的移动，自动洗牌
            this.shuffleBoard();
        }
    }

    // 查找一个可能的移动
    findPossibleMove() {
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                // 尝试向右交换
                if (col < CONFIG.BOARD_SIZE - 1) {
                    if (this.wouldCreateMatch(row, col, row, col + 1)) {
                        return { row1: row, col1: col, row2: row, col2: col + 1 };
                    }
                }
                // 尝试向下交换
                if (row < CONFIG.BOARD_SIZE - 1) {
                    if (this.wouldCreateMatch(row, col, row + 1, col)) {
                        return { row1: row, col1: col, row2: row + 1, col2: col };
                    }
                }
            }
        }
        return null; // 没有可能的移动
    }

    // 检查是否有可能的移动
    hasPossibleMoves() {
        return this.findPossibleMove() !== null;
    }

    // 洗牌 - 当没有可能的移动时调用
    shuffleBoard() {
        // 收集所有当前的方块
        const allGhosts = [];
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                allGhosts.push(this.board[row][col]);
            }
        }
        
        // 打乱顺序
        for (let i = allGhosts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allGhosts[i], allGhosts[j]] = [allGhosts[j], allGhosts[i]];
        }
        
        // 重新填充棋盘
        let index = 0;
        for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
            for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                this.board[row][col] = allGhosts[index++];
            }
        }
        
        // 确保洗牌后没有初始匹配
        while (this.hasMatches()) {
            for (let row = 0; row < CONFIG.BOARD_SIZE; row++) {
                for (let col = 0; col < CONFIG.BOARD_SIZE; col++) {
                    if (this.isPartOfMatch(row, col)) {
                        this.board[row][col] = this.randomGhost();
                    }
                }
            }
        }
        
        // 如果洗牌后仍然没有可能的移动，递归洗牌
        if (!this.hasPossibleMoves()) {
            this.shuffleBoard();
            return;
        }
        
        this.renderBoard();
        
        // 显示洗牌提示
        this.showShuffleNotice();
        audioManager.playHint();
    }

    // 显示洗牌提示
    showShuffleNotice() {
        const notice = document.createElement('div');
        notice.className = 'shuffle-notice';
        notice.textContent = '🔀 已自动洗牌！';
        notice.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 20px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out forwards;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                30% { transform: translate(-50%, -50%) scale(1); }
                70% { opacity: 1; }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notice);
        
        setTimeout(() => {
            notice.remove();
            style.remove();
        }, 2000);
    }

    wouldCreateMatch(row1, col1, row2, col2) {
        // 临时交换
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;

        const hasMatch = this.isPartOfMatch(row1, col1) || this.isPartOfMatch(row2, col2);

        // 交换回来
        this.board[row2][col2] = this.board[row1][col1];
        this.board[row1][col1] = temp;

        return hasMatch;
    }

    highlightHint(row1, col1, row2, col2) {
        const cells = this.boardElement.querySelectorAll('.cell');
        const cell1 = cells[row1 * CONFIG.BOARD_SIZE + col1];
        const cell2 = cells[row2 * CONFIG.BOARD_SIZE + col2];

        // 添加提示动画类
        cell1.classList.add('hint');
        cell2.classList.add('hint');
        
        // 播放提示音效
        audioManager.playHint();

        setTimeout(() => {
            cell1.classList.remove('hint');
            cell2.classList.remove('hint');
        }, 2000);
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.targetElement.textContent = this.target;
        
        // 更新关卡显示
        const levelElement = document.getElementById('level');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }

    checkGameOver() {
        if (this.score >= this.target) {
            if (this.level >= CONFIG.TOTAL_LEVELS) {
                // 通关！显示最终胜利
                this.showGameOver(true);
            } else {
                // 进入下一关
                this.showLevelComplete();
            }
        }
    }

    // 显示关卡完成
    showLevelComplete() {
        // 根据关卡显示不同图片
        const levelImages = {
            1: 'reward/round-1.jpg',
            2: 'reward/round-2.jpg'
        };
        const imageSrc = levelImages[this.level] || 'reward/Thanks.JPG';
        
        const notice = document.createElement('div');
        notice.className = 'level-complete-notice';
        notice.innerHTML = `
            <div class="level-complete-content">
                <h2>🎉 第 ${this.level} 关完成！</h2>
                <div class="level-thanks-box">
                    <img src="${imageSrc}" alt="Thanks">
                </div>
                <button class="btn btn-next-level" id="nextLevelBtn">✨ 进入下一关</button>
            </div>
        `;
        document.body.appendChild(notice);
        
        audioManager.playWin();
        
        // 点击按钮进入下一关
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            notice.classList.add('fade-out');
            setTimeout(() => {
                notice.remove();
                this.nextLevel();
            }, 500);
        });
    }

    showGameOver(won) {
        this.gameOver = true;
        
        const winContent = document.getElementById('winContent');
        const loseContent = document.getElementById('loseContent');
        const winStage1 = document.getElementById('winStage1');
        const winStage2 = document.getElementById('winStage2');
        
        if (won) {
            // 胜利流程
            winContent.style.display = 'block';
            loseContent.style.display = 'none';
            winStage1.style.display = 'block';
            winStage2.style.display = 'none';
            document.getElementById('finalScore').textContent = this.score;
            this.modal.classList.add('show');
            
            // 暂停背景音乐，播放胜利音效
            audioManager.pauseBackgroundMusic();
            audioManager.playWin();
            
            // 播放 Unbelievable 音效
            setTimeout(() => {
                audioManager.playUnbelievable();
            }, 500);
            
            // 提前预加载福利图片
            let rewardImageSrc = '';
            if (typeof REWARD_POOL !== 'undefined' && REWARD_POOL.length > 0) {
                const randomIndex = Math.floor(Math.random() * REWARD_POOL.length);
                rewardImageSrc = 'reward/' + REWARD_POOL[randomIndex];
                const preloadImg = new Image();
                preloadImg.src = rewardImageSrc;
            }
            
            // 2秒后开始星月过渡动画
            setTimeout(() => {
                // 设置好福利图片
                document.getElementById('rewardImage').src = rewardImageSrc;
                
                const modalContent = this.modal.querySelector('.modal-content');
                modalContent.style.position = 'relative';
                modalContent.style.overflow = 'hidden';
                
                // 创建星星月亮动画元素（透明背景，只有星星月亮）
                const starsHtml = `
                    <span class="floating-star" style="--x:-30px;--y:-50px;--delay:0s;--size:2em">⭐</span>
                    <span class="floating-star" style="--x:40px;--y:-40px;--delay:0.1s;--size:1.5em">✨</span>
                    <span class="floating-star" style="--x:-50px;--y:30px;--delay:0.2s;--size:1.8em">🌟</span>
                    <span class="floating-star" style="--x:60px;--y:20px;--delay:0.15s;--size:2.2em">⭐</span>
                    <span class="floating-star" style="--x:0px;--y:-60px;--delay:0.25s;--size:1.6em">✨</span>
                    <span class="floating-star" style="--x:-40px;--y:50px;--delay:0.3s;--size:1.4em">🌟</span>
                    <span class="floating-moon" style="--delay:0.1s">🌙</span>
                `;
                
                // Stage1 开始淡出并添加星星
                winStage1.insertAdjacentHTML('beforeend', '<div class="stars-overlay">' + starsHtml + '</div>');
                winStage1.classList.add('stage-fade-out');
                
                // 内容切换
                setTimeout(() => {
                    winStage1.style.display = 'none';
                    winStage1.classList.remove('stage-fade-out');
                    winStage1.querySelector('.stars-overlay')?.remove();
                    
                    // Stage2 淡入并添加星星
                    winStage2.insertAdjacentHTML('beforeend', '<div class="stars-overlay">' + starsHtml + '</div>');
                    winStage2.style.display = 'block';
                    winStage2.classList.add('stage-fade-in');
                    
                    // 播放福利时间音效
                    audioManager.playFuliTime();
                    
                    // 清理动画
                    setTimeout(() => {
                        winStage2.classList.remove('stage-fade-in');
                        winStage2.querySelector('.stars-overlay')?.remove();
                    }, 800);
                }, 500);
            }, 2000);
        } else {
            // 失败
            winContent.style.display = 'none';
            loseContent.style.display = 'block';
            document.getElementById('loseScore').textContent = this.score;
            this.modal.classList.add('show');
            audioManager.playLose();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 分享游戏
    shareGame() {
        const url = window.location.href;
        
        // 复制到剪贴板
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('✅ 链接已复制，快去分享吧！');
        }).catch(() => {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('✅ 链接已复制，快去分享吧！');
        });
    }

    // 显示提示消息
    showToast(message) {
        // 移除已有的 toast
        document.querySelector('.copy-toast')?.remove();
        
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 2秒后移除
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

