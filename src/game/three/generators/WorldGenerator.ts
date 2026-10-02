import * as THREE from 'three';
import { LevelEnvironmentSpec, LEVEL_SPECIFICATIONS } from './LevelEnvironmentSpec';
import { ProceduralMeshFactory } from './ProceduralMeshFactory';
import { soundManager } from '../../../audio/soundManager';

export interface GeneratedQuestBeacon {
  id: string;
  group: THREE.Group;
  position: THREE.Vector3;
  radius: number;
  questId: string;
  title: string;
  lightBeam: THREE.Mesh;
  iconMesh: THREE.Mesh;
}

export class WorldGenerator {
  public rootGroup: THREE.Group;
  public colliders: THREE.Box3[] = [];
  public questBeacons: GeneratedQuestBeacon[] = [];
  public currentSpec: LevelEnvironmentSpec;

  // Animated elements
  private rotatingGears: THREE.Mesh[] = [];
  private labDoorLeft: THREE.Mesh | null = null;
  private labDoorRight: THREE.Mesh | null = null;
  private doorProgress: number = 0;
  private doorPlayedSfx: boolean = false;
  private holoAtom: THREE.Group | null = null;
  private sparkParticles: THREE.Points | null = null;
  private steamParticles: THREE.Points | null = null;
  private sparkLight: THREE.PointLight | null = null;
  private centralElevatorBeam: THREE.Mesh | null = null;
  private towerRings: THREE.Mesh[] = [];

  constructor(initialLevelNumber: number = 1) {
    this.rootGroup = new THREE.Group();
    this.currentSpec = LEVEL_SPECIFICATIONS[initialLevelNumber] || LEVEL_SPECIFICATIONS[1];
    this.generateLevel(this.currentSpec);
  }

  /**
   * Generates or regenerates a complete, super-detailed 3D world based on a declarative LevelEnvironmentSpec
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
    this.towerRings = [];
    this.doorProgress = 0;
    this.doorPlayedSfx = false;

    // 1. Terrain & Walkways
    this.buildTerrain(spec);

    // 2. Canyon Enclosure
    this.buildCanyonWalls(spec);

    // 3. Overhead Gantries
    this.buildGantries(spec);

    // 4. Populated Props & Machinery via ProceduralMeshFactory
    this.buildPopulatedProps(spec);

    // 5. The Colossal 6-Tier Vertical Tower Backdrop
    this.buildTowerBackdrop();

    // 6. Main Research Facility Building
    this.buildFacility(spec);

    // 7. Quest Hologram Beacons
    this.buildQuestBeacons(spec);

    // 8. Atmospheric Particles
    this.buildAtmosphere(spec);
  }

  private buildTerrain(spec: LevelEnvironmentSpec) {
    const [w, d] = spec.terrain.size;

    // Ground Plane
    const groundGeo = new THREE.PlaneGeometry(w, d, 28, 28);
    const groundMat = new THREE.MeshStandardMaterial({
      color: spec.terrain.groundColor,
      roughness: 0.75,
      metalness: 0.55,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.rootGroup.add(ground);

    // Central Walkway
    const walkwayGeo = new THREE.PlaneGeometry(8, 54);
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: spec.terrain.walkwayColor,
      roughness: 0.45,
      metalness: 0.75,
    });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.rotation.x = -Math.PI / 2;
    walkway.position.set(0, 0.04, 0);
    walkway.receiveShadow = true;
    this.rootGroup.add(walkway);

    // Hazard strips along walkway
    if (spec.terrain.hasHazardStrips) {
      const stripMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.5 });
      [-3.9, 3.9].forEach((sx) => {
        const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 54), stripMat);
        strip.rotation.x = -Math.PI / 2;
        strip.position.set(sx, 0.05, 0);
        this.rootGroup.add(strip);
      });
    }

    // Handrails with safety posts
    const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
    [-4.1, 4.1].forEach((rx) => {
      for (let rz = -22; rz <= 20; rz += 5) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), railMat);
        post.position.set(rx, 0.55, rz);
        post.castShadow = true;
        this.rootGroup.add(post);
      }
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 44), railMat);
      topBar.position.set(rx, 1.1, -1);
      topBar.castShadow = true;
      this.rootGroup.add(topBar);
    });

    // Awakening Pod (Where the robot wakes up at z = 14)
    const podGroup = new THREE.Group();
    podGroup.position.set(0, 0, 14);

    const podBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.7, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 })
    );
    podBase.position.y = 0.2;
    podBase.receiveShadow = true;
    podGroup.add(podBase);

    const podRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.09, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 3.0 })
    );
    podRing.rotation.x = Math.PI / 2;
    podRing.position.y = 0.42;
    podGroup.add(podRing);

    const podLight = new THREE.PointLight(0x22d3ee, 2.2, 9);
    podLight.position.set(0, 1.0, 0);
    podGroup.add(podLight);

    this.rootGroup.add(podGroup);
  }

  private buildCanyonWalls(spec: LevelEnvironmentSpec) {
    const wallMat = new THREE.MeshStandardMaterial({
      color: spec.terrain.wallColor,
      roughness: 0.85,
      metalness: 0.45,
    });
    const rustPipeMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7, metalness: 0.6 });

    const [w, d] = spec.terrain.size;
    const halfW = w / 2 - 2;
    const halfD = d / 2 - 2;
    const h = spec.terrain.wallHeight;

    const boundPositions = [
      { x: 0, z: halfD, w: w, d: 3 },
      { x: 0, z: -halfD, w: w, d: 3 },
      { x: -halfW, z: 0, w: 3, d: d },
      { x: halfW, z: 0, w: 3, d: d },
    ];

    boundPositions.forEach((b) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(b.w, h, b.d), wallMat);
      wall.position.set(b.x, h / 2, b.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.rootGroup.add(wall);
      this.colliders.push(new THREE.Box3().setFromObject(wall));

      // Industrial copper/rust piping along walls
      const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, b.w > b.d ? b.w : b.d, 12);
      const pipe = new THREE.Mesh(pipeGeo, rustPipeMat);
      if (b.w > b.d) pipe.rotation.z = Math.PI / 2;
      else pipe.rotation.x = Math.PI / 2;
      pipe.position.set(b.x, h * 0.45, b.z);
      this.rootGroup.add(pipe);
    });
  }

  private buildGantries(spec: LevelEnvironmentSpec) {
    const count = spec.population.overheadGantryCount;
    const zPositions = [-4, 6, 16];

    for (let i = 0; i < Math.min(count, zPositions.length); i++) {
      const gantry = ProceduralMeshFactory.createOverheadGantry(
        new THREE.Vector3(0, 0, zPositions[i]),
        14,
        7.5
      );
      this.rootGroup.add(gantry);
    }
  }

  private buildPopulatedProps(spec: LevelEnvironmentSpec) {
    // 1. Robot Wrecks
    const robotCoords: [number, number, number, number, number][] = [
      [-8, 0.3, 7, 0.8, -0.4],
      [9, 0.25, 12, -0.6, 1.2],
      [-12, 0.35, -5, 1.4, 0.2],
      [-10, 0.3, 17, 0.3, 0.6],
      [11, 0.3, -2, -1.1, -0.3],
    ];
    for (let i = 0; i < Math.min(spec.population.robotWrecksCount, robotCoords.length); i++) {
      const [x, y, z, ry, rz] = robotCoords[i];
      const bot = ProceduralMeshFactory.createRobotWreck(
        new THREE.Vector3(x, y, z),
        new THREE.Euler(0.3, ry, rz)
      );
      this.rootGroup.add(bot);
      this.colliders.push(new THREE.Box3().setFromObject(bot));
    }

    // 2. High-Voltage Tesla Generators
    const teslaCoords: [number, number, number][] = [
      [-7, 0, 15],
      [7, 0, 15],
      [-11, 0, -2],
      [11, 0, -2],
    ];
    for (let i = 0; i < Math.min(spec.population.inductionCoilsCount, teslaCoords.length); i++) {
      const [x, y, z] = teslaCoords[i];
      const tesla = ProceduralMeshFactory.createTeslaGenerator(new THREE.Vector3(x, y, z), 3.8);
      this.rootGroup.add(tesla);
      this.colliders.push(new THREE.Box3().setFromObject(tesla));
    }

    // 3. Transformer Substations
    const transCoords: [number, number, number][] = [
      [-12, 0, 4],
      [12, 0, 5],
    ];
    for (let i = 0; i < Math.min(spec.population.transformersCount, transCoords.length); i++) {
      const [x, y, z] = transCoords[i];
      const trans = ProceduralMeshFactory.createTransformer(new THREE.Vector3(x, y, z));
      this.rootGroup.add(trans);
      this.colliders.push(new THREE.Box3().setFromObject(trans));
    }

    // 4. Steam Pipes
    const pipe = ProceduralMeshFactory.createSteamPipeRun(
      new THREE.Vector3(-14, 2.5, 8),
      new THREE.Vector3(-4.5, 2.5, 8),
      0.22
    );
    this.rootGroup.add(pipe);

    // 5. Giant Cogwheels
    const cogCoords: [number, number, number, number, number, number][] = [
      [-10, 1.8, 6, 2.8, 0.4, 0.6],
      [12, 2.4, 7, 3.4, -0.5, -0.4],
      [-8, 1.6, -1, 2.2, 0.3, 0.8],
    ];
    cogCoords.forEach(([cx, cy, cz, r, rx, rz]) => {
      const gear = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.3, 16),
        new THREE.MeshStandardMaterial({ color: 0xc99a3d, roughness: 0.45, metalness: 0.85 })
      );
      gear.position.set(cx, cy, cz);
      gear.rotation.set(rx, 0, rz);
      gear.castShadow = true;
      gear.receiveShadow = true;
      this.rootGroup.add(gear);
      this.rotatingGears.push(gear);
      this.colliders.push(new THREE.Box3().setFromObject(gear));
    });

    // 6. Streetlamps with warm sodium glow
    [[-4.8, 4], [4.8, 4], [-4.8, -4], [4.8, -4]].forEach(([lx, lz]) => {
      const lamp = this.createStreetlamp(lx, 0, lz);
      this.rootGroup.add(lamp);
    });

    // 7. Signs: "↑ UNDERWORLD" and "JUNKYARD"
    this.buildSignboards();
  }

  private createStreetlamp(x: number, y: number, z: number): THREE.Group {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, y, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, roughness: 0.3 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.85, roughness: 0.3 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 4.4, 8), metalMat);
    pole.position.y = 2.2;
    pole.castShadow = true;
    lampGroup.add(pole);

    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.45), brassMat);
    lantern.position.set(0, 4.3, 0);
    lampGroup.add(lantern);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xffb52e, emissive: 0xffb52e, emissiveIntensity: 3.5 })
    );
    bulb.position.set(0, 4.2, 0);
    lampGroup.add(bulb);

    const light = new THREE.PointLight(0xffb52e, 2.2, 15);
    light.position.set(0, 4.1, 0);
    lampGroup.add(light);

    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(x - 0.3, 0, z - 0.3), new THREE.Vector3(x + 0.3, 4.4, z + 0.3))
    );

    return lampGroup;
  }

  private buildSignboards() {
    // Arrow Sign ("↑ UNDERWORLD")
    const signGroup = new THREE.Group();
    signGroup.position.set(4.8, 0.7, 7);

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.9, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x1e242c, metalness: 0.9, roughness: 0.35 })
    );
    signBoard.castShadow = true;
    signGroup.add(signBoard);

    const signArrow = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xffb52e, emissive: 0xffb52e, emissiveIntensity: 3.5, roughness: 0.2 })
    );
    signArrow.position.set(0, 0, 0.09);
    signGroup.add(signArrow);

    const signLight = new THREE.PointLight(0xffb52e, 2.0, 7);
    signLight.position.set(0, 0, 0.5);
    signGroup.add(signLight);

    this.rootGroup.add(signGroup);
    this.colliders.push(new THREE.Box3().setFromObject(signBoard));

    // Neon Sign ("JUNKYARD")
    const neonGroup = new THREE.Group();
    neonGroup.position.set(-6.0, 3.2, 8);
    neonGroup.rotation.y = 0.35;

    const neonFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.2, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    );
    neonFrame.castShadow = true;
    neonGroup.add(neonFrame);

    const neonLetters = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.75, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 4.0, roughness: 0.1 })
    );
    neonLetters.position.z = 0.14;
    neonGroup.add(neonLetters);

    const neonLight = new THREE.PointLight(0xf43f5e, 2.8, 12);
    neonLight.position.set(0, 0, 0.8);
    neonGroup.add(neonLight);

    this.rootGroup.add(neonGroup);
  }

  private buildTowerBackdrop() {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0, 0, -26);

    // Central Luminous Elevator Beam
    const beamGeo = new THREE.CylinderGeometry(1.8, 2.0, 90, 24);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 3.0,
      transparent: true,
      opacity: 0.85,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 45;
    towerGroup.add(beam);
    this.centralElevatorBeam = beam;

    const coreLight = new THREE.PointLight(0x22d3ee, 4.0, 50);
    coreLight.position.set(0, 20, 0);
    towerGroup.add(coreLight);

    // Vertical Support Columns
    [[-18, -18], [18, -18], [-18, 18], [18, 18]].forEach(([px, pz]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.8, 95, 12),
        new THREE.MeshStandardMaterial({ color: 0x1f242b, metalness: 0.9, roughness: 0.35 })
      );
      col.position.set(px, 47.5, pz);
      col.castShadow = true;
      towerGroup.add(col);
    });

    // Tier 2: Static Research (y = 10, violet)
    const tier2Ring = new THREE.Mesh(
      new THREE.CylinderGeometry(22, 24, 2.0, 36),
      new THREE.MeshStandardMaterial({ color: 0x2e1065, metalness: 0.85, roughness: 0.3 })
    );
    tier2Ring.position.y = 10;
    tier2Ring.castShadow = true;
    towerGroup.add(tier2Ring);

    const tier2GlowRim = new THREE.Mesh(
      new THREE.TorusGeometry(23, 0.45, 8, 40),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 3.8 })
    );
    tier2GlowRim.rotation.x = Math.PI / 2;
    tier2GlowRim.position.y = 11;
    towerGroup.add(tier2GlowRim);
    this.towerRings.push(tier2GlowRim);

    // Tier 3: Circuit Lab (y = 21, cyan)
    const tier3Ring = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 21, 2.0, 36),
      new THREE.MeshStandardMaterial({ color: 0x083344, metalness: 0.85, roughness: 0.3 })
    );
    tier3Ring.position.y = 21;
    tier3Ring.castShadow = true;
    towerGroup.add(tier3Ring);

    const tier3GlowRim = new THREE.Mesh(
      new THREE.TorusGeometry(20.5, 0.4, 8, 40),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 3.8 })
    );
    tier3GlowRim.rotation.x = Math.PI / 2;
    tier3GlowRim.position.y = 22;
    towerGroup.add(tier3GlowRim);
    this.towerRings.push(tier3GlowRim);

    // Tier 4: Power Plant (y = 33, amber)
    const tier4Ring = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 19, 2.0, 36),
      new THREE.MeshStandardMaterial({ color: 0x451a03, metalness: 0.9, roughness: 0.3 })
    );
    tier4Ring.position.y = 33;
    tier4Ring.castShadow = true;
    towerGroup.add(tier4Ring);

    const tier4GlowRim = new THREE.Mesh(
      new THREE.TorusGeometry(18.5, 0.4, 8, 40),
      new THREE.MeshStandardMaterial({ color: 0xffb52e, emissive: 0xffb52e, emissiveIntensity: 3.5 })
    );
    tier4GlowRim.rotation.x = Math.PI / 2;
    tier4GlowRim.position.y = 34;
    towerGroup.add(tier4GlowRim);
    this.towerRings.push(tier4GlowRim);

    // Tier 5: Research District (y = 45, teal)
    const tier5Ring = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 17, 2.0, 36),
      new THREE.MeshStandardMaterial({ color: 0x134e4a, metalness: 0.85, roughness: 0.3 })
    );
    tier5Ring.position.y = 45;
    tier5Ring.castShadow = true;
    towerGroup.add(tier5Ring);

    // Tier 6: Sky City Base & Spire Spires (y = 59 to 85)
    const skyCityBase = new THREE.Mesh(
      new THREE.CylinderGeometry(26, 18, 5, 36),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.15 })
    );
    skyCityBase.position.y = 59;
    skyCityBase.castShadow = true;
    towerGroup.add(skyCityBase);

    const spireHeights = [22, 30, 26, 18, 34, 24];
    spireHeights.forEach((h, idx) => {
      const angle = (idx * Math.PI * 2) / spireHeights.length;
      const r = 9 + (idx % 2) * 5;
      const sx = Math.cos(angle) * r;
      const sz = Math.sin(angle) * r;

      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 2.0, h, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.15 })
      );
      spire.position.set(sx, 61 + h / 2, sz);
      spire.castShadow = true;
      towerGroup.add(spire);

      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 4.5 })
      );
      tip.position.set(sx, 61 + h + 0.5, sz);
      towerGroup.add(tip);
    });

    this.rootGroup.add(towerGroup);
  }

  private buildFacility(spec: LevelEnvironmentSpec) {
    const labGroup = new THREE.Group();
    const [fx, fy, fz] = spec.facility.position;
    labGroup.position.set(fx, fy, fz);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x242c38, roughness: 0.5, metalness: 0.75 });
    const copperTrimMat = new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.35, metalness: 0.85 });

    const bW = spec.facility.width;
    const bH = spec.facility.height;
    const bD = spec.facility.depth;
    const doorW = 4.4;
    const doorH = 3.8;

    // Walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, 0.8), wallMat);
    backWall.position.set(0, bH / 2, -bD / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    labGroup.add(backWall);
    this.colliders.push(new THREE.Box3().setFromObject(backWall));

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, bH, bD), wallMat);
    westWall.position.set(-bW / 2, bH / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    labGroup.add(westWall);
    this.colliders.push(new THREE.Box3().setFromObject(westWall));

    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, bH, bD), wallMat);
    eastWall.position.set(bW / 2, bH / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    labGroup.add(eastWall);
    this.colliders.push(new THREE.Box3().setFromObject(eastWall));

    // Front Wall Left & Right
    const frontWallLeftW = (bW - doorW) / 2;
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(frontWallLeftW, bH, 0.8), wallMat);
    frontWallLeft.position.set(-bW / 2 + frontWallLeftW / 2, bH / 2, bD / 2);
    frontWallLeft.castShadow = true;
    labGroup.add(frontWallLeft);
    this.colliders.push(new THREE.Box3().setFromObject(frontWallLeft));

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(frontWallLeftW, bH, 0.8), wallMat);
    frontWallRight.position.set(bW / 2 - frontWallLeftW / 2, bH / 2, bD / 2);
    frontWallRight.castShadow = true;
    labGroup.add(frontWallRight);
    this.colliders.push(new THREE.Box3().setFromObject(frontWallRight));

    // Lintel
    const lintelH = bH - doorH;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.6, lintelH, 0.8), copperTrimMat);
    lintel.position.set(0, doorH + lintelH / 2, bD / 2);
    labGroup.add(lintel);

    // Glowing Entrance Signboard
    const signMat = new THREE.MeshStandardMaterial({
      color: spec.facility.signColor,
      emissive: spec.facility.signColor,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.9, 0.25), signMat);
    sign.position.set(0, doorH + 0.65, bD / 2 + 0.45);
    labGroup.add(sign);

    const signLight = new THREE.PointLight(spec.facility.signColor, 2.8, 11);
    signLight.position.set(0, doorH + 0.65, bD / 2 + 1.4);
    labGroup.add(signLight);

    // Sliding Blast Doors
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.35 });
    this.labDoorLeft = new THREE.Mesh(new THREE.BoxGeometry(doorW / 2, doorH, 0.2), doorMat);
    this.labDoorLeft.position.set(-doorW / 4, doorH / 2, bD / 2);
    this.labDoorLeft.castShadow = true;
    labGroup.add(this.labDoorLeft);

    this.labDoorRight = new THREE.Mesh(new THREE.BoxGeometry(doorW / 2, doorH, 0.2), doorMat);
    this.labDoorRight.position.set(doorW / 4, doorH / 2, bD / 2);
    this.labDoorRight.castShadow = true;
    labGroup.add(this.labDoorRight);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.6, 0.4, bD + 0.6), wallMat);
    roof.position.set(0, bH + 0.2, 0);
    roof.castShadow = true;
    labGroup.add(roof);

    // Interior Laboratory Workbench
    if (spec.facility.hasInteriorWorkbench) {
      this.buildInteriorWorkbench(labGroup);
    }

    this.rootGroup.add(labGroup);
  }

  private buildInteriorWorkbench(labGroup: THREE.Group) {
    // Epoxy floor inside lab
    const floorGeo = new THREE.PlaneGeometry(15, 19);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x080b0d, roughness: 0.15, metalness: 0.7 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.04;
    floor.receiveShadow = true;
    labGroup.add(floor);

    // Holographic floor ring
    const decalRing = new THREE.Mesh(
      new THREE.RingGeometry(2.5, 2.8, 36),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 2.2,
        side: THREE.DoubleSide,
      })
    );
    decalRing.rotation.x = -Math.PI / 2;
    decalRing.position.set(0, 0.05, 0);
    labGroup.add(decalRing);

    // Workbench Table
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.22, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x272e3b, metalness: 0.8, roughness: 0.3 })
    );
    tableTop.position.set(0, 1.0, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    labGroup.add(tableTop);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111418, metalness: 0.9 });
    [[-1.7, -1.0], [1.7, -1.0], [-1.7, 1.0], [1.7, 1.0]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.5, lz);
      leg.castShadow = true;
      labGroup.add(leg);
    });

    // Terminal Screen
    const terminalScreen = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.9, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x22d3ee,
        emissiveIntensity: 2.2,
        roughness: 0.1,
      })
    );
    terminalScreen.position.set(0, 1.65, -0.85);
    terminalScreen.rotation.x = -0.15;
    labGroup.add(terminalScreen);

    // Floating Holographic Atom Model
    const holoAtom = new THREE.Group();
    holoAtom.position.set(0, 2.7, 0);

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xffb52e, emissive: 0xffb52e, emissiveIntensity: 2.5 })
    );
    holoAtom.add(nucleus);

    for (let r = 0; r < 3; r++) {
      const orbitRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.75 + r * 0.22, 0.02, 8, 36),
        new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          emissive: 0x8b5cf6,
          emissiveIntensity: 2.0,
          transparent: true,
          opacity: 0.85,
        })
      );
      orbitRing.rotation.x = (r * Math.PI) / 3;
      orbitRing.rotation.y = (r * Math.PI) / 4;
      holoAtom.add(orbitRing);
    }

    labGroup.add(holoAtom);
    this.holoAtom = holoAtom;

    const benchSpot = new THREE.SpotLight(0x22d3ee, 4.0, 7, Math.PI / 4, 0.4);
    benchSpot.position.set(0, 3.2, 0);
    benchSpot.target = tableTop;
    labGroup.add(benchSpot);

    const benchWorldBox = new THREE.Box3(
      new THREE.Vector3(-2.1, 0, -18 - 1.4),
      new THREE.Vector3(2.1, 1.9, -18 + 1.4)
    );
    this.colliders.push(benchWorldBox);
  }

  private buildQuestBeacons(spec: LevelEnvironmentSpec) {
    spec.questNodes.forEach((node) => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(node.position[0], node.position[1], node.position[2]);

      // Vertical Light Beam
      const beamGeo = new THREE.CylinderGeometry(0.3, 0.8, 6.0, 16);
      const beamMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 2.5,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 1.0;
      beaconGroup.add(beam);

      // Rotating Octahedron Icon
      const iconMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 4.0,
        roughness: 0.1,
      });
      const iconGeo = new THREE.OctahedronGeometry(0.45, 0);
      const iconMesh = new THREE.Mesh(iconGeo, iconMat);
      beaconGroup.add(iconMesh);

      // Rotating Ring
      const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 8, 24);
      const ringMesh = new THREE.Mesh(ringGeo, iconMat);
      ringMesh.rotation.x = Math.PI / 2;
      beaconGroup.add(ringMesh);

      const pointLight = new THREE.PointLight(node.color, 2.4, 8);
      beaconGroup.add(pointLight);

      this.rootGroup.add(beaconGroup);

      this.questBeacons.push({
        id: node.id,
        group: beaconGroup,
        position: new THREE.Vector3(...node.position),
        radius: node.radius,
        questId: node.questId,
        title: node.title,
        lightBeam: beam,
        iconMesh,
      });
    });
  }

  private buildAtmosphere(spec: LevelEnvironmentSpec) {
    const particleCount = 260;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 16;
      positions[i + 2] = (Math.random() - 0.5) * 60;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: spec.sky.secondaryLightColor,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    this.sparkParticles = new THREE.Points(geometry, material);
    this.rootGroup.add(this.sparkParticles);

    // Amber furnace embers
    const steamCount = 120;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount * 3; i += 3) {
      steamPos[i] = -8 + (Math.random() - 0.5) * 20;
      steamPos[i + 1] = 0.5 + Math.random() * 8;
      steamPos[i + 2] = 6 + (Math.random() - 0.5) * 20;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xffb52e,
      size: 0.22,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    this.steamParticles = new THREE.Points(steamGeo, steamMat);
    this.rootGroup.add(this.steamParticles);

    this.sparkLight = new THREE.PointLight(spec.facility.signColor, 0, 14);
    this.sparkLight.position.set(-6, 2.5, 8);
    this.rootGroup.add(this.sparkLight);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    // 1. Rotate gears
    this.rotatingGears.forEach((g, idx) => {
      g.rotation.y += delta * (idx % 2 === 0 ? 0.3 : -0.25);
    });

    // 2. Rotate Holographic atom
    if (this.holoAtom) {
      this.holoAtom.rotation.y += delta * 0.9;
      this.holoAtom.rotation.x = Math.sin(performance.now() * 0.001) * 0.2;
    }

    // 3. Animate 3D Quest Beacons
    const time = performance.now() * 0.002;
    this.questBeacons.forEach((beacon, idx) => {
      const bob = Math.sin(time + idx) * 0.18;
      beacon.iconMesh.position.y = bob;
      beacon.iconMesh.rotation.y += delta * 1.5;
      beacon.iconMesh.rotation.x = Math.sin(time * 1.5) * 0.3;

      const beamScale = 1.0 + Math.sin(time * 2 + idx) * 0.12;
      beacon.lightBeam.scale.set(beamScale, 1, beamScale);
    });

    // 4. Pulsate Tower Energy Rings & Elevator Beam
    if (this.centralElevatorBeam) {
      const scale = 1.0 + Math.sin(performance.now() * 0.003) * 0.08;
      this.centralElevatorBeam.scale.set(scale, 1, scale);
    }

    this.towerRings.forEach((ring, idx) => {
      ring.rotation.z += delta * (idx % 2 === 0 ? 0.2 : -0.15);
    });

    // 5. Automated Blast Door Logic
    const [fx, , fz] = this.currentSpec.facility.position;
    const doorPos = new THREE.Vector3(fx, 0, fz + this.currentSpec.facility.depth / 2);
    const distToDoor = playerPos.distanceTo(doorPos);
    const doorTriggerDistance = 5.2;

    if (distToDoor < doorTriggerDistance) {
      if (this.doorProgress < 1.0) {
        if (!this.doorPlayedSfx && this.doorProgress < 0.1) {
          soundManager.playDoorSwoosh();
          this.doorPlayedSfx = true;
        }
        this.doorProgress = Math.min(1.0, this.doorProgress + delta * 2.2);
      }
    } else {
      if (this.doorProgress > 0) {
        this.doorProgress = Math.max(0, this.doorProgress - delta * 1.8);
        if (this.doorProgress === 0) {
          this.doorPlayedSfx = false;
        }
      }
    }

    if (this.labDoorLeft && this.labDoorRight) {
      const openOffset = this.doorProgress * 1.9;
      const defaultLeftX = -1.1;
      const defaultRightX = 1.1;
      this.labDoorLeft.position.x = defaultLeftX - openOffset;
      this.labDoorRight.position.x = defaultRightX + openOffset;
    }

    // 6. Spark flicker & steam drift
    if (this.sparkLight) {
      if (Math.random() < 0.04) {
        this.sparkLight.intensity = 3.2;
      } else {
        this.sparkLight.intensity *= 0.8;
      }
    }

    if (this.sparkParticles) {
      this.sparkParticles.rotation.y += delta * 0.025;
    }

    if (this.steamParticles) {
      this.steamParticles.rotation.y += delta * 0.015;
    }
  }

  public checkPlayerLocation(playerPos: THREE.Vector3): string {
    const [, , fz] = this.currentSpec.facility.position;
    if (playerPos.z < fz + 10 && Math.abs(playerPos.x) < 7.5 && playerPos.z > fz - 9) {
      return `Level ${this.currentSpec.levelNumber}: ${this.currentSpec.facility.name}`;
    } else if (playerPos.z > 6) {
      return `Level ${this.currentSpec.levelNumber}: ${this.currentSpec.name} (${this.currentSpec.subtitle})`;
    } else {
      return `Level ${this.currentSpec.levelNumber}: Central Walkway & Tower Ascent`;
    }
  }
}
