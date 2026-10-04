import * as THREE from 'three';

/**
 * PBR Texture Generator
 * Generates procedural high-resolution PBR textures (Diffuse, Normal, Roughness, Metalness)
 * and an environmental reflection cubemap using Canvas API without requiring external downloads.
 */
export class PBRTextureGenerator {
  private static cachedTextures: Record<string, THREE.CanvasTexture> = {};
  private static cachedEnvMap: THREE.Texture | null = null;

  /**
   * Generates procedural PBR maps for weathered industrial steel plating
   */
  public static createMetalPlatePBR(): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    roughness: THREE.CanvasTexture;
    metalness: THREE.CanvasTexture;
  } {
    if (this.cachedTextures['metal_diffuse']) {
      return {
        diffuse: this.cachedTextures['metal_diffuse'],
        normal: this.cachedTextures['metal_normal'],
        roughness: this.cachedTextures['metal_roughness'],
        metalness: this.cachedTextures['metal_metalness'],
      };
    }

    const size = 512;

    // 1. Diffuse Canvas (Weathered steel plate with seams & rivets)
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = size;
    diffCanvas.height = size;
    const ctxD = diffCanvas.getContext('2d')!;

    // Base warm steampunk cast-iron & aged bronze
    ctxD.fillStyle = '#332215';
    ctxD.fillRect(0, 0, size, size);

    // Plate grid lines (4 large plates)
    ctxD.strokeStyle = '#1c1108';
    ctxD.lineWidth = 6;
    ctxD.strokeRect(0, 0, size, size);
    ctxD.beginPath();
    ctxD.moveTo(size / 2, 0);
    ctxD.lineTo(size / 2, size);
    ctxD.moveTo(0, size / 2);
    ctxD.lineTo(size, size / 2);
    ctxD.stroke();

    // Noise and warm amber/copper patina stains
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const isRust = Math.random() < 0.45;
      ctxD.fillStyle = isRust ? 'rgba(217, 119, 6, 0.16)' : 'rgba(251, 191, 36, 0.05)';
      ctxD.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    // Brass rivet studs along edges
    const rivetPositions: [number, number][] = [];
    const step = size / 8;
    for (let i = step / 2; i < size; i += step) {
      rivetPositions.push([16, i], [size - 16, i], [i, 16], [i, size - 16]);
      rivetPositions.push([size / 2 - 12, i], [size / 2 + 12, i], [i, size / 2 - 12], [i, size / 2 + 12]);
    }

    rivetPositions.forEach(([rx, ry]) => {
      ctxD.fillStyle = '#b47832';
      ctxD.beginPath();
      ctxD.arc(rx, ry, 6, 0, Math.PI * 2);
      ctxD.fill();
      ctxD.fillStyle = 'rgba(254, 240, 138, 0.5)';
      ctxD.beginPath();
      ctxD.arc(rx - 2, ry - 2, 2.5, 0, Math.PI * 2);
      ctxD.fill();
    });

    const diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // 2. Normal Map Canvas (Generates vector normals for rivets and seams)
    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const ctxN = normCanvas.getContext('2d')!;

    // Base flat normal is RGB(128, 128, 255)
    ctxN.fillStyle = 'rgb(128, 128, 255)';
    ctxN.fillRect(0, 0, size, size);

    // Embossed plate borders
    ctxN.fillStyle = 'rgb(160, 128, 240)';
    ctxN.fillRect(0, 0, 4, size);
    ctxN.fillRect(0, 0, size, 4);
    ctxN.fillStyle = 'rgb(96, 128, 240)';
    ctxN.fillRect(size - 4, 0, 4, size);
    ctxN.fillRect(0, size - 4, size, 4);

    // Rivet 3D normal bumps
    rivetPositions.forEach(([rx, ry]) => {
      const grad = ctxN.createRadialGradient(rx - 2, ry - 2, 1, rx, ry, 6);
      grad.addColorStop(0, 'rgb(170, 170, 255)');
      grad.addColorStop(0.7, 'rgb(110, 110, 240)');
      grad.addColorStop(1, 'rgb(128, 128, 255)');
      ctxN.fillStyle = grad;
      ctxN.beginPath();
      ctxN.arc(rx, ry, 6, 0, Math.PI * 2);
      ctxN.fill();
    });

    const normal = new THREE.CanvasTexture(normCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;

    // 3. Roughness Map (Glossy steel plates with matte rust patches)
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = size;
    roughCanvas.height = size;
    const ctxR = roughCanvas.getContext('2d')!;

    ctxR.fillStyle = '#444444'; // Smooth metallic base
    ctxR.fillRect(0, 0, size, size);

    // Rough scratchy edges and seams
    ctxR.strokeStyle = '#999999';
    ctxR.lineWidth = 6;
    ctxR.strokeRect(0, 0, size, size);

    for (let i = 0; i < 4000; i++) {
      ctxR.fillStyle = Math.random() < 0.3 ? '#888888' : '#222222';
      ctxR.fillRect(Math.random() * size, Math.random() * size, 3, 3);
    }

    const roughness = new THREE.CanvasTexture(roughCanvas);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;

    // 4. Metalness Map (Pure metal = 240, rust patches = 60)
    const metalCanvas = document.createElement('canvas');
    metalCanvas.width = size;
    metalCanvas.height = size;
    const ctxM = metalCanvas.getContext('2d')!;

    ctxM.fillStyle = '#e5e5e5'; // Highly metallic
    ctxM.fillRect(0, 0, size, size);

    // Dirt and rust reduction
    ctxM.fillStyle = '#444444';
    ctxM.strokeRect(0, 0, size, size);

    const metalness = new THREE.CanvasTexture(metalCanvas);
    metalness.wrapS = THREE.RepeatWrapping;
    metalness.wrapT = THREE.RepeatWrapping;

    // Cache
    this.cachedTextures['metal_diffuse'] = diffuse;
    this.cachedTextures['metal_normal'] = normal;
    this.cachedTextures['metal_roughness'] = roughness;
    this.cachedTextures['metal_metalness'] = metalness;

    return { diffuse, normal, roughness, metalness };
  }

  /**
   * Generates procedural PBR maps for burnished copper and brass with brushed grooves
   */
  public static createCopperPBR(): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    roughness: THREE.CanvasTexture;
    metalness: THREE.CanvasTexture;
  } {
    if (this.cachedTextures['copper_diffuse']) {
      return {
        diffuse: this.cachedTextures['copper_diffuse'],
        normal: this.cachedTextures['copper_normal'],
        roughness: this.cachedTextures['copper_roughness'],
        metalness: this.cachedTextures['copper_metalness'],
      };
    }

    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Copper gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#b87333');
    grad.addColorStop(0.5, '#d97706');
    grad.addColorStop(1, '#8a4f2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Brushed metal streaks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 3) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // Subtle oxidized copper verdigris patina & dark recess streaks
    for (let p = 0; p < 450; p++) {
      const px = Math.random() * size;
      const py = Math.random() * size;
      ctx.fillStyle =
        Math.random() < 0.38
          ? 'rgba(45, 118, 108, 0.14)' // Oxidized turquoise-green verdigris patina
          : 'rgba(38, 22, 12, 0.18)';  // Dark tarnished copper oxide recess
      ctx.fillRect(px, py, 3 + Math.random() * 6, 2 + Math.random() * 4);
    }

    const diffuse = new THREE.CanvasTexture(canvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // Normal
    const nCanvas = document.createElement('canvas');
    nCanvas.width = size;
    nCanvas.height = size;
    const nCtx = nCanvas.getContext('2d')!;
    nCtx.fillStyle = 'rgb(128, 128, 255)';
    nCtx.fillRect(0, 0, size, size);
    nCtx.strokeStyle = 'rgba(140, 140, 255, 0.15)';
    for (let i = 0; i < size; i += 4) {
      nCtx.beginPath();
      nCtx.moveTo(0, i);
      nCtx.lineTo(size, i);
      nCtx.stroke();
    }
    const normal = new THREE.CanvasTexture(nCanvas);

    // Roughness (semi-gloss brushed 0.3)
    const rCanvas = document.createElement('canvas');
    rCanvas.width = 64;
    rCanvas.height = 64;
    const rCtx = rCanvas.getContext('2d')!;
    rCtx.fillStyle = '#4b5563';
    rCtx.fillRect(0, 0, 64, 64);
    const roughness = new THREE.CanvasTexture(rCanvas);

    // Metalness (0.95 high metal)
    const mCanvas = document.createElement('canvas');
    mCanvas.width = 64;
    mCanvas.height = 64;
    const mCtx = mCanvas.getContext('2d')!;
    mCtx.fillStyle = '#f3f4f6';
    mCtx.fillRect(0, 0, 64, 64);
    const metalness = new THREE.CanvasTexture(mCanvas);

    this.cachedTextures['copper_diffuse'] = diffuse;
    this.cachedTextures['copper_normal'] = normal;
    this.cachedTextures['copper_roughness'] = roughness;
    this.cachedTextures['copper_metalness'] = metalness;

    return { diffuse, normal, roughness, metalness };
  }

  /**
   * Generates procedural PBR maps for high-tech armored white hull plating
   * Features beveled panel seams, corner hex-screws, and subtle paint wear.
   */
  public static createArmoredHullPBR(): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    roughness: THREE.CanvasTexture;
    metalness: THREE.CanvasTexture;
  } {
    if (this.cachedTextures['hull_diffuse']) {
      return {
        diffuse: this.cachedTextures['hull_diffuse'],
        normal: this.cachedTextures['hull_normal'],
        roughness: this.cachedTextures['hull_roughness'],
        metalness: this.cachedTextures['hull_metalness'],
      };
    }

    const size = 512;
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = size;
    diffCanvas.height = size;
    const ctxD = diffCanvas.getContext('2d')!;

    // Warm weathered steampunk enamel-steel base (grounds the robot in the industrial valley)
    const hullGrad = ctxD.createLinearGradient(0, 0, size, size);
    hullGrad.addColorStop(0, '#d8d3c8');
    hullGrad.addColorStop(0.5, '#c7c0b4');
    hullGrad.addColorStop(1, '#b5aca0');
    ctxD.fillStyle = hullGrad;
    ctxD.fillRect(0, 0, size, size);

    // Beveled panel lines with warm soot & oil recess shading
    ctxD.strokeStyle = '#574c41';
    ctxD.lineWidth = 5;
    ctxD.strokeRect(6, 6, size - 12, size - 12);
    ctxD.beginPath();
    ctxD.moveTo(size * 0.35, 6);
    ctxD.lineTo(size * 0.35, size - 6);
    ctxD.stroke();

    // Subtle edge scuffs, warm rust flecks, and industrial micro-dirt
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random();
      ctxD.fillStyle =
        r < 0.25
          ? 'rgba(92, 64, 38, 0.14)'
          : r < 0.45
          ? 'rgba(45, 38, 32, 0.12)'
          : 'rgba(245, 240, 230, 0.18)';
      ctxD.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }

    // Hex-bolt indentations at plate corners
    const boltPoints = [
      [24, 24], [size - 24, 24], [24, size - 24], [size - 24, size - 24],
      [size * 0.35 - 16, 24], [size * 0.35 + 16, 24],
      [size * 0.35 - 16, size - 24], [size * 0.35 + 16, size - 24]
    ];
    boltPoints.forEach(([bx, by]) => {
      ctxD.fillStyle = '#5c4938';
      ctxD.beginPath();
      ctxD.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctxD.fill();
      ctxD.fillStyle = '#d4a359';
      ctxD.beginPath();
      ctxD.arc(bx - 1.5, by - 1.5, 2.2, 0, Math.PI * 2);
      ctxD.fill();
    });

    const diffuse = new THREE.CanvasTexture(diffCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // Normal Map for panel bevels and bolts
    const normCanvas = document.createElement('canvas');
    normCanvas.width = size;
    normCanvas.height = size;
    const ctxN = normCanvas.getContext('2d')!;
    ctxN.fillStyle = 'rgb(128, 128, 255)';
    ctxN.fillRect(0, 0, size, size);

    // Embossed panel lines
    ctxN.fillStyle = 'rgb(150, 128, 245)';
    ctxN.fillRect(4, 4, size - 8, 4);
    ctxN.fillRect(4, 4, 4, size - 8);
    ctxN.fillStyle = 'rgb(105, 128, 245)';
    ctxN.fillRect(size - 8, 4, 4, size - 8);
    ctxN.fillRect(4, size - 8, size - 8, 4);

    boltPoints.forEach(([bx, by]) => {
      const grad = ctxN.createRadialGradient(bx - 1, by - 1, 1, bx, by, 5);
      grad.addColorStop(0, 'rgb(160, 160, 255)');
      grad.addColorStop(1, 'rgb(110, 110, 230)');
      ctxN.fillStyle = grad;
      ctxN.beginPath();
      ctxN.arc(bx, by, 5, 0, Math.PI * 2);
      ctxN.fill();
    });

    const normal = new THREE.CanvasTexture(normCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;

    // Roughness: Smooth glossy ceramic armor (0.28) with matte worn seams
    const roughCanvas = document.createElement('canvas');
    roughCanvas.width = size;
    roughCanvas.height = size;
    const ctxR = roughCanvas.getContext('2d')!;
    ctxR.fillStyle = '#444444';
    ctxR.fillRect(0, 0, size, size);
    ctxR.strokeStyle = '#888888';
    ctxR.lineWidth = 4;
    ctxR.strokeRect(6, 6, size - 12, size - 12);
    const roughness = new THREE.CanvasTexture(roughCanvas);

    // Metalness: Non-metal painted outer coating with subtle specular metalness
    const metalCanvas = document.createElement('canvas');
    metalCanvas.width = size;
    metalCanvas.height = size;
    const ctxM = metalCanvas.getContext('2d')!;
    ctxM.fillStyle = '#333333';
    ctxM.fillRect(0, 0, size, size);
    const metalness = new THREE.CanvasTexture(metalCanvas);

    this.cachedTextures['hull_diffuse'] = diffuse;
    this.cachedTextures['hull_normal'] = normal;
    this.cachedTextures['hull_roughness'] = roughness;
    this.cachedTextures['hull_metalness'] = metalness;

    return { diffuse, normal, roughness, metalness };
  }

  /**
   * Generates procedural PBR maps for industrial Steampunk Bronze/Brass Diamond Tread Grate
   */
  public static createDiamondTreadPBR(): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    roughness: THREE.CanvasTexture;
    metalness: THREE.CanvasTexture;
  } {
    if (this.cachedTextures['tread_diffuse']) {
      return {
        diffuse: this.cachedTextures['tread_diffuse'],
        normal: this.cachedTextures['tread_normal'],
        roughness: this.cachedTextures['tread_roughness'],
        metalness: this.cachedTextures['tread_metalness'],
      };
    }

    const size = 256;
    const dCanvas = document.createElement('canvas');
    dCanvas.width = size;
    dCanvas.height = size;
    const ctxD = dCanvas.getContext('2d')!;

    // Warm dark bronze/brown-iron base
    ctxD.fillStyle = '#362211';
    ctxD.fillRect(0, 0, size, size);

    const step = 32;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        ctxD.save();
        ctxD.translate(x + step / 2, y + step / 2);
        ctxD.rotate(Math.PI / 4);
        ctxD.fillStyle = '#7c4d23';
        ctxD.fillRect(-10, -3, 20, 6);
        ctxD.fillStyle = 'rgba(251, 191, 36, 0.35)';
        ctxD.fillRect(-10, -3, 20, 2);
        ctxD.restore();
      }
    }

    const diffuse = new THREE.CanvasTexture(dCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(6, 6);
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // Normal Map for diamond tread pattern
    const nCanvas = document.createElement('canvas');
    nCanvas.width = size;
    nCanvas.height = size;
    const ctxN = nCanvas.getContext('2d')!;
    ctxN.fillStyle = 'rgb(128, 128, 255)';
    ctxN.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        ctxN.save();
        ctxN.translate(x + step / 2, y + step / 2);
        ctxN.rotate(Math.PI / 4);
        ctxN.fillStyle = 'rgb(170, 128, 240)';
        ctxN.fillRect(-10, -3, 20, 3);
        ctxN.fillStyle = 'rgb(90, 128, 240)';
        ctxN.fillRect(-10, 0, 20, 3);
        ctxN.restore();
      }
    }

    const normal = new THREE.CanvasTexture(nCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(6, 6);

    const rCanvas = document.createElement('canvas');
    rCanvas.width = 64;
    rCanvas.height = 64;
    const ctxR = rCanvas.getContext('2d')!;
    ctxR.fillStyle = '#554433';
    ctxR.fillRect(0, 0, 64, 64);
    const roughness = new THREE.CanvasTexture(rCanvas);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(6, 6);

    const mCanvas = document.createElement('canvas');
    mCanvas.width = 64;
    mCanvas.height = 64;
    const ctxM = mCanvas.getContext('2d')!;
    ctxM.fillStyle = '#d6c7b2';
    ctxM.fillRect(0, 0, 64, 64);
    const metalness = new THREE.CanvasTexture(mCanvas);
    metalness.wrapS = THREE.RepeatWrapping;
    metalness.wrapT = THREE.RepeatWrapping;
    metalness.repeat.set(6, 6);

    this.cachedTextures['tread_diffuse'] = diffuse;
    this.cachedTextures['tread_normal'] = normal;
    this.cachedTextures['tread_roughness'] = roughness;
    this.cachedTextures['tread_metalness'] = metalness;

    return { diffuse, normal, roughness, metalness };
  }

  /**
   * Generates procedural PBR maps for Industrial Scrapyard & Foundry Terrain
   * Features desaturated ash-slate earth, warm sienna-ochre dust, compacted slag gravel, and oil stains.
   */
  public static createWeatheredConcretePBR(): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    roughness: THREE.CanvasTexture;
  } {
    if (this.cachedTextures['concrete_diffuse']) {
      return {
        diffuse: this.cachedTextures['concrete_diffuse'],
        normal: this.cachedTextures['concrete_normal'],
        roughness: this.cachedTextures['concrete_roughness'],
      };
    }

    const size = 512;
    const dCanvas = document.createElement('canvas');
    dCanvas.width = size;
    dCanvas.height = size;
    const ctx = dCanvas.getContext('2d')!;

    // Grounded dark ash-ochre & weathered industrial earth base (avoids overly bright orange)
    const baseGrad = ctx.createLinearGradient(0, 0, size, size);
    baseGrad.addColorStop(0, '#2e2722');
    baseGrad.addColorStop(0.5, '#382f28');
    baseGrad.addColorStop(1, '#26201b');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, size, size);

    // Organic gravel, slag, muted ochre dust, and dark iron grit speckles
    for (let i = 0; i < 14000; i++) {
      const r = Math.random();
      if (r < 0.3) {
        ctx.fillStyle = 'rgba(138, 102, 66, 0.14)'; // Muted warm ochre dust
      } else if (r < 0.65) {
        ctx.fillStyle = 'rgba(74, 58, 46, 0.18)';   // Weathered sienna-slate
      } else {
        ctx.fillStyle = 'rgba(20, 18, 16, 0.18)';   // Dark coal/slag grit
      }
      ctx.fillRect(Math.random() * size, Math.random() * size, 2 + Math.random() * 5, 2 + Math.random() * 5);
    }

    // Subtle heavy vehicle/crawler track ruts & industrial slab seams
    ctx.strokeStyle = 'rgba(22, 18, 15, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.moveTo(0, size / 2);
    ctx.lineTo(size, size / 2);
    ctx.stroke();

    // Damp industrial oil & soot patch
    const oilGrad = ctx.createRadialGradient(size * 0.65, size * 0.4, 5, size * 0.65, size * 0.4, 90);
    oilGrad.addColorStop(0, 'rgba(24, 20, 18, 0.35)');
    oilGrad.addColorStop(0.6, 'rgba(68, 48, 32, 0.15)');
    oilGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = oilGrad;
    ctx.fillRect(0, 0, size, size);

    const diffuse = new THREE.CanvasTexture(dCanvas);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(22, 22);
    diffuse.colorSpace = THREE.SRGBColorSpace;

    // Normal Map with gritty earth & slab relief
    const nCanvas = document.createElement('canvas');
    nCanvas.width = size;
    nCanvas.height = size;
    const ctxN = nCanvas.getContext('2d')!;
    ctxN.fillStyle = 'rgb(128, 128, 255)';
    ctxN.fillRect(0, 0, size, size);

    for (let i = 0; i < 4500; i++) {
      ctxN.fillStyle = Math.random() < 0.5 ? 'rgb(144, 136, 246)' : 'rgb(112, 120, 246)';
      ctxN.fillRect(Math.random() * size, Math.random() * size, 3, 3);
    }

    const normal = new THREE.CanvasTexture(nCanvas);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(22, 22);

    const rCanvas = document.createElement('canvas');
    rCanvas.width = 64;
    rCanvas.height = 64;
    const ctxR = rCanvas.getContext('2d')!;
    ctxR.fillStyle = '#a89f96';
    ctxR.fillRect(0, 0, 64, 64);
    const roughness = new THREE.CanvasTexture(rCanvas);
    roughness.wrapS = THREE.RepeatWrapping;
    roughness.wrapT = THREE.RepeatWrapping;
    roughness.repeat.set(22, 22);

    this.cachedTextures['concrete_diffuse'] = diffuse;
    this.cachedTextures['concrete_normal'] = normal;
    this.cachedTextures['concrete_roughness'] = roughness;

    return { diffuse, normal, roughness };
  }

  /**
   * Generates procedural PBR maps for glowing Electronic Circuit Board with gold traces
   */
  public static createCircuitBoardPBR(): {
    diffuse: THREE.CanvasTexture;
    normal: THREE.CanvasTexture;
    emissive: THREE.CanvasTexture;
  } {
    if (this.cachedTextures['pcb_diffuse']) {
      return {
        diffuse: this.cachedTextures['pcb_diffuse'],
        normal: this.cachedTextures['pcb_normal'],
        emissive: this.cachedTextures['pcb_emissive'],
      };
    }

    const size = 512;
    const diff = document.createElement('canvas');
    diff.width = size;
    diff.height = size;
    const dCtx = diff.getContext('2d')!;

    const em = document.createElement('canvas');
    em.width = size;
    em.height = size;
    const eCtx = em.getContext('2d')!;

    // Warm dark bronze substrate
    dCtx.fillStyle = '#1f1308';
    dCtx.fillRect(0, 0, size, size);
    eCtx.fillStyle = '#000000';
    eCtx.fillRect(0, 0, size, size);

    // Glowing golden/amber & cyan circuit traces
    const traces = [
      [[40, 40], [120, 40], [160, 80], [160, 220], [300, 220], [340, 260]],
      [[200, 40], [200, 160], [280, 160], [320, 120], [460, 120]],
      [[40, 300], [140, 300], [180, 340], [180, 460]],
      [[260, 320], [320, 320], [380, 380], [460, 380]],
    ];

    traces.forEach((pts, idx) => {
      const color = idx % 2 === 0 ? '#fbbf24' : '#f59e0b';
      dCtx.strokeStyle = color;
      dCtx.lineWidth = 3;
      dCtx.beginPath();
      pts.forEach(([px, py], i) => {
        if (i === 0) dCtx.moveTo(px, py);
        else dCtx.lineTo(px, py);
      });
      dCtx.stroke();

      eCtx.strokeStyle = color;
      eCtx.lineWidth = 3;
      eCtx.beginPath();
      pts.forEach(([px, py], i) => {
        if (i === 0) eCtx.moveTo(px, py);
        else eCtx.lineTo(px, py);
      });
      dCtx.stroke();

      // Solder nodes at corners
      pts.forEach(([px, py]) => {
        dCtx.fillStyle = '#fbbf24';
        dCtx.beginPath();
        dCtx.arc(px, py, 4, 0, Math.PI * 2);
        dCtx.fill();

        eCtx.fillStyle = '#fef08a';
        eCtx.beginPath();
        eCtx.arc(px, py, 3, 0, Math.PI * 2);
        eCtx.fill();
      });
    });

    const diffuse = new THREE.CanvasTexture(diff);
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    diffuse.colorSpace = THREE.SRGBColorSpace;

    const emissive = new THREE.CanvasTexture(em);
    emissive.wrapS = THREE.RepeatWrapping;
    emissive.wrapT = THREE.RepeatWrapping;
    emissive.colorSpace = THREE.SRGBColorSpace;

    const nCanvas = document.createElement('canvas');
    nCanvas.width = size;
    nCanvas.height = size;
    const nCtx = nCanvas.getContext('2d')!;
    nCtx.fillStyle = 'rgb(128, 128, 255)';
    nCtx.fillRect(0, 0, size, size);
    const normal = new THREE.CanvasTexture(nCanvas);

    this.cachedTextures['pcb_diffuse'] = diffuse;
    this.cachedTextures['pcb_normal'] = normal;
    this.cachedTextures['pcb_emissive'] = emissive;

    return { diffuse, normal, emissive };
  }

  /**
   * Generates a 360-degree panoramic Atmospheric Industrial Environment Map!
   * Combines cool slate-indigo upper sky reflections with warm amber horizon light for realistic metal PBR.
   */
  public static createEnvironmentMap(renderer: THREE.WebGLRenderer): THREE.Texture {
    if (this.cachedEnvMap) {
      return this.cachedEnvMap;
    }

    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Balanced Cool-Slate Zenith to Warm Golden-Amber Horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#1e242b');    // Zenith (moody slate charcoal)
    skyGrad.addColorStop(0.28, '#383838'); // Upper clouds (warm storm gray)
    skyGrad.addColorStop(0.46, '#b4783c'); // Horizon (warm golden ochre)
    skyGrad.addColorStop(0.54, '#8a5229'); // Lower horizon (muted copper)
    skyGrad.addColorStop(0.72, '#2d251e'); // Ground transition
    skyGrad.addColorStop(1, '#181411');    // Nadir
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant factory silhouettes along horizon
    ctx.fillStyle = '#1f1b18';
    for (let x = 0; x < width; x += 24) {
      const bh = 20 + Math.sin(x * 0.05) * 16 + (x % 31);
      ctx.fillRect(x, height * 0.5 - bh, 18, bh + 10);
    }

    // Diffused Sun Glow
    const sunGrad = ctx.createRadialGradient(width * 0.35, height * 0.44, 4, width * 0.35, height * 0.44, 160);
    sunGrad.addColorStop(0, 'rgba(255, 248, 225, 0.95)');
    sunGrad.addColorStop(0.3, 'rgba(235, 175, 90, 0.65)');
    sunGrad.addColorStop(0.7, 'rgba(140, 85, 45, 0.25)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envRenderTarget = pmremGenerator.fromEquirectangular(texture);

    this.cachedEnvMap = envRenderTarget.texture;
    return this.cachedEnvMap;
  }

  /**
   * Generates a 2048x1024 Panoramic Industrial Valley & Distant Factory Sky-Dome Texture!
   * Features:
   * - Moody slate-amber twilight sky with multi-layered volumetric storm & steam clouds
   * - Sunburst rays breaking through cloud banks
   * - Distant silhouette mountain ridges & arched steel viaducts
   * - Horizon ringed by massive industrial complexes: hyperboloid cooling towers, sawtooth foundries,
   *   harbor cranes, blast furnaces, and billowing smoke plumes rising into the cloud deck.
   */
  public static createSubterraneanCitySkyTexture(): THREE.CanvasTexture {
    if (this.cachedTextures['subterranean_sky']) {
      return this.cachedTextures['subterranean_sky'];
    }

    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // 1. Atmospheric Sky Gradient (Deep slate-bronze zenith -> warm golden-amber industrial horizon)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0.0, '#161b22');   // Deep twilight zenith
    bgGrad.addColorStop(0.18, '#25292e');  // Upper cloud deck
    bgGrad.addColorStop(0.32, '#423830');  // Mid sky warm slate-umber
    bgGrad.addColorStop(0.43, '#785538');  // Golden-ochre haze
    bgGrad.addColorStop(0.50, '#b57c46');  // Luminous amber horizon band
    bgGrad.addColorStop(0.56, '#382e26');  // Below horizon ground blend
    bgGrad.addColorStop(1.0, '#1c1713');   // Nadir
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    let seed = 91;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // 2. Layered Volumetric Clouds across the Sky (Lit from beneath by warm amber sunset/furnace glow)
    for (let c = 0; c < 110; c++) {
      const cx = rand() * width;
      const cy = 90 + rand() * (height * 0.32);
      const rx = 70 + rand() * 160;
      const ry = 22 + rand() * 48;

      const cloudGrad = ctx.createLinearGradient(cx, cy - ry, cx, cy + ry);
      cloudGrad.addColorStop(0, 'rgba(32, 36, 42, 0.38)');
      cloudGrad.addColorStop(0.65, 'rgba(68, 56, 46, 0.32)');
      cloudGrad.addColorStop(1, 'rgba(217, 152, 82, 0.22)'); // Warm under-lit cloud rim
      ctx.fillStyle = cloudGrad;

      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Crepuscular Sun Rays breaking through the cloud layer
    const sunX = width * 0.32;
    const sunY = height * 0.34;
    const sunHalo = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 260);
    sunHalo.addColorStop(0, 'rgba(255, 247, 220, 0.65)');
    sunHalo.addColorStop(0.35, 'rgba(235, 175, 95, 0.32)');
    sunHalo.addColorStop(1, 'rgba(235, 175, 95, 0.0)');
    ctx.fillStyle = sunHalo;
    ctx.fillRect(0, 0, width, height);

    // 4. Distant Mountain Ridges & Arched Viaduct Silhouettes (Aerial Perspective Layer 1)
    ctx.fillStyle = '#3d3127';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.51);
    for (let x = 0; x <= width; x += 32) {
      const mh = 55 + Math.sin(x * 0.008) * 35 + Math.cos(x * 0.023) * 20;
      ctx.lineTo(x, height * 0.51 - mh);
    }
    ctx.lineTo(width, height * 0.51);
    ctx.closePath();
    ctx.fill();

    // 5. Distant Factory Complexes, Cooling Towers, Blast Furnaces & Billowing Smoke Plumes (Layer 2)
    let fx = 0;
    while (fx < width) {
      const clusterType = Math.floor(rand() * 4);
      const baseY = height * 0.51;

      if (clusterType === 0) {
        // Sawtooth Roof Foundry + Tall Smokestacks with Billowing Smoke Plumes
        const fw = 75 + rand() * 55;
        const fh = 38 + rand() * 28;
        ctx.fillStyle = '#26201b';
        ctx.fillRect(fx, baseY - fh, fw, fh + 20);

        // Sawtooth roof teeth
        for (let sx = fx; sx < fx + fw - 12; sx += 16) {
          ctx.beginPath();
          ctx.moveTo(sx, baseY - fh);
          ctx.lineTo(sx + 16, baseY - fh - 12);
          ctx.lineTo(sx + 16, baseY - fh);
          ctx.closePath();
          ctx.fill();
        }

        // Tall Twin Smokestacks + Rising Smoke Plume
        const stackX = fx + fw * 0.35;
        const stackH = fh + 45 + rand() * 35;
        ctx.fillRect(stackX, baseY - stackH, 7, stackH);
        ctx.fillRect(stackX + 16, baseY - stackH + 10, 6, stackH - 10);

        // Billowing smoke plume drifting across sky
        for (let p = 0; p < 9; p++) {
          const px = stackX + 6 + p * 14;
          const py = baseY - stackH - 8 - p * 9;
          const pr = 10 + p * 6;
          const smokeGrad = ctx.createRadialGradient(px, py, 2, px, py, pr);
          smokeGrad.addColorStop(0, 'rgba(42, 38, 35, 0.42)');
          smokeGrad.addColorStop(1, 'rgba(42, 38, 35, 0.0)');
          ctx.fillStyle = smokeGrad;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle warm factory windows
        ctx.fillStyle = 'rgba(245, 175, 70, 0.65)';
        for (let wx = fx + 8; wx < fx + fw - 10; wx += 12) {
          ctx.fillRect(wx, baseY - fh + 10, 6, 8);
        }
        fx += fw + 15;
      } else if (clusterType === 1) {
        // Hyperboloid Cooling Tower Pair + Pipe Trestle
        const tw = 44;
        const th = 62;
        ctx.fillStyle = '#29231e';
        ctx.beginPath();
        ctx.moveTo(fx, baseY);
        ctx.quadraticCurveTo(fx + 8, baseY - th * 0.5, fx + 6, baseY - th);
        ctx.lineTo(fx + tw - 6, baseY - th);
        ctx.quadraticCurveTo(fx + tw - 8, baseY - th * 0.5, fx + tw, baseY);
        ctx.closePath();
        ctx.fill();

        // Rising white-amber steam cloud above cooling tower
        for (let s = 0; s < 6; s++) {
          const sx = fx + tw / 2 + s * 8;
          const sy = baseY - th - 10 - s * 10;
          const sr = 14 + s * 5;
          const stGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, sr);
          stGrad.addColorStop(0, 'rgba(195, 165, 135, 0.26)');
          stGrad.addColorStop(1, 'rgba(195, 165, 135, 0.0)');
          ctx.fillStyle = stGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
        fx += tw + 24;
      } else if (clusterType === 2) {
        // Distant Harbor / Shipyard Lattice Crane Silhouette
        ctx.strokeStyle = '#241e1a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fx + 10, baseY);
        ctx.lineTo(fx + 18, baseY - 82);
        ctx.lineTo(fx + 26, baseY);
        // Horizontal crane boom
        ctx.moveTo(fx - 15, baseY - 76);
        ctx.lineTo(fx + 75, baseY - 80);
        ctx.lineTo(fx + 18, baseY - 92);
        ctx.closePath();
        ctx.stroke();
        fx += 85;
      } else {
        // Arched Industrial Viaduct Bridge
        const vw = 110;
        const vh = 42;
        ctx.fillStyle = '#2b241e';
        ctx.fillRect(fx, baseY - vh, vw, 8);
        for (let ax = fx; ax < fx + vw - 20; ax += 28) {
          ctx.fillRect(ax, baseY - vh, 8, vh);
        }
        fx += vw + 12;
      }
    }

    // 6. Atmospheric Horizon Mist Band so the sky dome blends seamlessly into the 3D terrain fog
    const mistGrad = ctx.createLinearGradient(0, height * 0.45, 0, height * 0.56);
    mistGrad.addColorStop(0, 'rgba(68, 52, 38, 0.0)');
    mistGrad.addColorStop(0.55, 'rgba(68, 52, 38, 0.65)');
    mistGrad.addColorStop(1, 'rgba(46, 37, 30, 1.0)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, height * 0.45, width, height * 0.12);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;

    this.cachedTextures['subterranean_sky'] = tex;
    return tex;
  }
}
