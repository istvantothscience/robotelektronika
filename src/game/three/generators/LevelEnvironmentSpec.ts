import * as THREE from 'three';

export type BiomeTheme =
  | 'scrapyard_underworld'
  | 'static_research_lab'
  | 'circuit_deck'
  | 'power_plant'
  | 'automation_district'
  | 'sky_city';

export interface LightSpec {
  color: number;
  intensity: number;
  position: [number, number, number];
  distance?: number;
}

export interface QuestNodeSpec {
  id: string;
  questId: string;
  title: string;
  position: [number, number, number];
  color: number;
  radius: number;
}

export interface LevelEnvironmentSpec {
  levelNumber: number;
  id: string;
  name: string;
  subtitle: string;
  theme: BiomeTheme;
  description: string;

  // Sky & Lighting Parameters
  sky: {
    backgroundColor: number;
    fogColor: number;
    fogDensity: number;
    ambientColor: number;
    ambientIntensity: number;
    sunColor: number;
    sunIntensity: number;
    sunPosition: [number, number, number];
    secondaryLightColor: number;
    secondaryLightIntensity: number;
  };

  // Terrain & Boundary Parameters
  terrain: {
    size: [number, number];
    groundColor: number;
    walkwayColor: number;
    hasHazardStrips: boolean;
    wallColor: number;
    wallHeight: number;
  };

  // Density & Population Specifications for Procedural Mesh Factory
  population: {
    robotWrecksCount: number;
    inductionCoilsCount: number;
    transformersCount: number;
    containersCount: number;
    cableSpoolsCount: number;
    energyBarrelsCount: number;
    steamVentsCount: number;
    overheadGantryCount: number;
  };

  // Core Building / Facility Spec
  facility: {
    name: string;
    signColor: number;
    width: number;
    height: number;
    depth: number;
    position: [number, number, number];
    hasInteriorWorkbench: boolean;
  };

  // Quests embedded in this world level
  questNodes: QuestNodeSpec[];
}

/**
 * Declarative Level Specifications for all 6 Vertical Tiers of the STEMPUNK World.
 * The procedural generator uses these parameters to construct the rich 3D environment.
 */
export const LEVEL_SPECIFICATIONS: Record<number, LevelEnvironmentSpec> = {
  1: {
    levelNumber: 1,
    id: 'level-1-underworld',
    name: 'UNDERWORLD',
    subtitle: 'A Roncstelep & Az Ébredés',
    theme: 'scrapyard_underworld',
    description:
      'Sötét ipari kanyon a világ alján. Elhagyott gépek, rozsdás robotvázak, kohóparázs, óriási fogaskerekek és az ébredési töltődokkoló.',
    sky: {
      backgroundColor: 0x161f2c,
      fogColor: 0x161f2c,
      fogDensity: 0.012,
      ambientColor: 0x334155,
      ambientIntensity: 1.6,
      sunColor: 0xffedd5,
      sunIntensity: 2.4,
      sunPosition: [22, 40, 18],
      secondaryLightColor: 0xf97316,
      secondaryLightIntensity: 1.4,
    },
    terrain: {
      size: [150, 150],
      groundColor: 0x1a212b,
      walkwayColor: 0x2e3846,
      hasHazardStrips: true,
      wallColor: 0x181f28,
      wallHeight: 9,
    },
    population: {
      robotWrecksCount: 5,
      inductionCoilsCount: 4,
      transformersCount: 2,
      containersCount: 6,
      cableSpoolsCount: 4,
      energyBarrelsCount: 8,
      steamVentsCount: 3,
      overheadGantryCount: 2,
    },
    facility: {
      name: 'STATIC RESEARCH LAB',
      signColor: 0x8b5cf6,
      width: 16,
      height: 6.4,
      depth: 20,
      position: [0, 0, -18],
      hasInteriorWorkbench: true,
    },
    questNodes: [
      {
        id: 'beacon-static-lab',
        questId: 'quest-01-electrostatics',
        title: '01. Elektrosztatika Kísérleti Asztal',
        position: [0, 2.6, -18],
        color: 0x8b5cf6,
        radius: 3.5,
      },
      {
        id: 'beacon-robot-core',
        questId: 'quest-02-charges',
        title: '02. Töltött Robotmag Vizsgálata',
        position: [-8, 2.2, 7],
        color: 0x22d3ee,
        radius: 3.0,
      },
    ],
  },

  2: {
    levelNumber: 2,
    id: 'level-2-static',
    name: 'STATIC RESEARCH',
    subtitle: 'Elektrosztatikus Kutatóállomás',
    theme: 'static_research_lab',
    description:
      'Tesla-generátorokkal, plazmagömbökkel, elektromos mező analizátorokkal és nagyfeszültségű izolátorokkal felszerelt kutatófedélzet.',
    sky: {
      backgroundColor: 0x1c1938,
      fogColor: 0x1c1938,
      fogDensity: 0.010,
      ambientColor: 0x4c1d95,
      ambientIntensity: 1.8,
      sunColor: 0xc4b5fd,
      sunIntensity: 2.6,
      sunPosition: [18, 45, 15],
      secondaryLightColor: 0x8b5cf6,
      secondaryLightIntensity: 2.0,
    },
    terrain: {
      size: [140, 140],
      groundColor: 0x1f1936,
      walkwayColor: 0x3b2d54,
      hasHazardStrips: true,
      wallColor: 0x231b3d,
      wallHeight: 10,
    },
    population: {
      robotWrecksCount: 2,
      inductionCoilsCount: 8,
      transformersCount: 4,
      containersCount: 4,
      cableSpoolsCount: 6,
      energyBarrelsCount: 10,
      steamVentsCount: 4,
      overheadGantryCount: 3,
    },
    facility: {
      name: 'FIELD & INDUCTION CHAMBER',
      signColor: 0xc084fc,
      width: 18,
      height: 7.0,
      depth: 22,
      position: [0, 0, -20],
      hasInteriorWorkbench: true,
    },
    questNodes: [
      {
        id: 'beacon-induction',
        questId: 'quest-05-induction',
        title: '05. Elektrosztatikus Indukció',
        position: [0, 2.6, -20],
        color: 0xc084fc,
        radius: 3.5,
      },
    ],
  },

  3: {
    levelNumber: 3,
    id: 'level-3-circuit',
    name: 'CIRCUIT LAB',
    subtitle: 'Áramkörépítő Csarnok',
    theme: 'circuit_deck',
    description:
      'Holografikus áramköri munkaállomások, rézsínek, kapcsolószekrények, ellenállások, LED modulok és árammérő konzolok birodalma.',
    sky: {
      backgroundColor: 0x082f49,
      fogColor: 0x082f49,
      fogDensity: 0.009,
      ambientColor: 0x0e7490,
      ambientIntensity: 2.0,
      sunColor: 0x38bdf8,
      sunIntensity: 2.8,
      sunPosition: [15, 50, 10],
      secondaryLightColor: 0x22d3ee,
      secondaryLightIntensity: 2.2,
    },
    terrain: {
      size: [150, 150],
      groundColor: 0x0c2536,
      walkwayColor: 0x155e75,
      hasHazardStrips: true,
      wallColor: 0x082f49,
      wallHeight: 11,
    },
    population: {
      robotWrecksCount: 1,
      inductionCoilsCount: 6,
      transformersCount: 6,
      containersCount: 8,
      cableSpoolsCount: 10,
      energyBarrelsCount: 12,
      steamVentsCount: 2,
      overheadGantryCount: 4,
    },
    facility: {
      name: 'CIRCUIT SYNTHESIZER LAB',
      signColor: 0x22d3ee,
      width: 20,
      height: 7.5,
      depth: 24,
      position: [0, 0, -20],
      hasInteriorWorkbench: true,
    },
    questNodes: [
      {
        id: 'beacon-circuit-build',
        questId: 'quest-07-first-circuit',
        title: '07. Az Első Zárt Áramkör',
        position: [0, 2.6, -20],
        color: 0x22d3ee,
        radius: 3.5,
      },
    ],
  },
};
