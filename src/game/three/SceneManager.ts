import * as THREE from 'three';
import { PlayerController, PlayerInput } from './PlayerController';
import { WorldGenerator } from './generators/WorldGenerator';
import { LEVEL_SPECIFICATIONS, LevelEnvironmentSpec } from './generators/LevelEnvironmentSpec';
import { useGameStore } from '../../store/useGameStore';
import { soundManager } from '../../audio/soundManager';

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

  // Lights for dynamic level spec adjustment
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;
  private sunLight!: THREE.DirectionalLight;
  private bounceLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
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

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x161f2c);
    this.scene.fog = new THREE.FogExp2(0x161f2c, 0.012);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);
    this.camera.position.set(0, 5, 15);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;

    container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup
    this.setupLighting();

    // 5. Instantiate Procedural Parametric World & Player
    const initialLvl = useGameStore.getState().activeTowerLevel || 1;
    this.world = new WorldGenerator(initialLvl);
    this.scene.add(this.world.rootGroup);

    // Apply lighting from the level specification
    this.applyLevelLighting(this.world.currentSpec);

    // Player starts at Scrapyard Awakening Pod (z = 11)
    this.player = new PlayerController(new THREE.Vector3(0, 0, 11));
    this.scene.add(this.player.group);

    // Subscribe to store level changes to dynamically regenerate the world
    this.unsubscribeStore = useGameStore.subscribe((state, prevState) => {
      if (state.activeTowerLevel !== prevState.activeTowerLevel) {
        this.switchLevel(state.activeTowerLevel);
      }
    });

    // 6. Bind Event Listeners
    this.bindEvents();

    // 7. Start render loop
    this.start();
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x78350f, 1.4);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0x334155, 1.6);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffedd5, 2.4);
    this.sunLight.position.set(22, 40, 18);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 100;
    this.sunLight.shadow.camera.left = -35;
    this.sunLight.shadow.camera.right = 35;
    this.sunLight.shadow.camera.top = 35;
    this.sunLight.shadow.camera.bottom = -35;
    this.sunLight.shadow.bias = -0.0003;
    this.scene.add(this.sunLight);

    this.bounceLight = new THREE.DirectionalLight(0xf97316, 1.4);
    this.bounceLight.position.set(-15, 10, 20);
    this.scene.add(this.bounceLight);

    this.rimLight = new THREE.DirectionalLight(0x0284c7, 1.2);
    this.rimLight.position.set(-25, 25, -25);
    this.scene.add(this.rimLight);
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
    // If an interactive modal is active, do not consume WASD
    const { activeModal } = useGameStore.getState();
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

    // 5. Throttled broadcast for Minimap
    if (now - this.lastCoordUpdateTime > 50) {
      this.lastCoordUpdateTime = now;
      useGameStore.getState().setPlayerCoordinates(pPos.x, pPos.z, this.player.getHeadingAngle());
    }

    // 6. Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  private checkTriggersAndLocation(pPos: THREE.Vector3) {
    // A. Check Location Name update
    const currentLoc = this.world.checkPlayerLocation(pPos);
    if (currentLoc !== this.lastLocationReported) {
      this.lastLocationReported = currentLoc;
      useGameStore.getState().setCurrentLocation(currentLoc);
    }

    // B. Check 3D Quest Beacons Proximity (Walking into beacon zones)
    let foundBeaconTarget = false;
    for (const beacon of this.world.questBeacons) {
      const dist = pPos.distanceTo(beacon.position);
      if (dist <= beacon.radius) {
        foundBeaconTarget = true;
        if (this.lastInteractionTargetId !== beacon.id) {
          this.lastInteractionTargetId = beacon.id;
          useGameStore.getState().setInteractionTarget({
            type: 'terminal',
            title: beacon.title,
            hint: 'Beléptél a küldetés zónájába! Nyomj [E]-t vagy kattints a megnyitáshoz!',
            action: () => {
              if (beacon.id === 'beacon-static-lab') {
                useGameStore.getState().openModal('experiment');
              } else if (beacon.id === 'beacon-robot-core') {
                useGameStore.getState().addToast({
                  type: 'info',
                  title: 'Dormant Robot Core',
                  message: 'A roncs mellkasi akkumulátora dörzsölésből származó elektrosztatikus maradék töltést hordoz!',
                });
                useGameStore.getState().unlockDiscovery('static-charge');
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
