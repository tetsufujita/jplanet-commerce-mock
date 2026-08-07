import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { afterEach, describe, expect, it } from "vitest";

interface PairSummary {
  differentPixels: number;
  ratio: number;
  status: "fail" | "pass" | "review";
}

const temporaryDirectories: string[] = [];

function writePng(path: string, width: number, height: number, changedPixel = false) {
  const png = new PNG({ height, width });

  for (let index = 0; index < png.data.length; index += 4) {
    png.data[index] = 255;
    png.data[index + 1] = 255;
    png.data[index + 2] = 255;
    png.data[index + 3] = 255;
  }

  if (changedPixel) {
    png.data[0] = 0;
    png.data[1] = 0;
    png.data[2] = 0;
  }

  writeFileSync(path, PNG.sync.write(png));
}

function runPair(referencePath: string, actualPath: string, outputPath: string) {
  return spawnSync(
    "node",
    [
      "scripts/sazo-compare.mjs",
      "--pair",
      referencePath,
      actualPath,
      "--out",
      outputPath,
    ],
    { encoding: "utf8" },
  );
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("SAZO PNG comparison CLI", () => {
  it("returns a zero-ratio pass for identical 8 by 8 images", () => {
    const directory = mkdtempSync(join(tmpdir(), "sazo-compare-"));
    temporaryDirectories.push(directory);
    const referencePath = join(directory, "reference.png");
    const actualPath = join(directory, "actual.png");
    const outputPath = join(directory, "summary.json");
    writePng(referencePath, 8, 8);
    writePng(actualPath, 8, 8);

    const result = runPair(referencePath, actualPath, outputPath);

    expect(result.status).toBe(0);
    expect(JSON.parse(readFileSync(outputPath, "utf8")) as PairSummary).toMatchObject({
      differentPixels: 0,
      ratio: 0,
      status: "pass",
    });
  });

  it("detects a one-pixel visual difference", () => {
    const directory = mkdtempSync(join(tmpdir(), "sazo-compare-"));
    temporaryDirectories.push(directory);
    const referencePath = join(directory, "reference.png");
    const actualPath = join(directory, "actual.png");
    const outputPath = join(directory, "summary.json");
    writePng(referencePath, 8, 8);
    writePng(actualPath, 8, 8, true);

    const result = runPair(referencePath, actualPath, outputPath);
    const summary = JSON.parse(readFileSync(outputPath, "utf8")) as PairSummary;

    expect(result.status).toBe(0);
    expect(summary.differentPixels).toBe(1);
    expect(summary.ratio).toBeGreaterThan(0);
  });

  it("fails with a dimension-mismatch diagnostic", () => {
    const directory = mkdtempSync(join(tmpdir(), "sazo-compare-"));
    temporaryDirectories.push(directory);
    const referencePath = join(directory, "reference.png");
    const actualPath = join(directory, "actual.png");
    const outputPath = join(directory, "summary.json");
    writePng(referencePath, 8, 8);
    writePng(actualPath, 9, 8);

    const result = runPair(referencePath, actualPath, outputPath);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("dimension-mismatch");
  });
});
