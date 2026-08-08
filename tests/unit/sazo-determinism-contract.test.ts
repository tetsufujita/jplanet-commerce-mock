import { describe, expect, it } from "vitest";
import {
  compareRunFingerprints,
  normalizeComparisonSummary,
} from "../../scripts/sazo-determinism-core.mjs";

describe("SAZO capture determinism contract", () => {
  it("ignores only the volatile generatedAt field in comparison summaries", () => {
    const first = normalizeComparisonSummary(
      JSON.stringify({
        checkpoints: [{ name: "home-hero", ratio: 0.1 }],
        generatedAt: "2026-08-07T10:00:00.000Z",
        totals: { fail: 0, pass: 0, review: 1 },
      }),
    );
    const second = normalizeComparisonSummary(
      JSON.stringify({
        checkpoints: [{ name: "home-hero", ratio: 0.1 }],
        generatedAt: "2026-08-07T11:00:00.000Z",
        totals: { fail: 0, pass: 0, review: 1 },
      }),
    );

    expect(first).toBe(second);
    expect(first).not.toContain("generatedAt");
  });

  it("reports the exact reference, actual, or summary artifact that drifted", () => {
    const result = compareRunFingerprints([
      {
        actual: { "mobile/catalog-list.png": "actual-a" },
        reference: { "mobile/catalog-list.png": "reference-a" },
        summary: "summary-a",
      },
      {
        actual: { "mobile/catalog-list.png": "actual-b" },
        reference: { "mobile/catalog-list.png": "reference-a" },
        summary: "summary-b",
      },
    ]);

    expect(result).toEqual({
      deterministic: false,
      mismatches: [
        {
          actual: "actual-b",
          artifact: "actual/mobile/catalog-list.png",
          expected: "actual-a",
          run: 2,
        },
        {
          actual: "summary-b",
          artifact: "summary",
          expected: "summary-a",
          run: 2,
        },
      ],
    });
  });

  it("accepts three runs only when every fingerprint is exact", () => {
    const run = {
      actual: { "desktop/home-hero.png": "actual-a" },
      reference: { "desktop/home-hero.png": "reference-a" },
      summary: "summary-a",
    };

    expect(compareRunFingerprints([run, run, run])).toEqual({
      deterministic: true,
      mismatches: [],
    });
  });
});
