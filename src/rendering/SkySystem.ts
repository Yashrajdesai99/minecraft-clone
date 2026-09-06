import * as THREE from 'three';
import { Logger } from '../utils/Logger';

const logger = new Logger('SkySystem');

export class SkySystem {
  private skyMesh: THREE.Mesh;
  private sunLight: THREE.DirectionalLight;
  private moonMesh: THREE.Mesh;
  private starMesh: THREE.Points;
  private dayTime: number = 0;
  private readonly TICKS_PER_DAY = 24000;
  private skyColor: THREE.Color = new THREE.Color(0x87ceeb);

  constructor(scene: THREE.Scene, sunLight: THREE.DirectionalLight) {
    this.sunLight = sunLight;

    // Sky dome
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: this.skyColor,
      side: THREE.BackSide
    });
    this.skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(this.skyMesh);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(10, 16, 16);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    this.moonMesh.position.set(100, 100, -200);
    scene.add(this.moonMesh);

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 1000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    this.starMesh = new THREE.Points(starGeometry, starMaterial);
    scene.add(this.starMesh);
  }

  public update(dayTime: number, playerPosition: THREE.Vector3): void {
    this.dayTime = dayTime;

    // Update sky color based on time
    const time = dayTime / this.TICKS_PER_DAY;
    this.updateSkyColor(time);

    // Update sun/moon position
    const angle = time * Math.PI * 2;
    const sunDistance = 150;
    this.sunLight.position.set(
      playerPosition.x + Math.cos(angle) * sunDistance,
      playerPosition.y + Math.sin(angle) * sunDistance,
      playerPosition.z
    );

    // Update moon position (opposite to sun)
    this.moonMesh.position.set(
      playerPosition.x + Math.cos(angle + Math.PI) * sunDistance,
      playerPosition.y + Math.sin(angle + Math.PI) * sunDistance,
      playerPosition.z
    );

    // Stars visible at night
    this.starMesh.visible = time > 0.25 && time < 0.75;
  }

  private updateSkyColor(time: number): void {
    let color: THREE.Color;

    if (time < 0.25) {
      // Night to sunrise
      const t = time / 0.25;
      color = new THREE.Color(0x1a1a2e).lerp(new THREE.Color(0xff6b35), t);
    } else if (time < 0.5) {
      // Sunrise to day
      const t = (time - 0.25) / 0.25;
      color = new THREE.Color(0xff6b35).lerp(new THREE.Color(0x87ceeb), t);
    } else if (time < 0.75) {
      // Day to sunset
      const t = (time - 0.5) / 0.25;
      color = new THREE.Color(0x87ceeb).lerp(new THREE.Color(0xff6b35), t);
    } else {
      // Sunset to night
      const t = (time - 0.75) / 0.25;
      color = new THREE.Color(0xff6b35).lerp(new THREE.Color(0x1a1a2e), t);
    }

    this.skyMesh.material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.BackSide
    });
  }
}
