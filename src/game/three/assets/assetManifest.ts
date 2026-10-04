import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface EnvironmentAssetConfig {
  id: string;
  name: string;
  path: string;
  category: 'landmark' | 'machinery' | 'character' | 'prop';
  scale?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  proceduralFallbackBuilder: string;
}

/**
 * Declarative Asset Manifest for STEMPUNK 3D Landmarks, Machinery & Characters.
 * Documents optional external Blender GLB asset paths alongside the active high-detail
 * procedural geometry fallbacks so the game never assumes nonexistent files exist.
 */
export const ENVIRONMENT_ASSET_MANIFEST: EnvironmentAssetConfig[] = [
  {
    id: 'asset-protagonist-automaton',
    name: 'Awakened Steampunk Automaton Protagonist',
    path: '/assets/models/protagonist_automaton.glb',
    category: 'character',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'PlayerController.createRobotMesh',
  },
  {
    id: 'asset-companion-volt7',
    name: 'VOLT-7 ("Szikra") Spherical Maintenance Companion',
    path: '/assets/models/companion_volt7.glb',
    category: 'character',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'ProceduralMeshFactory.createCompanionVolt7',
  },
  {
    id: 'asset-foundry-hall',
    name: 'Underworld Smelting Foundry & Rolling Mill',
    path: '/assets/models/industrial_foundry_hall.glb',
    category: 'landmark',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'ProceduralMeshFactory.createIndustrialFoundryBuilding',
  },
  {
    id: 'asset-power-substation',
    name: 'High-Voltage Substation & Hyperboloid Cooling Tower',
    path: '/assets/models/power_substation_annex.glb',
    category: 'landmark',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'ProceduralMeshFactory.createPowerSubstationBuilding',
  },
  {
    id: 'asset-hammerhead-crane',
    name: 'Harbor / Scrapyard Hammerhead Lattice Crane',
    path: '/assets/models/harbor_hammerhead_crane.glb',
    category: 'landmark',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'ProceduralMeshFactory.createHarborHammerheadCrane',
  },
  {
    id: 'asset-steam-engine',
    name: 'Reciprocating Steampunk Boiler & Flywheel Engine',
    path: '/assets/models/working_steam_engine.glb',
    category: 'machinery',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'ProceduralMeshFactory.createWorkingSteamEngine',
  },
  {
    id: 'asset-monumental-sector-gate',
    name: 'Monumental Sealed Sector Gate & Hydraulic Rams',
    path: '/assets/models/monumental_sector_gate.glb',
    category: 'landmark',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'EnvironmentalStoryLandmarks.createMonumentalSectorGate',
  },
  {
    id: 'asset-collapsed-bridge',
    name: 'Collapsed Industrial Viaduct & Sheared Girders',
    path: '/assets/models/collapsed_industrial_bridge.glb',
    category: 'landmark',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'EnvironmentalStoryLandmarks.createCollapsedIndustrialBridge',
  },
  {
    id: 'asset-abandoned-repair-bay',
    name: 'Abandoned Automaton Field Repair Gantry',
    path: '/assets/models/abandoned_repair_bay.glb',
    category: 'landmark',
    scale: 1.0,
    castShadow: true,
    receiveShadow: true,
    proceduralFallbackBuilder: 'EnvironmentalStoryLandmarks.createAbandonedRepairBay',
  },
];

const gltfCache = new Map<string, THREE.Group>();
const gltfLoader = new GLTFLoader();

/**
 * Attempts to load an external GLB/GLTF asset if present, automatically falling back
 * to the supplied procedural generator function when external binary assets are absent.
 */
export async function loadAssetWithProceduralFallback(
  config: EnvironmentAssetConfig,
  fallbackFactory: () => THREE.Group
): Promise<THREE.Group> {
  if (gltfCache.has(config.id)) {
    return gltfCache.get(config.id)!.clone();
  }

  try {
    const gltf = await gltfLoader.loadAsync(config.path);
    const root = gltf.scene;
    if (config.scale) {
      root.scale.setScalar(config.scale);
    }
    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = Boolean(config.castShadow);
        mesh.receiveShadow = Boolean(config.receiveShadow);
      }
    });
    gltfCache.set(config.id, root);
    return root.clone();
  } catch {
    return fallbackFactory();
  }
}
