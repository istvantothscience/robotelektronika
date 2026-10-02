import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';

export interface InteractiveTrigger {
  id: string;
  type: 'terminal' | 'door' | 'bench' | 'npc';
  title: string;
  hint: string;
  position: THREE.Vector3;
  radius: number;
  action: () => void;
}

export interface QuestBeacon {
  id: string;
  group: THREE.Group;
  position: THREE.Vector3;
  radius: number;
  questId: string;
  title: string;
  lightBeam: THREE.Mesh;
  iconMesh: THREE.Mesh;
}

export class WorldBuilder {
  public group: THREE.Group;
  public colliders: THREE.Box3[] = [];
  public triggers: InteractiveTrigger[] = [];
  public questBeacons: QuestBeacon[] = [];

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

  // Lab location reference
  public labDoorPosition = new THREE.Vector3(0, 0, -8);
  public labWorkbenchPosition = new THREE.Vector3(0, 0.8, -18);

  constructor() {
    this.group = new THREE.Group();
    this.buildEnvironment();
  }

  private buildEnvironment() {
    this.buildTerrainAndWalkways();
    this.buildCanyonAndBackdrop();
    this.buildScrapyardProps();
    this.buildScrapyardRobotsAndRelics();
    this.buildColossalVerticalTower();
    this.buildStaticLabBuilding();
    this.buildLabInterior();
    this.buildQuestHoloBeacons();
    this.buildAtmosphericParticles();
  }

  private buildTerrainAndWalkways() {
    // 1. Industrial metal ground with riveted panels texture feel
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a212b,
      roughness: 0.75,
      metalness: 0.5,
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);

    // 2. Central Elevated Metal Walkway (Plating with rivets)
    const walkwayGeo = new THREE.PlaneGeometry(8, 54);
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: 0x2e3846,
      roughness: 0.45,
      metalness: 0.75,
    });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.rotation.x = -Math.PI / 2;
    walkway.position.set(0, 0.04, 0);
    walkway.receiveShadow = true;
    this.group.add(walkway);

    // Industrial yellow/black hazard trim strips
    const stripGeo = new THREE.PlaneGeometry(0.35, 54);
    const stripMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.5,
      metalness: 0.5,
    });

    const stripL = new THREE.Mesh(stripGeo, stripMat);
    stripL.rotation.x = -Math.PI / 2;
    stripL.position.set(-3.9, 0.05, 0);
    this.group.add(stripL);

    const stripR = new THREE.Mesh(stripGeo, stripMat);
    stripR.rotation.x = -Math.PI / 2;
    stripR.position.set(3.9, 0.05, 0);
    this.group.add(stripR);

    // Handrail along the elevated platform
    const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
    [-4.1, 4.1].forEach((rx) => {
      for (let rz = -22; rz <= 20; rz += 5) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), railMat);
        post.position.set(rx, 0.55, rz);
        post.castShadow = true;
        this.group.add(post);
      }
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 44), railMat);
      topBar.position.set(rx, 1.1, -1);
      topBar.castShadow = true;
      this.group.add(topBar);
    });

    // 3. Glowing Arrow Signboard ("↑ UNDERWORLD")
    const signGroup = new THREE.Group();
    signGroup.position.set(4.8, 0.7, 7);

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.9, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x1e242c, metalness: 0.9, roughness: 0.35 })
    );
    signBoard.castShadow = true;
    signGroup.add(signBoard);

    const signArrowMat = new THREE.MeshStandardMaterial({
      color: 0xffb52e,
      emissive: 0xffb52e,
      emissiveIntensity: 3.5,
      roughness: 0.2,
    });
    const signArrow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.08), signArrowMat);
    signArrow.position.set(0, 0, 0.09);
    signGroup.add(signArrow);

    const signLight = new THREE.PointLight(0xffb52e, 2.0, 7);
    signLight.position.set(0, 0, 0.5);
    signGroup.add(signLight);

    this.group.add(signGroup);
    this.colliders.push(new THREE.Box3().setFromObject(signBoard));

    // 4. Glowing Neon "JUNKYARD" Signboard (Left side, reddish-orange neon)
    const neonGroup = new THREE.Group();
    neonGroup.position.set(-6.0, 3.2, 8);
    neonGroup.rotation.y = 0.35;

    const neonMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 4.0,
      roughness: 0.1,
    });
    const neonFrame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 0.25), new THREE.MeshStandardMaterial({ color: 0x111827 }));
    neonFrame.castShadow = true;
    neonGroup.add(neonFrame);

    const neonLetters = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.75, 0.12), neonMat);
    neonLetters.position.z = 0.14;
    neonGroup.add(neonLetters);

    const neonLight = new THREE.PointLight(0xf43f5e, 2.8, 12);
    neonLight.position.set(0, 0, 0.8);
    neonGroup.add(neonLight);

    this.group.add(neonGroup);
  }

  /**
   * Surrounding canyon / industrial retaining walls
   * Gives the feeling of an authentic subterranean canyon rather than floating in void
   */
  private buildCanyonAndBackdrop() {
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1c232d,
      roughness: 0.85,
      metalness: 0.45,
    });
    const rustTrimMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.7,
      metalness: 0.6,
    });

    const boundPositions = [
      { x: 0, z: 36, w: 76, d: 3 },
      { x: 0, z: -38, w: 76, d: 3 },
      { x: -36, z: 0, w: 3, d: 76 },
      { x: 36, z: 0, w: 3, d: 76 },
    ];

    boundPositions.forEach((b) => {
      // Main retaining cliff wall
      const wall = new THREE.Mesh(new THREE.BoxGeometry(b.w, 8, b.d), wallMat);
      wall.position.set(b.x, 4, b.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.group.add(wall);
      this.colliders.push(new THREE.Box3().setFromObject(wall));

      // Industrial copper & rust horizontal piping along walls
      const pipeGeo = new THREE.CylinderGeometry(0.3, 0.3, b.w > b.d ? b.w : b.d, 12);
      const pipe = new THREE.Mesh(pipeGeo, rustTrimMat);
      if (b.w > b.d) {
        pipe.rotation.z = Math.PI / 2;
      } else {
        pipe.rotation.x = Math.PI / 2;
      }
      pipe.position.set(b.x, 3.5, b.z);
      this.group.add(pipe);
    });

    // Massive support scaffolds on the corners
    const scaffoldPositions = [
      [-32, -32],
      [32, -32],
      [-32, 30],
      [32, 30],
    ];
    scaffoldPositions.forEach(([sx, sz]) => {
      const scaffold = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 2.0, 16, 8),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.4 })
      );
      scaffold.position.set(sx, 8, sz);
      scaffold.castShadow = true;
      this.group.add(scaffold);
    });
  }

  private buildScrapyardProps() {
    // 1. Scrapyard Awakening Pod (where the robot woke up)
    const podGroup = new THREE.Group();
    podGroup.position.set(0, 0, 14);

    const podBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.7, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 })
    );
    podBase.position.y = 0.2;
    podBase.receiveShadow = true;
    podGroup.add(podBase);

    // Cyan glowing charging circle
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

    this.group.add(podGroup);

    // 2. Rusted scrap heaps and molten furnaces in the Underworld
    this.createScrapPile(-11, 10, 4.2, 3.2, 0xb87333);
    this.createScrapPile(13, 11, 4.6, 3.4, 0x8a4f2a);
    this.createScrapPile(-15, -2, 5.2, 3.8, 0x3d271d);
    this.createScrapPile(15, -4, 4.8, 3.5, 0x5a3825);

    // 3. Giant Steampunk Cogwheels half-buried in the ground
    this.createCogwheel(-10, 1.8, 6, 2.8, 0.4, 0.6);
    this.createCogwheel(12, 2.4, 7, 3.4, -0.5, -0.4);
    this.createCogwheel(-8, 1.6, -1, 2.2, 0.3, 0.8);

    // 4. Streetlamps with warm sodium/tungsten glow
    this.createStreetlamp(-4.8, 0, 4);
    this.createStreetlamp(4.8, 0, 4);
    this.createStreetlamp(-4.8, 0, -4);
    this.createStreetlamp(4.8, 0, -4);
  }

  /**
   * Real thematic 3D objects across the Scrapyard:
   * - Dormant/broken robot bodies lying in scrap
   * - Giant electric coils / Leyden jar capacitors
   * - Copper cable spools and batteries
   * - Stacks of industrial cargo containers
   */
  private buildScrapyardRobotsAndRelics() {
    // 1. Broken / Dormant Robot bodies lying in the scrapyard
    this.createBrokenRobot(-8, 0.3, 7, 0.8, -0.4);
    this.createBrokenRobot(9, 0.25, 12, -0.6, 1.2);
    this.createBrokenRobot(-12, 0.35, -5, 1.4, 0.2);

    // 2. Giant Electrical Induction Coils (Copper wire wound around ferrite core)
    this.createInductionCoil(-7, 1.4, 15, 1.2, 2.2);
    this.createInductionCoil(7, 1.4, 15, 1.2, 2.2);

    // 3. Leyden Jar Capacitors (High voltage electrostatic storage relics)
    this.createLeydenJar(-5, 0, 11);
    this.createLeydenJar(5, 0, 11);

    // 4. Industrial Cargo Containers (Crates with hazard stencil)
    this.createCargoContainer(-13, 0, 3, 4.5, 2.4, 2.2, 0x0f766e);
    this.createCargoContainer(13, 0, 1, 4.5, 2.4, 2.2, 0xb45309);
    this.createCargoContainer(12, 2.4, 1, 3.8, 2.0, 2.0, 0x334155);

    // 5. Heavy Copper Wire Spools & Cable Conduits
    this.createCableSpool(-6, 0.8, -1, 1.0, 1.2);
    this.createCableSpool(6.5, 0.8, -2, 1.0, 1.2);

    // 6. Oil Barrels / Energy Cells
    this.createEnergyBarrel(-3.5, 0, 9, 0x22d3ee);
    this.createEnergyBarrel(-3.0, 0, 9.6, 0xffb52e);
    this.createEnergyBarrel(3.8, 0, 8.5, 0xf43f5e);
  }

  private createBrokenRobot(x: number, y: number, z: number, rotY: number, rotZ: number) {
    const robotGroup = new THREE.Group();
    robotGroup.position.set(x, y, z);
    robotGroup.rotation.set(0.3, rotY, rotZ);

    const rustMat = new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.8, metalness: 0.6 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f242b, roughness: 0.7, metalness: 0.8 });
    const copperMat = new THREE.MeshStandardMaterial({ color: 0x8a4f2a, roughness: 0.5, metalness: 0.8 });

    // Torso lying tilted
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.4), rustMat);
    torso.castShadow = true;
    robotGroup.add(torso);

    // Broken head with cracked eye socket
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), darkMat);
    head.position.set(0.2, 0.35, 0);
    head.rotation.z = 0.5;
    head.castShadow = true;
    robotGroup.add(head);

    // Dead eye socket
    const eyeSocket = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 8), copperMat);
    eyeSocket.rotation.x = Math.PI / 2;
    eyeSocket.position.set(0.25, 0.38, 0.2);
    robotGroup.add(eyeSocket);

    // Detached articulated arm
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.6, 8), darkMat);
    arm.position.set(-0.45, -0.1, 0.2);
    arm.rotation.z = 1.2;
    arm.castShadow = true;
    robotGroup.add(arm);

    this.group.add(robotGroup);
    this.colliders.push(new THREE.Box3().setFromObject(robotGroup));
  }

  private createInductionCoil(x: number, y: number, z: number, radius: number, height: number) {
    const coilGroup = new THREE.Group();
    coilGroup.position.set(x, y, z);

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e242c, metalness: 0.9, roughness: 0.4 });
    const copperCoilMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.25 });

    // Pedestal
    const base = new THREE.Mesh(new THREE.BoxGeometry(radius * 2.2, 0.4, radius * 2.2), baseMat);
    base.position.y = -height / 2;
    base.castShadow = true;
    coilGroup.add(base);

    // Central ferrite cylinder
    const core = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, height, 16), baseMat);
    core.castShadow = true;
    coilGroup.add(core);

    // Copper wire coil rings
    for (let i = -height / 2 + 0.3; i <= height / 2 - 0.3; i += 0.35) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.08, 8, 20), copperCoilMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = i;
      ring.castShadow = true;
      coilGroup.add(ring);
    }

    // Top electrode sphere
    const electrode = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.5, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xc99a3d, metalness: 0.95, roughness: 0.2 })
    );
    electrode.position.y = height / 2 + radius * 0.4;
    electrode.castShadow = true;
    coilGroup.add(electrode);

    this.group.add(coilGroup);
    this.colliders.push(new THREE.Box3().setFromObject(coilGroup));
  }

  private createLeydenJar(x: number, y: number, z: number) {
    const jarGroup = new THREE.Group();
    jarGroup.position.set(x, y + 0.6, z);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
      metalness: 0.2,
    });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xc99a3d, metalness: 0.9, roughness: 0.3 });

    // Glass cylinder
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.1, 14), glassMat);
    glass.castShadow = true;
    jarGroup.add(glass);

    // Inner brass electrode
    const electrode = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), brassMat);
    electrode.position.y = 0.2;
    jarGroup.add(electrode);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), brassMat);
    ball.position.y = 0.9;
    jarGroup.add(ball);

    this.group.add(jarGroup);
    this.colliders.push(new THREE.Box3().setFromObject(jarGroup));
  }

  private createCargoContainer(x: number, y: number, z: number, w: number, h: number, d: number, colorHex: number) {
    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.6, metalness: 0.6 })
    );
    crate.position.set(x, y + h / 2, z);
    crate.castShadow = true;
    crate.receiveShadow = true;
    this.group.add(crate);
    this.colliders.push(new THREE.Box3().setFromObject(crate));
  }

  private createCableSpool(x: number, y: number, z: number, radius: number, width: number) {
    const spoolGroup = new THREE.Group();
    spoolGroup.position.set(x, y, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.3 });

    // Flanges
    const flangeL = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.1, 16), woodMat);
    flangeL.rotation.z = Math.PI / 2;
    flangeL.position.x = -width / 2;
    flangeL.castShadow = true;
    spoolGroup.add(flangeL);

    const flangeR = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.1, 16), woodMat);
    flangeR.rotation.z = Math.PI / 2;
    flangeR.position.x = width / 2;
    flangeR.castShadow = true;
    spoolGroup.add(flangeR);

    // Wound copper wire cylinder
    const wireCore = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.75, radius * 0.75, width - 0.2, 16), wireMat);
    wireCore.rotation.z = Math.PI / 2;
    wireCore.castShadow = true;
    spoolGroup.add(wireCore);

    this.group.add(spoolGroup);
    this.colliders.push(new THREE.Box3().setFromObject(spoolGroup));
  }

  private createEnergyBarrel(x: number, y: number, z: number, glowHex: number) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 })
    );
    barrel.position.set(x, y + 0.5, z);
    barrel.castShadow = true;
    this.group.add(barrel);

    // Glowing hazard band
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.15, 12),
      new THREE.MeshStandardMaterial({ color: glowHex, emissive: glowHex, emissiveIntensity: 2.2 })
    );
    band.position.set(x, y + 0.5, z);
    this.group.add(band);

    this.colliders.push(new THREE.Box3().setFromObject(barrel));
  }

  private createScrapPile(x: number, z: number, radius: number, height: number, colorHex: number) {
    const pileGroup = new THREE.Group();
    pileGroup.position.set(x, 0, z);

    const mound = new THREE.Mesh(
      new THREE.ConeGeometry(radius, height, 10),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9, metalness: 0.55 })
    );
    mound.position.y = height / 2;
    mound.castShadow = true;
    mound.receiveShadow = true;
    pileGroup.add(mound);

    // Rusted steel girders jutting out
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
    for (let i = 0; i < 3; i++) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 0.25), beamMat);
      beam.position.set((Math.random() - 0.5) * radius * 0.8, height * 0.7, (Math.random() - 0.5) * radius * 0.8);
      beam.rotation.set((Math.random() - 0.5) * 0.9, Math.random() * Math.PI, (Math.random() - 0.5) * 0.9);
      beam.castShadow = true;
      pileGroup.add(beam);
    }

    this.group.add(pileGroup);

    this.colliders.push(
      new THREE.Box3(
        new THREE.Vector3(x - radius * 0.85, 0, z - radius * 0.85),
        new THREE.Vector3(x + radius * 0.85, height, z + radius * 0.85)
      )
    );
  }

  private createCogwheel(x: number, y: number, z: number, radius: number, rotX: number, rotZ: number) {
    const gearMat = new THREE.MeshStandardMaterial({
      color: 0xc99a3d,
      roughness: 0.45,
      metalness: 0.85,
    });

    const gear = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.3, 16), gearMat);
    gear.position.set(x, y, z);
    gear.rotation.set(rotX, 0, rotZ);
    gear.castShadow = true;
    gear.receiveShadow = true;
    this.group.add(gear);
    this.rotatingGears.push(gear);

    this.colliders.push(new THREE.Box3().setFromObject(gear));
  }

  private createStreetlamp(x: number, y: number, z: number) {
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

    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffb52e,
      emissive: 0xffb52e,
      emissiveIntensity: 3.5,
    });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), bulbMat);
    bulb.position.set(0, 4.2, 0);
    lampGroup.add(bulb);

    const light = new THREE.PointLight(0xffb52e, 2.2, 15);
    light.position.set(0, 4.1, 0);
    lampGroup.add(light);

    this.group.add(lampGroup);

    this.colliders.push(
      new THREE.Box3(new THREE.Vector3(x - 0.3, 0, z - 0.3), new THREE.Vector3(x + 0.3, 4.4, z + 0.3))
    );
  }

  /**
   * 3D Floating Quest Beacons / Icons:
   * When player walks into the beacon, it triggers the quest!
   */
  private buildQuestHoloBeacons() {
    // Beacon 1: Static Lab Workbench
    this.createQuestBeacon(
      'beacon-static-lab',
      new THREE.Vector3(0, 2.6, -18),
      3.2,
      'quest-01-electrostatics',
      '01. Elektrosztatika Kísérlet',
      0x8b5cf6
    );

    // Beacon 2: Scrapyard Broken Robot Core Inspection
    this.createQuestBeacon(
      'beacon-robot-core',
      new THREE.Vector3(-8, 2.2, 7),
      2.8,
      'quest-02-charges',
      '02. Töltött Robotmag Vizsgálata',
      0x22d3ee
    );
  }

  private createQuestBeacon(id: string, pos: THREE.Vector3, radius: number, questId: string, title: string, colorHex: number) {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.copy(pos);

    // 1. Vertical Hologram Light Pillar Beam
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.8, 6.0, 16);
    const beamMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 1.0;
    beaconGroup.add(beam);

    // 2. Floating Diamond / Exclamation Hologram Icon
    const iconMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 4.0,
      roughness: 0.1,
    });
    const iconGeo = new THREE.OctahedronGeometry(0.45, 0);
    const iconMesh = new THREE.Mesh(iconGeo, iconMat);
    iconMesh.position.y = 0;
    beaconGroup.add(iconMesh);

    // 3. Rotating energy ring around icon
    const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 8, 24);
    const ringMesh = new THREE.Mesh(ringGeo, iconMat);
    ringMesh.rotation.x = Math.PI / 2;
    beaconGroup.add(ringMesh);

    // 4. Point light for ground illumination
    const pointLight = new THREE.PointLight(colorHex, 2.4, 8);
    pointLight.position.y = 0;
    beaconGroup.add(pointLight);

    this.group.add(beaconGroup);

    this.questBeacons.push({
      id,
      group: beaconGroup,
      position: pos,
      radius,
      questId,
      title,
      lightBeam: beam,
      iconMesh,
    });
  }

  /**
   * Builds the monumental 6-Tier Vertical Superstructure shown in the reference image:
   * Level 1: Underworld (z: 10, y: 0)
   * Level 2: Static Research (y: 6 to 12) - Glowing violet/magenta
   * Level 3: Circuit Lab (y: 14 to 20) - Glowing electric cyan/teal
   * Level 4: Power Plant (y: 22 to 28) - Glowing industrial amber
   * Level 5: Research District (y: 30 to 36) - Robotic automation tier
   * Level 6: Sky City (y: 40 to 65) - Gleaming white/gold futuristic skyscrapers reaching into the sky!
   */
  private buildColossalVerticalTower() {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0, 0, -26);

    // 1. Central Luminous Vertical Energy Beam / Elevator Core (Spanning all 6 levels!)
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

    // 2. Colossal Vertical Support Pillars (Industrial lattice pillars)
    const pillarPositions = [
      [-18, -18],
      [18, -18],
      [-18, 18],
      [18, 18],
    ];

    pillarPositions.forEach(([px, pz]) => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.8, 95, 12),
        new THREE.MeshStandardMaterial({ color: 0x1f242b, metalness: 0.9, roughness: 0.35 })
      );
      col.position.set(px, 47.5, pz);
      col.castShadow = true;
      towerGroup.add(col);
    });

    // 3. TIER 2: STATIC RESEARCH (y = 9, electric violet and magenta glow)
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

    // 4. TIER 3: CIRCUIT LAB (y = 20, electric cyan and teal glow)
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

    // 5. TIER 4: POWER PLANT (y = 32, industrial amber and copper generators)
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

    // 6. TIER 5: RESEARCH DISTRICT (y = 44, turquoise automation laboratories)
    const tier5Ring = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 17, 2.0, 36),
      new THREE.MeshStandardMaterial({ color: 0x134e4a, metalness: 0.85, roughness: 0.3 })
    );
    tier5Ring.position.y = 45;
    tier5Ring.castShadow = true;
    towerGroup.add(tier5Ring);

    const tier5GlowRim = new THREE.Mesh(
      new THREE.TorusGeometry(16.5, 0.4, 8, 40),
      new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x2dd4bf, emissiveIntensity: 3.5 })
    );
    tier5GlowRim.rotation.x = Math.PI / 2;
    tier5GlowRim.position.y = 46;
    towerGroup.add(tier5GlowRim);
    this.towerRings.push(tier5GlowRim);

    // 7. TIER 6: SKY CITY (y = 56 to 85, futuristic gleaming white & gold spires)
    const skyCityBase = new THREE.Mesh(
      new THREE.CylinderGeometry(26, 18, 5, 36),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.15 })
    );
    skyCityBase.position.y = 59;
    skyCityBase.castShadow = true;
    towerGroup.add(skyCityBase);

    // Sky City skyscrapers on the top platform
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.15,
    });
    const brassTowerMat = new THREE.MeshStandardMaterial({
      color: 0xc99a3d,
      metalness: 0.95,
      roughness: 0.2,
    });

    const spireHeights = [22, 30, 26, 18, 34, 24];
    spireHeights.forEach((h, idx) => {
      const angle = (idx * Math.PI * 2) / spireHeights.length;
      const r = 9 + (idx % 2) * 5;
      const sx = Math.cos(angle) * r;
      const sz = Math.sin(angle) * r;

      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 2.0, h, 8), idx % 2 === 0 ? towerMat : brassTowerMat);
      spire.position.set(sx, 61 + h / 2, sz);
      spire.castShadow = true;
      towerGroup.add(spire);

      // Glowing sky crown tip
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 4.5 })
      );
      tip.position.set(sx, 61 + h + 0.5, sz);
      towerGroup.add(tip);
    });

    this.group.add(towerGroup);
  }

  private buildStaticLabBuilding() {
    const labGroup = new THREE.Group();
    labGroup.position.set(0, 0, -18);

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x242c38,
      roughness: 0.5,
      metalness: 0.75,
    });

    const copperTrimMat = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.35,
      metalness: 0.85,
    });

    const bW = 16;
    const bH = 6.4;
    const bD = 20;
    const doorW = 4.4;
    const doorH = 3.8;

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, 0.8), wallMat);
    backWall.position.set(0, bH / 2, -bD / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    labGroup.add(backWall);
    this.colliders.push(new THREE.Box3().setFromObject(backWall));

    // West Wall
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, bH, bD), wallMat);
    westWall.position.set(-bW / 2, bH / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    labGroup.add(westWall);
    this.colliders.push(new THREE.Box3().setFromObject(westWall));

    // East Wall
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, bH, bD), wallMat);
    eastWall.position.set(bW / 2, bH / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    labGroup.add(eastWall);
    this.colliders.push(new THREE.Box3().setFromObject(eastWall));

    // Front Wall Left
    const frontWallLeftW = (bW - doorW) / 2;
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(frontWallLeftW, bH, 0.8), wallMat);
    frontWallLeft.position.set(-bW / 2 + frontWallLeftW / 2, bH / 2, bD / 2);
    frontWallLeft.castShadow = true;
    labGroup.add(frontWallLeft);
    this.colliders.push(new THREE.Box3().setFromObject(frontWallLeft));

    // Front Wall Right
    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(frontWallLeftW, bH, 0.8), wallMat);
    frontWallRight.position.set(bW / 2 - frontWallLeftW / 2, bH / 2, bD / 2);
    frontWallRight.castShadow = true;
    labGroup.add(frontWallRight);
    this.colliders.push(new THREE.Box3().setFromObject(frontWallRight));

    // Lintel above door
    const lintelH = bH - doorH;
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.6, lintelH, 0.8), copperTrimMat);
    lintel.position.set(0, doorH + lintelH / 2, bD / 2);
    labGroup.add(lintel);

    // Glowing Entrance Signboard ("STATIC RESEARCH LAB")
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.9, 0.25), signMat);
    sign.position.set(0, doorH + 0.65, bD / 2 + 0.45);
    labGroup.add(sign);

    const signLight = new THREE.PointLight(0x8b5cf6, 2.8, 11);
    signLight.position.set(0, doorH + 0.65, bD / 2 + 1.4);
    labGroup.add(signLight);

    // Sliding Blast Doors
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35,
    });

    this.labDoorLeft = new THREE.Mesh(new THREE.BoxGeometry(doorW / 2, doorH, 0.2), doorMat);
    this.labDoorLeft.position.set(-doorW / 4, doorH / 2, bD / 2);
    this.labDoorLeft.castShadow = true;
    labGroup.add(this.labDoorLeft);

    this.labDoorRight = new THREE.Mesh(new THREE.BoxGeometry(doorW / 2, doorH, 0.2), doorMat);
    this.labDoorRight.position.set(doorW / 4, doorH / 2, bD / 2);
    this.labDoorRight.castShadow = true;
    labGroup.add(this.labDoorRight);

    // Lab Ceiling
    const roof = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.6, 0.4, bD + 0.6), wallMat);
    roof.position.set(0, bH + 0.2, 0);
    roof.castShadow = true;
    labGroup.add(roof);

    this.group.add(labGroup);
  }

  private buildLabInterior() {
    const interiorGroup = new THREE.Group();
    interiorGroup.position.set(0, 0, -18);

    // Shiny epoxy floor inside lab
    const floorGeo = new THREE.PlaneGeometry(15, 19);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080b0d,
      roughness: 0.15,
      metalness: 0.7,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.04;
    floor.receiveShadow = true;
    interiorGroup.add(floor);

    // Glowing Violet & Cyan Holographic Ring Decal
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
    interiorGroup.add(decalRing);

    // Overhead industrial lighting
    const ceilingLight1 = new THREE.PointLight(0x8b5cf6, 2.8, 16);
    ceilingLight1.position.set(0, 5.2, -4);
    interiorGroup.add(ceilingLight1);

    const ceilingLight2 = new THREE.PointLight(0x22d3ee, 2.8, 16);
    ceilingLight2.position.set(0, 5.2, 4);
    interiorGroup.add(ceilingLight2);

    // Server Cabinets on West side with blinking lights
    for (let i = -3; i <= 3; i += 2) {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 4.4, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.5, metalness: 0.85 })
      );
      rack.position.set(-6.5, 2.2, i * 2);
      rack.castShadow = true;
      rack.receiveShadow = true;
      interiorGroup.add(rack);
      this.colliders.push(new THREE.Box3().setFromObject(rack));

      const ledMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x22d3ee : 0x8b5cf6,
        emissive: i % 2 === 0 ? 0x22d3ee : 0x8b5cf6,
        emissiveIntensity: 3.0,
      });
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 1.2), ledMat);
      led.position.set(-5.85, 3.2, i * 2);
      interiorGroup.add(led);
    }

    // THE EXPERIMENTATION WORKBENCH
    const benchGroup = new THREE.Group();
    benchGroup.position.set(0, 0, 0);

    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.22, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x272e3b, metalness: 0.8, roughness: 0.3 })
    );
    tableTop.position.set(0, 1.0, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    benchGroup.add(tableTop);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111418, metalness: 0.9 });
    const legPositions = [
      [-1.7, 0.5, -1.0],
      [1.7, 0.5, -1.0],
      [-1.7, 0.5, 1.0],
      [1.7, 0.5, 1.0],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, ly, lz);
      leg.castShadow = true;
      benchGroup.add(leg);
    });

    // Experiment Terminal Screen on desk
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
    benchGroup.add(terminalScreen);

    // Apparatus on table: Electroscope
    const electroscopeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 0.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 })
    );
    electroscopeBase.position.set(-1.0, 1.3, 0);
    benchGroup.add(electroscopeBase);

    const electroscopeSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xc99a3d, metalness: 0.95, roughness: 0.2 })
    );
    electroscopeSphere.position.set(-1.0, 1.62, 0);
    benchGroup.add(electroscopeSphere);

    // Plastic Rod & Wool Cloth on table
    const plasticRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.85, 8),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, transparent: true, opacity: 0.85 })
    );
    plasticRod.rotation.z = Math.PI / 3;
    plasticRod.position.set(0.6, 1.15, 0.2);
    benchGroup.add(plasticRod);

    const woolCloth = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.05, 0.38),
      new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.9 })
    );
    woolCloth.position.set(1.0, 1.14, -0.1);
    benchGroup.add(woolCloth);

    // Holographic electrostatic atom model floating above bench
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

    benchGroup.add(holoAtom);
    this.holoAtom = holoAtom;

    const benchSpot = new THREE.SpotLight(0x22d3ee, 4.0, 7, Math.PI / 4, 0.4);
    benchSpot.position.set(0, 3.2, 0);
    benchSpot.target = tableTop;
    benchGroup.add(benchSpot);

    interiorGroup.add(benchGroup);
    this.group.add(interiorGroup);

    const benchWorldBox = new THREE.Box3(
      new THREE.Vector3(-2.1, 0, -18 - 1.4),
      new THREE.Vector3(2.1, 1.9, -18 + 1.4)
    );
    this.colliders.push(benchWorldBox);
  }

  private buildAtmosphericParticles() {
    // 1. Blue & cyan floating electrical sparks
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
      color: 0x22d3ee,
      size: 0.16,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    this.sparkParticles = new THREE.Points(geometry, material);
    this.group.add(this.sparkParticles);

    // 2. Warm amber furnace embers / steam puffs
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
    this.group.add(this.steamParticles);

    this.sparkLight = new THREE.PointLight(0x8b5cf6, 0, 14);
    this.sparkLight.position.set(-6, 2.5, 8);
    this.group.add(this.sparkLight);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    // 1. Rotate gears in Scrapyard
    this.rotatingGears.forEach((g, idx) => {
      g.rotation.y += delta * (idx % 2 === 0 ? 0.3 : -0.25);
    });

    // 2. Rotate Holographic atom in Lab
    if (this.holoAtom) {
      this.holoAtom.rotation.y += delta * 0.9;
      this.holoAtom.rotation.x = Math.sin(performance.now() * 0.001) * 0.2;
    }

    // 3. Animate 3D Quest Beacons (Floating bob & rotation)
    const time = performance.now() * 0.002;
    this.questBeacons.forEach((beacon, idx) => {
      const bob = Math.sin(time + idx) * 0.18;
      beacon.iconMesh.position.y = bob;
      beacon.iconMesh.rotation.y += delta * 1.5;
      beacon.iconMesh.rotation.x = Math.sin(time * 1.5) * 0.3;

      // Pulse light beam
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
    const distToDoor = playerPos.distanceTo(new THREE.Vector3(0, 0, -8));
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

    // 6. Electric spark flicker & steam drift
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
    if (playerPos.z < -8 && Math.abs(playerPos.x) < 7.5 && playerPos.z > -27) {
      return 'Level 2: Static Research Lab';
    } else if (playerPos.z > 6) {
      return 'Level 1: Underworld (Scrapyard)';
    } else {
      return 'Level 1: Central Walkway & Ascent Base';
    }
  }

  public getWorkbenchDistance(playerPos: THREE.Vector3): number {
    return playerPos.distanceTo(new THREE.Vector3(0, 1.0, -18));
  }
}
