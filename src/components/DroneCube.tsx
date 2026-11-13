/**
 * ============================================
 *  Autor:  Danylo Mikhnytskyi (284125)
 *  Plik:   src/components/DroneCube.tsx
 *  Opis:   3D-куб дрона з фізикою (гравітація, тяга, колізія)
 * ============================================
 */

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useDroneStore } from "../store/useDroneStore";

const GRAVITY = 9.81; // m/s²
const MAX_THRUST_ACCEL = 19.62; // m/s²  (2 × g  ⇒  throttle 0.5 = hover)
const MAX_CLIMB_SPEED = 15.0; // максимальна швидкість підйому (15 м/с)
const MAX_ALTITUDE = 500.0; // максимальна стеля польоту (500 м)
const HALF_HEIGHT = 0.15; // half of the cube height (0.3 / 2)

const DroneCube: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const velRef = useRef(0); // current vertical velocity (m/s)

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    // Clamp delta to avoid huge jumps when tab regains focus
    const dt = Math.min(delta, 0.05);

    const throttle = useDroneStore.getState().throttle;

    // ── Physics ──────────────────────────────
    const isHover = Math.abs(throttle - 0.5) < 0.01;

    if (isHover) {
      // Режим зависання (Hover 50%): активне гальмування швидкості до 0 та фіксація висоти
      velRef.current = THREE.MathUtils.lerp(velRef.current, 0, Math.min(1, 10 * dt));
      if (Math.abs(velRef.current) < 0.02) {
        velRef.current = 0;
      }
    } else {
      const thrustAccel = throttle * MAX_THRUST_ACCEL;
      let accel = thrustAccel - GRAVITY;

      // Normal force from ground: if landed and net force is downward, stay at rest
      const isGrounded = meshRef.current.position.y <= HALF_HEIGHT + 0.001;
      if (isGrounded && accel < 0) {
        accel = 0;
        velRef.current = 0;
      }

      velRef.current += accel * dt; // integrate velocity
      if (velRef.current > MAX_CLIMB_SPEED) {
        velRef.current = MAX_CLIMB_SPEED;
      }
    }

    let newY = meshRef.current.position.y + velRef.current * dt; // integrate position

    // ── Ground collision ─────────────────────
    if (newY <= HALF_HEIGHT) {
      newY = HALF_HEIGHT;
      velRef.current = 0; // stop on ground
    }

    // ── Ceiling collision (500m) ─────────────
    if (newY >= MAX_ALTITUDE) {
      newY = MAX_ALTITUDE;
      if (velRef.current > 0) velRef.current = 0;
    }

    meshRef.current.position.y = newY;

    // ── Wobble / rotation when throttle > 0 ──
    if (throttle > 0.01) {
      const t = _state.clock.elapsedTime;
      meshRef.current.rotation.y += 0.6 * dt; // slow yaw spin
      meshRef.current.rotation.x = Math.sin(t * 3) * 0.04 * throttle;
      meshRef.current.rotation.z = Math.cos(t * 2.5) * 0.04 * throttle;
    }

    // ── Push telemetry to store ──────────────
    useDroneStore.getState().updateTelemetry(newY, velRef.current);
  });

  return (
    <mesh ref={meshRef} position={[0, HALF_HEIGHT, 0]} castShadow>
      <boxGeometry args={[1.2, 0.3, 1.2]} />
      <meshStandardMaterial color="#1abc9c" metalness={0.4} roughness={0.5} />
    </mesh>
  );
};

export default DroneCube;
