/**
 * /judge: the phone for judges' own phones (try.<host> lands here). Same home screen as /phone, but
 * Un-Said opens its try-mode build (mobile/scripts/build-try.sh, served at /try: privacy first, a
 * private sandbox per browser, nothing sends) and every other app shows a demo notice
 * (components/apps/demo/DemoNotice.tsx). Apps only render after a tap, so reading the address here
 * never differs between the server render and the browser.
 */
export const isJudge = (): boolean => typeof window !== "undefined" && /^\/judge(\/|$)/.test(window.location.pathname);

/** Where the try-mode Un-Said build is served. */
export const TRY_BASE = "/try";
