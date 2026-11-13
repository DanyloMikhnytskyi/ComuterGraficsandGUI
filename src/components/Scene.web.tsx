/**
 * ============================================
 *  Autor:  Danylo Mikhnytskyi (284125)
 *  Plik:   src/components/Scene.web.tsx
 *  Opis:   Чистий та надійний Three.js WebGLRenderer для Web
 * ============================================
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import * as THREE from "three";
import { useDroneStore } from "../store/useDroneStore";

const GRAVITY = 9.81; // m/s²
const MAX_THRUST_ACCEL = 19.62; // m/s² (2 * g => 0.5 hover)
const MAX_CLIMB_SPEED = 15.0; // максимальна швидкість підйому (15 м/с)
const MAX_ALTITUDE = 500.0; // максимальна стеля польоту (500 м)
const HALF_HEIGHT = 0.15; // half height of cube (0.3 / 2)

const SceneWeb: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Dimensions ───────────────────────────
    const getWidth = () => container.clientWidth || window.innerWidth;
    const getHeight = () => container.clientHeight || window.innerHeight;

    // ── Scene & Background ───────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a1a2e"); // Dark blue background requested

    // ── Camera (far = 2500m so ground is visible at 500m altitude) ──
    const camera = new THREE.PerspectiveCamera(
      60,
      getWidth() / getHeight(),
      0.1,
      2500
    );
    camera.position.set(0, 3, 6);
    camera.lookAt(0, HALF_HEIGHT, 0);

    // ── Renderer ─────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(getWidth(), getHeight());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(100, 200, 100);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // ── Ground Plane (1000m wide) ────────────
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#2d572c",
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // ── Grid Helper (1000m) ──────────────────
    const grid = new THREE.GridHelper(1000, 100, 0x555555, 0x333333);
    grid.position.y = 0.001; // slightly above ground to prevent z-fighting
    scene.add(grid);

    // ── Drone Cube ───────────────────────────
    const droneGeo = new THREE.BoxGeometry(1.2, 0.3, 1.2);
    const droneMat = new THREE.MeshStandardMaterial({
      color: "#1abc9c",
      metalness: 0.4,
      roughness: 0.5,
    });
    const droneMesh = new THREE.Mesh(droneGeo, droneMat);
    droneMesh.position.set(0, HALF_HEIGHT, 0);
    droneMesh.castShadow = true;
    scene.add(droneMesh);

    // ── Physics state ────────────────────────
    let droneY = HALF_HEIGHT;
    let velocityY = 0;
    let lastTime = performance.now();
    let animId = 0;

    // ── Animation Loop ───────────────────────
    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Read throttle from store
      const throttle = useDroneStore.getState().throttle;

      // ── Physics ────────────────────────────
      const isHover = Math.abs(throttle - 0.5) < 0.01;

      if (isHover) {
        // Режим зависання (Hover 50%): активне гальмування швидкості до 0 та фіксація висоти
        velocityY = THREE.MathUtils.lerp(velocityY, 0, Math.min(1, 10 * delta));
        if (Math.abs(velocityY) < 0.02) {
          velocityY = 0;
        }
      } else {
        const thrustAccel = throttle * MAX_THRUST_ACCEL;
        let accel = thrustAccel - GRAVITY;

        // Normal force from ground: if landed and net force is downward, stay at rest
        const isGrounded = droneY <= HALF_HEIGHT + 0.001;
        if (isGrounded && accel < 0) {
          accel = 0;
          velocityY = 0;
        }

        // Інтеграція швидкості: при підйомі ліміт 15 м/с, при опусканні обмежень немає
        velocityY += accel * delta;
        if (velocityY > MAX_CLIMB_SPEED) {
          velocityY = MAX_CLIMB_SPEED;
        }
      }

      droneY += velocityY * delta;

      // Hard ground collision: cube never falls below floor
      if (droneY <= HALF_HEIGHT) {
        droneY = HALF_HEIGHT;
        velocityY = 0;
      }

      // Ceiling collision (500m)
      if (droneY >= MAX_ALTITUDE) {
        droneY = MAX_ALTITUDE;
        if (velocityY > 0) velocityY = 0;
      }

      droneMesh.position.y = droneY;

      // Wobble / rotation when throttle is on
      if (throttle > 0.01) {
        droneMesh.rotation.y += 0.6 * delta;
        droneMesh.rotation.x = Math.sin(now * 0.003) * 0.04 * throttle;
        droneMesh.rotation.z = Math.cos(now * 0.0025) * 0.04 * throttle;
      } else {
        droneMesh.rotation.x = 0;
        droneMesh.rotation.z = 0;
      }

      // Update telemetry in store: altitude above ground
      // altitude 0 when on ground (or absolute height droneY)
      useDroneStore.getState().updateTelemetry(droneY, velocityY);

      // ── Smooth Camera Follow ───────────────
      const targetY = droneY + 3;
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6, 0.05);
      camera.lookAt(0, droneY, 0);

      // Render
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // ── Resize handling ──────────────────────
    const handleResize = () => {
      const w = getWidth();
      const h = getHeight();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      droneGeo.dispose();
      droneMat.dispose();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Native HTML container for Three.js WebGL canvas */}
      <div
        ref={mountRef as any}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      />
    </View>
  );
};

export default SceneWeb;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
});
