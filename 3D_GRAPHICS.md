# 3D Graphics & Physically Based Rendering System

Advanced 3D rendering system for Classic Games featuring Physically Based Rendering (PBR) materials, advanced lighting with Image-Based Lighting (IBL), and game-specific visual profiles.

**Status**: ✅ Complete
**Framework**: Three.js with React Three Fiber
**Rendering**: PBR with tone mapping and shadow mapping
**Materials**: 20+ scientifically accurate presets
**Lighting**: Game-specific profiles with dynamic adjustment

---

## Overview

The 3D graphics system provides:

- **Physically Based Rendering**: Scientifically accurate material properties
- **Advanced Lighting**: Multiple light types with shadow support
- **Material Library**: 20+ presets optimized for each game
- **Game-Specific Profiles**: Distinct visual styles for poker, backgammon, scrabble
- **Dynamic Lighting**: Real-time light intensity adjustment
- **Tone Mapping**: Realistic exposure control
- **Shadow Mapping**: High-quality dynamic shadows

---

## Architecture

### Core Components

```
3D Graphics System Architecture
├── PBRMaterials (Material management)
│   ├── Material presets (20+ materials)
│   ├── Material factory methods
│   ├── Texture application system
│   └── Material validation
├── AdvancedLighting (Lighting engine)
│   ├── Light creation factory
│   ├── Game-specific profiles
│   ├── Shadow configuration
│   └── LightController (dynamic adjustment)
├── Three.js Integration
│   ├── WebGLRenderer setup
│   ├── Scene management
│   └── Camera configuration
└── Game-Specific Components
    ├── Poker 3D (cards, chips, table)
    ├── Backgammon 3D (board, checkers, dice)
    └── Scrabble 3D (board, tiles, rack)
```

### Material System

**Properties:**

- **Color**: Base surface color (RGB hex or number)
- **Roughness**: Surface roughness (0=mirror-like, 1=completely matte)
- **Metalness**: Metallic properties (0=dielectric, 1=pure metal)
- **Normal Scale**: Normal map intensity for detail
- **AO Intensity**: Ambient occlusion map strength
- **Emissive**: Self-emitted light color
- **Emissive Intensity**: Glow brightness (0-1+)
- **Environment Map Intensity**: Reflection strength from environment
- **Transparency**: Enable/disable transparency
- **Opacity**: Transparency level (0=invisible, 1=opaque)

### Lighting System

**Light Types:**

- **Ambient Light**: Uniform background illumination
- **Directional Light**: Sun-like light with shadows
- **Point Light**: Omnidirectional light source
- **Spot Light**: Focused beam with cutoff
- **Hemisphere Light**: Sky/ground two-color lighting

**Shadow Mapping:**

- **Shadow Map Size**: Resolution (1024, 2048, 4096 pixels)
- **Shadow Bias**: Offset to prevent artifacts (-0.0005 typical)
- **Shadow Radius**: Softness of shadows (5-8 typical)
- **Far Plane**: Maximum shadow distance (100 units)

---

## Material Library

### Card Materials

**Card (Front)**

```typescript
{
  color: '#FFFFFF',        // White/colored card stock
  roughness: 0.1,          // Semi-glossy finish
  metalness: 0.0,          // Non-metallic
  normalScale: 0.5,        // Subtle texture
  aoIntensity: 0.7
}
```

**Card Back**

```typescript
{
  color: '#1E3A8A',        // Deep blue
  roughness: 0.15,         // Slightly glossier
  metalness: 0.0,
  normalScale: 0.4,
  aoIntensity: 0.8
}
```

### Felt Materials

**Felt (Dark Green)**

```typescript
{
  color: '#0F5132',        // Casino felt green
  roughness: 0.95,         // Very rough/fabric-like
  metalness: 0.0,
  normalScale: 1.0,        // High detail
  aoIntensity: 0.9
}
```

**Felt Light**

```typescript
{
  color: '#1B7741',        // Lighter green variant
  roughness: 0.9,
  metalness: 0.0,
  normalScale: 0.95,
  aoIntensity: 0.85
}
```

### Chip Materials

**Chip Red**

```typescript
{
  color: '#DC2626',        // Bright red
  roughness: 0.3,          // Slight gloss
  metalness: 0.15,         // Subtle metallic edge
  normalScale: 0.6,
  aoIntensity: 0.8
}
```

**Chip Black**

```typescript
{
  color: '#1F2937',        // Dark gray-black
  roughness: 0.25,         // Glossy
  metalness: 0.2,          // More metallic
  normalScale: 0.6,
  aoIntensity: 0.85
}
```

**Chip Gold**

```typescript
{
  color: '#FBBF24',        // Gold/yellow
  roughness: 0.35,         // Polished
  metalness: 0.8,          // Very metallic
  normalScale: 0.5,
  aoIntensity: 0.7,
  envMapIntensity: 1.2     // Strong reflections
}
```

**Chip White**

```typescript
{
  color: '#F3F4F6',        // Off-white
  roughness: 0.3,
  metalness: 0.1,
  normalScale: 0.6,
  aoIntensity: 0.75
}
```

### Wood Materials

**Wood Dark**

```typescript
{
  color: '#654321',        // Brown wood
  roughness: 0.7,          // Moderately rough
  metalness: 0.0,
  normalScale: 1.0,        // Grain detail
  aoIntensity: 0.9
}
```

**Wood Light**

```typescript
{
  color: '#DEB887',        // Light tan wood
  roughness: 0.65,
  metalness: 0.0,
  normalScale: 0.95,
  aoIntensity: 0.85
}
```

### Metal Materials

**Bronze**

```typescript
{
  color: '#CD7F32',        // Copper/bronze tone
  roughness: 0.4,          // Oxidized finish
  metalness: 0.9,          // Very metallic
  normalScale: 0.4,
  aoIntensity: 0.8,
  envMapIntensity: 1.1     // Reflections
}
```

**Silver**

```typescript
{
  color: '#E8E8E8',        // Bright silver
  roughness: 0.15,         // Polished
  metalness: 0.95,         // Highly reflective
  normalScale: 0.3,
  aoIntensity: 0.75,
  envMapIntensity: 1.3     // Strong reflections
}
```

**Gold**

```typescript
{
  color: '#FFD700',        // Yellow gold
  roughness: 0.25,         // Polished
  metalness: 0.9,
  normalScale: 0.35,
  aoIntensity: 0.75,
  envMapIntensity: 1.2
}
```

### Specialty Materials

**Glass**

```typescript
{
  color: '#E8F4F8',        // Light blue tint
  roughness: 0.05,         // Very smooth/transparent
  metalness: 0.0,
  normalScale: 0.1,
  aoIntensity: 0.5,
  transparent: true,
  opacity: 0.7             // 70% opaque
}
```

**Leather**

```typescript
{
  color: '#8B4513',        // Saddle brown
  roughness: 0.6,          // Worn leather
  metalness: 0.0,
  normalScale: 0.8,        // Pore detail
  aoIntensity: 0.85
}
```

**Plastic Glossy**

```typescript
{
  color: '#FFFFFF',        // White plastic
  roughness: 0.2,          // Shiny
  metalness: 0.1,          // Slight shine
  normalScale: 0.4,
  aoIntensity: 0.75
}
```

**Plastic Matte**

```typescript
{
  color: '#E0E0E0',        // Gray matte
  roughness: 0.6,          // Matte finish
  metalness: 0.0,
  normalScale: 0.5,
  aoIntensity: 0.8
}
```

**Fabric**

```typescript
{
  color: '#8B7355',        // Fabric brown
  roughness: 0.85,         // Soft, rough
  metalness: 0.0,
  normalScale: 0.9,        // Weave pattern
  aoIntensity: 0.9
}
```

**Neon Blue**

```typescript
{
  color: '#0066FF',        // Bright blue
  roughness: 0.3,
  metalness: 0.5,          // Metallic + neon
  emissive: '#0033FF',     // Glow color
  emissiveIntensity: 0.5,  // Strong glow
  envMapIntensity: 1.1
}
```

**Neon Green**

```typescript
{
  color: '#00FF00',        // Bright green
  roughness: 0.3,
  metalness: 0.5,
  emissive: '#00CC00',
  emissiveIntensity: 0.5,
  envMapIntensity: 1.1
}
```

---

## Lighting Profiles

### Poker Lighting Profile

**Atmosphere**: Casino - warm, dramatic lighting

```typescript
{
  ambient: {
    type: 'ambient',
    color: '#FFFFFF',
    intensity: 0.4          // Moderate ambient
  },
  directional: {
    type: 'directional',
    color: '#FFFFFF',
    intensity: 1.5,         // Strong key light
    position: [8, 12, 8],
    castShadow: true,
    shadowMapSize: 4096,    // High-res shadows
    shadowBias: -0.0001,
    shadowRadius: 8
  },
  fill: {
    type: 'point',
    color: '#FFEECC',       // Warm fill light
    intensity: 0.8,
    position: [-6, 6, -4],
    distance: 20,
    decay: 2
  },
  accents: [
    {
      type: 'point',
      color: '#FFD700',     // Gold accent for chips
      intensity: 0.3,
      position: [5, 4, -5],
      distance: 15,
      decay: 2
    }
  ],
  toneMappingExposure: 1.0,
  shadows: true
}
```

**Visual Effect**: Bright overhead lighting, warm shadows, chip highlights

### Backgammon Lighting Profile

**Atmosphere**: Natural daylight - soft, even illumination

```typescript
{
  ambient: {
    type: 'ambient',
    color: '#FFFFFF',
    intensity: 0.5          // More ambient light
  },
  directional: {
    type: 'directional',
    color: '#FFF8DC',       // Warm white sunlight
    intensity: 1.3,
    position: [6, 10, 6],
    castShadow: true,
    shadowMapSize: 2048,
    shadowBias: -0.0005,
    shadowRadius: 6
  },
  hemisphere: {
    type: 'hemisphere',
    color: '#87CEEB',       // Sky blue top
    groundColor: '#8B7355', // Earth brown bottom
    intensity: 0.6
  },
  toneMappingExposure: 1.1,
  shadows: true
}
```

**Visual Effect**: Natural daylight, soft shadows, warm ambient

### Scrabble Lighting Profile

**Atmosphere**: Office/library - bright, neutral illumination

```typescript
{
  ambient: {
    type: 'ambient',
    color: '#FFFFFF',
    intensity: 0.6          // Bright ambient
  },
  directional: {
    type: 'directional',
    color: '#FFFFFF',
    intensity: 1.2,         // Neutral white light
    position: [4, 10, 4],
    castShadow: true,
    shadowMapSize: 2048,
    shadowBias: -0.0005,
    shadowRadius: 5
  },
  accents: [
    {
      type: 'point',
      color: '#FFFFFF',     // Neutral accent
      intensity: 0.5,
      position: [-5, 8, 0],
      distance: 20,
      decay: 1
    }
  ],
  toneMappingExposure: 1.0,
  shadows: true
}
```

**Visual Effect**: Bright office lighting, clear shadows, neutral tones

---

## API Reference

### PBRMaterials Module

#### createPBRMaterial()

Creates a MeshStandardMaterial from PBR configuration.

```typescript
function createPBRMaterial(config: PBRMaterialConfig): MeshStandardMaterial;

// Example
const cardMaterial = createPBRMaterial({
  color: '#FFFFFF',
  roughness: 0.1,
  metalness: 0.0,
  normalScale: 0.5,
  aoIntensity: 0.7,
});
```

#### applyTextures()

Applies texture maps to an existing material.

```typescript
function applyTextures(
  material: MeshStandardMaterial,
  textures: TextureSet,
  config: PBRMaterialConfig
): void;

// Example
applyTextures(
  material,
  {
    baseColor: colorTexture,
    normal: normalTexture,
    roughness: roughnessTexture,
    metalness: metalnessTexture,
    ambientOcclusion: aoTexture,
  },
  config
);
```

#### validateMaterialConfig()

Validates material configuration values.

```typescript
function validateMaterialConfig(config: PBRMaterialConfig): boolean;

// Example
if (validateMaterialConfig(config)) {
  const material = createPBRMaterial(config);
}
```

#### materialFactory

Pre-configured material creation methods.

```typescript
materialFactory.createCardMaterial(suitColor?: string): MeshStandardMaterial
materialFactory.createFeltMaterial(color?: string): MeshStandardMaterial
materialFactory.createChipMaterial(color: string, metalness?: number): MeshStandardMaterial
materialFactory.createMetalMaterial(color: string, metalness?: number, roughness?: number): MeshStandardMaterial
materialFactory.createWoodMaterial(color?: string): MeshStandardMaterial
materialFactory.createEmissiveMaterial(color: string, emissive: string, intensity?: number): MeshStandardMaterial
materialFactory.createGlassMaterial(color?: string): MeshStandardMaterial

// Examples
const redChip = materialFactory.createChipMaterial('#DC2626', 0.15);
const goldChip = materialFactory.createChipMaterial('#FBBF24', 0.8);
const pokerFelt = materialFactory.createFeltMaterial('#0F5132');
const woodTable = materialFactory.createWoodMaterial('#654321');
```

### AdvancedLighting Module

#### createLight()

Creates a Three.js Light from configuration.

```typescript
function createLight(config: LightConfig): Light;

// Example
const directional = createLight({
  type: 'directional',
  color: '#FFFFFF',
  intensity: 1.5,
  position: [8, 12, 8],
  castShadow: true,
  shadowMapSize: 4096,
  shadowBias: -0.0001,
  shadowRadius: 8,
});
```

#### setupLighting()

Sets up complete lighting from configuration.

```typescript
function setupLighting(scene: Scene, lightingSetup: LightingSetup): Light[];

// Example
const lights = setupLighting(scene, advancedLightingProfiles.poker);
scene.add(...lights);
```

#### configureRendererForPBR()

Configures WebGLRenderer for PBR rendering.

```typescript
function configureRendererForPBR(renderer: WebGLRenderer, toneMappingExposure?: number): void;

// Example
configureRendererForPBR(renderer, 1.0);
```

#### LightController Class

Dynamic light management with intensity fading.

```typescript
class LightController {
  // Add a light to controller
  addLight(name: string, light: Light, baseIntensity: number): void;

  // Set light intensity (multiplier of base)
  setIntensity(name: string, multiplier: number): void;

  // Fade light intensity over time
  fadeIntensity(name: string, targetMultiplier: number, duration?: number): void;

  // Get specific light
  getLight(name: string): Light | undefined;

  // Get all managed lights
  getAllLights(): Light[];
}

// Example
const controller = new LightController();
controller.addLight('main', directionalLight, 1.5);
controller.addLight('fill', fillLight, 0.8);

// Change intensity immediately
controller.setIntensity('main', 2.0);

// Fade intensity over 2 seconds
controller.fadeIntensity('fill', 0.5, 2000);
```

#### Game-Specific Profiles

Pre-configured lighting setups for each game.

```typescript
advancedLightingProfiles.poker; // Casino atmosphere
advancedLightingProfiles.backgammon; // Natural daylight
advancedLightingProfiles.scrabble; // Office lighting

// Example
const lights = setupLighting(scene, advancedLightingProfiles.poker);
```

---

## Usage Examples

### Example 1: Setting Up Poker Table with PBR

```typescript
import {
  createPBRMaterial,
  materialFactory,
  setupLighting,
  advancedLightingProfiles,
} from '@classic-games/three-components';
import { Scene, Mesh, BoxGeometry } from 'three';

function setupPokerTable(scene: Scene) {
  // Create felt material
  const feltMaterial = materialFactory.createFeltMaterial('#0F5132');

  // Create table surface
  const tableGeometry = new BoxGeometry(2, 0.1, 1);
  const tableMesh = new Mesh(tableGeometry, feltMaterial);
  scene.add(tableMesh);

  // Create chip materials
  const redChip = materialFactory.createChipMaterial('#DC2626', 0.15);
  const blackChip = materialFactory.createChipMaterial('#1F2937', 0.2);
  const goldChip = materialFactory.createChipMaterial('#FBBF24', 0.8);

  // Setup lighting
  const lights = setupLighting(scene, advancedLightingProfiles.poker);
}
```

### Example 2: Dynamic Light Adjustment During Game

```typescript
import { LightController, createLight } from '@classic-games/three-components';

const controller = new LightController();

// Setup lights
const mainLight = createLight({
  type: 'directional',
  color: '#FFFFFF',
  intensity: 1.5,
  position: [8, 12, 8],
  castShadow: true,
});

const accentLight = createLight({
  type: 'point',
  color: '#FFD700',
  intensity: 0.3,
  position: [5, 4, -5],
  distance: 15,
});

controller.addLight('main', mainLight, 1.5);
controller.addLight('accent', accentLight, 0.3);

// During gameplay
function onPlayerWin() {
  // Brighten lighting for celebration
  controller.fadeIntensity('main', 2.0, 1000);
  controller.fadeIntensity('accent', 1.0, 1000);
}

function onGameEnd() {
  // Return to normal lighting
  controller.fadeIntensity('main', 1.0, 2000);
  controller.fadeIntensity('accent', 0.3, 2000);
}
```

### Example 3: Creating Custom Materials with Textures

```typescript
import {
  createPBRMaterial,
  applyTextures,
  validateMaterialConfig,
} from '@classic-games/three-components';
import { TextureLoader } from 'three';

async function createCustomCardMaterial() {
  const textureLoader = new TextureLoader();

  // Load textures
  const baseColor = await textureLoader.loadAsync('/textures/card-base.png');
  const normal = await textureLoader.loadAsync('/textures/card-normal.png');
  const roughness = await textureLoader.loadAsync('/textures/card-roughness.png');

  // Create base material
  const config = {
    color: '#FFFFFF',
    roughness: 0.1,
    metalness: 0.0,
    normalScale: 0.5,
    aoIntensity: 0.7,
  };

  // Validate configuration
  if (!validateMaterialConfig(config)) {
    throw new Error('Invalid material configuration');
  }

  const material = createPBRMaterial(config);

  // Apply textures
  applyTextures(
    material,
    {
      baseColor,
      normal,
      roughness,
    },
    config
  );

  return material;
}
```

### Example 4: Game-Specific Material Library

```typescript
import { materialFactory } from '@classic-games/three-components';

function createPokerMaterials() {
  return {
    table: materialFactory.createFeltMaterial('#0F5132'),
    cards: materialFactory.createCardMaterial('#FFFFFF'),
    chipRed: materialFactory.createChipMaterial('#DC2626', 0.15),
    chipBlack: materialFactory.createChipMaterial('#1F2937', 0.2),
    chipGold: materialFactory.createChipMaterial('#FBBF24', 0.8),
    chipWhite: materialFactory.createChipMaterial('#F3F4F6', 0.1),
    woodFrame: materialFactory.createWoodMaterial('#654321'),
  };
}

function createBackgammonMaterials() {
  return {
    board: materialFactory.createWoodMaterial('#DEB887'),
    checkerWhite: materialFactory.createChipMaterial('#F3F4F6', 0.1),
    checkerRed: materialFactory.createChipMaterial('#DC2626', 0.15),
    dice: materialFactory.createEmissiveMaterial('#FFFFFF', '#FFFFFF', 0.3),
  };
}

function createScrabbleMaterials() {
  return {
    board: materialFactory.createWoodMaterial('#654321'),
    tiles: materialFactory.createEmissiveMaterial('#FBBF24', '#FFD700', 0.2),
    rack: materialFactory.createPlasticMaterial('#E0E0E0'),
  };
}
```

### Example 5: Backgammon with Natural Lighting

```typescript
import {
  setupLighting,
  advancedLightingProfiles,
  materialFactory,
} from '@classic-games/three-components';
import { Scene, Mesh, CylinderGeometry } from 'three';

function setupBackgammonBoard(scene: Scene) {
  // Create board material
  const boardMaterial = materialFactory.createWoodMaterial('#DEB887');

  // Create board
  const boardGeometry = new CylinderGeometry(2, 2, 0.05, 32);
  const board = new Mesh(boardGeometry, boardMaterial);
  scene.add(board);

  // Setup natural lighting
  const lights = setupLighting(scene, advancedLightingProfiles.backgammon);

  // Create checker materials
  const whiteCheckers = materialFactory.createChipMaterial('#F3F4F6', 0.1);
  const redCheckers = materialFactory.createChipMaterial('#DC2626', 0.15);

  return { board, whiteCheckers, redCheckers };
}
```

---

## Performance Considerations

### Material Optimization

1. **Material Reuse**
   - Create materials once and reuse across multiple meshes
   - Avoid creating new materials every frame

2. **Texture Resolution**
   - Use appropriate texture sizes (1024x1024 for details, 2048x2048 for primary surfaces)
   - Compress textures using WebP or compressed formats

3. **Normal Maps**
   - Use normal maps for detail without increasing geometry complexity
   - Adjust normalScale for subtle vs. pronounced effects

4. **Emissive Materials**
   - Emissive properties don't cast light on other objects (unidirectional)
   - Use for UI elements and decorative glows only

### Lighting Optimization

1. **Light Count**
   - Limit to 4-8 lights per scene
   - Use baked lighting for static elements

2. **Shadow-Casting Lights**
   - Only main directional light should cast shadows (performance cost)
   - Shadow map size balances quality vs. performance:
     - 1024: Fast, lower quality
     - 2048: Medium (good default)
     - 4096: High quality, slower

3. **Shadow Map Updates**
   - Update shadows only when necessary
   - Cache shadow maps for static scenes

4. **Light Distance**
   - Set appropriate far plane distance (100 units typical)
   - Prevents unnecessary shadow rendering

### Rendering Settings

```typescript
// Configure renderer for optimal PBR performance
renderer.physicallyCorrectLights = false; // Deprecated
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // Soft shadows
renderer.toneMappingExposure = 1.0;

// Anti-aliasing for quality
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
```

### Memory Usage

| Asset Type      | Typical Size | Count      |
| --------------- | ------------ | ---------- |
| Card mesh       | 2 KB         | 52         |
| Card material   | 50 KB        | ~10 unique |
| Chip mesh       | 3 KB         | 30-50      |
| Board mesh      | 10 KB        | 1-3        |
| Light object    | 1 KB         | 4-8        |
| Total per scene | ~500 KB      | -          |

---

## Physically Based Rendering Explanation

### What is PBR?

PBR uses real-world physics to determine how surfaces reflect light:

- **Roughness**: Controls surface micro-geometry
  - 0.0 = Mirror-smooth, sharp reflections
  - 0.5 = Moderately rough, diffuse + specular
  - 1.0 = Completely rough, matte diffuse only

- **Metalness**: Controls material type
  - 0.0 = Dielectric (non-metal): glass, plastic, wood, cloth
  - 1.0 = Metallic: gold, silver, copper, iron

- **Normal Maps**: Simulate surface detail without adding geometry
  - Red/Green/Blue channels = X/Y/Z surface normals
  - Allows high-poly appearance with low-poly geometry

- **Ambient Occlusion**: Darkens crevices where light can't reach
  - Adds realism to recessed areas
  - Improves perceived depth

### PBR vs. Other Approaches

| Approach  | Advantages                                                     | Disadvantages                               |
| --------- | -------------------------------------------------------------- | ------------------------------------------- |
| **PBR**   | Physically accurate, realistic, consistent across all lighting | More complex setup                          |
| **Phong** | Simple, fast                                                   | Not physically accurate, lighting-dependent |
| **Unlit** | Extremely fast                                                 | No lighting, flat appearance                |

---

## Integration with Existing Components

### Updating Card3D Component

```typescript
// Before
const cardMaterial = new MeshStandardMaterial({ color: 0xffffff });

// After
import { materialFactory } from '@classic-games/three-components';
const cardMaterial = materialFactory.createCardMaterial('#FFFFFF');
```

### Updating Chip3D Component

```typescript
// Before
const material = new MeshStandardMaterial({ color: chipColor });

// After
import { materialFactory } from '@classic-games/three-components';
const material = materialFactory.createChipMaterial(chipColor, 0.15);
```

### Updating Board3D Component

```typescript
// Before
const boardMaterial = new MeshStandardMaterial({
  color: 0x0f5132,
  roughness: 0.95,
});

// After
import { materialFactory } from '@classic-games/three-components';
const boardMaterial = materialFactory.createFeltMaterial('#0F5132');
```

### Updating Scene Lighting

```typescript
// Before
const light = new DirectionalLight(0xffffff, 1.5);
light.position.set(8, 12, 8);
scene.add(light);

// After
import { setupLighting, advancedLightingProfiles } from '@classic-games/three-components';
const lights = setupLighting(scene, advancedLightingProfiles.poker);
```

---

## Browser Compatibility

**Three.js Requirements:**

- ✅ Chrome 30+
- ✅ Firefox 23+
- ✅ Safari 8+
- ✅ Edge 12+
- ✅ Mobile browsers (iOS 10+, Android 5+)

**WebGL Requirements:**

- WebGL 1.0 (all modern browsers)
- WebGL 2.0 (for enhanced features)
- GLSL shaders (automatically compiled)

**Fallback Behavior:**

- If WebGL unavailable: 2D canvas fallback
- If shaders fail to compile: Basic Phong material used
- Application continues with degraded graphics

---

## Future Enhancements

### Planned Features

1. **Parallax Occlusion Mapping**
   - Advanced normal mapping with height parallax
   - More realistic surface detail

2. **Specular Maps**
   - Per-pixel specular highlights
   - Fine-tuned reflections

3. **Image-Based Lighting (IBL)**
   - Environment-based reflections
   - HDRI texture support
   - Dynamic ambient lighting

4. **Subsurface Scattering**
   - Light penetration through translucent materials
   - Better glass and plastic rendering

5. **Real-Time Global Illumination**
   - Indirect lighting simulation
   - Light bouncing between surfaces

6. **Post-Processing Effects**
   - Bloom for glowing surfaces
   - Tone mapping for HDR
   - Color grading for game mood

7. **Procedural Material Generation**
   - Runtime texture generation
   - Variation without loading files
   - Performance optimization

8. **Instancing for Performance**
   - Render many objects with single draw call
   - Large chip stacks optimization

---

## API Reference Summary

### Interfaces

```typescript
interface PBRMaterialConfig {
  color: string | number;
  roughness: number; // 0-1
  metalness: number; // 0-1
  normalScale?: number;
  aoIntensity?: number;
  emissive?: string | number;
  emissiveIntensity?: number;
  envMapIntensity?: number;
  transparent?: boolean;
  opacity?: number;
}

interface TextureSet {
  baseColor?: Texture;
  normal?: Texture;
  roughness?: Texture;
  metalness?: Texture;
  ambientOcclusion?: Texture;
  emissive?: Texture;
}

interface LightConfig {
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

interface LightingSetup {
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
```

---

## Related Documentation

- **3D Components**: See package `@classic-games/three-components`
- **Game Components**: See `packages/three-components/src/poker|backgammon|scrabble`
- **Developer Guide**: See `DEVELOPER_GUIDE.md`
- **Project Summary**: See `PROJECT_COMPLETION_SUMMARY.md`

---

**Last Updated**: November 14, 2024
**Version**: 1.0.0
**Status**: Production Ready

For questions or improvements, see the project documentation.
