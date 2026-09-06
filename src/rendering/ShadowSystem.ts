import * as THREE from 'three';
import { Logger } from '../utils/Logger';

const logger = new Logger('ShadowSystem');

export class ShadowSystem {
  private shadowMap: THREE.WebGLRenderTarget;
  private shadowCamera: THREE.OrthographicCamera;
  private light: THREE.DirectionalLight;

  constructor(light: THREE.DirectionalLight) {
    this.light = light;
    this.light.castShadow = true;

    this.shadowMap = new THREE.WebGLRenderTarget(2048, 2048);
    this.shadowMap.texture.magFilter = THREE.NearestFilter;
    this.shadowMap.texture.minFilter = THREE.NearestFilter;

    this.shadowCamera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
  }

  public update(playerPosition: THREE.Vector3): void {
    this.shadowCamera.position.copy(playerPosition);
    this.shadowCamera.position.y = 100;
    this.shadowCamera.lookAt(playerPosition);
    this.shadowCamera.updateProjectionMatrix();
  }

  public getShadowMap(): THREE.WebGLRenderTarget {
    return this.shadowMap;
  }

  public dispose(): void {
    this.shadowMap.dispose();
  }
}
