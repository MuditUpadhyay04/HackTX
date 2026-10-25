"use client";

import { isMotionValue, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { GEOM, continuousClip } from "./geometry";
import {
  STATE_CONFIG,
  deviceTransform,
  groupTransformCss,
  hingeCenter,
  leftPanelTransformCss,
  specularPosition,
  type DuoPose,
  type DuoState,
} from "@/lib/device/angle";
import { ALL_SIDES, Face } from "./parts/Face";
import { Half } from "./parts/Half";
import { Reflection } from "./parts/Reflection";
import { GlassSheen, PunchHole } from "./parts/Screen";
import { ContactShadow } from "./parts/Shadow";
import { Spine } from "./parts/Spine";

export type { DuoState } from "@/lib/device/angle";

export type IPhoneDuoProps = {
  /** a static state (folded, unfold-60, unfolded, back ...); default "folded" */
  state?: DuoState;
  /**
   * 0 = folded, 180 = flat; overrides the state's angle. A number, or a framer-motion
   * MotionValue (the fold control / opening timeline) that updates the device every frame
   * without a React re-render.
   */
  openAngle?: number | MotionValue<number>;
  /** default 1 (the geometry is at scale 1) */
  scale?: number;
  /** artboard center of the device group, default 960, 540 */
  x?: number;
  y?: number;
  /** whole-device tilt (deg), added to the state's pose and the openAngle tilt */
  tilt?: { rotateX?: number; rotateY?: number };
  /** false = black glass; default from the state (lit unless it is an -off state) */
  screenOn?: boolean;
  /** the cover display (folded), in a 402 x 573 pt viewport (GEOM.viewport.cover) */
  cover?: ReactNode;
  /** the inner display (unfolded, one seamless screen), in an 822.5 x 573 pt viewport (GEOM.viewport.inner) */
  inner?: ReactNode;
  /** @deprecated Phase 1 Duo name: alias of `cover` */
  right?: ReactNode;
  /** @deprecated Phase 1 Duo name: alias of `inner` */
  spanning?: ReactNode;
  shadow?: "auto" | "none";
  reflection?: boolean;
  /** 0..1 position of the back-glass specular sweep; derived from openAngle unless set */
  specular?: number;
  /** D10: natural titanium */
  finish?: "natural";
  /** rendered centered on the hinge, in front of the device (the detent ripple) */
  hingeAccessory?: ReactNode;
  /**
   * What lights the glass under `cover` / `inner`: "wallpaper" (Phase 1 lit display, for transparent
   * content such as the test pattern) or "dark" (opaque content such as the home screens, which fade
   * toward dark glass as they swing away). Default "wallpaper".
   */
  screenFill?: "wallpaper" | "dark";
};

/** A MotionValue for openAngle whether the prop is a number, a MotionValue or absent. */
function useAngle(openAngle: IPhoneDuoProps["openAngle"], fallback: number): MotionValue<number> {
  const external = isMotionValue(openAngle) ? (openAngle as MotionValue<number>) : null;
  const target = external ? null : typeof openAngle === "number" ? openAngle : fallback;
  const local = useMotionValue(target ?? fallback);
  useEffect(() => {
    if (target !== null) local.set(target);
  }, [target, local]);
  return external ?? local;
}

/**
 * The iPhone Fold (docs/RULES.md D10; kept under the Phase 1 name IPhoneDuo): a pure function of
 * openAngle. Two 590 x 830 x 18 titanium halves and a hinge spine in one preserve-3d scene; the
 * left half folds inward around the hinge axis (rotateY 180 - a), the group recenters
 * (-295 * (1 - a/180)) and tilts a little mid-fold. Folded it is one short, wide slab showing the
 * cover display; flat it is one landscape slab with one seamless inner display. Every per-frame
 * value is a MotionValue-driven style, so a MotionValue openAngle animates at 60 fps without
 * re-rendering React.
 */
export function IPhoneDuo({
  state = "folded",
  openAngle,
  scale = 1,
  x = GEOM.stage.cx,
  y = GEOM.stage.cy,
  tilt,
  screenOn,
  cover,
  inner,
  right,
  spanning,
  shadow = "auto",
  reflection = false,
  specular,
  finish = "natural",
  hingeAccessory,
  screenFill = "wallpaper",
}: IPhoneDuoProps) {
  const config = STATE_CONFIG[state];
  const angle = useAngle(openAngle, config.openAngle);
  const on = screenOn ?? config.screenOn;
  const extra: DuoPose = { rotateX: tilt?.rotateX ?? 0, rotateY: tilt?.rotateY ?? 0 };
  const coverContent = cover ?? right;
  const innerContent = inner ?? spanning;

  const groupTransform = useTransform(angle, (a) => groupTransformCss(deviceTransform(a, state), extra));
  const leftTransform = useTransform(angle, leftPanelTransformCss);
  const gloss = useTransform(angle, (a) => specularPosition(specular ?? deviceTransform(a).specular));

  const { width, height } = GEOM.group;
  const core = (withContent: boolean) => (
    <DeviceCore
      angle={angle}
      groupTransform={groupTransform}
      leftTransform={leftTransform}
      gloss={gloss}
      screenOn={on}
      shadow={shadow !== "none" && withContent}
      cover={withContent ? coverContent : undefined}
      inner={withContent ? innerContent : undefined}
      hingeAccessory={withContent ? hingeAccessory : undefined}
      fill={screenFill}
    />
  );

  return (
    <div
      data-iphone-duo=""
      data-device="iphone-fold"
      data-state={state}
      data-finish={finish}
      data-duo-shadow={shadow}
      data-screen={on ? "on" : "off"}
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        transform: scale === 1 ? undefined : `scale(${scale})`,
        transformOrigin: "50% 50%",
      }}
    >
      {shadow === "none" ? null : <ContactShadow angle={angle} />}
      {reflection ? <Reflection>{core(false)}</Reflection> : null}
      {core(true)}
    </div>
  );
}

type DeviceCoreProps = {
  angle: MotionValue<number>;
  groupTransform: MotionValue<string>;
  leftTransform: MotionValue<string>;
  gloss: MotionValue<string>;
  screenOn: boolean;
  shadow: boolean;
  cover?: ReactNode;
  inner?: ReactNode;
  hingeAccessory?: ReactNode;
  fill: "wallpaper" | "dark";
};

/** The 3D scene: perspective wrapper, tilting group, right half, spine, swinging left half. */
function DeviceCore({
  angle,
  groupTransform,
  leftTransform,
  gloss,
  screenOn,
  shadow,
  cover,
  inner,
  hingeAccessory,
  fill,
}: DeviceCoreProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        perspective: GEOM.group.perspective,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <motion.div
        data-duo-part="group"
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transformOrigin: "50% 50%",
          transform: groupTransform,
        }}
      >
        <Half side="right" angle={angle} screenOn={screenOn} gloss={gloss} shadow={shadow} inner={inner} fill={fill} />
        <Spine angle={angle} />
        <HingeBacking angle={angle} />
        <Half
          side="left"
          angle={angle}
          transform={leftTransform}
          screenOn={screenOn}
          gloss={gloss}
          shadow={shadow}
          cover={cover}
          inner={inner}
          fill={fill}
        />
        <OnePieceFront angle={angle} />
        {screenOn && cover != null ? <CoverContent angle={angle}>{cover}</CoverContent> : null}
        {screenOn && inner != null ? (
          <InnerContent angle={angle}>
            {inner}
          </InnerContent>
        ) : null}
        <HingeAccessory angle={angle}>{hingeAccessory}</HingeAccessory>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The inner display's content: ONE interactive instance across both halves, shown flat only. While
// the device moves, each half shows its own inert slice of the same content (Half.tsx, D12), so the
// screen stays visible through the whole fold; this flat layer eases in over 168-180 for crisp,
// seamless, tappable content.
// ---------------------------------------------------------------------------

const INNER_CLIP = (() => {
  const d = GEOM.display.inner;
  return continuousClip(d.width, d.height, { tl: d.radius, tr: d.radius, br: d.radius, bl: d.radius });
})();

function InnerContent({ angle, children }: { angle: MotionValue<number>; children: ReactNode }) {
  const opacity = useTransform(angle, (a) => deviceTransform(a).contentOpacity);
  const visibility = useTransform(angle, (a) => (deviceTransform(a).contentOpacity > 0 ? "visible" : "hidden"));
  const pointerEvents = useTransform(angle, (a) => (a >= GEOM.contentFade.to ? "auto" : "none"));
  const vp = GEOM.viewport;
  const d = GEOM.display.inner;
  return (
    <motion.div
      data-duo-part="inner-content"
      style={{
        position: "absolute",
        left: GEOM.band.inset,
        top: GEOM.band.inset,
        width: d.width,
        height: d.height,
        clipPath: INNER_CLIP,
        transform: `translateZ(${GEOM.z.content}px)`,
        opacity,
        visibility,
        pointerEvents,
      }}
    >
      <div
        data-duo-viewport="inner"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: vp.inner.width,
          height: vp.inner.height,
          transform: `scale(${vp.scale})`,
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <GlassSheen width={d.width} height={d.height} />
    </motion.div>
  );
}

/**
 * The cover display's content, flat and in front, while the phone is folded shut: ONE interactive
 * instance (the copy on the left half's back face is inert). Content drawn on that face sits inside
 * two 180-degree flips and some browsers (the Claude app's) do not hit-test it, so taps went to the
 * frame; this layer is never flipped. It lies exactly over the face copy, so swapping is invisible.
 */
const COVER_CLIP = (() => {
  const c = GEOM.display.cover;
  return continuousClip(c.width, c.height, { tl: c.radiusHinge, tr: c.radiusOuter, br: c.radiusOuter, bl: c.radiusHinge });
})();

/** openAngle up to which the flat cover layer is shown (the face copy takes over as it opens). */
const COVER_FLAT_TO = 1;

function CoverContent({ angle, children }: { angle: MotionValue<number>; children: ReactNode }) {
  const visibility = useTransform(angle, (a) => (a <= COVER_FLAT_TO ? "visible" : "hidden"));
  const vp = GEOM.viewport;
  const c = GEOM.display.cover;
  return (
    <motion.div
      data-duo-part="cover-content"
      style={{
        position: "absolute",
        left: GEOM.group.hinge + GEOM.band.inset,
        top: GEOM.band.inset,
        width: c.width,
        height: c.height,
        clipPath: COVER_CLIP,
        transform: `translateZ(${GEOM.panel.thickness + GEOM.z.content}px)`,
        visibility,
      }}
    >
      <div
        data-duo-viewport="cover"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: vp.cover.width,
          height: vp.cover.height,
          transform: `scale(${vp.scale})`,
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <GlassSheen width={c.width} height={c.height} />
      <PunchHole display="cover" width={c.width} />
    </motion.div>
  );
}

/**
 * Flat, the inner side is ONE frame and ONE glass across both halves (no seam at the hinge): this
 * full-width front face lies over the two half faces once flat (ONE_PIECE_FROM), just behind the flat
 * content layer, so the open device reads as a single piece rather than two slabs side by side.
 */
/**
 * A dark strip just behind the hinge line, spanning both faces' edges: the two halves are separate
 * 3D planes whose anti-aliased edges never quite meet, so without it the light stage showed through
 * as a white hairline at the crease mid-fold.
 */
function HingeBacking({ angle }: { angle: MotionValue<number> }) {
  // only near flat, where the two faces meet edge to edge; with the left half swung away it would
  // show as a dark line along the crease
  const visibility = useTransform(angle, (a) => (a >= HINGE_BACKING_FROM ? "visible" : "hidden"));
  const w = 4;
  return (
    <motion.div
      aria-hidden="true"
      data-duo-part="hinge-backing"
      style={{
        position: "absolute",
        left: GEOM.group.hinge - w / 2,
        top: GEOM.band.inset,
        width: w,
        height: GEOM.panel.height - 2 * GEOM.band.inset,
        transform: "translateZ(-0.5px)",
        background: "var(--device-bezel)",
        pointerEvents: "none",
        visibility,
      }}
    />
  );
}

/** openAngle from which the hinge backing shows. */
const HINGE_BACKING_FROM = 100;

/** openAngle from which the one-piece front shows (the spring/tween lands on 180 exactly). */
const ONE_PIECE_FROM = 179.5;

function OnePieceFront({ angle }: { angle: MotionValue<number> }) {
  // Only when (all but) exactly flat: while the left half is still tilted the flat face would cut
  // through it. Flat, it matches the two half faces pixel for pixel, so the swap is invisible.
  const visibility = useTransform(angle, (a) => (a >= ONE_PIECE_FROM ? "visible" : "hidden"));
  const r = GEOM.panel.radius;
  return (
    <motion.div
      data-duo-part="front-one-piece"
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateZ(${GEOM.z.content / 2}px)`,
        visibility,
        pointerEvents: "none",
      }}
    >
      <Face
        part="front-flat"
        width={GEOM.group.width}
        height={GEOM.group.height}
        radii={{ tl: r, tr: r, br: r, bl: r }}
        sides={ALL_SIDES}
        variant="screen"
      />
    </motion.div>
  );
}

/** The hinge accessory (detent ripple): centered on the hinge, just in front of the device. */
function HingeAccessory({ angle, children }: { angle: MotionValue<number>; children?: ReactNode }) {
  const transform = useTransform(angle, (a) => {
    const c = hingeCenter(a);
    return `translate3d(${c.x}px, ${GEOM.panel.height / 2}px, ${c.z}px)`;
  });
  if (children == null) return null;
  return (
    <motion.div
      data-duo-part="hinge-accessory"
      style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transform, pointerEvents: "none" }}
    >
      {children}
    </motion.div>
  );
}

export default IPhoneDuo;
