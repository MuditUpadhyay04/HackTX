// Illustrated people, drawn from the icon palette. Never a photo, never a letter.
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

type Kind = "riley" | "mom" | "dad" | "sarah" | "michael" | "other";

const HAIR: Record<Kind, string> = {
  riley: "#677FEF",
  mom: "#AD78D4",
  dad: "#607CF2",
  sarah: "#C6A9F4",
  michael: "#8776DF",
  other: "#A166B7",
};

const SHOULDER: Record<Kind, string> = {
  riley: "#4F62F4",
  mom: "#A166B7",
  dad: "#677FEF",
  sarah: "#AD8FED",
  michael: "#4046EE",
  other: "#8776DF",
};

function kindOf(name: string): Kind {
  const n = name.trim().toLowerCase();
  if (n.startsWith("mom") || n.startsWith("mum") || n === "ma" || n === "amma") return "mom";
  if (n.startsWith("dad") || n.startsWith("papa")) return "dad";
  if (n.startsWith("sarah")) return "sarah";
  if (n.startsWith("michael") || n.startsWith("mike")) return "michael";
  if (n.startsWith("riley") || n === "r") return "riley";
  return "other";
}

export function Portrait({ name, size }: { name: string; size: number }) {
  const kind = kindOf(name);
  const hair = HAIR[kind];
  const shoulder = SHOULDER[kind];
  const long = kind === "sarah" || kind === "mom";
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Circle cx="40" cy="40" r="40" fill="#E3DDFA" />
      {kind === "sarah" ? <Path d="M16 40 C14 62 20 86 28 90 L52 90 C60 86 66 62 64 40 C60 28 20 28 16 40Z" fill={hair} /> : null}
      {kind === "mom" ? (
        <>
          <Circle cx="40" cy="16" r="9" fill={hair} />
          <Path d="M20 38 C18 58 22 84 30 90 L50 90 C58 84 62 58 60 38 C56 28 24 28 20 38Z" fill={hair} />
        </>
      ) : null}
      <Ellipse cx="40" cy="78" rx="26" ry="22" fill={shoulder} />
      <Circle cx="40" cy="38" r="15" fill="#FFFFFF" />
      {kind === "dad" ? <Path d="M25 34 C27 18 53 18 55 34 C49 24 31 24 25 34Z" fill={hair} /> : null}
      {!long && kind !== "dad" ? <Path d="M24 36 C26 18 54 18 56 36 C50 24 30 24 24 36Z" fill={hair} /> : null}
      {kind === "sarah" ? <Path d="M26 34 C28 20 52 20 54 32 C48 24 32 24 26 34Z" fill={hair} /> : null}
      {kind === "mom" ? <Path d="M27 32 C29 22 51 22 53 32 C47 26 33 26 27 32Z" fill={hair} /> : null}
      <Circle cx="34.5" cy="38" r="1.5" fill="#1D1742" />
      <Circle cx="45.5" cy="38" r="1.5" fill="#1D1742" />
      <Path d="M35 43.5 Q40 46.5 45 43.5" stroke="#1D1742" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </Svg>
  );
}
