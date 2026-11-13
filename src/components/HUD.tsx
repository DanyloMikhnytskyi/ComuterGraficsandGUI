/**
 * ============================================
 *  Author:  Maksym Mahaz (284115)
 *  File:    src/components/HUD.tsx
 *  Desc:    HUD overlay — telemetry bar, mode buttons, virtual joysticks
 * ============================================
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useDroneStore } from "../store/useDroneStore";
import { GROUND_Y } from "../core/constants";
import DualJoysticks from "./VirtualJoystick";

const RAD2DEG = 180 / Math.PI;

/* ── Telemetry bar ──────────────────────────── */

const TelemetryBar: React.FC = () => {
  const t = useDroneStore(
    useShallow((s) => ({
      position: s.position,
      velocity: s.velocity,
      speed: s.speed,
      rotation: s.rotation,
      throttle: s.throttle,
    }))
  );

  return (
    <View style={styles.telemetry} pointerEvents="none">
      <Item label="ALT" value={`${(t.position.y - GROUND_Y).toFixed(1)} m`} />
      <Item label="H.SPD" value={`${t.speed.toFixed(1)} m/s`} />
      <Item label="V.SPD" value={`${t.velocity.y.toFixed(1)} m/s`} />
      <Item label="THR" value={`${Math.round(t.throttle * 100)} %`} />
      <Item label="PITCH" value={`${(t.rotation.pitch * RAD2DEG).toFixed(0)}°`} />
      <Item label="ROLL" value={`${(t.rotation.roll * RAD2DEG).toFixed(0)}°`} />
      <Item label="X / Z" value={`${t.position.x.toFixed(0)} / ${t.position.z.toFixed(0)}`} />
    </View>
  );
};

const Item: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.item}>
    <Text style={styles.itemLabel}>{label}</Text>
    <Text style={styles.itemValue}>{value}</Text>
  </View>
);

/* ── Mode buttons ───────────────────────────── */

const Buttons: React.FC = () => {
  const cameraMode = useDroneStore((s) => s.cameraMode);
  const hoverLock = useDroneStore((s) => s.hoverLock);
  const toggleCameraMode = useDroneStore((s) => s.toggleCameraMode);
  const toggleHoverLock = useDroneStore((s) => s.toggleHoverLock);
  const resetDrone = useDroneStore((s) => s.resetDrone);

  return (
    <View style={styles.buttons}>
      <Btn title={`Camera: ${cameraMode}`} color="#2980b9" onPress={toggleCameraMode} />
      <Btn
        title={`Hover Lock: ${hoverLock ? "ON" : "OFF"}`}
        color={hoverLock ? "#27ae60" : "#7f8c8d"}
        onPress={toggleHoverLock}
      />
      <Btn title="Reset Drone" color="#c0392b" onPress={resetDrone} />
    </View>
  );
};

const Btn: React.FC<{ title: string; onPress: () => void; color: string }> = ({
  title,
  onPress,
  color,
}) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

/* ── Main HUD ───────────────────────────────── */

const HUD: React.FC = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
    <DualJoysticks />
    <View style={styles.topRow} pointerEvents="box-none">
      <TelemetryBar />
      <Buttons />
    </View>
  </View>
);

export default HUD;

/* ── Styles ─────────────────────────────────── */

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  telemetry: {
    flexShrink: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  item: {
    minWidth: 62,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  itemLabel: { color: "#9aa", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  itemValue: { color: "#3f6", fontSize: 14, fontFamily: "monospace" },
  buttons: {
    gap: 6,
    alignItems: "stretch",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
