/**
 * ============================================
 *  Authors: Maksym Mahaz (284115), Danylo Mikhnytskyi (284125)
 *  File:    src/core/simulation.ts
 *  Desc:    Platform-independent scene setup + per-frame update.
 *           Scene.tsx / Scene.web.tsx only own the renderer and the loop.
 * ============================================
 */

import * as THREE from "three";
import { useDroneStore } from "../store/useDroneStore";
import { createDroneModel, spinPropellers } from "./droneModel";
import { createEnvironment } from "./environment";
import { stepPhysics, createInitialFlightState, type FlightState } from "./physics";
import { updateCamera } from "./cameraRig";
import { disposeScene } from "./disposeScene";
import { CAMERA_FAR, MAX_DT, TELEMETRY_HZ, TPS_FOV } from "./constants";

export interface SimulationOptions {
  aspect: number;
  shadows: boolean;
  maxAnisotropy?: number;
}

export interface Simulation {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Advance by `rawDt` seconds (clamped internally) */
  step(rawDt: number): void;
  setAspect(aspect: number): void;
  dispose(): void;
}

export function createSimulation(options: SimulationOptions): Simulation {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(TPS_FOV, options.aspect, 0.1, CAMERA_FAR);

  const env = createEnvironment(scene, {
    shadows: options.shadows,
    maxAnisotropy: options.maxAnisotropy,
  });

  const drone = createDroneModel();
  scene.add(drone.group);

  // Authoritative flight state lives here, not in the store
  let flight: FlightState = createInitialFlightState();
  let resetNonce = useDroneStore.getState().resetNonce;
  let telemetryTimer = Infinity; // push immediately on the first frame
  const focus = new THREE.Vector3();

  const applyToModel = () => {
    const { position: p, rotation: r } = flight;
    drone.group.position.set(p.x, p.y, p.z);
    drone.group.rotation.set(-r.pitch, r.yaw, -r.roll, "YXZ");
  };
  applyToModel();

  return {
    scene,
    camera,

    step(rawDt) {
      const dt = Math.min(Math.max(rawDt, 0), MAX_DT);
      const s = useDroneStore.getState();

      if (s.resetNonce !== resetNonce) {
        resetNonce = s.resetNonce;
        flight = createInitialFlightState();
      }

      flight = stepPhysics(
        flight,
        {
          throttle: s.throttle,
          yaw: s.yawInput,
          pitch: s.pitchInput,
          roll: s.rollInput,
          hoverLock: s.hoverLock,
        },
        dt
      );

      applyToModel();
      spinPropellers(drone.propellers, s.throttle, dt);
      updateCamera(camera, flight, s.cameraMode, dt);

      focus.copy(drone.group.position);
      env.update(dt, focus, camera.position);

      telemetryTimer += dt;
      if (telemetryTimer >= 1 / TELEMETRY_HZ) {
        telemetryTimer = 0;
        const v = flight.velocity;
        s.updateTelemetry({
          position: { ...flight.position },
          velocity: { ...v },
          speed: Math.hypot(v.x, v.z),
          rotation: { ...flight.rotation },
        });
      }
    },

    setAspect(aspect) {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    },

    dispose() {
      env.dispose();
      disposeScene(scene);
    },
  };
}
