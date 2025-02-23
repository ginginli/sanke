// "Snake" by Rod Pierce
// http://localhost/mathsisfun/app.html?folder=games&file=snake
// https://www.mathsisfun.com/games/images/snake.js

var w, h, el, g, my = {};

var snake;

function init(mode) {
    my.version = '0.64';
    my.typ = typeof mode !== 'undefined' ? mode : 'bla';

    my.hdrHt = 40;
    w = Math.min(500, window.innerWidth - 20, window.innerHeight - my.hdrHt);
    h = w;

    console.log('h,w', h, w);

    my.xN = 20;
    my.sz = w / my.xN;
    my.wmax = Math.floor(w / my.sz) - 1;
    my.hmax = Math.floor(h / my.sz) - 1;

    my.hz = 10; // 每秒
    my.millisecs = 1000 / my.hz;

    my.bgClr = 'hsla(0,0%,15%,1)';
    my.edgeTypes = ['right', 'left', 'wrap', 'bounce', 'reset'];
    my.edgeType = my.edgeTypes[0];
    my.food = new Pt(0, 0);
    my.prevFood = new Pt(0, 0);
    my.soundQ = true;
    my.hiScore = 0;

    console.log('my', my);

    var s = '';
    my.sndHome = (document.domain == 'localhost') ? '/mathsisfun/images/sounds/' : '/images/sounds/';
    s += '<audio id="sndEat" src="' + my.sndHome + 'pop.mp3" preload="auto"></audio>';
    s += '<audio id="sndReset" src="' + my.sndHome + 'gromb.mp3" preload="auto"></audio>';
    my.snds = [];
    s += '<style type="text/css">';
    s += '.btn1 {display: inline-block; position: relative; padding: 6px; border: 0 solid rgba(208,208,248,1); border-radius: 10px; background: linear-gradient(#fff, #ccf), #c9c5c9; box-shadow: 0 3 4 rgba(0,0,0,.4); }';
    s += '.btn1:hover {background: linear-gradient(#f0f0f5, #a9a9b9), #c9c5c9; }';
    s += '</style>';

    s += '<div id="main" style="position:relative; width:' + w + 'px; min-height:' + (h + my.hdrHt) + 'px;  margin:auto; display:block;  ">';

    s += '<div style="position:relative; height:40px; ">';
    s += '<div id="hiscore" style="position:absolute; left:5%; top:15px; width:90%; text-align:center; color: #333; font:16px Arial;">Press Play to Start</div>';
    s += '<button id="optBtn" class="btn1" style="float:right; margin-top:9px; " onclick="optPop()" >Options</button>';
    s += playHTML(40);
    s += '</div>';

    s += '<div style="position:relative;background-color:' + my.bgClr + ';">';
    s += '<canvas id="canvas1" style="position: absolute; width:' + w + 'px; height:' + h + 'px; left: 0px; top: 0px; border: none;"></canvas>';
    s += '</div>';

    s += optPopHTML();
    s += '<div id="copyrt" style="font: 10px Arial; color: #6600cc; position:absolute; top:0px; right:0px; margin:0; text-align:center;">&copy; 2019 MathsIsFun.com  v' + my.version + '</div>';
    s += '</div>';

    docInsert(s);

    el = document.getElementById('canvas1');
    var ratio = 3;
    el.width = w * ratio;
    el.height = h * ratio;
    el.style.width = w + "px";
    el.style.height = h + "px";
    g = el.getContext("2d");
    g.setTransform(ratio, 0, 0, ratio, 0, 0);

    // 初始化蛇
    snake = new Snake();
    foodLocn();

    // 事件监听
    window.addEventListener("keydown", key, false);
    el.addEventListener("touchstart", touchStart, false);
    el.addEventListener("mousedown", mouseDown, false);

    // 开始游戏
    my.playQ = false;
    playToggle();
}

function anim() {
    if (my.playQ) {
        draw();
        requestAnimationFrame(anim);
    }
}

function key(ev) {
    var keyCode = ev.keyCode;
    console.log("key", keyCode);

    switch (keyCode) {
        case 37: // arrow left
        case 65: // a
            snake.dir(-1, 0);
            ev.preventDefault();
            break;
        case 39: // arrow right
        case 68: // d
            snake.dir(1, 0);
            ev.preventDefault();
            break;
        case 38: // arrow up
        case 87: // w
            snake.dir(0, -1);
            ev.preventDefault();
            break;
        case 40: // arrow down
        case 83: // s
            snake.dir(0, 1);
            ev.preventDefault();
            break;
        case 32: // space
            playToggle();
            ev.preventDefault();
            break;
        case 27: // ESC
            if (my.playQ) {
                my.playQ = false; // 暂停游戏
            } else {
                my.playQ = true; // 继续游戏
                anim(); // 继续动画
            }
            break;
        default:
            break;
    }
}

function draw() {
    // 清除画布
    g.clearRect(0, 0, g.canvas.width, g.canvas.height);

    // 绘制背景
    g.fillStyle = my.bgClr;
    g.fillRect(0, 0, g.canvas.width, g.canvas.height);

    // 绘制蛇
    snake.show();

    // 绘制食物
    g.fillStyle = 'lightgreen';
    g.fillRect(my.food.x * my.sz, my.food.y * my.sz, my.sz, my.sz);
}

// 蛇的构造函数
function Snake() {
    this.x = 5;
    this.y = 5;
    this.tail = [];
    this.total = 0;
    this.speed = { x: 1, y: 0 };

    this.dir = function(x, y) {
        if (this.speed.x !== -x) this.speed.x = x;
        if (this.speed.y !== -y) this.speed.y = y;
    };

    this.update = function() {
        // 更新蛇的位置
        this.tail.unshift({ x: this.x, y: this.y });
        this.x += this.speed.x;
        this.y += this.speed.y;

        // 检查边界
        if (this.x > my.wmax || this.x < 0 || this.y > my.hmax || this.y < 0) {
            this.reset();
        }

        // 限制蛇的长度
        if (this.tail.length > this.total) {
            this.tail.pop();
        }
    };

    this.show = function() {
        g.fillStyle = 'yellow';
        for (var i = 0; i < this.tail.length; i++) {
            g.fillRect(this.tail[i].x * my.sz, this.tail[i].y * my.sz, my.sz, my.sz);
        }
        g.fillRect(this.x * my.sz, this.y * my.sz, my.sz, my.sz); // 绘制蛇头
    };

    this.reset = function() {
        this.total = 0;
        this.tail = [];
        this.x = 5;
        this.y = 5;
        this.speed = { x: 1, y: 0 };
    };
}

// 其他函数...

init(); // 启动游戏