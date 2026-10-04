import * as THREE from 'three';
import { ProceduralMeshFactory } from '../generators/ProceduralMeshFactory';

export interface SteampunkMaterialPresetCatalog {
  weatheredSteel: THREE.MeshStandardMaterial;
  oxidizedCopper: THREE.MeshStandardMaterial;
  verdigrisPatinaCopper: THREE.MeshStandardMaterial;
  agedBrass: THREE.MeshStandardMaterial;
  corrodedRustIron: THREE.MeshStandardMaterial;
  sootBlackIron: THREE.MeshStandardMaterial;
  dustyConcrete: THREE.MeshStandardMaterial;
  foundryBrick: THREE.MeshStandardMaterial;
  dirtyHazardYellow: THREE.MeshStandardMaterial;
  ceramicInsulator: THREE.MeshStandardMaterial;
  rubberCableInsulation: THREE.MeshStandardMaterial;
  furnaceAmberEmissive: THREE.MeshStandardMaterial;
  electricCyanEmissive: THREE.MeshStandardMaterial;
}

/**
 * Centralized PBR Material Preset Catalog for the STEMPUNK Underworld & Vertical Districts.
 * Reuses shared procedural PBR maps (diffuse in SRGBColorSpace, linear normal, roughness, metalness)
 * so zero duplicate GPU textures are allocated.
 */
export function getSteampunkMaterialPresets(): SteampunkMaterialPresetCatalog {
  const m = ProceduralMeshFactory.materials;
  return {
    weatheredSteel: m.weatheredPlating,
    oxidizedCopper: m.copper,
    verdigrisPatinaCopper: m.verdigrisCopper,
    agedBrass: m.brass,
    corrodedRustIron: m.rustIron,
    sootBlackIron: m.darkChassis,
    dustyConcrete: m.weatheredConcrete,
    foundryBrick: m.foundryBrick,
    dirtyHazardYellow: m.hazardYellow,
    ceramicInsulator: m.ceramicInsulator,
    rubberCableInsulation: m.rubberCable,
    furnaceAmberEmissive: m.glowAmber,
    electricCyanEmissive: m.glowCyan,
  };
}
