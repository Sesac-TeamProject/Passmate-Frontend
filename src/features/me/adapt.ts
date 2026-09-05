import type { StatItem } from "@/components/common/stat-cards";
import { toAvatarKey } from "@/components/common/student-avatar";
import { parseServerDateTime } from "@/lib/datetime";
import { formatShortDate, formatWon } from "@/lib/format";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";
import { AppError } from "@/lib/types/app-error";
import type {
  BadgeType,
  CoinBalanceResponse,
  CoinTransactionRow,
  CoinTransactionType,
  EarningsResponse,
  GradeResponse,
  CumulativeReportResponse,
  JoinedRoom,
  JoinedRoomsResponse,
  MyProfileResponse,
  NotificationSettingsDto,
  PaymentMethod,
  SettlementAccountResponse,
  HostEarningRow,
  PayoutStatus,
} from "@/lib/types/dto";
import type { CoinHistoryFilter, CoinHistoryItem } from "./coins/types";
import type { ActiveSession } from "./joined/types";
import {
  NOTIFICATION_LABEL,
  type NotificationKey,
  type NotificationSetting,
} from "./notifications/types";
import type { PaymentMethodItem } from "./payment-methods/types";
import type { SettlementRow, SettlementStatus } from "./settlement/types";

/** 플랫폼 수수료 20% — 호스트 몫. 백엔드 `HostEarningRow.net` 주석과 같은 값 */
const HOST_SHARE_PERCENT = 80;
import {
  type Achievement,
  type AchievementBadgeKind,
  type AttendedSession,
  type CoinSummary,
  type LearningRecord,
  PAID_ROOM_MIN_LEVEL,
  type Profile,
  type SettlementAccount,
  type SettlementSummary,
} from "./types";

/** 서버 가입 시각(UTC naive) → "2026-08 가입". 값이 깨졌으면 빈 문자열 */
function toJoinedLabel(joinedAt: string): string {
  const date = parseServerDateTime(joinedAt);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")} 가입`;
}

/**
 * GET /users/me (+ GET /users/me/grade) → 프로필 카드.
 *
 * 등급은 `/users/me`가 아니라 **등급 응답**이 준다. 조회가 아직 안 끝났거나 실패하면
 * `grade`를 넘기지 않고, 그때 화면은 뱃지를 **그리지 않는다** — Lv.1로 메우면
 * "새싹 등급"이라는 없는 사실이 된다(`features/me/types.ts` Profile 주석).
 */
export function toProfile(me: MyProfileResponse, grade?: GradeResponse): Profile {
  return {
    name: me.nickname,
    nickname: me.nickname,
    email: me.email ?? "",
    joinedLabel: toJoinedLabel(me.joinedAt),
    avatar: toAvatarKey(me.defaultAvatarId),
    level: grade?.level,
    levelTitle: grade?.levelName,
    // 서버는 다음 등급까지 진행률을 0~1로 준다 — 화면은 %로 그린다
    progress:
      grade?.nextLevelProgress === undefined
        ? undefined
        : Math.round(grade.nextLevelProgress * 100),
    nextLevel:
      grade?.nextLevel === undefined
        ? undefined
        : {
            level: grade.nextLevel,
            roomsLeft: leftOf(grade, "ROOMS_HOSTED"),
            studentsLeft: leftOf(grade, "TOTAL_STUDENTS"),
          },
  };
}

/**
 * 승급 조건 한 줄에서 남은 수. **서버가 그 조건을 안 주면 비운다** —
 * 0으로 채우면 "이미 채웠다"와 구분되지 않는다(등급마다 조건이 다르고 `AVG_RATING`만
 * 거는 등급도 있다). 값이 비는 자리는 지어내지 않고 화면이 감춘다.
 */
function leftOf(grade: GradeResponse, type: string): number | null {
  const row = grade.nextRequirements.find((r) => r.type === type);
  if (row === undefined) return null;
  return Math.max(0, row.target - row.current);
}

const WIRE_METHOD_BY_PAY_METHOD: Record<PayMethod, PaymentMethod> = {
  kakaopay: "KAKAOPAY",
  naverpay: "NAVERPAY",
  tosspay: "TOSSPAY",
  card: "CARD",
  transfer: "BANK_TRANSFER",
};
const PAY_METHOD_BY_WIRE_METHOD: Record<PaymentMethod, PayMethod> = {
  KAKAOPAY: "kakaopay",
  NAVERPAY: "naverpay",
  TOSSPAY: "tosspay",
  CARD: "card",
  BANK_TRANSFER: "transfer",
};

/** 서버 전송용 PaymentMethod → 포트원 결제창이 쓰는 PayMethod */
export function toPortoneMethod(method: PaymentMethod): PayMethod {
  return PAY_METHOD_BY_WIRE_METHOD[method];
}

/** 포트원 PayMethod → 서버 전송용 PaymentMethod */
export function toWireMethod(method: PayMethod): PaymentMethod {
  return WIRE_METHOD_BY_PAY_METHOD[method];
}

/**
 * 카드/코인 · 결제.
 *
 * **잔액은 `GET /users/me/coins`가 원천이다** — 지갑 API가 붙으면서
 * `GET /users/me`의 `coinBalance`와 값이 같아졌다. 둘 중 지갑 쪽이 최근 내역까지 함께 준다.
 */
export function toCoinSummary(coins: CoinBalanceResponse): CoinSummary {
  const recent = coins.lastTransaction;

  return {
    balance: coins.balance,
    paymentMethodLabel: coins.defaultPaymentMethod
      ? `${PAY_METHOD_LABEL[toPortoneMethod(coins.defaultPaymentMethod)]} (기본) · 포트원 안전결제`
      : "등록된 결제 수단 없음",
    lastTransaction: recent
      ? {
          dateLabel: formatShortDate(recent.createdAt),
          title: toCoinHistoryTitle(recent),
          amount: recent.amount,
        }
      : null,
  };
}

const COIN_TX_TYPE_LABEL: Record<CoinTransactionType, string> = {
  CHARGE: "코인 충전",
  ENTRY: "참가비 결제",
  REFUND: "환급",
  AI_ANALYSIS: "서술형 AI 분석",
  ADMIN_ADJUST: "관리자 조정",
};

/**
 * 내역 한 줄의 제목. `description`은 **차감 그 시점의** 방 제목 + 영수증 번호라
 * 방 제목이 나중에 바뀌어도 흔들리지 않는다 — 있으면 그대로 쓴다.
 */
function toCoinHistoryTitle(row: CoinTransactionRow): string {
  return row.description ?? COIN_TX_TYPE_LABEL[row.type];
}

/** GET /users/me/coins/transactions → 코인 사용 · 충전 내역 목록 */
export function toCoinHistory(items: CoinTransactionRow[]): CoinHistoryItem[] {
  return items.map((item) => ({
    id: String(item.id),
    date: item.createdAt,
    title: toCoinHistoryTitle(item),
    amount: item.amount,
  }));
}

/** 필터 탭 — charge는 양수(충전 · 환급), use는 음수(사용) */
export function filterCoinHistory(
  items: CoinHistoryItem[],
  filter: CoinHistoryFilter,
): CoinHistoryItem[] {
  if (filter === "charge") return items.filter((item) => item.amount > 0);
  if (filter === "use") return items.filter((item) => item.amount < 0);
  return items;
}

const PAYOUT_STATUS_TO_SETTLEMENT_STATUS: Record<PayoutStatus, SettlementStatus> = {
  PENDING: "scheduled",
  SETTLED: "paid",
  HELD: "held",
  CARRIED: "carried",
};

/** 서버 시각(UTC naive) → "8/22". 값이 이상하면 빈 문자열 */
function toShortDate(value: string): string {
  const date = parseServerDateTime(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** "2026-09-05"(날짜만) → "9/5". 시각이 없어 parseServerDateTime을 쓰지 않는다 */
function toPayoutDateLabel(value: string): string {
  const [, month, day] = value.split("-");
  return month && day ? `${Number(month)}/${Number(day)}` : "";
}

/** GET /users/me/earnings 의 `earnings` → 결제 · 정산 내역 표 */
export function toSettlementRows(rows: HostEarningRow[]): SettlementRow[] {
  return rows.map((row, index) => ({
    id: `${row.roomId}-${index}`,
    dateLabel: toShortDate(row.earnedAt),
    roomTitle: row.roomTitle,
    participants: row.participantCount,
    gross: row.gross,
    fee: row.platformFee,
    payout: row.net,
    status: PAYOUT_STATUS_TO_SETTLEMENT_STATUS[row.status],
  }));
}

/** GET /users/me/earnings → 마이페이지 "이번 달 정산 예정" 카드 */
export function toSettlementSummary(earnings: EarningsResponse): SettlementSummary {
  return {
    thisMonthAmount: earnings.thisMonthNet,
    payoutDateLabel: toPayoutDateLabel(earnings.nextPayoutDate),
    hostShare: HOST_SHARE_PERCENT,
    paidRoomLevel: PAID_ROOM_MIN_LEVEL,
    taxNote: "연 소득 기준 원천징수 3.3% 적용",
  };
}

/** GET /users/me/earnings → W-10 정산 요약 3장 */
export function toSettlementStats(earnings: EarningsResponse): StatItem[] {
  // 유료 방 실적은 계약에 따로 없다 — 적립이 생긴 세션을 세어 쓴다
  const paidRoomCount = earnings.earnings.length;
  const studentCount = earnings.earnings.reduce((sum, row) => sum + row.participantCount, 0);

  return [
    {
      id: "revenue",
      label: `이번 달 수익 (선생님 ${HOST_SHARE_PERCENT}%)`,
      value: formatWon(earnings.thisMonthNet, true),
      tile: { label: "₩", tone: "mint" },
    },
    {
      id: "next-payout",
      label: `다음 지급 (${toPayoutDateLabel(earnings.nextPayoutDate)})`,
      value: formatWon(earnings.pendingNet, true),
      tile: { label: "D", tone: "blue" },
    },
    {
      id: "paid-rooms",
      label: "유료 방 운영",
      value: `${paidRoomCount}회 · ${studentCount}명`,
      tile: { label: "R", tone: "orange" },
    },
  ];
}

/**
 * GET /users/me/settlement-account → 마이페이지 계좌 요약.
 * 미등록이면 `registered: false`로 오고 `account`가 빠진다 — 화면이 등록 안내를 띄우도록 null을 준다.
 * 번호는 **서버가 마스킹해서** 준다(`accountNoMasked`) — 원본은 조회로 돌아오지 않는다.
 */
export function toSettlementAccount(dto: SettlementAccountResponse): SettlementAccount | null {
  const account = dto.account;
  if (!dto.registered || account === undefined) return null;

  return {
    bank: account.bankName,
    maskedNumber: account.accountNoMasked,
    accountNumber: "",
    holder: account.holderName,
  };
}

/**
 * 지금 들어갈 수 있는 방 → "다시 들어가기" 카드. 없으면 null.
 *
 * 서버 응답에 **PIN이 없다** — 참여한 방 목록은 `roomId`만 준다. 진행률(3/8)도 없다.
 * 그래서 카드는 방 이름·선생님만 보여 주고, 들어가는 길은 PIN 입력 화면으로 보낸다.
 */
export function toActiveSession(rooms: JoinedRoom[]): ActiveSession | null {
  const ongoing = rooms.find((r) => r.status === "WAITING" || r.status === "RUNNING");
  if (!ongoing) return null;

  return {
    roomId: ongoing.roomId,
    title: ongoing.title,
    hostName: ongoing.hostNickname,
    isRunning: ongoing.status === "RUNNING",
  };
}

function toAttendedSession(room: JoinedRoom): AttendedSession {
  return {
    id: String(room.roomId),
    // 아직 안 끝난 방은 등수·점수가 없다 — 0으로 채우지 않는다
    rank: room.myRank ?? null,
    title: room.title,
    dateLabel: toSessionDateLabel(room),
    questionCount: room.questionCount,
    score: room.myScore ?? null,
    hasReport: room.hasReport,
  };
}

/** 종료 시각이 있으면 그 날짜, 없으면 시작 시각. 둘 다 없으면 빈 문자열 */
function toSessionDateLabel(room: JoinedRoom): string {
  const source = room.endedAt ?? room.startedAt;
  if (!source) return "";

  const date = parseServerDateTime(source);
  if (Number.isNaN(date.getTime())) return "";

  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  return `${date.getMonth() + 1}/${date.getDate()} (${weekday})`;
}

/**
 * GET /users/me/rooms/joined → W-13 참여한 방 · 참여 기록.
 *
 * 정답률은 서버가 소수로 준다(16.666…) — 시안은 정수 한 자리("71%")라 여기서 반올림한다.
 * 화면에서 `toFixed`를 부르지 않고 뷰 타입에 정수로 담는 편이 다른 화면과 어긋날 일이 없다.
 */
export function toLearningRecord(page: JoinedRoomsResponse): LearningRecord {
  return {
    stats: {
      sessions: page.summary.completedSessionCount,
      accuracy: Math.round(page.summary.averageAccuracy),
      averageRank: page.summary.averageRank,
    },
    weakTopics: page.summary.weakTopics,
    sessions: page.rooms.content.map(toAttendedSession),
  };
}

/**
 * "지난주보다 4.2%p 올랐어요" — 비교할 지난주가 없으면 null.
 *
 * 누적 리포트에는 세션별 추이(`trend`)도 오지만 **그릴 자리가 시안에 없다** — 없는 차트를
 * 지어내는 대신 변화 한 줄만 쓴다(추이 그래프는 디자인이 정해지면 붙인다).
 */
export function toAccuracyChangeLabel(report: CumulativeReportResponse): string | null {
  const change = report.accuracyChangeFromLastWeek;
  if (change === undefined || change === 0) return null;

  return change > 0
    ? `지난주보다 ${change.toFixed(1)}%p 올랐어요`
    : `지난주보다 ${Math.abs(change).toFixed(1)}%p 내렸어요`;
}

const BADGE_META: Record<BadgeType, { kind: AchievementBadgeKind; label?: string; title: string }> =
  {
    FIRST_ROOM: { kind: "flag", title: "첫 방 개설" },
    ROOMS_10: { kind: "number", label: "10", title: "방 10회 운영" },
    STUDENTS_100: { kind: "paws", title: "학생 100명" },
    // TODO(디자인): 시안 뱃지 시트에서 "평가 4.5+"·"AI 세트 50개"는 아이콘이 비어 있다
    RATING_45: { kind: "empty", title: "평가 4.5+" },
    RATINGS_50: { kind: "ring", label: "50", title: "평가 50개 받기" },
    ACTIVE_30D: { kind: "drop", title: "30일 연속 활동" },
    FIRST_PAID_ROOM: { kind: "won", title: "유료 방 첫 개설" },
    AI_SETS_50: { kind: "empty", title: "AI 세트 50개" },
  };

/** 공개 프로필은 **획득한 뱃지만** 준다 — 목록에 있으면 딴 것이다 */
export function toEarnedAchievement(type: BadgeType): Achievement {
  const meta = BADGE_META[type];
  return {
    id: type,
    kind: meta?.kind ?? "empty",
    label: meta?.label,
    title: meta?.title ?? type,
  };
}

/** GET /users/me/notification-settings → 4행(마케팅은 로컬 상태, DESIGN_GAPS C-5) */
export function toNotificationSettings(
  dto: NotificationSettingsDto,
  marketingEnabled: boolean,
): NotificationSetting[] {
  const keys: NotificationKey[] = ["sessionStart", "ratingRequest", "settlementDone", "marketing"];
  const enabledByKey: Record<NotificationKey, boolean> = {
    sessionStart: dto.sessionStart ?? true,
    ratingRequest: dto.ratingRequest ?? true,
    settlementDone: dto.settlementDone ?? true,
    marketing: marketingEnabled,
  };

  return keys.map((key) => ({ key, ...NOTIFICATION_LABEL[key], enabled: enabledByKey[key] }));
}

const ALL_PAY_METHODS: PayMethod[] = ["kakaopay", "naverpay", "tosspay", "card", "transfer"];

/**
 * GET /users/me/coins.defaultMethod → 결제 수단 관리 목록.
 * 계약은 기본 수단 1개 선택만 지원해 카드 목록이 없다 — 알려진 5종을 그대로 행으로 그린다(DESIGN_GAPS C-4).
 */
export function toPaymentMethodItems(
  defaultMethod: PaymentMethod | null | undefined,
): PaymentMethodItem[] {
  const current = defaultMethod ? toPortoneMethod(defaultMethod) : null;

  return ALL_PAY_METHODS.map((method) => ({
    id: method,
    kind: method,
    name: PAY_METHOD_LABEL[method],
    isDefault: method === current,
  }));
}

/** 화면 공용 오류 문구 — 서버 kind로 분기한다 */
export function toMeErrorMessage(error: unknown): string {
  if (!AppError.isAppError(error)) return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  if (error.kind === "Conflict")
    return error.serverMessage ?? "정산 예정 금액이나 진행 중인 방이 있어 지금은 탈퇴할 수 없어요";
  if (error.kind === "ValidationFailed") return error.serverMessage ?? error.message;
  return error.message;
}
