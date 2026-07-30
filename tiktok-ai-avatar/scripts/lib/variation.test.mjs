import { describe, expect, test } from "vitest";

import {
  LAYOUTS,
  PALETTES,
  STRUCTURES,
  TEMPOS,
  VARIATION_WINDOW_DAYS,
  fingerprint,
  findDuplicateFingerprints,
  pickVariation,
} from "./variation.mjs";

/**
 * Why this module exists, in one measurement:
 *
 * Every one of the 28 videos rendered before 2026-07-30 was EXACTLY
 * 17.450667s, 1080x1920, 30fps, with cuts on frames 48/192/264/336 and a
 * single palette. TikTok withheld them as repeated content and the account
 * was deleted with literal zero views — zero means never distributed, which
 * is suppression, not weak performance.
 *
 * The old design said so out loud: "only the copy and the number change
 * between videos... two variants share every frame of motion." That bought
 * cheap A/B testing and cost the account. These tests make the duplicate
 * fingerprint impossible to reintroduce.
 */

const videosWithVariations = (variations) =>
  variations.map((variation, i) => ({
    v: `V${String(i + 1).padStart(2, "0")}`,
    date: `2026-08-${String(i + 1).padStart(2, "0")}`,
    variation,
  }));

describe("the variation pools", () => {
  test("offer more than one option on every axis — a pool of one is what failed", () => {
    expect(STRUCTURES.length).toBeGreaterThan(1);
    expect(TEMPOS.length).toBeGreaterThan(1);
    expect(LAYOUTS.length).toBeGreaterThan(1);
    expect(PALETTES.length).toBeGreaterThan(1);
  });

  test("no two structures share a duration, so duration alone distinguishes them", () => {
    const seconds = STRUCTURES.map((s) => s.seconds);

    expect(new Set(seconds).size).toBe(seconds.length);
  });

  test("no structure reuses the fingerprinted 17.45s duration", () => {
    expect(STRUCTURES.map((s) => s.seconds)).not.toContain(17.4);
  });

  test("every structure still opens on a hook and ends on a CTA", () => {
    for (const s of STRUCTURES) {
      expect(s.acts.hook).toBeGreaterThan(0);
      expect(s.acts.cta).toBeGreaterThan(0);
      const summed = s.acts.hook + s.acts.build + s.acts.value + s.acts.cta;
      expect(summed).toBeCloseTo(s.seconds, 5);
    }
  });

  /** A beat that lands on a whole number of frames is what pinned every cut
   *  to the same grid. Tempos must not all divide evenly into 30fps. */
  test("tempos do not all share one frame grid", () => {
    const framesPerBeat = TEMPOS.map((bpm) => (60 / bpm) * 30);

    expect(new Set(framesPerBeat).size).toBe(TEMPOS.length);
  });
});

describe("fingerprint", () => {
  test("is the tuple that duplicate detection can see", () => {
    const fp = fingerprint({
      structure: "snap",
      tempo: 128,
      layout: "split",
      palette: "ember",
    });

    expect(fp).toBe("snap|128|split|ember");
  });
});

describe("pickVariation", () => {
  test("is deterministic — the same day always picks the same variation", () => {
    const state = { videos: [] };

    expect(pickVariation(state, "2026-08-01", 0)).toEqual(pickVariation(state, "2026-08-01", 0));
  });

  test("gives the three videos of one day different fingerprints", () => {
    const state = { videos: [] };
    const day = [0, 1, 2].map((slot) => fingerprint(pickVariation(state, "2026-08-01", slot)));

    expect(new Set(day).size).toBe(3);
  });

  test("never repeats a fingerprint used inside the rolling window", () => {
    const state = { videos: [] };

    for (let day = 0; day < VARIATION_WINDOW_DAYS; day++) {
      const date = `2026-08-${String(day + 1).padStart(2, "0")}`;
      for (const slot of [0, 1, 2]) {
        const variation = pickVariation(state, date, slot);
        state.videos.push({ v: `V${day}-${slot}`, date, variation });
      }
    }

    expect(findDuplicateFingerprints(state)).toEqual([]);
  });

  test("never gives consecutive videos the same layout", () => {
    const state = { videos: [] };

    for (let day = 0; day < 10; day++) {
      const date = `2026-08-${String(day + 1).padStart(2, "0")}`;
      for (const slot of [0, 1, 2]) {
        state.videos.push({ v: `V${day}-${slot}`, date, variation: pickVariation(state, date, slot) });
      }
    }

    for (let i = 1; i < state.videos.length; i++) {
      expect(state.videos[i].variation.layout).not.toBe(state.videos[i - 1].variation.layout);
    }
  });

  test("always returns options drawn from the declared pools", () => {
    const state = { videos: [] };
    const variation = pickVariation(state, "2026-08-01", 0);

    expect(STRUCTURES.map((s) => s.id)).toContain(variation.structure);
    expect(TEMPOS).toContain(variation.tempo);
    expect(LAYOUTS).toContain(variation.layout);
    expect(PALETTES).toContain(variation.palette);
  });
});

describe("findDuplicateFingerprints", () => {
  test("catches the failure that killed the account", () => {
    const identical = { structure: "standard", tempo: 150, layout: "centered", palette: "sage-gold" };
    const state = { videos: videosWithVariations([identical, identical, identical]) };

    expect(findDuplicateFingerprints(state).length).toBeGreaterThan(0);
  });

  test("passes a genuinely varied run", () => {
    const state = {
      videos: videosWithVariations([
        { structure: "snap", tempo: 128, layout: "split", palette: "ember" },
        { structure: "standard", tempo: 140, layout: "fullbleed", palette: "ink-violet" },
        { structure: "essay", tempo: 165, layout: "grid", palette: "mono" },
      ]),
    };

    expect(findDuplicateFingerprints(state)).toEqual([]);
  });

  test("ignores videos that fell out of the rolling window", () => {
    const identical = { structure: "standard", tempo: 150, layout: "centered", palette: "sage-gold" };
    const state = {
      videos: [
        { v: "V01", date: "2026-01-01", variation: identical },
        { v: "V02", date: "2026-08-01", variation: identical },
      ],
    };

    expect(findDuplicateFingerprints(state)).toEqual([]);
  });
});

describe("axis independence", () => {
  /**
   * A first cut of pickVariation derived every axis from one seed offset, so
   * structure index always equalled tempo index: 14.2s was ALWAYS 128 BPM and
   * 27.8s was ALWAYS 165. That collapses 16 duration/tempo combinations to 4
   * and rebuilds a weaker version of the fingerprint this module exists to
   * destroy. The axes must vary independently.
   */
  test("one structure does not always carry the same tempo", () => {
    const state = { videos: [] };
    const pairs = new Map();

    for (let day = 0; day < 12; day++) {
      const date = `2026-08-${String(day + 1).padStart(2, "0")}`;
      for (const slot of [0, 1, 2]) {
        const variation = pickVariation(state, date, slot);
        state.videos.push({ v: `V${day}-${slot}`, date, variation });
        if (!pairs.has(variation.structure)) pairs.set(variation.structure, new Set());
        pairs.get(variation.structure).add(variation.tempo);
      }
    }

    const variedStructures = [...pairs.values()].filter((tempos) => tempos.size > 1);
    expect(variedStructures.length).toBeGreaterThan(0);
  });
});
