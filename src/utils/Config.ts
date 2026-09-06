export const GameConfig = {
  // Graphics
  graphics: {
    renderDistance: 8,
    shadowQuality: 'high',
    particles: true,
    clouds: true,
    lighting: 'dynamic',
    fov: 75
  },

  // Audio
  audio: {
    masterVolume: 1.0,
    musicVolume: 0.8,
    ambientVolume: 0.6,
    effectsVolume: 1.0,
    uiVolume: 1.0
  },

  // Controls
  controls: {
    mouseSensitivity: 1.0,
    invertMouse: false,
    enableController: true
  },

  // World
  world: {
    defaultSeed: undefined,
    gameMode: 'survival',
    difficulty: 'normal',
    weather: true,
    dayNightCycle: true
  },

  // Performance
  performance: {
    chunkRenderDistance: 8,
    chunkSimulationDistance: 12,
    maxEntities: 1000,
    maxParticles: 10000
  }
};
