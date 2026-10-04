import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Modular Post-Processing Pipeline for STEMPUNK.
 * Uses Three.js EffectComposer with RenderPass, restrained UnrealBloomPass, and OutputPass
 * to emphasize emissive robot optics, furnace openings, Tesla arcs, and energy conduits
 * without washing out PBR surface detail.
 */
export class PostProcessingPipeline {
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  public enabled: boolean = true;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number
  ) {
    this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // Restrained bloom: high threshold (0.86) and subtle strength (0.28) so only emissive
    // elements (optical sensors, furnace slits, electrical arcs) glow naturally
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      0.28, // strength
      0.45, // radius
      0.86  // threshold
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  public setSize(width: number, height: number) {
    this.composer.setSize(width, height);
  }

  public render() {
    this.composer.render();
  }

  public dispose() {
    this.composer.dispose();
  }
}
