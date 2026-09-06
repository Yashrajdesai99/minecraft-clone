import { Game } from './core/Game';

const gameContainer = document.getElementById('game-container');
if (!gameContainer) {
  throw new Error('Game container not found');
}

const game = new Game(gameContainer);
(window as any).game = game;

// Initialize game
game.init();
