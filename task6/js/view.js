(function (app) {
  const COLORS = {
    gridLine: 'rgba(255,255,255,0.04)',
    head: '#b6f58f',
    body: '#5fbf4a',
    apple: '#ff5a5f'
  };

  class GameView {
    constructor() {
      this.canvas = document.getElementById('game');
      this.context = this.canvas.getContext('2d');
      this.scoreElement = document.getElementById('score');
      this.overlay = document.getElementById('overlay');
      this.finalScoreElement = document.getElementById('finalScore');
      this.restartButton = document.getElementById('restartBtn');
    }

    render(state, cell, cols, rows) {
      const context = this.context;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawGrid(context, cell, cols, rows);
      this.drawApple(context, state.apple, cell);
      this.drawSnake(context, state.snake, cell);
      this.scoreElement.textContent = state.score;
    }

    drawGrid(context, cell, cols, rows) {
      context.strokeStyle = COLORS.gridLine;
      context.lineWidth = 1;
      context.beginPath();
      for (let i = 1; i < cols; i++) {
        context.moveTo(i * cell + 0.5, 0);
        context.lineTo(i * cell + 0.5, this.canvas.height);
      }
      for (let j = 1; j < rows; j++) {
        context.moveTo(0, j * cell + 0.5);
        context.lineTo(this.canvas.width, j * cell + 0.5);
      }
      context.stroke();
    }

    drawApple(context, apple, cell) {
      const cx = apple.x * cell + cell / 2;
      const cy = apple.y * cell + cell / 2;
      context.fillStyle = COLORS.apple;
      context.beginPath();
      context.arc(cx, cy, cell / 2 - 3, 0, Math.PI * 2);
      context.fill();
    }

    drawSnake(context, snake, cell) {
      snake.forEach((segment, index) => {
        context.fillStyle = index === 0 ? COLORS.head : COLORS.body;
        context.fillRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
      });
    }

    showGameOver(score) {
      this.finalScoreElement.textContent = score;
      this.overlay.hidden = false;
      this.restartButton.focus();
    }

    hideGameOver() {
      this.overlay.hidden = true;
    }
  }

  app.GameView = GameView;
})(window.SnakeApp = window.SnakeApp || {});
