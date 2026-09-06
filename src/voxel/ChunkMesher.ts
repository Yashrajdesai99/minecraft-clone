import * as THREE from 'three';
import { Chunk, CHUNK_SIZE, CHUNK_HEIGHT } from './Chunk';
import { BlockRegistry } from './BlockRegistry';

interface Vertex {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  u: number;
  v: number;
  ao: number;
  light: number;
}

export class ChunkMesher {
  private blockRegistry: BlockRegistry;
  private readonly FACES = [
    // Right face
    { dx: 1, dy: 0, dz: 0, dir: 'east', vertices: [[0,0,1],[0,1,1],[1,1,1],[1,0,1]] },
    // Left face
    { dx: -1, dy: 0, dz: 0, dir: 'west', vertices: [[1,0,0],[1,1,0],[0,1,0],[0,0,0]] },
    // Top face
    { dx: 0, dy: 1, dz: 0, dir: 'top', vertices: [[0,1,0],[0,1,1],[1,1,1],[1,1,0]] },
    // Bottom face
    { dx: 0, dy: -1, dz: 0, dir: 'bottom', vertices: [[0,0,1],[0,0,0],[1,0,0],[1,0,1]] },
    // Front face
    { dx: 0, dy: 0, dz: 1, dir: 'south', vertices: [[0,0,0],[0,1,0],[1,1,0],[1,0,0]] },
    // Back face
    { dx: 0, dy: 0, dz: -1, dir: 'north', vertices: [[1,0,1],[1,1,1],[0,1,1],[0,0,1]] }
  ];

  constructor(blockRegistry: BlockRegistry) {
    this.blockRegistry = blockRegistry;
  }

  public mesh(chunk: Chunk, neighbors: Map<string, Chunk>): THREE.Mesh | null {
    const vertices: number[] = [];
    const indices: number[] = [];
    let vertexCount = 0;

    // Iterate through all voxels
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const blockId = chunk.getBlock(x, y, z);
          const blockDef = this.blockRegistry.getBlockById(blockId);

          if (!blockDef || !blockDef.solid) continue;

          // Check each face for culling
          for (const face of this.FACES) {
            const nx = x + face.dx;
            const ny = y + face.dy;
            const nz = z + face.dz;

            let neighborBlockId = 0;
            
            // Handle neighbor chunks
            if (nx < 0) {
              const neighbor = neighbors.get('west');
              neighborBlockId = neighbor ? neighbor.getBlock(CHUNK_SIZE - 1, ny, nz) : 0;
            } else if (nx >= CHUNK_SIZE) {
              const neighbor = neighbors.get('east');
              neighborBlockId = neighbor ? neighbor.getBlock(0, ny, nz) : 0;
            } else if (nz < 0) {
              const neighbor = neighbors.get('north');
              neighborBlockId = neighbor ? neighbor.getBlock(nx, ny, CHUNK_SIZE - 1) : 0;
            } else if (nz >= CHUNK_SIZE) {
              const neighbor = neighbors.get('south');
              neighborBlockId = neighbor ? neighbor.getBlock(nx, ny, 0) : 0;
            } else if (ny < 0 || ny >= CHUNK_HEIGHT) {
              neighborBlockId = 0;
            } else {
              neighborBlockId = chunk.getBlock(nx, ny, nz);
            }

            const neighborDef = this.blockRegistry.getBlockById(neighborBlockId);

            // Face culling: skip if neighbor is opaque
            if (neighborDef && neighborDef.opaque) continue;

            // Add face vertices
            const light = chunk.getLight(x, y, z);
            const ao = this.calculateAO(chunk, x, y, z, face.dx, face.dy, face.dz, neighbors);

            for (let i = 0; i < 4; i++) {
              const [vx, vy, vz] = face.vertices[i];
              vertices.push(
                x + vx, y + vy, z + vz,
                face.dx !== 0 ? 1 : 0, face.dy !== 0 ? 1 : 0, face.dz !== 0 ? 1 : 0,
                i % 2, Math.floor(i / 2),
                ao,
                light
              );
            }

            // Add indices for quad (2 triangles)
            indices.push(
              vertexCount, vertexCount + 1, vertexCount + 2,
              vertexCount, vertexCount + 2, vertexCount + 3
            );
            vertexCount += 4;
          }
        }
      }
    }

    if (vertices.length === 0) return null;

    return this.createMesh(vertices, indices);
  }

  private calculateAO(chunk: Chunk, x: number, y: number, z: number, dx: number, dy: number, dz: number, neighbors: Map<string, Chunk>): number {
    // Simplified AO calculation
    return 1.0;
  }

  private createMesh(vertices: number[], indices: number[]): THREE.Mesh {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(vertices.length / 10 * 3);
    const normals = new Float32Array(vertices.length / 10 * 3);
    const uvs = new Float32Array(vertices.length / 10 * 2);
    const aos = new Float32Array(vertices.length / 10);
    const lights = new Float32Array(vertices.length / 10);

    for (let i = 0; i < vertices.length; i += 10) {
      const idx = i / 10;
      positions[idx * 3] = vertices[i];
      positions[idx * 3 + 1] = vertices[i + 1];
      positions[idx * 3 + 2] = vertices[i + 2];

      normals[idx * 3] = vertices[i + 3];
      normals[idx * 3 + 1] = vertices[i + 4];
      normals[idx * 3 + 2] = vertices[i + 5];

      uvs[idx * 2] = vertices[i + 6];
      uvs[idx * 2 + 1] = vertices[i + 7];

      aos[idx] = vertices[i + 8];
      lights[idx] = vertices[i + 9];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute('ao', new THREE.BufferAttribute(aos, 1));
    geometry.setAttribute('light', new THREE.BufferAttribute(lights, 1));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.FrontSide,
      wireframe: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }
}
