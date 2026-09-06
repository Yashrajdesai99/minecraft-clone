import * as THREE from 'three';
import { World } from '../world/World';
import { InputHandler } from '../core/InputHandler';
import { Logger } from '../utils/Logger';

const logger = new Logger('Player');

export class Player {
  private position: THREE.Vector3 = new THREE.Vector3(0, 80, 0);
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private rotation: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private camera: THREE.PerspectiveCamera | null = null;
  private world: World | null = null;

  private moveSpeed: number = 0.1;
  private sprintSpeed: number = 0.2;
  private jumpForce: number = 0.5;
  private gravity: number = 0.02;

  private isGrounded: boolean = false;
  private isSprinting: boolean = false;
  private selectedHotbarSlot: number = 0;
  private inventory: any[] = Array(36).fill(null); // 36 items
  private hotbar: any[] = Array(9).fill(null); // 9 hotbar items

  public init(world: World, camera: THREE.PerspectiveCamera): void {
    this.world = world;
    this.camera = camera;
    this.position.y = 80; // Spawn above ground
  }

  public update(deltaTime: number, world: World): void {
    // Apply gravity
    this.velocity.y -= this.gravity;
    this.velocity.y = Math.max(this.velocity.y, -0.3); // Terminal velocity

    // Apply velocity
    this.position.add(this.velocity);

    // Collision with world
    this.checkCollisions(world);

    // Update camera position
    if (this.camera) {
      this.camera.position.copy(this.position);
      this.camera.position.y += 1.6; // Eye height
    }
  }

  public handleInput(inputHandler: InputHandler): void {
    const forward = inputHandler.isKeyPressed('w') ? 1 : 0;
    const backward = inputHandler.isKeyPressed('s') ? -1 : 0;
    const left = inputHandler.isKeyPressed('a') ? -1 : 0;
    const right = inputHandler.isKeyPressed('d') ? 1 : 0;

    const moveDir = new THREE.Vector3();

    // Forward/backward relative to camera direction
    const forward3d = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
    const right3d = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

    moveDir.addScaledVector(forward3d, forward + backward);
    moveDir.addScaledVector(right3d, left + right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      const speed = inputHandler.isSprinting() ? this.sprintSpeed : this.moveSpeed;
      moveDir.multiplyScalar(speed);
      this.velocity.x = moveDir.x;
      this.velocity.z = moveDir.z;
    } else {
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }

    if (inputHandler.isJumping() && this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }
  }

  public handleMouseMove(deltaX: number, deltaY: number): void {
    const sensitivity = 0.003;
    this.rotation.y -= deltaX * sensitivity;
    this.rotation.x -= deltaY * sensitivity;
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
  }

  public primaryAction(): void {
    logger.info('Primary action');
    // Mine block
  }

  public secondaryAction(): void {
    logger.info('Secondary action');
    // Place block
  }

  public selectHotbarSlot(slot: number): void {
    if (slot >= 0 && slot < 9) {
      this.selectedHotbarSlot = slot;
      const slots = document.querySelectorAll('.hotbar-slot');
      slots.forEach((s, i) => {
        if (i === slot) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    }
  }

  private checkCollisions(world: World): void {
    const playerRadius = 0.3;
    const playerHeight = 1.8;

    // Simple collision detection with ground
    const groundBlockY = Math.floor(this.position.y);
    const groundBlockX = Math.floor(this.position.x);
    const groundBlockZ = Math.floor(this.position.z);

    const blockBelow = world.getBlock(groundBlockX, groundBlockY - 1, groundBlockZ);
    if (blockBelow > 0) {
      this.isGrounded = true;
      this.position.y = groundBlockY;
      this.velocity.y = 0;
    } else {
      this.isGrounded = false;
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getRotation(): THREE.Euler {
    return this.rotation.clone();
  }

  public getChunkPosition(): { x: number; z: number } {
    return {
      x: Math.floor(this.position.x / 16),
      z: Math.floor(this.position.z / 16)
    };
  }
}
