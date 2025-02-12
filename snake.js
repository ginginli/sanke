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
let touchStartX = 0;
let touchStartY = 0;
let borderMode = 'die';  // 边界模式
let showCoordinates = true; // 显示坐标
let isPaused = false;    // 暂停状态
let fps = 60;               // 目标帧率
let lastFrameTime = 0;      // 上一帧时间
let frameInterval = 1000/fps; // 帧间隔

// 设置的默认值
const defaultSettings = {
    gameSpeed: 100,
    gridSize: 20,
    borderMode: 'die'
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
    // 设置画布并自适应屏幕
    canvas = document.getElementById('canvas1');
    resizeCanvas();
    ctx = canvas.getContext('2d');

    // 计算网格数量
    gridWidth = Math.floor(canvas.width / gridSize);
    gridHeight = Math.floor(canvas.height / gridSize);

    // 初始化蛇
    snake = [
        {x: 5, y: 5},
        {x: 4, y: 5},
        {x: 3, y: 5}
    ];

    createFood();

    // 添加事件监听
    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', resizeCanvas);
    
    // 添加触摸控制
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);

    gameLoop = setInterval(updateGame, gameSpeed);
}

// 自适应屏幕大小
function resizeCanvas() {
    const maxSize = Math.min(window.innerWidth - 20, window.innerHeight - 100);
    canvas.width = Math.floor(maxSize / gridSize) * gridSize;
    canvas.height = canvas.width;
    gridWidth = Math.floor(canvas.width / gridSize);
    gridHeight = Math.floor(canvas.height / gridSize);
}

// 触摸控制
function handleTouchStart(evt) {
    evt.preventDefault();
    touchStartX = evt.touches[0].clientX;
    touchStartY = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    evt.preventDefault();
    if (!touchStartX || !touchStartY) return;

    const touchEndX = evt.touches[0].clientX;
    const touchEndY = evt.touches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (deltaX > 0 && direction !== 'left') newDirection = 'right';
        else if (deltaX < 0 && direction !== 'right') newDirection = 'left';
    } else {
        // 垂直滑动
        if (deltaY > 0 && direction !== 'up') newDirection = 'down';
        else if (deltaY < 0 && direction !== 'down') newDirection = 'up';
    }

    touchStartX = null;
    touchStartY = null;
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

// 更新游戏状态
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
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    } else {
        snake.pop();
    }

    // 更新最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }

    // 优化渲染
    window.requestAnimationFrame(drawGame);
}

// 检查碰撞
function checkCollision(head) {
    // 根据边界模式处理碰撞
    switch(borderMode) {
        case 'wrap':
            // 穿墙模式
            head.x = (head.x + gridWidth) % gridWidth;
            head.y = (head.y + gridHeight) % gridHeight;
            return false;
        case 'bounce':
            // 反弹模式
            if (head.x < 0) {
                head.x = 0;
                newDirection = direction === 'left' ? 'right' : direction;
            } else if (head.x >= gridWidth) {
                head.x = gridWidth - 1;
                newDirection = direction === 'right' ? 'left' : direction;
            }
            if (head.y < 0) {
                head.y = 0;
                newDirection = direction === 'up' ? 'down' : direction;
            } else if (head.y >= gridHeight) {
                head.y = gridHeight - 1;
                newDirection = direction === 'down' ? 'up' : direction;
            }
            return false;
        default:
            // 死亡模式
            if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
                return true;
            }
    }
    
    // 检查自身碰撞
    return snake.some((segment, index) => {
        if (index === 0) return false;
        return segment.x === head.x && segment.y === head.y;
    });
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制棋盘格背景
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            // 交替深浅色
            ctx.fillStyle = (i + j) % 2 === 0 ? '#34495e' : '#2c3e50';
            ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
    }

    // 绘制细网格线
    ctx.strokeStyle = 'rgba(52, 73, 94, 0.5)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridWidth; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j <= gridHeight; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * gridSize);
        ctx.lineTo(canvas.width, j * gridSize);
        ctx.stroke();
    }

    // 显示坐标
    if (showCoordinates) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        
        // 显示横坐标
        for (let i = 0; i < gridWidth; i++) {
            ctx.fillText(i, i * gridSize + gridSize/2, gridSize/3);
        }
        
        // 显示纵坐标
        ctx.textAlign = 'right';
        for (let j = 0; j < gridHeight; j++) {
            ctx.fillText(j, gridSize/2, j * gridSize + gridSize/2);
        }
        
        // 显示蛇头坐标
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(`(${snake[0].x},${snake[0].y})`, 
            snake[0].x * gridSize + gridSize/2, 
            snake[0].y * gridSize - 5);
    }

    // 绘制蛇身（带编号）
    snake.forEach((segment, index) => {
        // 渐变颜色
        const hue = (120 + index * 2) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        
        // 添加序号
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(index + 1, 
            segment.x * gridSize + gridSize/2, 
            segment.y * gridSize + gridSize/2 + 3);
    });

    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    const centerX = (food.x * gridSize) + (gridSize / 2);
    const centerY = (food.y * gridSize) + (gridSize / 2);
    ctx.arc(centerX, centerY, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // 显示分数
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);

    // 如果游戏暂停，显示暂停菜单
    if (isPaused) {
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
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
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

// 暂停游戏
function pauseGame() {
    isPaused = true;
    clearInterval(gameLoop);
    drawGame(); // 立即重绘以显示暂停菜单
}

// 继续游戏
function resumeGame() {
    isPaused = false;
    gameLoop = setInterval(updateGame, gameSpeed);
}

// 在init函数末尾添加设置面板的事件监听
function initSettingsPanel() {
    // 设置按钮点击事件
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('settingsPanel').style.display = 'block';
        pauseGame();
    });
    
    // 关闭按钮点击事件
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsPanel').style.display = 'none';
        resumeGame();
    });
    
    // 保存按钮点击事件
    document.getElementById('saveSettings').addEventListener('click', () => {
        saveSettings();
        document.getElementById('settingsPanel').style.display = 'none';
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

// 优化游戏循环
function gameLoop(timestamp) {
    if (!isPaused) {
        if (!lastFrameTime) lastFrameTime = timestamp;
        
        const elapsed = timestamp - lastFrameTime;
        
        if (elapsed > frameInterval) {
            lastFrameTime = timestamp - (elapsed % frameInterval);
            updateGame();
        }
        
        requestAnimationFrame(gameLoop);
    }
}

// 修改初始化函数
function init() {
    // 保持现有的初始化代码...
    
    // 加载保存的设置
    loadSettings();
    
    // 初始化设置面板
    initSettingsPanel();
    
    // 添加控制按钮
    addControlButtons();
    
    // 添加设置选项
    addSettingsOptions();
    
    // 使用requestAnimationFrame启动游戏循环
    requestAnimationFrame(gameLoop);
}

// 启动游戏
window.onload = init; 