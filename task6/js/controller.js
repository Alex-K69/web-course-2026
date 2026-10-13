(function (app) {
  const MOVE_INTERVAL = 150;

  class GameController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
      this.lastMoveTime = 0;
      this.animationId = null;
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.gameLoop = this.gameLoop.bind(this);
      document.addEventListener('keydown', this.handleKeyDown);
      this.view.restartButton.addEventListener('click', () => this.startGame());
    }

    startGame() {
      if (this.animationId !== null) cancelAnimationFrame(this.animationId);
      this.model.reset();
      this.lastMoveTime = 0;
      this.view.hideGameOver();
      this.render();
      this.animationId = requestAnimationFrame(this.gameLoop);
    }

    handleKeyDown(event) {
      const direction = this.model.directions[event.key];
      if (!direction) return;
      event.preventDefault();
      if (!this.model.gameOver) this.model.changeDirection(direction);
    }

    update(currentTime) {
      if (this.model.gameOver) return;
      if (this.lastMoveTime === 0) this.lastMoveTime = currentTime;
      if (currentTime - this.lastMoveTime >= MOVE_INTERVAL) {
        this.lastMoveTime += MOVE_INTERVAL;
        if (currentTime - this.lastMoveTime >= MOVE_INTERVAL) this.lastMoveTime = currentTime;
        this.model.moveSnake();
      }
    }

    render() {
      this.view.render(this.model.getState(), this.model.cell, this.model.cols, this.model.rows);
    }

    gameLoop(currentTime) {
      this.update(currentTime);
      this.render();
      if (this.model.gameOver) {
        this.animationId = null;
        this.view.showGameOver(this.model.score);
        return;
      }
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  }

  app.GameController = GameController;
})(window.SnakeApp = window.SnakeApp || {});
