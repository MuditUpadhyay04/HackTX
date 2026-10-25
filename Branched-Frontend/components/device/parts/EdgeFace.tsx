import { GEOM, continuousRectPoints, type DuoSide } from "../geometry";
import { HIDDEN_BACKFACE } from "./Face";

/** Overlap between neighbouring strips so no hairline crack shows at any angle. */
const OVERLAP = 0.6;

/** Two decimals, so the server-rendered and hydrated style strings are identical. */
const r2 = (n: number) => Math.round(n * 100) / 100;

type Strip = { x: number; y: number; angle: number; length: number; shade: number };

/**
 * The side faces of one half along its outline (front view, panel-local), except the hinge side
 * (covered by the other half flat, by the spine folded). Walked counter-clockwise on screen so each
 * strip's outward normal is (-dy, dx).
 */
function strips(side: DuoSide): Strip[] {
  const { width, height, radius } = GEOM.panel;
  const radii = GEOM.halfRadii(side, "front", radius);
  const hingeX = side === "left" ? width : 0;
  const pts = continuousRectPoints(width, height, radii, 6).reverse();
  const out: Strip[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    if (Math.abs(p.x - hingeX) < 0.01 && Math.abs(q.x - hingeX) < 0.01) continue;
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const length = Math.hypot(dx, dy);
    if (length < 0.01) continue;
    const ux = dx / length;
    const uy = dy / length;
    const ny = ux;
    // lit from above: the top edge brightest, the bottom edge darkest
    const shade = Math.round((0.08 + 0.34 * ((ny + 1) / 2)) * 1000) / 1000;
    out.push({
      x: r2(p.x - ux * (OVERLAP / 2)),
      y: r2(p.y - uy * (OVERLAP / 2)),
      angle: r2((Math.atan2(dy, dx) * 180) / Math.PI),
      length: r2(length + OVERLAP),
      shade,
    });
  }
  return out;
}

const STRIPS: Record<DuoSide, Strip[]> = { left: strips("left"), right: strips("right") };

/**
 * The 18 px titanium side wall of one half: strips standing perpendicular to the front face along
 * the outline (corner curves split into facets), filled with the frame's cross-section gradient
 * (dark chamfers, bright flat), shaded top-lit. Each faces outward and hides its reverse.
 */
export function EdgeFace({ side }: { side: DuoSide }) {
  const t = GEOM.panel.thickness;
  return (
    <>
      {STRIPS[side].map((s, i) => (
        <div
          key={i}
          aria-hidden="true"
          data-duo-part={i === 0 ? `edge-${side}` : undefined}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: s.length,
            height: t,
            transformOrigin: "0 0",
            transform: `translate3d(${s.x}px, ${s.y}px, 0) rotateZ(${s.angle}deg) rotateX(-90deg)`,
            background: "var(--device-ti-side)",
            ...HIDDEN_BACKFACE,
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "var(--device-ti-deep)", opacity: s.shade }} />
        </div>
      ))}
    </>
  );
}
