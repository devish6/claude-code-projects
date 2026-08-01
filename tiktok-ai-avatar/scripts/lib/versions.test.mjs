import { describe, expect, test } from "vitest";
import { versionOf } from "./versions.mjs";

const newestOf = (names) => names.reduce((a, b) => (versionOf(b) > versionOf(a) ? b : a));

describe("newestRender", () => {
  test("picks the highest version while they are single digit", () => {
    expect(newestOf(["X - v1.mp4", "X - v2.mp4", "X - v4.mp4", "X - v3.mp4"])).toBe("X - v4.mp4");
  });

  test("REGRESSION — keeps working past v9, where a lexicographic sort fails", () => {
    const names = ["X - v8.mp4", "X - v9.mp4", "X - v10.mp4", "X - v11.mp4"];
    // The old implementation was [...].sort().at(-1), which returns v9 here.
    expect([...names].sort().at(-1)).toBe("X - v9.mp4");
    expect(newestOf(names)).toBe("X - v11.mp4");
  });

  test("a file with no version suffix never outranks a real render", () => {
    expect(newestOf(["X - v1.mp4", "loose.mp4"])).toBe("X - v1.mp4");
  });
});
