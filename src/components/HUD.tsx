/**
 * ============================================
 *  Autor:  Maksym Mahaz (284115)
 *  Plik:   src/components/HUD.tsx
 *  Opis:   Overlay HUD — telemetria + pult sterowania ciągiem
 * ============================================
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useDroneStore } from "../store/useDroneStore";

/* ── Telemetry Card ─────────────────────────── */

const TelemetryCard: React.FC = () => {
  const altitude = useDroneStore((s) => s.altitude);
  const velocityY = useDroneStore((s) => s.velocityY);
  const throttle = useDroneStore((s) => s.throttle);

  return (
    <View style={styles.telemetryCard}>
      <Text style={styles.telemetryTitle}>📡 Telemetria</Text>

      <Row label="Altitude" value={`${altitude.toFixed(2)} m`} />
      <Row label="Vertical Speed" value={`${velocityY.toFixed(2)} m/s`} />
      <Row label="Throttle" value={`${(throttle * 100).toFixed(0)} %`} />
    </View>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

/* ── Throttle Controls ──────────────────────── */

const ThrottleControls: React.FC = () => {
  const throttle = useDroneStore((s) => s.throttle);
  const setThrottle = useDroneStore((s) => s.setThrottle);
  const changeThrottle = useDroneStore((s) => s.changeThrottle);

  const pct = Math.round(throttle * 100);

  return (
    <View style={styles.controlsCard}>
      {/* Progress bar */}
      <View style={styles.barOuter}>
        <View style={[styles.barInner, { width: `${pct}%` }]} />
        <Text style={styles.barText}>{pct}%</Text>
      </View>

      {/* Button row */}
      <View style={styles.buttonRow}>
        <Btn title="−10 %" onPress={() => changeThrottle(-0.1)} color="#e74c3c" />
        <Btn title="+10 %" onPress={() => changeThrottle(0.1)} color="#2ecc71" />
      </View>
      <View style={styles.buttonRow}>
        <Btn title="Hover (50 %)" onPress={() => setThrottle(0.5)} color="#3498db" />
        <Btn title="Cut Off (0 %)" onPress={() => setThrottle(0)} color="#95a5a6" />
      </View>
    </View>
  );
};

const Btn: React.FC<{
  title: string;
  onPress: () => void;
  color: string;
}> = ({ title, onPress, color }) => (
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
    {/* Top: telemetry */}
    <TelemetryCard />

    {/* Spacer pushes controls to bottom */}
    <View style={{ flex: 1 }} pointerEvents="none" />

    {/* Bottom: throttle controls */}
    <ThrottleControls />
  </View>
);

export default HUD;

/* ── Styles ─────────────────────────────────── */

const styles = StyleSheet.create({
  /* Telemetry card */
  telemetryCard: {
    margin: 16,
    marginTop: 50,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  telemetryTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  label: { color: "#aaa", fontSize: 14 },
  value: { color: "#0f0", fontSize: 14, fontFamily: "monospace" },

  /* Controls card */
  controlsCard: {
    margin: 16,
    marginBottom: 36,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  /* Progress bar */
  barOuter: {
    height: 22,
    borderRadius: 6,
    backgroundColor: "#333",
    marginBottom: 10,
    overflow: "hidden",
    justifyContent: "center",
  },
  barInner: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#2ecc71",
    borderRadius: 6,
  },
  barText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  /* Buttons */
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
