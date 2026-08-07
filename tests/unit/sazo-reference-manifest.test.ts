import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
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

const approvedManifest = {
  desktop: {
    source: "/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.24.01.mov",
    viewport: { width: 3022, height: 1656 },
    durationSeconds: 448.23,
    checkpoints: [
      { name: "home-hero", second: 0 },
      { name: "home-sections", second: 36 },
      { name: "chat-open", second: 72 },
      { name: "reviews", second: 120 },
      { name: "gram", second: 168 },
      { name: "ranking", second: 240 },
      { name: "service", second: 312 },
      { name: "brands", second: 384 },
      { name: "login-modal", second: 438 },
    ],
  },
  mobile: {
    source: "/Users/fujitatetsu/Downloads/画面収録 2026-08-06 20.31.56.mov",
    viewport: { width: 682, height: 1470 },
    durationSeconds: 211.957,
    checkpoints: [
      { name: "home-hero", second: 0 },
      { name: "home-community", second: 24 },
      { name: "ranking", second: 48 },
      { name: "service", second: 72 },
      { name: "brands", second: 96 },
      { name: "categories", second: 112 },
      { name: "catalog-list", second: 128 },
      { name: "catalog-grid", second: 144 },
      { name: "login", second: 160 },
      { name: "registration", second: 176 },
      { name: "mypage", second: 192 },
      { name: "profile", second: 208 },
    ],
  },
} satisfies { desktop: Recording; mobile: Recording };

describe("SAZO recording manifest", () => {
  it("pins every approved recording source, viewport, and checkpoint", () => {
    expect(manifest).toEqual(approvedManifest);
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

  it("requests FFmpeg overwrite when regenerating reference frames", () => {
    const fakeFfmpegDirectory = mkdtempSync(join(tmpdir(), "sazo-fake-ffmpeg-"));
    const fakeFfmpegPath = join(fakeFfmpegDirectory, "ffmpeg");
    writeFileSync(
      fakeFfmpegPath,
      [
        "#!/usr/bin/env node",
        'if (!process.argv.includes("-y")) {',
        '  process.stderr.write("FFmpeg requires -y to overwrite existing frames\\n");',
        "  process.exit(1);",
        "}",
      ].join("\n"),
    );
    chmodSync(fakeFfmpegPath, 0o755);

    try {
      const result = spawnSync("node", ["scripts/sazo-extract-reference.mjs"], {
        cwd: process.cwd(),
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${fakeFfmpegDirectory}:${process.env.PATH ?? ""}`,
        },
      });

      expect(result.status).toBe(0);
    } finally {
      rmSync(fakeFfmpegDirectory, { force: true, recursive: true });
    }
  });
});
