/**
 * components/device/materials.ts: composite device materials (thin rings, raised-glass rims). The
 * ring width comes from geometry.ts; every color and shadow recipe is a token from app/tokens.css.
 */
import { GEOM } from "./geometry";

const v = (name: string) => `var(--${name})`;

/** Punch-hole: a faint glass ring around the lens. */
export const punchRing = `0 0 0 ${GEOM.punch.ring}px ${v("device-front-camera-ring")}`;

/** Camera plateau on the glass back: a soft cast shadow, a dark seat line and a lit top edge. */
export const plateauShadow = v("shadow-device-plateau");

/** Lens ring: a dark seat around the titanium ring. */
export const lensRingShadow = v("shadow-device-lens-ring");

/** Lens glass: depth inside the ring. */
export const lensGlassShadow = v("shadow-device-lens-glass");

/** Side buttons: a lit edge and a contact line where they leave the frame. */
export const buttonShadow = v("shadow-device-button");
