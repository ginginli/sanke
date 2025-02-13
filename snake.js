// Snake Game
// 游戏核心变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let newDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0; // 添加最高分
let gameLoop;
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

// 缓存常用DOM元素
const gameElements = {
    canvas: null,
    ctx: null,
    settingsBtn: null,
    settingsPanel: null,
    speedValue: null,
    gameLoop: null  // 添加游戏循环引用
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

// 初始化游戏
function initGame() {
    // 初始化DOM元素
    if (!initElements()) {
        console.error('Failed to initialize game elements');
        return;
    }
    
    // 设置画布尺寸
    resizeCanvas();
    
    // 初始化游戏状态
    snake = [
        {x: 5, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 5}
    ];
    
    direction = 'right';
    newDirection = 'right';
    score = 0;
    isPaused = false;
    lastFrameTime = 0;

    // 创建食物
    createFood();
    
    // 加载设置
    loadSettings();
    
    // 初始化界面
    initSettingsPanel();
    addControlButtons();
    addSettingsOptions();

    // 添加事件监听
    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', resizeCanvas);
    gameElements.canvas.addEventListener('touchstart', handleTouchStart, false);
    gameElements.canvas.addEventListener('touchmove', handleTouchMove, false);

    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 自适应屏幕大小
function resizeCanvas() {
    if (!gameElements.canvas) return;
    
    const maxSize = Math.min(window.innerWidth - 20, window.innerHeight - 100);
    const newSize = Math.floor(maxSize / gridSize) * gridSize;
    
    gameElements.canvas.width = newSize;
    gameElements.canvas.height = newSize;
    
    gridWidth = Math.floor(newSize / gridSize);
    gridHeight = gridWidth;  // 保持正方形
    
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

// 创建食物
function createFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    // 确保食物不会出现在蛇身上
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
    }
}

// 处理键盘输入
function handleKeyPress(event) {
    // 阻止方向键的默认滚动行为
    if (event.key.startsWith('Arrow')) {
        event.preventDefault();
    }
    
    switch(event.key.toLowerCase()) {
        case 'w': case '8': if (direction !== 'down') newDirection = 'up'; break;
        case 's': case '2': if (direction !== 'up') newDirection = 'down'; break;
        case 'a': case '4': if (direction !== 'right') newDirection = 'left'; break;
        case 'd': case '6': if (direction !== 'left') newDirection = 'right'; break;
        case ' ': // 空格键
            event.preventDefault(); // 防止空格键滚动页面
            break;
        case 'Escape':
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
    ctx.fillText(`High Score: ${highScore}`, 10, 60);

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
    if (isPaused) return;
    
    direction = newDirection;
    
    // 计算新的头部位置
    const head = {x: snake[0].x, y: snake[0].y};
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // 检查碰撞
    if (checkCollision(head)) {
        // 保存最高分
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
        }
        gameOver();
        return;
    }

    // 移动蛇
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        createFood();
        // 加快游戏速度
        if (gameSpeed > 50) {
            gameSpeed -= 2;
        }
    } else {
        snake.pop();
    }

    // 使用节流后的存储
    throttledSaveState();
}

// 游戏结束
function gameOver() {
    isPaused = true;  // 使用暂停标志替代 clearInterval
    
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

    // 添加重启游戏的监听
    document.addEventListener('keydown', function restart(event) {
        if (event.code === 'Space') {
            document.removeEventListener('keydown', restart);
            score = 0;
            gameSpeed = 100;
            direction = 'right';
            newDirection = 'right';
            initGame();
        }
    });
}

// 添加Service Worker支持离线功能
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// 修改 pauseGame 和 resumeGame 函数
function pauseGame() {
    isPaused = true;
    drawGame(); // 立即重绘以显示暂停菜单
}

function resumeGame() {
    isPaused = false;
    lastFrameTime = 0;
    requestAnimationFrame(gameLoop);
}

// 在init函数末尾添加设置面板的事件监听
function initSettingsPanel() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    
    if (!settingsBtn || !settingsPanel) {
        console.error('Settings elements not found');
        return;
    }
    
    // 设置按钮点击事件
    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = 'block';
        pauseGame();
    });
    
    // 关闭按钮点击事件
    document.getElementById('closeSettings').addEventListener('click', () => {
        settingsPanel.style.display = 'none';
        resumeGame();
    });
    
    // 保存按钮点击事件
    document.getElementById('saveSettings').addEventListener('click', () => {
        saveSettings();
        settingsPanel.style.display = 'none';
        resumeGame();
    });
    
    // 速度滑块变化事件
    document.getElementById('gameSpeed').addEventListener('input', (e) => {
        document.getElementById('speedValue').textContent = e.target.value + 'ms';
    });
}

// 添加控制按钮面板
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
            switch(btn.id) {
                case 'up': if (direction !== 'down') newDirection = 'up'; break;
                case 'down': if (direction !== 'up') newDirection = 'down'; break;
                case 'left': if (direction !== 'right') newDirection = 'left'; break;
                case 'right': if (direction !== 'left') newDirection = 'right'; break;
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
    });
}

// 删除第一个 gameLoop 定义，只保留这一个完整版本
function gameLoop(timestamp) {
    if (!gameElements.ctx || !gameElements.canvas) return;
    
    if (isPaused) return;

    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }
    
    const elapsed = timestamp - lastFrameTime;
    
    if (elapsed >= gameSpeed) {
        lastFrameTime = timestamp;
        updateGame();
    }
    
    drawGame();
    requestAnimationFrame(gameLoop);
}

// 确保在页面完全加载后再初始化游戏
window.addEventListener('load', function() {
    initGame();  // 只调用一次初始化
});

// 在游戏初始化时添加错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// 在初始化时获取元素
function initElements() {
    gameElements.canvas = document.getElementById('canvas1');
    if (!gameElements.canvas) {
        console.error('Canvas element not found');
        return false;
    }
    
    gameElements.ctx = gameElements.canvas.getContext('2d');
    if (!gameElements.ctx) {
        console.error('Could not get canvas context');
        return false;
    }
    
    gameElements.settingsBtn = document.getElementById('settingsBtn');
    gameElements.settingsPanel = document.getElementById('settingsPanel');
    gameElements.speedValue = document.getElementById('speedValue');
    
    return true;
}

// 添加游戏状态恢复
function restoreGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const state = JSON.parse(savedState);
        snake = state.snake;
        food = state.food;
        score = state.score;
        direction = state.direction;
    }
} 