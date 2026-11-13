/**
 * ============================================
 *  Author:  Danylo Mikhnytskyi (284125)
 *  File:    src/core/droneModel.ts
 *  Desc:    Procedural quadcopter model (forward = -Z), animated rotors
 * ============================================
 */

import * as THREE from "three";
import { BASE_SPIN, MAX_SPIN } from "./constants";

export interface DroneModel {
  group: THREE.Group;
  /** Rotor objects, spun around their local Y axis */
  propellers: THREE.Object3D[];
}

/** Arm-tip distance from the body center along X and Z (m) */
const ARM_REACH = 0.3;

export function createDroneModel(): DroneModel {
  const group = new THREE.Group();
  group.name = "drone";

  const carbon = new THREE.MeshStandardMaterial({
    color: "#22252b",
    roughness: 0.55,
    metalness: 0.3,
  });
  const shell = new THREE.MeshStandardMaterial({
    color: "#1abc9c",
    roughness: 0.4,
    metalness: 0.35,
  });
  const motorMat = new THREE.MeshStandardMaterial({
    color: "#9aa3ad",
    roughness: 0.3,
    metalness: 0.8,
  });
  const bladeMat = new THREE.MeshStandardMaterial({
    color: "#eceff1",
    roughness: 0.6,
  });
  const lensMat = new THREE.MeshStandardMaterial({
    color: "#0b0d10",
    roughness: 0.1,
    metalness: 0.9,
  });
  const ledFront = new THREE.MeshStandardMaterial({
    color: "#2ecc71",
    emissive: "#2ecc71",
    emissiveIntensity: 1.5,
  });
  const ledRear = new THREE.MeshStandardMaterial({
    color: "#e74c3c",
    emissive: "#e74c3c",
    emissiveIntensity: 1.5,
  });

  const add = (mesh: THREE.Mesh, parent: THREE.Object3D = group) => {
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  /* ── Fuselage ───────────────────────────── */
  const body = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.42), carbon));
  body.position.y = 0;

  const canopy = add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.3), shell));
  canopy.position.set(0, 0.07, 0.02);

  // Battery pack on top, slightly to the rear
  const battery = add(
    new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.05, 0.16),
      new THREE.MeshStandardMaterial({ color: "#f39c12", roughness: 0.7 })
    )
  );
  battery.position.set(0, 0.125, 0.06);

  /* ── Front camera (forward indicator) ───── */
  const camHousing = add(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.06), shell));
  camHousing.position.set(0, 0.01, -0.23);

  const lensGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.04, 16);
  lensGeo.rotateX(Math.PI / 2);
  const lens = add(new THREE.Mesh(lensGeo, lensMat));
  lens.position.set(0, 0.01, -0.275);

  /* ── Arms, motors, LEDs, rotors ─────────── */
  const armLength = Math.hypot(ARM_REACH, ARM_REACH);
  const armGeo = new THREE.BoxGeometry(0.035, 0.025, armLength);
  const motorGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.05, 16);
  const ledGeo = new THREE.SphereGeometry(0.018, 10, 8);
  const bladeGeo = new THREE.BoxGeometry(0.3, 0.006, 0.028);
  const hubGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10);

  const propellers: THREE.Object3D[] = [];
  // Front-left, front-right, rear-right, rear-left (diagonal pairs share direction)
  const corners: Array<[number, number]> = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];

  corners.forEach(([sx, sz], i) => {
    const x = sx * ARM_REACH;
    const z = sz * ARM_REACH;

    const arm = add(new THREE.Mesh(armGeo, carbon));
    arm.position.set(x / 2, 0, z / 2);
    arm.rotation.y = Math.atan2(x, z);

    const motor = add(new THREE.Mesh(motorGeo, motorMat));
    motor.position.set(x, 0.02, z);

    const led = add(new THREE.Mesh(ledGeo, sz < 0 ? ledFront : ledRear));
    led.position.set(x, -0.025, z);

    const rotor = new THREE.Group();
    rotor.position.set(x, 0.055, z);
    // Alternate spin direction on diagonal pairs (+1 / -1)
    rotor.userData.spinDir = i % 2 === 0 ? 1 : -1;
    rotor.rotation.y = i * 0.7; // de-synchronise the blades visually
    add(new THREE.Mesh(bladeGeo, bladeMat), rotor);
    add(new THREE.Mesh(hubGeo, motorMat), rotor);
    group.add(rotor);
    propellers.push(rotor);
  });

  /* ── Landing skids ──────────────────────── */
  const skidGeo = new THREE.BoxGeometry(0.02, 0.02, 0.36);
  const strutGeo = new THREE.BoxGeometry(0.015, 0.13, 0.015);
  for (const sx of [-1, 1]) {
    const skid = add(new THREE.Mesh(skidGeo, carbon));
    skid.position.set(sx * 0.12, -0.19, 0);
    for (const sz of [-1, 1]) {
      const strut = add(new THREE.Mesh(strutGeo, carbon));
      strut.position.set(sx * 0.1, -0.12, sz * 0.12);
      strut.rotation.z = sx * 0.3;
    }
  }

  return { group, propellers };
}

/** Spin the rotors according to the current throttle. */
export function spinPropellers(
  propellers: THREE.Object3D[],
  throttle: number,
  dt: number
) {
  const rate = (BASE_SPIN + throttle * MAX_SPIN) * dt;
  for (const p of propellers) {
    p.rotation.y += rate * (p.userData.spinDir ?? 1);
  }
}
