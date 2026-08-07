import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PNG } from "pngjs";
import { afterEach, describe, expect, it } from "vitest";

interface PairSummary {
  differentPixels: number;
  ratio: number;
  status: "fail" | "pass" | "review";
}

interface BatchSummary {
  checkpoints: (PairSummary & {
    error?: string;
    name: string;
    viewport: string;
  })[];
  comparison: {
    includeAA: boolean;
    threshold: number;
  };
  totals: Record<"fail" | "pass" | "review", number>;
}

const temporaryDirectories: string[] = [];

function createPng(
  width: number,
  height: number,
  color: readonly [number, number, number] = [255, 255, 255],
) {
  const png = new PNG({ height, width });

  for (let index = 0; index < png.data.length; index += 4) {
    png.data[index] = color[0];
    png.data[index + 1] = color[1];
    png.data[index + 2] = color[2];
    png.data[index + 3] = 255;
  }

  return png;
}

function setPixel(
  png: PNG,
  pixelIndex: number,
  color: readonly [number, number, number],
) {
  const offset = pixelIndex * 4;
  png.data[offset] = color[0];
  png.data[offset + 1] = color[1];
  png.data[offset + 2] = color[2];
  png.data[offset + 3] = 255;
}

function writePng(path: string, png: PNG) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, PNG.sync.write(png));
}

function writeDifferenceFixture(
  referencePath: string,
  actualPath: string,
  changedPixels: number,
) {
  const reference = createPng(10, 10);
  const actual = createPng(10, 10);

  for (let index = 0; index < changedPixels; index += 1) {
    setPixel(actual, index, [0, 0, 0]);
  }

  writePng(referencePath, reference);
  writePng(actualPath, actual);
}

function runPair(
  referencePath: string,
  actualPath: string,
  outputPath: string,
  artifacts?: { diffPath: string; sideBySidePath: string },
) {
  const artifactArguments =
    artifacts === undefined
      ? []
      : ["--diff", artifacts.diffPath, "--side-by-side", artifacts.sideBySidePath];

  return spawnSync(
    "node",
    [
      "scripts/sazo-compare.mjs",
      "--pair",
      referencePath,
      actualPath,
      "--out",
      outputPath,
      ...artifactArguments,
    ],
    { encoding: "utf8" },
  );
}

function makeTemporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), "sazo-compare-"));
  temporaryDirectories.push(directory);

  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("SAZO PNG comparison CLI", () => {
  it("returns a zero-ratio pass for identical images", () => {
    const directory = makeTemporaryDirectory();
    const referencePath = join(directory, "reference.png");
    const actualPath = join(directory, "actual.png");
    const outputPath = join(directory, "summary.json");
    writeDifferenceFixture(referencePath, actualPath, 0);

    const result = runPair(referencePath, actualPath, outputPath);

    expect(result.status).toBe(0);
    expect(JSON.parse(readFileSync(outputPath, "utf8")) as PairSummary).toMatchObject({
      differentPixels: 0,
      ratio: 0,
      status: "pass",
    });
  });

  it.each([
    [8, 0.08, "pass", 0],
    [9, 0.09, "review", 0],
    [18, 0.18, "review", 0],
    [19, 0.19, "fail", 1],
  ] as const)(
    "classifies %s of 100 changed pixels at the exact policy boundary",
    (changedPixels, ratio, status, exitStatus) => {
      const directory = makeTemporaryDirectory();
      const referencePath = join(directory, "reference.png");
      const actualPath = join(directory, "actual.png");
      const outputPath = join(directory, "summary.json");
      writeDifferenceFixture(referencePath, actualPath, changedPixels);

      const result = runPair(referencePath, actualPath, outputPath);
      const summary = JSON.parse(readFileSync(outputPath, "utf8")) as PairSummary;

      expect(result.status).toBe(exitStatus);
      expect(summary).toMatchObject({ ratio, status });
      expect(summary.differentPixels).toBe(changedPixels);
    },
  );

  it("uses threshold 0.12 and excludes anti-aliased edge pixels", () => {
    const directory = makeTemporaryDirectory();
    const referencePath = join(directory, "reference.png");
    const actualPath = join(directory, "actual.png");
    const outputPath = join(directory, "summary.json");
    const reference = createPng(10, 10);
    const actual = createPng(10, 10);
    setPixel(actual, 22, [230, 230, 230]);
    setPixel(actual, 77, [220, 220, 220]);
    writePng(referencePath, reference);
    writePng(actualPath, actual);

    const thresholdResult = runPair(referencePath, actualPath, outputPath);
    expect(thresholdResult.status).toBe(0);
    expect(
      (JSON.parse(readFileSync(outputPath, "utf8")) as PairSummary).differentPixels,
    ).toBe(1);

    const edgeReference = createPng(5, 5, [0, 0, 0]);
    const edgeActual = createPng(5, 5, [0, 0, 0]);

    for (let y = 0; y < 5; y += 1) {
      for (let x = 0; x < 5; x += 1) {
        const pixelIndex = y * 5 + x;
        const referenceGray = x < 2 ? 0 : x === 2 ? 100 : 255;
        const actualGray = x < 2 ? 0 : x === 2 ? 160 : 255;
        setPixel(edgeReference, pixelIndex, [
          referenceGray,
          referenceGray,
          referenceGray,
        ]);
        setPixel(edgeActual, pixelIndex, [actualGray, actualGray, actualGray]);
      }
    }

    writePng(referencePath, edgeReference);
    writePng(actualPath, edgeActual);
    const antiAliasResult = runPair(referencePath, actualPath, outputPath);

    expect(antiAliasResult.status).toBe(0);
    expect(
      (JSON.parse(readFileSync(outputPath, "utf8")) as PairSummary).differentPixels,
    ).toBe(0);
  });

  it("writes magenta diff pixels and exact diff and side-by-side dimensions", () => {
    const directory = makeTemporaryDirectory();
    const referencePath = join(directory, "reference.png");
    const actualPath = join(directory, "actual.png");
    const outputPath = join(directory, "summary.json");
    const diffPath = join(directory, "artifacts", "diff.png");
    const sideBySidePath = join(directory, "artifacts", "side-by-side.png");
    const reference = createPng(10, 10);
    const actual = createPng(10, 10);
    setPixel(actual, 55, [0, 0, 0]);
    writePng(referencePath, reference);
    writePng(actualPath, actual);

    const result = runPair(referencePath, actualPath, outputPath, {
      diffPath,
      sideBySidePath,
    });
    const diff = PNG.sync.read(readFileSync(diffPath));
    const sideBySide = PNG.sync.read(readFileSync(sideBySidePath));

    expect(result.status).toBe(0);
    expect({ height: diff.height, width: diff.width }).toEqual({
      height: 10,
      width: 10,
    });
    expect({ height: sideBySide.height, width: sideBySide.width }).toEqual({
      height: 10,
      width: 20,
    });
    expect(Array.from(diff.data.subarray(55 * 4, 55 * 4 + 4))).toEqual([
      255, 0, 255, 255,
    ]);
  });

  it("removes seeded pair artifacts when dimensions do not match", () => {
    const directory = makeTemporaryDirectory();
    const referencePath = join(directory, "reference.png");
    const actualPath = join(directory, "actual.png");
    const outputPath = join(directory, "summary.json");
    const diffPath = join(directory, "diff.png");
    const sideBySidePath = join(directory, "side-by-side.png");
    writePng(referencePath, createPng(8, 8));
    writePng(actualPath, createPng(9, 8));
    writeFileSync(diffPath, "stale-diff");
    writeFileSync(sideBySidePath, "stale-side-by-side");

    const result = runPair(referencePath, actualPath, outputPath, {
      diffPath,
      sideBySidePath,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("dimension-mismatch");
    expect(existsSync(diffPath)).toBe(false);
    expect(existsSync(sideBySidePath)).toBe(false);
  });

  it.each([
    ["missing", false],
    ["invalid", true],
  ] as const)(
    "removes every seeded pair output before reading %s input",
    (scenario, writeInvalidInput) => {
      const directory = makeTemporaryDirectory();
      const referencePath = join(directory, "reference.png");
      const actualPath = join(directory, "actual.png");
      const outputPath = join(directory, "summary.json");
      const diffPath = join(directory, "diff.png");
      const sideBySidePath = join(directory, "side-by-side.png");

      if (writeInvalidInput) {
        writeFileSync(referencePath, "not-a-png");
      }
      writePng(actualPath, createPng(10, 10));
      writeFileSync(outputPath, "STALE SUMMARY");
      writeFileSync(diffPath, "STALE DIFF");
      writeFileSync(sideBySidePath, "STALE SIDE");

      const result = runPair(referencePath, actualPath, outputPath, {
        diffPath,
        sideBySidePath,
      });

      expect(result.status).toBe(1);
      expect(existsSync(outputPath)).toBe(false);
      expect(existsSync(diffPath)).toBe(false);
      expect(existsSync(sideBySidePath)).toBe(false);
    },
  );

  it.each([
    ["missing", false],
    ["malformed", true],
  ] as const)(
    "removes the seeded batch compare tree before reading a %s manifest",
    (scenario, writeMalformedManifest) => {
      const directory = makeTemporaryDirectory();
      const qaRoot = join(directory, "qa");
      const manifestPath = join(directory, "manifest.json");
      const compareRoot = join(qaRoot, "compare");
      mkdirSync(compareRoot, { recursive: true });
      writeFileSync(join(compareRoot, "STALE.txt"), "stale");

      if (writeMalformedManifest) {
        writeFileSync(manifestPath, "{ this is not valid JSON");
      }

      const result = spawnSync("node", ["scripts/sazo-compare.mjs"], {
        encoding: "utf8",
        env: {
          ...process.env,
          SAZO_COMPARE_MANIFEST: manifestPath,
          SAZO_QA_ROOT: qaRoot,
        },
      });

      expect(result.status).toBe(1);
      expect(existsSync(compareRoot)).toBe(false);
    },
  );

  it("clears stale batch output and fails missing and mismatched checkpoints", () => {
    const directory = makeTemporaryDirectory();
    const qaRoot = join(directory, "qa");
    const manifestPath = join(directory, "manifest.json");
    const referenceRoot = join(qaRoot, "reference", "tiny");
    const actualRoot = join(qaRoot, "actual", "tiny");
    const compareRoot = join(qaRoot, "compare");
    mkdirSync(referenceRoot, { recursive: true });
    mkdirSync(actualRoot, { recursive: true });
    mkdirSync(join(compareRoot, "tiny"), { recursive: true });
    writeFileSync(
      manifestPath,
      JSON.stringify({
        tiny: {
          checkpoints: [
            { name: "same", second: 0 },
            { name: "missing", second: 1 },
            { name: "wrong-size", second: 2 },
          ],
          durationSeconds: 3,
          source: "local-fixture",
          viewport: { height: 10, width: 10 },
        },
      }),
    );
    for (const name of ["same", "missing", "wrong-size"]) {
      writePng(join(referenceRoot, `${name}.png`), createPng(10, 10));
    }
    writePng(join(actualRoot, "same.png"), createPng(10, 10));
    writePng(join(actualRoot, "wrong-size.png"), createPng(11, 10));
    for (const name of ["missing", "wrong-size"]) {
      writeFileSync(join(compareRoot, "tiny", `${name}.diff.png`), "stale-diff");
      writeFileSync(
        join(compareRoot, "tiny", `${name}.side-by-side.png`),
        "stale-side-by-side",
      );
    }
    writeFileSync(join(compareRoot, "orphan.png"), "stale-orphan");

    const result = spawnSync("node", ["scripts/sazo-compare.mjs"], {
      encoding: "utf8",
      env: {
        ...process.env,
        SAZO_COMPARE_MANIFEST: manifestPath,
        SAZO_QA_ROOT: qaRoot,
      },
    });
    const summary = JSON.parse(
      readFileSync(join(compareRoot, "summary.json"), "utf8"),
    ) as BatchSummary;

    expect(result.status).toBe(1);
    expect(summary.comparison).toEqual({ includeAA: false, threshold: 0.12 });
    expect(summary.totals).toEqual({ fail: 2, pass: 1, review: 0 });
    expect(summary.checkpoints.map(({ name, status }) => ({ name, status }))).toEqual([
      { name: "missing", status: "fail" },
      { name: "wrong-size", status: "fail" },
      { name: "same", status: "pass" },
    ]);
    expect(summary.checkpoints[0]?.error).toContain("missing-actual");
    expect(summary.checkpoints[1]?.error).toBe("dimension-mismatch");
    expect(summary.checkpoints[2]?.error).toBeUndefined();
    expect(existsSync(join(compareRoot, "tiny", "same.diff.png"))).toBe(true);
    expect(existsSync(join(compareRoot, "tiny", "same.side-by-side.png"))).toBe(true);
    expect(existsSync(join(compareRoot, "tiny", "missing.diff.png"))).toBe(false);
    expect(existsSync(join(compareRoot, "tiny", "missing.side-by-side.png"))).toBe(false);
    expect(existsSync(join(compareRoot, "tiny", "wrong-size.diff.png"))).toBe(false);
    expect(existsSync(join(compareRoot, "tiny", "wrong-size.side-by-side.png"))).toBe(
      false,
    );
    expect(existsSync(join(compareRoot, "orphan.png"))).toBe(false);
  });
});
