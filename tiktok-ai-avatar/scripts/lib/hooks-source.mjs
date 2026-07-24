/**
 * Reads hook objects straight out of src/viral/hooks.ts by parsing the
 * source text -- same technique as scripts/hooks-doc.mjs, extended slightly
 * to also work as a plain-JS `hookById()` lookup for scripts/daily-viral.mjs
 * (a .mjs script can't `import` a .ts file directly without a loader, and
 * hooks.ts is TypeScript with a `Hook` type annotation on the array).
 */
import { readFileSync } from "node:fs";

const OBJECT_RE =
  /\{\s*id:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*variant:\s*"([^"]+)",\s*text:\s*"((?:[^"\\]|\\.)*)",\s*accent:\s*"((?:[^"\\]|\\.)*)",(?:\s*sub:\s*"((?:[^"\\]|\\.)*)",)?(?:\s*number:\s*(\d+),)?\s*\}/g;

export const readAllHooks = (path = "src/viral/hooks.ts") => {
  const src = readFileSync(path, "utf8");
  const out = [];
  let m;
  const re = new RegExp(OBJECT_RE);
  while ((m = re.exec(src))) {
    out.push({
      id: m[1],
      category: m[2],
      variant: m[3],
      text: m[4].replace(/\\"/g, '"'),
      accent: m[5].replace(/\\"/g, '"'),
      sub: m[6]?.replace(/\\"/g, '"'),
      number: m[7] ? Number(m[7]) : undefined,
    });
  }
  return out;
};

export const makeHookIndex = (path = "src/viral/hooks.ts") => {
  const all = readAllHooks(path);
  const byId = new Map(all.map((h) => [h.id, h]));
  return { all, byId, get: (id) => byId.get(id) };
};
