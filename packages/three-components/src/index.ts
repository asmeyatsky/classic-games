// 3D Components for games
export * from './poker';
export * from './backgammon';
export * from './scrabble';
export * from './common';

// Advanced materials and lighting
export * from './materials/PBRMaterials';
// Export lighting without LightingSetup to avoid conflict with common
export {
  setupLighting,
  createGameLighting,
  LightController,
  configureRendererForPBR,
  createLight,
  advancedLightingProfiles,
} from './lighting/AdvancedLighting';
export type { LightConfig } from './lighting/AdvancedLighting';
