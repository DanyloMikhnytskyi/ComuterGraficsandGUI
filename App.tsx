/**
 * ============================================
 *  Drone Simulator — Заняття 1 / 8
 *  Grafika komputerowa i komunikacja człowiek-komputer
 *
 *  Autorzy:
 *    Maksym Mahaz    (284115) — store, HUD, CameraController
 *    Danylo Mikhnytskyi (284125) — DroneCube, Scene
 *
 *  App.tsx — punkt wejścia (root)
 * ============================================
 */

import "./src/utils/glPolyfill";
import React from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import Scene from "./src/components/Scene";
import HUD from "./src/components/HUD";

// Ensure web root elements take full height and width
if (Platform.OS === "web" && typeof document !== "undefined") {
  const styleId = "drone-sim-root-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      html, body, #root {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #1a1a2e;
      }
    `;
    document.head.appendChild(style);
  }
}

const App: React.FC = () => (
  <View style={styles.container}>
    <StatusBar hidden />

    {/* 3D scene takes the full screen */}
    <Scene />

    {/* HUD overlay on top */}
    <HUD />
  </View>
);

export default App;

const styles = StyleSheet.create({
  container: {
    ...(StyleSheet.absoluteFill as object),
    width: "100%",
    height: Platform.OS === "web" ? ("100vh" as any) : "100%",
    flex: 1,
    backgroundColor: "#1a1a2e",
    overflow: "hidden",
  },
});
