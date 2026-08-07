import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface Recording {
  source: string;
  viewport: { width: number; height: number };
  durationSeconds: number;
  checkpoints: { name: string; second: number }[];
}

const manifest = JSON.parse(
  readFileSync("design/reproductions/sazo-commerce/reference-manifest.json", "utf8"),
) as { desktop: Recording; mobile: Recording };

describe("SAZO recording manifest", () => {
  it("pins both approved recordings and viewport sizes", () => {
    expect(manifest.desktop.viewport).toEqual({ width: 3022, height: 1656 });
    expect(manifest.mobile.viewport).toEqual({ width: 682, height: 1470 });
    expect(manifest.desktop.durationSeconds).toBeCloseTo(448.23, 2);
    expect(manifest.mobile.durationSeconds).toBeCloseTo(211.957, 2);
  });

  it("defines an ordered, unique checkpoint sequence", () => {
    for (const recording of [manifest.desktop, manifest.mobile]) {
      const names = recording.checkpoints.map(({ name }) => name);
      const seconds = recording.checkpoints.map(({ second }) => second);
      expect(new Set(names).size).toBe(names.length);
      expect(seconds).toEqual([...seconds].sort((a, b) => a - b));
      expect(seconds.at(-1)).toBeLessThan(recording.durationSeconds);
    }
  });
});
