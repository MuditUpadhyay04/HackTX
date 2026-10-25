const routes = ["/scenes", "/test/tokens", "/test/placeholder"] as const;

const hairline = "var(--hairline) solid color-mix(in srgb, var(--ui-gray) 40%, transparent)";

export default function Home() {
  return (
    <main className="min-h-dvh bg-stage-black font-sans text-ui-gray6">
      <div className="max-w-120 px-4 pt-12 pb-8">
        <ul className="m-0 list-none p-0" style={{ borderTop: hairline }}>
          {routes.map((href) => (
            <li key={href} style={{ borderBottom: hairline }}>
              <a
                data-nav
                href={href}
                className="flex min-h-11 items-center py-2.5 text-body text-ui-blue no-underline"
              >
                {href}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
