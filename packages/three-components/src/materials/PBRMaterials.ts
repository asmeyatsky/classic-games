/**
 * Physically Based Rendering (PBR) Material System
 *
 * Advanced material management with:
 * - Metalness and roughness maps
 * - Normal maps for surface detail
 * - Ambient occlusion maps
 * - Environment mapping
 * - Material presets optimized for realism
 */

import { MeshStandardMaterial, Texture, Color } from 'three';

export interface PBRMaterialConfig {
  color: string | number;
  roughness: number; // 0 = smooth/shiny, 1 = rough/matte
  metalness: number; // 0 = non-metal, 1 = pure metal
  normalScale?: number; // Intensity of normal map
  aoIntensity?: number; // Ambient occlusion intensity
  emissive?: string | number; // Self-emitted light
  emissiveIntensity?: number;
  envMapIntensity?: number; // Environment map reflection strength
  transparent?: boolean;
  opacity?: number;
}

export interface TextureSet {
  baseColor?: Texture;
  normal?: Texture;
  roughness?: Texture;
  metalness?: Texture;
  ambientOcclusion?: Texture;
  emissive?: Texture;
}

/**
 * PBR Material Library with scientifically accurate values
 */
export const pbrMaterials = {
  // Card materials
  card: {
    baseColor: '#FFFFFF',
    roughness: 0.1, // Cards are semi-glossy
    metalness: 0.0,
    normalScale: 0.5,
    aoIntensity: 0.7,
  } as PBRMaterialConfig,

  cardBack: {
    baseColor: '#1E3A8A',
    roughness: 0.15,
    metalness: 0.0,
    normalScale: 0.4,
    aoIntensity: 0.8,
  } as PBRMaterialConfig,

  // Felt/cloth materials
  felt: {
    baseColor: '#0F5132',
    roughness: 0.95, // Felt is very rough
    metalness: 0.0,
    normalScale: 1.0,
    aoIntensity: 0.9,
  } as PBRMaterialConfig,

  feltLight: {
    baseColor: '#1B7741',
    roughness: 0.9,
    metalness: 0.0,
    normalScale: 0.95,
    aoIntensity: 0.85,
  } as PBRMaterialConfig,

  // Chip materials
  chipRed: {
    baseColor: '#DC2626',
    roughness: 0.3, // Slight gloss
    metalness: 0.15, // Slight metallic tint
    normalScale: 0.6,
    aoIntensity: 0.8,
  } as PBRMaterialConfig,

  chipBlack: {
    baseColor: '#1F2937',
    roughness: 0.25,
    metalness: 0.2,
    normalScale: 0.6,
    aoIntensity: 0.85,
  } as PBRMaterialConfig,

  chipGold: {
    baseColor: '#FBBF24',
    roughness: 0.35,
    metalness: 0.8, // Very metallic
    normalScale: 0.5,
    aoIntensity: 0.7,
    envMapIntensity: 1.2,
  } as PBRMaterialConfig,

  chipWhite: {
    baseColor: '#F3F4F6',
    roughness: 0.3,
    metalness: 0.1,
    normalScale: 0.6,
    aoIntensity: 0.75,
  } as PBRMaterialConfig,

  // Wood materials
  woodDark: {
    baseColor: '#654321',
    roughness: 0.7, // Wood is moderately rough
    metalness: 0.0,
    normalScale: 1.0,
    aoIntensity: 0.9,
  } as PBRMaterialConfig,

  woodLight: {
    baseColor: '#DEB887',
    roughness: 0.65,
    metalness: 0.0,
    normalScale: 0.95,
    aoIntensity: 0.85,
  } as PBRMaterialConfig,

  // Metal materials
  bronze: {
    baseColor: '#CD7F32',
    roughness: 0.4,
    metalness: 0.9,
    normalScale: 0.4,
    aoIntensity: 0.8,
    envMapIntensity: 1.1,
  } as PBRMaterialConfig,

  silver: {
    baseColor: '#E8E8E8',
    roughness: 0.15,
    metalness: 0.95,
    normalScale: 0.3,
    aoIntensity: 0.75,
    envMapIntensity: 1.3,
  } as PBRMaterialConfig,

  gold: {
    baseColor: '#FFD700',
    roughness: 0.25,
    metalness: 0.9,
    normalScale: 0.35,
    aoIntensity: 0.75,
    envMapIntensity: 1.2,
  } as PBRMaterialConfig,

  // Glass materials
  glass: {
    baseColor: '#E8F4F8',
    roughness: 0.05, // Very smooth
    metalness: 0.0,
    normalScale: 0.1,
    aoIntensity: 0.5,
    transparent: true,
    opacity: 0.7,
  } as PBRMaterialConfig,

  // Leather materials
  leather: {
    baseColor: '#8B4513',
    roughness: 0.6,
    metalness: 0.0,
    normalScale: 0.8,
    aoIntensity: 0.85,
  } as PBRMaterialConfig,

  // Plastic materials
  plasticGlossy: {
    baseColor: '#FFFFFF',
    roughness: 0.2,
    metalness: 0.1,
    normalScale: 0.4,
    aoIntensity: 0.75,
  } as PBRMaterialConfig,

  plasticMatte: {
    baseColor: '#E0E0E0',
    roughness: 0.6,
    metalness: 0.0,
    normalScale: 0.5,
    aoIntensity: 0.8,
  } as PBRMaterialConfig,

  // Fabric materials
  fabric: {
    baseColor: '#8B7355',
    roughness: 0.85,
    metalness: 0.0,
    normalScale: 0.9,
    aoIntensity: 0.9,
  } as PBRMaterialConfig,

  // Emissive materials (for neon/glow effects)
  neonBlue: {
    baseColor: '#0066FF',
    roughness: 0.3,
    metalness: 0.5,
    emissive: '#0033FF',
    emissiveIntensity: 0.5,
    envMapIntensity: 1.1,
  } as PBRMaterialConfig,

  neonGreen: {
    baseColor: '#00FF00',
    roughness: 0.3,
    metalness: 0.5,
    emissive: '#00CC00',
    emissiveIntensity: 0.5,
    envMapIntensity: 1.1,
  } as PBRMaterialConfig,
};

/**
 * Create a MeshStandardMaterial from PBR config
 */
export function createPBRMaterial(config: PBRMaterialConfig): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: new Color(config.color),
    roughness: Math.max(0, Math.min(1, config.roughness)),
    metalness: Math.max(0, Math.min(1, config.metalness)),
    transparent: config.transparent ?? false,
    opacity: config.opacity ?? 1,
  });

  if (config.emissive) {
    material.emissive = new Color(config.emissive);
    material.emissiveIntensity = config.emissiveIntensity ?? 0.5;
  }

  if (config.envMapIntensity) {
    material.envMapIntensity = config.envMapIntensity;
  }

  return material;
}

/**
 * Apply texture maps to material
 */
export function applyTextures(
  material: MeshStandardMaterial,
  textures: TextureSet,
  config: PBRMaterialConfig
): void {
  if (textures.baseColor) {
    material.map = textures.baseColor;
  }

  if (textures.normal) {
    material.normalMap = textures.normal;
    material.normalScale.set(config.normalScale ?? 1, config.normalScale ?? 1);
  }

  if (textures.roughness) {
    material.roughnessMap = textures.roughness;
  }

  if (textures.metalness) {
    material.metalnessMap = textures.metalness;
  }

  if (textures.ambientOcclusion) {
    material.aoMap = textures.ambientOcclusion;
    material.aoMapIntensity = config.aoIntensity ?? 1;
  }

  if (textures.emissive) {
    material.emissiveMap = textures.emissive;
  }

  material.needsUpdate = true;
}

/**
 * Material factory presets
 */
export const materialFactory = {
  /**
   * Create card material (front face)
   */
  createCardMaterial(suitColor: string = '#FFFFFF'): MeshStandardMaterial {
    return createPBRMaterial({
      color: suitColor,
      roughness: 0.1,
      metalness: 0.0,
      normalScale: 0.5,
      aoIntensity: 0.7,
    });
  },

  /**
   * Create table felt material
   */
  createFeltMaterial(color: string = '#0F5132'): MeshStandardMaterial {
    return createPBRMaterial({
      color,
      roughness: 0.95,
      metalness: 0.0,
      normalScale: 1.0,
      aoIntensity: 0.9,
    });
  },

  /**
   * Create chip material with varying metalness
   */
  createChipMaterial(color: string, metalness: number = 0.15): MeshStandardMaterial {
    return createPBRMaterial({
      color,
      roughness: 0.3,
      metalness,
      normalScale: 0.6,
      aoIntensity: 0.8,
    });
  },

  /**
   * Create metallic material for accents
   */
  createMetalMaterial(
    color: string,
    metalness: number = 0.8,
    roughness: number = 0.3
  ): MeshStandardMaterial {
    return createPBRMaterial({
      color,
      roughness,
      metalness,
      normalScale: 0.4,
      aoIntensity: 0.75,
      envMapIntensity: 1.2,
    });
  },

  /**
   * Create wood material with grain
   */
  createWoodMaterial(color: string = '#654321'): MeshStandardMaterial {
    return createPBRMaterial({
      color,
      roughness: 0.7,
      metalness: 0.0,
      normalScale: 1.0,
      aoIntensity: 0.9,
    });
  },

  /**
   * Create emissive material for glow effects
   */
  createEmissiveMaterial(
    color: string,
    emissive: string,
    intensity: number = 0.5
  ): MeshStandardMaterial {
    return createPBRMaterial({
      color,
      roughness: 0.3,
      metalness: 0.5,
      emissive,
      emissiveIntensity: intensity,
    });
  },

  /**
   * Create glass/transparent material
   */
  createGlassMaterial(color: string = '#E8F4F8'): MeshStandardMaterial {
    return createPBRMaterial({
      color,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
    });
  },
};

/**
 * Material property validator
 */
export function validateMaterialConfig(config: PBRMaterialConfig): boolean {
  return (
    config.roughness >= 0 &&
    config.roughness <= 1 &&
    config.metalness >= 0 &&
    config.metalness <= 1 &&
    (!config.opacity || (config.opacity >= 0 && config.opacity <= 1))
  );
}
