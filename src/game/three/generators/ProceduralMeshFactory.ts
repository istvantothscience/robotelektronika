import * as THREE from 'three';

export class ProceduralMeshFactory {
  // Shared materials cache to optimize WebGL draw calls
  private static materials = {
    darkChassis: new THREE.MeshStandardMaterial({ color: 0x1f242b, roughness: 0.65, metalness: 0.85 }),
    weatheredPlating: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.45, metalness: 0.6 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.35, metalness: 0.9 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc99a3d, roughness: 0.3, metalness: 0.9 }),
    rustIron: new THREE.MeshStandardMaterial({ color: 0x5a3825, roughness: 0.85, metalness: 0.5 }),
    hazardYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.4 }),
    ceramicInsulator: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2, metalness: 0.3 }),
    glowCyan: new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 3.2, roughness: 0.1 }),
    glowAmber: new THREE.MeshStandardMaterial({ color: 0xffb52e, emissive: 0xffb52e, emissiveIntensity: 3.0, roughness: 0.1 }),
    glowViolet: new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 3.5, roughness: 0.1 }),
  };

  /**
   * 1. Complex Articulated Robot Wreck
   * Multi-part mesh featuring rib cages, severed cables, cracked visor, and joint pistons.
   */
  public static createRobotWreck(pos: THREE.Vector3, rot: THREE.Euler, scale: number = 1.0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.copy(rot);
    group.scale.set(scale, scale, scale);

    const m = this.materials;

    // Torso Chassis (Ribbed industrial container)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.45), m.darkChassis);
    torso.castShadow = true;
    group.add(torso);

    // Front armor plate with weathering
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.45, 0.08), m.weatheredPlating);
    chestPlate.position.set(0, 0.02, 0.23);
    chestPlate.castShadow = true;
    group.add(chestPlate);

    // Cracked energy core in chest (pulsing dim ember)
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), m.glowAmber);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.04, 0.26);
    group.add(core);

    // Neck ring & Tilted Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12), m.copper);
    neck.position.set(0.1, 0.32, 0);
    neck.rotation.z = -0.3;
    group.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 12), m.weatheredPlating);
    head.position.set(0.18, 0.52, 0.04);
    head.rotation.set(0.2, -0.4, 0.4);
    head.castShadow = true;
    group.add(head);

    // Cracked optical eye lens
    const eyeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), m.glowCyan);
    eyeLens.rotation.x = Math.PI / 2;
    eyeLens.position.set(0.24, 0.56, 0.24);
    group.add(eyeLens);

    // Severed arm with exposed copper wire bundle
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.65, 8), m.rustIron);
    arm.position.set(-0.55, -0.05, 0.2);
    arm.rotation.set(0.4, 0.2, 1.4);
    arm.castShadow = true;
    group.add(arm);

    // Dislodged wiring conduits trailing out
    for (let w = 0; w < 3; w++) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), m.copper);
      wire.position.set(-0.35 + w * 0.05, -0.22, 0.15);
      wire.rotation.set(0.6 + w * 0.2, 0.1, 1.8 + w * 0.3);
      group.add(wire);
    }

    return group;
  }

  /**
   * 2. Multi-Stage High-Voltage Tesla Generator
   * Cast iron stepped pedestal, primary toroidal coil, tall secondary solenoid, and toroidal capacitor.
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
    const sparkSphere = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), m.glowViolet);
    sparkSphere.position.y = 1.2 + coilHeight + 0.25;
    group.add(sparkSphere);

    const sparkLight = new THREE.PointLight(0x8b5cf6, 2.5, 9);
    sparkLight.position.y = 1.2 + coilHeight + 0.3;
    group.add(sparkLight);

    return group;
  }

  /**
   * 3. Industrial High-Voltage Transformer Substation
   * Cooling fins, ceramic high-voltage bushings, round pressure gauge, and caution plaque.
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
   * 4. Overhead Industrial Truss / Gantry Crane Arch
   * Massive I-beam steel truss spanning above walkways with rivets and hanging suspension cables.
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
    magnetHoist.castShadow = true;
    group.add(magnetHoist);

    const hoistLight = new THREE.PointLight(0xffb52e, 1.8, 6);
    hoistLight.position.set(0, height - 2.6, 0);
    group.add(hoistLight);

    return group;
  }

  /**
   * 5. Volumetric Industrial Steam Pipe with Brass Valve & Pressure Gauge
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
}
