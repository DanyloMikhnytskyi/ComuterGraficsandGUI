/**
 * ============================================
 *  Author:  Maksym Mahaz (284115)
 *  File:    src/components/VirtualJoystick.tsx
 *  Desc:    Two on-screen Mode 2 joysticks (left: throttle/yaw,
 *           right: pitch/roll) with simultaneous multi-touch.
 * ============================================
 *
 *  React Native's responder system allows only ONE responder at a time, so two
 *  independent PanResponders cannot be held simultaneously. Instead a single
 *  responder covers the bottom strip and routes every touch (by identifier) to
 *  the stick on the side of the screen where it started. Mouse input on web
 *  arrives as one emulated touch and works the same way.
 */

import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  NativeTouchEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDroneStore } from "../store/useDroneStore";
import { HOVER_THROTTLE } from "../core/physics";
import { STICK_DEADZONE } from "../core/constants";

type StickId = "left" | "right";

const BASE_RADIUS = 60;
const KNOB_RADIUS = 26;
const EDGE_MARGIN = 28;

interface Track {
  touchId: number;
  startX: number;
  startY: number;
  /** Knob offset when the touch began (sticky throttle continues from here) */
  baseX: number;
  baseY: number;
}

/** Remove the deadzone and rescale the remainder back to -1..1 */
const deadzone = (v: number) => {
  const a = Math.abs(v);
  if (a < STICK_DEADZONE) return 0;
  return (Math.sign(v) * (a - STICK_DEADZONE)) / (1 - STICK_DEADZONE);
};

/** Knob vertical offset (px, +down) for a throttle value */
const throttleToY = (t: number) => -(t - HOVER_THROTTLE) * 2 * BASE_RADIUS;

const DualJoysticks: React.FC = () => {
  const knobs = useRef({
    left: new Animated.ValueXY({ x: 0, y: throttleToY(useDroneStore.getState().throttle) }),
    right: new Animated.ValueXY({ x: 0, y: 0 }),
  }).current;
  const offsets = useRef<Record<StickId, { x: number; y: number }>>({
    left: { x: 0, y: throttleToY(useDroneStore.getState().throttle) },
    right: { x: 0, y: 0 },
  }).current;
  const tracks = useRef<Record<StickId, Track | null>>({ left: null, right: null }).current;

  /* ── Write a knob position and the resulting stick values ── */
  const applyOffset = (stick: StickId, rawX: number, rawY: number) => {
    let x = rawX;
    let y = rawY;
    const len = Math.hypot(x, y);
    if (len > BASE_RADIUS) {
      x = (x / len) * BASE_RADIUS;
      y = (y / len) * BASE_RADIUS;
    }
    offsets[stick] = { x, y };
    knobs[stick].setValue({ x, y });

    const nx = deadzone(x / BASE_RADIUS);
    const ny = deadzone(-y / BASE_RADIUS); // up = positive
    const store = useDroneStore.getState();
    if (stick === "left") {
      store.setLeftStick(HOVER_THROTTLE + 0.5 * ny, nx);
    } else {
      store.setRightStick(nx, ny);
    }
  };

  const springKnob = (stick: StickId, x: number, y: number) => {
    offsets[stick] = { x, y };
    Animated.spring(knobs[stick], {
      toValue: { x, y },
      friction: 6,
      tension: 120,
      useNativeDriver: false,
    }).start();
  };

  const releaseStick = (stick: StickId) => {
    tracks[stick] = null;
    const store = useDroneStore.getState();
    if (stick === "left") {
      // Yaw always springs back; throttle springs back only with Hover Lock
      const y = store.hoverLock ? 0 : offsets.left.y;
      springKnob("left", 0, y);
      store.setLeftStick(store.hoverLock ? HOVER_THROTTLE : store.throttle, 0);
    } else {
      springKnob("right", 0, 0);
      store.setRightStick(0, 0);
    }
  };

  /* ── Touch routing ── */
  const syncTouches = (touches: readonly NativeTouchEvent[]) => {
    const half = Dimensions.get("window").width / 2;
    const hoverLock = useDroneStore.getState().hoverLock;

    for (const t of touches) {
      const id = Number(t.identifier);
      const owner = (Object.keys(tracks) as StickId[]).find((k) => tracks[k]?.touchId === id);
      if (owner) {
        const tr = tracks[owner]!;
        applyOffset(owner, tr.baseX + t.pageX - tr.startX, tr.baseY + t.pageY - tr.startY);
        continue;
      }
      const stick: StickId = t.pageX < half ? "left" : "right";
      if (tracks[stick]) continue; // that stick is already held by another finger
      knobs[stick].stopAnimation();
      tracks[stick] = {
        touchId: id,
        startX: t.pageX,
        startY: t.pageY,
        baseX: 0,
        baseY: stick === "left" && !hoverLock ? offsets.left.y : 0,
      };
    }

    // Any tracked touch that is no longer down is released
    const active = new Set(touches.map((t) => Number(t.identifier)));
    for (const k of Object.keys(tracks) as StickId[]) {
      const tr = tracks[k];
      if (tr && !active.has(tr.touchId)) releaseStick(k);
    }
  };

  const endTouches = (changed: readonly NativeTouchEvent[]) => {
    const ended = new Set(changed.map((t) => Number(t.identifier)));
    for (const k of Object.keys(tracks) as StickId[]) {
      const tr = tracks[k];
      if (tr && ended.has(tr.touchId)) releaseStick(k);
    }
  };

  const releaseAll = () => {
    for (const k of Object.keys(tracks) as StickId[]) if (tracks[k]) releaseStick(k);
  };

  const responder = useMemo(() => {
    const onTouch = (e: GestureResponderEvent) => syncTouches(e.nativeEvent.touches);
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: onTouch,
      onPanResponderStart: onTouch,
      onPanResponderMove: onTouch,
      onPanResponderEnd: (e) => endTouches(e.nativeEvent.changedTouches),
      onPanResponderRelease: releaseAll,
      onPanResponderTerminate: releaseAll,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Keep the throttle knob in sync with Hover Lock / Reset ── */
  useEffect(
    () =>
      useDroneStore.subscribe((s, prev) => {
        if (s.hoverLock !== prev.hoverLock || s.resetNonce !== prev.resetNonce) {
          if (s.resetNonce !== prev.resetNonce) springKnob("right", 0, 0);
          if (!tracks.left) springKnob("left", 0, throttleToY(s.throttle));
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const hoverLock = useDroneStore((s) => s.hoverLock);

  return (
    <View style={styles.pad} {...responder.panHandlers}>
      <Stick
        side="left"
        knob={knobs.left}
        label={hoverLock ? "THROTTLE (HOLD) · YAW" : "THROTTLE · YAW"}
      />
      <Stick side="right" knob={knobs.right} label="PITCH · ROLL" />
    </View>
  );
};

const Stick: React.FC<{ side: StickId; knob: Animated.ValueXY; label: string }> = ({
  side,
  knob,
  label,
}) => (
  <View
    pointerEvents="none"
    style={[styles.stickWrap, side === "left" ? { left: EDGE_MARGIN } : { right: EDGE_MARGIN }]}
  >
    <View style={styles.base}>
      <View style={styles.crossH} />
      <View style={styles.crossV} />
      <Animated.View style={[styles.knob, { transform: knob.getTranslateTransform() }]} />
    </View>
    <Text style={styles.label}>{label}</Text>
  </View>
);

export default DualJoysticks;

const styles = StyleSheet.create({
  pad: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BASE_RADIUS * 2 + 60,
  },
  stickWrap: {
    position: "absolute",
    bottom: 16,
    alignItems: "center",
  },
  base: {
    width: BASE_RADIUS * 2,
    height: BASE_RADIUS * 2,
    borderRadius: BASE_RADIUS,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  crossH: {
    position: "absolute",
    width: BASE_RADIUS * 2 - 16,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  crossV: {
    position: "absolute",
    width: 1,
    height: BASE_RADIUS * 2 - 16,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  knob: {
    width: KNOB_RADIUS * 2,
    height: KNOB_RADIUS * 2,
    borderRadius: KNOB_RADIUS,
    backgroundColor: "rgba(26,188,156,0.9)",
    borderWidth: 2,
    borderColor: "#fff",
  },
  label: {
    marginTop: 6,
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 3,
  },
});
