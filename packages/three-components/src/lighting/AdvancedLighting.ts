/**
 * Advanced Lighting System with Image-Based Lighting (IBL)
 *
 * Provides:
 * - Image-based lighting from HDRI
 * - Tone mapping for realistic exposure
 * - Shadow mapping configuration
 * - Light helper utilities
 * - Dynamic light adjustment
 */

import {
  Light,
  DirectionalLight,
  PointLight,
  SpotLight,
  AmbientLight,
  HemisphereLight,
  Texture,
  WebGLRenderer,
  Scene,
  Color,
} from 'three';

export interface LightConfig {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  color: string | number;
  intensity: number;
  position?: [number, number, number];
  target?: [number, number, number];
  castShadow?: boolean;
  shadowMapSize?: number;
  shadowBias?: number;
  shadowRadius?: number;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
  groundColor?: string | number;
}

export interface LightingSetup {
  ambient: LightConfig;
  directional: LightConfig;
  hemisphere?: LightConfig;
  fill?: LightConfig;
  accents?: LightConfig[];
  envMap?: Texture;
  envIntensity?: number;
  toneMappingExposure?: number;
  shadows: boolean;
}

/**
 * Advanced lighting configurations optimized for different games
 */
export const advancedLightingProfiles = {
  // Poker table with casino lighting
  poker: {
    ambient: {
      type: 'ambient' as const,
      color: '#FFFFFF',
      intensity: 0.4,
    },
    directional: {
      type: 'directional' as const,
      color: '#FFFFFF',
      intensity: 1.5,
      position: [8, 12, 8],
      castShadow: true,
      shadowMapSize: 4096,
      shadowBias: -0.0001,
      shadowRadius: 8,
    },
    fill: {
      type: 'point' as const,
      color: '#FFEECC',
      intensity: 0.8,
      position: [-6, 6, -4],
      distance: 20,
      decay: 2,
    },
    accents: [
      {
        type: 'point' as const,
        color: '#FFD700',
        intensity: 0.3,
        position: [5, 4, -5],
        distance: 15,
        decay: 2,
      },
    ],
    toneMappingExposure: 1.0,
    shadows: true,
  } as LightingSetup,

  // Backgammon with natural lighting
  backgammon: {
    ambient: {
      type: 'ambient' as const,
      color: '#FFFFFF',
      intensity: 0.5,
    },
    directional: {
      type: 'directional' as const,
      color: '#FFF8DC',
      intensity: 1.3,
      position: [6, 10, 6],
      castShadow: true,
      shadowMapSize: 2048,
      shadowBias: -0.0005,
      shadowRadius: 6,
    },
    hemisphere: {
      type: 'hemisphere' as const,
      color: '#87CEEB',
      groundColor: '#8B7355',
      intensity: 0.6,
    },
    toneMappingExposure: 1.1,
    shadows: true,
  } as LightingSetup,

  // Scrabble with bright office lighting
  scrabble: {
    ambient: {
      type: 'ambient' as const,
      color: '#FFFFFF',
      intensity: 0.6,
    },
    directional: {
      type: 'directional' as const,
      color: '#FFFFFF',
      intensity: 1.2,
      position: [4, 10, 4],
      castShadow: true,
      shadowMapSize: 2048,
      shadowBias: -0.0005,
      shadowRadius: 5,
    },
    accents: [
      {
        type: 'point' as const,
        color: '#FFFFFF',
        intensity: 0.5,
        position: [-5, 8, 0],
        distance: 20,
        decay: 1,
      },
    ],
    toneMappingExposure: 1.0,
    shadows: true,
  } as LightingSetup,
};

/**
 * Create a light from configuration
 */
export function createLight(config: LightConfig): Light {
  switch (config.type) {
    case 'ambient':
      return new AmbientLight(config.color, config.intensity);

    case 'directional': {
      const light = new DirectionalLight(config.color, config.intensity);
      if (config.position) {
        light.position.set(...config.position);
      }
      if (config.castShadow) {
        light.castShadow = true;
        light.shadow.mapSize.width = config.shadowMapSize ?? 2048;
        light.shadow.mapSize.height = config.shadowMapSize ?? 2048;
        light.shadow.bias = config.shadowBias ?? -0.0005;
        light.shadow.radius = config.shadowRadius ?? 5;
        light.shadow.camera.far = 100;
      }
      return light;
    }

    case 'point': {
      const light = new PointLight(config.color, config.intensity);
      if (config.position) {
        light.position.set(...config.position);
      }
      if (config.distance) light.distance = config.distance;
      if (config.decay) light.decay = config.decay;
      if (config.castShadow) {
        light.castShadow = true;
        light.shadow.mapSize.width = config.shadowMapSize ?? 1024;
        light.shadow.mapSize.height = config.shadowMapSize ?? 1024;
      }
      return light;
    }

    case 'spot': {
      const light = new SpotLight(config.color, config.intensity);
      if (config.position) {
        light.position.set(...config.position);
      }
      if (config.angle) light.angle = config.angle;
      if (config.penumbra) light.penumbra = config.penumbra;
      if (config.distance) light.distance = config.distance;
      if (config.decay) light.decay = config.decay;
      if (config.castShadow) {
        light.castShadow = true;
        light.shadow.mapSize.width = config.shadowMapSize ?? 2048;
        light.shadow.mapSize.height = config.shadowMapSize ?? 2048;
      }
      return light;
    }

    case 'hemisphere': {
      const light = new HemisphereLight(config.color, config.groundColor, config.intensity);
      if (config.position) {
        light.position.set(...config.position);
      }
      return light;
    }

    default:
      throw new Error(`Unknown light type: ${config.type}`);
  }
}

/**
 * Setup complete lighting from configuration
 */
export function setupLighting(scene: Scene, lightingSetup: LightingSetup): Light[] {
  const lights: Light[] = [];

  // Add ambient light
  const ambientLight = createLight(lightingSetup.ambient);
  scene.add(ambientLight);
  lights.push(ambientLight);

  // Add directional light
  const directionalLight = createLight(lightingSetup.directional);
  scene.add(directionalLight);
  lights.push(directionalLight);

  // Add hemisphere light if configured
  if (lightingSetup.hemisphere) {
    const hemisphereLight = createLight(lightingSetup.hemisphere);
    scene.add(hemisphereLight);
    lights.push(hemisphereLight);
  }

  // Add fill light if configured
  if (lightingSetup.fill) {
    const fillLight = createLight(lightingSetup.fill);
    scene.add(fillLight);
    lights.push(fillLight);
  }

  // Add accent lights if configured
  if (lightingSetup.accents) {
    for (const accentConfig of lightingSetup.accents) {
      const accentLight = createLight(accentConfig);
      scene.add(accentLight);
      lights.push(accentLight);
    }
  }

  // Setup environment map if provided
  if (lightingSetup.envMap) {
    scene.environment = lightingSetup.envMap;
    scene.background = lightingSetup.envMap;
  }

  // Configure tone mapping
  if (lightingSetup.toneMappingExposure) {
    // Note: Exposure is typically set on renderer
  }

  return lights;
}

/**
 * Configure renderer for PBR/IBL
 */
export function configureRendererForPBR(
  renderer: WebGLRenderer,
  toneMappingExposure: number = 1.0
): void {
  // Use tone mapping for better exposure control
  renderer.toneMappingExposure = toneMappingExposure;

  // Enable shadow mapping
  renderer.shadowMap.enabled = true;

  // Use PCFShadowMap for better quality (default)
  // renderer.shadowMap.type = PCFShadowMap;

  // Enable physically correct lighting
  renderer.physicallyCorrectLights = false; // Deprecated in newer THREE.js
}

/**
 * Light intensity controller for dynamic adjustment
 */
export class LightController {
  private lights: Map<string, Light> = new Map();
  private baseIntensities: Map<string, number> = new Map();

  addLight(name: string, light: Light, baseIntensity: number): void {
    this.lights.set(name, light);
    this.baseIntensities.set(name, baseIntensity);
  }

  setIntensity(name: string, multiplier: number): void {
    const light = this.lights.get(name);
    const baseIntensity = this.baseIntensities.get(name);

    if (light && baseIntensity !== undefined) {
      (light as any).intensity = baseIntensity * multiplier;
    }
  }

  fadeIntensity(name: string, targetMultiplier: number, duration: number = 1000): void {
    const light = this.lights.get(name);
    const baseIntensity = this.baseIntensities.get(name);

    if (!light || baseIntensity === undefined) return;

    const startIntensity = (light as any).intensity;
    const startTime = Date.now();

    const animate = (): void => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentMultiplier =
        startIntensity / baseIntensity +
        (targetMultiplier - startIntensity / baseIntensity) * progress;

      this.setIntensity(name, currentMultiplier);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  getLight(name: string): Light | undefined {
    return this.lights.get(name);
  }

  getAllLights(): Light[] {
    return Array.from(this.lights.values());
  }
}

/**
 * Create lighting setup for specific game
 */
export function createGameLighting(gameType: 'poker' | 'backgammon' | 'scrabble'): LightingSetup {
  return advancedLightingProfiles[gameType] || advancedLightingProfiles.poker;
}
