/**
 * ============================================
 *  Author:  Maksym Mahaz (284115)
 *  File:    src/core/cameraRig.ts
 *  Desc:    Third-person chase camera and first-person (FPV) camera
 * ============================================
 */

import * as THREE from "three";
import type { FlightState } from "./physics";
import {
  GROUND_Y,
  TPS_FOV,
  FPV_FOV,
  TPS_OFFSET,
  TPS_FOLLOW,
  FPV_MOUNT,
} from "./constants";

export type CameraMode = "TPS" | "FPV";

/** Last mode used per camera, to snap instead of blending through the drone */
const lastMode = new WeakMap<THREE.PerspectiveCamera, CameraMode>();

const _target = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, "YXZ");
const _up = new THREE.Vector3(0, 1, 0);

export function updateCamera(
  camera: THREE.PerspectiveCamera,
  flight: FlightState,
  mode: CameraMode,
  dt: number
) {
  const { position: p, rotation: r } = flight;
  const switched = lastMode.get(camera) !== mode;
  lastMode.set(camera, mode);

  if (mode === "FPV") {
    // Exact body orientation: yaw → pitch → roll so the horizon banks correctly
    _euler.set(-r.pitch, r.yaw, -r.roll, "YXZ");
    _offset.set(FPV_MOUNT.x, FPV_MOUNT.y, FPV_MOUNT.z).applyEuler(_euler);
    camera.position.set(p.x, p.y, p.z).add(_offset);
    camera.rotation.order = "YXZ";
    camera.rotation.set(-r.pitch, r.yaw, -r.roll);
    setFov(camera, FPV_FOV, 0.05);
    return;
  }

  // TPS: offset rotated by yaw only (pitch/roll do not swing the camera)
  _offset.set(TPS_OFFSET.x, TPS_OFFSET.y, TPS_OFFSET.z).applyAxisAngle(_up, r.yaw);
  _target.set(p.x, p.y, p.z).add(_offset);
  _target.y = Math.max(_target.y, GROUND_Y + 0.5);

  if (switched) {
    camera.position.copy(_target);
  } else {
    camera.position.lerp(_target, 1 - Math.exp(-TPS_FOLLOW * dt));
  }
  camera.rotation.order = "XYZ";
  camera.lookAt(p.x, p.y + 0.4, p.z);
  setFov(camera, TPS_FOV, 0.1);
}

function setFov(camera: THREE.PerspectiveCamera, fov: number, near: number) {
  if (camera.fov !== fov || camera.near !== near) {
    camera.fov = fov;
    camera.near = near;
    camera.updateProjectionMatrix();
  }
}
