import * as THREE from 'three';
import { BlockRegistry } from './BlockRegistry';
import { ChunkMesher } from './ChunkMesher';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 256;

export interface ChunkCoords {
  x: number;
  z: number;
}

export enum ChunkState {
  UNLOADED = 'UNLOADED',
  QUEUED = 'QUEUED',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  MESHING = 'MESHING',
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  DIRTY = 'DIRTY',
  SAVING = 'SAVING'
}

export class Chunk {
  public readonly coords: ChunkCoords;
  public state: ChunkState = ChunkState.UNLOADED;
  
  private voxelData: Uint16Array;
  private metadata: Map<number, any> = new Map();
  private lightData: Uint8Array;
  private mesh: THREE.Mesh | null = null;
  private isDirty: boolean = true;
  private needsRemesh: boolean = true;
  private lastAccessTime: number = Date.now();

  constructor(x: number, z: number) {
    this.coords = { x, z };
    this.voxelData = new Uint16Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    this.lightData = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
  }

  public setBlock(x: number, y: number, z: number, id: number): boolean {
    if (!this.isValidPosition(x, y, z)) return false;
    
    const index = this.getIndex(x, y, z);
    this.voxelData[index] = id;
    this.isDirty = true;
    this.needsRemesh = true;
    return true;
  }

  public getBlock(x: number, y: number, z: number): number {
    if (!this.isValidPosition(x, y, z)) return 0;
    
    const index = this.getIndex(x, y, z);
    return this.voxelData[index];
  }

  public setLight(x: number, y: number, z: number, light: number): void {
    if (!this.isValidPosition(x, y, z)) return;
    
    const index = this.getIndex(x, y, z);
    this.lightData[index] = Math.min(15, Math.max(0, light));
  }

  public getLight(x: number, y: number, z: number): number {
    if (!this.isValidPosition(x, y, z)) return 0;
    
    const index = this.getIndex(x, y, z);
    return this.lightData[index];
  }

  public markDirty(): void {
    this.isDirty = true;
    this.needsRemesh = true;
    this.lastAccessTime = Date.now();
  }

  public isVoxelDirty(): boolean {
    return this.isDirty;
  }

  public needsMesh(): boolean {
    return this.needsRemesh;
  }

  public setMesh(mesh: THREE.Mesh | null): void {
    this.mesh = mesh;
    this.needsRemesh = false;
    this.isDirty = false;
  }

  public getMesh(): THREE.Mesh | null {
    return this.mesh;
  }

  public getVoxelData(): Uint16Array {
    return this.voxelData;
  }

  public setVoxelData(data: Uint16Array): void {
    this.voxelData = data;
    this.isDirty = true;
    this.needsRemesh = true;
  }

  public getWorldPosition(x: number, y: number, z: number): THREE.Vector3 {
    return new THREE.Vector3(
      this.coords.x * CHUNK_SIZE + x,
      y,
      this.coords.z * CHUNK_SIZE + z
    );
  }

  public dispose(): void {
    if (this.mesh) {
      if (this.mesh.geometry) this.mesh.geometry.dispose();
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(m => m.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
      this.mesh = null;
    }
  }

  private isValidPosition(x: number, y: number, z: number): boolean {
    return x >= 0 && x < CHUNK_SIZE &&
           y >= 0 && y < CHUNK_HEIGHT &&
           z >= 0 && z < CHUNK_SIZE;
  }

  private getIndex(x: number, y: number, z: number): number {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }
}
