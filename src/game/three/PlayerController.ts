import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

export class PlayerController {
  public group: THREE.Group;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public radius: number = 0.6;
  public height: number = 1.7;

  // Animation parts matching the robot in the artwork
  private head: THREE.Group;
  private eyeLeft: THREE.Mesh;
  private eyeRight: THREE.Mesh;
  private eyeLight: THREE.PointLight;
  private coreLight: THREE.PointLight;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private thrusterGlow: THREE.Mesh;

  // Movement physics
  private isGrounded: boolean = true;
  private walkTime: number = 0;
  private lastStepTime: number = 0;
  private targetRotation: number = 0;

  constructor(initialPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 10)) {
    this.group = new THREE.Group();
    this.position = initialPosition.clone();
    this.velocity = new THREE.Vector3();
    this.group.position.copy(this.position);

    // Build the Steampunk / Cyberpunk Robot model matching the art style
    const { group, head, eyeLeft, eyeRight, eyeLight, coreLight, leftLeg, rightLeg, leftArm, rightArm, thrusterGlow } =
      this.createRobotMesh();

    this.head = head;
    this.eyeLeft = eyeLeft;
    this.eyeRight = eyeRight;
    this.eyeLight = eyeLight;
    this.coreLight = coreLight;
    this.leftLeg = leftLeg;
    this.rightLeg = rightLeg;
    this.leftArm = leftArm;
    this.rightArm = rightArm;
    this.thrusterGlow = thrusterGlow;

    this.group.add(group);
  }

  private createRobotMesh() {
    const robotRoot = new THREE.Group();

    // High quality PBR materials matching the artwork
    // Weathered off-white ceramic/steel plates
    const whitePlatingMat = new THREE.MeshStandardMaterial({
      color: 0xdedede,
      roughness: 0.35,
      metalness: 0.45,
    });

    // Dark industrial gunmetal chassis
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1f242b,
      roughness: 0.6,
      metalness: 0.85,
    });

    // Weathered copper and brass trim
    const copperTrimMat = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.4,
      metalness: 0.8,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc99a3d,
      roughness: 0.35,
      metalness: 0.85,
    });

    // Glowing electric-cyan lenses
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });

    // Amber power core
    const amberGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffb52e,
      emissive: 0xffb52e,
      emissiveIntensity: 2.8,
      roughness: 0.1,
    });

    // 1. Torso & Chassis
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.95;

    // Inner mechanical core cylinder
    const innerCore = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.6, 16), darkChassisMat);
    innerCore.castShadow = true;
    torsoGroup.add(innerCore);

    // Outer white armored shell with bevel
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.46, 0.42), whitePlatingMat);
    chestPlate.position.set(0, 0.04, 0);
    chestPlate.castShadow = true;
    torsoGroup.add(chestPlate);

    // Copper collar rim and waist belt
    const collarRim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 8, 20), copperTrimMat);
    collarRim.rotation.x = Math.PI / 2;
    collarRim.position.y = 0.28;
    torsoGroup.add(collarRim);

    const waistBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.08, 16), brassMat);
    waistBelt.position.y = -0.22;
    torsoGroup.add(waistBelt);

    // Glowing chest energy dial
    const chestDial = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), amberGlowMat);
    chestDial.rotation.x = Math.PI / 2;
    chestDial.position.set(0, 0.08, 0.22);
    torsoGroup.add(chestDial);

    const coreLight = new THREE.PointLight(0xffb52e, 1.4, 3.5);
    coreLight.position.set(0, 0.08, 0.4);
    torsoGroup.add(coreLight);

    // Backpack Energy Unit with twin brass canisters
    const backpack = new THREE.Group();
    backpack.position.set(0, 0.05, -0.25);

    const packBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.16), darkChassisMat);
    packBox.castShadow = true;
    backpack.add(packBox);

    const canL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.42, 12), copperTrimMat);
    canL.position.set(-0.1, 0.02, -0.06);
    backpack.add(canL);

    const canR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.42, 12), copperTrimMat);
    canR.position.set(0.1, 0.02, -0.06);
    backpack.add(canR);

    // Thruster exhaust at bottom of backpack
    const thrusterGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.08, 12), cyanGlowMat);
    thrusterGlow.position.set(0, -0.22, -0.05);
    backpack.add(thrusterGlow);

    torsoGroup.add(backpack);
    robotRoot.add(torsoGroup);

    // 2. Head (Rounded dome head with large expressive ocular lenses)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.42, 0);

    // Rounded head base
    const headDome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), whitePlatingMat);
    headDome.scale.set(1.1, 0.95, 1.05);
    headDome.castShadow = true;
    headGroup.add(headDome);

    // Brass ear nodes
    const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), brassMat);
    earL.rotation.z = Math.PI / 2;
    earL.position.set(-0.29, 0, 0);
    headGroup.add(earL);

    const earR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), brassMat);
    earR.rotation.z = Math.PI / 2;
    earR.position.set(0.29, 0, 0);
    headGroup.add(earR);

    // Small science antenna
    const antPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.24, 8), copperTrimMat);
    antPole.position.set(0.12, 0.3, -0.05);
    headGroup.add(antPole);

    const antTip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), cyanGlowMat);
    antTip.position.set(0.12, 0.42, -0.05);
    headGroup.add(antTip);

    // Dark visor mask plate
    const visorMask = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.06), darkChassisMat);
    visorMask.position.set(0, 0.02, 0.22);
    headGroup.add(visorMask);

    // Twin glowing circular cyan ocular eyes
    const eyeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16);
    const eyeLeft = new THREE.Mesh(eyeGeo, cyanGlowMat);
    eyeLeft.rotation.x = Math.PI / 2;
    eyeLeft.position.set(-0.09, 0.02, 0.25);
    headGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, cyanGlowMat);
    eyeRight.rotation.x = Math.PI / 2;
    eyeRight.position.set(0.09, 0.02, 0.25);
    headGroup.add(eyeRight);

    const eyeLight = new THREE.PointLight(0x22d3ee, 1.8, 5.0);
    eyeLight.position.set(0, 0.02, 0.45);
    headGroup.add(eyeLight);

    robotRoot.add(headGroup);

    // 3. Articulated Arms
    const createArm = (isLeft: boolean) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(isLeft ? -0.34 : 0.34, 1.15, 0);

      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), brassMat);
      armGroup.add(shoulder);

      // Upper arm with white shell
      const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.32, 10), whitePlatingMat);
      bicep.position.y = -0.16;
      bicep.castShadow = true;
      armGroup.add(bicep);

      // Elbow joint
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), copperTrimMat);
      elbow.position.y = -0.32;
      armGroup.add(elbow);

      // Forearm & Hand Tool
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.28, 10), darkChassisMat);
      forearm.position.y = -0.46;
      forearm.castShadow = true;
      armGroup.add(forearm);

      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), copperTrimMat);
      hand.position.y = -0.62;
      armGroup.add(hand);

      return armGroup;
    };

    const leftArm = createArm(true);
    const rightArm = createArm(false);
    robotRoot.add(leftArm);
    robotRoot.add(rightArm);

    // 4. Articulated Legs & Feet
    const createLeg = (isLeft: boolean) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(isLeft ? -0.16 : 0.16, 0.68, 0);

      const hip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), brassMat);
      legGroup.add(hip);

      // Thigh with white plating
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.36, 12), whitePlatingMat);
      thigh.position.y = -0.18;
      thigh.castShadow = true;
      legGroup.add(thigh);

      // Knee piston
      const knee = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), copperTrimMat);
      knee.rotation.z = Math.PI / 2;
      knee.position.y = -0.36;
      legGroup.add(knee);

      // Shin
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.34, 10), darkChassisMat);
      shin.position.y = -0.53;
      shin.castShadow = true;
      legGroup.add(shin);

      // Sturdy robotic foot with rubberised tread
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.24), whitePlatingMat);
      foot.position.set(0, -0.68, 0.05);
      foot.castShadow = true;
      legGroup.add(foot);

      return legGroup;
    };

    const leftLeg = createLeg(true);
    const rightLeg = createLeg(false);
    robotRoot.add(leftLeg);
    robotRoot.add(rightLeg);

    return {
      group: robotRoot,
      head: headGroup,
      eyeLeft,
      eyeRight,
      eyeLight,
      coreLight,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      thrusterGlow,
    };
  }

  public update(
    delta: number,
    input: PlayerInput,
    cameraAngle: number,
    colliders: THREE.Box3[]
  ) {
    const moveSpeed = input.sprint ? 9.5 : 5.8;
    const gravity = -22;
    const jumpStrength = 8.5;

    // Movement calculation
    const moveDir = new THREE.Vector3();
    if (input.forward) moveDir.z -= 1;
    if (input.backward) moveDir.z += 1;
    if (input.left) moveDir.x -= 1;
    if (input.right) moveDir.x += 1;

    const isMoving = moveDir.lengthSq() > 0.01;

    if (isMoving) {
      moveDir.normalize();
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngle);

      this.velocity.x = moveDir.x * moveSpeed;
      this.velocity.z = moveDir.z * moveSpeed;
      this.targetRotation = Math.atan2(moveDir.x, moveDir.z);

      // Articulated walk cycle
      this.walkTime += delta * (input.sprint ? 14 : 9);
      const legSwing = Math.sin(this.walkTime) * 0.45;
      const armSwing = Math.cos(this.walkTime) * 0.45;

      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
      this.leftArm.rotation.x = -armSwing;
      this.rightArm.rotation.x = armSwing;

      // Subtle chassis bounce
      this.group.children[0].position.y = Math.abs(Math.sin(this.walkTime * 2)) * 0.04;

      // Footstep audio cadence
      const now = performance.now();
      if (now - this.lastStepTime > (input.sprint ? 240 : 360)) {
        soundManager.playFootstep();
        this.lastStepTime = now;
      }

      // Thruster flare when sprinting
      if (input.sprint) {
        this.thrusterGlow.scale.set(1.5, 1.8, 1.5);
      } else {
        this.thrusterGlow.scale.set(1, 1, 1);
      }
    } else {
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;

      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      this.leftArm.rotation.x *= 0.8;
      this.rightArm.rotation.x *= 0.8;
      this.group.children[0].position.y = Math.sin(performance.now() * 0.003) * 0.02;
      this.thrusterGlow.scale.set(0.8, 0.8, 0.8);
    }

    // Smooth rotation towards travel direction
    let diff = this.targetRotation - this.group.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.group.rotation.y += diff * Math.min(1, delta * 12);

    // Expressive head micro-tilt and eye pulse
    this.head.rotation.y = Math.sin(performance.now() * 0.002) * 0.08;
    this.eyeLight.intensity = 1.6 + Math.sin(performance.now() * 0.006) * 0.3;

    // Jump & Gravity
    if (input.jump && this.isGrounded) {
      this.velocity.y = jumpStrength;
      this.isGrounded = false;
    }

    this.velocity.y += gravity * delta;

    // Collision detection & movement
    const nextPos = this.position.clone();
    nextPos.x += this.velocity.x * delta;
    nextPos.z += this.velocity.z * delta;
    nextPos.y += this.velocity.y * delta;

    const playerAABB = new THREE.Box3();
    const halfWidth = this.radius;

    // X collision
    playerAABB.min.set(nextPos.x - halfWidth, this.position.y + 0.1, this.position.z - halfWidth);
    playerAABB.max.set(nextPos.x + halfWidth, this.position.y + this.height, this.position.z + halfWidth);
    let collideX = false;
    for (const box of colliders) {
      if (playerAABB.intersectsBox(box)) {
        collideX = true;
        break;
      }
    }
    if (!collideX) this.position.x = nextPos.x;
    else this.velocity.x = 0;

    // Z collision
    playerAABB.min.set(this.position.x - halfWidth, this.position.y + 0.1, nextPos.z - halfWidth);
    playerAABB.max.set(this.position.x + halfWidth, this.position.y + this.height, nextPos.z + halfWidth);
    let collideZ = false;
    for (const box of colliders) {
      if (playerAABB.intersectsBox(box)) {
        collideZ = true;
        break;
      }
    }
    if (!collideZ) this.position.z = nextPos.z;
    else this.velocity.z = 0;

    // Y floor collision
    const floorY = 0;
    if (nextPos.y <= floorY) {
      this.position.y = floorY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = nextPos.y;
    }

    this.group.position.copy(this.position);
  }

  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public getLookAtPoint(): THREE.Vector3 {
    return new THREE.Vector3(this.position.x, this.position.y + 1.1, this.position.z);
  }

  public getHeadingAngle(): number {
    return this.group.rotation.y;
  }
}
