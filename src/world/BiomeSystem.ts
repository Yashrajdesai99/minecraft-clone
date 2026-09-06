export interface BiomeData {
  name: string;
  temperature: number;
  humidity: number;
  surfaceBlock: number;
  subsurfaceBlock: number;
  underground: number;
  minHeight: number;
  maxHeight: number;
  treeFrequency: number;
  grassFrequency: number;
}

export class BiomeSystem {
  private biomes: BiomeData[] = [
    {
      name: 'plains',
      temperature: 0.8,
      humidity: 0.5,
      surfaceBlock: 1, // grass
      subsurfaceBlock: 2, // dirt
      underground: 3, // stone
      minHeight: 60,
      maxHeight: 80,
      treeFrequency: 0.1,
      grassFrequency: 0.7
    },
    {
      name: 'forest',
      temperature: 0.7,
      humidity: 0.7,
      surfaceBlock: 1, // grass
      subsurfaceBlock: 2, // dirt
      underground: 3, // stone
      minHeight: 55,
      maxHeight: 90,
      treeFrequency: 0.4,
      grassFrequency: 0.8
    },
    {
      name: 'desert',
      temperature: 1.0,
      humidity: 0.1,
      surfaceBlock: 4, // sand
      subsurfaceBlock: 4, // sand
      underground: 3, // stone
      minHeight: 50,
      maxHeight: 75,
      treeFrequency: 0.05,
      grassFrequency: 0.2
    },
    {
      name: 'mountains',
      temperature: 0.4,
      humidity: 0.5,
      surfaceBlock: 1, // grass
      subsurfaceBlock: 2, // dirt
      underground: 3, // stone
      minHeight: 80,
      maxHeight: 150,
      treeFrequency: 0.15,
      grassFrequency: 0.4
    },
    {
      name: 'ocean',
      temperature: 0.5,
      humidity: 1.0,
      surfaceBlock: 5, // water
      subsurfaceBlock: 5, // water
      underground: 3, // stone
      minHeight: 30,
      maxHeight: 50,
      treeFrequency: 0.0,
      grassFrequency: 0.0
    },
    {
      name: 'tundra',
      temperature: 0.0,
      humidity: 0.3,
      surfaceBlock: 1, // grass (will be snowed)
      subsurfaceBlock: 2, // dirt
      underground: 3, // stone
      minHeight: 50,
      maxHeight: 85,
      treeFrequency: 0.1,
      grassFrequency: 0.3
    }
  ];

  public getBiome(temperature: number, humidity: number): BiomeData {
    let closestBiome = this.biomes[0];
    let closestDistance = Infinity;

    for (const biome of this.biomes) {
      const distance =
        Math.pow(temperature - biome.temperature, 2) +
        Math.pow(humidity - biome.humidity, 2);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestBiome = biome;
      }
    }

    return closestBiome;
  }
}
