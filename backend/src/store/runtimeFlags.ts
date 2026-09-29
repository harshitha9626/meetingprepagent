// AI-Generated Code - 2026-09-29 - Composer
/** Shared runtime flags for storage selection. */

export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.BRIEFED_FORCE_TMP_DB === "1"
  );
}

export function resolveDataDir(): string {
  const override = process.env.BRIEFED_DB_DIR?.trim();
  if (override) return override;
  if (isServerlessRuntime()) return "/tmp/briefed-data";
  return ""; // filled by sqlite/json modules with __dirname
}
