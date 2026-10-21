/** Key the visitor's chosen theme is stored under. */
export const THEME_STORAGE_KEY = "h2-theme";

/*
 * Runs before the page paints and stamps the stored theme onto <html>.
 *
 * It has to be an inline, synchronous script: the site is statically
 * generated, so the server cannot know which theme this visitor picked, and
 * anything deferred (a `useEffect`, a `next/script` strategy) would let the
 * light theme paint first and then snap to dark — the flash every hand-rolled
 * theme switch is known for.
 *
 * Light is the default, so no storage entry means `light`. System preference
 * is deliberately *not* consulted: the brief was a light default, and reading
 * `prefers-color-scheme` here would hand a dark-desktop visitor the dark theme
 * on their first visit instead.
 */
const SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
