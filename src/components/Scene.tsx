/**
 * ============================================
 *  Autor:  Danylo Mikhnytskyi (284125)
 *  Plik:   src/components/Scene.tsx
 *  Opis:   3D-сцена для Mobile (Expo Go) на чистому expo-gl (GLView) + Three.js
 *          Працює стабільно без збоїв React 19 Reconciler у мобільному застосунку
 * ============================================
 */

import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GLView, ExpoWebGLRenderingContext } from "expo-gl";
import * as THREE from "three";
import { useDroneStore } from "../store/useDroneStore";

// ── Physics Constants ──────────────────────────────
const GRAVITY = 9.81; // m/s²
const MAX_THRUST_ACCEL = 19.62; // m/s² (2 * g => 0.5 hover)
const MAX_CLIMB_SPEED = 15.0; // максимальна швидкість підйому (15 м/с)
const MAX_ALTITUDE = 500.0; // максимальна стеля польоту (500 м)
const HALF_HEIGHT = 0.15; // рівень землі (0.3 / 2)

const Scene: React.FC = () => {
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // ── Safe shader logs polyfill for expo-gl ───────────
    const origShader = gl.getShaderInfoLog?.bind(gl);
    gl.getShaderInfoLog = (s: any) => {
      try {
        const res = origShader ? origShader(s) : "";
        return typeof res === "string" ? res : "";
      } catch {
        return "";
      }
    };
    const origProgram = gl.getProgramInfoLog?.bind(gl);
    gl.getProgramInfoLog = (p: any) => {
      try {
        const res = origProgram ? origProgram(p) : "";
        return typeof res === "string" ? res : "";
      } catch {
        return "";
      }
    };

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // ── 1. Scene & Background ──────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a1a2e");

    // ── 2. Camera (far = 2500m so ground is visible at 500m altitude)
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2500);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, HALF_HEIGHT, 0);

    // ── 3. Three.js Renderer over expo-gl Context ──────
    const canvas = {
      style: {},
      width,
      height,
      clientWidth: width,
      clientHeight: height,
      getContext: () => gl,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    };

    // Note: Omit `context: gl` so Three.js r163+ initializes via canvas.getContext('webgl2')
    // and avoids the false-positive WebGL 1 check on mobile devices
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas as any,
      antialias: true,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);
    renderer.debug.checkShaderErrors = false;

    // ── 4. Lighting ────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);

    // ── 5. Ground & Grid (1000m wide) ──────────────────
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#2d572c",
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    const grid = new THREE.GridHelper(1000, 100, 0x555555, 0x333333);
    grid.position.y = 0.001;
    scene.add(grid);

    // ── 6. Drone Cube ──────────────────────────────────
    const droneGeo = new THREE.BoxGeometry(1.2, 0.3, 1.2);
    const droneMat = new THREE.MeshStandardMaterial({
      color: "#1abc9c",
      metalness: 0.4,
      roughness: 0.5,
    });
    const droneMesh = new THREE.Mesh(droneGeo, droneMat);
    droneMesh.position.set(0, HALF_HEIGHT, 0);
    scene.add(droneMesh);

    // ── 7. Physics Loop & Animation ────────────────────
    let droneY = HALF_HEIGHT;
    let velocityY = 0;
    let lastTime = Date.now();

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);

      const now = Date.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const throttle = useDroneStore.getState().throttle;

      // ── Physics ────────────────────────────────────
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

        // Сила реакції опори землі (коли дрон на землі, прискорення вниз гаситься)
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

      // Інтеграція позиції
      droneY += velocityY * delta;

      // Колізія з підлогою
      if (droneY <= HALF_HEIGHT) {
        droneY = HALF_HEIGHT;
        velocityY = 0;
      }

      // Стеля польоту (500 м)
      if (droneY >= MAX_ALTITUDE) {
        droneY = MAX_ALTITUDE;
        if (velocityY > 0) velocityY = 0;
      }

      droneMesh.position.y = droneY;

      // Легке обертання та погойдування при увімкненій тязі
      if (throttle > 0.01) {
        droneMesh.rotation.y += 0.6 * delta;
        droneMesh.rotation.x = Math.sin(now * 0.003) * 0.04 * throttle;
        droneMesh.rotation.z = Math.cos(now * 0.0025) * 0.04 * throttle;
      } else {
        droneMesh.rotation.x = 0;
        droneMesh.rotation.z = 0;
      }

      // Оновлення телеметрії в Zustand сторі
      useDroneStore.getState().updateTelemetry(droneY, velocityY);

      // Плавне слідування камери (LERP)
      const targetY = droneY + 3;
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6, 0.05);
      camera.lookAt(0, droneY, 0);

      // Рендер кадру та виклик endFrameEXP для мобільного екрана
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animIdRef.current = requestAnimationFrame(animate);
  };

  return (
    <View style={styles.container}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
    </View>
  );
};

export default Scene;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
});
