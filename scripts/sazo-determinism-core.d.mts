export interface SazoDeterminismRun {
  actual: Record<string, string>;
  reference: Record<string, string>;
  summary: string;
}

export interface SazoDeterminismMismatch {
  actual: string | undefined;
  artifact: string;
  expected: string | undefined;
  run: number;
}

export function normalizeComparisonSummary(summaryText: string): string;

export function compareRunFingerprints(runs: SazoDeterminismRun[]): {
  deterministic: boolean;
  mismatches: SazoDeterminismMismatch[];
};
