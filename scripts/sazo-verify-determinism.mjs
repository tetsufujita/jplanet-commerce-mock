import { createHash } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  compareRunFingerprints,
  normalizeComparisonSummary,
} from "./sazo-determinism-core.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const qaRoot = resolve(
  process.env.SAZO_QA_ROOT ??
    join(projectRoot, "design/reproductions/sazo-commerce/qa"),
);
const manifest = JSON.parse(
  readFileSync(
    join(projectRoot, "design/reproductions/sazo-commerce/reference-manifest.json"),
    "utf8",
  ),
);

const arguments_ = process.argv.slice(2);

if (
  arguments_.length !== 2 ||
  arguments_[0] !== "--runs" ||
  !Number.isInteger(Number(arguments_[1])) ||
  Number(arguments_[1]) < 2
) {
  throw new Error("Usage: node scripts/sazo-verify-determinism.mjs --runs <integer >= 2>");
}

const runCount = Number(arguments_[1]);
const expectedPaths = Object.entries(manifest).flatMap(([viewport, recording]) =>
  recording.checkpoints.map(({ name }) => `${viewport}/${name}.png`),
);

function runCommand(command, commandArguments) {
  const result = spawnSync(command, commandArguments, {
    cwd: projectRoot,
    encoding: "utf8",
  });

  if (result.error !== undefined) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${command} ${commandArguments.join(" ")} failed\n${result.stdout}\n${result.stderr}`,
    );
  }

  return result.stdout;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fingerprintDirectory(directory) {
  return Object.fromEntries(
    expectedPaths.map((path) => [path, sha256(readFileSync(join(directory, path)))]),
  );
}

const runs = [];

for (let run = 1; run <= runCount; run += 1) {
  rmSync(join(qaRoot, "actual"), { force: true, recursive: true });
  rmSync(join(qaRoot, "compare"), { force: true, recursive: true });
  rmSync(join(qaRoot, "reference"), { force: true, recursive: true });

  runCommand("pnpm", ["sazo:reference"]);
  runCommand("pnpm", ["sazo:capture"]);
  const comparisonOutput = runCommand("pnpm", ["sazo:compare"]);
  const normalizedSummary = normalizeComparisonSummary(
    readFileSync(join(qaRoot, "compare/summary.json"), "utf8"),
  );
  const fingerprint = {
    actual: fingerprintDirectory(join(qaRoot, "actual")),
    reference: fingerprintDirectory(join(qaRoot, "reference")),
    summary: sha256(normalizedSummary),
  };

  runs.push(fingerprint);
  process.stdout.write(
    `run ${String(run)}/${String(runCount)}: ${comparisonOutput.trim().split("\n").at(-1)}\n`,
  );
}

const result = compareRunFingerprints(runs);
const evidencePath = join(qaRoot, "determinism.json");
writeFileSync(
  evidencePath,
  `${JSON.stringify({ ...result, runCount, runs }, null, 2)}\n`,
);
process.stdout.write(`evidence: ${relative(projectRoot, evidencePath)}\n`);

if (!result.deterministic) {
  for (const mismatch of result.mismatches) {
    process.stderr.write(
      `run ${String(mismatch.run)} mismatch ${mismatch.artifact}: ${String(mismatch.expected)} != ${String(mismatch.actual)}\n`,
    );
  }
  process.exitCode = 1;
} else {
  process.stdout.write(
    `deterministic: ${String(runCount)} exact cold-start chains, ${String(expectedPaths.length)} reference + ${String(expectedPaths.length)} actual PNGs per run\n`,
  );
}
