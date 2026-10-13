(function (app) {
  function start() {
    const model = new app.GameModel();
    const view = new app.GameView();
    const controller = new app.GameController(model, view);
    controller.startGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(window.SnakeApp = window.SnakeApp || {});
