/**
 * ============================================
 *  Autor:  Maksym Mahaz (284115)
 *  Plik:   src/components/CameraController.tsx
 *  Opis:   Kamera śledząca drona (lerp po Y + lookAt)
 * ============================================
 */

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useDroneStore } from "../store/useDroneStore";

/**
 * Placed inside <Canvas>.
 * Every frame it smoothly raises / lowers the camera to follow
 * the drone cube along the Y axis, and keeps it aimed at the drone.
 */
const CameraController: React.FC = () => {
  const { camera } = useThree();

  useFrame(() => {
    const altitude = useDroneStore.getState().altitude;

    // Camera offset: 6 m behind, 3 m above the drone, 6 m to the side
    const targetY = altitude + 3;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6, 0.05);

    camera.lookAt(0, altitude, 0);
  });

  return null;
};

export default CameraController;
