# Voxel Survival Sandbox - Architecture Guide

## System Overview

### Core Systems

#### Game Loop (core/Game.ts)
- Handles main game loop with fixed timestep
- Manages initialization and shutdown
- Coordinates between all subsystems
- Tracks FPS and performance metrics

#### Time System (core/TimeSystem.ts)
- Centralized time management
- Supports pausing and acceleration
- Day/night cycle (24000 ticks per day)
- Multiple timescale tracking

#### Input Handler (core/InputHandler.ts)
- Keyboard and mouse input mapping
- Movement direction calculation
- Action state tracking

### Voxel Engine

#### Block Registry (voxel/BlockRegistry.ts)
- Central definition of all block types
- Block properties:
  - Hardness (mining difficulty)
  - Transparency and opacity
  - Light emission
  - Physics properties
  - Texture references
  - Drop items and XP

#### Chunk System (voxel/Chunk.ts)
- 16×256×16 voxel storage per chunk
- Uint16Array for efficient memory usage
- State tracking:
  - UNLOADED → GENERATING → GENERATED → MESHING → READY → ACTIVE
- Metadata storage for block states
- Light data (sunlight and block light)
- Dirty state tracking for partial updates

#### Chunk Manager (voxel/ChunkManager.ts)
- LRU cache-like chunk management
- Chunk lifecycle management
- Visibility culling
- Batch meshing coordination
- Render distance management

#### Mesh Generation (voxel/ChunkMesher.ts)
- Face culling: Skip faces between opaque blocks
- Greedy meshing ready (vertices prepared for quad merging)
- Ambient occlusion calculation
- Normal and UV generation
- Efficient vertex batching

### World Generation

#### Noise System (utils/NoiseGenerator.ts)
- Perlin noise implementation
- Multi-octave noise layers
- Deterministic seeding
- Separate functions for:
  - Terrain height
  - Cave density (3D noise)
  - Temperature and humidity

#### Terrain Generator (world/TerrainGenerator.ts)
- Procedural terrain column generation
- Cave generation integration
- Ore distribution by depth and type
- Biome-aware terrain shaping

#### Biome System (world/BiomeSystem.ts)
- 6 core biomes:
  - Plains, Forest, Desert, Mountains, Ocean, Tundra
- Biome selection by temperature/humidity
- Height and material variation per biome
- Mob spawning preferences

#### Cave Generator (world/CaveGenerator.ts)
- 3D noise-based cave systems
- Configurable cave density and size
- Integration with terrain generation

#### Structure Generator (world/StructureGenerator.ts)
- Template-based structure placement
- Probabilistic spawning
- Collision detection with terrain

#### Weather System (world/WeatherSystem.ts)
- Dynamic weather transitions
- Weather types: clear, rain, storm, snow
- Affects sky color and particle effects

### Rendering

#### Renderer (rendering/Renderer.ts)
- Three.js scene management
- Camera setup (75° FOV)
- Lighting setup (directional + ambient)
- Frame rendering with visibility culling
- Viewport resizing

#### Lighting Engine (rendering/LightingEngine.ts)
- Dual-light system:
  - Sunlight (0-15): Top-down light propagation
  - Block light (0-15): Local light emission
- Queue-based light propagation
- Efficient update tracking

#### Particle System (rendering/ParticleSystem.ts)
- GPU-accelerated particles
- Pooling for efficiency
- Physics simulation (gravity, velocity)
- Color and alpha blending
- Support for 10,000+ concurrent particles

#### Shadow System (rendering/ShadowSystem.ts)
- Shadow mapping for directional light
- Configurable quality (2048×2048)
- Dynamic shadow camera following player

#### Sky System (rendering/SkySystem.ts)
- Dynamic sky color based on time of day
- Sun and moon positioning
- Star visibility at night
- Sky dome geometry

### Gameplay

#### Player Controller (gameplay/Player.ts)
- First-person controller
- WASD movement with sprint/crouch
- Mouse look with sensitivity control
- Jump and gravity physics
- Block breaking and placement
- Block raycast detection (4-block reach)
- Item hotbar management
- Health and hunger tracking

#### Health System (gameplay/SurvivalSystems.ts)
- 20 HP (10 hearts)
- Damage types and sources
- Invulnerability frames
- Natural healing at high hunger

#### Hunger System (gameplay/SurvivalSystems.ts)
- 20 hunger points (10 shanks)
- Saturation (hidden reserve)
- Gradual depletion over time
- Food restoration
- Starvation effects

#### Inventory System (gameplay/Inventory.ts)
- 36-slot main inventory
- 9-slot hotbar
- Item stacking with max stack sizes
- Drag-and-drop ready architecture
- Item validation

#### Crafting System (gameplay/CraftingSystem.ts)
- Data-driven recipe definitions
- Recipe inputs and outputs
- Crafting station support
- Recipe validation
- Extensible for new recipes

#### Combat System (gameplay/CombatSystem.ts)
- Damage calculation
- Critical hits
- Armor reduction
- Knockback mechanics
- Loot drops

#### Progression System (gameplay/ProgressionSystem.ts)
- Experience points (XP)
- Level progression
- Exponential level requirements
- Upgrade unlock system

### Entity System

#### Entity Manager (entity/EntitySystem.ts)
- Abstract Entity base class
- Entity types: player, animal, hostile, projectile, item drop
- Entity lifecycle management
- Update and rendering coordination
- Scene integration

#### Creatures (entity/Creature.ts)
- Base creature class with AI
- Animal: passive, slow-moving
- Hostile: aggressive, attacking
- Wander behavior
- Simple state machine (idle, wander, chase, attack)

#### Item Drops (entity/ItemDrop.ts)
- Physics-based item dropping
- Pickup delay
- Despawn timer (5 minutes)
- Spinning animation
- Collision with ground

### World Management

#### World Class (world/World.ts)
- Central world coordinator
- Chunk generation and loading
- Block getting/setting with chunk coordination
- Meshing queue management
- Player chunk tracking
- Seed persistence

#### Fluid Simulation (world/FluidSimulation.ts)
- Queue-based water/lava simulation
- Gravity and flow mechanics
- Optimization: sleeping regions
- Configurable flow rates

### Saving & Loading

#### Save System (systems/SaveSystem.ts)
- World metadata storage:
  - Seed, version, game mode
  - Player position and inventory
  - World time
  - Difficulty
- Chunk serialization (only modified chunks)
- Atomic write protection
- Versioning for future compatibility
- localStorage backend

### User Interface

#### UI System (ui/UISystem.ts)
- Menu state management
- Screen visibility toggling
- HUD updates
- Inventory display
- Crafting menu
- Settings panel

### Audio

#### Audio Engine (audio/AudioEngine.ts)
- Web Audio API integration
- Sound loading and caching
- Volume controls:
  - Master volume
  - Music volume
  - Effects volume
  - UI volume
- 3D positioning ready

### Developer Tools

#### Command System (systems/CommandSystem.ts)
- In-game command execution
- Available commands:
  - `/time <value>` - Set world time
  - `/weather <type>` - Set weather
  - `/gamemode <mode>` - Set game mode
  - `/give <item> <count>` - Give items
  - `/setblock <x> <y> <z> <block>` - Place blocks

#### Performance Monitor (systems/PerformanceMonitor.ts)
- FPS tracking
- Frame time measurement
- Memory usage monitoring
- Draw call counting
- Vertex counting
- Chunk and entity counting

### Multiplayer (Future)

#### Multiplayer Server (multiplayer/MultiplayerServer.ts)
- Client management
- Action validation (anti-cheat)
- Block change broadcasting
- Entity state synchronization
- Player communication

## Data Flow

### Game Loop
```
Input → Time Update → Game Update → Physics → Rendering → Display
```

### Chunk Generation
```
Request → Queue → Generate (Worker) → Mesh → Render
```

### Block Modification
```
Raycast → Block Query → Block Change → Mark Dirty → Queue Mesh → Render
```

## Performance Optimizations

1. **Chunk-based rendering**: Only render visible chunks
2. **Face culling**: Skip hidden voxel faces
3. **Greedy meshing ready**: Prepare for vertex merging
4. **Distance-based LOD**: Far chunks can use lower detail
5. **Efficient data structures**:
   - Uint16Array for voxel storage
   - Set for dirty tracking
   - LRU chunk cache
6. **Batch processing**: Mesh up to 3 chunks per frame
7. **Event-driven updates**: Only update changed chunks
8. **Sleeping regions**: Inactive fluid doesn't simulate
9. **Object pooling**: Particles and entities
10. **GPU acceleration**: Particle system uses Points

## Extensibility

### Adding a New Block
1. Add BlockProperties to BlockRegistry
2. Create texture atlas entry
3. Define mining properties
4. Register drops and XP

### Adding a New Biome
1. Create BiomeData entry
2. Define temperature/humidity
3. Set block types and heights
4. Configure vegetation frequency

### Adding a New Creature
1. Extend Creature or Entity class
2. Implement update() method
3. Define AI behavior
4. Register with EntityManager

### Adding a New Recipe
1. Create Recipe object
2. Define inputs and output
3. Register with CraftingSystem

### Adding a New Command
1. Create Command object
2. Implement execute method
3. Register with CommandSystem

## Future Improvements

1. Worker thread terrain generation
2. Greedy meshing implementation
3. Advanced LOD system
4. Multiplayer synchronization
5. Modding API
6. Advanced shader effects
7. VR support
8. Mobile optimization
9. Streaming chunk loading
10. Persistent world file system
