# Voxel Survival Sandbox - Complete Game

A complete original voxel-based survival sandbox game built with TypeScript and Three.js.

## Features

### Core Systems
- **Voxel Engine**: Full chunk-based voxel rendering with face culling and greedy meshing
- **Terrain Generation**: Procedural world generation with Perlin noise, biomes, caves, and ores
- **Block System**: Comprehensive block registry with 8+ block types and properties
- **Physics**: Player collision detection, gravity, and movement
- **Survival**: Health, hunger, and player progression systems

### Gameplay
- **Building & Breaking**: Mine blocks and place them in the world
- **Inventory System**: 36-slot inventory with hotbar
- **Crafting**: Data-driven recipe system
- **Combat**: Damage calculation, hostile creatures, loot drops
- **Lighting**: Dynamic lighting engine with sunlight and block light
- **Weather**: Dynamic weather system (clear, rain, storm, snow)
- **Water Physics**: Fluid simulation with flow mechanics

### Advanced Features
- **Interactive Blocks**: Doors, chests, furnaces
- **Progression**: XP system with leveling
- **Particles**: Dynamic particle effects for breaking blocks and combat
- **Audio**: Sound system for effects and ambient audio
- **Save System**: Full world serialization and loading
- **UI**: Complete user interface with menus and HUD
- **Multiplayer Foundation**: Server architecture for future multiplayer support

## Project Structure

```
src/
├── core/              # Game loop, input, time systems
├── voxel/             # Block registry, chunks, meshing
├── world/             # Terrain generation, biomes, weather
├── rendering/         # Three.js renderer, lighting, shadows
├── entity/            # Entity system, creatures, AI
├── gameplay/          # Player, inventory, crafting, combat
├── ui/                # UI system and menus
├── audio/             # Audio engine
├── systems/           # Save, command, performance systems
├── multiplayer/       # Multiplayer server foundation
└── utils/             # Logging, noise, config
```

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Development

### Running Tests
```bash
npm run test
npm run test:watch
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Architecture

### Layered Design

1. **Application Layer**: Game class orchestrating all systems
2. **Gameplay Layer**: Player, inventory, crafting, combat, survival
3. **World Layer**: Chunk management, terrain generation, biomes, structures
4. **Voxel Engine**: Block registry, chunk data, meshing, lighting
5. **Entity Engine**: Entity system, creatures, AI, pathfinding
6. **Rendering**: Three.js renderer, camera, shaders, effects
7. **Physics**: Collision detection, gravity, fluids
8. **Audio**: Sound effects and ambient audio
9. **UI**: Menus, HUD, inventory screens
10. **Save System**: World serialization and persistence
11. **Networking**: Multiplayer foundation

## Key Design Decisions

- **Chunk-based voxel rendering** for efficient terrain management
- **Face culling** to reduce vertex count and improve performance
- **Worker threads** for terrain generation (ready for implementation)
- **Event-driven architecture** for loose coupling between systems
- **Data-driven content** for easy extensibility
- **Deterministic procedural generation** for consistent worlds
- **Server-authoritative multiplayer** for security and consistency

## Supported Blocks

- Air
- Grass Block
- Dirt
- Stone
- Sand
- Water
- Lava
- Glass
- Iron Ore (ID: 8)
- Coal Ore (ID: 9)
- Gold Ore (ID: 10)
- Diamond Ore (ID: 11)

## Biomes

- Plains
- Forest
- Desert
- Mountains
- Ocean
- Tundra

## Game Modes

- **Survival**: Health, hunger, resource management
- **Creative**: Infinite items, instant building
- **Spectator**: Free camera, no interaction

## Progression

- Experience points from mining, crafting, and combat
- Level-based progression system
- Equipment upgrades and enhancements

## Known Limitations

- Multiplayer is not yet fully implemented
- Limited NPC interactions
- No villages or structured trade systems yet
- Redstone-like automation system not yet implemented
- Map system is placeholder

## Future Enhancements

- [ ] Full multiplayer support
- [ ] Advanced automation systems
- [ ] Boss encounters and dungeons
- [ ] More biomes and terrain features
- [ ] Trading system with NPCs
- [ ] Enchantment system
- [ ] More complex crafting recipes
- [ ] Custom worldgen options
- [ ] Modding support
- [ ] Mobile optimization

## Performance Targets

- 60 FPS on modern hardware
- Render distance: 8 chunks (configurable)
- Support for 1000+ entities
- 10,000 concurrent particles
- Chunk generation < 100ms per chunk

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please ensure all code follows TypeScript best practices and includes appropriate error handling.
