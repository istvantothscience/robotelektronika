import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';
import { ProceduralMeshFactory } from './generators/ProceduralMeshFactory';

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
  public height: number = 1.75;

  // Multi-jointed Hierarchical Skeleton Parts
  private robotRoot!: THREE.Group;
  private pelvis!: THREE.Group;
  private torso!: THREE.Group;
  private head!: THREE.Group;
  private antenna!: THREE.Group;
  private eyeLeft!: THREE.Group;
  private eyeRight!: THREE.Group;
  private eyeLight!: THREE.PointLight;
  private chestGear!: THREE.Group;
  private backpackGear!: THREE.Group;
  private thrusterGlow!: THREE.Group;

  // 3-Segment Articulated Arms (Shoulder -> Elbow/Forearm -> Wrist/Hand)
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftForearm!: THREE.Group;
  private rightForearm!: THREE.Group;
  private leftHand!: THREE.Group;
  private rightHand!: THREE.Group;

  // 3-Segment Articulated Legs (Hip/Thigh -> Knee/Shin -> Ankle/Foot)
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private leftShin!: THREE.Group;
  private rightShin!: THREE.Group;
  private leftFoot!: THREE.Group;
  private rightFoot!: THREE.Group;

  // Modular 3D Character Upgrade Attachments (Visible Character Evolution)
  private chargeScannerGroup!: THREE.Group;
  private multitoolGroup!: THREE.Group;
  private energyModuleGroup!: THREE.Group;
  private companionDroneGroup!: THREE.Group;
  private contactShadowMesh!: THREE.Mesh;
  private speedMultiplier: number = 1.0;

  // Movement & Animation Physics State
  private isGrounded: boolean = true;
  private walkTime: number = 0;
  private lastStepTime: number = 0;
  private targetRotation: number = 0;
  private turnVelocity: number = 0;
  private blinkTimer: number = 0;
  public lastCollidedWithObstacle: boolean = false;

  constructor(initialPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 11)) {
    this.group = new THREE.Group();
    this.position = initialPosition.clone();
    this.velocity = new THREE.Vector3();
    this.group.position.copy(this.position);

    this.createRobotMesh();
  }

  /**
   * Constructs a realistic, multi-articulated Steampunk Automaton Explorer
   * with independent pelvis, spine/torso, 3-segment legs (hip, knee, ankle),
   * 3-segment arms (shoulder, elbow, 3-fingered mechanical hand), internal spinning
   * clockwork gears, hydraulic pistons, and optical camera lenses.
   */
  private createRobotMesh() {
    this.robotRoot = new THREE.Group();

    const whiteHullMat = ProceduralMeshFactory.materials.whiteArmoredHull;
    const darkChassisMat = ProceduralMeshFactory.materials.darkChassis;
    const copperMat = ProceduralMeshFactory.materials.copper;
    const brassMat = ProceduralMeshFactory.materials.brass;
    const bronzeMat = ProceduralMeshFactory.materials.weatheredPlating;
    const chromeMat = ProceduralMeshFactory.materials.chromePiston;
    const cyanGlowMat = ProceduralMeshFactory.materials.glowCyan;
    const amberGlowMat = ProceduralMeshFactory.materials.glowAmber;

    // =========================================================================
    // 1. PELVIS & HYDRAULIC WAIST DIFFERENTIAL (y = 0.72)
    // =========================================================================
    this.pelvis = new THREE.Group();
    this.pelvis.position.set(0, 0.72, 0);

    const pelvisBlock = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.28), darkChassisMat);
    pelvisBlock.castShadow = true;
    this.pelvis.add(pelvisBlock);

    // Brass bevel hip belt & side hip armor tassets
    const hipBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.09, 16), brassMat);
    hipBelt.position.y = 0.05;
    this.pelvis.add(hipBelt);

    [-0.22, 0.22].forEach(( sideX ) => {
      const tasset = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.24), bronzeMat);
      tasset.position.set(sideX, -0.02, 0);
      tasset.rotation.z = sideX > 0 ? -0.18 : 0.18;
      this.pelvis.add(tasset);
    });

    this.robotRoot.add(this.pelvis);

    // =========================================================================
    // 2. ARTICULATED TORSO, CHEST ARC-FURNACE & CLOCKWORK BACKPACK
    // =========================================================================
    this.torso = new THREE.Group();
    this.torso.position.set(0, 0.12, 0); // Relative to pelvis

    // Spinal column & waist hydraulic pistons
    const spineCore = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.48, 14), darkChassisMat);
    spineCore.position.y = 0.2;
    this.torso.add(spineCore);

    [-0.12, 0.12].forEach((px) => {
      const abdominalPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.26, 8), chromeMat);
      abdominalPiston.position.set(px, 0.1, 0.1);
      this.torso.add(abdominalPiston);
    });

    // Layered Steampunk Breastplate (Upper chest armor + bronze side ribs)
    const chestArmor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.38, 0.34), whiteHullMat);
    chestArmor.position.set(0, 0.28, 0.02);
    chestArmor.castShadow = true;
    this.torso.add(chestArmor);

    const chestTrim = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.36), brassMat);
    chestTrim.position.set(0, 0.44, 0.02);
    this.torso.add(chestTrim);

    // Collar ring & shoulder yoke
    const collarYoke = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 18), copperMat);
    collarYoke.rotation.x = Math.PI / 2;
    collarYoke.position.set(0, 0.48, 0);
    this.torso.add(collarYoke);

    // Chest Arc-Furnace Window with internal spinning toothed brass gear!
    const coreBezel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 20), brassMat);
    coreBezel.position.set(0, 0.28, 0.2);
    this.torso.add(coreBezel);

    const coreBackGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 16), amberGlowMat);
    coreBackGlow.rotation.x = Math.PI / 2;
    coreBackGlow.position.set(0, 0.28, 0.19);
    this.torso.add(coreBackGlow);

    this.chestGear = ProceduralMeshFactory.createTrueToothedGear(0.09, 0.025, 10, 'brass', 4);
    this.chestGear.position.set(0, 0.28, 0.21);
    this.torso.add(this.chestGear);

    // Steampunk Boiler & Clockwork Backpack
    const backpack = new THREE.Group();
    backpack.position.set(0, 0.26, -0.22);

    const packHousing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.16), darkChassisMat);
    packHousing.castShadow = true;
    backpack.add(packHousing);

    // Twin Riveted Copper Pressure Cylinders on left & right of backpack
    [-0.14, 0.14].forEach((cx) => {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.4, 12), copperMat);
      tank.position.set(cx, 0.02, -0.05);
      tank.castShadow = true;
      backpack.add(tank);

      [-0.12, 0.12].forEach((by) => {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.012, 6, 14), brassMat);
        band.rotation.x = Math.PI / 2;
        band.position.set(cx, 0.02 + by, -0.05);
        backpack.add(band);
      });

      const domeCap = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), brassMat);
      domeCap.position.set(cx, 0.22, -0.05);
      backpack.add(domeCap);
    });

    // External Spinning Toothed Clockwork Flywheel on rear of backpack!
    this.backpackGear = ProceduralMeshFactory.createTrueToothedGear(0.15, 0.03, 14, 'brass', 5);
    this.backpackGear.position.set(0, 0.04, -0.1);
    backpack.add(this.backpackGear);

    // Dual Thruster Nozzles at bottom of backpack
    this.thrusterGlow = new THREE.Group();
    this.thrusterGlow.position.set(0, -0.2, -0.05);
    [-0.09, 0.09].forEach((tx) => {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.07, 10), brassMat);
      nozzle.position.set(tx, 0.03, 0);
      this.thrusterGlow.add(nozzle);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 10), cyanGlowMat);
      flame.rotation.x = Math.PI;
      flame.position.set(tx, -0.05, 0);
      this.thrusterGlow.add(flame);
    });
    backpack.add(this.thrusterGlow);

    this.torso.add(backpack);
    this.pelvis.add(this.torso);

    // =========================================================================
    // 3. EXPRESSIVE STEAMPUNK AUTOMATON HEAD & OPTICAL LENSES
    // =========================================================================
    this.head = new THREE.Group();
    this.head.position.set(0, 0.56, 0.02); // Relative to torso

    // Articulated brass neck column & dual chrome gimbal rods
    const neckJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 12), brassMat);
    neckJoint.position.y = -0.04;
    this.head.add(neckJoint);

    // Sculpted Automaton Cranium Dome + Beveled Jawplate
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), whiteHullMat);
    cranium.scale.set(1.12, 0.96, 1.06);
    cranium.position.y = 0.12;
    cranium.castShadow = true;
    this.head.add(cranium);

    // Riveted Bronze Brow Visor Crest
    const browCrest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.28), brassMat);
    browCrest.position.set(0, 0.22, 0.12);
    browCrest.rotation.x = 0.15;
    this.head.add(browCrest);

    // Recessed Dark Faceplate Mask
    const faceMask = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.12), darkChassisMat);
    faceMask.position.set(0, 0.11, 0.18);
    this.head.add(faceMask);

    // Articulated Jaw / Vocoder Grille with vertical brass bars
    const jawPlate = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.14), bronzeMat);
    jawPlate.position.set(0, -0.01, 0.17);
    this.head.add(jawPlate);

    // Dual Multi-Element Optical Camera Eyes (Telescoping Brass Barrels + Cyan Glowing Lenses)
    const createOpticalEye = (xOffset: number) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(xOffset, 0.11, 0.24);

      const outerBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.078, 0.06, 16), brassMat);
      outerBarrel.rotation.x = Math.PI / 2;
      eyeGroup.add(outerBarrel);

      const innerIris = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.012, 6, 16), copperMat);
      innerIris.position.z = 0.03;
      eyeGroup.add(innerIris);

      const glowingLens = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.04, 16), cyanGlowMat);
      glowingLens.rotation.x = Math.PI / 2;
      glowingLens.position.z = 0.02;
      eyeGroup.add(glowingLens);

      return eyeGroup;
    };

    this.eyeLeft = createOpticalEye(-0.1);
    this.eyeRight = createOpticalEye(0.1);
    this.head.add(this.eyeLeft);
    this.head.add(this.eyeRight);

    this.eyeLight = new THREE.PointLight(0x38bdf8, 1.8, 5.5);
    this.eyeLight.position.set(0, 0.12, 0.45);
    this.head.add(this.eyeLight);

    // Brass Ear Gyro-Receivers
    [-0.28, 0.28].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 12), brassMat);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(ex, 0.12, 0);
      this.head.add(ear);

      const earCap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 10), copperMat);
      earCap.rotation.z = Math.PI / 2;
      earCap.position.set(ex * 1.08, 0.12, 0);
      this.head.add(earCap);
    });

    // Dynamic Spring-Mounted Telemetry Antenna
    this.antenna = new THREE.Group();
    this.antenna.position.set(0.14, 0.32, -0.04);

    const antSpring = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.06, 8), brassMat);
    this.antenna.add(antSpring);

    const antRod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.016, 0.26, 8), copperMat);
    antRod.position.y = 0.14;
    this.antenna.add(antRod);

    const antBulb = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 10), amberGlowMat);
    antBulb.position.y = 0.28;
    this.antenna.add(antBulb);

    this.head.add(this.antenna);
    this.torso.add(this.head);

    // =========================================================================
    // 4. 3-SEGMENT ARTICULATED ARMS (Shoulder -> Elbow/Forearm -> 3-Fingered Hand)
    // =========================================================================
    const buildArticulatedArm = (isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      const shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(sign * 0.34, 0.4, 0.0); // Relative to torso

      // Layered Steampunk Brass & White Shoulder Pauldron
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
        whiteHullMat
      );
      pauldron.position.set(sign * 0.03, 0.03, 0);
      pauldron.rotation.z = sign * -0.4;
      pauldron.castShadow = true;
      shoulderPivot.add(pauldron);

      const pauldronRim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 6, 16), brassMat);
      pauldronRim.rotation.x = Math.PI / 2;
      pauldronRim.rotation.y = sign * -0.4;
      pauldronRim.position.set(sign * 0.03, 0.0, 0);
      shoulderPivot.add(pauldronRim);

      // Shoulder Ball Joint
      const shoulderBall = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), brassMat);
      shoulderPivot.add(shoulderBall);

      // Upper Arm (Bicep + Chrome Hydraulic Damper)
      const bicep = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.26, 10), darkChassisMat);
      bicep.position.y = -0.14;
      bicep.castShadow = true;
      shoulderPivot.add(bicep);

      const bicepArmor = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.1), whiteHullMat);
      bicepArmor.position.set(sign * 0.015, -0.14, 0);
      shoulderPivot.add(bicepArmor);

      const bicepPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 8), chromeMat);
      bicepPiston.position.set(sign * -0.04, -0.14, 0.03);
      shoulderPivot.add(bicepPiston);

      // Independent Elbow Pivot Group!
      const forearmPivot = new THREE.Group();
      forearmPivot.position.set(0, -0.27, 0);

      const elbowRotor = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 12), copperMat);
      elbowRotor.rotation.z = Math.PI / 2;
      forearmPivot.add(elbowRotor);

      // Heavy Armored Forearm Gauntlet
      const forearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.12), whiteHullMat);
      forearmMesh.position.y = -0.13;
      forearmMesh.castShadow = true;
      forearmPivot.add(forearmMesh);

      const wristCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.062, 0.05, 12), brassMat);
      wristCuff.position.y = -0.25;
      forearmPivot.add(wristCuff);

      // Independent Wrist & 3-Fingered Articulated Hand!
      const handPivot = new THREE.Group();
      handPivot.position.set(0, -0.28, 0);

      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.09), darkChassisMat);
      palm.position.y = -0.03;
      handPivot.add(palm);

      // 2 Outer Articulated Brass Fingers + 1 Inner Opposable Thumb
      [-0.028, 0.028].forEach((fz) => {
        const finger = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.085, 0.024), brassMat);
        finger.position.set(sign * 0.025, -0.09, fz);
        finger.rotation.z = sign * -0.25;
        handPivot.add(finger);
      });

      const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.07, 0.024), copperMat);
      thumb.position.set(sign * -0.03, -0.07, 0.02);
      thumb.rotation.z = sign * 0.35;
      handPivot.add(thumb);

      forearmPivot.add(handPivot);
      shoulderPivot.add(forearmPivot);

      return { shoulderPivot, forearmPivot, handPivot };
    };

    const leftArmParts = buildArticulatedArm(true);
    this.leftArm = leftArmParts.shoulderPivot;
    this.leftForearm = leftArmParts.forearmPivot;
    this.leftHand = leftArmParts.handPivot;
    this.torso.add(this.leftArm);

    const rightArmParts = buildArticulatedArm(false);
    this.rightArm = rightArmParts.shoulderPivot;
    this.rightForearm = rightArmParts.forearmPivot;
    this.rightHand = rightArmParts.handPivot;
    this.torso.add(this.rightArm);

    // =========================================================================
    // 5. 3-SEGMENT ARTICULATED LEGS (Hip/Thigh -> Knee/Shin -> Ankle/Foot)
    // =========================================================================
    const buildArticulatedLeg = (isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      const hipPivot = new THREE.Group();
      hipPivot.position.set(sign * 0.16, -0.04, 0); // Relative to pelvis

      const hipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.078, 10, 10), brassMat);
      hipPivot.add(hipJoint);

      // Armored Thigh Assembly + Chrome Hydraulic Strut
      const thighCore = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 12), darkChassisMat);
      thighCore.position.y = -0.17;
      thighCore.castShadow = true;
      hipPivot.add(thighCore);

      const thighArmor = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.15), whiteHullMat);
      thighArmor.position.set(0, -0.16, 0.015);
      thighArmor.castShadow = true;
      hipPivot.add(thighArmor);

      const thighPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8), chromeMat);
      thighPiston.position.set(sign * 0.065, -0.16, -0.02);
      hipPivot.add(thighPiston);

      // Independent Knee & Shin Pivot Group!
      const shinPivot = new THREE.Group();
      shinPivot.position.set(0, -0.34, 0);

      const kneeRotor = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.11, 12), copperMat);
      kneeRotor.rotation.z = Math.PI / 2;
      shinPivot.add(kneeRotor);

      const kneeGuard = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.1, 0.06), brassMat);
      kneeGuard.position.set(0, 0.01, 0.06);
      shinPivot.add(kneeGuard);

      const shinBone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.3, 10), darkChassisMat);
      shinBone.position.y = -0.16;
      shinBone.castShadow = true;
      shinPivot.add(shinBone);

      const shinGreave = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.12), whiteHullMat);
      shinGreave.position.set(0, -0.16, 0.02);
      shinPivot.add(shinGreave);

      const calfPiston = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.26, 8), chromeMat);
      calfPiston.position.set(0, -0.15, -0.055);
      shinPivot.add(calfPiston);

      // Independent Ankle & Articulated Boot Pivot Group!
      const footPivot = new THREE.Group();
      footPivot.position.set(0, -0.32, 0);

      const ankleJoint = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), brassMat);
      footPivot.add(ankleJoint);

      const bootMain = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.25), whiteHullMat);
      bootMain.position.set(0, -0.04, 0.04);
      bootMain.castShadow = true;
      footPivot.add(bootMain);

      const brassToeCap = new THREE.Mesh(new THREE.BoxGeometry(0.155, 0.06, 0.09), brassMat);
      brassToeCap.position.set(0, -0.05, 0.13);
      footPivot.add(brassToeCap);

      const rubberSole = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.26), darkChassisMat);
      rubberSole.position.set(0, -0.075, 0.04);
      footPivot.add(rubberSole);

      shinPivot.add(footPivot);
      hipPivot.add(shinPivot);

      return { hipPivot, shinPivot, footPivot };
    };

    const leftLegParts = buildArticulatedLeg(true);
    this.leftLeg = leftLegParts.hipPivot;
    this.leftShin = leftLegParts.shinPivot;
    this.leftFoot = leftLegParts.footPivot;
    this.pelvis.add(this.leftLeg);

    const rightLegParts = buildArticulatedLeg(false);
    this.rightLeg = rightLegParts.hipPivot;
    this.rightShin = rightLegParts.shinPivot;
    this.rightFoot = rightLegParts.footPivot;
    this.pelvis.add(this.rightLeg);

    // =========================================================================
    // 6. MODULAR 3D UPGRADE ATTACHMENT POINTS (Visible Character Evolution)
    // =========================================================================
    // A. Electrostatic Charge Scanner (Mounted on Left Shoulder Pauldron)
    this.chargeScannerGroup = new THREE.Group();
    this.chargeScannerGroup.position.set(0.06, 0.14, 0);
    const scannerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 12), brassMat);
    this.chargeScannerGroup.add(scannerBase);
    const scannerRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 8, 20), cyanGlowMat);
    scannerRing.position.set(0.02, 0.08, 0);
    scannerRing.rotation.y = Math.PI / 2;
    this.chargeScannerGroup.add(scannerRing);
    this.chargeScannerGroup.visible = false;
    this.leftArm.add(this.chargeScannerGroup);

    // B. Multifunction Electrical Engineering Tool (Mounted on Right Forearm)
    this.multitoolGroup = new THREE.Group();
    this.multitoolGroup.position.set(-0.06, -0.14, 0.05);
    const toolHousing = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.09), copperMat);
    this.multitoolGroup.add(toolHousing);
    const coilRings = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 8, 16), brassMat);
    coilRings.rotation.x = Math.PI / 2;
    coilRings.position.set(0, -0.06, 0.02);
    this.multitoolGroup.add(coilRings);
    const arcEmitterTip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), cyanGlowMat);
    arcEmitterTip.position.set(0, -0.14, 0.03);
    this.multitoolGroup.add(arcEmitterTip);
    this.multitoolGroup.visible = false;
    this.rightForearm.add(this.multitoolGroup);

    // C. Twin Leyden-Capacitor Energy Module (Mounted on sides of Steam Backpack)
    this.energyModuleGroup = new THREE.Group();
    [-0.22, 0.22].forEach((cx) => {
      const capCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.34, 12), cyanGlowMat);
      capCylinder.position.set(cx, 0.32, -0.2);
      this.energyModuleGroup.add(capCylinder);

      const capRimTop = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12), brassMat);
      capRimTop.position.set(cx, 0.49, -0.2);
      this.energyModuleGroup.add(capRimTop);

      const capRimBot = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12), brassMat);
      capRimBot.position.set(cx, 0.15, -0.2);
      this.energyModuleGroup.add(capRimBot);
    });
    this.energyModuleGroup.visible = false;
    this.torso.add(this.energyModuleGroup);

    // D. Hovering Companion Micro-Drone ("Szikra-Szonda")
    this.companionDroneGroup = new THREE.Group();
    this.companionDroneGroup.position.set(-0.55, 1.85, -0.15);
    const droneSphere = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), brassMat);
    this.companionDroneGroup.add(droneSphere);
    const droneEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), cyanGlowMat);
    droneEye.position.set(0, 0, 0.095);
    this.companionDroneGroup.add(droneEye);
    const droneGyro = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 8, 24), copperMat);
    droneGyro.rotation.x = Math.PI / 2;
    this.companionDroneGroup.add(droneGyro);
    this.companionDroneGroup.visible = false;
    this.robotRoot.add(this.companionDroneGroup);

    // E. Grounded Soft Radial Contact Shadow Disc (Anchors robot visually to the terrain)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
    sGrad.addColorStop(0, 'rgba(8, 6, 4, 0.68)');
    sGrad.addColorStop(0.55, 'rgba(12, 9, 6, 0.32)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    this.contactShadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), shadowMat);
    this.contactShadowMesh.rotation.x = -Math.PI / 2;
    this.contactShadowMesh.position.set(0, 0.015, 0);
    this.group.add(this.contactShadowMesh);

    this.group.add(this.robotRoot);
  }

  public syncUpgrades(equippedUpgradeIds: string[]) {
    if (this.chargeScannerGroup) {
      this.chargeScannerGroup.visible = equippedUpgradeIds.includes('upg-charge-scanner');
    }
    if (this.multitoolGroup) {
      this.multitoolGroup.visible = equippedUpgradeIds.includes('upg-engineering-multitool');
    }
    if (this.energyModuleGroup) {
      const hasEnergy = equippedUpgradeIds.includes('upg-energy-module');
      this.energyModuleGroup.visible = hasEnergy;
      this.speedMultiplier = hasEnergy ? 1.15 : 1.0;
    }
    if (this.companionDroneGroup) {
      this.companionDroneGroup.visible = equippedUpgradeIds.includes('upg-companion-drone');
    }
  }

  public update(
    delta: number,
    input: PlayerInput,
    cameraAngle: number,
    colliders: THREE.Box3[]
  ) {
    const moveSpeed = (input.sprint ? 9.5 : 5.8) * this.speedMultiplier;
    const gravity = -22;
    const jumpStrength = 8.5;
    const now = performance.now();

    // 1. Continuous Clockwork Mechanism Animation (Chest & Backpack Gears always spin!)
    this.chestGear.rotation.z += delta * (input.sprint ? 6.5 : 2.4);
    this.backpackGear.rotation.z -= delta * (input.sprint ? 5.5 : 1.8);

    // 2. Movement Vector Calculation
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

      // Advance biomechanical gait phase
      const cycleRate = input.sprint ? 14.5 : 9.2;
      this.walkTime += delta * cycleRate;
      const p = this.walkTime;

      // Stride amplitudes
      const hipAmp = input.sprint ? 0.68 : 0.46;
      const kneeAmp = input.sprint ? 1.05 : 0.72;
      const armAmp = input.sprint ? 0.62 : 0.38;

      // A. 3-Joint Leg Kinematics (Hip Swing + Backward Knee Flexion + Ankle Compensation)
      // Note: robot faces +Z in local mesh space, so negative X rotation swings thigh forward (+Z),
      // and positive X rotation on shin bends the knee backward (-Z)!
      const leftHipAngle = -Math.sin(p) * hipAmp;
      const rightHipAngle = Math.sin(p) * hipAmp;
      this.leftLeg.rotation.x = leftHipAngle;
      this.rightLeg.rotation.x = rightHipAngle;

      // Knees bend backward (positive rotation.x in +Z-facing local space) as the foot lifts & swings forward
      const leftKneeFlex = Math.max(0, Math.cos(p - 0.35)) * kneeAmp;
      const rightKneeFlex = Math.max(0, -Math.cos(p - 0.35)) * kneeAmp;
      this.leftShin.rotation.x = leftKneeFlex;
      this.rightShin.rotation.x = rightKneeFlex;

      // Ankles articulate to flex on heel-strike and push off at toe-off
      this.leftFoot.rotation.x = -leftHipAngle * 0.35 - leftKneeFlex * 0.45;
      this.rightFoot.rotation.x = -rightHipAngle * 0.35 - rightKneeFlex * 0.45;

      // B. Pelvic Bounce, Hip Twist & Lateral Weight Shift
      const strideBounce = Math.abs(Math.sin(p)) * (input.sprint ? 0.065 : 0.04);
      this.pelvis.position.y = 0.72 + strideBounce - (input.sprint ? 0.03 : 0);
      this.pelvis.rotation.y = Math.sin(p) * 0.12;
      this.pelvis.rotation.z = Math.cos(p) * 0.045;

      // C. Upper Torso Counter-Rotation & Dynamic Sprint Forward Lean
      const targetLean = input.sprint ? 0.22 : 0.08;
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, targetLean, delta * 10);
      this.torso.rotation.y = -Math.sin(p) * 0.16;
      this.torso.rotation.z = -Math.cos(p) * 0.04;

      // D. 3-Joint Arm & Elbow Articulation (Opposite to legs, elbows bend forward = negative X)
      this.leftArm.rotation.x = Math.sin(p) * armAmp;
      this.rightArm.rotation.x = -Math.sin(p) * armAmp;
      this.leftArm.rotation.z = -0.08;
      this.rightArm.rotation.z = 0.08;

      this.leftForearm.rotation.x = -0.32 - Math.max(0, -Math.sin(p)) * (input.sprint ? 0.58 : 0.32);
      this.rightForearm.rotation.x = -0.32 - Math.max(0, Math.sin(p)) * (input.sprint ? 0.58 : 0.32);

      this.leftHand.rotation.z = Math.sin(p) * 0.15;
      this.rightHand.rotation.z = -Math.sin(p) * 0.15;

      // E. Head Stabilization & Curious Look-Ahead
      this.head.rotation.x = -targetLean * 0.65 + Math.sin(p * 2) * 0.03;
      this.head.rotation.y = Math.sin(p) * 0.06 - this.turnVelocity * 0.15;

      // F. Spring Antenna Whip Inertia
      this.antenna.rotation.x = -0.25 - Math.sin(p * 2) * 0.18;
      this.antenna.rotation.z = this.turnVelocity * 0.25;

      // G. Footstep Audio Cadence
      if (now - this.lastStepTime > (input.sprint ? 235 : 355)) {
        soundManager.playFootstep();
        this.lastStepTime = now;
      }

      // H. Thruster Flare
      const tScale = input.sprint ? 1.55 : 1.05;
      this.thrusterGlow.scale.set(tScale, input.sprint ? 1.9 : 1.1, tScale);
    } else {
      // Smooth deceleration & Living Clockwork Idle Animation
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;

      const breath = Math.sin(now * 0.003);
      const slowWave = Math.cos(now * 0.0018);

      // Settle legs smoothly to grounded stance with subtle knee flex
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, -0.05, delta * 9);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0.05, delta * 9);
      this.leftShin.rotation.x = THREE.MathUtils.lerp(this.leftShin.rotation.x, 0.1, delta * 9);
      this.rightShin.rotation.x = THREE.MathUtils.lerp(this.rightShin.rotation.x, 0.1, delta * 9);
      this.leftFoot.rotation.x = THREE.MathUtils.lerp(this.leftFoot.rotation.x, -0.05, delta * 9);
      this.rightFoot.rotation.x = THREE.MathUtils.lerp(this.rightFoot.rotation.x, -0.05, delta * 9);

      // Subtle breathing & idle posture
      this.pelvis.position.y = THREE.MathUtils.lerp(this.pelvis.position.y, 0.71 + breath * 0.012, delta * 8);
      this.pelvis.rotation.y = THREE.MathUtils.lerp(this.pelvis.rotation.y, 0, delta * 8);
      this.pelvis.rotation.z = THREE.MathUtils.lerp(this.pelvis.rotation.z, 0, delta * 8);

      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, breath * 0.025, delta * 8);
      this.torso.rotation.y = THREE.MathUtils.lerp(this.torso.rotation.y, slowWave * 0.06, delta * 6);
      this.torso.rotation.z = THREE.MathUtils.lerp(this.torso.rotation.z, 0, delta * 8);

      // Relaxed articulated arms & bent elbows during idle
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0.06 + breath * 0.03, delta * 8);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.04 - breath * 0.03, delta * 8);
      this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, -0.09, delta * 8);
      this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, 0.09, delta * 8);

      this.leftForearm.rotation.x = THREE.MathUtils.lerp(this.leftForearm.rotation.x, -0.26 - breath * 0.04, delta * 8);
      this.rightForearm.rotation.x = THREE.MathUtils.lerp(this.rightForearm.rotation.x, -0.28 + breath * 0.04, delta * 8);

      // Curious automaton head scanning & micro-tilt
      this.head.rotation.y = Math.sin(now * 0.0014) * 0.16;
      this.head.rotation.x = Math.cos(now * 0.0022) * 0.05;
      this.head.rotation.z = Math.sin(now * 0.0019) * 0.06;

      this.antenna.rotation.x = THREE.MathUtils.lerp(this.antenna.rotation.x, Math.sin(now * 0.005) * 0.08, delta * 8);
      this.antenna.rotation.z = THREE.MathUtils.lerp(this.antenna.rotation.z, Math.cos(now * 0.004) * 0.08, delta * 8);

      this.thrusterGlow.scale.set(0.85, 0.8 + breath * 0.15, 0.85);
    }

    // 3. Airborne / Jump Pose Override
    if (!this.isGrounded) {
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, -0.45, delta * 12);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, -0.2, delta * 12);
      this.leftShin.rotation.x = THREE.MathUtils.lerp(this.leftShin.rotation.x, 0.75, delta * 12);
      this.rightShin.rotation.x = THREE.MathUtils.lerp(this.rightShin.rotation.x, 0.55, delta * 12);
      this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, -0.45, delta * 12);
      this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, 0.45, delta * 12);
      this.leftForearm.rotation.x = THREE.MathUtils.lerp(this.leftForearm.rotation.x, -0.65, delta * 12);
      this.rightForearm.rotation.x = THREE.MathUtils.lerp(this.rightForearm.rotation.x, -0.65, delta * 12);
      this.thrusterGlow.scale.set(1.7, 2.2, 1.7);
    }

    // 4. Periodic Optical Camera Lens Shutter Blink
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.8) {
      const blinkPhase = (this.blinkTimer - 3.8) / 0.14;
      if (blinkPhase < 1.0) {
        const sy = Math.max(0.12, Math.abs(Math.cos(blinkPhase * Math.PI)));
        this.eyeLeft.scale.y = sy;
        this.eyeRight.scale.y = sy;
      } else {
        this.eyeLeft.scale.y = 1.0;
        this.eyeRight.scale.y = 1.0;
        this.blinkTimer = Math.random() * 0.8;
      }
    }

    // 5. Smooth Heading Rotation & Banking into Turns
    let diff = this.targetRotation - this.group.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const prevRotY = this.group.rotation.y;
    this.group.rotation.y += diff * Math.min(1, delta * 12);
    this.turnVelocity = (this.group.rotation.y - prevRotY) / Math.max(0.001, delta);

    // Subtle whole-body bank into sharp turns
    this.robotRoot.rotation.z = THREE.MathUtils.lerp(
      this.robotRoot.rotation.z,
      THREE.MathUtils.clamp(-this.turnVelocity * 0.035, -0.14, 0.14),
      delta * 10
    );

    this.eyeLight.intensity = 1.6 + Math.sin(now * 0.006) * 0.25;

    // Animate modular upgrade attachments if visible
    if (this.companionDroneGroup && this.companionDroneGroup.visible) {
      this.companionDroneGroup.position.y = 1.85 + Math.sin(now * 0.004) * 0.09;
      this.companionDroneGroup.position.x = -0.55 + Math.cos(now * 0.0025) * 0.06;
      this.companionDroneGroup.rotation.y = Math.sin(now * 0.002) * 0.35;
    }
    if (this.chargeScannerGroup && this.chargeScannerGroup.visible) {
      this.chargeScannerGroup.rotation.y += delta * 2.2;
    }

    // 6. Jump & Gravity Physics
    if (input.jump && this.isGrounded) {
      this.velocity.y = jumpStrength;
      this.isGrounded = false;
    }

    this.velocity.y += gravity * delta;

    // 7. AABB Collision Detection & Movement
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

    this.lastCollidedWithObstacle = isMoving && (collideX || collideZ);

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

    // Keep contact shadow anchored on the ground plane (y = 0.015 in world space)
    if (this.contactShadowMesh) {
      this.contactShadowMesh.position.y = -this.position.y + 0.015;
      const shadowScale = Math.max(0.45, 1.0 - this.position.y * 0.18);
      this.contactShadowMesh.scale.set(shadowScale, shadowScale, 1);
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public getLookAtPoint(): THREE.Vector3 {
    return new THREE.Vector3(this.position.x, this.position.y + 1.15, this.position.z);
  }

  public getHeadingAngle(): number {
    return this.group.rotation.y;
  }
}
