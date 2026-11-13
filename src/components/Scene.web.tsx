/**
 * ============================================
 *  Author:  Danylo Mikhnytskyi (284125)
 *  File:    src/components/Scene.web.tsx
 *  Desc:    Web wrapper — plain Three.js WebGLRenderer mounted in a <div>.
 *           All scene / physics logic lives in src/core.
 * ============================================
 */

import React, { useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import * as THREE from "three";
import { createSimulation } from "../core/simulation";

const SceneWeb: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const getWidth = () => container.clientWidth || window.innerWidth;
    const getHeight = () => container.clientHeight || window.innerHeight;

    // ── Renderer ─────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(getWidth(), getHeight());
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // ── Shared simulation ────────────────────
    const sim = createSimulation({
      aspect: getWidth() / getHeight(),
      shadows: true,
      maxAnisotropy: renderer.capabilities.getMaxAnisotropy(),
    });

    // ── Loop ─────────────────────────────────
    let animId = 0;
    let lastTime = performance.now();
    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      sim.step((now - lastTime) / 1000);
      lastTime = now;
      renderer.render(sim.scene, sim.camera);
    };
    animId = requestAnimationFrame(animate);

    // ── Resize ───────────────────────────────
    const handleResize = () => {
      sim.setAspect(getWidth() / getHeight());
      renderer.setSize(getWidth(), getHeight());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      sim.dispose();
      renderer.dispose();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <View style={styles.container}>
      <div
        ref={mountRef as any}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
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
