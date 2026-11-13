/**
 * ============================================
 *  Author:  Danylo Mikhnytskyi (284125)
 *  File:    src/core/physics.ts
 *  Desc:    Pure 6-DOF flight model (no Three.js scene / store access)
 * ============================================
 *
 *  Conventions (world: +Y up, drone forward = -Z at yaw 0):
 *    pitch > 0  → nose down (tilts forward, accelerates forward)
 *    roll  > 0  → right side down (accelerates to the right)
 *    yaw   > 0  → rotated counter-clockwise seen from above (Three.js +Y)
 *  The matching Three.js Euler is (x: -pitch, y: yaw, z: -roll, order 'YXZ').
 */

import {
  GRAVITY,
  MAX_THRUST,
  MAX_TILT,
  TILT_RESPONSE,
  YAW_RATE,
  GROUND_Y,
  MAX_CLIMB_SPEED,
  MAX_ALTITUDE,
  HORIZONTAL_ACCEL_GAIN,
  MAX_HORIZONTAL_SPEED,
  DRAG,
  HOVER_DAMPING,
} from "./constants";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Attitude {
  pitch: number;
  roll: number;
  yaw: number;
}

export interface FlightState {
  position: Vec3;
  velocity: Vec3;
  rotation: Attitude;
}

export interface FlightInput {
  /** 0..1 */
  throttle: number;
  /** -1..1, +1 = turn right */
  yaw: number;
  /** -1..1, +1 = forward */
  pitch: number;
  /** -1..1, +1 = right */
  roll: number;
  hoverLock: boolean;
}

/** Throttle value treated as "stick centered" in hover-hold mode */
export const HOVER_THROTTLE = 0.5;

export const createInitialFlightState = (): FlightState => ({
  position: { x: 0, y: GROUND_Y, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  rotation: { pitch: 0, roll: 0, yaw: 0 },
});

/** Frame-rate independent smoothing factor */
const smoothing = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

/** Advance the flight state by `dt` seconds. Returns a new object. */
export function stepPhysics(
  state: FlightState,
  input: FlightInput,
  dt: number
): FlightState {
  const p = { ...state.position };
  const v = { ...state.velocity };
  let { pitch, roll, yaw } = state.rotation;

  const grounded = p.y <= GROUND_Y + 1e-3;
  // Sitting on the ground without enough thrust to lift off: everything rests.
  const restingOnGround = grounded && input.throttle <= HOVER_THROTTLE + 1e-3;

  /* ── Attitude ───────────────────────────── */
  const tiltK = smoothing(TILT_RESPONSE, dt);
  const targetPitch = restingOnGround ? 0 : input.pitch * MAX_TILT;
  const targetRoll = restingOnGround ? 0 : input.roll * MAX_TILT;
  pitch += (targetPitch - pitch) * tiltK;
  roll += (targetRoll - roll) * tiltK;
  if (!restingOnGround) {
    yaw += -input.yaw * YAW_RATE * dt;
  }

  /* ── Vertical ───────────────────────────── */
  const hoverHold =
    input.hoverLock && Math.abs(input.throttle - HOVER_THROTTLE) < 0.01;
  if (hoverHold) {
    v.y += (0 - v.y) * smoothing(HOVER_DAMPING, dt);
    if (Math.abs(v.y) < 0.02) v.y = 0;
  } else {
    let ay = input.throttle * MAX_THRUST - GRAVITY;
    if (grounded && ay < 0) {
      ay = 0;
      v.y = 0;
    }
    v.y += ay * dt;
    if (v.y > MAX_CLIMB_SPEED) v.y = MAX_CLIMB_SPEED;
  }

  /* ── Horizontal ─────────────────────────── */
  const sinY = Math.sin(yaw);
  const cosY = Math.cos(yaw);
  // forward = (-sin yaw, 0, -cos yaw), right = (cos yaw, 0, -sin yaw)
  const aForward = GRAVITY * Math.tan(pitch) * HORIZONTAL_ACCEL_GAIN;
  const aRight = GRAVITY * Math.tan(roll) * HORIZONTAL_ACCEL_GAIN;
  const ax = -sinY * aForward + cosY * aRight - DRAG * v.x;
  const az = -cosY * aForward - sinY * aRight - DRAG * v.z;
  v.x += ax * dt;
  v.z += az * dt;

  const hSpeed = Math.hypot(v.x, v.z);
  if (hSpeed > MAX_HORIZONTAL_SPEED) {
    const s = MAX_HORIZONTAL_SPEED / hSpeed;
    v.x *= s;
    v.z *= s;
  }

  /* ── Integrate ──────────────────────────── */
  p.x += v.x * dt;
  p.y += v.y * dt;
  p.z += v.z * dt;

  /* ── Floor & ceiling ────────────────────── */
  if (p.y <= GROUND_Y) {
    p.y = GROUND_Y;
    if (v.y < 0) v.y = 0;
  }
  if (p.y >= MAX_ALTITUDE) {
    p.y = MAX_ALTITUDE;
    if (v.y > 0) v.y = 0;
  }
  if (p.y <= GROUND_Y + 1e-3 && input.throttle < HOVER_THROTTLE + 1e-3) {
    v.x = 0;
    v.y = 0;
    v.z = 0;
  }

  return { position: p, velocity: v, rotation: { pitch, roll, yaw } };
}
