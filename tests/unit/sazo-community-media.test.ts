import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { reviews } from "@/sazo-commerce/fixtures";

const expectedDimensions: Readonly<Record<string, string>> = {
  r01: "640x986",
  r02: "640x767",
  r03: "640x640",
  r04: "510x449",
  r05: "510x510",
  r06: "640x640",
  r07: "390x408",
  r08: "390x408",
};

describe("SAZO media-only community assets", () => {
  it("uses original review media or crops that stop above the recorded author UI", () => {
    for (const review of reviews) {
      expect(review.image).toBe(`/sazo-commerce/review-media/${review.id}.jpg`);
      const result = spawnSync(
        "ffprobe",
        [
          "-v",
          "error",
          "-select_streams",
          "v:0",
          "-show_entries",
          "stream=width,height",
          "-of",
          "csv=p=0:s=x",
          `public${review.image}`,
        ],
        { encoding: "utf8" },
      );

      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout.trim()).toBe(expectedDimensions[review.id]);
    }
  });
});
