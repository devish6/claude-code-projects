/**
 * Plain-JS mirror of the copy rules enforced by src/viral/hooks.test.ts.
 * Used by the pipeline when it has to author a fallback hook itself (every
 * hand-authored hook in HOOK_LIBRARY/DAILY_HOOKS already passes the real
 * test -- this only guards hooks the SCRIPT invents on its own, which happens
 * rarely: only once every unused-in-21-days hook in a category is gone).
 */
const MAX_LINE = 22;

export const isAnchored = (h) => {
  const s = `${h.text} ${h.accent} ${h.sub ?? ""}`.toLowerCase();
  return /\d/.test(s) || /\byou(r|'re)?\b|\bmy\b|\bme\b/.test(s);
};

export const isDateList = (s) => /\d(st|nd|rd|th)?,/.test(s);

export const validateHook = (h) => {
  const errors = [];
  if (h.text.length > MAX_LINE) errors.push(`text too long (${h.text.length} > ${MAX_LINE}): "${h.text}"`);
  if (h.accent.length > MAX_LINE) errors.push(`accent too long (${h.accent.length} > ${MAX_LINE}): "${h.accent}"`);
  if (!isAnchored(h)) errors.push("not anchored to a number, date, or direct 'you'");
  if (h.text.includes(",") && !isDateList(h.text)) errors.push("text has a comma that isn't a date list -- probably two ideas");
  return errors;
};
