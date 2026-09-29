// AI-Generated Code - 2026-09-29 - Composer
/** Shared runtime flags for storage selection. */

/**
 * True on Vercel / Lambda / forced tmp mode.
 * Uses multiple Vercel env signals — some Express service runtimes
 * may not set VERCEL alone during cold start.
 */
export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.VERCEL_ENV ||
      process.env.VERCEL_REGION ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.BRIEFED_FORCE_TMP_DB === "1"
  );
}

/** Local Node should call listen(); serverless must never listen. */
export function shouldListenLocally(): boolean {
  return !isServerlessRuntime();
}

export function resolveDataDir(): string {
  const override = process.env.BRIEFED_DB_DIR?.trim();
  if (override) return override;
  if (isServerlessRuntime()) return "/tmp/briefed-data";
  return ""; // filled by sqlite/json modules with __dirname
}
