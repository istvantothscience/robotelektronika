import * as THREE from 'three';
import { ProceduralMeshFactory } from '../generators/ProceduralMeshFactory';

/**
 * Modular Environmental Storytelling Landmarks for the STEMPUNK Underworld.
 * Constructs recognizable architectural landmarks and storytelling vignettes:
 * 1. Monumental Sealed Sector Gate at the Northern Elevator Citadel
 * 2. Collapsed Factory Viaduct Bridge with sheared girders & hanging cables
 * 3. Abandoned Automaton Repair Station with suspended chassis & missing components
 * 4. Grounded Power Cable & Copper Conduit Trench Network connecting generators to the Outpost
 */
export class EnvironmentalStoryLandmarks {
  /**
   * 1. MONUMENTAL SEALED SECTOR GATE (Northern Elevator Approach, z = -30.5)
   * Towering gunmetal-and-brass industrial archway with heavy hydraulic locking rams,
   * oxidized verdigris copper manifolds, and failing amber/cyan indicator lamps.
   */
  public static createMonumentalSectorGate(pos: THREE.Vector3): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    const m = ProceduralMeshFactory.materials;

    // Left & Right Colossal Riveted Gate Pylons
    [-6.2, 6.2].forEach((px) => {
      const pylonBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 3.2), m.foundryBrick);
      pylonBase.position.set(px, 1.6, 0);
      pylonBase.castShadow = true;
      pylonBase.receiveShadow = true;
      group.add(pylonBase);

      const pylonShaft = new THREE.Mesh(new THREE.BoxGeometry(2.2, 9.5, 2.4), m.darkChassis);
      pylonShaft.position.set(px, 7.8, 0);
      pylonShaft.castShadow = true;
      pylonShaft.receiveShadow = true;
      group.add(pylonShaft);

      // Oxidized Verdigris Copper Pressure Manifolds on Pylons
      const manifold = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 7.5, 10), m.verdigrisCopper);
      manifold.position.set(px + (px < 0 ? 1.25 : -1.25), 6.2, 0.6);
      group.add(manifold);

      // Dirty Hazard Yellow Bumper Blocks at Pylon Foot
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.65, 3.3), m.hazardYellow);
      bumper.position.set(px, 0.35, 0);
      group.add(bumper);

      // Hydraulic Locking Rams extending inward
      const ramCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 10), m.brass);
      ramCylinder.rotation.z = Math.PI / 2;
      ramCylinder.position.set(px + (px < 0 ? 1.6 : -1.6), 4.8, 0);
      group.add(ramCylinder);
    });

    // Overhead Monumental Arch Lintel Beam
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(15.6, 2.2, 2.8), m.weatheredPlating);
    lintel.position.set(0, 12.6, 0);
    lintel.castShadow = true;
    group.add(lintel);

    const brassCrest = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.35, 3.0), m.brass);
    brassCrest.position.set(0, 13.8, 0);
    group.add(brassCrest);

    // Status Indicator Lamps along the Gate Lintel (2 failing amber, 1 active cyan)
    [-3.2, 0, 3.2].forEach((lx, idx) => {
      const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.3, 12), m.darkChassis);
      housing.rotation.x = Math.PI / 2;
      housing.position.set(lx, 12.6, 1.45);
      group.add(housing);

      const lens = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 10, 10),
        idx === 1 ? m.glowCyan : m.glowAmber
      );
      lens.position.set(lx, 12.6, 1.55);
      group.add(lens);
    });

    return group;
  }

  /**
   * 2. COLLAPSED INDUSTRIAL BRIDGE / VIADUCT RUIN
   * Fractured steel-and-concrete overpass with sheared I-beam girders, tilted deck slabs,
   * and hanging rubber-sheathed cables.
   */
  public static createCollapsedIndustrialBridge(pos: THREE.Vector3, rotY: number = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = ProceduralMeshFactory.materials;

    // Two Weathered Concrete Bridge Piers
    [-8.5, 8.5].forEach((px) => {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(2.8, 8.5, 3.6), m.weatheredConcrete);
      pier.position.set(px, 4.25, 0);
      pier.castShadow = true;
      pier.receiveShadow = true;
      group.add(pier);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.8, 4.0), m.darkChassis);
      cap.position.set(px, 8.6, 0);
      group.add(cap);
    });

    // Left Sloping Fractured Deck Span (collapsed inward toward center)
    const leftDeck = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.75, 3.4), m.rustIron);
    leftDeck.position.set(-4.8, 6.2, 0);
    leftDeck.rotation.z = -0.46;
    leftDeck.castShadow = true;
    group.add(leftDeck);

    // Right Sloping Fractured Deck Span
    const rightDeck = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.75, 3.4), m.rustIron);
    rightDeck.position.set(5.0, 6.4, 0);
    rightDeck.rotation.z = 0.42;
    rightDeck.castShadow = true;
    group.add(rightDeck);

    // Sheared Steel Truss Side Girders & Oxidized Copper Pipes
    [-1.5, 1.5].forEach((gz) => {
      const girderL = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.45, 0.25), m.darkChassis);
      girderL.position.set(-4.8, 6.8, gz);
      girderL.rotation.z = -0.46;
      group.add(girderL);

      const girderR = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.45, 0.25), m.darkChassis);
      girderR.position.set(5.0, 7.0, gz);
      girderR.rotation.z = 0.42;
      group.add(girderR);
    });

    // Dangling Heavy Rubber Cables hanging from the fractured bridge gap
    for (let c = -1.0; c <= 1.0; c += 0.65) {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 8), m.rubberCable);
      cable.position.set(c * 1.4, 3.2, c * 0.5);
      cable.rotation.z = c * 0.18;
      group.add(cable);
    }

    // Fallen Concrete & Steel Rubble at the center collapse point
    const rubble = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), m.weatheredConcrete);
    rubble.position.set(0, 0.7, 0);
    rubble.scale.set(1.6, 0.65, 1.2);
    rubble.receiveShadow = true;
    group.add(rubble);

    return group;
  }

  /**
   * 3. ABANDONED AUTOMATON REPAIR STATION (Field Maintenance Gantry, [-19, 0, -19])
   * Tells the environmental story of damaged robots and missing components.
   */
  public static createAbandonedRepairBay(pos: THREE.Vector3, rotY: number = 0): THREE.Group {
    const group = new THREE.Group();
    group.position.copy(pos);
    group.rotation.y = rotY;
    const m = ProceduralMeshFactory.materials;

    // Steel Platform Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.24, 4.4), m.diamondTread);
    deck.position.y = 0.12;
    deck.receiveShadow = true;
    group.add(deck);

    // Overhead A-Frame Maintenance Hoist Gantry
    [-2.3, 2.3].forEach((gx) => {
      const legF = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 4.4, 8), m.darkChassis);
      legF.position.set(gx, 2.1, 1.2);
      legF.rotation.x = -0.18;
      legF.castShadow = true;
      group.add(legF);

      const legB = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 4.4, 8), m.darkChassis);
      legB.position.set(gx, 2.1, -1.2);
      legB.rotation.x = 0.18;
      legB.castShadow = true;
      group.add(legB);
    });

    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.28, 0.32), m.hazardYellow);
    crossbar.position.set(0, 4.15, 0);
    crossbar.castShadow = true;
    group.add(crossbar);

    // Hoist Chain & Suspended Half-Assembled Automaton Chassis
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), m.darkChassis);
    chain.position.set(-0.6, 3.4, 0);
    group.add(chain);

    const suspendedTorso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.82, 0.48), m.weatheredPlating);
    suspendedTorso.position.set(-0.6, 2.4, 0);
    suspendedTorso.rotation.y = 0.35;
    suspendedTorso.rotation.z = -0.14;
    suspendedTorso.castShadow = true;
    group.add(suspendedTorso);

    const openCore = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 16), m.brass);
    openCore.position.set(-0.6, 2.45, 0.25);
    group.add(openCore);

    // Side Tool Table with Oxidized Copper Coils & Failing Diagnostic Lamp
    const toolBench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.1), m.rustIron);
    toolBench.position.set(1.4, 0.55, -0.8);
    toolBench.castShadow = true;
    group.add(toolBench);

    const spareCoil = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 8, 16), m.verdigrisCopper);
    spareCoil.rotation.x = Math.PI / 2;
    spareCoil.position.set(1.2, 1.06, -0.75);
    group.add(spareCoil);

    const holoProjector = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.15, 12), m.glowCyan);
    holoProjector.position.set(1.75, 1.08, -0.8);
    group.add(holoProjector);

    return group;
  }

  /**
   * 4. GROUND POWER CABLE & CONDUIT NETWORK
   * Heavy rubber-insulated cable bundles and oxidized copper conduits snaking along the ground
   * between the East Substation, West Steam Engines, Central Outpost, and Northern Gate.
   */
  public static createGroundCableNetwork(): THREE.Group {
    const group = new THREE.Group();
    const m = ProceduralMeshFactory.materials;

    const cableRoutes: [THREE.Vector3, THREE.Vector3, 'rubber' | 'copper'][] = [
      // From East High-Voltage Substation to Central Research Outpost
      [new THREE.Vector3(12.0, 0.06, -4.5), new THREE.Vector3(2.2, 0.06, -15.5), 'rubber'],
      [new THREE.Vector3(11.6, 0.05, -4.8), new THREE.Vector3(1.8, 0.05, -15.8), 'copper'],
      // From West Steam Yard to Central Research Outpost
      [new THREE.Vector3(-14.5, 0.06, -3.0), new THREE.Vector3(-2.2, 0.06, -15.5), 'rubber'],
      [new THREE.Vector3(-14.1, 0.05, -3.4), new THREE.Vector3(-1.8, 0.05, -15.8), 'copper'],
      // From Central Research Outpost to Northern Sector Gate
      [new THREE.Vector3(-0.6, 0.06, -17.0), new THREE.Vector3(-1.5, 0.06, -30.5), 'rubber'],
      [new THREE.Vector3(0.6, 0.06, -17.0), new THREE.Vector3(1.5, 0.06, -30.5), 'copper'],
    ];

    cableRoutes.forEach(([start, end, kind]) => {
      const dist = start.distanceTo(end);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      const conduit = new THREE.Mesh(
        new THREE.CylinderGeometry(
          kind === 'rubber' ? 0.09 : 0.065,
          kind === 'rubber' ? 0.09 : 0.065,
          dist,
          8
        ),
        kind === 'rubber' ? m.rubberCable : m.verdigrisCopper
      );
      conduit.position.copy(mid);
      conduit.lookAt(end);
      conduit.rotateX(Math.PI / 2);
      conduit.receiveShadow = true;
      group.add(conduit);

      // Brass clamping brackets every 4.5m along the ground cable
      const clampCount = Math.floor(dist / 4.5);
      for (let i = 1; i < clampCount; i++) {
        const p = new THREE.Vector3().lerpVectors(start, end, i / clampCount);
        const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.22), m.brass);
        clamp.position.copy(p);
        clamp.lookAt(end);
        group.add(clamp);
      }
    });

    return group;
  }
}
