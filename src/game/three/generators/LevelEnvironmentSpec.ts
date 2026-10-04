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
    name: 'STEAMPUNK RONCSTELEP',
    subtitle: 'A Fogaskerekek & Gőzgépek Völgye',
    theme: 'scrapyard_underworld',
    description:
      'Szabadon bejárható, barnás-aranyos steampunk roncstelep-mező. Működő gőzgépek, szikrázó Tesla-tekercsek, sárgaréz fogaskerekek és szétszórt mechanikai alkatrészek.',
    sky: {
      backgroundColor: 0x26211c,
      fogColor: 0x2e261f,
      fogDensity: 0.0048,
      ambientColor: 0x6e7885,
      ambientIntensity: 1.45,
      sunColor: 0xffe4b5,
      sunIntensity: 2.8,
      sunPosition: [38, 46, 26],
      secondaryLightColor: 0xc27838,
      secondaryLightIntensity: 1.25,
    },
    terrain: {
      size: [180, 180],
      groundColor: 0x2e2722,
      walkwayColor: 0x38332e,
      hasHazardStrips: false,
      wallColor: 0x29231e,
      wallHeight: 12,
    },
    population: {
      robotWrecksCount: 8,
      inductionCoilsCount: 6,
      transformersCount: 4,
      containersCount: 8,
      cableSpoolsCount: 8,
      energyBarrelsCount: 12,
      steamVentsCount: 6,
      overheadGantryCount: 2,
    },
    facility: {
      name: 'STEAMPUNK KUTATÓ ÁLLOMÁS',
      signColor: 0xf59e0b,
      width: 16,
      height: 6.4,
      depth: 20,
      position: [0, 0, -16],
      hasInteriorWorkbench: true,
    },
    questNodes: [
      {
        id: 'beacon-static-lab',
        questId: 'quest-01-electrostatics',
        title: '01. Elektrosztatika Kísérleti Asztal',
        position: [0, 2.6, -16],
        color: 0xf59e0b,
        radius: 3.8,
      },
      {
        id: 'beacon-robot-core',
        questId: 'quest-02-charges',
        title: '02. Töltött Automatamag Vizsgálata',
        position: [-11, 2.2, 5],
        color: 0xfbbf24,
        radius: 3.4,
      },
      {
        id: 'beacon-tesla-array',
        questId: 'quest-03-tesla',
        title: '03. Villámló Tesla-Tekercs Generátor',
        position: [12, 2.6, -4],
        color: 0x38bdf8,
        radius: 3.8,
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
