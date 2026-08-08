import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const fontRoot = join(
  process.cwd(),
  "public/sazo-commerce/fonts/noto-sans-jp",
);
const serviceCss = readFileSync(
  join(process.cwd(), "src/sazo-commerce/sazo.css"),
  "utf8",
);

describe("SAZO service typography assets", () => {
  it("vendors the complete Fontsource Noto Sans JP variable bundle", () => {
    const fontCssPath = join(fontRoot, "wght.css");
    const fontFilesPath = join(fontRoot, "files");
    const licensePath = join(fontRoot, "LICENSE.txt");

    expect(existsSync(fontCssPath), "wght.css should be vendored locally").toBe(true);
    expect(existsSync(fontFilesPath), "WOFF2 directory should be vendored locally").toBe(
      true,
    );
    expect(existsSync(licensePath), "font license should be vendored locally").toBe(true);

    const fontCss = readFileSync(fontCssPath, "utf8");
    const fontFiles = readdirSync(fontFilesPath).filter((file) =>
      file.endsWith(".woff2"),
    );

    expect(fontCss).toContain("font-family: 'Noto Sans JP Variable'");
    expect(fontCss).toContain("font-weight: 100 900");
    expect(fontCss).toContain("font-display: swap");
    expect(fontFiles).toHaveLength(124);
    expect(readFileSync(licensePath, "utf8")).toContain("SIL OPEN FONT LICENSE");
  });

  it("loads Noto only for the service page", () => {
    expect(serviceCss).toContain(
      '@import url("/sazo-commerce/fonts/noto-sans-jp/wght.css");',
    );
    expect(serviceCss).toMatch(
      /\.sazo-root \.sazo-service-view\s*{[^}]*font-family:\s*"Noto Sans JP Variable"/s,
    );
    expect(serviceCss).not.toMatch(
      /\.sazo-root\s*{[^}]*font-family:\s*"Noto Sans JP Variable"/s,
    );
  });
});
