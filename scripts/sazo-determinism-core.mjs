function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "generatedAt")
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, canonicalize(nestedValue)]),
    );
  }

  return value;
}

export function normalizeComparisonSummary(summaryText) {
  return `${JSON.stringify(canonicalize(JSON.parse(summaryText)), null, 2)}\n`;
}

export function compareRunFingerprints(runs) {
  if (runs.length < 2) {
    throw new Error("At least two determinism runs are required");
  }

  const baseline = runs[0];
  const mismatches = [];

  for (let index = 1; index < runs.length; index += 1) {
    const run = runs[index];

    for (const kind of ["actual", "reference"]) {
      const paths = new Set([
        ...Object.keys(baseline[kind]),
        ...Object.keys(run[kind]),
      ]);

      for (const path of [...paths].sort()) {
        if (baseline[kind][path] !== run[kind][path]) {
          mismatches.push({
            actual: run[kind][path],
            artifact: `${kind}/${path}`,
            expected: baseline[kind][path],
            run: index + 1,
          });
        }
      }
    }

    if (baseline.summary !== run.summary) {
      mismatches.push({
        actual: run.summary,
        artifact: "summary",
        expected: baseline.summary,
        run: index + 1,
      });
    }
  }

  return { deterministic: mismatches.length === 0, mismatches };
}
