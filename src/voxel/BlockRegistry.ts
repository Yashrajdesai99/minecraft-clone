export interface BlockProperties {
  id: number;
  name: string;
  displayName: string;
  hardness: number;
  blastResistance: number;
  flammability: number;
  friction: number;
  slipperiness: number;
  transparent: boolean;
  opaque: boolean;
  emissive: boolean;
  lightLevel: number;
  solid: boolean;
  replaceable: boolean;
  climbable: boolean;
  fluid: boolean;
  gravityAffected: boolean;
  requiresTool: boolean;
  requiredToolType: string | null;
  requiredToolTier: number;
  drops: { item: string; count: number }[];
  experience: number;
  textures: {
    top: number;
    bottom: number;
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export class BlockRegistry {
  private blocks: Map<number, BlockProperties> = new Map();
  private blocksByName: Map<string, BlockProperties> = new Map();
  private nextId: number = 0;

  constructor() {
    this.registerDefaultBlocks();
  }

  private registerDefaultBlocks(): void {
    this.register({
      id: 0,
      name: 'air',
      displayName: 'Air',
      hardness: -1,
      blastResistance: 0,
      flammability: 0,
      friction: 0.6,
      slipperiness: 0.6,
      transparent: true,
      opaque: false,
      emissive: false,
      lightLevel: 0,
      solid: false,
      replaceable: true,
      climbable: false,
      fluid: false,
      gravityAffected: false,
      requiresTool: false,
      requiredToolType: null,
      requiredToolTier: 0,
      drops: [],
      experience: 0,
      textures: { top: 0, bottom: 0, north: 0, south: 0, east: 0, west: 0 }
    });

    this.register({
      id: 1,
      name: 'grass_block',
      displayName: 'Grass Block',
      hardness: 0.6,
      blastResistance: 0.6,
      flammability: 0,
      friction: 0.8,
      slipperiness: 0.6,
      transparent: false,
      opaque: true,
      emissive: false,
      lightLevel: 0,
      solid: true,
      replaceable: false,
      climbable: false,
      fluid: false,
      gravityAffected: false,
      requiresTool: false,
      requiredToolType: null,
      requiredToolTier: 0,
      drops: [{ item: 'dirt', count: 1 }],
      experience: 0,
      textures: { top: 1, bottom: 3, north: 2, south: 2, east: 2, west: 2 }
    });

    this.register({
      id: 2,
      name: 'dirt',
      displayName: 'Dirt',
      hardness: 0.5,
      blastResistance: 0.5,
      flammability: 0,
      friction: 0.8,
      slipperiness: 0.6,
      transparent: false,
      opaque: true,
      emissive: false,
      lightLevel: 0,
      solid: true,
      replaceable: false,
      climbable: false,
      fluid: false,
      gravityAffected: false,
      requiresTool: false,
      requiredToolType: null,
      requiredToolTier: 0,
      drops: [{ item: 'dirt', count: 1 }],
      experience: 0,
      textures: { top: 3, bottom: 3, north: 3, south: 3, east: 3, west: 3 }
    });

    this.register({
      id: 3,
      name: 'stone',
      displayName: 'Stone',
      hardness: 1.5,
      blastResistance: 6,
      flammability: 0,
      friction: 0.6,
      slipperiness: 0.6,
      transparent: false,
      opaque: true,
      emissive: false,
      lightLevel: 0,
      solid: true,
      replaceable: false,
      climbable: false,
      fluid: false,
      gravityAffected: false,
      requiresTool: true,
      requiredToolType: 'pickaxe',
      requiredToolTier: 0,
      drops: [{ item: 'cobblestone', count: 1 }],
      experience: 0,
      textures: { top: 4, bottom: 4, north: 4, south: 4, east: 4, west: 4 }
    });

    this.register({
      id: 4,
      name: 'sand',
      displayName: 'Sand',
      hardness: 0.5,
      blastResistance: 0.5,
      flammability: 0,
      friction: 0.8,
      slipperiness: 0.6,
      transparent: false,
      opaque: true,
      emissive: false,
      lightLevel: 0,
      solid: true,
      replaceable: false,
      climbable: false,
      fluid: false,
      gravityAffected: true,
      requiresTool: false,
      requiredToolType: null,
      requiredToolTier: 0,
      drops: [{ item: 'sand', count: 1 }],
      experience: 0,
      textures: { top: 5, bottom: 5, north: 5, south: 5, east: 5, west: 5 }
    });

    this.register({
      id: 5,
      name: 'water',
      displayName: 'Water',
      hardness: -1,
      blastResistance: 100,
      flammability: 0,
      friction: 0.6,
      slipperiness: 0.8,
      transparent: true,
      opaque: false,
      emissive: false,
      lightLevel: 0,
      solid: false,
      replaceable: true,
      climbable: false,
      fluid: true,
      gravityAffected: false,
      requiresTool: false,
      requiredToolType: null,
      requiredToolTier: 0,
      drops: [],
      experience: 0,
      textures: { top: 6, bottom: 6, north: 6, south: 6, east: 6, west: 6 }
    });

    this.register({
      id: 6,
      name: 'lava',
      displayName: 'Lava',
      hardness: -1,
      blastResistance: 100,
      flammability: 0,
      friction: 0.6,
      slipperiness: 0.8,
      transparent: true,
      opaque: false,
      emissive: true,
      lightLevel: 15,
      solid: false,
      replaceable: true,
      climbable: false,
      fluid: true,
      gravityAffected: false,
      requiresTool: false,
      requiredToolType: null,
      requiredToolTier: 0,
      drops: [],
      experience: 0,
      textures: { top: 7, bottom: 7, north: 7, south: 7, east: 7, west: 7 }
    });

    this.register({
      id: 7,
      name: 'glass',
      displayName: 'Glass',
      hardness: 0.3,
      blastResistance: 0.3,
      flammability: 0,
      friction: 0.6,
      slipperiness: 0.6,
      transparent: true,
      opaque: false,
      emissive: false,
      lightLevel: 0,
      solid: true,
      replaceable: false,
      climbable: false,
      fluid: false,
      gravityAffected: false,
      requiresTool: false,
      requiredToolType: null,
      requiredToolTier: 0,
      drops: [],
      experience: 0,
      textures: { top: 8, bottom: 8, north: 8, south: 8, east: 8, west: 8 }
    });
  }

  public register(block: BlockProperties): void {
    this.blocks.set(block.id, block);
    this.blocksByName.set(block.name, block);
    this.nextId = Math.max(this.nextId, block.id + 1);
  }

  public getBlockById(id: number): BlockProperties | undefined {
    return this.blocks.get(id);
  }

  public getBlockByName(name: string): BlockProperties | undefined {
    return this.blocksByName.get(name);
  }

  public getAllBlocks(): BlockProperties[] {
    return Array.from(this.blocks.values());
  }

  public isBlock(id: number): boolean {
    return this.blocks.has(id);
  }
}
