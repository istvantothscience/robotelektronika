import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface BatchResult {
  meshesBefore: number;
  meshesAfter: number;
  mergedGeometries: THREE.BufferGeometry[];
}

const CELL_SIZE = 36;

/**
 * Merges static, opaque, single-material meshes that share a material into a few large meshes
 * (grouped by spatial cell so frustum + shadow culling still works). This turns ~1500 draw calls
 * into a few dozen without changing how anything looks.
 *
 * Anything inside a `protectedRoots` subtree (animated, interactive, transparent effects) is left
 * untouched. `root` must be at the origin with an identity transform.
 */
export function mergeStaticMeshes(
  root: THREE.Group,
  protectedRoots: Array<THREE.Object3D | null | undefined>
): BatchResult {
  root.updateMatrixWorld(true);
  const protectedSet = new Set<THREE.Object3D>(protectedRoots.filter(Boolean) as THREE.Object3D[]);

  const isMergeable = (mesh: THREE.Mesh): boolean => {
    if ((mesh as THREE.InstancedMesh).isInstancedMesh || (mesh as THREE.SkinnedMesh).isSkinnedMesh) return false;
    const mat = mesh.material;
    if (Array.isArray(mat)) return false;
    if (!mat || mat.transparent || mat.depthWrite === false) return false;
    const geo = mesh.geometry;
    if (!geo.attributes.position || geo.morphAttributes.position) return false;
    if (mesh.matrixWorld.determinant() <= 0) return false;
    for (let o: THREE.Object3D | null = mesh; o && o !== root; o = o.parent) {
      if (protectedSet.has(o) || !o.visible) return false;
    }
    return true;
  };

  const buckets = new Map<string, THREE.Mesh[]>();
  let meshesBefore = 0;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshesBefore++;
    if (!isMergeable(mesh)) return;
    const mat = mesh.material as THREE.Material;
    const wp = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld);
    const cell = `${Math.floor(wp.x / CELL_SIZE)}_${Math.floor(wp.z / CELL_SIZE)}`;
    const key = `${mat.uuid}|${mesh.castShadow ? 1 : 0}${mesh.receiveShadow ? 1 : 0}|${mesh.renderOrder}|${cell}`;
    const list = buckets.get(key);
    if (list) list.push(mesh);
    else buckets.set(key, [mesh]);
  });

  const mergedGeometries: THREE.BufferGeometry[] = [];
  let created = 0;
  let removed = 0;

  buckets.forEach((meshes) => {
    if (meshes.length < 2) return;

    const allIndexed = meshes.every((m) => m.geometry.index);
    const parts: THREE.BufferGeometry[] = [];
    for (const m of meshes) {
      let g = m.geometry.clone();
      if (!allIndexed && g.index) g = g.toNonIndexed();
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) {
        g.setAttribute(
          'uv',
          new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)
        );
      }
      for (const name of Object.keys(g.attributes)) {
        if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
      }
      g.applyMatrix4(m.matrixWorld);
      parts.push(g);
    }

    const merged = mergeGeometries(parts, false);
    parts.forEach((g) => g.dispose());
    if (!merged) {
      if (import.meta.env.DEV) console.warn('[StaticBatcher] merge failed for', meshes.length, 'meshes');
      return;
    }
    merged.computeBoundingSphere();
    merged.computeBoundingBox();

    const first = meshes[0];
    const batch = new THREE.Mesh(merged, first.material);
    batch.castShadow = first.castShadow;
    batch.receiveShadow = first.receiveShadow;
    batch.renderOrder = first.renderOrder;
    batch.name = 'static-batch';
    root.add(batch);
    mergedGeometries.push(merged);
    created++;

    for (const m of meshes) {
      m.parent?.remove(m);
      removed++;
    }
  });

  return {
    meshesBefore,
    meshesAfter: meshesBefore - removed + created,
    mergedGeometries,
  };
}
