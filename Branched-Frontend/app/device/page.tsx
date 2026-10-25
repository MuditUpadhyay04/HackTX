import { Suspense } from "react";
import { DeviceScene } from "./DeviceScene";

/** /device?state=&bg=black|wallpaper|white (Phase 1). P1-C extends this with test patterns and ?debug=1. */
export default function DevicePage() {
  return (
    <Suspense fallback={null}>
      <DeviceScene />
    </Suspense>
  );
}
