/**
 * 전송 층이 모든 실패를 이 타입으로 바꿔 올린다 (규칙 문서 §10).
 * 분류(kind)는 KMP와 동일하고, 서버 `code` 원문을 보존해 화면이 코드로 문구를 분기한다.
 * HTTP 상태 숫자로 화면 문구를 분기하지 않는다.
 */
export type AppErrorKind =
  | "Unauthorized"
  | "PermissionDenied"
  | "PaymentRequired"
  | "ValidationFailed"
  | "NetworkError"
  | "NotFound"
  | "Conflict"
  | "Gone"
  | "Unknown";

type AppErrorOptions = {
  /** 서버 오류 응답의 code. 예: HOST_LEVEL_REQUIRED */
  code?: string | null;
  /** 서버 오류 응답의 message. 화면에 그대로 쓰지 않고 콘솔·Sentry용으로만 보존한다. */
  serverMessage?: string | null;
  status?: number | null;
  cause?: unknown;
};

/** 화면에 바로 쓸 수 있는 안전한 기본 문구. 세부 문구는 화면이 code로 분기해 덮는다. */
const USER_MESSAGE: Record<AppErrorKind, string> = {
  Unauthorized: "로그인이 필요합니다.",
  PermissionDenied: "접근 권한이 없습니다.",
  PaymentRequired: "코인이 부족합니다. 충전 후 다시 시도해 주세요.",
  ValidationFailed: "입력값을 확인해 주세요.",
  NetworkError: "네트워크 연결을 확인해 주세요.",
  NotFound: "요청한 정보를 찾을 수 없습니다.",
  Conflict: "이미 처리된 요청입니다.",
  Gone: "종료되었거나 더 이상 유효하지 않은 항목입니다.",
  Unknown: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

const KIND_BY_STATUS: Record<number, AppErrorKind> = {
  400: "ValidationFailed",
  401: "Unauthorized",
  402: "PaymentRequired",
  403: "PermissionDenied",
  404: "NotFound",
  409: "Conflict",
  410: "Gone",
  422: "ValidationFailed",
};

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code: string | null;
  readonly serverMessage: string | null;
  readonly status: number | null;

  constructor(kind: AppErrorKind, options: AppErrorOptions = {}) {
    super(USER_MESSAGE[kind], { cause: options.cause });
    this.name = "AppError";
    this.kind = kind;
    this.code = options.code ?? null;
    this.serverMessage = options.serverMessage ?? null;
    this.status = options.status ?? null;
  }

  /** HTTP 오류 응답 → AppError. 본문 `{code, message}`는 계약 §공통 오류 형식. */
  static fromResponse(
    status: number,
    body: { code?: string | null; message?: string | null } | null,
  ): AppError {
    const kind = KIND_BY_STATUS[status] ?? "Unknown";

    return new AppError(kind, {
      status,
      code: body?.code ?? null,
      serverMessage: body?.message ?? null,
    });
  }

  static network(cause: unknown): AppError {
    return new AppError("NetworkError", { cause });
  }

  static isAppError(value: unknown): value is AppError {
    return value instanceof AppError;
  }
}
