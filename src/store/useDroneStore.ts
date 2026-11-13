/**
 * ============================================
 *  Autor:  Maksym Mahaz (284115)
 *  Plik:   src/store/useDroneStore.ts
 *  Opis:   Zustand store — stan dronа (tяga, telemetria)
 * ============================================
 */

import { create } from "zustand";

export interface DroneState {
  /** Throttle value from 0 (off) to 1 (full) */
  throttle: number;
  /** Current altitude in metres (Y axis) */
  altitude: number;
  /** Vertical speed in m/s (positive = up) */
  velocityY: number;

  /** Set throttle to an exact value clamped to [0, 1] */
  setThrottle: (value: number) => void;
  /** Change throttle by a delta, result clamped to [0, 1] */
  changeThrottle: (delta: number) => void;
  /** Called every frame by the physics loop to push telemetry */
  updateTelemetry: (altitude: number, velocityY: number) => void;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export const useDroneStore = create<DroneState>((set) => ({
  throttle: 0,
  altitude: 0.15, // starts on the ground (half-height of drone cube)
  velocityY: 0,

  setThrottle: (value) =>
    set({ throttle: clamp(value, 0, 1) }),

  changeThrottle: (delta) =>
    set((s) => ({ throttle: clamp(s.throttle + delta, 0, 1) })),

  updateTelemetry: (altitude, velocityY) =>
    set({ altitude, velocityY }),
}));
