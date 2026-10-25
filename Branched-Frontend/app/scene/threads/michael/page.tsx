import { Suspense } from "react";
import { MichaelScene } from "./MichaelScene";

/** /scene/threads/michael?state=read|history|compose|sent&typed=N (&banner=, &notify=) */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <MichaelScene />
    </Suspense>
  );
}
