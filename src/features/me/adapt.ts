import type { StatItem } from "@/components/common/stat-cards";
import { toAvatarKey } from "@/components/common/student-avatar";
import { parseServerDateTime } from "@/lib/datetime";
import { formatShortDate, formatWon } from "@/lib/format";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";
import { AppError } from "@/lib/types/app-error";
import type {
  BadgeDto,
  BadgesResponse,
  BadgeType,
  CoinBalanceResponse,
  CoinTransactionDto,
  CoinTransactionType,
  EarningsResponse,
  GradeResponse,
  CumulativeReportResponse,
  JoinedRoom,
  JoinedRoomsResponse,
  MyProfileResponse,
  NotificationSettingsDto,
  PaymentMethod,
  SettlementAccountDto,
  SettlementItemDto,
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
import {
  type Achievement,
  type AchievementBadgeKind,
  type AttendedSession,
  type CoinSummary,
  type HostRecord,
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
 * GET /users/me → 프로필 카드.
 * 등급·칭호·다음 레벨은 **채우지 않는다** — 서버가 아직 계산하지 않아 자리를 비워 둔 값이라
 * Lv.1로 메우면 "새싹 등급"이라는 없는 사실을 만든다(`features/me/types.ts` Profile 주석).
 */
export function toProfile(me: MyProfileResponse): Profile {
  return {
    name: me.nickname,
    nickname: me.nickname,
    email: me.email ?? "",
    joinedLabel: toJoinedLabel(me.joinedAt),
    avatar: toAvatarKey(me.defaultAvatarId),
  };
}

const WIRE_METHOD_BY_PAY_METHOD: Record<PayMethod, PaymentMethod> = {
  kakaopay: "KAKAO_PAY",
  naverpay: "NAVER_PAY",
  tosspay: "TOSS_PAY",
  card: "CARD",
  transfer: "TRANSFER",
};
const PAY_METHOD_BY_WIRE_METHOD: Record<PaymentMethod, PayMethod> = {
  KAKAO_PAY: "kakaopay",
  NAVER_PAY: "naverpay",
  TOSS_PAY: "tosspay",
  CARD: "card",
  TRANSFER: "transfer",
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
 * **잔액은 `GET /users/me`의 `coinBalance`가 원천이다** — `GET /users/me/coins`는 백엔드에 없다
 * (`CoinWallet` 엔티티만 있고 컨트롤러가 없다). 결제 수단·최근 내역은 아직 목뿐이라 `@draft`.
 */
export function toCoinSummary(coins: CoinBalanceResponse, coinBalance: number): CoinSummary {
  const recent = coins.recent;

  return {
    balance: coinBalance,
    paymentMethodLabel: coins.defaultMethod
      ? `${PAY_METHOD_LABEL[toPortoneMethod(coins.defaultMethod)]} (기본) · 포트원 안전결제`
      : "등록된 결제 수단 없음",
    lastTransaction: recent
      ? {
          dateLabel: recent.createdAt ? formatShortDate(recent.createdAt) : "",
          title: recent.roomTitle ?? COIN_TX_TYPE_LABEL[recent.type ?? "CHARGE"],
          amount: recent.amount ?? 0,
        }
      : null,
  };
}

const COIN_TX_TYPE_LABEL: Record<CoinTransactionType, string> = {
  CHARGE: "코인 충전",
  DEDUCT: "코인 사용",
  REFUND: "환불",
};

/** GET /users/me/coins/transactions → 코인 사용 · 충전 내역 목록 */
export function toCoinHistory(items: CoinTransactionDto[]): CoinHistoryItem[] {
  return items.map((item, index) => ({
    id: String(item.id ?? index),
    date: item.createdAt ?? "",
    title: item.roomTitle ?? COIN_TX_TYPE_LABEL[item.type ?? "CHARGE"],
    amount: item.amount ?? 0,
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

const PAYOUT_STATUS_TO_SETTLEMENT_STATUS: Record<
  NonNullable<SettlementItemDto["status"]>,
  SettlementStatus
> = {
  SCHEDULED: "scheduled",
  PAID: "paid",
  HELD: "held",
};

/** GET /users/me/earnings.items → 결제 · 정산 내역 표 */
export function toSettlementRows(items: SettlementItemDto[]): SettlementRow[] {
  return items.map((item, index) => ({
    id: String(item.settlementId ?? index),
    dateLabel: item.dateLabel ?? "",
    roomTitle: item.roomTitle ?? "",
    participants: item.participantCount ?? 0,
    gross: item.entryFeeTotal ?? 0,
    fee: item.feeAmount ?? 0,
    payout: item.payoutAmount ?? 0,
    status: item.status ? PAYOUT_STATUS_TO_SETTLEMENT_STATUS[item.status] : "scheduled",
  }));
}

/** GET /users/me/earnings → 마이페이지 "이번 달 정산 예정" 카드 */
export function toSettlementSummary(earnings: EarningsResponse): SettlementSummary {
  return {
    thisMonthAmount: earnings.nextPayout?.amount ?? earnings.monthlyTotal ?? 0,
    payoutDateLabel: earnings.nextPayout?.dateLabel ?? "",
    hostShare: earnings.hostSharePercent ?? 80,
    paidRoomLevel: PAID_ROOM_MIN_LEVEL,
    taxNote: "연 소득 기준 원천징수 3.3% 적용",
  };
}

/** GET /users/me/earnings → W-10 정산 요약 3장 */
export function toSettlementStats(earnings: EarningsResponse): StatItem[] {
  const hostShare = earnings.hostSharePercent ?? 80;
  const nextPayout = earnings.nextPayout;

  return [
    {
      id: "revenue",
      label: `이번 달 수익 (선생님 ${hostShare}%)`,
      value: formatWon(earnings.monthlyTotal ?? 0, true),
      tile: { label: "₩", tone: "mint" },
    },
    {
      id: "next-payout",
      label: nextPayout?.dateLabel ? `다음 지급 (${nextPayout.dateLabel})` : "다음 지급",
      value: formatWon(nextPayout?.amount ?? 0, true),
      tile: { label: "D", tone: "blue" },
    },
    {
      id: "paid-rooms",
      label: "유료 방 운영",
      value: `${earnings.paidRoomCount ?? 0}회 · ${earnings.studentCount ?? 0}명`,
      tile: { label: "R", tone: "orange" },
    },
  ];
}

/** "***-***-4821" 형태로 마스킹 — 마지막 4자리만 남긴다 */
function maskAccountNumber(accountNumber: string | undefined): string {
  if (!accountNumber) return "";
  const last4 = accountNumber.replace(/\D/g, "").slice(-4);
  return last4 ? `***-***-${last4}` : "";
}

/** GET /users/me/settlement-account → 정산 계좌 등록 폼 초기값 · 표시용. 404는 컨테이너가 미등록으로 처리한다 */
export function toSettlementAccount(dto: SettlementAccountDto): SettlementAccount {
  return {
    bank: dto.bankName ?? "",
    maskedNumber: maskAccountNumber(dto.accountNumber),
    accountNumber: dto.accountNumber ?? "",
    holder: dto.holderName ?? "",
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

/** GET /users/me/rooms/joined → W-13 참여한 방 · 참여 기록 */
export function toLearningRecord(page: JoinedRoomsResponse): LearningRecord {
  return {
    stats: {
      sessions: page.summary.completedSessionCount,
      accuracy: page.summary.averageAccuracy,
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
    STREAK_30: { kind: "drop", title: "30일 연속 활동" },
    FIRST_PAID_ROOM: { kind: "won", title: "유료 방 첫 개설" },
    AI_SETS_50: { kind: "empty", title: "AI 세트 50개" },
  };

/**
 * 호스트 공개 프로필은 뱃지를 BadgeDto가 아니라 BadgeType 목록으로 준다 — 목록에 있으면 획득한 것이다.
 */
export function toEarnedAchievement(type: BadgeType): Achievement {
  const meta = BADGE_META[type];
  return {
    id: type,
    kind: meta?.kind ?? "empty",
    label: meta?.label,
    title: meta?.title ?? type,
  };
}

function toAchievement(badge: BadgeDto): Achievement {
  const meta = badge.type ? BADGE_META[badge.type] : undefined;

  return {
    id: badge.type ?? "unknown",
    kind: meta?.kind ?? "empty",
    label: meta?.label,
    title: meta?.title ?? badge.type ?? "",
    locked: !badge.earned,
  };
}

/**
 * GET /users/me/grade + /badges → 개설한 방(host) 실적 카드.
 * 지금은 어느 화면도 이 값을 그리지 않는다(마이페이지에 "기록" 카드 UI가 없다) — 계약대로 정의만 해 둔다.
 */
export function toHostRecord(
  grade: GradeResponse | undefined,
  badges: BadgesResponse | undefined,
): HostRecord {
  const stats = grade?.stats;
  const items = (badges?.items ?? []).map(toAchievement);
  const earned = items.filter((item) => !item.locked).length;

  return {
    stats: {
      rooms: stats?.roomCount ?? 0,
      rating: stats?.avgStars ?? 0,
      students: stats?.totalStudents ?? 0,
    },
    badges: { earned, total: items.length, locked: items.length - earned, items },
    // 진행 중인 방 수 · 이번 달 정산액은 useHostedRooms/useEarnings에 계약이 있지만, 이 카드를 그리는
    // 화면이 아직 없어(위 docstring 참고) 여기서는 채우지 않는다. 화면이 생기면 컨테이너가 두 훅을 더 호출해 채운다.
    openRooms: 0,
    settlementThisMonth: 0,
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
