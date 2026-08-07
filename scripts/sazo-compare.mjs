import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const qaRoot = resolve(
  process.env.SAZO_QA_ROOT ??
    join(projectRoot, "design/reproductions/sazo-commerce/qa"),
);
const manifestPath = resolve(
  process.env.SAZO_COMPARE_MANIFEST ??
    join(projectRoot, "design/reproductions/sazo-commerce/reference-manifest.json"),
);
const pixelmatchOptions = Object.freeze({
  diffColor: [255, 0, 255],
  diffColorAlt: [255, 0, 255],
  includeAA: false,
  threshold: 0.12,
});

function usage() {
  return [
    "Usage:",
    "  node scripts/sazo-compare.mjs",
    "  node scripts/sazo-compare.mjs --pair <reference.png> <actual.png> --out <summary.json> [--diff <diff.png> --side-by-side <side-by-side.png>]",
  ].join("\n");
}

function parseArguments(arguments_) {
  if (arguments_.length === 0) {
    return { mode: "batch" };
  }

  if (arguments_[0] !== "--pair" || arguments_.length < 5) {
    throw new Error(usage());
  }

  const options = new Map();

  for (let index = 3; index < arguments_.length; index += 2) {
    const flag = arguments_[index];
    const value = arguments_[index + 1];

    if (
      value === undefined ||
      !["--diff", "--out", "--side-by-side"].includes(flag) ||
      options.has(flag)
    ) {
      throw new Error(usage());
    }

    options.set(flag, value);
  }

  if (
    !options.has("--out") ||
    options.has("--diff") !== options.has("--side-by-side")
  ) {
    throw new Error(usage());
  }

  return {
    actualPath: resolve(arguments_[2]),
    artifactPaths: options.has("--diff")
      ? {
          diffPath: resolve(options.get("--diff")),
          sideBySidePath: resolve(options.get("--side-by-side")),
        }
      : undefined,
    mode: "pair",
    outputPath: resolve(options.get("--out")),
    referencePath: resolve(arguments_[1]),
  };
}

function readPng(path, role) {
  if (!existsSync(path)) {
    throw new Error(`missing-${role}: ${path}`);
  }

  try {
    return PNG.sync.read(readFileSync(path));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid-${role}-png: ${path}: ${message}`);
  }
}

function statusForRatio(ratio) {
  if (ratio <= 0.08) {
    return "pass";
  }

  if (ratio <= 0.18) {
    return "review";
  }

  return "fail";
}

function writePng(path, png) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, PNG.sync.write(png));
}

function makeSideBySide(reference, actual) {
  const sideBySide = new PNG({ height: reference.height, width: reference.width * 2 });

  PNG.bitblt(reference, sideBySide, 0, 0, reference.width, reference.height, 0, 0);
  PNG.bitblt(actual, sideBySide, 0, 0, actual.width, actual.height, reference.width, 0);

  return sideBySide;
}

function clearArtifacts(artifactPaths) {
  if (artifactPaths === undefined) {
    return;
  }

  rmSync(artifactPaths.diffPath, { force: true });
  rmSync(artifactPaths.sideBySidePath, { force: true });
}

function comparePair({ actualPath, artifactPaths, name, referencePath, viewport }) {
  clearArtifacts(artifactPaths);
  const reference = readPng(referencePath, "reference");
  const actual = readPng(actualPath, "actual");
  const totalPixels = reference.width * reference.height;

  if (reference.width !== actual.width || reference.height !== actual.height) {
    return {
      actualDimensions: { height: actual.height, width: actual.width },
      differentPixels: totalPixels,
      error: "dimension-mismatch",
      name,
      ratio: 1,
      referenceDimensions: { height: reference.height, width: reference.width },
      status: "fail",
      totalPixels,
      viewport,
    };
  }

  const diff = new PNG({ height: reference.height, width: reference.width });
  const differentPixels = pixelmatch(
    reference.data,
    actual.data,
    diff.data,
    reference.width,
    reference.height,
    pixelmatchOptions,
  );
  const ratio = differentPixels / totalPixels;
  const summary = {
    differentPixels,
    name,
    ratio,
    status: statusForRatio(ratio),
    totalPixels,
    viewport,
  };

  if (artifactPaths !== undefined) {
    writePng(artifactPaths.diffPath, diff);
    writePng(artifactPaths.sideBySidePath, makeSideBySide(reference, actual));

    return {
      ...summary,
      diffPath: relative(projectRoot, artifactPaths.diffPath),
      sideBySidePath: relative(projectRoot, artifactPaths.sideBySidePath),
    };
  }

  return summary;
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function runPairMode(command) {
  const name = basename(command.referencePath, ".png");
  const summary = comparePair({
    actualPath: command.actualPath,
    artifactPaths: command.artifactPaths,
    name,
    referencePath: command.referencePath,
    viewport: "pair",
  });
  writeJson(command.outputPath, summary);

  if (summary.error === "dimension-mismatch") {
    process.stderr.write(
      `dimension-mismatch: reference ${String(summary.referenceDimensions.width)}x${String(summary.referenceDimensions.height)}, actual ${String(summary.actualDimensions.width)}x${String(summary.actualDimensions.height)}\n`,
    );
  }

  return summary.status === "fail" ? 1 : 0;
}

function runBatchMode() {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const compareRoot = join(qaRoot, "compare");
  const checkpoints = [];

  rmSync(compareRoot, { force: true, recursive: true });

  for (const [viewport, recording] of Object.entries(manifest)) {
    for (const checkpoint of recording.checkpoints) {
      const artifactDirectory = join(compareRoot, viewport);
      const artifactPaths = {
        diffPath: join(artifactDirectory, `${checkpoint.name}.diff.png`),
        sideBySidePath: join(
          artifactDirectory,
          `${checkpoint.name}.side-by-side.png`,
        ),
      };
      const referencePath = join(qaRoot, "reference", viewport, `${checkpoint.name}.png`);
      const actualPath = join(qaRoot, "actual", viewport, `${checkpoint.name}.png`);

      try {
        checkpoints.push(
          comparePair({
            actualPath,
            artifactPaths,
            name: checkpoint.name,
            referencePath,
            viewport,
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        checkpoints.push({
          differentPixels: 0,
          error: message,
          name: checkpoint.name,
          ratio: 1,
          status: "fail",
          totalPixels: 0,
          viewport,
        });
      }
    }
  }

  checkpoints.sort((left, right) => right.ratio - left.ratio);
  const totals = checkpoints.reduce(
    (counts, checkpoint) => ({
      ...counts,
      [checkpoint.status]: counts[checkpoint.status] + 1,
    }),
    { fail: 0, pass: 0, review: 0 },
  );
  const summary = {
    checkpoints,
    comparison: { includeAA: false, threshold: 0.12 },
    generatedAt: new Date().toISOString(),
    totals,
  };
  const outputPath = join(compareRoot, "summary.json");
  writeJson(outputPath, summary);

  for (const checkpoint of checkpoints) {
    process.stdout.write(
      `${checkpoint.status.padEnd(6)} ${checkpoint.viewport}/${checkpoint.name} ${checkpoint.ratio.toFixed(6)}${checkpoint.error === undefined ? "" : ` ${checkpoint.error}`}\n`,
    );
  }
  process.stdout.write(`summary: ${relative(projectRoot, outputPath)}\n`);
  process.stdout.write(
    `totals: pass=${String(totals.pass)} review=${String(totals.review)} fail=${String(totals.fail)}\n`,
  );

  return totals.fail > 0 ? 1 : 0;
}

try {
  const command = parseArguments(process.argv.slice(2));
  process.exitCode = command.mode === "pair" ? runPairMode(command) : runBatchMode();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
