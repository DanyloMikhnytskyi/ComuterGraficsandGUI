/**
 * ============================================
 *  Author:  Danylo Mikhnytskyi (284125)
 *  File:    src/components/Scene.tsx
 *  Desc:    Native (Expo) wrapper — expo-gl GLView + hand-built Three.js
 *           WebGLRenderer. All scene / physics logic lives in src/core.
 * ============================================
 */

import React, { useRef, useEffect } from "react";
import { View, StyleSheet, PixelRatio, LayoutChangeEvent } from "react-native";
import { GLView, ExpoWebGLRenderingContext } from "expo-gl";
import * as THREE from "three";
import { createSimulation } from "../core/simulation";
import { ENABLE_SHADOWS_NATIVE } from "../core/constants";

const Scene: React.FC = () => {
  const cleanupRef = useRef<(() => void) | null>(null);
  /** Current GLView size in physical pixels, updated by onLayout */
  const layoutPx = useRef<{ w: number; h: number } | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const ratio = PixelRatio.get();
    layoutPx.current = {
      w: Math.round(width * ratio),
      h: Math.round(height * ratio),
    };
  };

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    // ── Safe shader log polyfill for expo-gl ───
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

    let width = gl.drawingBufferWidth;
    let height = gl.drawingBufferHeight;

    // ── Three.js renderer over the expo-gl context ───
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

    // Note: omit `context: gl` so Three.js r163+ initialises via canvas.getContext('webgl2')
    // and avoids the false-positive WebGL 1 check on mobile devices
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas as any,
      antialias: true,
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(1);
    renderer.debug.checkShaderErrors = false;
    renderer.shadowMap.enabled = ENABLE_SHADOWS_NATIVE;

    // ── Shared simulation ────────────────────
    const sim = createSimulation({
      aspect: width / height,
      shadows: ENABLE_SHADOWS_NATIVE,
    });

    // ── Loop ─────────────────────────────────
    let animId = 0;
    let lastTime = Date.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Resize when the view's layout changes (e.g. portrait → landscape).
      // gl.drawingBufferWidth/Height are fixed at context creation in expo-gl,
      // so the real size comes from onLayout (points × device pixel ratio).
      const target = layoutPx.current;
      if (target && (target.w !== width || target.h !== height)) {
        width = target.w;
        height = target.h;
        canvas.clientWidth = width;
        canvas.clientHeight = height;
        renderer.setSize(width, height, false);
        sim.setAspect(width / height);
      }

      const now = Date.now();
      sim.step((now - lastTime) / 1000);
      lastTime = now;

      renderer.render(sim.scene, sim.camera);
      gl.endFrameEXP();
    };
    animId = requestAnimationFrame(animate);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      sim.dispose();
      renderer.dispose();
    };
  };

  return (
    <View style={styles.container}>
      <GLView
        style={StyleSheet.absoluteFill}
        onLayout={onLayout}
        onContextCreate={onContextCreate}
      />
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
