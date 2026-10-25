import Link from "next/link";
import { scenesByGroup, sceneUrl } from "@/lib/scenes";
import { size } from "@/lib/tokens";

/*
 * Dev index of lib/scenes.ts: an iOS inset-grouped list on black. Colors are tokens only.
 */
const color = {
  label: "var(--label-on-dark)",
  secondary: "var(--ios-gray)",
  cell: "var(--ios-dark-fill)",
  separator: "var(--ios-dark-separator)",
} as const;

function Chevron() {
  return (
    <svg
      width={size.disclosureWidth}
      height={size.disclosureHeight}
      viewBox={`0 0 ${size.disclosureWidth} ${size.disclosureHeight}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M1.5 1.5 6.5 6.5 1.5 11.5"
        fill="none"
        stroke={color.secondary}
        strokeWidth={size.disclosureStroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ScenesPage() {
  const groups = scenesByGroup();

  return (
    <main className="h-dvh overflow-y-auto bg-stage-black" style={{ color: color.label }}>
      <div className="max-w-xl px-5 pt-14 pb-20">
        <h1 className="m-0 pl-4" style={{ font: "var(--type-large-title-semibold)", letterSpacing: "var(--type-large-title-tracking)" }}>
          Scenes
        </h1>

        {groups.map(({ group, scenes }) => (
          <section key={group} className="mt-8">
            <h2
              className="m-0 mb-1.5 pl-4 uppercase"
              style={{ font: "var(--type-footnote)", letterSpacing: "var(--type-footnote-tracking)", color: color.secondary }}
            >
              {group}
            </h2>
            <ul className="m-0 list-none overflow-hidden rounded-10 p-0" style={{ background: color.cell }}>
              {scenes.map((scene, index) => {
                const href = sceneUrl(scene);
                return (
                  <li key={scene.id}>
                    <Link
                      href={href}
                      data-nav
                      className="block pl-4 no-underline active:bg-[var(--material-pill-dark)] focus-visible:bg-[var(--material-pill-dark)] focus-visible:outline-none"
                      style={{ color: "inherit" }}
                    >
                      <div
                        className="flex items-center gap-3 py-2.5 pr-4"
                        style={index > 0 ? { borderTop: `var(--hairline) solid ${color.separator}` } : undefined}
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span style={{ font: "var(--type-body)", letterSpacing: "var(--type-body-tracking)" }}>
                            {scene.label}
                          </span>
                          <span
                            className="truncate"
                            style={{
                              font: "var(--type-subheadline)",
                              letterSpacing: "var(--type-subheadline-tracking)",
                              color: color.secondary,
                            }}
                          >
                            {href}
                          </span>
                        </div>
                        <Chevron />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
