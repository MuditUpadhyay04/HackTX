import { Suspense } from "react";
import { MomScene } from "./MomScene";

/** /scene/threads/mom?state=read|history|compose&typed=N|off (&seen=off, &banner=, &notify=) */
export default function MomPage() {
  return (
    <Suspense fallback={null}>
      <MomScene />
    </Suspense>
  );
}
