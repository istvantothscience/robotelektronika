import * as THREE from 'three';

interface PipeSteamVent {
  points: THREE.Points;
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  maxDistance: number;
  speed: number;
}

interface IntermittentSparkNode {
  points: THREE.Points;
  light: THREE.PointLight;
  origin: THREE.Vector3;
  velocities: Float32Array;
  timer: number;
  interval: number;
  burstDuration: number;
}

/**
 * Modular, Frame-Rate-Independent Localized Steam Vents & Intermittent Electrical Sparks.
 * - Steam rises from specific boiler valves and pipe bridge joints, expanding and fading.
 * - Electrical sparks trigger briefly and locally at damaged equipment (not constant everywhere).
 */
export class LocalizedSteamAndSparks {
  public group: THREE.Group;
  private steamVents: PipeSteamVent[] = [];
  private sparkNodes: IntermittentSparkNode[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.buildPipeSteamVents();
    this.buildIntermittentSparks();
  }

  private buildPipeSteamVents() {
    const ventLocations: { pos: [number, number, number]; dir: [number, number, number] }[] = [
      { pos: [-7.5, 2.6, -9.0], dir: [0.25, 1.0, 0.1] },   // West Boiler Valve
      { pos: [8.0, 2.6, 3.0], dir: [-0.2, 1.0, 0.15] },    // East Boiler Valve
      { pos: [-15.0, 3.1, -3.0], dir: [0.15, 1.0, -0.1] }, // West Steam Engine Exhaust
      { pos: [16.0, 3.1, 8.0], dir: [-0.15, 1.0, 0.1] },   // East Steam Engine Exhaust
      { pos: [-10.5, 5.4, -9.5], dir: [0.3, 0.85, 0.0] },  // Overhead Pipe Bridge Joint
      { pos: [11.5, 5.4, -15.0], dir: [-0.3, 0.85, 0.0] }, // Substation Pipe Bridge Joint
    ];

    ventLocations.forEach(({ pos, dir }) => {
      const count = 24;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const origin = new THREE.Vector3(...pos);
      const direction = new THREE.Vector3(...dir).normalize();

      for (let i = 0; i < count; i++) {
        const t = i / count;
        const d = t * 3.8;
        positions[i * 3] = origin.x + direction.x * d + (Math.random() - 0.5) * t * 0.9;
        positions[i * 3 + 1] = origin.y + direction.y * d;
        positions[i * 3 + 2] = origin.z + direction.z * d + (Math.random() - 0.5) * t * 0.9;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: 0xd6cfc7,
        size: 0.45,
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geo, mat);
      this.group.add(points);

      this.steamVents.push({
        points,
        origin,
        direction,
        maxDistance: 3.8,
        speed: 1.8 + Math.random() * 0.5,
      });
    });
  }

  private buildIntermittentSparks() {
    const sparkOrigins: [number, number, number, number][] = [
      [-11.0, 1.1, 5.0, 3.4],    // Damaged Titan Automaton Wreck #04
      [-18.4, 2.3, -19.0, 4.2],  // Abandoned Automaton Repair Bay Chassis
      [18.2, 2.1, -5.5, 5.1],    // East High-Voltage Transformer Junction Box
      [-4.8, 5.6, -28.0, 4.7],   // Collapsed Viaduct Sheared Cable
    ];

    sparkOrigins.forEach(([x, y, z, interval]) => {
      const count = 18;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3);
      const origin = new THREE.Vector3(x, y, z);

      for (let i = 0; i < count; i++) {
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        velocities[i * 3] = (Math.random() - 0.5) * 3.6;
        velocities[i * 3 + 1] = 1.2 + Math.random() * 2.8;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 3.6;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.22,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      points.visible = false;
      this.group.add(points);

      const light = new THREE.PointLight(0x38bdf8, 0, 6.5);
      light.position.copy(origin);
      this.group.add(light);

      this.sparkNodes.push({
        points,
        light,
        origin,
        velocities,
        timer: Math.random() * interval,
        interval,
        burstDuration: 0.32,
      });
    });
  }

  public update(delta: number) {
    if (!this.group.visible) return;

    // 1. Update Localized Pipe Steam Jets
    this.steamVents.forEach((vent) => {
      const posAttr = vent.points.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let px = posAttr.getX(i) + vent.direction.x * delta * vent.speed;
        let py = posAttr.getY(i) + vent.direction.y * delta * vent.speed;
        let pz = posAttr.getZ(i) + vent.direction.z * delta * vent.speed;

        const dist = Math.hypot(px - vent.origin.x, py - vent.origin.y, pz - vent.origin.z);
        if (dist > vent.maxDistance) {
          px = vent.origin.x + (Math.random() - 0.5) * 0.15;
          py = vent.origin.y;
          pz = vent.origin.z + (Math.random() - 0.5) * 0.15;
        } else {
          const spread = (dist / vent.maxDistance) * 0.65 * delta;
          px += (Math.random() - 0.5) * spread;
          pz += (Math.random() - 0.5) * spread;
        }
        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;
    });

    // 2. Update Brief, Localized Electrical Spark Bursts
    this.sparkNodes.forEach((node) => {
      node.timer += delta;
      if (node.timer >= node.interval) {
        const burstElapsed = node.timer - node.interval;
        if (burstElapsed <= node.burstDuration) {
          node.points.visible = true;
          node.light.intensity = (1.0 - burstElapsed / node.burstDuration) * 2.6;

          const posAttr = node.points.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let i = 0; i < posAttr.count; i++) {
            const vx = node.velocities[i * 3];
            const vy = node.velocities[i * 3 + 1] - 9.8 * burstElapsed;
            const vz = node.velocities[i * 3 + 2];
            posAttr.setXYZ(
              i,
              node.origin.x + vx * burstElapsed,
              node.origin.y + vy * burstElapsed,
              node.origin.z + vz * burstElapsed
            );
          }
          posAttr.needsUpdate = true;
        } else {
          // Reset burst
          node.points.visible = false;
          node.light.intensity = 0;
          node.timer = 0;
        }
      }
    });
  }
}
