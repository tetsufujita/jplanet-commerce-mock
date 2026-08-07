import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const manifestPath = join(
  projectRoot,
  "design/reproductions/sazo-commerce/reference-manifest.json",
);
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const referenceRoot = join(
  projectRoot,
  "design/reproductions/sazo-commerce/qa/reference",
);

for (const [viewport, recording] of Object.entries(manifest)) {
  if (!existsSync(recording.source)) {
    throw new Error(`Recording source is missing: ${recording.source}`);
  }

  for (const { name, second } of recording.checkpoints) {
    const output = join(referenceRoot, viewport, `${name}.png`);
    mkdirSync(dirname(output), { recursive: true });

    const result = spawnSync("ffmpeg", [
      "-ss",
      String(second),
      "-i",
      recording.source,
      "-frames:v",
      "1",
      output,
    ]);

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(
        `FFmpeg failed for ${viewport}/${name}: ${result.stderr.toString()}`,
      );
    }
  }
}
