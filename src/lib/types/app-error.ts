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
  /**
   * 429 — 서버가 "횟수를 다 썼다"고 명시한 경우. 지금은 AI 문항 생성 무료 5회
   * (`AI_FREE_LIMIT_EXCEEDED`)뿐이다. 코인 정책이 확정되면 서버가 402로 바꿀 수 있다.
   */
  | "RateLimited"
  /**
   * 503 — 서버가 "지금은 못 받는다"고 명시한 경우(점검·과부하).
   * 500·502·504와 일부러 구분한다: 그쪽은 고장이고 이쪽은 예정된 중단이라
   * 사용자에게 할 말이 다르다("문제가 생겼어요" vs "잠깐 점검 중이에요").
   * KMP ApiClient에는 아직 없는 분류다 — 모바일도 E-500을 그리게 되면 함께 맞춘다.
   */
  | "ServiceUnavailable"
  | "Unknown";

type AppErrorOptions = {
  /** 서버 오류 응답의 code. 예: HOST_LEVEL_REQUIRED */
  code?: string | null;
  /** 서버 오류 응답의 message. 화면에 그대로 쓰지 않고 콘솔·Sentry용으로만 보존한다. */
  serverMessage?: string | null;
  status?: number | null;
  /**
   * 서버가 **다음 행동에 필요할 때만** 붙여 주는 값. 지금은 402 `INSUFFICIENT_COINS`의
   * `{required, balance, shortfall}` 하나다 — 부족분을 알려고 잔액을 다시 조회하지 않는다.
   */
  data?: unknown;
  cause?: unknown;
};

/**
 * 화면에 바로 쓸 수 있는 안전한 기본 문구. 세부 문구는 화면이 code로 분기해 덮는다.
 *
 * design.pen "04 · 상태 · 오류 — 웹"의 문구 규칙을 따른다:
 * 무엇이 잘못됐는지 → 지금 뭘 하면 되는지, 두 문장. "~해요" 체를 쓰고
 * 사과("죄송합니다")·오류코드·전문용어는 넣지 않는다.
 */
const USER_MESSAGE: Record<AppErrorKind, string> = {
  Unauthorized: "로그인이 필요해요.",
  PermissionDenied: "이 화면을 볼 수 있는 권한이 없어요.",
  PaymentRequired: "코인이 모자라요. 충전한 뒤 다시 시도해 주세요.",
  ValidationFailed: "입력한 내용을 다시 확인해 주세요.",
  NetworkError: "연결이 끊겼어요. 네트워크를 확인해 주세요.",
  NotFound: "찾는 정보가 없어요. 주소가 바뀌었을 수 있어요.",
  Conflict: "이미 처리된 요청이에요.",
  Gone: "이미 끝난 방이에요.",
  RateLimited: "요청 한도를 넘었어요. 잠시 후 다시 시도해 주세요.",
  ServiceUnavailable: "잠깐 점검 중이에요. 잠시 후 다시 시도해 주세요.",
  Unknown: "잠시 문제가 생겼어요. 다시 시도해 주세요.",
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
  429: "RateLimited",
  503: "ServiceUnavailable",
};

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code: string | null;
  readonly serverMessage: string | null;
  readonly status: number | null;
  readonly data: unknown;

  constructor(kind: AppErrorKind, options: AppErrorOptions = {}) {
    super(USER_MESSAGE[kind], { cause: options.cause });
    this.name = "AppError";
    this.kind = kind;
    this.code = options.code ?? null;
    this.serverMessage = options.serverMessage ?? null;
    this.status = options.status ?? null;
    this.data = options.data ?? null;
  }

  /** HTTP 오류 응답 → AppError. 본문 `{code, message}`는 계약 §공통 오류 형식. */
  static fromResponse(
    status: number,
    body: { code?: string | null; message?: string | null; data?: unknown } | null,
  ): AppError {
    const kind = KIND_BY_STATUS[status] ?? "Unknown";

    return new AppError(kind, {
      status,
      code: body?.code ?? null,
      serverMessage: body?.message ?? null,
      data: body?.data ?? null,
    });
  }

  static network(cause: unknown): AppError {
    return new AppError("NetworkError", { cause });
  }

  static isAppError(value: unknown): value is AppError {
    return value instanceof AppError;
  }
}
