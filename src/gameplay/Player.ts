import * as THREE from 'three';
import { World } from '../world/World';
import { InputHandler } from '../core/InputHandler';
import { HealthSystem, HungerSystem } from './SurvivalSystems';
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
  private inventory: any[] = Array(36).fill(null);
  private hotbar: any[] = Array(9).fill(null);

  // Survival
  private healthSystem: HealthSystem;
  private hungerSystem: HungerSystem;

  // Mining
  private miningTarget: { x: number; y: number; z: number } | null = null;
  private miningProgress: number = 0;
  private miningDuration: number = 0;
  private blockBreakCooldown: number = 0;

  constructor() {
    this.healthSystem = new HealthSystem();
    this.hungerSystem = new HungerSystem();
  }

  public init(world: World, camera: THREE.PerspectiveCamera): void {
    this.world = world;
    this.camera = camera;
    this.position.y = 80;
  }

  public update(deltaTime: number, world: World): void {
    // Update survival systems
    this.hungerSystem.update(deltaTime);

    // Apply gravity
    this.velocity.y -= this.gravity;
    this.velocity.y = Math.max(this.velocity.y, -0.3);

    // Apply velocity
    this.position.add(this.velocity);

    // Collision with world
    this.checkCollisions(world);

    // Update mining
    if (this.miningTarget && this.blockBreakCooldown <= 0) {
      this.updateMining(deltaTime, world);
    } else if (this.blockBreakCooldown > 0) {
      this.blockBreakCooldown -= deltaTime;
    }

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

    const forward3d = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.rotation.y
    );
    const right3d = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.rotation.y
    );

    moveDir.addScaledVector(forward3d, forward + backward);
    moveDir.addScaledVector(right3d, left + right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.isSprinting = inputHandler.isSprinting();
      const speed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;
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
    if (!this.world) return;

    // Raycast to find block
    const raycasted = this.raycastBlock();
    if (raycasted) {
      this.miningTarget = raycasted;
      this.miningProgress = 0;
      logger.info(`Mining block at ${raycasted.x}, ${raycasted.y}, ${raycasted.z}`);
    }
  }

  public stopMining(): void {
    this.miningTarget = null;
    this.miningProgress = 0;
  }

  private updateMining(deltaTime: number, world: World): void {
    if (!this.miningTarget) return;

    const blockId = world.getBlock(
      this.miningTarget.x,
      this.miningTarget.y,
      this.miningTarget.z
    );

    if (blockId === 0) {
      this.miningTarget = null;
      return;
    }

    const blockDef = world.getBlockRegistry().getBlockById(blockId);
    if (!blockDef) return;

    this.miningDuration = blockDef.hardness * 50; // ms
    this.miningProgress += deltaTime / this.miningDuration;

    if (this.miningProgress >= 1.0) {
      // Block broken
      world.setBlock(this.miningTarget.x, this.miningTarget.y, this.miningTarget.z, 0);
      this.addItem({ id: blockId, count: 1 });
      this.miningTarget = null;
      this.miningProgress = 0;
      this.blockBreakCooldown = 0.1;
    }
  }

  public secondaryAction(): void {
    if (!this.world) return;

    const raycasted = this.raycastBlock();
    if (raycasted) {
      // Place block
      const selectedItem = this.getSelectedItem();
      if (selectedItem && selectedItem.id > 0) {
        const adjacent = this.getAdjacentBlock(raycasted);
        if (adjacent) {
          this.world.setBlock(adjacent.x, adjacent.y, adjacent.z, selectedItem.id);
          this.removeItem(selectedItem, 1);
        }
      }
    }
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

  private raycastBlock(): { x: number; y: number; z: number } | null {
    if (!this.camera) return null;

    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
      this.camera.quaternion
    );
    raycaster.ray.origin.copy(this.camera.position);
    raycaster.ray.direction.copy(direction);

    const maxDistance = 4; // 4 blocks reach

    for (let d = 0; d < maxDistance; d++) {
      const point = raycaster.ray.origin
        .clone()
        .addScaledVector(raycaster.ray.direction, d);
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      const z = Math.floor(point.z);

      if (this.world && this.world.getBlock(x, y, z) > 0) {
        return { x, y, z };
      }
    }

    return null;
  }

  private getAdjacentBlock(
    block: { x: number; y: number; z: number }
  ): { x: number; y: number; z: number } | null {
    // Place block adjacent to raycasted block
    return { x: block.x + 1, y: block.y, z: block.z };
  }

  private checkCollisions(world: World): void {
    const playerRadius = 0.3;

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

  public addItem(item: any): void {
    const slot = this.hotbar[this.selectedHotbarSlot];
    if (slot === null) {
      this.hotbar[this.selectedHotbarSlot] = item;
    } else if (slot.id === item.id) {
      slot.count = (slot.count || 1) + (item.count || 1);
    }
  }

  public removeItem(item: any, count: number): void {
    const slot = this.hotbar[this.selectedHotbarSlot];
    if (slot) {
      slot.count = Math.max(0, (slot.count || 1) - count);
      if (slot.count === 0) {
        this.hotbar[this.selectedHotbarSlot] = null;
      }
    }
  }

  public getSelectedItem(): any {
    return this.hotbar[this.selectedHotbarSlot];
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

  public getHealth(): number {
    return this.healthSystem.getHealth();
  }

  public getHunger(): number {
    return this.hungerSystem.getHunger();
  }

  public getMiningProgress(): number {
    return this.miningProgress;
  }
}
