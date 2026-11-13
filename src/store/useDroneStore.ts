/**
 * ============================================
 *  Author:  Maksym Mahaz (284115)
 *  File:    src/store/useDroneStore.ts
 *  Desc:    Zustand store — pilot inputs, modes and telemetry snapshot
 * ============================================
 *
 *  Inputs are written by the joysticks and read by the render loop via
 *  getState() (no subscriptions). Telemetry is pushed by the loop at
 *  TELEMETRY_HZ so the HUD does not re-render every frame.
 */

import { create } from "zustand";
import type { Vec3, Attitude } from "../core/physics";
import { HOVER_THROTTLE } from "../core/physics";
import type { CameraMode } from "../core/cameraRig";
import { GROUND_Y } from "../core/constants";

export interface Telemetry {
  position: Vec3;
  velocity: Vec3;
  /** Horizontal speed (m/s) */
  speed: number;
  rotation: Attitude;
}

export interface DroneState extends Telemetry {
  /* Inputs */
  /** 0..1 */
  throttle: number;
  /** -1..1 */
  yawInput: number;
  /** -1..1 (+1 = forward) */
  pitchInput: number;
  /** -1..1 (+1 = right) */
  rollInput: number;

  /* Modes */
  hoverLock: boolean;
  cameraMode: CameraMode;
  /** Incremented on every reset; the render loop watches it */
  resetNonce: number;

  /* Actions */
  setLeftStick: (throttle: number, yaw: number) => void;
  setRightStick: (roll: number, pitch: number) => void;
  toggleHoverLock: () => void;
  toggleCameraMode: () => void;
  resetDrone: () => void;
  updateTelemetry: (t: Telemetry) => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const initialTelemetry = (): Telemetry => ({
  position: { x: 0, y: GROUND_Y, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  speed: 0,
  rotation: { pitch: 0, roll: 0, yaw: 0 },
});

export const useDroneStore = create<DroneState>((set) => ({
  throttle: HOVER_THROTTLE,
  yawInput: 0,
  pitchInput: 0,
  rollInput: 0,
  hoverLock: true,
  cameraMode: "TPS",
  resetNonce: 0,
  ...initialTelemetry(),

  setLeftStick: (throttle, yaw) =>
    set({ throttle: clamp(throttle, 0, 1), yawInput: clamp(yaw, -1, 1) }),

  setRightStick: (roll, pitch) =>
    set({ rollInput: clamp(roll, -1, 1), pitchInput: clamp(pitch, -1, 1) }),

  // Engaging hover lock re-centres the (now spring-loaded) throttle stick
  toggleHoverLock: () =>
    set((s) =>
      s.hoverLock ? { hoverLock: false } : { hoverLock: true, throttle: HOVER_THROTTLE }
    ),

  toggleCameraMode: () =>
    set((s) => ({ cameraMode: s.cameraMode === "TPS" ? "FPV" : "TPS" })),

  resetDrone: () =>
    set((s) => ({
      throttle: s.hoverLock ? HOVER_THROTTLE : 0,
      yawInput: 0,
      pitchInput: 0,
      rollInput: 0,
      resetNonce: s.resetNonce + 1,
      ...initialTelemetry(),
    })),

  updateTelemetry: (t) => set(t),
}));
