// Snake Game
// 游戏核心变量
let snake = [];
let food = {};
let direction = 'right';
let newDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0; // 添加最高分
let gameSpeed = 100;
let gridSize = 20;
let gridWidth, gridHeight;
let touchStartX = null;
let touchStartY = null;
let borderMode = 'die';  // 边界模式
let showCoordinates = true; // 显示坐标
let isPaused = false;    // 暂停状态
let fps = 60;               // 目标帧率
let lastFrameTime = 0;      // 上一帧时间
let frameInterval = 1000/fps; // 帧间隔
const MIN_SWIPE = 30;  // 最小滑动距离

// 设置的默认值
const defaultSettings = {
    gameSpeed: 100,
    gridSize: 20,
    borderMode: 'die'
};

// 添加缓存和优化相关的变量
const cache = {
    background: null,    // 缓存背景
    gridPattern: null,   // 缓存网格
    colors: {           // 缓存颜色
        background: '#2c3e50',
        grid: '#34495e',
        snake: new Array(50).fill(0).map((_, i) => `hsla(${120 + i * 2}, 70%, 50%, ${1 - i * 0.05})`),
        food: '#e74c3c'
    }
};

// 在游戏核心变量部分添加
const gameEvents = {
    handlers: {
        keydown: null,
        resize: null,
        touchstart: null,
        touchmove: null
    },
    
    // 添加事件监听
    addListeners() {
        // 移除旧的监听器
        this.removeListeners();
        
        // 添加新的监听器
        this.handlers.keydown = handleKeyPress;
        this.handlers.resize = resizeCanvas;
        this.handlers.touchstart = handleTouchStart;
        this.handlers.touchmove = handleTouchMove;
        
        document.addEventListener('keydown', this.handlers.keydown);
        window.addEventListener('resize', this.handlers.resize);
        gameElements.canvas.addEventListener('touchstart', this.handlers.touchstart);
        gameElements.canvas.addEventListener('touchmove', this.handlers.touchmove);
    },
    
    // 移除事件监听
    removeListeners() {
        if (this.handlers.keydown) {
            document.removeEventListener('keydown', this.handlers.keydown);
        }
        if (this.handlers.resize) {
            window.removeEventListener('resize', this.handlers.resize);
        }
        if (gameElements.canvas) {
            if (this.handlers.touchstart) {
                gameElements.canvas.removeEventListener('touchstart', this.handlers.touchstart);
            }
            if (this.handlers.touchmove) {
                gameElements.canvas.removeEventListener('touchmove', this.handlers.touchmove);
            }
        }
    }
};

// 添加存储管理器
const storageManager = {
    data: {
        highScore: 0,
        settings: defaultSettings,
        gameState: null
    },
    
    init() {
        // 初始化时从localStorage加载数据
        try {
            const savedHighScore = localStorage.getItem('snakeHighScore');
            if (savedHighScore) this.data.highScore = parseInt(savedHighScore);
            
            const savedSettings = localStorage.getItem('snakeGameSettings');
            if (savedSettings) this.data.settings = JSON.parse(savedSettings);
            
            const savedState = localStorage.getItem('gameState');
            if (savedState) this.data.gameState = JSON.parse(savedState);
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    },
    
    save() {
        // 批量保存所有数据
        try {
            localStorage.setItem('snakeHighScore', this.data.highScore);
            localStorage.setItem('snakeGameSettings', JSON.stringify(this.data.settings));
            if (this.data.gameState) {
                localStorage.setItem('gameState', JSON.stringify(this.data.gameState));
            }
        } catch (e) {
            console.error('Error saving data:', e);
        }
    },
    
    updateHighScore(score) {
        if (score > this.data.highScore) {
            this.data.highScore = score;
            this.save();
        }
    },
    
    updateSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        this.save();
    },
    
    updateGameState(state) {
        this.data.gameState = state;
        // 使用节流保存游戏状态
        this.throttledSave();
    },
    
    throttledSave: throttle(function() {
        this.save();
    }, 1000)
};

// 加载设置
function loadSettings() {
    const savedSettings = localStorage.getItem('snakeGameSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    
    // 应用设置到游戏
    gameSpeed = settings.gameSpeed;
    gridSize = settings.gridSize;
    borderMode = settings.borderMode;
    
    // 更新设置面板的显示
    document.getElementById('gameSpeed').value = gameSpeed;
    document.getElementById('speedValue').textContent = gameSpeed + 'ms';
    document.getElementById('gridSize').value = gridSize;
    document.getElementById('borderMode').value = borderMode;
}

// 保存设置
function saveSettings() {
    const settings = {
        gameSpeed: parseInt(document.getElementById('gameSpeed').value),
        gridSize: parseInt(document.getElementById('gridSize').value),
        borderMode: document.getElementById('borderMode').value
    };
    
    localStorage.setItem('snakeGameSettings', JSON.stringify(settings));
    applySettings(settings);
}

// 应用设置
function applySettings(settings) {
    gameSpeed = settings.gameSpeed;
    gridSize = settings.gridSize;
    borderMode = settings.borderMode;
    
    // 重新初始化游戏
    initGame();
}

// 游戏配置
const gameConfig = {
    version: '1.0.0',
    gridSize: 20,
    speed: 100,
    fps: 60,
    edgeTypes: ['right', 'left', 'wrap', 'bounce', 'reset'],
    defaultEdgeType: 'right',
    defaultSettings: {
        gameSpeed: 100,
        gridSize: 20,
        borderMode: 'die'
    },
    colors: {
        background: '#2c3e50',
        grid: '#34495e',
        food: '#e74c3c',
        snake: new Array(50).fill(0).map((_, i) => `hsla(${120 + i * 2}, 70%, 50%, ${1 - i * 0.05})`)
    },
    controls: {
        minSwipe: 30
    }
};

// 游戏状态变量
const gameVars = {
    snake: [],
    food: {},
    direction: 'right',
    newDirection: 'right',
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0,
    gameSpeed: gameConfig.speed,
    gridSize: gameConfig.gridSize,
    gridWidth: 0,
    gridHeight: 0,
    touchStartX: null,
    touchStartY: null,
    borderMode: gameConfig.defaultSettings.borderMode,
    showCoordinates: true,
    isPaused: false,
    lastFrameTime: 0,
    frameInterval: 1000/gameConfig.fps
};

// 游戏元素和缓存
const gameElements = {
    canvas: null,
    ctx: null,
    settingsBtn: null,
    settingsPanel: null,
    speedValue: null,
    cache: {
        background: null,
        gridPattern: null,
        colors: gameConfig.colors
    }
};

// 游戏状态管理
const gameState = {
    isRunning: false,
    isInitialized: false,
    lastScore: 0,
    edgeType: gameConfig.defaultEdgeType,
    
    init() {
        this.isInitialized = true;
        this.isRunning = false;
        this.lastScore = 0;
        
        const savedState = storageManager.data.gameState;
        if (savedState) {
            gameVars.snake = savedState.snake;
            gameVars.food = savedState.food;
            gameVars.score = savedState.score;
            gameVars.direction = savedState.direction;
            this.lastScore = savedState.score;
        }
    },
    
    start() {
        if (!this.isInitialized) {
            errorHandler.handle(new Error('Game not initialized'));
            return;
        }
        this.isRunning = true;
        gameVars.isPaused = false;
        gameVars.lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
    },
    
    pause() {
        this.isRunning = false;
        gameVars.isPaused = true;
    },
    
    resume() {
        if (!this.isInitialized) return;
        this.isRunning = true;
        gameVars.isPaused = false;
        gameVars.lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
    },
    
    reset() {
        this.lastScore = gameVars.score;
        gameVars.score = 0;
        gameVars.gameSpeed = gameConfig.speed;
        gameVars.direction = 'right';
        gameVars.newDirection = 'right';
        gameVars.snake = [
            {x: 5, y: 5},
            {x: 4, y: 5},
            {x: 3, y: 5}
        ];
        createFood();
        this.isRunning = false;
        gameVars.isPaused = false;
    }
};

// 初始化游戏
function initGame() {
    console.log('Initializing game...');
    
    if (!initElements()) {
        errorHandler.handle(new Error('Failed to initialize game elements'));
        return;
    }
    
    resizeCanvas();
    gameState.reset();
    loadSettings();
    
    initSettingsPanel();
    addControlButtons();
    addSettingsOptions();
    
    gameEvents.addListeners();
    drawGame();
    gameState.start();
}

// 自适应屏幕大小
function resizeCanvas() {
    if (!gameElements.canvas) {
        console.error('Canvas不存在，无法调整大小');
        return;
    }
    
    const maxSize = Math.min(window.innerWidth - 20, window.innerHeight - 100);
    const newSize = Math.floor(maxSize / gridSize) * gridSize;
    
    console.log('Canvas尺寸调整:', {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        maxSize: maxSize,
        newSize: newSize,
        gridSize: gridSize
    });
    
    gameElements.canvas.width = newSize;
    gameElements.canvas.height = newSize;
    
    // 验证canvas是否可见
    const canvasRect = gameElements.canvas.getBoundingClientRect();
    console.log('Canvas可见性:', {
        width: gameElements.canvas.width,
        height: gameElements.canvas.height,
        displayStyle: window.getComputedStyle(gameElements.canvas).display,
        visibility: window.getComputedStyle(gameElements.canvas).visibility,
        boundingRect: {
            top: canvasRect.top,
            left: canvasRect.left,
            width: canvasRect.width,
            height: canvasRect.height
        }
    });
    
    gridWidth = Math.floor(newSize / gridSize);
    gridHeight = gridWidth;
    
    // 重新创建背景缓存
    cache.background = null;
}

// 触摸控制
function handleTouchStart(evt) {
    evt.preventDefault();
    touchStartX = evt.touches[0].clientX;
    touchStartY = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!touchStartX || !touchStartY) return;
    
    const deltaX = evt.touches[0].clientX - touchStartX;
    const deltaY = evt.touches[0].clientY - touchStartY;
    
    if (Math.abs(deltaX) > MIN_SWIPE || Math.abs(deltaY) > MIN_SWIPE) {
        // 处理方向变化
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newDirection = deltaX > 0 ? 'right' : 'left';
        } else {
            newDirection = deltaY > 0 ? 'down' : 'up';
        }
        
        // 重置触摸起点
        touchStartX = null;
        touchStartY = null;
    }
}

// 优化食物生成算法
function createFood() {
    // 创建空闲位置的集合
    const emptySpaces = new Set();
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            emptySpaces.add(`${x},${y}`);
        }
    }
    
    // 移除蛇占用的位置
    snake.forEach(segment => {
        emptySpaces.delete(`${segment.x},${segment.y}`);
    });
    
    // 如果没有空位，游戏胜利
    if (emptySpaces.size === 0) {
        gameWin();
        return;
    }
    
    // 从剩余空位中随机选择
    const spaces = Array.from(emptySpaces);
    const randomPosition = spaces[Math.floor(Math.random() * spaces.length)];
    const [x, y] = randomPosition.split(',').map(Number);
    food = { x, y };
}

// 添加游戏胜利处理
function gameWin() {
    isPaused = true;
    const ctx = gameElements.ctx;
    const canvas = gameElements.canvas;
    
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Press Space to Play Again', canvas.width / 2, canvas.height / 2 + 80);
}

// 处理键盘输入
function handleKeyPress(event) {
    // 阻止方向键的默认滚动行为
    if (event.key.startsWith('Arrow')) {
        event.preventDefault();
    }
    
    if (!gameState.isRunning && event.code !== 'Space') {
        return;
    }
    
    switch(event.key.toLowerCase()) {
        case 'w': case '8': 
        case 'arrowup':
            if (direction !== 'down') newDirection = 'up'; 
            break;
        case 's': case '2': 
        case 'arrowdown':
            if (direction !== 'up') newDirection = 'down'; 
            break;
        case 'a': case '4': 
        case 'arrowleft':
            if (direction !== 'right') newDirection = 'left'; 
            break;
        case 'd': case '6': 
        case 'arrowright':
            if (direction !== 'left') newDirection = 'right'; 
            break;
        case ' ':
            event.preventDefault();
            if (!gameState.isRunning) {
                initGame();
            }
            break;
        case 'escape':
            if (isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }
            break;
    }
}

// 添加节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 创建和缓存背景
function createBackground() {
    if (!gameElements.canvas) return;
    
    // 创建离屏canvas
    cache.background = document.createElement('canvas');
    cache.background.width = gameElements.canvas.width;
    cache.background.height = gameElements.canvas.height;
    const bgCtx = cache.background.getContext('2d');
    
    // 绘制棋盘格背景
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            bgCtx.fillStyle = (i + j) % 2 === 0 ? cache.colors.grid : cache.colors.background;
            bgCtx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
    }
    
    // 绘制网格线
    bgCtx.strokeStyle = 'rgba(52, 73, 94, 0.5)';
    bgCtx.lineWidth = 0.5;
    bgCtx.beginPath();
    for (let i = 0; i <= gridWidth; i++) {
        bgCtx.moveTo(i * gridSize, 0);
        bgCtx.lineTo(i * gridSize, gameElements.canvas.height);
    }
    for (let j = 0; j <= gridHeight; j++) {
        bgCtx.moveTo(0, j * gridSize);
        bgCtx.lineTo(gameElements.canvas.width, j * gridSize);
    }
    bgCtx.stroke();
}

// 优化的碰撞检测
function checkCollision(head) {
    // 创建网格映射加速碰撞检测
    const gridMap = new Set(
        snake.slice(1).map(segment => `${segment.x},${segment.y}`)
    );
    
    // 边界检测
    switch(borderMode) {
        case 'wrap':
            head.x = (head.x + gridWidth) % gridWidth;
            head.y = (head.y + gridHeight) % gridHeight;
            return false;
        case 'bounce':
            if (head.x < 0 || head.x >= gridWidth) {
                head.x = Math.max(0, Math.min(head.x, gridWidth - 1));
                newDirection = direction === 'left' ? 'right' : 'left';
                return false;
            }
            if (head.y < 0 || head.y >= gridHeight) {
                head.y = Math.max(0, Math.min(head.y, gridHeight - 1));
                newDirection = direction === 'up' ? 'down' : 'up';
                return false;
            }
            return false;
        default:
            if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
                return true;
            }
    }
    
    // 使用Set检查自身碰撞
    return gridMap.has(`${head.x},${head.y}`);
}

// 节流后的存储操作
const throttledSaveState = throttle(function() {
    const gameState = {
        snake: snake,
        food: food,
        score: score,
        direction: direction
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}, 1000);  // 每秒最多保存一次

// 优化的绘制函数
function drawGame() {
    const ctx = gameElements.ctx;
    const canvas = gameElements.canvas;
    
    if (!ctx || !canvas) {
        console.error('Canvas context not available');
        return;
    }

    // 使用缓存的背景
    if (!cache.background) {
        createBackground();
    }
    ctx.drawImage(cache.background, 0, 0);

    // 绘制蛇（使用缓存的颜色）
    snake.forEach((segment, index) => {
        ctx.fillStyle = cache.colors.snake[index] || cache.colors.snake[cache.colors.snake.length - 1];
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });

    // 绘制食物
    ctx.fillStyle = cache.colors.food;
    ctx.beginPath();
    const centerX = (food.x * gridSize) + (gridSize / 2);
    const centerY = (food.y * gridSize) + (gridSize / 2);
    ctx.arc(centerX, centerY, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制分数
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${storageManager.data.highScore}`, 10, 60);
    if (gameState.lastScore > 0) {
        ctx.fillText(`Last Score: ${gameState.lastScore}`, 10, 90);
    }

    // 绘制暂停菜单
    if (isPaused) {
        drawPauseMenu();
    }
}

// 分离暂停菜单绘制
function drawPauseMenu() {
    const ctx = gameElements.ctx;
    const canvas = gameElements.canvas;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width/2, canvas.height/2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Current Score: ${score}`, canvas.width/2, canvas.height/2);
    ctx.fillText('Press ESC to Continue', canvas.width/2, canvas.height/2 + 50);
}

// 修改updateGame函数中的存储调用
function updateGame() {
    if (!gameState.isRunning || gameVars.isPaused) return;
    
    try {
        gameVars.direction = gameVars.newDirection;
        
        const head = {x: gameVars.snake[0].x, y: gameVars.snake[0].y};
        switch(gameVars.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (checkCollision(head)) {
            if (gameVars.score > storageManager.data.highScore) {
                storageManager.updateHighScore(gameVars.score);
            }
            gameOver();
            return;
        }

        gameVars.snake.unshift(head);
        
        if (head.x === gameVars.food.x && head.y === gameVars.food.y) {
            gameVars.score += 10;
            createFood();
            if (gameVars.gameSpeed > 50) {
                gameVars.gameSpeed -= 2;
            }
        } else {
            gameVars.snake.pop();
        }

        storageManager.updateGameState({
            snake: gameVars.snake,
            food: gameVars.food,
            score: gameVars.score,
            direction: gameVars.direction
        });
    } catch (error) {
        errorHandler.handle(error);
    }
}

// 游戏结束
function gameOver() {
    isPaused = true;
    gameEvents.removeListeners();
    
    const ctx = gameElements.ctx;
    const canvas = gameElements.canvas;
    
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 70);
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 100);

    // 使用 gameEvents 管理重启监听
    const restartHandler = function(event) {
        if (event.code === 'Space') {
            gameEvents.removeListeners();  // 移除所有事件监听
            document.removeEventListener('keydown', restartHandler);
            gameState.reset();
            initGame();
        }
    };
    
    document.addEventListener('keydown', restartHandler);
}

// 改进 Service Worker 注册
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registration successful');
            
            // 添加更新检查
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            console.log('New content is available; please refresh.');
                        }
                    }
                });
            });
        } catch (err) {
            console.error('ServiceWorker registration failed: ', err);
            // 继续游戏，即使 Service Worker 注册失败
        }
    });
}

// 修改 pauseGame 和 resumeGame 函数
function pauseGame() {
    gameState.pause();
    drawGame(); // 立即重绘以显示暂停菜单
}

function resumeGame() {
    gameState.resume();
}

// 在init函数末尾添加设置面板的事件监听
function initSettingsPanel() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    
    if (!settingsBtn || !settingsPanel) {
        errorHandler.handle(new Error('Settings elements not found'));
        return;
    }
    
    // 设置按钮点击事件
    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = 'block';
        gameState.pause();
    });
    
    // 关闭按钮点击事件
    document.getElementById('closeSettings').addEventListener('click', () => {
        settingsPanel.style.display = 'none';
        gameState.resume();
    });
    
    // 保存按钮点击事件
    document.getElementById('saveSettings').addEventListener('click', () => {
        const settings = {
            gameSpeed: parseInt(document.getElementById('gameSpeed').value),
            gridSize: parseInt(document.getElementById('gridSize').value),
            borderMode: document.getElementById('borderMode').value
        };
        
        storageManager.updateSettings(settings);
        settingsPanel.style.display = 'none';
        applySettings(settings);
        gameState.resume();
    });
    
    // 速度滑块变化事件
    document.getElementById('gameSpeed').addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = e.target.value + 'ms';
    });
}

// 修改 addControlButtons 函数
function addControlButtons() {
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';
    controlPanel.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: grid;
        grid-template-columns: repeat(3, 50px);
        gap: 5px;
    `;
    
    const buttons = [
        {id: 'up', text: '↑', x: 1, y: 0},
        {id: 'left', text: '←', x: 0, y: 1},
        {id: 'down', text: '↓', x: 1, y: 1},
        {id: 'right', text: '→', x: 2, y: 1}
    ];
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.gridColumn = btn.x + 1;
        button.style.gridRow = btn.y + 1;
        button.addEventListener('click', () => {
            if (gameState.isRunning && !isPaused) {
                switch(btn.id) {
                    case 'up': if (direction !== 'down') newDirection = 'up'; break;
                    case 'down': if (direction !== 'up') newDirection = 'down'; break;
                    case 'left': if (direction !== 'right') newDirection = 'left'; break;
                    case 'right': if (direction !== 'left') newDirection = 'right'; break;
                }
            }
        });
        controlPanel.appendChild(button);
    });
    
    document.querySelector('.game-container').appendChild(controlPanel);
}

// 添加到设置面板中的新选项
function addSettingsOptions() {
    // 添加坐标显示控制
    const coordsControl = document.createElement('div');
    coordsControl.className = 'setting-item';
    coordsControl.innerHTML = `
        <label for="showCoords">Show Coordinates:</label>
        <input type="checkbox" id="showCoords" ${showCoordinates ? 'checked' : ''}>
    `;
    document.getElementById('settingsPanel').insertBefore(
        coordsControl,
        document.querySelector('.setting-buttons')
    );

    // 监听坐标显示变化
    document.getElementById('showCoords').addEventListener('change', (e) => {
        showCoordinates = e.target.checked;
        drawGame(); // 立即重绘以更新显示
    });
}

// 确保在页面完全加载后再初始化游戏
window.addEventListener('load', function() {
    // 1. 初始化错误处理
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        errorHandler.handle(error);
        return false;
    };
    
    // 2. 初始化存储
    storageManager.init();
    
    // 3. 初始化游戏状态
    gameState.init();
    
    // 4. 初始化游戏
    initGame();
});

// 在初始化时获取元素
function initElements() {
    console.log('开始初始化DOM元素...');
    
    // 验证 canvas
    gameElements.canvas = document.getElementById('canvas1');
    console.log('Canvas元素:', {
        found: !!gameElements.canvas,
        id: gameElements.canvas?.id,
        width: gameElements.canvas?.width,
        height: gameElements.canvas?.height,
        style: gameElements.canvas?.style.cssText
    });
    
    if (!gameElements.canvas) {
        console.error('Canvas element not found');
        return false;
    }
    
    // 验证 canvas context
    gameElements.ctx = gameElements.canvas.getContext('2d');
    console.log('Canvas Context:', {
        found: !!gameElements.ctx,
        type: gameElements.ctx?.constructor.name
    });
    
    if (!gameElements.ctx) {
        console.error('Could not get canvas context');
        return false;
    }
    
    // 验证其他UI元素
    gameElements.settingsBtn = document.getElementById('settingsBtn');
    gameElements.settingsPanel = document.getElementById('settingsPanel');
    gameElements.speedValue = document.getElementById('speedValue');
    
    console.log('UI元素:', {
        settingsBtn: !!gameElements.settingsBtn,
        settingsPanel: !!gameElements.settingsPanel,
        speedValue: !!gameElements.speedValue
    });
    
    return true;
}

// 添加错误恢复机制
const errorHandler = {
    errors: [],
    maxErrors: 3,
    
    handle(error) {
        console.error('Game error:', error);
        this.errors.push({
            time: Date.now(),
            error: error
        });
        
        // 清理旧错误
        this.cleanup();
        
        // 如果错误太多，重置游戏
        if (this.errors.length >= this.maxErrors) {
            this.reset();
        }
    },
    
    cleanup() {
        const now = Date.now();
        this.errors = this.errors.filter(e => now - e.time < 60000); // 保留1分钟内的错误
    },
    
    reset() {
        this.errors = [];
        gameState.reset();
        initGame();
    }
};

// 添加性能监控
const performanceMonitor = {
    frames: [],
    maxSamples: 60,
    lastUpdate: 0,
    updateInterval: 1000, // 每秒更新一次
    
    addFrame(timestamp) {
        this.frames.push(timestamp);
        if (this.frames.length > this.maxSamples) {
            this.frames.shift();
        }
        
        // 定期更新性能状态
        if (timestamp - this.lastUpdate > this.updateInterval) {
            this.updatePerformance();
            this.lastUpdate = timestamp;
        }
    },
    
    getFPS() {
        if (this.frames.length < 2) return 0;
        const timeSpan = this.frames[this.frames.length - 1] - this.frames[0];
        return (this.frames.length - 1) / (timeSpan / 1000);
    },
    
    updatePerformance() {
        const fps = this.getFPS();
        if (fps < 30) {
            this.optimizePerformance();
        }
    },
    
    isPerformancePoor() {
        const fps = this.getFPS();
        const memoryUsage = this.getMemoryUsage();
        return fps < 30 || memoryUsage > 0.8;
    },
    
    getMemoryUsage() {
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
        return 0;
    },
    
    optimizePerformance() {
        if (this.isOptimizing) return;
        this.isOptimizing = true;
        
        // 降低画质
        if (gridSize > 15) {
            gridSize = 15;
            resizeCanvas();
        }
        
        // 减少特效
        cache.colors.snake = cache.colors.snake.slice(0, 25);
        
        // 清理内存
        this.frames = this.frames.slice(-30);
        
        this.isOptimizing = false;
    },
    
    reset() {
        this.frames = [];
        this.lastUpdate = 0;
    }
};

// 添加调试工具
const debugTools = {
    enabled: false,
    
    toggle() {
        this.enabled = !this.enabled;
        drawGame(); // 重绘以显示/隐藏调试信息
    },
    
    draw(ctx) {
        if (!this.enabled) return;
        
        // 显示FPS
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${Math.round(performanceMonitor.getFPS())}`, 10, 90);
        
        // 显示游戏状态
        ctx.fillText(`Running: ${gameState.isRunning}`, 10, 110);
        ctx.fillText(`Paused: ${isPaused}`, 10, 130);
        
        // 显示蛇头位置
        if (snake.length > 0) {
            ctx.fillText(`Head: (${snake[0].x}, ${snake[0].y})`, 10, 150);
        }
        
        // 显示性能信息
        ctx.fillText(`Grid Size: ${gridSize}`, 10, 170);
        ctx.fillText(`Game Speed: ${gameSpeed}`, 10, 190);
    }
};

// 游戏循环实现
const gameLoop = (timestamp) => {
    if (!gameElements.ctx || !gameElements.canvas) {
        errorHandler.handle(new Error('Canvas context not available'));
        return;
    }
    
    try {
        performanceMonitor.addFrame(timestamp);
        
        if (performanceMonitor.isPerformancePoor()) {
            performanceMonitor.optimizePerformance();
        }
        
        if (!gameState.isRunning || isPaused) return;

        const elapsed = timestamp - lastFrameTime;
        if (elapsed >= gameSpeed) {
            lastFrameTime = timestamp;
            updateGame();
        }
        
        drawGame();
        debugTools.draw(gameElements.ctx);
        
        requestAnimationFrame(gameLoop);
    } catch (error) {
        errorHandler.handle(error);
    }
};

// 添加键盘快捷键
document.addEventListener('keydown', function(event) {
    // Ctrl + D 切换调试模式
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        debugTools.toggle();
    }
});