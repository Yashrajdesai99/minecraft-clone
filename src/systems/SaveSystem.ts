import { Logger } from '../utils/Logger';

const logger = new Logger('SaveSystem');

export interface WorldSaveData {
  version: number;
  gameVersion: string;
  generatorVersion: number;
  seed: number;
  worldName: string;
  worldTime: number;
  difficulty: string;
  gameMode: string;
  playerData: PlayerSaveData;
  modifiedChunks: Map<string, Uint16Array>;
  structures: any[];
}

export interface PlayerSaveData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  health: number;
  hunger: number;
  inventory: any[];
  hotbar: any[];
}

export class SaveSystem {
  private readonly VERSION = 1;
  private readonly GAME_VERSION = '0.1.0';
  private readonly GENERATOR_VERSION = 1;

  public async saveWorld(
    worldName: string,
    seed: number,
    worldData: any
  ): Promise<boolean> {
    try {
      const saveData: WorldSaveData = {
        version: this.VERSION,
        gameVersion: this.GAME_VERSION,
        generatorVersion: this.GENERATOR_VERSION,
        seed,
        worldName,
        worldTime: worldData.worldTime || 0,
        difficulty: worldData.difficulty || 'normal',
        gameMode: worldData.gameMode || 'survival',
        playerData: this.serializePlayer(worldData.player),
        modifiedChunks: new Map(),
        structures: []
      };

      const serialized = this.serialize(saveData);
      await this.writeToStorage(worldName, serialized);
      logger.info(`World saved: ${worldName}`);
      return true;
    } catch (error) {
      logger.error('Failed to save world:', error);
      return false;
    }
  }

  public async loadWorld(worldName: string): Promise<WorldSaveData | null> {
    try {
      const serialized = await this.readFromStorage(worldName);
      if (!serialized) return null;

      const saveData = this.deserialize(serialized);
      logger.info(`World loaded: ${worldName}`);
      return saveData;
    } catch (error) {
      logger.error('Failed to load world:', error);
      return null;
    }
  }

  private serializePlayer(player: any): PlayerSaveData {
    return {
      position: {
        x: player.position?.x || 0,
        y: player.position?.y || 0,
        z: player.position?.z || 0
      },
      rotation: {
        x: player.rotation?.x || 0,
        y: player.rotation?.y || 0,
        z: player.rotation?.z || 0
      },
      health: player.healthSystem?.getHealth() || 20,
      hunger: player.hungerSystem?.getHunger() || 20,
      inventory: player.inventory || [],
      hotbar: player.hotbar || []
    };
  }

  private serialize(data: any): string {
    return JSON.stringify(data, (key, value) => {
      if (value instanceof Map) {
        return Array.from(value.entries());
      }
      return value;
    });
  }

  private deserialize(json: string): WorldSaveData {
    return JSON.parse(json, (key, value) => {
      if (key === 'modifiedChunks' && Array.isArray(value)) {
        return new Map(value);
      }
      return value;
    });
  }

  private async writeToStorage(key: string, data: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`world_${key}`, data);
    }
  }

  private async readFromStorage(key: string): Promise<string | null> {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(`world_${key}`);
    }
    return null;
  }

  public getWorldList(): string[] {
    const worlds: string[] = [];
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('world_')) {
          worlds.push(key.replace('world_', ''));
        }
      }
    }
    return worlds;
  }
}
