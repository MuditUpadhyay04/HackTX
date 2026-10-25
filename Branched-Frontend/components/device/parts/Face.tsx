import type { CSSProperties, ReactNode } from "react";
import { GEOM, continuousClip, type CornerRadii } from "../geometry";

/** Faces of a closed 3D slab never show their reverse side (the opposite face does). */
export const HIDDEN_BACKFACE = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
} as const;

/** Which sides of a face carry the frame band (the hinge side of an inner face does not). */
export type BandSides = { top: boolean; right: boolean; bottom: boolean; left: boolean };

export const ALL_SIDES: BandSides = { top: true, right: true, bottom: true, left: true };

type Box = { x: number; y: number; width: number; height: number; radii: CornerRadii };

/** The face outline shrunk by `d` on the banded sides (corners shrink with it, square stays square). */
function insetBox(width: number, height: number, outer: CornerRadii, sides: BandSides, d: number): Box {
  const l = sides.left ? d : 0;
  const t = sides.top ? d : 0;
  const r = sides.right ? d : 0;
  const b = sides.bottom ? d : 0;
  const shrink = (v: number) => (v === 0 ? 0 : Math.max(0, v - d));
  return {
    x: l,
    y: t,
    width: width - l - r,
    height: height - t - b,
    radii: { tl: shrink(outer.tl), tr: shrink(outer.tr), br: shrink(outer.br), bl: shrink(outer.bl) },
  };
}

function Layer({ box, background, children, style }: { box: Box; background: string; children?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      aria-hidden={children ? undefined : true}
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
        clipPath: continuousClip(box.width, box.height, box.radii),
        background,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type FaceProps = {
  width: number;
  height: number;
  /** outline radii as seen on this face */
  radii: CornerRadii;
  sides: BandSides;
  /** "screen": frame + black bezel + display; "glass": frame + back glass */
  variant: "screen" | "glass";
  /** override the display / glass corner radii (default: the outline radii minus the band) */
  innerRadii?: CornerRadii;
  /** the display (or glass) contents, laid out in the display box */
  children?: ReactNode;
  /** data-duo-part label */
  part: string;
  style?: CSSProperties;
};

/**
 * One flat face of a half (front = inner display, back = cover display or glass back): the
 * natural-titanium frame band seen from the front, drawn as nested continuous-corner layers, a
 * dark outer rim, a bright chamfer line, the brushed band, a dark seat line, then the black bezel
 * and the display (or the back glass). Hidden from behind.
 */
export function Face({ width, height, radii, sides, variant, innerRadii, children, part, style }: FaceProps) {
  const b = GEOM.band;
  const rim = insetBox(width, height, radii, sides, 0);
  const chamfer = insetBox(width, height, radii, sides, b.rim);
  const band = insetBox(width, height, radii, sides, b.rim + b.chamfer);
  const seat = insetBox(width, height, radii, sides, b.frame - b.seat);
  const bezel = insetBox(width, height, radii, sides, b.frame);
  const content = insetBox(width, height, radii, sides, variant === "screen" ? b.inset : b.frame);
  if (innerRadii) content.radii = innerRadii;
  return (
    <div
      data-duo-part={part}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        ...HIDDEN_BACKFACE,
        ...style,
      }}
    >
      <Layer box={rim} background="var(--device-ti-deep)" />
      <Layer box={chamfer} background="var(--device-ti-highlight)" />
      <Layer box={band} background="var(--device-ti-brush), var(--device-ti-band)" />
      <Layer box={seat} background="var(--device-ti-shadow)" />
      {variant === "screen" ? <Layer box={bezel} background="var(--device-bezel)" /> : null}
      <Layer
        box={content}
        background={variant === "screen" ? "var(--device-display-off)" : "var(--device-back-glass-ti-fill)"}
        style={{ isolation: "isolate" }}
      >
        {children}
      </Layer>
    </div>
  );
}
