export type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, context: Record<string, unknown> = {}) {
  const safe = { message, ...context };
  if (level === "error") console.error(JSON.stringify(safe));
  else if (level === "warn") console.warn(JSON.stringify(safe));
  else console.info(JSON.stringify(safe));
}
