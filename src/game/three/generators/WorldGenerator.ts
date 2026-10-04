import * as THREE from 'three';
import { LevelEnvironmentSpec, LEVEL_SPECIFICATIONS } from './LevelEnvironmentSpec';
import { ProceduralMeshFactory } from './ProceduralMeshFactory';
import { PBRTextureGenerator } from '../materials/PBRTextureGenerator';
import { EnvironmentalStoryLandmarks } from '../environment/EnvironmentalStoryLandmarks';
import { LocalizedSteamAndSparks } from '../effects/LocalizedSteamAndSparks';
import { LEVEL_1_WORLD_INTERACTABLES } from '../../../data/worldContent';
import { InteractionCategory } from '../../../types/game';

export interface GeneratedQuestBeacon {
  id: string;
  category: InteractionCategory;
  promptKey: string;
  subtitle: string;
  group: THREE.Group;
  position: THREE.Vector3;
  radius: number;
  questId: string;
  title: string;
  lightBeam: THREE.Mesh;
  iconMesh: THREE.Mesh;
}

interface AnimatedSteamEngine {
  flywheel: THREE.Group;
  driveGear: THREE.Group;
  pistonRod: THREE.Group;
  governor: THREE.Group;
  phaseOffset: number;
  speed: number;
}

interface DynamicLightningArc {
  line: THREE.Line;
  start: THREE.Vector3;
  end: THREE.Vector3;
  segments: number;
  swayAmplitude: number;
  light?: THREE.PointLight;
}

interface SmokePlumeEmitter {
  points: THREE.Points;
  baseX: number;
  baseY: number;
  baseZ: number;
  riseSpeed: number;
  maxHeight: number;
  spread: number;
}

export class WorldGenerator {
  public rootGroup: THREE.Group;
  public colliders: THREE.Box3[] = [];
  public questBeacons: GeneratedQuestBeacon[] = [];
  public currentSpec: LevelEnvironmentSpec;

  // Animated elements
  private rotatingGears: { gear: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z' }[] = [];
  private steamEngines: AnimatedSteamEngine[] = [];
  private lightningArcs: DynamicLightningArc[] = [];
  private animatedCranes: { crane: THREE.Group; baseRotY: number; phase: number }[] = [];
  private smokePlumes: SmokePlumeEmitter[] = [];
  private localizedSteamAndSparks: LocalizedSteamAndSparks | null = null;
  private cloudLayerGroup: THREE.Group | null = null;
  private sunbeamsGroup: THREE.Group | null = null;
  private companionVolt7: {
    group: THREE.Group;
    bodyGroup: THREE.Group;
    gyroRing: THREE.Mesh;
  } | null = null;
  private holoAtom: THREE.Group | null = null;
  private sparkParticles: THREE.Points | null = null;
  private steamParticles: THREE.Points | null = null;
  private centralElevatorBeam: THREE.Mesh | null = null;
  private towerRings: THREE.Mesh[] = [];
  private airships: {
    group: THREE.Group;
    propeller: THREE.Group;
    radius: number;
    altitude: number;
    speed: number;
    angle: number;
  }[] = [];
  private skyCityLights: THREE.Points | null = null;
  private lastLightningUpdate: number = 0;
  private tempVec: THREE.Vector3 = new THREE.Vector3();

  constructor(initialLevelNumber: number = 1) {
    this.rootGroup = new THREE.Group();
    this.currentSpec = LEVEL_SPECIFICATIONS[initialLevelNumber] || LEVEL_SPECIFICATIONS[1];
    this.generateLevel(this.currentSpec);
  }

  /**
   * Generates a richly composed, open-world Industrial Steampunk Scrapyard Valley following a
   * strict 3-Tier Visual Hierarchy:
   * - TIER 1 (Large Forms): Foundry Buildings, Power Substations, Scrap Mountains, Terrain Berms, Distant Factories
   * - TIER 2 (Medium Forms): Hammerhead Cranes, Overhead Pipe Bridges, Gantries, Steam Engines, Tesla Coils
   * - TIER 3 (Small Props): Fallen Mech Wrecks, Detached Robot Assemblies, Ground Detail Scatter
   * - ATMOSPHERE: Sky Panorama, 3D Cloud Banks, Rising Smokestack Plumes, Volumetric Sunbeams
   */
  public generateLevel(spec: LevelEnvironmentSpec) {
    this.currentSpec = spec;

    // Clear previous children
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      this.rootGroup.remove(child);
    }

    this.colliders = [];
    this.questBeacons = [];
    this.rotatingGears = [];
    this.steamEngines = [];
    this.lightningArcs = [];
    this.animatedCranes = [];
    this.smokePlumes = [];
    this.cloudLayerGroup = null;
    this.sunbeamsGroup = null;
    this.companionVolt7 = null;
    this.towerRings = [];
    this.airships = [];

    // 0. SKY, CLOUDS & DISTANT HORIZON: Panoramic Industrial Sky, 3D Cloud Deck & Airships
    this.buildSkyCloudsAndAirships();

    // 1. TIER 1 (LARGE FORMS - TERRAIN & SCRAP MOUNTAINS): Grounded Terrain, Berms & Colossal Scrap Mountains
    this.buildTerrainAndScrapMountains(spec);

    // 2. TIER 1 (LARGE FORMS - BUILDINGS & DISTANT FACTORIES): Foundry Hall, Power Substation, Reservoir Towers & Horizon Factories
    this.buildLargeBuildingsAndDistantFactories();

    // 3. TIER 2 (MEDIUM FORMS - CRANES, GANTRIES & PIPE BRIDGES): Hammerhead Cranes & Overhead Pipe Networks
    this.buildCranesAndPipeNetworks();

    // 4. TIER 2 (MEDIUM FORMS - MACHINERY): Working Reciprocating Steam Engines, Boilers & Turbines
    this.buildWorkingSteamEngines();

    // 5. TIER 2 (MEDIUM FORMS - HIGH-VOLTAGE): Sparking Tesla Coils & Dynamic 3D Lightning Arcs
    this.buildSparkingTeslaCoils();

    // 6. TIER 3 (SMALL PROPS & DETAIL): Fallen Mech Wrecks, Detached Robot Assemblies & Ground Scatter
    this.buildScrapyardDetailScatter(spec);

    // 7. TIER 1 LANDMARK: Colossal Central Industrial Power Spire & Blast Tower
    this.buildTowerBackdrop();

    // 8. FOREGROUND FOCAL POINT: Open-Air Steampunk Research Outpost (360-degree accessible)
    this.buildSteampunkOutpost(spec);

    // 8B. ENVIRONMENTAL STORYTELLING LANDMARKS: Monumental Sector Gate, Collapsed Viaduct, Abandoned Repair Bay & Ground Cables
    this.buildEnvironmentalStoryLandmarks();

    // 9. QUEST HOLOGRAM BEACONS
    this.buildQuestBeacons(spec);

    // 10. ATMOSPHERIC DEPTH: Billowing Smokestack Plumes, Localized Pipe Steam, Intermittent Sparks & Volumetric Sunbeams
    this.buildSmokeAndAtmosphere();
  }

  /**
   * 8B. Environmental Storytelling Landmarks & Ground Cable Conduits
   */
  private buildEnvironmentalStoryLandmarks() {
    // 1. Monumental Sealed Sector Gate framing the Northern Elevator Citadel (z = -30.5)
    const sectorGate = EnvironmentalStoryLandmarks.createMonumentalSectorGate(
      new THREE.Vector3(0, 0, -30.5)
    );
    this.rootGroup.add(sectorGate);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-7.8, 0, -32.2), new THREE.Vector3(-4.6, 12, -28.8)),
      new THREE.Box3(new THREE.Vector3(4.6, 0, -32.2), new THREE.Vector3(7.8, 12, -28.8))
    );

    // 2. Collapsed Factory Bridge / Viaduct Overpass on the North-Western Ridge
    const collapsedBridge = EnvironmentalStoryLandmarks.createCollapsedIndustrialBridge(
      new THREE.Vector3(-12.5, 0, -29.0),
      0.28
    );
    this.rootGroup.add(collapsedBridge);

    // 3. Abandoned Automaton Field Repair Bay ([-19, 0, -19])
    const repairBay = EnvironmentalStoryLandmarks.createAbandonedRepairBay(
      new THREE.Vector3(-19.0, 0, -19.0),
      0.55
    );
    this.rootGroup.add(repairBay);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-21.6, 0, -21.2), new THREE.Vector3(-16.4, 4.2, -16.8))
    );

    // 4. Ground Power Cable & Oxidized Copper Conduit Network linking generators to the Outpost & Gate
    const cableNetwork = EnvironmentalStoryLandmarks.createGroundCableNetwork();
    this.rootGroup.add(cableNetwork);
  }

  /**
   * 0. Sky Dome, 3D Drifting Cloud Deck, Distant Horizon Lights & Cruising Dirigibles
   */
  private buildSkyCloudsAndAirships() {
    // 1. 360-degree Panoramic Industrial Valley & Distant Factory Sky Dome
    const skyTex = PBRTextureGenerator.createSubterraneanCitySkyTexture();
    const domeGeo = new THREE.SphereGeometry(142, 48, 32);
    const domeMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false,
    });
    const skyDome = new THREE.Mesh(domeGeo, domeMat);
    skyDome.position.set(0, -4, 0);
    this.rootGroup.add(skyDome);

    // 2. 3D Volumetric High-Altitude Cloud Deck (Soft layered cloud banks drifting overhead)
    const cloudGroup = new THREE.Group();
    const cloudMatDark = new THREE.MeshBasicMaterial({
      color: 0x36322e,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      fog: false,
    });
    const cloudMatWarm = new THREE.MeshBasicMaterial({
      color: 0x8c6239,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      fog: false,
    });

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + (i % 3) * 0.2;
      const dist = 35 + (i % 4) * 22;
      const cx = Math.cos(angle) * dist;
      const cz = Math.sin(angle) * dist;
      const cy = 42 + (i % 5) * 4.5;

      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(9 + (i % 4) * 3.5, 10, 8),
        i % 3 === 0 ? cloudMatWarm : cloudMatDark
      );
      puff.position.set(cx, cy, cz);
      puff.scale.set(2.4, 0.32, 1.6);
      puff.rotation.y = angle;
      cloudGroup.add(puff);
    }
    this.rootGroup.add(cloudGroup);
    this.cloudLayerGroup = cloudGroup;

    // 3. Distant Horizon Factory Beacon & Furnace Lights
    const cityLightCount = 240;
    const cityGeo = new THREE.BufferGeometry();
    const cityPos = new Float32Array(cityLightCount * 3);
    for (let i = 0; i < cityLightCount; i++) {
      const angle = (i / cityLightCount) * Math.PI * 2 + (i % 7) * 0.15;
      const dist = 96 + (i % 5) * 6;
      cityPos[i * 3] = Math.cos(angle) * dist;
      cityPos[i * 3 + 1] = 4 + (i % 10) * 2.4;
      cityPos[i * 3 + 2] = Math.sin(angle) * dist;
    }
    cityGeo.setAttribute('position', new THREE.BufferAttribute(cityPos, 3));
    const cityMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.85,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    this.skyCityLights = new THREE.Points(cityGeo, cityMat);
    this.rootGroup.add(this.skyCityLights);

    // 4. 4 Cruising Steampunk Dirigibles / Airships patrolling the distant industrial skyline
    const airshipSpecs = [
      { radius: 54, altitude: 29, speed: 0.11, startAngle: 0.4, scale: 1.1 },
      { radius: 68, altitude: 36, speed: -0.09, startAngle: 2.2, scale: 1.25 },
      { radius: 46, altitude: 25, speed: 0.13, startAngle: 4.1, scale: 0.95 },
      { radius: 76, altitude: 42, speed: -0.08, startAngle: 5.4, scale: 1.35 },
    ];

    airshipSpecs.forEach((as) => {
      const { group, propeller } = ProceduralMeshFactory.createSteampunkAirship(as.scale);
      this.rootGroup.add(group);
      this.airships.push({
        group,
        propeller,
        radius: as.radius,
        altitude: as.altitude,
        speed: as.speed,
        angle: as.startAngle,
      });
    });
  }

  /**
   * 1. TIER 1 (LARGE FORMS): Grounded Industrial Terrain, Undulating Slag Berms & Colossal Scrap Mountains
   */
  private buildTerrainAndScrapMountains(spec: LevelEnvironmentSpec) {
    const [w, d] = spec.terrain.size;

    // 1. Vast Grounded Industrial Earth & Slag Terrain Plane with Organic Perimeter Height Variation
    const groundGeo = new THREE.PlaneGeometry(w, d, 64, 64);
    const posAttr = groundGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i); // maps to world Z after -PI/2 rotation
      const dist = Math.sqrt(vx * vx + vy * vy);
      // Keep playable central yard (r < 23m) flat for exact collision & foot placement;
      // sculpt organic hills, slag ridges, and craters across the outer valley (r > 23m)
      if (dist > 23) {
        const blend = Math.min(1.0, (dist - 23) / 18);
        const ridge =
          Math.sin(vx * 0.085) * Math.cos(vy * 0.085) * 2.2 +
          Math.sin(vx * 0.19 + vy * 0.15) * 0.95 +
          Math.cos(dist * 0.14) * 0.85;
        posAttr.setZ(i, Math.max(-0.4, ridge * blend));
      }
    }
    groundGeo.computeVertexNormals();

    const ground = new THREE.Mesh(groundGeo, ProceduralMeshFactory.materials.weatheredConcrete);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.rootGroup.add(ground);

    // 2. Heavy Industrial Steel Foundation Pads (Dark diamond-tread steel plates with subtle iron curbing — NO giant orange gears!)
    const foundationPads: [number, number, number][] = [
      [0, 11, 5.2],     // Awakening Pad
      [0, -2, 6.5],     // Central Industrial Yard Junction
      [0, -16, 6.0],    // Open Research Outpost Pad
      [12, -4, 5.2],    // East High-Voltage Substation Yard
      [-12, 5, 5.0],    // West Steam & Automaton Yard
    ];

    foundationPads.forEach(([px, pz, radius]) => {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius + 0.35, 0.06, 16),
        ProceduralMeshFactory.materials.diamondTread
      );
      disc.position.set(px, 0.03, pz);
      disc.receiveShadow = true;
      this.rootGroup.add(disc);

      // Subtle dark cast-iron curb ring embedded flush in the ground
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.06, 8, 24),
        ProceduralMeshFactory.materials.darkChassis
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(px, 0.04, pz);
      this.rootGroup.add(rim);
    });

    // 3. Undulating Low Terrain Earth & Slag Berms around the field (breaks up flat ground naturally, no colliders)
    const bermSpecs: [number, number, number, number, number][] = [
      [-19, -0.35, 9, 6.5, 0.9],
      [20, -0.35, -9, 7.2, 1.0],
      [-22, -0.4, -17, 8.0, 1.1],
      [22, -0.4, 15, 7.5, 1.0],
      [-8, -0.35, 25, 6.8, 0.85],
      [11, -0.35, 27, 7.0, 0.95],
    ];
    bermSpecs.forEach(([bx, by, bz, rad, h]) => {
      const berm = new THREE.Mesh(
        new THREE.SphereGeometry(rad, 12, 8),
        ProceduralMeshFactory.materials.weatheredConcrete
      );
      berm.position.set(bx, by, bz);
      berm.scale.set(1.3, h / rad, 1.0);
      berm.receiveShadow = true;
      this.rootGroup.add(berm);
    });

    // 4. 10 COLOSSAL CRAGGY SCRAP MOUNTAINS & SLAG RIDGES (8m-14m tall) framing the entire valley!
    const scrapMountainSpecs: [number, number, number, number, number, number][] = [
      // [x, y, z, radius, height, rotY]
      [-38, 0, 14, 13, 10.5, 0.4],
      [-36, 0, -22, 14, 11.5, 1.2],
      [38, 0, 12, 13, 10.0, -0.6],
      [37, 0, -22, 14, 12.0, -1.4],
      [-24, 0, 34, 12, 9.5, 0.8],
      [25, 0, 35, 12.5, 10.0, -0.9],
      [0, 0, 40, 15, 11.5, 0.2],
      [-42, 0, -3, 12, 9.8, 1.7],
      [42, 0, -4, 12.5, 10.2, -1.5],
      [-18, 0, -36, 13, 11.0, 0.5],
    ];

    scrapMountainSpecs.forEach(([mx, my, mz, rad, h, rotY]) => {
      const mountain = ProceduralMeshFactory.createScrapMountain(
        new THREE.Vector3(mx, my, mz),
        rad,
        h,
        rotY
      );
      this.rootGroup.add(mountain);
      this.colliders.push(
        new THREE.Box3(
          new THREE.Vector3(mx - rad * 0.7, 0, mz - rad * 0.7),
          new THREE.Vector3(mx + rad * 0.7, h, mz + rad * 0.7)
        )
      );
    });

    // 5. Outer Valley Boundary Cliffs at +-84m
    const halfW = w / 2 - 4;
    const halfD = d / 2 - 4;
    const h = spec.terrain.wallHeight;
    const boundPositions = [
      { x: 0, z: halfD, w: w, d: 4 },
      { x: 0, z: -halfD, w: w, d: 4 },
      { x: -halfW, z: 0, w: 4, d: d },
      { x: halfW, z: 0, w: 4, d: d },
    ];
    boundPositions.forEach((b) => {
      this.colliders.push(
        new THREE.Box3(
          new THREE.Vector3(b.x - b.w / 2, 0, b.z - b.d / 2),
          new THREE.Vector3(b.x + b.w / 2, h, b.z + b.d / 2)
        )
      );
    });

    // 6. Subtle Awakening Pad Marker (z = 11, x = 0)
    const podGroup = new THREE.Group();
    podGroup.position.set(0, 0, 11);
    const podRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.0, 0.06, 8, 32),
      ProceduralMeshFactory.materials.glowAmber
    );
    podRing.rotation.x = Math.PI / 2;
    podRing.position.y = 0.07;
    podGroup.add(podRing);
    this.rootGroup.add(podGroup);
  }

  /**
   * 2. TIER 1 (LARGE ARCHITECTURAL FORMS):
   * Multi-Story Industrial Foundry Halls, Power Substations, Reservoir Towers & 8 Distant Horizon Factories!
   */
  private buildLargeBuildingsAndDistantFactories() {
    // A. West Multi-Story Smelting Foundry & Rolling Mill Building (with sawtooth roof & twin 24m smokestacks)
    const westFoundry = ProceduralMeshFactory.createIndustrialFoundryBuilding(
      new THREE.Vector3(-31, 0, -6),
      Math.PI / 2.15
    );
    this.rootGroup.add(westFoundry);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-38, 0, -16), new THREE.Vector3(-24, 12, 4))
    );

    // B. East High-Voltage Power Substation & Hyperboloid Cooling Tower Annex
    const eastSubstation = ProceduralMeshFactory.createPowerSubstationBuilding(
      new THREE.Vector3(31, 0, -5),
      -Math.PI / 2.15
    );
    this.rootGroup.add(eastSubstation);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(24, 0, -14), new THREE.Vector3(38, 12, 5))
    );

    // C. North-East Secondary Foundry & Boiler Works Hall
    const northEastFoundry = ProceduralMeshFactory.createIndustrialFoundryBuilding(
      new THREE.Vector3(24, 0, -32),
      -0.45
    );
    this.rootGroup.add(northEastFoundry);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(15, 0, -39), new THREE.Vector3(33, 12, -25))
    );

    // D. 2 Towering 19m Elevated Spherical Steam/Water Reservoir Towers
    const nwReservoir = ProceduralMeshFactory.createElevatedReservoirTower(
      new THREE.Vector3(-25, 0, -24),
      0.35
    );
    this.rootGroup.add(nwReservoir);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-28.5, 0, -27.5), new THREE.Vector3(-21.5, 16, -20.5))
    );

    const seReservoir = ProceduralMeshFactory.createElevatedReservoirTower(
      new THREE.Vector3(26, 0, 23),
      -0.6
    );
    this.rootGroup.add(seReservoir);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(22.5, 0, 19.5), new THREE.Vector3(29.5, 16, 26.5))
    );

    // E. 8 DISTANT HORIZON FACTORY COMPLEXES (at r = 64m..78m in every direction for deep discovery & scale!)
    const distantFactorySpecs: [number, number, number, number, number][] = [
      // [x, y, z, rotY, scale]
      [-64, 0, -48, 0.65, 1.25],
      [64, 0, -46, -0.65, 1.25],
      [-72, 0, 4, 1.45, 1.3],
      [72, 0, 6, -1.45, 1.3],
      [-58, 0, 52, 2.35, 1.2],
      [58, 0, 52, -2.35, 1.2],
      [0, 0, 74, 3.14, 1.35],
      [-34, 0, -68, 0.35, 1.25],
    ];

    distantFactorySpecs.forEach(([fx, fy, fz, rotY, sc]) => {
      const factory = ProceduralMeshFactory.createDistantFactoryComplex(
        new THREE.Vector3(fx, fy, fz),
        rotY,
        sc
      );
      this.rootGroup.add(factory);
    });
  }

  /**
   * 3. TIER 2 (MEDIUM INDUSTRIAL STRUCTURES):
   * Towering 18m Harbor Hammerhead Cranes, Overhead Steel Truss Gantries & Elevated Multi-Pipe Trestle Bridges!
   */
  private buildCranesAndPipeNetworks() {
    // A. 5 Towering 18m Harbor / Scrapyard Hammerhead Cranes overlooking the valley
    const craneSpecs: [number, number, number, number, number, number][] = [
      // [x, y, z, rotY, height, boomLength]
      [-21, 0, 7, 1.15, 17.5, 16.5],
      [22, 0, -14, -1.85, 18.0, 17.0],
      [-14, 0, -24, 0.55, 16.5, 15.5],
      [19, 0, 17, -0.85, 17.0, 16.0],
      [-24, 0, 22, 0.95, 16.5, 15.0],
    ];

    craneSpecs.forEach(([cx, cy, cz, rotY, h, boom], idx) => {
      const crane = ProceduralMeshFactory.createHarborHammerheadCrane(
        new THREE.Vector3(cx, cy, cz),
        rotY,
        h,
        boom
      );
      this.rootGroup.add(crane);
      this.animatedCranes.push({ crane, baseRotY: rotY, phase: idx * 1.4 });
      this.colliders.push(
        new THREE.Box3(new THREE.Vector3(cx - 2.0, 0, cz - 2.0), new THREE.Vector3(cx + 2.0, h, cz + 2.0))
      );
    });

    // B. 3 Heavy Overhead Industrial Truss Gantry Arches spanning work zones
    const gantrySpecs: [number, number, number, number, number, number][] = [
      // [x, y, z, span, height, rotY]
      [0, 0, -9, 15, 8.2, 0],
      [-12, 0, 2, 13, 7.6, Math.PI / 3],
      [13, 0, -4, 13, 7.8, -Math.PI / 4],
    ];
    gantrySpecs.forEach(([gx, gy, gz, span, gh, rotY]) => {
      const gantry = ProceduralMeshFactory.createOverheadGantry(
        new THREE.Vector3(gx, gy, gz),
        span,
        gh
      );
      gantry.rotation.y = rotY;
      this.rootGroup.add(gantry);
    });

    // C. 7 Elevated Multi-Pipe Industrial Trestle Bridges connecting buildings & machinery across the valley
    const pipeBridges: [[number, number, number], [number, number, number], number][] = [
      [[-25, 0, -6], [-15, 0, -3], 5.8],
      [[-24, 0, -22], [-9, 0, -22], 6.2],
      [[25, 0, -5], [15, 0, -6.5], 5.8],
      [[22, 0, -26], [9.5, 0, -21], 6.0],
      [[-15, 0, -3], [-6.5, 0, -16], 5.4],
      [[17, 0, -14], [6.5, 0, -16], 5.4],
      [[24, 0, 21], [10, 0, 20], 5.8],
    ];
    pipeBridges.forEach(([p1, p2, h]) => {
      const bridge = ProceduralMeshFactory.createIndustrialPipeBridge(
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
        h
      );
      this.rootGroup.add(bridge);
    });

    // D. Additional High-Pressure Overhead Copper Steam Conduits
    const pipeRuns: [[number, number, number], [number, number, number]][] = [
      [[16, 4.9, 8], [10, 4.9, -6.5]],
      [[-16, 4.9, 14], [-7.5, 4.9, 12]],
      [[-8, 4.9, -9], [0, 4.9, -16]],
      [[8, 4.9, 3], [14.5, 4.9, -2]],
    ];
    pipeRuns.forEach(([p1, p2]) => {
      const pipe = ProceduralMeshFactory.createSteamPipeRun(
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
        0.24
      );
      this.rootGroup.add(pipe);
    });
  }

  /**
   * 4. TIER 2 (MEDIUM FORMS - WORKING MACHINERY):
   * Animated Reciprocating Steam Engines, Riveted Boilers & Mega Dynamo Turbines
   */
  private buildWorkingSteamEngines() {
    const engineSpecs: [number, number, number, number, number, number][] = [
      // [x, y, z, rotY, scale, speed]
      [-15, 0, -3, 0.45, 1.15, 2.2],
      [16, 0, 8, -0.6, 1.1, 2.5],
      [-16, 0, 14, 0.8, 1.05, 1.9],
      [17, 0, -14, -0.4, 1.2, 2.4],
      [-9, 0, -22, 0.2, 1.0, 2.1],
      [10, 0, 20, -0.9, 1.1, 2.0],
    ];

    engineSpecs.forEach(([ex, ey, ez, rotY, scale, speed], idx) => {
      const engine = ProceduralMeshFactory.createWorkingSteamEngine(
        new THREE.Vector3(ex, ey, ez),
        rotY,
        scale
      );
      this.rootGroup.add(engine.group);

      this.steamEngines.push({
        flywheel: engine.flywheel,
        driveGear: engine.driveGear,
        pistonRod: engine.pistonRod,
        governor: engine.governor,
        phaseOffset: idx * 1.3,
        speed,
      });

      this.colliders.push(
        new THREE.Box3(
          new THREE.Vector3(ex - 2.1 * scale, 0, ez - 1.5 * scale),
          new THREE.Vector3(ex + 2.1 * scale, 3.5 * scale, ez + 1.5 * scale)
        )
      );
    });

    // Riveted Copper Steam Boilers paired with pipe runs and buildings
    const boilerCoords: [number, number, number, number][] = [
      [-7.5, 0, -9, 0.5],
      [8.0, 0, 3, -0.4],
      [-8.5, 0, 17, 1.1],
      [9.5, 0, -21, -0.8],
      [-21, 0, 5, 0.3],
      [21, 0, -2, -0.5],
    ];
    boilerCoords.forEach(([bx, by, bz, rotY]) => {
      const boiler = ProceduralMeshFactory.createSteampunkBoiler(new THREE.Vector3(bx, by, bz), 1.05);
      boiler.rotation.y = rotY;
      this.rootGroup.add(boiler);
      this.colliders.push(
        new THREE.Box3(
          new THREE.Vector3(bx - 1.3, 0, bz - 1.0),
          new THREE.Vector3(bx + 1.3, 3.2, bz + 1.0)
        )
      );
    });

    // 2 Colossal Steam Dynamo Turbines
    const turbineCoords: [number, number, number, number][] = [
      [-20, 0, -13, Math.PI / 5],
      [21, 0, 15, -Math.PI / 4],
    ];
    turbineCoords.forEach(([tx, ty, tz, trotY]) => {
      const turbine = ProceduralMeshFactory.createMegaDynamoTurbine(new THREE.Vector3(tx, ty, tz), 1.05);
      turbine.rotation.y = trotY;
      this.rootGroup.add(turbine);
      this.colliders.push(
        new THREE.Box3(new THREE.Vector3(tx - 2.3, 0, tz - 1.7), new THREE.Vector3(tx + 2.3, 3.5, tz + 1.7))
      );
    });
  }

  /**
   * 5. TIER 2 (MEDIUM FORMS - HIGH-VOLTAGE):
   * Sparking Tesla Coils & High-Voltage Transformers with Live 3D Jagged Lightning Arcs
   */
  private buildSparkingTeslaCoils() {
    const teslaSpecs: { pos: [number, number, number]; height: number }[] = [
      // East Substation Twin Tesla Generator Array (around Quest Beacon 3 at [12, 0, -4])
      { pos: [10.0, 0, -6.5], height: 4.4 },
      { pos: [14.5, 0, -2.0], height: 4.4 },
      { pos: [14.8, 0, -7.2], height: 3.9 },
      // Coils flanking the Open Research Outpost
      { pos: [-6.5, 0, -16.0], height: 4.0 },
      { pos: [6.5, 0, -16.0], height: 4.0 },
      // Coils integrated into the Scrapyard Field
      { pos: [-13.5, 0, -12.0], height: 4.2 },
      { pos: [-7.5, 0, 12.0], height: 3.8 },
      { pos: [8.5, 0, 12.5], height: 3.8 },
    ];

    const topPositions: THREE.Vector3[] = [];

    teslaSpecs.forEach(({ pos: [x, y, z], height }) => {
      const tesla = ProceduralMeshFactory.createTeslaGenerator(new THREE.Vector3(x, y, z), height);
      this.rootGroup.add(tesla);
      this.colliders.push(
        new THREE.Box3(new THREE.Vector3(x - 1.25, 0, z - 1.25), new THREE.Vector3(x + 1.25, height, z + 1.25))
      );

      const topY = y + height - 0.35;
      topPositions.push(new THREE.Vector3(x, topY, z));
    });

    // High-Voltage Industrial Transformer Cabinets adjacent to the Substation & Coils
    const transformerCoords: [number, number, number, number][] = [
      [18.5, 0, -5.5, -0.4],
      [17.5, 0, -9.5, -0.6],
      [-17.5, 0, -11.0, 0.5],
      [-5.5, 0, -20.5, 0.2],
    ];
    transformerCoords.forEach(([tx, ty, tz, rotY]) => {
      const tr = ProceduralMeshFactory.createTransformer(new THREE.Vector3(tx, ty, tz));
      tr.rotation.y = rotY;
      this.rootGroup.add(tr);
      this.colliders.push(
        new THREE.Box3(new THREE.Vector3(tx - 1.2, 0, tz - 0.9), new THREE.Vector3(tx + 1.2, 3.2, tz + 0.9))
      );
    });

    // 14 Dynamic Jagged 3D Lightning Bolts jumping between coils and grounding rods
    const arcPairs: [THREE.Vector3, THREE.Vector3, number, boolean][] = [
      [topPositions[0], topPositions[1], 0x38bdf8, true],
      [topPositions[1], topPositions[2], 0xfbbf24, false],
      [topPositions[0], topPositions[2], 0x7dd3fc, false],
      [topPositions[0], new THREE.Vector3(12.0, 0.4, -4.2), 0x38bdf8, false],
      [topPositions[3], new THREE.Vector3(-4.2, 1.5, -16.0), 0xfbbf24, true],
      [topPositions[4], new THREE.Vector3(4.2, 1.5, -16.0), 0x38bdf8, true],
      [topPositions[3], topPositions[5], 0xf59e0b, false],
      [topPositions[5], new THREE.Vector3(-11.0, 1.2, -9.5), 0x38bdf8, true],
      [topPositions[6], new THREE.Vector3(-5.0, 0.5, 10.5), 0xfbbf24, true],
      [topPositions[7], new THREE.Vector3(6.0, 0.6, 10.5), 0x38bdf8, true],
      [topPositions[0], topPositions[0].clone().add(new THREE.Vector3(-1.8, 1.2, 1.2)), 0x38bdf8, false],
      [topPositions[1], topPositions[1].clone().add(new THREE.Vector3(1.6, 1.4, -1.4)), 0xfbbf24, false],
      [topPositions[3], topPositions[3].clone().add(new THREE.Vector3(0.8, 1.6, 1.2)), 0x38bdf8, false],
      [topPositions[4], topPositions[4].clone().add(new THREE.Vector3(-0.8, 1.6, 1.2)), 0xfbbf24, false],
    ];

    const mainTeslaLight = new THREE.PointLight(0x38bdf8, 3.2, 18);
    mainTeslaLight.position.set(12.2, 3.6, -4.5);
    this.rootGroup.add(mainTeslaLight);

    arcPairs.forEach(([start, end, hexColor], idx) => {
      const segments = 12;
      const points: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        points.push(new THREE.Vector3().lerpVectors(start, end, i / segments));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(geo, mat);
      this.rootGroup.add(line);

      this.lightningArcs.push({
        line,
        start,
        end,
        segments,
        swayAmplitude: 0.42,
        light: idx === 0 ? mainTeslaLight : undefined,
      });
    });
  }

  /**
   * 6. TIER 3 (SMALL PROPS & FINE ENVIRONMENTAL DETAIL):
   * Fallen Titan Mech Wrecks, Medium Scrap Piles, Detached Robot Assemblies & GPU-Instanced Ground Detail
   * (Notice: NO giant floating orange gears!)
   */
  private buildScrapyardDetailScatter(spec: LevelEnvironmentSpec) {
    // A. 8 Fallen Titan Automaton Wrecks across the open field
    const robotCoords: [number, number, number, number, number][] = [
      [-11, 0.3, 5, 0.8, -0.4],     // Quest Beacon 2 target!
      [6, 0.25, 7, -0.6, 1.2],
      [-15, 0.35, -8, 1.4, 0.2],
      [-13, 0.3, 19, 0.3, 0.6],
      [14, 0.3, 2, -1.1, -0.3],
      [-5, 0.3, -9, 2.1, 0.4],
      [7, 0.3, -10, -1.5, -0.5],
      [19, 0.3, -8, 0.7, 0.8],
    ];
    for (let i = 0; i < Math.min(spec.population.robotWrecksCount, robotCoords.length); i++) {
      const [x, y, z, ry, rz] = robotCoords[i];
      const bot = ProceduralMeshFactory.createTitanMechWreck(
        new THREE.Vector3(x, y, z),
        new THREE.Euler(0.3, ry, rz),
        1.1
      );
      this.rootGroup.add(bot);
      this.colliders.push(
        new THREE.Box3(new THREE.Vector3(x - 1.1, 0, z - 1.1), new THREE.Vector3(x + 1.1, 2.2, z + 1.1))
      );
    }

    // B. 12 Medium Industrial Scrap Mounds (Slag, I-beams, crushed tanks, hull plates) at the foot of buildings/cranes
    const scrapHeapCoords: [number, number, number, number, number][] = [
      [-18, 0, 2, 0.5, 1.25],
      [19, 0, 4, -0.4, 1.2],
      [-11, 0, -14, 0.8, 1.25],
      [11, 0, -13, -0.7, 1.2],
      [-16, 0, -21, 0.2, 1.35],
      [16, 0, -21, -0.5, 1.35],
      [-10, 0, 22, 1.1, 1.15],
      [11, 0, 23, -0.9, 1.15],
      [-23, 0, -5, 0.4, 1.3],
      [23, 0, -9, -0.6, 1.3],
      [-22, 0, 12, 1.5, 1.2],
      [22, 0, 11, -1.2, 1.2],
    ];
    scrapHeapCoords.forEach(([sx, sy, sz, rotY, sc]) => {
      const pile = ProceduralMeshFactory.createScrapPile(new THREE.Vector3(sx, sy, sz), rotY, sc);
      this.rootGroup.add(pile);
      this.colliders.push(
        new THREE.Box3(
          new THREE.Vector3(sx - 1.65 * sc, 0, sz - 1.4 * sc),
          new THREE.Vector3(sx + 1.65 * sc, 2.4 * sc, sz + 1.4 * sc)
        )
      );
    });

    // C. Balanced GPU-Instanced Ground Detail Scatter (I-beams, pipes, hull slabs, oil drums, robot parts, subtle dark-bronze cogs)
    const instancedParts = ProceduralMeshFactory.createInstancedScrapyardParts();
    this.rootGroup.add(instancedParts);

    // D. 16 Close-Up Detached Robot Assemblies around the walkable yards
    const robotAssemblySpecs: [number, number, number, 'head_cluster' | 'claw_arm' | 'ribcage_core' | 'hydraulic_leg', number, number][] = [
      [-3.5, 0, 8.2, 'head_cluster', 0.6, 1.15],
      [3.8, 0, 7.5, 'claw_arm', -0.8, 1.2],
      [-4.8, 0, 2.8, 'ribcage_core', 1.2, 1.1],
      [4.6, 0, 3.2, 'hydraulic_leg', -0.4, 1.15],
      [-3.2, 0, -4.5, 'claw_arm', 2.1, 1.2],
      [3.4, 0, -5.2, 'head_cluster', -1.3, 1.15],
      [-5.2, 0, -10.5, 'hydraulic_leg', 0.9, 1.2],
      [5.0, 0, -11.0, 'ribcage_core', -0.7, 1.15],
      [-8.5, 0, 6.8, 'head_cluster', 1.5, 1.25],
      [-9.2, 0, 1.2, 'claw_arm', -1.8, 1.2],
      [8.5, 0, -1.8, 'ribcage_core', 0.4, 1.2],
      [9.5, 0, -7.8, 'hydraulic_leg', 1.9, 1.25],
      [-3.5, 0, -19.5, 'head_cluster', 0.3, 1.15],
      [3.6, 0, -19.2, 'claw_arm', -0.5, 1.2],
      [-1.8, 0, 14.5, 'ribcage_core', 1.1, 1.15],
      [2.4, 0, 14.8, 'hydraulic_leg', -1.2, 1.15],
    ];
    robotAssemblySpecs.forEach(([rx, ry, rz, kind, rotY, sc]) => {
      const assembly = ProceduralMeshFactory.createDetachedRobotAssembly(
        new THREE.Vector3(rx, ry, rz),
        kind,
        rotY,
        sc
      );
      this.rootGroup.add(assembly);
    });

    // E. Industrial Yard Streetlanterns
    const lanternCoords: [number, number][] = [
      [-5.5, 11], [5.5, 11],
      [-7.5, 2], [7.5, 2],
      [-7.5, -7], [7.5, -7],
      [-5.8, -15], [5.8, -15],
      [11, 1], [-12, -2],
    ];
    lanternCoords.forEach(([lx, lz]) => {
      const lamp = this.createStreetlamp(lx, 0, lz);
      this.rootGroup.add(lamp);
    });
  }

  private createStreetlamp(x: number, y: number, z: number): THREE.Group {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, y, z);

    const metalMat = ProceduralMeshFactory.materials.darkChassis;
    const brassMat = ProceduralMeshFactory.materials.brass;

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 4.5, 8), metalMat);
    pole.position.y = 2.25;
    pole.castShadow = true;
    lampGroup.add(pole);

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.64, 0.46), brassMat);
    lantern.position.set(0, 4.4, 0);
    lampGroup.add(lantern);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 10, 10),
      ProceduralMeshFactory.materials.glowAmber
    );
    bulb.position.set(0, 4.3, 0);
    lampGroup.add(bulb);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 10, 10),
      new THREE.MeshBasicMaterial({
        color: 0xffb52e,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    halo.position.set(0, 4.3, 0);
    lampGroup.add(halo);

    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(x - 0.22, 0, z - 0.22), new THREE.Vector3(x + 0.22, 4.5, z + 0.22))
    );

    return lampGroup;
  }

  /**
   * 7. TIER 1 NORTHERN LANDMARK: Colossal Industrial Blast-Furnace & Power Spire Citadel
   * Replaces giant floating gears with heavy steel lattice columns, blast-furnace silos,
   * structural catwalks, and integrated dark-bronze turbine drive wheels!
   */
  private buildTowerBackdrop() {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0, 0, -42);
    const m = ProceduralMeshFactory.materials;

    // 1. Massive Foundry Citadel Base Block
    const citadelBase = new THREE.Mesh(new THREE.BoxGeometry(34, 14, 24), m.foundryBrick);
    citadelBase.position.y = 7;
    citadelBase.castShadow = true;
    citadelBase.receiveShadow = true;
    towerGroup.add(citadelBase);

    // Illuminated industrial furnace slit windows across the citadel base
    for (let wx = -13; wx <= 13; wx += 6.5) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.5, 24.3), m.glowAmber);
      win.position.set(wx, 8.0, 0);
      towerGroup.add(win);
    }

    // 2. Central Vertical Energy Conduit Core
    const beamGeo = new THREE.CylinderGeometry(1.5, 1.9, 95, 20);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.6,
      transparent: true,
      opacity: 0.82,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 47.5;
    towerGroup.add(beam);
    this.centralElevatorBeam = beam;

    const coreLight = new THREE.PointLight(0xf59e0b, 3.8, 55);
    coreLight.position.set(0, 20, 8);
    towerGroup.add(coreLight);

    // 3. 4 Colossal Gunmetal Steel Pylon Columns & Cross-Girder Trusses
    [[-14, -10], [14, -10], [-14, 10], [14, 10]].forEach(([px, pz]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 2.1, 90, 12),
        m.darkChassis
      );
      col.position.set(px, 45, pz);
      col.castShadow = true;
      towerGroup.add(col);
    });

    // Flanking Cylindrical Blast-Furnace Stoves & Vertical Piping
    [-20, 20].forEach((sx) => {
      const stove = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 32, 16), m.rustIron);
      stove.position.set(sx, 16, 2);
      stove.castShadow = true;
      towerGroup.add(stove);

      const stoveDome = new THREE.Mesh(new THREE.SphereGeometry(3.4, 14, 10), m.copper);
      stoveDome.position.set(sx, 32, 2);
      towerGroup.add(stoveDome);
    });

    // 4. Integrated Dark-Bronze Mechanical Drive Wheels housed inside the Lower Machinery Deck
    const driveWheelL = ProceduralMeshFactory.createTrueToothedGear(5.2, 0.8, 18, 'bronze', 6);
    driveWheelL.position.set(-14, 17, 10.8);
    towerGroup.add(driveWheelL);
    this.rotatingGears.push({ gear: driveWheelL, speed: 0.14, axis: 'z' });

    const driveWheelR = ProceduralMeshFactory.createTrueToothedGear(5.2, 0.8, 18, 'bronze', 6);
    driveWheelR.position.set(14, 17, 10.8);
    towerGroup.add(driveWheelR);
    this.rotatingGears.push({ gear: driveWheelR, speed: -0.14, axis: 'z' });

    // 5. Structural Industrial Tier Platforms & Catwalk Rings
    const tiers: [number, number, number, THREE.Material][] = [
      [16, 19, 21, m.glowAmber],
      [28, 17, 18, m.glowCyan],
      [40, 15, 16, m.glowAmber],
      [52, 13, 14, m.glowViolet],
    ];

    tiers.forEach(([ty, rTop, rBot, glowMat]) => {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBot, 2.4, 24),
        m.darkChassis
      );
      ring.position.y = ty;
      ring.castShadow = true;
      towerGroup.add(ring);

      const glowRim = new THREE.Mesh(new THREE.TorusGeometry(rTop + 0.35, 0.25, 8, 36), glowMat);
      glowRim.rotation.x = Math.PI / 2;
      glowRim.position.y = ty + 0.8;
      towerGroup.add(glowRim);
      this.towerRings.push(glowRim);
    });

    // 6. Upper Citadel Smokestacks & Industrial Crown
    const crownBase = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 14, 4.5, 24),
      m.weatheredPlating
    );
    crownBase.position.y = 62;
    towerGroup.add(crownBase);

    const spireHeights = [18, 26, 22, 16, 28, 20];
    spireHeights.forEach((h, idx) => {
      const angle = (idx * Math.PI * 2) / spireHeights.length;
      const r = 8 + (idx % 2) * 3.5;
      const sx = Math.cos(angle) * r;
      const sz = Math.sin(angle) * r;

      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 1.4, h, 10),
        m.darkChassis
      );
      spire.position.set(sx, 64 + h / 2, sz);
      towerGroup.add(spire);
    });

    this.rootGroup.add(towerGroup);
  }

  /**
   * 8. Open-Air Steampunk Research Outpost ("SZABAD ÉG ALATTI KUTATÓ ÁLLOMÁS")
   */
  private buildSteampunkOutpost(spec: LevelEnvironmentSpec) {
    const [fx, fy, fz] = spec.facility.position;
    const outpostPos = new THREE.Vector3(fx, fy, fz);

    // 1. Open-Air Steampunk Laboratory Workbench
    const workbenchGroup = ProceduralMeshFactory.createOpenSteampunkWorkbench(outpostPos);
    this.rootGroup.add(workbenchGroup);

    // 2. Floating Holographic Atom Model directly above workbench
    const holoAtom = new THREE.Group();
    holoAtom.position.set(fx, fy + 2.75, fz);

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 14, 14),
      ProceduralMeshFactory.materials.glowAmber
    );
    holoAtom.add(nucleus);

    for (let r = 0; r < 3; r++) {
      const orbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.75 + r * 0.22, 0.025, 8, 36),
        r % 2 === 0 ? ProceduralMeshFactory.materials.glowAmber : ProceduralMeshFactory.materials.glowCyan
      );
      orbitRing.rotation.x = (r * Math.PI) / 3;
      orbitRing.rotation.y = (r * Math.PI) / 4;
      holoAtom.add(orbitRing);
    }
    this.rootGroup.add(holoAtom);
    this.holoAtom = holoAtom;

    // 3. Only collider is the physical workbench table itself
    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(fx - 1.8, 0, fz - 1.1),
        new THREE.Vector3(fx + 1.8, 1.4, fz + 1.1)
      )
    );

    // 4. Companion Robot VOLT-7 ("Szikra") stationed near the Awakening Pad (x: 3.2, z: 8.5)
    const volt7 = ProceduralMeshFactory.createCompanionVolt7(new THREE.Vector3(3.2, 0, 8.5));
    this.rootGroup.add(volt7.group);
    this.companionVolt7 = volt7;

    // 5. Side Quest & Homework Field Terminal near the Research Outpost (x: -4.2, z: -14.5)
    const sqTerminal = ProceduralMeshFactory.createSideQuestFieldTerminal(
      new THREE.Vector3(-4.2, 0, -14.5),
      0.35
    );
    this.rootGroup.add(sqTerminal);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-5.0, 0, -15.1), new THREE.Vector3(-3.4, 1.8, -13.9))
    );

    // 6. RO-01 KINEMATICS QUEST 01: Rusted Industrial Crate Obstacle at (0, 0, 6.8)
    // Blocks the direct straight line from Awakening Pad (0, 11) to Old Motion Sensor (0, 2.5)
    // so the player must take a detour (s > |Δr|)!
    const crateGroup = new THREE.Group();
    crateGroup.position.set(0, 0, 6.8);

    const m = ProceduralMeshFactory.materials;
    const mainCrate = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.35, 1.65),
      m.rustIron
    );
    mainCrate.position.y = 0.675;
    mainCrate.castShadow = true;
    mainCrate.receiveShadow = true;
    crateGroup.add(mainCrate);

    // Hazard yellow-black warning stripe bar & brass corner braces on the crate
    const hazardBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.56, 0.22, 1.7),
      m.hazardYellow
    );
    hazardBar.position.y = 0.95;
    crateGroup.add(hazardBar);

    const topSubCrate = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.65, 0.95),
      m.weatheredPlating
    );
    topSubCrate.position.set(-0.4, 1.67, 0.1);
    topSubCrate.rotation.y = 0.18;
    topSubCrate.castShadow = true;
    crateGroup.add(topSubCrate);

    this.rootGroup.add(crateGroup);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-1.35, 0, 5.85), new THREE.Vector3(1.35, 2.0, 7.75))
    );

    // 7. RO-01 KINEMATICS QUEST 01: Old Motion Sensor & Path Telemetry Pylon at (0, 0, 2.5)
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0, 0, 2.5);

    const sensorBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.85, 0.36, 12),
      m.darkChassis
    );
    sensorBase.position.y = 0.18;
    sensorBase.castShadow = true;
    sensorGroup.add(sensorBase);

    const sensorColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 1.65, 10),
      m.copper
    );
    sensorColumn.position.y = 1.1;
    sensorColumn.castShadow = true;
    sensorGroup.add(sensorColumn);

    const sensorScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.62, 0.18),
      m.brass
    );
    sensorScreen.position.set(0, 1.45, 0.22);
    sensorScreen.rotation.x = -0.22;
    sensorGroup.add(sensorScreen);

    const sensorGlowFace = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.48, 0.04),
      m.glowCyan
    );
    sensorGlowFace.position.set(0, 1.45, 0.31);
    sensorGlowFace.rotation.x = -0.22;
    sensorGroup.add(sensorGlowFace);

    const sensorRadarRing = ProceduralMeshFactory.createTrueToothedGear(0.45, 0.08, 12, 'brass', 4);
    sensorRadarRing.position.set(0, 2.15, 0);
    sensorGroup.add(sensorRadarRing);
    this.rotatingGears.push({ gear: sensorRadarRing, speed: 1.6, axis: 'y' });

    this.rootGroup.add(sensorGroup);
    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(-0.75, 0, 1.75), new THREE.Vector3(0.75, 2.2, 3.25))
    );

    // 8. Speed & Acceleration Test Pedestals at (-5.2, 0, -1.8) and (5.2, 0, -1.8)
    [
      [-5.2, -1.8, m.glowCyan],
      [5.2, -1.8, m.glowAmber],
    ].forEach(([px, pz, glowMat]) => {
      const ped = new THREE.Group();
      ped.position.set(px as number, 0, pz as number);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.1), m.weatheredPlating);
      base.position.y = 0.55;
      base.castShadow = true;
      ped.add(base);
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.8), glowMat as THREE.Material);
      top.position.y = 1.15;
      ped.add(top);
      this.rootGroup.add(ped);
      this.colliders.push(
        new THREE.Box3(
          new THREE.Vector3((px as number) - 0.8, 0, (pz as number) - 0.65),
          new THREE.Vector3((px as number) + 0.8, 1.4, (pz as number) + 0.65)
        )
      );
    });

    // 9. Discarded Household Appliances (Coffee Maker & Vacuum) at (-2.6, 0, 9.2)
    const householdScrap = new THREE.Group();
    householdScrap.position.set(-2.6, 0, 9.2);
    const coffeeBoiler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 0.68, 12),
      m.copper
    );
    coffeeBoiler.position.set(0, 0.34, 0);
    coffeeBoiler.rotation.z = 0.25;
    coffeeBoiler.castShadow = true;
    householdScrap.add(coffeeBoiler);

    const vacuumDrum = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 12, 10),
      m.rustIron
    );
    vacuumDrum.position.set(0.55, 0.28, 0.25);
    householdScrap.add(vacuumDrum);
    this.rootGroup.add(householdScrap);
  }

  private buildQuestBeacons(spec: LevelEnvironmentSpec) {
    // Use the rich 3-category interactables on Level 1, or fallback to spec.questNodes on higher levels
    const interactables =
      spec.levelNumber === 1
        ? LEVEL_1_WORLD_INTERACTABLES
        : spec.questNodes.map((n) => ({
            id: n.id,
            category: 'main_quest' as InteractionCategory,
            promptKey: '[E] FŐKÜLDETÉS: KÍSÉRLET',
            title: n.title,
            subtitle: spec.subtitle,
            position: n.position,
            radius: n.radius,
            color: n.color,
            linkedMainQuestId: n.questId,
            linkedSideQuestId: undefined,
          }));

    interactables.forEach((node) => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(node.position[0], node.position[1], node.position[2]);

      const isMain = node.category === 'main_quest';
      const isSide = node.category === 'side_quest';

      const beamGeo = new THREE.CylinderGeometry(
        isMain ? 0.3 : 0.14,
        isMain ? 0.85 : 0.38,
        isMain ? 6.5 : 3.2,
        16
      );
      const beamMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: isMain ? 2.5 : 1.8,
        transparent: true,
        opacity: isMain ? 0.34 : 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = isMain ? 1.0 : 0.4;
      beaconGroup.add(beam);

      const iconMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 3.6,
        roughness: 0.1,
      });
      const iconGeo = isMain
        ? new THREE.OctahedronGeometry(0.46, 0)
        : isSide
        ? new THREE.BoxGeometry(0.36, 0.36, 0.36)
        : new THREE.OctahedronGeometry(0.26, 0);
      const iconMesh = new THREE.Mesh(iconGeo, iconMat);
      beaconGroup.add(iconMesh);

      const ringGeo = new THREE.TorusGeometry(isMain ? 0.68 : 0.42, 0.035, 8, 24);
      const ringMesh = new THREE.Mesh(ringGeo, iconMat);
      ringMesh.rotation.x = Math.PI / 2;
      beaconGroup.add(ringMesh);

      this.rootGroup.add(beaconGroup);

      this.questBeacons.push({
        id: node.id,
        category: node.category,
        promptKey: node.promptKey,
        subtitle: node.subtitle,
        group: beaconGroup,
        position: new THREE.Vector3(...node.position),
        radius: node.radius,
        questId: node.linkedMainQuestId || node.linkedSideQuestId || node.id,
        title: node.title,
        lightBeam: beam,
        iconMesh,
      });
    });
  }

  /**
   * 10. ATMOSPHERIC DEPTH, BILLOWING FACTORY SMOKE PLUMES & VOLUMETRIC SUNBEAMS
   */
  private buildSmokeAndAtmosphere() {
    // 1. Slanting Volumetric Golden-Hour Sunbeams (God-Rays) cutting across the industrial valley
    const sunbeamsGroup = new THREE.Group();
    const sunbeamCoords: [number, number, number, number, number, number][] = [
      // [x, y, z, height, topR, botR]
      [0, 12.0, -16, 12.0, 0.8, 4.6],
      [-14, 15.0, -2, 15.0, 1.5, 6.5],
      [15, 15.0, -5, 15.0, 1.5, 6.5],
      [-6, 16.0, 10, 16.0, 1.8, 7.2],
    ];
    sunbeamCoords.forEach(([sx, sy, sz, h, topR, botR]) => {
      const ray = ProceduralMeshFactory.createVolumetricLightShaft(
        new THREE.Vector3(sx, sy, sz),
        h,
        topR,
        botR,
        0xffe4b5,
        0.075
      );
      ray.rotation.z = -0.18;
      sunbeamsGroup.add(ray);
    });
    this.rootGroup.add(sunbeamsGroup);
    this.sunbeamsGroup = sunbeamsGroup;

    // 2. Billowing 3D Factory Smokestack & Cooling Tower Plumes rising into the sky!
    const smokestackLocations: [number, number, number, number, number, number][] = [
      // [baseX, baseY, baseZ, maxHeight, spread, colorHex]
      [-37.5, 23.5, -10.5, 22, 6.5, 0x3a322c], // West Foundry Smokestack 1
      [-37.5, 23.5, -1.5, 22, 6.5, 0x3a322c],  // West Foundry Smokestack 2
      [33.5, 15.5, 2.5, 18, 7.5, 0xc2b2a3],    // East Substation Cooling Tower Steam Plume
      [21.0, 23.5, -38.0, 22, 6.5, 0x3a322c],  // North-East Foundry Smokestack
      [-20.0, 32.5, -40.0, 24, 8.0, 0x4a3b30], // Central Citadel West Blast Furnace
      [20.0, 32.5, -40.0, 24, 8.0, 0x4a3b30],  // Central Citadel East Blast Furnace
    ];

    smokestackLocations.forEach(([bx, by, bz, maxH, spread, hexColor]) => {
      const count = 42;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const h = t * maxH;
        const r = t * spread;
        const a = i * 2.4;
        pos[i * 3] = bx + Math.cos(a) * r * 0.5 + t * 4.5; // Wind drift east
        pos[i * 3 + 1] = by + h;
        pos[i * 3 + 2] = bz + Math.sin(a) * r * 0.5;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: hexColor,
        size: 3.4,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      });
      const pts = new THREE.Points(geo, mat);
      this.rootGroup.add(pts);

      this.smokePlumes.push({
        points: pts,
        baseX: bx,
        baseY: by,
        baseZ: bz,
        riseSpeed: 2.2 + Math.random() * 0.8,
        maxHeight: maxH,
        spread,
      });
    });

    // 3. Subtle Floating Industrial Motes & Warm Furnace Embers
    const particleCount = 260;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = 0.4 + Math.random() * 16;
      positions[i + 2] = (Math.random() - 0.5) * 80;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.16,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    this.sparkParticles = new THREE.Points(geometry, material);
    this.rootGroup.add(this.sparkParticles);

    // 4. Low Ground Steam Wisps around Steam Engines & Boilers
    const steamCount = 200;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount * 3; i += 3) {
      steamPos[i] = (Math.random() - 0.5) * 52;
      steamPos[i + 1] = 0.8 + Math.random() * 9;
      steamPos[i + 2] = (Math.random() - 0.5) * 52;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xe5d5c5,
      size: 0.32,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
    });
    this.steamParticles = new THREE.Points(steamGeo, steamMat);
    this.rootGroup.add(this.steamParticles);

    // 5. Localized Pressurized Pipe Steam Vents & Intermittent Electrical Sparks
    this.localizedSteamAndSparks = new LocalizedSteamAndSparks();
    this.rootGroup.add(this.localizedSteamAndSparks.group);
  }

  public update(delta: number, _playerPos: THREE.Vector3) {
    const now = performance.now();
    const time = now * 0.002;

    // 1. Rotate Integrated Mechanical Drive Wheels
    this.rotatingGears.forEach((item) => {
      if (item.axis === 'z') {
        item.gear.rotation.z += delta * item.speed;
      } else if (item.axis === 'y') {
        item.gear.rotation.y += delta * item.speed;
      } else {
        item.gear.rotation.x += delta * item.speed;
      }
    });

    // 2. Animate Working Steampunk Reciprocating Steam Engines
    this.steamEngines.forEach((eng) => {
      const phase = now * 0.001 * eng.speed + eng.phaseOffset;
      eng.flywheel.rotation.z -= delta * eng.speed * 1.6;
      eng.driveGear.rotation.z += delta * eng.speed * 2.4;
      eng.governor.rotation.y += delta * eng.speed * 3.5;
      eng.pistonRod.position.x = Math.sin(phase * 1.6) * 0.36;
    });

    // 3. Slowly Slew / Sway Hammerhead Cranes in the Skyline
    this.animatedCranes.forEach((c) => {
      c.crane.rotation.y = c.baseRotY + Math.sin(time * 0.18 + c.phase) * 0.14;
    });

    // 4. Animate Billowing Factory Smokestack & Cooling Tower Plumes
    this.smokePlumes.forEach((plume, pIdx) => {
      const posAttr = plume.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + delta * plume.riseSpeed;
        const relH = y - plume.baseY;
        if (relH > plume.maxHeight) {
          y = plume.baseY;
        }
        const t = (y - plume.baseY) / plume.maxHeight;
        const angle = i * 2.4 + time * 0.3 + pIdx;
        const r = t * plume.spread * 0.55;
        const x = plume.baseX + Math.cos(angle) * r + t * 5.0; // Wind drift
        const z = plume.baseZ + Math.sin(angle) * r;
        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    });

    // 5. Slowly Drift Overhead 3D Cloud Layer
    if (this.cloudLayerGroup) {
      this.cloudLayerGroup.rotation.y += delta * 0.006;
    }

    // 6. Animate Jagged 3D Tesla Coil Lightning Bolts
    if (now - this.lastLightningUpdate > 55) {
      this.lastLightningUpdate = now;
      this.lightningArcs.forEach((arc) => {
        const posAttr = arc.line.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 1; i < arc.segments; i++) {
          const t = i / arc.segments;
          this.tempVec.lerpVectors(arc.start, arc.end, t);
          const envelope = Math.sin(t * Math.PI);
          const jx = (Math.random() - 0.5) * arc.swayAmplitude * envelope;
          const jy =
            envelope * 0.35 + (Math.random() - 0.5) * arc.swayAmplitude * envelope;
          const jz = (Math.random() - 0.5) * arc.swayAmplitude * envelope;
          posAttr.setXYZ(i, this.tempVec.x + jx, this.tempVec.y + jy, this.tempVec.z + jz);
        }
        posAttr.needsUpdate = true;

        if (arc.light) {
          arc.light.intensity = 2.0 + Math.random() * 2.5;
        }
      });
    }

    // 7. Rotate Holographic Atom
    if (this.holoAtom) {
      this.holoAtom.rotation.y += delta * 0.9;
      this.holoAtom.rotation.x = Math.sin(now * 0.001) * 0.2;
    }

    // 8. Animate 3D Quest Beacons
    this.questBeacons.forEach((beacon, idx) => {
      const bob = Math.sin(time + idx) * 0.18;
      beacon.iconMesh.position.y = bob;
      beacon.iconMesh.rotation.y += delta * 1.5;
      beacon.iconMesh.rotation.x = Math.sin(time * 1.5) * 0.3;

      const beamScale = 1.0 + Math.sin(time * 2 + idx) * 0.12;
      beacon.lightBeam.scale.set(beamScale, 1, beamScale);
    });

    // 9. Pulsate Tower Energy Rings & Elevator Beam
    if (this.centralElevatorBeam) {
      const scale = 1.0 + Math.sin(now * 0.003) * 0.08;
      this.centralElevatorBeam.scale.set(scale, 1, scale);
    }

    this.towerRings.forEach((ring, idx) => {
      ring.rotation.z += delta * (idx % 2 === 0 ? 0.2 : -0.15);
    });

    // 10. Drift Atmospheric Particles & Distant Horizon Shimmer
    if (this.sparkParticles) {
      this.sparkParticles.rotation.y += delta * 0.015;
    }

    if (this.steamParticles) {
      this.steamParticles.rotation.y -= delta * 0.012;
    }

    if (this.skyCityLights) {
      this.skyCityLights.rotation.y += delta * 0.003;
    }

    // 11. Animate Cruising Steampunk Airships / Dirigibles
    this.airships.forEach((ship, idx) => {
      ship.angle += delta * ship.speed;
      const sx = Math.cos(ship.angle) * ship.radius;
      const sz = Math.sin(ship.angle) * ship.radius - 8;
      const sy = ship.altitude + Math.sin(time * 0.8 + idx * 1.7) * 1.2;

      ship.group.position.set(sx, sy, sz);
      const tangentAngle = ship.speed > 0 ? -ship.angle : -ship.angle + Math.PI;
      ship.group.rotation.y = tangentAngle;
      ship.group.rotation.z = Math.sin(time + idx) * 0.05;

      ship.propeller.rotation.z += delta * 14;
    });

    // 12. Animate Companion Robot VOLT-7 ("Szikra") hovering & turning toward player
    if (this.companionVolt7) {
      this.companionVolt7.bodyGroup.position.y = 1.25 + Math.sin(time * 1.4) * 0.12;
      this.companionVolt7.gyroRing.rotation.z += delta * 1.8;
      this.companionVolt7.gyroRing.rotation.x = Math.PI / 2.3 + Math.sin(time) * 0.22;

      const dx = _playerPos.x - 3.2;
      const dz = _playerPos.z - 8.5;
      const targetAngle = Math.atan2(dx, dz);
      this.companionVolt7.bodyGroup.rotation.y = THREE.MathUtils.lerp(
        this.companionVolt7.bodyGroup.rotation.y,
        targetAngle,
        delta * 5
      );
    }

    // 13. Update Localized Pipe Steam Jets & Intermittent Electrical Spark Bursts
    if (this.localizedSteamAndSparks) {
      this.localizedSteamAndSparks.update(delta);
    }
  }

  public setEffectsVisibility(particlesEnabled: boolean, atmosphericEffectsEnabled: boolean) {
    if (this.sparkParticles) this.sparkParticles.visible = particlesEnabled;
    if (this.steamParticles) this.steamParticles.visible = particlesEnabled;
    if (this.localizedSteamAndSparks) this.localizedSteamAndSparks.group.visible = particlesEnabled;
    this.smokePlumes.forEach((p) => {
      p.points.visible = particlesEnabled;
    });
    if (this.sunbeamsGroup) this.sunbeamsGroup.visible = atmosphericEffectsEnabled;
    if (this.cloudLayerGroup) this.cloudLayerGroup.visible = atmosphericEffectsEnabled;
  }

  public checkPlayerLocation(playerPos: THREE.Vector3): string {
    const [, , fz] = this.currentSpec.facility.position;
    if (playerPos.distanceTo(new THREE.Vector3(0, 0, fz)) < 7.0) {
      return `Level ${this.currentSpec.levelNumber}: ${this.currentSpec.facility.name}`;
    } else if (playerPos.distanceTo(new THREE.Vector3(12, 0, -4)) < 7.5) {
      return `Level ${this.currentSpec.levelNumber}: Keleti Alállomás & Tesla-Mező`;
    } else if (playerPos.distanceTo(new THREE.Vector3(-11, 0, 5)) < 7.5) {
      return `Level ${this.currentSpec.levelNumber}: Nyugati Öntöde & Gőzgép-Udvar`;
    } else {
      return `Level ${this.currentSpec.levelNumber}: Ipari Völgy & Roncstelep`;
    }
  }
}
