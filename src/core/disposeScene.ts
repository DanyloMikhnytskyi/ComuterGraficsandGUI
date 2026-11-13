/**
 * ============================================
 *  Author:  Danylo Mikhnytskyi (284125)
 *  File:    src/core/disposeScene.ts
 *  Desc:    Free all GPU resources (geometries, materials, textures) of a scene
 * ============================================
 */

import * as THREE from "three";

export function disposeScene(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material) {
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of list) {
        materials.add(m);
        for (const value of Object.values(m)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    }
  });

  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
  root.clear();
}
