import * as THREE from 'three';
import { PlayerController, PlayerInput } from './PlayerController';
import { WorldGenerator } from './generators/WorldGenerator';
import { LEVEL_SPECIFICATIONS, LevelEnvironmentSpec } from './generators/LevelEnvironmentSpec';
import { PBRTextureGenerator } from './materials/PBRTextureGenerator';
import { useGameStore } from '../../store/useGameStore';
import { soundManager } from '../../audio/soundManager';
import { GRAPHICS_PRESETS, GraphicsQuality } from '../../config/graphicsConfig';
import { PostProcessingPipeline } from './postprocessing/PostProcessingPipeline';

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private lastTime: number = performance.now();

  // Components
  public player: PlayerController;
  public world: WorldGenerator;
  private postProcessing: PostProcessingPipeline;

  // Lights for dynamic level spec adjustment
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;
  private sunLight!: THREE.DirectionalLight;
  private bounceLight!: THREE.DirectionalLight;
  private unsubscribeStore: (() => void) | null = null;

  // Input & Camera Controls
  private input: PlayerInput = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  };

  private cameraYaw: number = 0;
  private cameraPitch: number = 0.35;
  private cameraDistance: number = 4.8;
  private isPointerDown: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;

  // Interaction trigger cache to prevent excessive React state updates
  private lastLocationReported: string = '';
  private lastInteractionTargetId: string | null = null;
  private lastCoordUpdateTime: number = 0;

  // Real-time Kinematics Telemetry (Mission 01-03)
  private totalDistanceTraveled: number = 0;
  private totalMovementTime: number = 0;
  private prevPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 11);
  private prevSpeed: number = 0;
  private crateBypassed: boolean = false;
  private sensorReached: boolean = false;
  private hasMovedOnce: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene & Warm Steampunk Amber-Brown Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38220f);
    this.scene.fog = new THREE.FogExp2(0x3d2510, 0.007);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 240);
    this.camera.position.set(0, 5, 16);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    // AAA Image-Based Lighting (IBL): Panoramic environment map for metallic reflections
    try {
      this.scene.environment = PBRTextureGenerator.createEnvironmentMap(this.renderer);
    } catch (e) {
      console.warn('Could not generate environment map:', e);
    }

    container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup
    this.setupLighting();

    // 4B. Post-Processing Pipeline (Restrained Bloom + ACES OutputPass)
    this.postProcessing = new PostProcessingPipeline(
      this.renderer,
      this.scene,
      this.camera,
      container.clientWidth,
      container.clientHeight
    );

    // 5. Instantiate Procedural Parametric World & Player
    const initialLvl = useGameStore.getState().activeTowerLevel || 1;
    this.world = new WorldGenerator(initialLvl);
    this.scene.add(this.world.rootGroup);

    // Apply lighting from the level specification
    this.applyLevelLighting(this.world.currentSpec);

    // Player starts at Open Steampunk Clockwork Awakening Platform (z = 11)
    this.player = new PlayerController(new THREE.Vector3(0, 0, 11));
    this.scene.add(this.player.group);

    // Sync initial 3D character upgrades and graphics quality preset
    const initStore = useGameStore.getState();
    this.player.syncUpgrades(
      initStore.upgrades.filter((u) => u.unlocked && u.equipped).map((u) => u.id)
    );
    this.applyGraphicsQuality(initStore.quality);

    // Subscribe to store changes for level switches, character upgrades, and graphics quality
    this.unsubscribeStore = useGameStore.subscribe((state, prevState) => {
      if (state.activeTowerLevel !== prevState.activeTowerLevel) {
        this.switchLevel(state.activeTowerLevel);
      }
      if (state.upgrades !== prevState.upgrades) {
        this.player.syncUpgrades(
          state.upgrades.filter((u) => u.unlocked && u.equipped).map((u) => u.id)
        );
      }
      if (state.quality !== prevState.quality) {
        this.applyGraphicsQuality(state.quality);
      }
    });

    // 6. Bind Event Listeners
    this.bindEvents();

    // 7. Start render loop
    this.start();
  }

  public applyGraphicsQuality(quality: GraphicsQuality) {
    const cfg = GRAPHICS_PRESETS[quality] || GRAPHICS_PRESETS.high;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, cfg.maxPixelRatio));
    this.renderer.shadowMap.enabled = cfg.shadowsEnabled;
    if (this.sunLight) {
      this.sunLight.castShadow = cfg.shadowsEnabled;
    }
    if (this.postProcessing) {
      this.postProcessing.enabled = cfg.postProcessingEnabled;
    }
    this.world.setEffectsVisibility(cfg.particlesEnabled, cfg.atmosphericEffectsEnabled);
  }

  private setupLighting() {
    // Cool-slate sky dome fill vs grounded warm earth bounce for true 3D form separation
    this.hemiLight = new THREE.HemisphereLight(0x8899aa, 0x2d241c, 1.15);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0x6e7885, 1.45);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffe4b5, 2.8);
    this.sunLight.position.set(38, 46, 26);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -44;
    this.sunLight.shadow.camera.right = 44;
    this.sunLight.shadow.camera.top = 44;
    this.sunLight.shadow.camera.bottom = -44;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    this.bounceLight = new THREE.DirectionalLight(0xc27838, 1.25);
    this.bounceLight.position.set(-24, 18, 22);
    this.scene.add(this.bounceLight);
  }

  public switchLevel(levelNum: number) {
    const spec = LEVEL_SPECIFICATIONS[levelNum] || LEVEL_SPECIFICATIONS[1];
    this.world.generateLevel(spec);
    this.applyLevelLighting(spec);

    // Reset player position to starting pod
    this.player.position.set(0, 0, 11);
    this.player.velocity.set(0, 0, 0);

    soundManager.playDoorSwoosh();
  }

  private applyLevelLighting(spec: LevelEnvironmentSpec) {
    this.scene.background = new THREE.Color(spec.sky.backgroundColor);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.setHex(spec.sky.fogColor);
      (this.scene.fog as THREE.FogExp2).density = spec.sky.fogDensity;
    }
    this.ambientLight.color.setHex(spec.sky.ambientColor);
    this.ambientLight.intensity = spec.sky.ambientIntensity;
    this.sunLight.color.setHex(spec.sky.sunColor);
    this.sunLight.intensity = spec.sky.sunIntensity;
    this.sunLight.position.set(...spec.sky.sunPosition);
    this.bounceLight.color.setHex(spec.sky.secondaryLightColor);
    this.bounceLight.intensity = spec.sky.secondaryLightIntensity;
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);

    const el = this.renderer.domElement;
    el.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    el.addEventListener('wheel', this.onWheel, { passive: true });

    // Touch controls for tablets
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
  }

  private unbindEvents() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);

    const el = this.renderer.domElement;
    el.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    el.removeEventListener('wheel', this.onWheel);

    el.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchmove', this.onTouchMove);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    // If an interactive modal or cinematic intro is active, do not consume WASD
    const { activeModal, showCinematicIntro } = useGameStore.getState();
    if (showCinematicIntro) return;
    if (activeModal !== null) {
      if (e.key === 'Escape') {
        useGameStore.getState().closeModal();
      }
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = true;
        break;
      case 'Space':
        this.input.jump = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.input.sprint = true;
        break;
      case 'KeyE':
        // Interaction button
        const currentTarget = useGameStore.getState().interactionTarget;
        if (currentTarget) {
          currentTarget.action();
        }
        break;
      case 'KeyM':
      case 'KeyQ':
        // Toggle Map / Menu
        useGameStore.getState().openModal('menu', 'quests');
        break;
      case 'Escape':
        useGameStore.getState().openModal('menu', 'quests');
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.input.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.input.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.input.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.input.right = false;
        break;
      case 'Space':
        this.input.jump = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.input.sprint = false;
        break;
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    this.isPointerDown = true;
    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  };

  private onMouseUp = () => {
    this.isPointerDown = false;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerDown) return;
    const deltaX = e.clientX - this.prevMouseX;
    const deltaY = e.clientY - this.prevMouseY;

    this.cameraYaw -= deltaX * 0.006;
    this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + deltaY * 0.005));

    this.prevMouseX = e.clientX;
    this.prevMouseY = e.clientY;
  };

  private onWheel = (e: WheelEvent) => {
    this.cameraDistance = Math.max(2.5, Math.min(8.5, this.cameraDistance + e.deltaY * 0.005));
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      this.isPointerDown = true;
      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;
    }
  };

  private onTouchEnd = () => {
    this.isPointerDown = false;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.isPointerDown || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - this.prevMouseX;
    const deltaY = e.touches[0].clientY - this.prevMouseY;

    this.cameraYaw -= deltaX * 0.008;
    this.cameraPitch = Math.max(0.1, Math.min(1.2, this.cameraPitch + deltaY * 0.007));

    this.prevMouseX = e.touches[0].clientX;
    this.prevMouseY = e.touches[0].clientY;
  };

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.postProcessing) {
      this.postProcessing.setSize(width, height);
    }
  };

  public start() {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.animate();
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (delta > 0.1) delta = 0.1; // Clamp delta to avoid physics jumping on tab pause

    const pPos = this.player.getPosition();

    // 1. Update Player with collisions
    this.player.update(delta, this.input, this.cameraYaw, this.world.colliders);

    // 1B. Compute Live Kinematics Telemetry (s, Δr, t, v, a) & RO-01 Contextual Reactions
    const stepDist = Math.hypot(pPos.x - this.prevPosition.x, pPos.z - this.prevPosition.z);
    const instSpeed = delta > 0.001 ? stepDist / delta : 0;
    const instAccel = delta > 0.001 ? (instSpeed - this.prevSpeed) / delta : 0;

    if (stepDist > 0.003) {
      this.totalDistanceTraveled += stepDist;
      this.totalMovementTime += delta;
      if (!this.hasMovedOnce && this.totalDistanceTraveled > 0.4) {
        this.hasMovedOnce = true;
        useGameStore.getState().triggerSpeechBubble({
          id: 'ro01-first-step',
          speaker: 'RO-01',
          title: 'AZ ELSŐ ÖNÁLLÓ LÉPÉSEK',
          text: '„Mozgok! A bal lábam még kicsit nyikorog, de a szenzorom máris méri a megtett utat (s) és az eltelt időt (t). Lássuk, eljutok-e a régi mozgásszenzorig!”',
          status: 'Vonatkoztatási pont: Ébredési platform (x = 0, z = 11)',
        });
      }
    }

    // Check collision with the rusty crate obstacle near z = 6.8
    if (
      this.player.lastCollidedWithObstacle &&
      Math.abs(pPos.x) < 2.2 &&
      pPos.z > 4.8 &&
      pPos.z < 9.2
    ) {
      soundManager.playCollisionThud();
      useGameStore.getState().triggerSpeechBubble(
        {
          id: 'ro01-crate-collision',
          speaker: 'RO-01',
          title: 'ÜTKÖZÉS // ROZSDÁS LÁDA AKADÁLY',
          text: '„Ácsi! Ez a rozsdás láda szilárdabb, mint amilyennek látszik. Egyenesen nem tudok átmenni rajta — meg kell kerülnöm (A vagy D billentyűvel)! Így a megtett utam (s) hosszabb lesz, mint a légvonalbeli elmozdulásom (Δr).”',
          status: 'Fizikai megfigyelés: Kerülőút esetén s > |Δr|',
        },
        7000
      );
    }

    // Check if RO-01 bypassed the crate (z < 5.5)
    if (!this.crateBypassed && pPos.z < 5.4) {
      this.crateBypassed = true;
      useGameStore.getState().triggerSpeechBubble({
        id: 'ro01-crate-bypassed',
        speaker: 'RO-01',
        title: 'AKADÁLY MEGKERÜLVE // IRÁNY A SZENZOR!',
        text: '„Sikerült megkerülnöm a ládát! Nézd a telemetriát: a ténylegesen bejárt utam (s) máris nagyobb, mint az ébredési ponttól mért egyenes távolság (Δr). Most menjünk a kéken világító mozgásszenzorhoz (z = 2.5), és nyomd meg az [E] gombot!”',
        status: 'Cél: Aktiváld a Régi Mozgásszenzort az [E] billentyűvel!',
      });
    }

    const displacementFromStart = Math.hypot(pPos.x - 0, pPos.z - 11);
    if (!this.sensorReached && Math.hypot(pPos.x - 0, pPos.z - 2.5) < 3.2) {
      this.sensorReached = true;
    }

    this.prevPosition.copy(pPos);
    this.prevSpeed = instSpeed;

    // 2. Update World animations (rotating gears, opening doors, hologram)
    this.world.update(delta, pPos);

    // 3. Smooth Third Person Camera Follow
    const lookAtPoint = this.player.getLookAtPoint();

    // Calculate desired camera position based on yaw, pitch, and distance
    const offsetX = Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const offsetZ = Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const offsetY = Math.sin(this.cameraPitch) * this.cameraDistance + 0.5;

    const targetCamPos = new THREE.Vector3(
      lookAtPoint.x + offsetX,
      lookAtPoint.y + offsetY,
      lookAtPoint.z + offsetZ
    );

    // Smooth camera damping / lerp
    this.camera.position.lerp(targetCamPos, Math.min(1, delta * 9));
    this.camera.lookAt(lookAtPoint);

    // 4. Check Player Proximity to Triggers & Location
    this.checkTriggersAndLocation(pPos);

    // 5. Throttled broadcast for Minimap & Kinematics Telemetry
    if (now - this.lastCoordUpdateTime > 65) {
      this.lastCoordUpdateTime = now;
      const store = useGameStore.getState();
      store.setPlayerCoordinates(pPos.x, pPos.z, this.player.getHeadingAngle());
      store.updateKinematicsTelemetry({
        distanceTraveled: Number(this.totalDistanceTraveled.toFixed(1)),
        displacement: Number(displacementFromStart.toFixed(1)),
        movementTime: Number(this.totalMovementTime.toFixed(1)),
        currentSpeed: Number(instSpeed.toFixed(1)),
        currentAcceleration: Number(instAccel.toFixed(1)),
        crateBypassed: this.crateBypassed,
        sensorReached: this.sensorReached,
        hasMovedOnce: this.hasMovedOnce,
      });
    }

    // 6. Render Scene (with restrained post-processing bloom when enabled by Graphics Quality preset)
    if (this.postProcessing && this.postProcessing.enabled) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private checkTriggersAndLocation(pPos: THREE.Vector3) {
    // A. Check Location Name update
    const currentLoc = this.world.checkPlayerLocation(pPos);
    if (currentLoc !== this.lastLocationReported) {
      this.lastLocationReported = currentLoc;
      useGameStore.getState().setCurrentLocation(currentLoc);
    }

    // B. Check 3D World Interactables Proximity (Main Quests, Side Quests, Companion & Ambient Inspections)
    let foundBeaconTarget = false;
    for (const beacon of this.world.questBeacons) {
      const dist = pPos.distanceTo(beacon.position);
      if (dist <= beacon.radius) {
        foundBeaconTarget = true;
        if (this.lastInteractionTargetId !== beacon.id) {
          this.lastInteractionTargetId = beacon.id;
          useGameStore.getState().setInteractionTarget({
            id: beacon.id,
            category: beacon.category,
            promptKey: beacon.promptKey,
            type: beacon.category === 'ambient' ? 'npc' : 'terminal',
            title: beacon.title,
            subtitle: beacon.subtitle,
            hint: `${beacon.promptKey} — ${beacon.subtitle}`,
            action: () => {
              const store = useGameStore.getState();
              if (beacon.category === 'main_quest') {
                if (beacon.id === 'beacon-robot-core' || beacon.id === 'beacon-tesla-array') {
                  soundManager.playElectricSpark();
                }
                store.openExperimentForQuest(beacon.questId);
              } else if (beacon.category === 'side_quest') {
                store.openWorldInteraction(beacon.id);
              } else {
                // Ambient world interaction or Companion VOLT-7 dialogue
                store.inspectAmbientObject(beacon.id);
                store.openWorldInteraction(beacon.id);
              }
            },
          });
        }
        break;
      }
    }

    // C. Fallback if not inside any beacon
    if (!foundBeaconTarget && this.lastInteractionTargetId !== null) {
      this.lastInteractionTargetId = null;
      useGameStore.getState().setInteractionTarget(null);
    }
  }

  public dispose() {
    this.stop();
    this.unbindEvents();
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
