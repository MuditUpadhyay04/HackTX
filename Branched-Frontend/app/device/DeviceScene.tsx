"use client";

import { useSearchParams } from "next/navigation";
import { Stage, type StageBackground } from "@/components/stage/Stage";
import { GalaxyFold } from "@/components/device/GalaxyFold";
import { AngleSlider } from "@/components/device/AngleSlider";
import { FoldControl } from "@/components/device/FoldControl";
import { TestPattern } from "@/components/device/TestPattern";
import { CoverHome, InnerHome } from "@/components/home/HomeScreen";
import { DebugOverlay } from "@/components/device/DebugOverlay";
import { STATE_ANGLES, isDeviceState, type DeviceState } from "@/lib/device/angle";
import { useDeviceAngle, useFoldCrossfade } from "@/lib/device/fold";

/** D12: the studio off-white is the default; the gradient wallpaper stage is retired on /device. */
const BACKGROUNDS: StageBackground[] = ["studio", "black", "white"];

/**
 * /device?state=&bg=studio|black|white&scale=&reflection=1&debug=1&frame=bare&pattern=on
 * The iPhone Fold on the Stage with the iOS home screens on its displays (D12: the cover home folded,
 * the D8 inner home unfolded; both stay visible through the fold), the fold control below it and,
 * with debug=1, the spec overlay. pattern=on swaps the homes for the Phase 1 geometry test pattern.
 * Under reduced motion the hinge jumps and the previous pose fades out over the new one
 * (durations.reducedFold).
 */
export function DeviceScene() {
  const params = useSearchParams();
  const rawState = params.get("state");
  const state = isDeviceState(rawState) ? rawState : "folded";
  const rawBg = params.get("bg") as StageBackground | null;
  const bg = rawBg && BACKGROUNDS.includes(rawBg) ? rawBg : "studio";
  const bare = params.get("frame") === "bare";
  const rawScale = Number(params.get("scale"));
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;
  const reflection = params.get("reflection") === "1";
  const debug = params.get("debug") === "1";
  const pattern = params.get("pattern") === "on";
  const angle = useDeviceAngle(STATE_ANGLES[state]);
  const crossfade = useFoldCrossfade();
  const view = state === "back" ? "back" : STATE_ANGLES[state] >= 90 ? "unfolded" : "folded";

  // No hinge "click" ring: it read as a pop at the end of the unfold (the fold should just settle).
  const device = (openAngle: typeof angle | number) => (
    <GalaxyFold
      state={state as DeviceState}
      openAngle={openAngle}
      scale={scale}
      reflection={reflection}
      cover={pattern ? <TestPattern display="cover" /> : <CoverHome />}
      inner={pattern ? <TestPattern display="inner" /> : <InnerHome />}
      screenFill={pattern ? "wallpaper" : "dark"}
    />
  );

  return (
    <Stage background={bg} data-scene={`device-${state}-${bg}`}>
      {device(angle)}
      {crossfade ? (
        <div
          key={crossfade.key}
          data-fold-crossfade=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            animation: "device-crossfade-out var(--motion-reduced-fold) var(--ease-soft) forwards",
          }}
        >
          {device(crossfade.from)}
        </div>
      ) : null}
      <FoldControl tone={bg === "black" ? "dark" : "light"} hidden={bare} />
      {bare ? null : <AngleSlider />}
      {debug ? <DebugOverlay view={view} /> : null}
    </Stage>
  );
}
