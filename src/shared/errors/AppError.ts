export type AppErrorKind =
  | "validation"
  | "authentication"
  | "authorization"
  | "quota"
  | "network"
  | "upstream"
  | "conflict"
  | "configuration"
  | "unknown";

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status: number;

  constructor(kind: AppErrorKind, message: string, status = 500) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
    this.status = status;
  }
}

export function toSafeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError("unknown", error.message, 500);
  return new AppError("unknown", "Something unexpected happened.", 500);
}
