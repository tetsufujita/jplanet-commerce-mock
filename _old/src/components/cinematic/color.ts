export type Rgb = {
  b: number;
  g: number;
  r: number;
};

export function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function parseColor(color: string): Rgb {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const value = hex.length === 3 ? hex.replace(/(.)/g, "$1$1") : hex;

    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16),
    };
  }

  const rgbMatch = color.match(/\d+(\.\d+)?/g);

  if (!rgbMatch || rgbMatch.length < 3) {
    return { r: 6, g: 11, b: 31 };
  }

  return {
    r: Number(rgbMatch[0]),
    g: Number(rgbMatch[1]),
    b: Number(rgbMatch[2]),
  };
}

export function lerpColor(from: string, to: string, progress: number) {
  const a = parseColor(from);
  const b = parseColor(to);
  const mix = (start: number, end: number) =>
    Math.round(start + (end - start) * clampProgress(progress));

  return `rgb(${mix(a.r, b.r)}, ${mix(a.g, b.g)}, ${mix(a.b, b.b)})`;
}
