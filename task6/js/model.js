(function (app) {
  const CELL = 20;
  const COLS = 20;
  const ROWS = 20;
  const START_LENGTH = 3;
  const DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };

  class GameModel {
    constructor() {
      this.cell = CELL;
      this.cols = COLS;
      this.rows = ROWS;
      this.startLength = START_LENGTH;
      this.directions = DIRECTIONS;
      this.reset();
    }

    reset() {
      const startY = Math.floor(this.rows / 2);
      this.snake = [];
      for (let i = 0; i < this.startLength; i++) this.snake.push({ x: 5 - i, y: startY });
      this.direction = { x: 1, y: 0 };
      this.directionQueue = [];
      this.apple = { x: 0, y: 0 };
      this.score = 0;
      this.gameOver = false;
      this.spawnApple();
    }

    isSnakeCell(x, y, skipTail = false) {
      const end = skipTail ? this.snake.length - 1 : this.snake.length;
      for (let i = 0; i < end; i++) {
        if (this.snake[i].x === x && this.snake[i].y === y) return true;
      }
      return false;
    }

    spawnApple() {
      const free = [];
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (!this.isSnakeCell(x, y)) free.push({ x, y });
        }
      }
      if (!free.length) {
        this.gameOver = true;
        return;
      }
      this.apple = free[Math.floor(Math.random() * free.length)];
    }

    changeDirection(newDirection) {
      const last = this.directionQueue.length ? this.directionQueue[this.directionQueue.length - 1] : this.direction;
      if ((newDirection.x === -last.x && newDirection.y === -last.y) || (newDirection.x === last.x && newDirection.y === last.y)) return;
      if (this.directionQueue.length < 3) this.directionQueue.push(newDirection);
    }

    checkCollision(head) {
      if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) return true;
      const willEat = head.x === this.apple.x && head.y === this.apple.y;
      return this.isSnakeCell(head.x, head.y, !willEat);
    }

    moveSnake() {
      if (this.directionQueue.length) this.direction = this.directionQueue.shift();
      const head = this.snake[0];
      const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };
      if (this.checkCollision(newHead)) {
        this.gameOver = true;
        return;
      }
      this.snake.unshift(newHead);
      if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
        this.score++;
        this.spawnApple();
      } else {
        this.snake.pop();
      }
    }

    getState() {
      return {
        snake: this.snake.map(segment => ({ x: segment.x, y: segment.y })),
        apple: { x: this.apple.x, y: this.apple.y },
        score: this.score,
        gameOver: this.gameOver
      };
    }
  }

  app.GameModel = GameModel;
})(window.SnakeApp = window.SnakeApp || {});
