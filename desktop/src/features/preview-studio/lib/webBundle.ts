/**
 * Static sites preview locally, with nothing leaving the machine.
 *
 * The bundler-backed preview posts the files to a third-party host and renders
 * the result in an iframe pointed at that host. For a plain HTML/CSS/JS site
 * that is both unnecessary and wrong for an offline-capable desktop app: the
 * artifact under review is someone's unreleased work. Here the entry document
 * is assembled into one self-contained string instead, and rendered in a
 * sandboxed frame with no network, no same-origin access, and no third party.
 *
 * Anything this cannot assemble — a React or Vue project needing a real
 * transpile — falls back to the bundler path in the stage.
 */

import type { WebFiles } from "./webSource";

/** Files are keyed with a leading slash; hrefs in the markup usually are not. */
function lookup(files: WebFiles, href: string): string | undefined {
  const clean = href.split(/[?#]/)[0] ?? href;
  const candidates = [
    clean,
    `/${clean}`,
    clean.replace(/^\.\//, "/"),
    clean.replace(/^\//, ""),
  ];
  for (const key of candidates) {
    if (files[key] !== undefined) return files[key];
  }
  return undefined;
}

/**
 * The entry document with its local stylesheets and scripts inlined. Returns
 * null when the document references a local file that is not in the map, so the
 * caller can fall back rather than render a half-built page.
 */
export function bundleStaticSite(
  files: WebFiles,
  entry: string,
): string | null {
  const html = files[entry] ?? files[`/${entry}`];
  if (typeof html !== "string") return null;

  let missing = false;
  let out = html;

  out = out.replace(
    /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi,
    (tag: string) => {
      const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
      if (!href || /^(https?:)?\/\//i.test(href) || href.startsWith("data:")) {
        return tag;
      }
      const css = lookup(files, href);
      if (css === undefined) {
        missing = true;
        return tag;
      }
      return `<style>\n${css}\n</style>`;
    },
  );

  out = out.replace(
    /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi,
    (tag: string, src: string) => {
      if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) return tag;
      const js = lookup(files, src);
      if (js === undefined) {
        missing = true;
        return tag;
      }
      return `<script>\n${js}\n</script>`;
    },
  );

  return missing ? null : out;
}
