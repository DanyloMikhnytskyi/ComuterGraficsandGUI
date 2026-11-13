/**
 * ============================================
 *  Authors: Maksym Mahaz (284115), Danylo Mikhnytskyi (284125)
 *  File:    src/core/constants.ts
 *  Desc:    All simulation tunables in one place
 * ============================================
 */

const DEG = Math.PI / 180;

/* ── Physics ─────────────────────────────────── */

/** Gravitational acceleration (m/s²) */
export const GRAVITY = 9.81;
/** Thrust acceleration at full throttle (m/s²). 2·g → 50 % throttle hovers. */
export const MAX_THRUST = 19.62;
/** Maximum pitch / roll angle (rad) */
export const MAX_TILT = 30 * DEG;
/** How quickly the body follows the tilt target (1/s, exponential smoothing) */
export const TILT_RESPONSE = 6;
/** Yaw rate at full stick deflection (rad/s) */
export const YAW_RATE = 120 * DEG;
/** Height of the drone origin when it rests on the ground (m) */
export const GROUND_Y = 0.2;
/** Maximum climb speed (m/s) */
export const MAX_CLIMB_SPEED = 15;
/** Flight ceiling (m) */
export const MAX_ALTITUDE = 500;
/** Multiplier on g·tan(tilt) for horizontal acceleration */
export const HORIZONTAL_ACCEL_GAIN = 1.5;
/** Horizontal speed cap (m/s) */
export const MAX_HORIZONTAL_SPEED = 15;
/** Linear air drag coefficient for horizontal motion (1/s) */
export const DRAG = 0.7;
/** Hover-hold damping on vertical speed when Hover Lock is engaged (1/s) */
export const HOVER_DAMPING = 10;
/** Largest physics step (s); longer frames are clamped */
export const MAX_DT = 0.05;

/* ── Visuals ─────────────────────────────────── */

/** Idle propeller spin (rad/s) */
export const BASE_SPIN = 8;
/** Additional spin at full throttle (rad/s) */
export const MAX_SPIN = 60;

/* ── Camera ──────────────────────────────────── */

export const CAMERA_FAR = 2500;
export const TPS_FOV = 60;
export const FPV_FOV = 85;
/** TPS camera offset in the drone's yaw frame (behind = +Z) */
export const TPS_OFFSET = { x: 0, y: 1.8, z: 4.5 };
/** TPS position follow stiffness (1/s) */
export const TPS_FOLLOW = 5;
/** FPV camera mount point in the drone's local frame (front of fuselage) */
export const FPV_MOUNT = { x: 0, y: 0.03, z: -0.34 };

/* ── HUD / store ─────────────────────────────── */

/** Telemetry push rate to the Zustand store (Hz) */
export const TELEMETRY_HZ = 15;
/** Joystick axis deadzone (fraction of full deflection) */
export const STICK_DEADZONE = 0.05;

/* ── Rendering ───────────────────────────────── */

/** Shadow maps are expensive on expo-gl — keep them off on native by default */
export const ENABLE_SHADOWS_NATIVE = false;
/** Half-size of the orthographic shadow frustum that follows the drone (m) */
export const SHADOW_EXTENT = 40;
