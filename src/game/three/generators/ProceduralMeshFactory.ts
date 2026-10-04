import * as THREE from 'three';
import { PBRTextureGenerator } from '../materials/PBRTextureGenerator';

export class ProceduralMeshFactory {
  private static pbrMetal = PBRTextureGenerator.createMetalPlatePBR();
  private static pbrCopper = PBRTextureGenerator.createCopperPBR();
  private static pbrHull = PBRTextureGenerator.createArmoredHullPBR();
  private static pbrTread = PBRTextureGenerator.createDiamondTreadPBR();
  private static pbrConcrete = PBRTextureGenerator.createWeatheredConcretePBR();
  private static pbrPcb = PBRTextureGenerator.createCircuitBoardPBR();

  // Shared high-fidelity AAA Industrial Steampunk PBR materials
  // Grounded 60-30-10 palette: Gunmetal Iron, Weathered Slate-Bronze, Rusted Sienna, Muted Antique Brass/Copper
  public static materials = {
    darkChassis: new THREE.MeshStandardMaterial({
      color: 0x242629,
      roughness: 0.48,
      metalness: 0.84,
      map: ProceduralMeshFactory.pbrMetal.diffuse,
      normalMap: ProceduralMeshFactory.pbrMetal.normal,
      roughnessMap: ProceduralMeshFactory.pbrMetal.roughness,
      metalnessMap: ProceduralMeshFactory.pbrMetal.metalness,
      envMapIntensity: 1.35,
    }),
    weatheredPlating: new THREE.MeshStandardMaterial({
      color: 0x524a42,
      roughness: 0.46,
      metalness: 0.76,
      map: ProceduralMeshFactory.pbrMetal.diffuse,
      normalMap: ProceduralMeshFactory.pbrMetal.normal,
      envMapIntensity: 1.25,
    }),
    whiteArmoredHull: new THREE.MeshStandardMaterial({
      color: 0xd8d0c5,
      roughness: 0.34,
      metalness: 0.38,
      map: ProceduralMeshFactory.pbrHull.diffuse,
      normalMap: ProceduralMeshFactory.pbrHull.normal,
      roughnessMap: ProceduralMeshFactory.pbrHull.roughness,
      metalnessMap: ProceduralMeshFactory.pbrHull.metalness,
      envMapIntensity: 1.3,
    }),
    diamondTread: new THREE.MeshStandardMaterial({
      color: 0x38332e,
      roughness: 0.46,
      metalness: 0.82,
      map: ProceduralMeshFactory.pbrTread.diffuse,
      normalMap: ProceduralMeshFactory.pbrTread.normal,
      roughnessMap: ProceduralMeshFactory.pbrTread.roughness,
      metalnessMap: ProceduralMeshFactory.pbrTread.metalness,
      envMapIntensity: 1.2,
    }),
    weatheredConcrete: new THREE.MeshStandardMaterial({
      color: 0x7a6e62,
      roughness: 0.86,
      metalness: 0.15,
      map: ProceduralMeshFactory.pbrConcrete.diffuse,
      normalMap: ProceduralMeshFactory.pbrConcrete.normal,
      roughnessMap: ProceduralMeshFactory.pbrConcrete.roughness,
      envMapIntensity: 0.7,
    }),
    copper: new THREE.MeshStandardMaterial({
      color: 0x9e5b36,
      roughness: 0.3,
      metalness: 0.92,
      map: ProceduralMeshFactory.pbrCopper.diffuse,
      normalMap: ProceduralMeshFactory.pbrCopper.normal,
      roughnessMap: ProceduralMeshFactory.pbrCopper.roughness,
      envMapIntensity: 1.5,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xb88b44,
      roughness: 0.28,
      metalness: 0.9,
      map: ProceduralMeshFactory.pbrCopper.diffuse,
      normalMap: ProceduralMeshFactory.pbrCopper.normal,
      envMapIntensity: 1.5,
    }),
    chromePiston: new THREE.MeshStandardMaterial({
      color: 0xe5e0d8,
      roughness: 0.12,
      metalness: 0.96,
      envMapIntensity: 1.9,
    }),
    rustIron: new THREE.MeshStandardMaterial({
      color: 0x4a3325,
      roughness: 0.84,
      metalness: 0.48,
      map: ProceduralMeshFactory.pbrMetal.diffuse,
      normalMap: ProceduralMeshFactory.pbrMetal.normal,
      envMapIntensity: 0.65,
    }),
    foundryBrick: new THREE.MeshStandardMaterial({
      color: 0x3b2a22,
      roughness: 0.88,
      metalness: 0.12,
      map: ProceduralMeshFactory.pbrConcrete.diffuse,
      normalMap: ProceduralMeshFactory.pbrConcrete.normal,
      envMapIntensity: 0.5,
    }),
    circuitBoard: new THREE.MeshStandardMaterial({
      color: 0x211812,
      roughness: 0.34,
      metalness: 0.65,
      map: ProceduralMeshFactory.pbrPcb.diffuse,
      normalMap: ProceduralMeshFactory.pbrPcb.normal,
      emissiveMap: ProceduralMeshFactory.pbrPcb.emissive,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 2.2,
      envMapIntensity: 1.1,
    }),
    hazardYellow: new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.5,
      metalness: 0.45,
      map: ProceduralMeshFactory.pbrMetal.diffuse,
      normalMap: ProceduralMeshFactory.pbrMetal.normal,
      envMapIntensity: 0.9,
    }),
    ceramicInsulator: new THREE.MeshStandardMaterial({
      color: 0x6e5a4a,
      roughness: 0.18,
      metalness: 0.2,
      envMapIntensity: 1.3,
    }),
    verdigrisCopper: new THREE.MeshStandardMaterial({
      color: 0x4b7c70,
      roughness: 0.62,
      metalness: 0.68,
      map: ProceduralMeshFactory.pbrCopper.diffuse,
      normalMap: ProceduralMeshFactory.pbrCopper.normal,
      roughnessMap: ProceduralMeshFactory.pbrCopper.roughness,
      envMapIntensity: 1.15,
    }),
    rubberCable: new THREE.MeshStandardMaterial({
      color: 0x1a1918,
      roughness: 0.88,
      metalness: 0.08,
      normalMap: ProceduralMeshFactory.pbrMetal.normal,
      envMapIntensity: 0.35,
    }),
    glowCyan: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 3.8,
      roughness: 0.1,
    }),
    glowAmber: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 3.4,
      roughness: 0.1,
    }),
    glowViolet: new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0xc084fc,
      emissiveIntensity: 3.8,
      roughness: 0.1,
    }),
  };

  /**
   * 1. AAA Colossal Titan Mech Wreck
   * Complex compound model with articulated spine vertebrae, hydraulic piston shock absorbers,
   * double-hinged shoulder ring, exposed reactor core, dangling copper wire harnesses, and claw hand.
   */
  public static createTitanMechWreck(pos: THREE.Vector3, rot: THREE.Euler, scale: number = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.copy(rot);
    group.scale.set(scale, scale, scale);

    const m = this.materials;

    // A. Pelvic Chassis & Leg Root
    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.8), m.darkChassis);
    pelvis.position.set(0, 0.4, 0);
    pelvis.castShadow = true;
    group.add(pelvis);

    // Double Hydraulic Hip Dampers
    [-0.55, 0.55].forEach((hx) => {
      const hipCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12), m.copper);
      hipCylinder.position.set(hx, 0.35, 0);
      group.add(hipCylinder);

      const hipRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), m.chromePiston);
      hipRod.position.set(hx, 0.1, 0.15);
      hipRod.rotation.x = 0.5;
      group.add(hipRod);
    });

    // B. Multi-segment Spinal Column
    for (let s = 0; s < 4; s++) {
      const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 12), m.brass);
      vert.position.set(0, 0.75 + s * 0.22, -0.05);
      group.add(vert);

      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.32 + s * 0.04, 0.03, 6, 14, Math.PI), m.weatheredPlating);
      rib.position.set(0, 0.75 + s * 0.22, 0);
      rib.rotation.x = Math.PI / 2;
      group.add(rib);
    }

    // C. Heavy Torso Armor Shell (Compound beveled plates)
    const upperTorso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.9), m.whiteArmoredHull);
    upperTorso.position.set(0, 1.8, 0);
    upperTorso.castShadow = true;
    group.add(upperTorso);

    // Lateral Heat-Sink Radiator Louvers
    [-0.85, 0.85].forEach((lx) => {
      for (let l = 0; l < 5; l++) {
        const louver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.65), m.darkChassis);
        louver.position.set(lx, 1.55 + l * 0.12, 0);
        group.add(louver);
      }
    });

    // Dual Plasma Reactor Cores in Chest
    [-0.32, 0.32].forEach((cx) => {
      const coreSocket = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 20), m.copper);
      coreSocket.position.set(cx, 1.85, 0.46);
      group.add(coreSocket);

      const coreGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 16), m.glowCyan);
      coreGlow.rotation.x = Math.PI / 2;
      coreGlow.position.set(cx, 1.85, 0.48);
      group.add(coreGlow);
    });

    // D. Articulated Head & Optical Visor
    const neckBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.2, 12), m.copper);
    neckBase.position.set(0.1, 2.35, 0);
    group.add(neckBase);

    const headTurret = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.55), m.whiteArmoredHull);
    headTurret.position.set(0.2, 2.65, 0.05);
    headTurret.rotation.set(0.2, -0.35, 0.25);
    headTurret.castShadow = true;
    group.add(headTurret);

    // Multi-element Optical Camera Eyes
    const primaryEye = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), m.brass);
    primaryEye.rotation.x = Math.PI / 2;
    primaryEye.position.set(0.28, 2.7, 0.35);
    group.add(primaryEye);

    const primaryEyeLens = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), m.glowCyan);
    primaryEyeLens.position.set(0.28, 2.7, 0.38);
    group.add(primaryEyeLens);

    // E. Left Severed Arm with Hydraulic Pistons and Hanging Wire Harness
    const shoulderSocket = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), m.darkChassis);
    shoulderSocket.position.set(-1.05, 2.05, 0);
    group.add(shoulderSocket);

    const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.9, 12), m.weatheredPlating);
    bicep.position.set(-1.45, 1.6, 0.2);
    bicep.rotation.set(0.4, 0.2, 1.1);
    bicep.castShadow = true;
    group.add(bicep);

    // Chrome Piston cylinder alongside arm
    const armPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), m.chromePiston);
    armPiston.position.set(-1.4, 1.7, 0.35);
    armPiston.rotation.set(0.4, 0.2, 1.1);
    group.add(armPiston);

    // Dangling fiber optic and copper conduits
    for (let c = 0; c < 5; c++) {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-1.75 + c * 0.05, 1.25, 0.3),
        new THREE.Vector3(-1.9 + c * 0.08, 0.8, 0.4 + c * 0.1),
        new THREE.Vector3(-1.6 + c * 0.06, 0.4, 0.5),
        new THREE.Vector3(-1.4 + c * 0.08, 0.02, 0.6 + c * 0.08)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.022, 6, false);
      const tube = new THREE.Mesh(tubeGeo, c % 2 === 0 ? m.copper : m.glowAmber);
      group.add(tube);
    }

    // F. Right Detached Articulated Combat Claw lying on ground
    const clawBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.25, 12), m.darkChassis);
    clawBase.position.set(1.4, 0.15, 0.8);
    clawBase.rotation.set(0.3, 0.5, 1.3);
    group.add(clawBase);

    for (let f = 0; f < 3; f++) {
      const fAngle = (f * Math.PI * 2) / 3;
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), m.brass);
      finger.position.set(1.4 + Math.cos(fAngle) * 0.2, 0.18, 0.8 + Math.sin(fAngle) * 0.2);
      finger.rotation.set(0.8, 0.4, 0.5);
      group.add(finger);
    }

    return group;
  }

  /**
   * 2. AAA Mega Dynamo Industrial Steam Turbine
   * Massive stator frame, flanged high-pressure copper pipes, brass steam pressure gauges,
   * cooling fins, and rotating dynamic rotor core.
   */
  public static createMegaDynamoTurbine(pos: THREE.Vector3, scale: number = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.scale.set(scale, scale, scale);
    const m = this.materials;

    // 1. Concrete & Steel Heavy Mounting Foundation Pad
    const pad = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 3.2), m.weatheredConcrete);
    pad.position.y = 0.2;
    pad.receiveShadow = true;
    pad.castShadow = true;
    group.add(pad);

    // Corner Mounting Anchor Bolts
    [[-2.1, -1.3], [2.1, -1.3], [-2.1, 1.3], [2.1, 1.3]].forEach(([bx, bz]) => {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.25, 8), m.brass);
      bolt.position.set(bx, 0.45, bz);
      group.add(bolt);
    });

    // 2. Main Cylindrical Dynamo Stator Housing
    const stator = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 3.4, 24), m.darkChassis);
    stator.rotation.z = Math.PI / 2;
    stator.position.set(0, 1.7, 0);
    stator.castShadow = true;
    group.add(stator);

    // Stator Radial Flanges (Heavy cast iron rings)
    [-1.5, -0.7, 0.7, 1.5].forEach((rx) => {
      const flange = new THREE.Mesh(new THREE.TorusGeometry(1.36, 0.08, 8, 28), m.weatheredPlating);
      flange.rotation.y = Math.PI / 2;
      flange.position.set(rx, 1.7, 0);
      group.add(flange);
    });

    // Radial Cooling Fins along top
    for (let a = -Math.PI / 3; a <= Math.PI / 3; a += Math.PI / 9) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.04, 0.2), m.weatheredPlating);
      fin.position.set(0, 1.7 + Math.cos(a) * 1.38, Math.sin(a) * 1.38);
      group.add(fin);
    }

    // 3. Central Visible Rotor with Copper Windings
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.6, 16), m.copper);
    rotor.rotation.z = Math.PI / 2;
    rotor.position.set(0, 1.7, 0);
    group.add(rotor);

    // 4. High-Pressure Copper Steam Manifolds with Valve Wheels
    const pipeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16), m.copper);
    pipeTop.position.set(0, 3.4, 0);
    pipeTop.castShadow = true;
    group.add(pipeTop);

    const pipeElbow = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2, 8, 16, Math.PI / 2), m.copper);
    pipeElbow.position.set(0.5, 4.3, 0);
    pipeElbow.rotation.z = -Math.PI / 2;
    group.add(pipeElbow);

    // Brass Steam Pressure Gauge with Glass Lens and Indicator Needle
    const gaugeRim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 20), m.brass);
    gaugeRim.rotation.x = Math.PI / 2;
    gaugeRim.position.set(0, 2.5, 1.35);
    group.add(gaugeRim);

    const dialFace = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.09, 20), m.whiteArmoredHull);
    dialFace.rotation.x = Math.PI / 2;
    dialFace.position.set(0, 2.5, 1.36);
    group.add(dialFace);

    const dialNeedle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.02), m.glowAmber);
    dialNeedle.position.set(0.04, 2.54, 1.42);
    dialNeedle.rotation.z = 0.6;
    group.add(dialNeedle);

    // Glowing amber inspection slot inside stator
    const glowSlot = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.08), m.glowAmber);
    glowSlot.position.set(0, 1.7, 1.32);
    group.add(glowSlot);

    return group;
  }

  /**
   * 3. AAA Volumetric Light Shaft (Cinematic God Ray Cone)
   * Semi-transparent additive atmospheric light cone streaming down from overhead openings.
   */
  public static createVolumetricLightShaft(
    pos: THREE.Vector3,
    height: number = 18,
    topRadius: number = 0.5,
    bottomRadius: number = 5.0,
    color: number = 0x38bdf8,
    opacity: number = 0.18
  ): THREE.Mesh {
    const geo = new THREE.ConeGeometry(bottomRadius, height, 16, 1, true);
    geo.translate(0, -height / 2, 0);

    const mat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const cone = new THREE.Mesh(geo, mat);
    cone.position.copy(pos);
    return cone;
  }

  /**
   * 4. AAA Cybernetic Diagnostic Terminal & Hologram Console
   */
  public static createControlConsole(pos: THREE.Vector3, rotY: number = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = this.materials;

    // Pedestal Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.3, 8), m.darkChassis);
    base.position.y = 0.15;
    group.add(base);

    // Angled Console Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.85, 0.7), m.darkChassis);
    desk.position.set(0, 0.7, 0);
    desk.castShadow = true;
    group.add(desk);

    // Tilted Keyboard / Button Surface
    const keypad = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.4), m.circuitBoard);
    keypad.position.set(0, 1.15, 0.1);
    keypad.rotation.x = 0.35;
    group.add(keypad);

    // Angled Triple CRT / LCD Screens
    [-0.45, 0, 0.45].forEach((sx, i) => {
      const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.08), m.weatheredPlating);
      monitor.position.set(sx, 1.5, -0.15);
      monitor.rotation.y = (i - 1) * -0.25;
      group.add(monitor);

      const screenGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.38, 0.3),
        i === 1 ? m.glowCyan : m.glowAmber
      );
      screenGlow.position.set(sx, 1.5, -0.1);
      screenGlow.rotation.y = (i - 1) * -0.25;
      group.add(screenGlow);
    });

    return group;
  }

  /**
   * 5. Multi-Stage High-Voltage Tesla Generator
   */
  public static createTeslaGenerator(pos: THREE.Vector3, height: number = 3.6): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    const m = this.materials;

    // Stepped hexagonal pedestal
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.4, 6), m.darkChassis);
    base1.position.y = 0.2;
    base1.castShadow = true;
    group.add(base1);

    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.35, 6), m.weatheredPlating);
    base2.position.y = 0.55;
    base2.castShadow = true;
    group.add(base2);

    // Ceramic standoff insulators on corners
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8), m.ceramicInsulator);
      ins.position.set(Math.cos(angle) * 0.95, 0.9, Math.sin(angle) * 0.95);
      group.add(ins);
    }

    // Wide Primary Induction Coil (Horizontal copper spiral base)
    const primaryCoil = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.1, 10, 28), m.copper);
    primaryCoil.rotation.x = Math.PI / 2;
    primaryCoil.position.y = 1.15;
    primaryCoil.castShadow = true;
    group.add(primaryCoil);

    // Tall Secondary Resonant Coil (Dense vertical copper cylinder)
    const coilHeight = height - 1.8;
    const secondaryCore = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, coilHeight, 16), m.copper);
    secondaryCore.position.y = 1.2 + coilHeight / 2;
    secondaryCore.castShadow = true;
    group.add(secondaryCore);

    // Multiple copper ring turns along the coil
    for (let r = 0; r < 8; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.02, 6, 20), m.brass);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.3 + (r * coilHeight) / 8;
      group.add(ring);
    }

    // Toroidal Top-Load Capacitor
    const topTorus = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.18, 12, 32), m.brass);
    topTorus.rotation.x = Math.PI / 2;
    topTorus.position.y = 1.2 + coilHeight + 0.25;
    topTorus.castShadow = true;
    group.add(topTorus);

    // Discharge terminal spark sphere
    const sparkSphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), m.glowCyan);
    sparkSphere.position.y = 1.2 + coilHeight + 0.25;
    group.add(sparkSphere);

    return group;
  }

  /**
   * 6. Industrial High-Voltage Transformer Substation
   */
  public static createTransformer(pos: THREE.Vector3, w: number = 2.4, h: number = 2.0, d: number = 1.8): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    const m = this.materials;

    // Main tank body
    const tank = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m.darkChassis);
    tank.position.y = h / 2;
    tank.castShadow = true;
    group.add(tank);

    // Cooling radiator fins along the sides
    const finGeo = new THREE.BoxGeometry(0.05, h * 0.7, d * 0.85);
    for (let f = -w / 2 + 0.2; f <= w / 2 - 0.2; f += 0.28) {
      const finL = new THREE.Mesh(finGeo, m.weatheredPlating);
      finL.position.set(f, h / 2, d / 2 + 0.08);
      group.add(finL);

      const finR = new THREE.Mesh(finGeo, m.weatheredPlating);
      finR.position.set(f, h / 2, -d / 2 - 0.08);
      group.add(finR);
    }

    // Top high-voltage ceramic insulator bushings
    [-0.6, 0, 0.6].forEach((bx) => {
      const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.65, 8), m.ceramicInsulator);
      bushing.position.set(bx, h + 0.3, 0);
      group.add(bushing);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), m.brass);
      cap.position.set(bx, h + 0.65, 0);
      group.add(cap);
    });

    // Circular analog pressure/voltage gauge on front
    const gaugeRim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16), m.brass);
    gaugeRim.rotation.x = Math.PI / 2;
    gaugeRim.position.set(0, h * 0.6, d / 2 + 0.04);
    group.add(gaugeRim);

    const gaugeFace = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 16), m.glowCyan);
    gaugeFace.rotation.x = Math.PI / 2;
    gaugeFace.position.set(0, h * 0.6, d / 2 + 0.05);
    group.add(gaugeFace);

    return group;
  }

  /**
   * 7. Overhead Industrial Truss / Gantry Crane Arch
   */
  public static createOverheadGantry(pos: THREE.Vector3, span: number = 14, height: number = 7.5): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    const m = this.materials;

    // Vertical structural columns (Left and Right)
    const colGeo = new THREE.BoxGeometry(0.7, height, 0.7);
    const colL = new THREE.Mesh(colGeo, m.darkChassis);
    colL.position.set(-span / 2, height / 2, 0);
    colL.castShadow = true;
    group.add(colL);

    const colR = new THREE.Mesh(colGeo, m.darkChassis);
    colR.position.set(span / 2, height / 2, 0);
    colR.castShadow = true;
    group.add(colR);

    // Cross-beam I-beam truss
    const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 1.2, 0.6, 0.6), m.darkChassis);
    beam.position.set(0, height, 0);
    beam.castShadow = true;
    group.add(beam);

    // Warning hazard stripes along bottom of beam
    const hazard = new THREE.Mesh(new THREE.PlaneGeometry(span, 0.15), m.hazardYellow);
    hazard.position.set(0, height - 0.31, 0.31);
    group.add(hazard);

    // Hanging crane chain & magnetic hoist
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), m.rustIron);
    chain.position.set(0, height - 1.2, 0);
    group.add(chain);

    const magnetHoist = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 14), m.copper);
    magnetHoist.position.set(0, height - 2.4, 0);
    group.add(magnetHoist);

    return group;
  }

  /**
   * 8. Volumetric Industrial Steam Pipe with Brass Valve & Pressure Gauge
   */
  public static createSteamPipeRun(start: THREE.Vector3, end: THREE.Vector3, diameter: number = 0.25): THREE.Group {
    const group = new THREE.Group();
    const m = this.materials;

    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const pipeGeo = new THREE.CylinderGeometry(diameter, diameter, len, 12);
    const pipe = new THREE.Mesh(pipeGeo, m.copper);
    pipe.position.copy(mid);
    pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    pipe.castShadow = true;
    group.add(pipe);

    // Brass valve wheel at midpoint
    const valveWheel = new THREE.Mesh(new THREE.TorusGeometry(diameter * 1.8, 0.035, 8, 16), m.brass);
    valveWheel.position.copy(mid);
    valveWheel.quaternion.copy(pipe.quaternion);
    valveWheel.rotation.x += Math.PI / 2;
    group.add(valveWheel);

    return group;
  }

  /**
   * 9. Steampunk Riveted Copper Steam Boiler
   */
  public static createSteampunkBoiler(pos: THREE.Vector3, scale: number = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.scale.set(scale, scale, scale);
    const m = this.materials;

    // Heavy cast iron base cradle
    const cradle = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 1.8), m.darkChassis);
    cradle.position.y = 0.2;
    cradle.castShadow = true;
    group.add(cradle);

    // Main horizontal cylindrical boiler tank
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.8, 20), m.copper);
    tank.rotation.z = Math.PI / 2;
    tank.position.set(0, 1.2, 0);
    tank.castShadow = true;
    group.add(tank);

    // Riveted Brass Reinforcement Belts
    [-1.0, 0, 1.0].forEach((rx) => {
      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.93, 0.05, 8, 24), m.brass);
      belt.rotation.y = Math.PI / 2;
      belt.position.set(rx, 1.2, 0);
      group.add(belt);
    });

    // Chimney Exhaust Flue with subtle steam
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.2, 12), m.darkChassis);
    chimney.position.set(-0.9, 2.4, 0);
    chimney.castShadow = true;
    group.add(chimney);

    const chimneyCap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.35, 12), m.copper);
    chimneyCap.position.set(-0.9, 3.55, 0);
    group.add(chimneyCap);

    // Front Brass Manhole Inspection Hatch
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16), m.brass);
    hatch.rotation.z = Math.PI / 2;
    hatch.position.set(1.42, 1.2, 0);
    group.add(hatch);

    // Analog Pressure Dial
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16), m.brass);
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(0.3, 1.8, 0.92);
    group.add(gauge);

    const gaugeFace = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16), m.whiteArmoredHull);
    gaugeFace.rotation.x = Math.PI / 2;
    gaugeFace.position.set(0.3, 1.8, 0.93);
    group.add(gaugeFace);

    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.11, 0.015), m.glowAmber);
    needle.position.set(0.32, 1.82, 0.97);
    needle.rotation.z = 0.8;
    group.add(needle);

    return group;
  }

  private static gearGeoCache: Record<string, THREE.BufferGeometry> = {};

  /**
   * Builds and caches a single merged 3D ExtrudeGeometry for a real toothed steampunk cogwheel
   * with trapezoidal gear teeth around the perimeter, spoked cutouts, and an axle hole.
   * Renders an entire toothed gear in 1 single GPU draw call instead of 30+!
   */
  public static getOrCreateToothedGearGeometry(
    radius: number,
    thickness: number,
    teethCount: number,
    spokeCount: number
  ): THREE.BufferGeometry {
    const key = `${radius.toFixed(2)}_${thickness.toFixed(2)}_${teethCount}_${spokeCount}`;
    if (this.gearGeoCache[key]) {
      return this.gearGeoCache[key];
    }

    const shape = new THREE.Shape();
    const innerR = radius * 0.84;
    const outerR = radius * 1.0;
    const step = (Math.PI * 2) / teethCount;

    for (let i = 0; i < teethCount; i++) {
      const a0 = i * step;
      const a1 = a0 + step * 0.18;
      const a2 = a0 + step * 0.27;
      const a3 = a0 + step * 0.53;
      const a4 = a0 + step * 0.62;

      if (i === 0) {
        shape.moveTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
      } else {
        shape.lineTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
      }
      shape.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
      shape.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
      shape.lineTo(Math.cos(a3) * outerR, Math.sin(a3) * outerR);
      shape.lineTo(Math.cos(a4) * innerR, Math.sin(a4) * innerR);
    }
    shape.closePath();

    // Central axle bore hole
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, radius * 0.11, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    // Spoke window cutouts between hub and outer rim
    if (radius >= 0.4 && spokeCount >= 3) {
      const rHub = radius * 0.28;
      const rRim = radius * 0.68;
      const sectorStep = (Math.PI * 2) / spokeCount;
      const spokeHalfAngle = 0.11;

      for (let s = 0; s < spokeCount; s++) {
        const startA = s * sectorStep + spokeHalfAngle;
        const endA = (s + 1) * sectorStep - spokeHalfAngle;
        if (endA > startA + 0.06) {
          const windowPath = new THREE.Path();
          windowPath.absarc(0, 0, rRim, startA, endA, false);
          windowPath.absarc(0, 0, rHub, endA, startA, true);
          windowPath.closePath();
          shape.holes.push(windowPath);
        }
      }
    }

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
      curveSegments: 5,
    });
    geo.center();

    this.gearGeoCache[key] = geo;
    return geo;
  }

  /**
   * 10. REAL 3D Toothed Steampunk Cogwheel (Valódi fogazott fogaskerék)
   * Uses a cached single-draw-call extruded gear body + central boss hub!
   */
  public static createTrueToothedGear(
    radius: number = 1.2,
    thickness: number = 0.22,
    teethCount: number = 16,
    variant: 'brass' | 'copper' | 'iron' | 'bronze' = 'brass',
    spokeCount: number = 6
  ): THREE.Group {
    const gearGroup = new THREE.Group();
    const m = this.materials;

    const mainMat =
      variant === 'brass'
        ? m.brass
        : variant === 'copper'
        ? m.copper
        : variant === 'bronze'
        ? m.weatheredPlating
        : m.rustIron;
    const accentMat = variant === 'brass' ? m.copper : m.brass;

    // 1. Single-Mesh Extruded Toothed Gear Wheel (1 draw call!)
    const gearGeo = this.getOrCreateToothedGearGeometry(radius, thickness, teethCount, spokeCount);
    const gearMesh = new THREE.Mesh(gearGeo, mainMat);
    if (radius >= 1.2) {
      gearMesh.castShadow = true;
    }
    gearGroup.add(gearMesh);

    // 2. Central Hub Boss
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.24, radius * 0.26, thickness * 1.4, 10),
      accentMat
    );
    hub.rotation.x = Math.PI / 2;
    gearGroup.add(hub);

    return gearGroup;
  }

  /**
   * 11. Authentic Animated Steampunk Reciprocating Steam Engine (Működő Gőzgép)
   * Features horizontal riveted copper boiler, glowing firebox, tall smokestack,
   * brass steam cylinder, reciprocating chrome piston rod, spoked flywheel + toothed drive gear,
   * and spinning Watt centrifugal flyball governor!
   */
  public static createWorkingSteamEngine(
    pos: THREE.Vector3,
    rotY: number = 0,
    scale: number = 1.0
  ): {
    group: THREE.Group;
    flywheel: THREE.Group;
    driveGear: THREE.Group;
    pistonRod: THREE.Group;
    governor: THREE.Group;
    chimneyTop: THREE.Vector3;
  } {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    group.scale.set(scale, scale, scale);
    const m = this.materials;

    // 1. Heavy Cast-Iron & Riveted Bronze Bedplate
    const bedplate = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.45, 2.8), m.darkChassis);
    bedplate.position.set(0, 0.225, 0);
    bedplate.castShadow = true;
    bedplate.receiveShadow = true;
    group.add(bedplate);

    const brassTrim = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.1, 2.9), m.brass);
    brassTrim.position.set(0, 0.44, 0);
    group.add(brassTrim);

    // 2. Riveted Copper Steam Boiler (Back side of bedplate)
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 3.2, 20), m.copper);
    boiler.rotation.z = Math.PI / 2;
    boiler.position.set(-0.3, 1.35, -0.55);
    boiler.castShadow = true;
    group.add(boiler);

    // Brass boiler bands
    [-1.4, -0.3, 0.8].forEach((bx) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.05, 8, 24), m.brass);
      band.rotation.y = Math.PI / 2;
      band.position.set(bx, 1.35, -0.55);
      group.add(band);
    });

    // Glowing Amber Furnace Firebox Door (Emissive glow without costly per-prop PointLight)
    const fireboxGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 16), m.glowAmber);
    fireboxGlow.rotation.z = Math.PI / 2;
    fireboxGlow.position.set(-1.92, 1.25, -0.55);
    group.add(fireboxGlow);

    // Tall Smokestack Chimney
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.8, 14), m.darkChassis);
    chimney.position.set(-1.3, 3.2, -0.55);
    chimney.castShadow = true;
    group.add(chimney);

    const chimneyCrown = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 8, 16), m.brass);
    chimneyCrown.rotation.x = Math.PI / 2;
    chimneyCrown.position.set(-1.3, 4.55, -0.55);
    group.add(chimneyCrown);

    // 3. Horizontal Brass Steam Cylinder & Valve Chest (Front side)
    const steamCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 16), m.brass);
    steamCylinder.rotation.z = Math.PI / 2;
    steamCylinder.position.set(-1.25, 1.05, 0.65);
    steamCylinder.castShadow = true;
    group.add(steamCylinder);

    const cylinderFlangeL = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16), m.copper);
    cylinderFlangeL.rotation.z = Math.PI / 2;
    cylinderFlangeL.position.set(-1.88, 1.05, 0.65);
    group.add(cylinderFlangeL);

    const cylinderFlangeR = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16), m.copper);
    cylinderFlangeR.rotation.z = Math.PI / 2;
    cylinderFlangeR.position.set(-0.62, 1.05, 0.65);
    group.add(cylinderFlangeR);

    // Overhead Copper Steam Supply Pipe with Red Valve Wheel
    const supplyPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 10), m.copper);
    supplyPipe.rotation.x = Math.PI / 2;
    supplyPipe.position.set(-1.1, 1.65, 0.05);
    group.add(supplyPipe);

    const valveWheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.035, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4, metalness: 0.6 })
    );
    valveWheel.position.set(-1.1, 1.88, 0.05);
    valveWheel.rotation.x = Math.PI / 2;
    group.add(valveWheel);

    // 4. Animated Reciprocating Piston Rod & Crosshead Assembly
    const pistonRod = new THREE.Group();
    pistonRod.position.set(0, 1.05, 0.65);

    const chromeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 12), m.chromePiston);
    chromeShaft.rotation.z = Math.PI / 2;
    pistonRod.add(chromeShaft);

    const crosshead = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.28), m.brass);
    crosshead.position.set(0.35, 0, 0);
    pistonRod.add(crosshead);

    const connectingRod = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.08), m.copper);
    connectingRod.position.set(0.85, 0, 0.12);
    pistonRod.add(connectingRod);

    group.add(pistonRod);

    // 5. Giant Spoked Flywheel + Interlocking Toothed Brass Drive Gear
    const flywheel = this.createTrueToothedGear(1.35, 0.24, 20, 'brass', 6);
    flywheel.position.set(1.35, 1.45, 0.88);
    group.add(flywheel);

    const driveGear = this.createTrueToothedGear(0.85, 0.26, 14, 'copper', 4);
    driveGear.position.set(1.35, 1.45, -0.85);
    group.add(driveGear);

    // Main Crankshaft Axle connecting Flywheel and Drive Gear
    const mainAxle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 12), m.chromePiston);
    mainAxle.rotation.x = Math.PI / 2;
    mainAxle.position.set(1.35, 1.45, 0);
    group.add(mainAxle);

    // 6. Spinning Watt Centrifugal Flyball Governor on top of boiler
    const governor = new THREE.Group();
    governor.position.set(0.25, 2.35, -0.55);

    const govSpindle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), m.chromePiston);
    governor.add(govSpindle);

    [-0.38, 0.38].forEach((gx) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6), m.brass);
      arm.position.set(gx * 0.6, 0.1, 0);
      arm.rotation.z = gx > 0 ? 0.55 : -0.55;
      governor.add(arm);

      const flyball = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), m.brass);
      flyball.position.set(gx, -0.05, 0);
      governor.add(flyball);
    });
    group.add(governor);

    // Calculate world chimney top for steam emitters
    const localChimney = new THREE.Vector3(-1.3 * scale, 4.7 * scale, -0.55 * scale);
    localChimney.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    const chimneyTop = pos.clone().add(localChimney);

    return { group, flywheel, driveGear, pistonRod, governor, chimneyTop };
  }

  /**
   * 12. Medium Industrial Scrap Mound (Grounded Slag, I-Beams, Rusted Hull Plates & Pipes)
   */
  public static createScrapPile(pos: THREE.Vector3, rotY: number = 0, scale: number = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    group.scale.set(scale, scale, scale);
    const m = this.materials;

    // Base crumpled slag & rust-iron mound
    const moundGeo = new THREE.DodecahedronGeometry(2.1, 1);
    const mound = new THREE.Mesh(moundGeo, m.rustIron);
    mound.scale.set(1.9, 0.72, 1.55);
    mound.position.y = 0.5;
    mound.castShadow = true;
    mound.receiveShadow = true;
    group.add(mound);

    // Protruding Structural Steel I-Beam Girders
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.8, 0.28), m.darkChassis);
    beam1.position.set(-0.7, 1.45, 0.3);
    beam1.rotation.set(0.45, 0.2, 0.52);
    beam1.castShadow = true;
    group.add(beam1);

    const beam2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.1, 0.24), m.weatheredPlating);
    beam2.position.set(0.8, 1.15, -0.4);
    beam2.rotation.set(-0.38, 0.4, -0.6);
    beam2.castShadow = true;
    group.add(beam2);

    // Crushed Cylindrical Tank / Boiler Shell wedged in scrap
    const crushedTank = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.2, 12), m.weatheredPlating);
    crushedTank.position.set(0.4, 0.85, 0.5);
    crushedTank.rotation.set(0.7, 0.3, 1.2);
    crushedTank.castShadow = true;
    group.add(crushedTank);

    // Corrugated Hull Plate & Bent Pipe
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.3), m.darkChassis);
    plate.position.set(-0.4, 0.95, -0.5);
    plate.rotation.set(0.6, -0.5, 0.3);
    plate.castShadow = true;
    group.add(plate);

    // Subtle half-buried dark iron gear (muted, not dominant orange)
    const buriedGear = this.createTrueToothedGear(0.75, 0.16, 12, 'iron', 4);
    buriedGear.position.set(-0.8, 0.55, 0.6);
    buriedGear.rotation.set(0.8, 0.4, 0.3);
    group.add(buriedGear);

    return group;
  }

  /**
   * 13. Balanced Small-Scale Ground Detail Scatter (GPU InstancedMesh)
   * Provides fine industrial ground detail (I-beams, pipes, hull plates, oil drums,
   * robot fragments, and subtle dark-bronze/iron parts) without orange gear clutter!
   */
  public static createInstancedScrapyardParts(): THREE.Group {
    const group = new THREE.Group();
    const m = this.materials;
    const dummy = new THREE.Object3D();

    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // 1. 95 Rusted Steel I-Beam & Girder Segments (1 Draw Call)
    const beamGeo = new THREE.BoxGeometry(0.22, 0.18, 1.45);
    const beamInst = new THREE.InstancedMesh(beamGeo, m.darkChassis, 95);
    for (let i = 0; i < 95; i++) {
      const x = (rand() - 0.5) * 68;
      const z = (rand() - 0.5) * 68;
      const sc = 0.7 + rand() * 1.1;
      dummy.position.set(x, 0.08, z);
      dummy.rotation.set((rand() - 0.5) * 0.25, rand() * Math.PI * 2, (rand() - 0.5) * 0.25);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      beamInst.setMatrixAt(i, dummy.matrix);
    }
    beamInst.instanceMatrix.needsUpdate = true;
    group.add(beamInst);

    // 2. 90 Heavy Industrial Pipe Sections (1 Draw Call)
    const pipeGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.35, 10);
    const pipeInst = new THREE.InstancedMesh(pipeGeo, m.rustIron, 90);
    for (let i = 0; i < 90; i++) {
      const x = (rand() - 0.5) * 68;
      const z = (rand() - 0.5) * 68;
      const sc = 0.7 + rand() * 1.0;
      dummy.position.set(x, 0.11, z);
      dummy.rotation.set(Math.PI / 2 + (rand() - 0.5) * 0.2, rand() * Math.PI * 2, Math.PI / 2);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      pipeInst.setMatrixAt(i, dummy.matrix);
    }
    pipeInst.instanceMatrix.needsUpdate = true;
    group.add(pipeInst);

    // 3. 85 Weathered Hull & Tread Scrap Slabs (1 Draw Call)
    const plateGeo = new THREE.BoxGeometry(0.85, 0.04, 0.62);
    const plateInst = new THREE.InstancedMesh(plateGeo, m.weatheredPlating, 85);
    for (let i = 0; i < 85; i++) {
      const x = (rand() - 0.5) * 66;
      const z = (rand() - 0.5) * 66;
      const sc = 0.75 + rand() * 1.2;
      dummy.position.set(x, 0.03, z);
      dummy.rotation.set((rand() - 0.5) * 0.18, rand() * Math.PI * 2, (rand() - 0.5) * 0.18);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      plateInst.setMatrixAt(i, dummy.matrix);
    }
    plateInst.instanceMatrix.needsUpdate = true;
    group.add(plateInst);

    // 4. 55 Industrial Oil Drums & Pressure Canisters (1 Draw Call)
    const drumGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.78, 12);
    const drumInst = new THREE.InstancedMesh(drumGeo, m.rustIron, 55);
    for (let i = 0; i < 55; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = 9 + rand() * 28; // Keep clear of central plazas
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const tipped = rand() < 0.65;
      dummy.position.set(x, tipped ? 0.25 : 0.39, z);
      dummy.rotation.set(tipped ? Math.PI / 2 + (rand() - 0.5) * 0.2 : 0, rand() * Math.PI * 2, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      drumInst.setMatrixAt(i, dummy.matrix);
    }
    drumInst.instanceMatrix.needsUpdate = true;
    group.add(drumInst);

    // 5. 45 Subtle Muted Dark-Bronze / Iron Mechanical Cogwheels (Small & understated!)
    const smallGearGeo = this.getOrCreateToothedGearGeometry(0.36, 0.06, 10, 4);
    const smallGearInst = new THREE.InstancedMesh(smallGearGeo, m.weatheredPlating, 45);
    for (let i = 0; i < 45; i++) {
      const x = (rand() - 0.5) * 60;
      const z = (rand() - 0.5) * 60;
      const sc = 0.6 + rand() * 0.85;
      dummy.position.set(x, 0.04, z);
      dummy.rotation.set(Math.PI / 2 + (rand() - 0.5) * 0.35, rand() * Math.PI * 2, rand() * Math.PI * 2);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      smallGearInst.setMatrixAt(i, dummy.matrix);
    }
    smallGearInst.instanceMatrix.needsUpdate = true;
    group.add(smallGearInst);

    // 6. 65 Severed Robot Dome Heads + Glowing Optical Visors (2 Draw Calls)
    const robotHeadGeo = new THREE.SphereGeometry(0.26, 12, 10);
    const robotVisorGeo = new THREE.BoxGeometry(0.32, 0.1, 0.14);
    const robotHeadInst = new THREE.InstancedMesh(robotHeadGeo, m.whiteArmoredHull, 65);
    const robotVisorInst = new THREE.InstancedMesh(robotVisorGeo, m.glowCyan, 65);
    for (let i = 0; i < 65; i++) {
      const x = (rand() - 0.5) * 62;
      const z = (rand() - 0.5) * 62;
      const sc = 0.75 + rand() * 0.6;
      dummy.position.set(x, 0.17 * sc, z);
      dummy.rotation.set((rand() - 0.5) * 0.8, rand() * Math.PI * 2, (rand() - 0.5) * 0.8);
      dummy.scale.set(sc * 1.1, sc * 0.95, sc);
      dummy.updateMatrix();
      robotHeadInst.setMatrixAt(i, dummy.matrix);

      dummy.translateZ(0.17 * sc);
      dummy.updateMatrix();
      robotVisorInst.setMatrixAt(i, dummy.matrix);
    }
    robotHeadInst.instanceMatrix.needsUpdate = true;
    robotVisorInst.instanceMatrix.needsUpdate = true;
    group.add(robotHeadInst);
    group.add(robotVisorInst);

    // 7. 85 Severed Robot Limbs & Hydraulic Pistons (1 Draw Call)
    const robotArmGeo = new THREE.BoxGeometry(0.18, 0.78, 0.18);
    const robotArmInst = new THREE.InstancedMesh(robotArmGeo, m.whiteArmoredHull, 85);
    for (let i = 0; i < 85; i++) {
      const x = (rand() - 0.5) * 62;
      const z = (rand() - 0.5) * 62;
      const sc = 0.75 + rand() * 0.75;
      dummy.position.set(x, 0.09, z);
      dummy.rotation.set(Math.PI / 2 + (rand() - 0.5) * 0.35, rand() * Math.PI * 2, (rand() - 0.5) * 0.4);
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      robotArmInst.setMatrixAt(i, dummy.matrix);
    }
    robotArmInst.instanceMatrix.needsUpdate = true;
    group.add(robotArmInst);

    return group;
  }

  /**
   * 13B. Detailed Close-Up Detached Robot Assemblies (Heads, Claw Arms, Ribcage Cores, Hydraulic Legs)
   * Placed near walkable plazas without blocking colliders so the player can walk right through/around them.
   */
  public static createDetachedRobotAssembly(
    pos: THREE.Vector3,
    kind: 'head_cluster' | 'claw_arm' | 'ribcage_core' | 'hydraulic_leg',
    rotY: number = 0,
    scale: number = 1.0
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    group.scale.set(scale, scale, scale);
    const m = this.materials;

    if (kind === 'head_cluster') {
      // Severed Steampunk Automaton Turret Head with glowing ocular lenses & copper neck cables
      const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.52, 0.62), m.whiteArmoredHull);
      helmet.position.set(0, 0.26, 0);
      helmet.rotation.set(0.25, 0.1, -0.35);
      group.add(helmet);

      const brassCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.14, 12), m.brass);
      brassCrown.position.set(0.06, 0.52, -0.02);
      brassCrown.rotation.set(0.25, 0.1, -0.35);
      group.add(brassCrown);

      [-0.14, 0.14].forEach((ex, idx) => {
        const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 12), m.copper);
        bezel.rotation.x = Math.PI / 2;
        bezel.position.set(ex, 0.28, 0.32);
        group.add(bezel);

        const lens = new THREE.Mesh(
          new THREE.SphereGeometry(0.085, 10, 10),
          idx === 0 ? m.glowCyan : m.glowAmber
        );
        lens.position.set(ex, 0.28, 0.35);
        group.add(lens);
      });
    } else if (kind === 'claw_arm') {
      // Articulated Shoulder + Hydraulic Forearm + 3-Pronged Mechanical Claw
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 12), m.brass);
      shoulder.position.set(-0.65, 0.22, 0);
      group.add(shoulder);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.85, 10), m.whiteArmoredHull);
      upperArm.position.set(-0.25, 0.2, 0);
      upperArm.rotation.z = Math.PI / 2 - 0.15;
      group.add(upperArm);

      const elbowGear = this.createTrueToothedGear(0.25, 0.08, 10, 'copper', 4);
      elbowGear.position.set(0.18, 0.16, 0.14);
      group.add(elbowGear);

      const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.24), m.darkChassis);
      forearm.position.set(0.55, 0.15, 0.1);
      forearm.rotation.y = 0.4;
      group.add(forearm);

      for (let f = -1; f <= 1; f++) {
        const clawFinger = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.06), m.brass);
        clawFinger.position.set(0.98, 0.15 + f * 0.07, 0.22);
        clawFinger.rotation.z = -f * 0.35;
        group.add(clawFinger);
      }
    } else if (kind === 'ribcage_core') {
      // Half-buried Automaton Ribcage & Glowing Arc-Capacitor Chest Core
      const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.1, 10), m.darkChassis);
      spine.rotation.z = Math.PI / 2;
      spine.position.set(0, 0.18, 0);
      group.add(spine);

      for (let r = -0.36; r <= 0.36; r += 0.24) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 8, 14, Math.PI * 1.25), m.brass);
        rib.rotation.y = Math.PI / 2;
        rib.position.set(r, 0.22, 0);
        group.add(rib);
      }

      const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), m.glowAmber);
      core.position.set(0, 0.25, 0);
      group.add(core);
    } else {
      // Severed Bipedal Hydraulic Robot Leg & Heavy Tread Foot
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.85, 0.32), m.whiteArmoredHull);
      thigh.position.set(-0.3, 0.22, 0);
      thigh.rotation.z = 1.25;
      group.add(thigh);

      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.85, 8), m.chromePiston);
      piston.position.set(-0.25, 0.35, 0.16);
      piston.rotation.z = 1.25;
      group.add(piston);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.56), m.brass);
      foot.position.set(0.35, 0.12, 0.05);
      foot.rotation.y = 0.3;
      group.add(foot);
    }

    return group;
  }

  /**
   * 13C. Subterranean Steampunk Dirigible / Airship (Földalatti Léghajó)
   * Cruises high across the subterranean cavern-city sky with a spinning brass propeller
   * and warm glowing cabin lights. Uses fog: false so it remains visible against the sky dome.
   */
  public static createSteampunkAirship(scale: number = 1.0): {
    group: THREE.Group;
    propeller: THREE.Group;
  } {
    const group = new THREE.Group();
    group.scale.set(scale, scale, scale);

    const hullMat = new THREE.MeshBasicMaterial({ color: 0x854d1e, fog: false });
    const brassBandMat = new THREE.MeshBasicMaterial({ color: 0xd97706, fog: false });
    const darkIronMat = new THREE.MeshBasicMaterial({ color: 0x291507, fog: false });
    const glowCabinMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false });
    const searchlightMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });

    // 1. Elongated Zeppelin Copper-Bronze Envelope
    const envelope = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12), hullMat);
    envelope.scale.set(1.0, 0.9, 2.8);
    group.add(envelope);

    // Brass structural rib belts around the airship hull
    [-2.8, -1.0, 1.0, 2.8].forEach((bz) => {
      const rScale = 1 - Math.abs(bz) / 6.5;
      const belt = new THREE.Mesh(new THREE.TorusGeometry(2.22 * rScale, 0.08, 6, 18), brassBandMat);
      belt.position.set(0, 0, bz);
      group.add(belt);
    });

    // Tail Stabilizer Fins
    const vFin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.8, 2.2), brassBandMat);
    vFin.position.set(0, 0.2, -4.8);
    group.add(vFin);

    const hFin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 2.2), brassBandMat);
    hFin.position.set(0, 0, -4.8);
    group.add(hFin);

    // 2. Underslung Steampunk Gondola Cabin with Illuminated Windows
    const gondola = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 3.6), darkIronMat);
    gondola.position.set(0, -2.35, 0);
    group.add(gondola);

    const cabinWindows = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.35, 2.8), glowCabinMat);
    cabinWindows.position.set(0, -2.3, 0);
    group.add(cabinWindows);

    // 3. Spinning Brass Tail Propeller
    const propeller = new THREE.Group();
    propeller.position.set(0, -2.35, -2.0);
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.06), brassBandMat);
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.8, 0.06), brassBandMat);
    propeller.add(blade1);
    propeller.add(blade2);
    group.add(propeller);

    // 4. Sweeping Volumetric Forward Searchlight Beam
    const beamGeo = new THREE.ConeGeometry(3.2, 14, 12, 1, true);
    beamGeo.translate(0, -7, 0);
    beamGeo.rotateX(-Math.PI / 2.4);
    const searchlight = new THREE.Mesh(beamGeo, searchlightMat);
    searchlight.position.set(0, -2.4, 1.8);
    group.add(searchlight);

    return { group, propeller };
  }

  /**
   * 14. Open-Air Steampunk Laboratory Workbench
   * Freely accessible from 360 degrees. Polished wood table, brass framing, vacuum tubes,
   * spark gap electrodes, Leyden jars, and glowing holographic atom.
   */
  public static createOpenSteampunkWorkbench(pos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    const m = this.materials;

    // Circular Raised Brass & Riveted Bronze Platform
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.16, 28), m.diamondTread);
    platform.position.y = 0.08;
    platform.receiveShadow = true;
    group.add(platform);

    const brassRim = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.07, 8, 36), m.brass);
    brassRim.rotation.x = Math.PI / 2;
    brassRim.position.y = 0.16;
    group.add(brassRim);

    // Decorative Toothed Clockwork Ring embedded in platform
    const platformGear = this.createTrueToothedGear(3.4, 0.08, 24, 'brass', 8);
    platformGear.rotation.x = Math.PI / 2;
    platformGear.position.y = 0.15;
    group.add(platformGear);

    // Workbench Table Top (Rich dark industrial wood & brass trim)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 2.2), m.darkChassis);
    tableTop.position.set(0, 0.95, 0);
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // Brass corner braces on table
    const tableTrim = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.06, 2.28), m.brass);
    tableTrim.position.set(0, 0.95, 0);
    group.add(tableTrim);

    // Cast Iron Table Legs
    [[-1.6, -0.9], [1.6, -0.9], [-1.6, 0.9], [1.6, 0.9]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.95, 8), m.darkChassis);
      leg.position.set(lx, 0.48, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // Glass Leyden Jars with Brass Caps
    [-1.2, -0.8].forEach((jx) => {
      const jar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, transparent: true, opacity: 0.72, roughness: 0.1 })
      );
      jar.position.set(jx, 1.25, -0.6);
      group.add(jar);

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.1, 10), m.brass);
      cap.position.set(jx, 1.5, -0.6);
      group.add(cap);

      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6), m.copper);
      rod.position.set(jx, 1.65, -0.6);
      group.add(rod);

      const jarSphere = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), m.glowAmber);
      jarSphere.position.set(jx, 1.82, -0.6);
      group.add(jarSphere);
    });

    // Glowing Vacuum Tube Array
    for (let t = 0; t < 3; t++) {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.35, 10),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, transparent: true, opacity: 0.65, roughness: 0.1 })
      );
      tube.position.set(0.9 + t * 0.18, 1.2, -0.6);
      group.add(tube);

      const filament = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6), m.glowAmber);
      filament.position.set(0.9 + t * 0.18, 1.2, -0.6);
      group.add(filament);
    }

    // Victorian Brass Desk Lamp
    const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), m.brass);
    lampArm.position.set(-1.4, 1.4, 0.5);
    lampArm.rotation.z = -0.3;
    group.add(lampArm);

    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 12), m.copper);
    shade.position.set(-1.25, 1.65, 0.5);
    shade.rotation.z = 0.5;
    group.add(shade);

    // Single Warm Golden PointLight illuminating the Open Workbench
    const benchGlow = new THREE.PointLight(0xf59e0b, 3.2, 12.0);
    benchGlow.position.set(0, 2.5, 0);
    group.add(benchGlow);

    return group;
  }

  /**
   * =========================================================================
   * TIER 1 & TIER 2 ENVIRONMENTAL COMPOSITION BUILDERS:
   * Large Architectural Buildings, Colossal Scrap Mountains, Hammerhead Cranes,
   * Overhead Pipe Bridges, and Distant Horizon Factory Complexes.
   * =========================================================================
   */

  /**
   * 15. LARGE FORM: Colossal Craggy Scrap Mountain & Industrial Slag Ridge
   * Establishes primary valley topography (8m-15m tall, 12m-22m wide) with layered
   * slag mounds, jutting rusted hull plates, towering tilted I-beams, and buried tanks.
   */
  public static createScrapMountain(
    pos: THREE.Vector3,
    radius: number = 11,
    height: number = 9,
    rotY: number = 0
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = this.materials;

    // 1. Primary Craggy Slag & Rusted Scrap Landform (Multi-lobe organic mountain base)
    const mainPeak = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 9, 3), m.rustIron);
    mainPeak.position.set(0, height * 0.45, 0);
    mainPeak.scale.set(1.25, 1.0, 0.9);
    mainPeak.castShadow = true;
    mainPeak.receiveShadow = true;
    group.add(mainPeak);

    const secondaryShoulder = new THREE.Mesh(
      new THREE.DodecahedronGeometry(radius * 0.68, 1),
      m.weatheredConcrete
    );
    secondaryShoulder.position.set(radius * 0.55, height * 0.32, radius * 0.25);
    secondaryShoulder.scale.set(1.3, 0.75, 1.1);
    secondaryShoulder.castShadow = true;
    secondaryShoulder.receiveShadow = true;
    group.add(secondaryShoulder);

    const lowerRidge = new THREE.Mesh(
      new THREE.DodecahedronGeometry(radius * 0.58, 1),
      m.rustIron
    );
    lowerRidge.position.set(-radius * 0.6, height * 0.26, -radius * 0.2);
    lowerRidge.scale.set(1.4, 0.65, 1.15);
    lowerRidge.receiveShadow = true;
    group.add(lowerRidge);

    // 2. Towering Tilted Structural Steel I-Beam Girders jutting out of the mountain
    const girderSpecs = [
      [-radius * 0.2, height * 0.75, 0, 0.35, 0.2, 0.4, height * 0.9],
      [radius * 0.3, height * 0.65, radius * 0.15, -0.4, 0.5, -0.35, height * 0.75],
      [-radius * 0.45, height * 0.5, -radius * 0.2, 0.5, -0.3, 0.6, height * 0.65],
    ];
    girderSpecs.forEach(([gx, gy, gz, rx, ry, rz, len]) => {
      const girder = new THREE.Mesh(new THREE.BoxGeometry(0.45, len, 0.45), m.darkChassis);
      girder.position.set(gx, gy, gz);
      girder.rotation.set(rx, ry, rz);
      girder.castShadow = true;
      group.add(girder);
    });

    // 3. Giant Rusted Ship/Tank Hull Plates embedded in the slopes
    const hullPlate1 = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 0.75, 0.18, radius * 0.55),
      m.weatheredPlating
    );
    hullPlate1.position.set(0, height * 0.52, radius * 0.42);
    hullPlate1.rotation.set(0.68, 0.15, -0.2);
    hullPlate1.castShadow = true;
    group.add(hullPlate1);

    // 4. Half-buried Industrial Boiler Shell & Pipe Manifold on the flank
    const buriedBoiler = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.4, 4.2, 14),
      m.copper
    );
    buriedBoiler.position.set(radius * 0.38, height * 0.42, -radius * 0.35);
    buriedBoiler.rotation.set(0.4, 0.6, 1.1);
    buriedBoiler.castShadow = true;
    group.add(buriedBoiler);

    return group;
  }

  /**
   * 16. LARGE FORM: Multi-Story Industrial Foundry & Smelting Hall Building
   * Features brick-and-steel architecture, sawtooth factory roofs, glowing clerestory windows,
   * external storage silos, buttress columns, and twin 24m smokestacks!
   */
  public static createIndustrialFoundryBuilding(pos: THREE.Vector3, rotY: number = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = this.materials;

    const w = 18;
    const h = 9.5;
    const d = 12;

    // 1. Main Foundry Masonry & Steel Hall Body
    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m.foundryBrick);
    mainHall.position.y = h / 2;
    mainHall.castShadow = true;
    mainHall.receiveShadow = true;
    group.add(mainHall);

    // 2. Heavy Steel H-Beam Buttress Pilasters along the facade
    for (let x = -w / 2 + 1.5; x <= w / 2 - 1.5; x += 3.75) {
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.55, h + 0.4, d + 0.5), m.darkChassis);
      pilaster.position.set(x, h / 2, 0);
      pilaster.castShadow = true;
      group.add(pilaster);
    }

    // Horizontal steel cornice beams
    const corniceMid = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.45, d + 0.6), m.weatheredPlating);
    corniceMid.position.y = h * 0.55;
    group.add(corniceMid);

    const corniceTop = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.55, d + 0.8), m.darkChassis);
    corniceTop.position.y = h;
    group.add(corniceTop);

    // 3. Sawtooth Industrial Factory Roof Bays (3 pitched roof bays)
    for (let b = -1; b <= 1; b++) {
      const bayX = b * (w / 3);
      const roofPrism = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, d, 3), m.darkChassis);
      roofPrism.rotation.x = Math.PI / 2;
      roofPrism.position.set(bayX, h + 1.2, 0);
      roofPrism.scale.set(1.3, 0.85, 1.0);
      roofPrism.castShadow = true;
      group.add(roofPrism);
    }

    // 4. Warm Illuminated Industrial Clerestory Windows (Upper & Lower Tiers)
    for (let wx = -w / 2 + 3.35; wx <= w / 2 - 3.35; wx += 3.75) {
      // Upper tall arched factory window glow
      const winUpper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.4, d + 0.25), m.glowAmber);
      winUpper.position.set(wx, h * 0.76, 0);
      group.add(winUpper);

      // Window iron mullion bars
      const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, d + 0.32), m.darkChassis);
      mullionV.position.set(wx, h * 0.76, 0);
      group.add(mullionV);

      // Lower furnace slit window
      const winLower = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, d + 0.25), m.glowAmber);
      winLower.position.set(wx, h * 0.28, 0);
      group.add(winLower);
    }

    // 5. Twin Towering 24m Brick & Iron Smokestacks at the rear of the Foundry
    [-4.5, 4.5].forEach((sx) => {
      const stackBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5.5, 2.6), m.foundryBrick);
      stackBase.position.set(sx, 2.75, -d / 2 - 1.2);
      group.add(stackBase);

      const stackShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.35, 23, 14), m.darkChassis);
      stackShaft.position.set(sx, 12.5, -d / 2 - 1.2);
      stackShaft.castShadow = true;
      group.add(stackShaft);

      // Iron reinforcement rings on smokestack
      [10, 15, 20, 23.5].forEach((ry) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.09, 6, 16), m.brass);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(sx, ry, -d / 2 - 1.2);
        group.add(ring);
      });
    });

    // 6. External Cylindrical Steam/Coal Silo Tank attached to side
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 8.2, 16), m.weatheredPlating);
    silo.position.set(w / 2 + 2.4, 4.1, 1.5);
    silo.castShadow = true;
    group.add(silo);

    const siloDome = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.copper);
    siloDome.position.set(w / 2 + 2.4, 8.2, 1.5);
    group.add(siloDome);

    return group;
  }

  /**
   * 17. LARGE FORM: High-Voltage Substation Building & Hyperboloid Cooling Tower Annex
   */
  public static createPowerSubstationBuilding(pos: THREE.Vector3, rotY: number = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = this.materials;

    const w = 15;
    const h = 8.5;
    const d = 10.5;

    // 1. Main Turbine Hall Building
    const hall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m.weatheredPlating);
    hall.position.y = h / 2;
    hall.castShadow = true;
    hall.receiveShadow = true;
    group.add(hall);

    // Barrel-vaulted steel roof
    const vaultRoof = new THREE.Mesh(new THREE.CylinderGeometry(d / 2, d / 2, w, 16, 1, false, 0, Math.PI), m.darkChassis);
    vaultRoof.rotation.z = Math.PI / 2;
    vaultRoof.position.set(0, h, 0);
    vaultRoof.scale.set(0.55, 1.0, 1.0);
    vaultRoof.castShadow = true;
    group.add(vaultRoof);

    // Structural rib frames
    for (let x = -w / 2 + 1.5; x <= w / 2 - 1.5; x += 3.0) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.45, h + 0.5, d + 0.4), m.darkChassis);
      rib.position.set(x, h / 2, 0);
      group.add(rib);
    }

    // Illuminated cyan/amber control bay windows
    for (let x = -w / 2 + 3.0; x <= w / 2 - 3.0; x += 3.0) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 2.0, d + 0.2),
        x === 0 ? m.glowCyan : m.glowAmber
      );
      win.position.set(x, h * 0.65, 0);
      group.add(win);
    }

    // 2. Rooftop High-Voltage Insulator & Busbar Gantry
    for (let ix = -5; ix <= 5; ix += 2.5) {
      const insulator = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 2.2, 10), m.ceramicInsulator);
      insulator.position.set(ix, h + 3.2, 0);
      group.add(insulator);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), m.copper);
      cap.position.set(ix, h + 4.4, 0);
      group.add(cap);
    }

    // 3. Adjacent 16m Industrial Cooling Tower
    const coolingTower = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.6, 15.5, 20, 1, false), m.weatheredConcrete);
    coolingTower.position.set(-w / 2 - 5.2, 7.75, -1.5);
    coolingTower.castShadow = true;
    coolingTower.receiveShadow = true;
    group.add(coolingTower);

    const towerRim = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.22, 8, 24), m.darkChassis);
    towerRim.rotation.x = Math.PI / 2;
    towerRim.position.set(-w / 2 - 5.2, 15.5, -1.5);
    group.add(towerRim);

    return group;
  }

  /**
   * 18. LARGE FORM: Towering 19m Elevated Spherical Steam/Water Reservoir & Pumping Tower
   */
  public static createElevatedReservoirTower(pos: THREE.Vector3, rotY: number = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = this.materials;

    // 1. 4 Heavy Angled Lattice Steel Support Legs (14m tall)
    const legOffsets = [
      [-3.2, -3.2],
      [3.2, -3.2],
      [-3.2, 3.2],
      [3.2, 3.2],
    ];
    legOffsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 14.5, 0.55), m.darkChassis);
      leg.position.set(lx * 0.78, 7.0, lz * 0.78);
      leg.rotation.set(lz * 0.025, 0, -lx * 0.025);
      leg.castShadow = true;
      group.add(leg);
    });

    // Horizontal structural bracing rings at y = 4.5m, 9.0m, 13.0m
    [4.5, 9.0, 13.0].forEach((by, idx) => {
      const span = 5.6 - idx * 0.6;
      const ringFrame = new THREE.Mesh(new THREE.BoxGeometry(span, 0.35, span), m.weatheredPlating);
      ringFrame.position.y = by;
      group.add(ringFrame);
    });

    // 2. Colossal Riveted Pressure Sphere Tank at Top (y = 15.2m)
    const sphereTank = new THREE.Mesh(new THREE.SphereGeometry(4.2, 20, 16), m.rustIron);
    sphereTank.position.y = 15.2;
    sphereTank.castShadow = true;
    group.add(sphereTank);

    // Equatorial catwalk & brass pressure band around the sphere
    const catwalkRing = new THREE.Mesh(new THREE.TorusGeometry(4.45, 0.16, 8, 28), m.brass);
    catwalkRing.rotation.x = Math.PI / 2;
    catwalkRing.position.y = 15.2;
    group.add(catwalkRing);

    // 3. Central Descending High-Pressure Standpipe & Copper Downcomers
    const standpipe = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 14.0, 14), m.copper);
    standpipe.position.y = 7.0;
    standpipe.castShadow = true;
    group.add(standpipe);

    // Base Pump House Block
    const pumpHouse = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 4.5), m.foundryBrick);
    pumpHouse.position.y = 1.6;
    pumpHouse.castShadow = true;
    group.add(pumpHouse);

    return group;
  }

  /**
   * 19. MEDIUM-TO-LARGE FORM: Towering 18m Harbor / Scrapyard Hammerhead Crane
   * Features steel lattice tower, operator cabin with warm light, horizontal jib boom,
   * counterweights, and heavy cable suspending an electromagnetic scrap grapple!
   */
  public static createHarborHammerheadCrane(
    pos: THREE.Vector3,
    rotY: number = 0,
    height: number = 17.5,
    boomLength: number = 16.0
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = this.materials;

    // 1. Heavy Concrete & Cast-Iron Crane Pier Base
    const basePier = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.8, 3.8), m.weatheredConcrete);
    basePier.position.y = 0.9;
    basePier.castShadow = true;
    basePier.receiveShadow = true;
    group.add(basePier);

    // 2. 4 Corner Lattice Tower Columns + Cross Braces
    [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.32, height, 0.32), m.darkChassis);
      col.position.set(cx, height / 2, cz);
      col.castShadow = true;
      group.add(col);
    });

    for (let y = 3.0; y < height - 1.5; y += 3.2) {
      const brace = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.24, 2.5), m.weatheredPlating);
      brace.position.y = y;
      group.add(brace);
    }

    // 3. Slewing Turntable & Operator Cabin at Top of Tower
    const turntable = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.6, 16), m.brass);
    turntable.position.y = height;
    group.add(turntable);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.8), m.weatheredPlating);
    cabin.position.set(0, height + 1.2, 0.8);
    cabin.castShadow = true;
    group.add(cabin);

    const cabinWindow = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.0, 0.15), m.glowAmber);
    cabinWindow.position.set(0, height + 1.3, 2.22);
    group.add(cabinWindow);

    // 4. Horizontal Hammerhead Jib Boom + Rear Counterweight Boom
    const mainBoom = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, boomLength), m.darkChassis);
    mainBoom.position.set(0, height + 1.4, boomLength * 0.25);
    mainBoom.castShadow = true;
    group.add(mainBoom);

    // Top A-Frame Apex & Steel Suspension Tie-Rods
    const apex = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 1.2), m.darkChassis);
    apex.position.set(0, height + 3.4, 0);
    group.add(apex);

    // Counterweight Block at rear of boom
    const counterweight = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2.6), m.rustIron);
    counterweight.position.set(0, height + 1.0, -boomLength * 0.22);
    group.add(counterweight);

    // 5. Hoist Trolley, Steel Cables & Suspended Electromagnetic Scrap Grapple
    const hookZ = boomLength * 0.58;
    const cableLen = height * 0.62;
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, cableLen, 6), m.darkChassis);
    cable.position.set(0, height + 0.8 - cableLen / 2, hookZ);
    group.add(cable);

    const magnetDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.45, 16), m.copper);
    magnetDisc.position.set(0, height + 0.8 - cableLen, hookZ);
    magnetDisc.castShadow = true;
    group.add(magnetDisc);

    // Suspended girder load hanging under the magnet
    const suspendedLoad = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 3.6), m.rustIron);
    suspendedLoad.position.set(0, height + 0.3 - cableLen, hookZ);
    suspendedLoad.rotation.set(0.12, 0.5, -0.08);
    suspendedLoad.castShadow = true;
    group.add(suspendedLoad);

    return group;
  }

  /**
   * 20. MEDIUM FORM: Elevated Multi-Pipe Industrial Trestle Bridge
   * Connects buildings and machinery across the valley with overhead pipe racks and stanchions.
   */
  public static createIndustrialPipeBridge(
    start: THREE.Vector3,
    end: THREE.Vector3,
    height: number = 5.6
  ): THREE.Group {
    const group = new THREE.Group();
    const m = this.materials;

    const dir = new THREE.Vector3().subVectors(end, start);
    dir.y = 0;
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y = height;
    const angle = Math.atan2(dir.x, dir.z);

    // 1. Support H-Beam Trestle Stanchions at both ends
    [start, end].forEach((pt) => {
      const stanchion = new THREE.Group();
      stanchion.position.set(pt.x, 0, pt.z);
      stanchion.rotation.y = angle;

      [-0.85, 0.85].forEach((sx) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, height, 0.28), m.darkChassis);
        post.position.set(sx, height / 2, 0);
        post.castShadow = true;
        stanchion.add(post);
      });

      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 0.38), m.weatheredPlating);
      crossbar.position.y = height;
      stanchion.add(crossbar);

      group.add(stanchion);
    });

    // 2. Triple Parallel Overhead Pipelines + Steel Truss Beam
    const bridgeSpan = new THREE.Group();
    bridgeSpan.position.copy(mid);
    bridgeSpan.rotation.y = angle;

    const truss = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, len), m.darkChassis);
    truss.position.y = -0.15;
    bridgeSpan.add(truss);

    // 3 parallel pipes (1 thick steam main, 1 copper pressure line, 1 dark oil line)
    const pipeConfigs: [number, number, THREE.Material][] = [
      [-0.48, 0.28, m.rustIron],
      [0.05, 0.22, m.copper],
      [0.52, 0.18, m.weatheredPlating],
    ];
    pipeConfigs.forEach(([px, rad, mat]) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, len, 12), mat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(px, rad + 0.05, 0);
      pipe.castShadow = true;
      bridgeSpan.add(pipe);
    });

    group.add(bridgeSpan);
    return group;
  }

  /**
   * 21. LARGE DISTANT FORM: Horizon Factory Complex, Blast Furnace & Arched Viaduct
   * Placed at 52m-82m around the outer valley so the player always sees intriguing
   * grand industrial landmarks in the distance in every direction!
   */
  public static createDistantFactoryComplex(
    pos: THREE.Vector3,
    rotY: number = 0,
    scale: number = 1.0
  ): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    group.scale.set(scale, scale, scale);
    const m = this.materials;

    // 1. Massive Blast Furnace & Mill Hall
    const mill = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 14), m.foundryBrick);
    mill.position.y = 7;
    group.add(mill);

    const upperMill = new THREE.Mesh(new THREE.BoxGeometry(14, 20, 10), m.darkChassis);
    upperMill.position.set(-3, 10, 0);
    group.add(upperMill);

    // 2. Twin Giant Hyperboloid Cooling Towers
    [-16, 16].forEach((tx) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 6.8, 22, 16), m.weatheredConcrete);
      tower.position.set(tx, 11, -2);
      group.add(tower);
    });

    // 3. 3 Towering 34m Smokestacks
    [-7, -2, 3].forEach((sx, idx) => {
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 34 - idx * 3, 12), m.darkChassis);
      stack.position.set(sx, 17, -4);
      group.add(stack);
    });

    // 4. Warm Distant Furnace Windows & Beacon Lights
    for (let wx = -9; wx <= 9; wx += 4.5) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 14.3), m.glowAmber);
      win.position.set(wx, 8.5, 0);
      group.add(win);
    }

    return group;
  }

  /**
   * 22. COMPANION ROBOT: VOLT-7 ("Szikra")
   * Distinctive hovering brass-and-copper spherical maintenance automaton with a glowing cyan
   * optical monocle lens, gyroscopic stabilization ring, and articulated antennae.
   */
  public static createCompanionVolt7(pos: THREE.Vector3): {
    group: THREE.Group;
    bodyGroup: THREE.Group;
    gyroRing: THREE.Mesh;
  } {
    const group = new THREE.Group();
    group.position.copy(pos);
    const m = this.materials;

    // Pedestal hover base ring on ground
    const basePad = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.78, 0.08, 16), m.diamondTread);
    basePad.position.y = 0.04;
    group.add(basePad);

    // Hovering Spherical Companion Body
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 1.25;

    const mainSphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 16), m.brass);
    mainSphere.castShadow = true;
    bodyGroup.add(mainSphere);

    // Copper equatorial chassis band
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.435, 0.435, 0.14, 18), m.copper);
    bodyGroup.add(band);

    // Expressive Large Cyan Optical Monocle Lens + Brass Bezel
    const eyeBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.12, 16), m.darkChassis);
    eyeBezel.rotation.x = Math.PI / 2;
    eyeBezel.position.set(0, 0.06, 0.38);
    bodyGroup.add(eyeBezel);

    const eyeLens = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), m.glowCyan);
    eyeLens.position.set(0, 0.06, 0.42);
    bodyGroup.add(eyeLens);

    // Top Dual Brass Ear-Antennae
    [-0.22, 0.22].forEach((ax) => {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.35, 8), m.copper);
      stalk.position.set(ax, 0.48, 0);
      stalk.rotation.z = ax > 0 ? -0.35 : 0.35;
      bodyGroup.add(stalk);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), m.glowAmber);
      tip.position.set(ax * 1.45, 0.62, 0);
      bodyGroup.add(tip);
    });

    // Gyroscopic Stabilization Ring orbiting around VOLT-7
    const gyroRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 8, 28), m.copper);
    gyroRing.rotation.x = Math.PI / 2.3;
    bodyGroup.add(gyroRing);

    group.add(bodyGroup);
    return { group, bodyGroup, gyroRing };
  }

  /**
   * 23. SIDE QUEST & HOMEWORK FIELD TERMINAL ("Mérnöki Megfigyelő & Házi Feladat Pult")
   */
  public static createSideQuestFieldTerminal(pos: THREE.Vector3, rotY: number = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = this.materials;

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 1.2), m.diamondTread);
    base.position.y = 0.08;
    group.add(base);

    const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.8, 10), m.darkChassis);
    pillarL.position.set(-0.62, 0.9, -0.2);
    group.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.8, 10), m.darkChassis);
    pillarR.position.set(0.62, 0.9, -0.2);
    group.add(pillarR);

    // Slanted Brass & Emerald Bulletin Console
    const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.95, 0.22), m.brass);
    consoleBox.position.set(0, 1.35, -0.15);
    consoleBox.rotation.x = -0.28;
    consoleBox.castShadow = true;
    group.add(consoleBox);

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.72, 0.04), screenMat);
    screen.position.set(0, 1.36, -0.03);
    screen.rotation.x = -0.28;
    group.add(screen);

    return group;
  }

  /**
   * Backward compatibility alias
   */
  public static createRobotWreck(pos: THREE.Vector3, rot: THREE.Euler, scale: number = 1.0): THREE.Group {
    return this.createTitanMechWreck(pos, rot, scale);
  }
}

