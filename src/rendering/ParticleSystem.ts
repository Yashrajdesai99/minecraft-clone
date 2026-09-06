import * as THREE from 'three';
import { Logger } from '../utils/Logger';

const logger = new Logger('ParticleSystem');

export interface ParticleEmitterConfig {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  size: number;
  count: number;
  color?: number;
  emissionRate?: number;
}

export class Particle {
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public lifetime: number;
  public age: number = 0;
  public size: number;
  public color: THREE.Color;

  constructor(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    lifetime: number,
    size: number,
    color: number = 0xffffff
  ) {
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.lifetime = lifetime;
    this.size = size;
    this.color = new THREE.Color(color);
  }

  public update(deltaTime: number): void {
    this.age += deltaTime;
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.velocity.y -= 0.05;
  }

  public isAlive(): boolean {
    return this.age < this.lifetime;
  }

  public getAlpha(): number {
    return 1.0 - this.age / this.lifetime;
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 10000;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private mesh: THREE.Points;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 0.2,
      sizeAttenuation: true,
      transparent: true
    });
    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  public emit(config: ParticleEmitterConfig): void {
    for (let i = 0; i < config.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.2;
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * 0.2,
        Math.sin(angle) * speed
      ).add(config.velocity);

      const particle = new Particle(
        config.position,
        velocity,
        config.lifetime,
        config.size,
        config.color
      );
      this.particles.push(particle);
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(deltaTime);
      if (!this.particles[i].isAlive()) {
        this.particles.splice(i, 1);
      }
    }
    this.updateGeometry();
  }

  private updateGeometry(): void {
    if (this.particles.length === 0) {
      this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(), 3));
      return;
    }

    const positions = new Float32Array(this.particles.length * 3);
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;
    }
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  }

  public getMesh(): THREE.Points {
    return this.mesh;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
