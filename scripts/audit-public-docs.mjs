#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const roots = [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "TESTING.md",
  "FORK_PATCHES.md",
  "docs",
];
const forbidden = [/file:\/\//i, /\/Users\//, /\/var\/folders\//];
const externalScheme = /^(?:https?|mailto|data|blob|buzz|nostr):/i;

function walk(path) {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return extname(path) === ".md" ? [path] : [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    walk(resolve(path, entry.name)),
  );
}

function withoutFencedCode(markdown) {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, "");
}

function destinations(markdown) {
  const values = [];
  const body = withoutFencedCode(markdown);
  const markdownLink = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^)]*["'])?\s*\)/g;
  const htmlLink = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  for (const match of body.matchAll(markdownLink)) values.push(match[1] ?? match[2]);
  for (const match of body.matchAll(htmlLink)) values.push(match[1]);
  return values;
}

const failures = [];
let checkedLinks = 0;
const files = roots.flatMap((path) => walk(resolve(root, path)));

for (const file of files) {
  const markdown = readFileSync(file, "utf8");
  const label = relative(root, file);
  for (const pattern of forbidden) {
    if (pattern.test(markdown)) failures.push(`${label}: contains private/local path matching ${pattern}`);
  }

  for (const raw of destinations(markdown)) {
    if (!raw || raw.startsWith("#") || externalScheme.test(raw)) continue;
    const pathPart = raw.split("#", 1)[0].split("?", 1)[0];
    if (!pathPart) continue;
    checkedLinks += 1;
    let decoded;
    try {
      decoded = decodeURIComponent(pathPart);
    } catch {
      failures.push(`${label}: invalid encoded link ${raw}`);
      continue;
    }
    const target = resolve(dirname(file), decoded);
    if (target !== root && !target.startsWith(`${root}${sep}`)) {
      failures.push(`${label}: link escapes repository: ${raw}`);
    } else if (!existsSync(target)) {
      failures.push(`${label}: missing target: ${raw}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  console.error(`public documentation audit failed with ${failures.length} problem(s)`);
  process.exit(1);
}

console.log(`public documentation audit passed: ${files.length} Markdown files, ${checkedLinks} local links`);
