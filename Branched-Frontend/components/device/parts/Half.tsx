"use client";

import { motion, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { GEOM, type FoldSide } from "../geometry";
import { appScreen, type HardwareTarget } from "@/lib/apps/registry";
import { useAppStore } from "@/lib/apps/store";
import { useFoldStore } from "@/lib/device/store";
import { buttonShadow } from "../materials";
import { EdgeFace } from "./EdgeFace";
import { ALL_SIDES, Face, HINGE_BLEED } from "./Face";
import { GlassBack } from "./GlassBack";
import { FoldContent, GlassSheen, PunchHole, ScreenSurface, coverSwing, innerSwing } from "./Screen";
import { HalfShadow } from "./Shadow";

export type HalfProps = {
  side: FoldSide;
  /** left half only: its swing around the hinge axis, as a CSS transform */
  transform?: MotionValue<string>;
  screenOn: boolean;
  gloss: MotionValue<string>;
  /** the live openAngle (drives the shadow plane) */
  angle: MotionValue<number>;
  /** cast the drop shadow / rim light */
  shadow: boolean;
  /** left half only: the cover display's content (402 pt wide viewport) */
  cover?: ReactNode;
  /** the inner display's content (one 822.5 pt viewport); each half shows its own slice of it */
  inner?: ReactNode;
  /** what lights the glass under the content: the Phase 1 wallpaper, or dark glass (opaque content) */
  fill?: "wallpaper" | "dark";
};

/**
 * One half of the iPhone Fold as a closed 3D slab (590 x 830 x 18): the front face (its half of
 * the one inner display), the back face (left: the cover display; right: the glass back with the
 * camera plateau), the titanium side wall and, on the right half, the top buttons.
 */
export function Half({ side, transform, screenOn, gloss, angle, shadow, cover, inner, fill = "wallpaper" }: HalfProps) {
  const { width, height, thickness } = GEOM.panel;
  return (
    <motion.div
      data-fold-part={`half-${side}`}
      style={{
        position: "absolute",
        left: side === "left" ? 0 : GEOM.group.hinge,
        top: 0,
        width,
        height,
        transformStyle: "preserve-3d",
        transformOrigin: side === "left" ? `${width}px ${height / 2}px 0` : undefined,
        transform,
      }}
    >
      {shadow ? <HalfShadow side={side} angle={angle} /> : null}
      <InnerFace side={side} screenOn={screenOn} angle={angle} fill={fill}>
        {inner}
      </InnerFace>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `translateZ(${-thickness}px) rotateY(180deg)`,
        }}
      >
        {side === "left" ? (
          <CoverFace screenOn={screenOn} angle={angle} fill={fill}>
            {cover}
          </CoverFace>
        ) : (
          <GlassBack gloss={gloss} />
        )}
      </div>
      <EdgeFace side={side} />
      {side === "right" ? <Buttons /> : null}
    </motion.div>
  );
}

type FaceContentProps = {
  screenOn: boolean;
  angle: MotionValue<number>;
  fill: "wallpaper" | "dark";
  children?: ReactNode;
};

/**
 * This half's slice of the inner display: frame on three sides, open at the hinge. The content is
 * the ONE inner viewport shifted by the half's offset, so both slices read as one continuous screen
 * through the whole fold (D12). The swinging left half softens with the fold blur; the right half
 * stays sharp. Slices are inert copies: the flat, interactive layer is GalaxyFold's InnerContent.
 */
function InnerFace({ side, screenOn, angle, fill, children }: FaceContentProps & { side: FoldSide }) {
  const { width, height, radius } = GEOM.panel;
  const inner = GEOM.display.inner;
  const vp = GEOM.viewport;
  const half = width - GEOM.band.inset; // 577
  // the right half's display box starts HINGE_BLEED left of its face (Face), so its slice shifts back
  const offsetX = side === "left" ? 0 : -half + HINGE_BLEED;
  const moving = side === "left";
  return (
    <Face
      part={`front-${side}`}
      width={width}
      height={height}
      radii={GEOM.halfRadii(side, "front", radius)}
      sides={{ top: true, bottom: true, left: side === "left", right: side === "right" }}
      variant="screen"
    >
      <ScreenSurface on={screenOn && fill === "wallpaper"} width={inner.width} height={inner.height} offsetX={offsetX} />
      {screenOn && children != null ? (
        <FoldContent
          angle={angle}
          // only the swinging half blurs, ramping in from the crease (the still half stays sharp)
          soften={moving}
          shade={moving ? { swing: innerSwing, hinge: "right" } : undefined}
          // each half's display box runs HINGE_BLEED past the hinge (Face), so neither slice's edge
          // lies on the crease
          width={half + HINGE_BLEED}
          height={inner.height}
          inert
        >
          <div
            data-duo-viewport={`inner-${side}`}
            style={{
              position: "absolute",
              left: offsetX,
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
        </FoldContent>
      ) : null}
      <GlassSheen width={inner.width} height={inner.height} offsetX={offsetX} />
    </Face>
  );
}

/**
 * The cover display on the left half's back (seen from behind: the hinge is on its left). Its content
 * softens with the fold blur and fades toward the dark glass as it swings away (D12).
 */
function CoverFace({ screenOn, angle, fill, children }: FaceContentProps) {
  const { width, height, radius } = GEOM.panel;
  const c = GEOM.display.cover;
  const vp = GEOM.viewport;
  return (
    <Face
      part="cover"
      width={width}
      height={height}
      radii={GEOM.halfRadii("left", "back", radius)}
      sides={ALL_SIDES}
      variant="screen"
      innerRadii={GEOM.halfRadii("left", "back", c.radiusOuter, c.radiusHinge)}
    >
      <ScreenSurface on={screenOn && fill === "wallpaper"} width={c.width} height={c.height} />
      {screenOn && children != null ? (
        <FoldContent angle={angle} soften shade={{ swing: coverSwing, hinge: "left" }} width={c.width} height={c.height} inert>
          <div
            data-duo-viewport="cover-face"
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
        </FoldContent>
      ) : null}
      <GlassSheen width={c.width} height={c.height} />
      <PunchHole display="cover" width={c.width} />
    </Face>
  );
}

/**
 * The keys on the right half's outer edge (Galaxy Z Fold 8): the volume rocker (two hit areas) and,
 * below it, the side key with the fingerprint sensor. Each is an outer surface plus front and back
 * lips; the lips are pills shaded like the frame, overlapping the edge by 1 px so they read as part
 * of it rather than slivers floating beside it.
 */
/** Opens a hardware button's app (lib/apps/registry.tsx) on the display facing the viewer. */
function pressHardware(target: HardwareTarget): void {
  const display = useFoldStore.getState().folded ? "cover" : "inner";
  if (appScreen(target, display)) useAppStore.getState().openApp(target, display);
}

/** A click area a little larger than the button, so the 2.4 px lip is easy to hit. */
const HIT = 10;

function HitArea({ target, label, x, y, width, height }: { target: HardwareTarget; label: string; x: number; y: number; width: number; height: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      data-hw-button={target}
      data-action={target}
      onClick={() => pressHardware(target)}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        padding: 0,
        border: 0,
        background: "none",
        cursor: "pointer",
        transform: `translate3d(${x}px, ${y}px, 1px)`,
        pointerEvents: "auto",
      }}
    />
  );
}

function Buttons() {
  const b = GEOM.buttons;
  const { width, thickness } = GEOM.panel;
  const zFront = -(thickness - b.depth) / 2;
  const base = {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: b.radius,
    background: "var(--device-ti-side)",
    boxShadow: buttonShadow,
    transformOrigin: "0 0",
    pointerEvents: "none",
  } as const;
  const lip = { ...base, background: "var(--device-button-lip)" } as const;
  return (
    <>
      {(
        [
          [b.volumeUp, "hw-volume-up", "Volume up"],
          [b.volumeDown, "hw-volume-down", "Volume down"],
          [b.power, "hw-side-key", "Side key"],
        ] as const
      ).map(([btn, target, label]) => {
        const y = btn.fromTop;
        const sideLip = { ...lip, width: b.protrude + 1, height: btn.length, borderRadius: `0 ${b.protrude}px ${b.protrude}px 0` };
        return (
          <div key={`side-${btn.fromTop}`} aria-hidden="true" data-fold-part="button">
            {/* outer surface, in the y-z plane */}
            <div style={{ ...base, width: b.depth, height: btn.length, transform: `translate3d(${width + b.protrude}px, ${y}px, ${zFront}px) rotateY(90deg)` }} />
            <div style={{ ...sideLip, transform: `translate3d(${width - 1}px, ${y}px, ${zFront}px)` }} />
            <div style={{ ...sideLip, transform: `translate3d(${width - 1}px, ${y}px, ${zFront - b.depth}px)` }} />
            <HitArea target={target} label={label} x={width - 2} y={y} width={b.protrude + HIT + 2} height={btn.length} />
          </div>
        );
      })}
    </>
  );
}
