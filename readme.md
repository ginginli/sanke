# Snake Game Unblocked

一个简单但功能完整的贪吃蛇网页游戏，使用纯HTML、CSS和JavaScript实现。游戏支持多种控制方式，具有丰富的设置选项和视觉效果。

## 什么是 Snake Game Unblocked?

"Unblocked" 版本的贪吃蛇游戏具有以下特点：

- **无限制访问**: 专门设计用来绕过学校、办公室等地方的网络限制
- **纯前端实现**: 使用纯HTML/CSS/JavaScript开发，不依赖后端服务器
- **零外部依赖**: 不使用任何可能被封锁的外部资源
- **离线运行**: 下载后可完全离线运行
- **轻量级**: 总文件大小小于100KB

## 功能特点

### 游戏控制
- 支持多种控制方式：
  + 方向键控制
  + WASD键控制
  + 数字键盘控制
  + 触摸屏控制
  + 屏幕按钮控制

### 游戏设置
- 速度调节（50-200ms）
- 网格大小选择（15x15到30x30）
- 边界模式选择：
  + 死亡模式
  + 穿墙模式
  + 反弹模式
- 坐标显示开关

### 视觉效果
- 棋盘格背景
- 网格坐标显示
- 蛇身编号显示
- 蛇身渐变色效果
- 食物动画效果

### 游戏功能
- 实时分数显示
- 最高分记录（本地存储）
- 暂停/继续功能
- ESC键快捷操作
- 游戏结束提示

## 技术实现

- **渲染技术**: 
  + HTML5 Canvas 绘制游戏画面
  + requestAnimationFrame 优化渲染
  + 帧率控制确保流畅度

- **存储功能**: 
  + LocalStorage 保存游戏设置
  + LocalStorage 记录最高分

- **响应式设计**: 
  + 自适应屏幕大小
  + 触摸设备支持
  + 移动端优化

- **性能优化**:
  + 使用requestAnimationFrame
  + 优化渲染循环
  + 减少不必要的重绘

## 项目结构 