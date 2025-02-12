// Snake Game
// 游戏核心变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let newDirection = 'right';
let score = 0;
let gameLoop;
let gameSpeed = 100;
let gridSize = 20;
let gridWidth, gridHeight;

// 初始化游戏
function initGame() {
    // 设置画布
    canvas = document.getElementById('canvas1');
    canvas.width = 800;
    canvas.height = 800;
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

    // 生成第一个食物
    createFood();

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress);

    // 开始游戏循环
    gameLoop = setInterval(updateGame, gameSpeed);
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
    switch(event.key) {
        case 'ArrowUp':
            if (direction !== 'down') newDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') newDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') newDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') newDirection = 'right';
            break;
    }
}

// 更新游戏状态
function updateGame() {
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

    // 绘制游戏
    drawGame();
}

// 检查碰撞
function checkCollision(head) {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
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

    // 绘制网格
    ctx.strokeStyle = '#34495e';
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            ctx.strokeRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
    }

    // 绘制蛇
    snake.forEach((segment, index) => {
        // 渐变颜色
        const hue = (120 + index * 2) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });

    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    const centerX = (food.x * gridSize) + (gridSize / 2);
    const centerY = (food.y * gridSize) + (gridSize / 2);
    ctx.arc(centerX, centerY, gridSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制分数
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
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
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 80);

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

// 启动游戏
window.onload = initGame; 