import { Suspense } from "react";
import { SarahScene } from "./SarahScene";

/** /scene/threads/sarah?state=read|history|compose|sent|read-receipt|typing&typed=N (&banner=, &notify=) */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SarahScene />
    </Suspense>
  );
}
