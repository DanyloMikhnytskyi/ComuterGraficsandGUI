/**
 * ============================================
 *  Author:  Danylo Mikhnytskyi (284125)
 *  File:    src/core/environment.ts
 *  Desc:    Sky, lighting, ground, landing pad, gate course, buildings
 * ============================================
 *
 *  Everything here uses built-in materials only (no custom shaders) and a
 *  DataTexture for the ground, so the same code renders on web and expo-gl.
 */

import * as THREE from "three";
import { SHADOW_EXTENT } from "./constants";

export interface EnvironmentOptions {
  shadows: boolean;
  /** renderer.capabilities.getMaxAnisotropy(), improves the ground at grazing angles */
  maxAnisotropy?: number;
}

export interface Environment {
  /** focus = drone position (shadow frustum follows it), eye = camera position (sky dome follows it) */
  update(dt: number, focus: THREE.Vector3, eye: THREE.Vector3): void;
  dispose(): void;
}

const SKY_TOP = new THREE.Color("#2f6fc9");
const SKY_HORIZON = new THREE.Color("#cfe2f3");
const GROUND_SIZE = 4000;
const SUN_DIRECTION = new THREE.Vector3(60, 120, 40).normalize();

/* ── Sky dome (vertex-colour gradient) ──────── */

function createSky(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(2000, 32, 16);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const h = pos.getY(i) / 2000; // -1..1
    const t = Math.pow(Math.max(0, h), 0.5);
    c.copy(SKY_HORIZON).lerp(SKY_TOP, t);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const sky = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    })
  );
  sky.name = "sky";
  sky.renderOrder = -1; // always painted first, everything else draws over it
  sky.frustumCulled = false;

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(60, 16, 12),
    new THREE.MeshBasicMaterial({ color: "#fff6d5", fog: false, depthWrite: false })
  );
  sun.position.copy(SUN_DIRECTION).multiplyScalar(1800);
  sun.renderOrder = -1;
  sky.add(sun);
  return sky;
}

/* ── Ground (checkerboard DataTexture) ──────── */

function createGroundTexture(maxAnisotropy: number): THREE.DataTexture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const light = [86, 140, 70];
  const dark = [66, 116, 56];
  const line = [210, 220, 200];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const checker = (x < size / 2) !== (y < size / 2);
      const isLine = x === 0 || y === 0;
      const col = isLine ? line : checker ? light : dark;
      const i = (y * size + x) * 4;
      data[i] = col[0];
      data[i + 1] = col[1];
      data[i + 2] = col[2];
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = maxAnisotropy;
  tex.colorSpace = THREE.SRGBColorSpace;
  // One texture tile = 10 m → 5 m checks with a grid line every 10 m
  tex.repeat.set(GROUND_SIZE / 10, GROUND_SIZE / 10);
  tex.needsUpdate = true;
  return tex;
}

/* ── Landing pad ────────────────────────────── */

function createLandingPad(): THREE.Group {
  const pad = new THREE.Group();
  pad.name = "landingPad";

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3, 0.02, 48),
    new THREE.MeshStandardMaterial({ color: "#34495e", roughness: 0.9 })
  );
  base.position.y = 0.01;
  base.receiveShadow = true;
  pad.add(base);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.5, 2.8, 48),
    new THREE.MeshStandardMaterial({ color: "#f1c40f", roughness: 0.7 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.022;
  ring.receiveShadow = true;
  pad.add(ring);

  const hMat = new THREE.MeshStandardMaterial({ color: "#ecf0f1", roughness: 0.7 });
  const bar = new THREE.BoxGeometry(0.35, 0.005, 2.2);
  const cross = new THREE.BoxGeometry(1.1, 0.005, 0.35);
  for (const [geo, x] of [
    [bar, -0.72],
    [bar, 0.72],
    [cross, 0],
  ] as const) {
    const m = new THREE.Mesh(geo, hMat);
    m.position.set(x, 0.023, 0);
    m.receiveShadow = true;
    pad.add(m);
  }
  return pad;
}

/* ── Gate course ────────────────────────────── */

const GATES: Array<{ x: number; z: number; y: number; color: string }> = [
  { x: 0, z: -30, y: 4, color: "#e74c3c" },
  { x: 25, z: -60, y: 7, color: "#f39c12" },
  { x: 60, z: -55, y: 10, color: "#f1c40f" },
  { x: 75, z: -20, y: 6, color: "#2ecc71" },
  { x: 50, z: 10, y: 9, color: "#3498db" },
  { x: 20, z: 15, y: 5, color: "#9b59b6" },
];
const GATE_RADIUS = 2.5;
const GATE_TUBE = 0.22;

function createGates(): THREE.Group {
  const course = new THREE.Group();
  course.name = "gates";
  const ringGeo = new THREE.TorusGeometry(GATE_RADIUS, GATE_TUBE, 12, 48);
  const pillarMat = new THREE.MeshStandardMaterial({ color: "#7f8c8d", roughness: 0.6, metalness: 0.4 });

  GATES.forEach((g, i) => {
    const prev = GATES[(i - 1 + GATES.length) % GATES.length];
    const next = GATES[(i + 1) % GATES.length];
    // Face the ring along the average flight direction through it
    const heading = Math.atan2(next.x - prev.x, next.z - prev.z);

    const gate = new THREE.Group();
    gate.position.set(g.x, 0, g.z);
    gate.rotation.y = heading;

    const ringMat = new THREE.MeshStandardMaterial({
      color: g.color,
      emissive: g.color,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = g.y;
    ring.castShadow = true;
    gate.add(ring);

    const pillarH = g.y - GATE_RADIUS - GATE_TUBE * 0.5;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, pillarH, 12), pillarMat);
    pillar.position.y = pillarH / 2;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    gate.add(pillar);

    course.add(gate);
  });
  return course;
}

/* ── Buildings & pylons ─────────────────────── */

const BUILDINGS: Array<[x: number, z: number, w: number, h: number, d: number, color: string]> = [
  [-35, -45, 10, 25, 10, "#95a5a6"],
  [-50, 5, 12, 18, 8, "#bdc3c7"],
  [40, -95, 14, 20, 10, "#a1887f"],
  [105, -30, 10, 32, 10, "#90a4ae"],
  [70, 45, 16, 14, 12, "#b0bec5"],
  [-15, -90, 6, 35, 6, "#78909c"],
];
const PYLONS: Array<[x: number, z: number, h: number]> = [
  [-12, -15, 18],
  [40, -30, 24],
  [85, -75, 20],
  [-25, 30, 15],
];

function createStructures(): { group: THREE.Group; beacons: THREE.MeshStandardMaterial } {
  const group = new THREE.Group();
  group.name = "structures";

  const box = new THREE.BoxGeometry(1, 1, 1);
  for (const [x, z, w, h, d, color] of BUILDINGS) {
    const b = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
    b.scale.set(w, h, d);
    b.position.set(x, h / 2, z);
    b.castShadow = true;
    b.receiveShadow = true;
    group.add(b);

    // Roof slab for a bit of silhouette detail
    const roof = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: "#546e7a", roughness: 0.9 }));
    roof.scale.set(w * 0.6, 1.2, d * 0.6);
    roof.position.set(x, h + 0.6, z);
    roof.castShadow = true;
    group.add(roof);
  }

  const whiteMat = new THREE.MeshStandardMaterial({ color: "#ecf0f1", roughness: 0.6 });
  const redMat = new THREE.MeshStandardMaterial({ color: "#c0392b", roughness: 0.6 });
  const beacons = new THREE.MeshStandardMaterial({ color: "#ff3b30", emissive: "#ff3b30", emissiveIntensity: 2 });
  const beaconGeo = new THREE.SphereGeometry(0.4, 12, 8);
  const SEGMENTS = 6;

  for (const [x, z, h] of PYLONS) {
    const segH = h / SEGMENTS;
    const segGeo = new THREE.CylinderGeometry(0.35, 0.5, segH, 12);
    for (let s = 0; s < SEGMENTS; s++) {
      const seg = new THREE.Mesh(segGeo, s % 2 === 0 ? redMat : whiteMat);
      seg.position.set(x, segH * (s + 0.5), z);
      seg.castShadow = true;
      group.add(seg);
    }
    const beacon = new THREE.Mesh(beaconGeo, beacons);
    beacon.position.set(x, h + 0.4, z);
    group.add(beacon);
  }

  return { group, beacons };
}

/* ── Public API ─────────────────────────────── */

export function createEnvironment(
  scene: THREE.Scene,
  options: EnvironmentOptions
): Environment {
  scene.background = SKY_HORIZON.clone();
  scene.fog = new THREE.Fog(SKY_HORIZON.getHex(), 250, 1600);

  const sky = createSky();
  scene.add(sky);

  /* Lighting */
  const hemi = new THREE.HemisphereLight("#bcd9ff", "#4a6b3a", 1.3);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight("#fff4e0", 2.4);
  sun.position.copy(SUN_DIRECTION).multiplyScalar(150);
  scene.add(sun);
  scene.add(sun.target);

  if (options.shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const cam = sun.shadow.camera;
    cam.left = -SHADOW_EXTENT;
    cam.right = SHADOW_EXTENT;
    cam.top = SHADOW_EXTENT;
    cam.bottom = -SHADOW_EXTENT;
    cam.near = 1;
    cam.far = 400;
    cam.updateProjectionMatrix();
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
  }

  /* Ground */
  const groundTex = createGroundTexture(options.maxAnisotropy ?? 1);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "ground";
  scene.add(ground);

  scene.add(createLandingPad());
  scene.add(createGates());
  const structures = createStructures();
  scene.add(structures.group);

  let time = 0;

  return {
    update(dt, focus, eye) {
      time += dt;
      // Sky follows the eye so it never gets closer or clipped
      sky.position.copy(eye);
      // Tight shadow frustum around the drone
      sun.target.position.copy(focus);
      sun.position.copy(focus).addScaledVector(SUN_DIRECTION, 150);
      // Blinking aviation beacons (1 Hz)
      structures.beacons.emissiveIntensity = time % 1 < 0.5 ? 2.5 : 0.1;
    },
    dispose() {
      // Geometries / materials / textures are freed by disposeScene()
      scene.fog = null;
      scene.background = null;
    },
  };
}
