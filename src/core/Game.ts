import * as THREE from 'three';
import { TimeSystem } from './TimeSystem';
import { Logger } from '../utils/Logger';
import { InputHandler } from './InputHandler';
import { Renderer } from '../rendering/Renderer';
import { World } from '../world/World';
import { Player } from '../gameplay/Player';

const logger = new Logger('Game');

export class Game {
  private container: HTMLElement;
  private timeSystem: TimeSystem;
  private inputHandler: InputHandler;
  private renderer: Renderer;
  private world: World;
  private player: Player;
  private isPaused: boolean = false;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private currentFPS: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.timeSystem = new TimeSystem();
    this.inputHandler = new InputHandler();
    this.renderer = new Renderer(container);
    this.world = new World();
    this.player = new Player();
  }

  async init(): Promise<void> {
    try {
      logger.info('Initializing game...');
      this.showLoadingScreen('Initializing World...');

      // Initialize systems
      await this.renderer.init();
      this.showLoadingScreen('Generating Terrain...', 0.2);

      await this.world.init();
      this.showLoadingScreen('Spawning Player...', 0.5);

      this.player.init(this.world, this.renderer.getCamera());
      this.showLoadingScreen('Loading Resources...', 0.8);

      // Setup input
      this.setupInput();
      this.showLoadingScreen('Starting World...', 0.95);

      // Start game loop
      this.lastFrameTime = performance.now();
      this.gameLoop();

      this.hideLoadingScreen();
      logger.info('Game initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize game:', error);
      throw error;
    }
  }

  private setupInput(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('click', (e) => this.handleMouseClick(e));
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.player.secondaryAction();
    });

    // Lock pointer on click
    this.container.addEventListener('click', () => {
      this.container.requestPointerLock();
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    if (key === 'escape') {
      this.togglePause();
      return;
    }

    if (this.isPaused) return;

    // Number keys for hotbar
    if (key >= '1' && key <= '9') {
      const slot = parseInt(key) - 1;
      this.player.selectHotbarSlot(slot);
    }

    this.inputHandler.setKeyPressed(key, true);
    this.player.handleInput(this.inputHandler);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.inputHandler.setKeyPressed(key, false);
    this.player.handleInput(this.inputHandler);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isPaused) return;
    this.player.handleMouseMove(event.movementX, event.movementY);
  }

  private handleMouseClick(event: MouseEvent): void {
    if (this.isPaused) return;
    this.player.primaryAction();
  }

  private gameLoop = (): void => {
    requestAnimationFrame(this.gameLoop);

    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // Update FPS
    this.frameCount++;
    this.fpsUpdateTime += deltaTime;
    if (this.fpsUpdateTime >= 1.0) {
      this.currentFPS = Math.round(this.frameCount / this.fpsUpdateTime);
      this.frameCount = 0;
      this.fpsUpdateTime = 0;
      this.updateDebugInfo();
    }

    if (!this.isPaused) {
      // Update time
      this.timeSystem.update(deltaTime);

      // Update player
      this.player.update(deltaTime, this.world);

      // Update world around player
      const playerChunkPos = this.player.getChunkPosition();
      this.world.update(playerChunkPos, deltaTime);

      // Update render camera
      this.renderer.updateCamera(this.player.getPosition(), this.player.getRotation());
    }

    // Render
    this.renderer.render(this.world.getVisibleChunks());
  };

  private updateDebugInfo(): void {
    const pos = this.player.getPosition();
    const chunk = this.player.getChunkPosition();

    (document.getElementById('fps') as any).textContent = this.currentFPS;
    (document.getElementById('pos') as any).textContent = `${pos.x.toFixed(1)},${pos.y.toFixed(1)},${pos.z.toFixed(1)}`;
    (document.getElementById('chunk') as any).textContent = `${chunk.x},${chunk.z}`;
    (document.getElementById('loaded') as any).textContent = this.world.getLoadedChunkCount();
    (document.getElementById('rendered') as any).textContent = this.world.getVisibleChunkCount();
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
      if (this.isPaused) {
        pauseMenu.classList.add('active');
        document.exitPointerLock();
      } else {
        pauseMenu.classList.remove('active');
        this.container.requestPointerLock();
      }
    }
  }

  public unpause(): void {
    if (this.isPaused) {
      this.togglePause();
    }
  }

  public openSettings(): void {
    logger.info('Opening settings...');
  }

  public saveWorld(): void {
    logger.info('Saving world...');
    this.world.save();
  }

  public mainMenu(): void {
    logger.info('Returning to main menu...');
    location.reload();
  }

  private showLoadingScreen(message: string, progress: number = 0): void {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = loadingScreen?.querySelector('.loading-text') as HTMLElement;
    const loadingBar = document.getElementById('loading-progress') as HTMLElement;

    if (loadingText) loadingText.textContent = message;
    if (loadingBar) loadingBar.style.width = `${progress * 100}%`;
  }

  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }
}
