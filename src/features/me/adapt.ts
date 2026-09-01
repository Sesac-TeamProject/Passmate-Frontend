import type { StatItem } from "@/components/common/stat-cards";
import { toAvatarKey } from "@/components/common/student-avatar";
import { formatShortDate, formatWon } from "@/lib/format";
import { LEVEL_TITLE, levelTitle } from "@/lib/host-level";
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
  GradeCriterion,
  GradeResponse,
  MeResponse,
  MyPageOngoing,
  MyPageResponse,
  MyPageRoom,
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

/** GradeResponse.next.criteria에서 라벨이 prefix로 시작하는 항목을 찾아 남은 실적(target-current)을 돌려준다 */
function criterionLeft(criteria: GradeCriterion[] | undefined, labelPrefix: string): number {
  const match = criteria?.find((c) => c.label?.startsWith(labelPrefix));
  if (!match || match.target == null || match.current == null) return 0;
  return Math.max(0, match.target - match.current);
}

/** GET /users/me(+/grade) → 프로필 카드 */
export function toProfile(me: MeResponse, grade?: GradeResponse): Profile {
  const level = me.level ?? 1;
  const next = grade?.next;

  return {
    name: me.nickname ?? "",
    nickname: me.nickname ?? "",
    email: me.email ?? "",
    joinedLabel: me.joinedAt ? `${me.joinedAt.slice(0, 7)} 가입` : "",
    avatar: toAvatarKey(me.avatarId),
    level,
    levelTitle: levelTitle(level) ?? LEVEL_TITLE[1],
    levelPerk: level >= PAID_ROOM_MIN_LEVEL ? "유료 방 개설 가능" : "",
    nextLevel: {
      level: next?.level ?? level + 1,
      roomsLeft: criterionLeft(next?.criteria, "방 운영"),
      studentsLeft: criterionLeft(next?.criteria, "총 학생"),
    },
    progress: next?.progressPercent ?? 0,
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

/** GET /users/me/coins → 카드/코인 · 결제 */
export function toCoinSummary(coins: CoinBalanceResponse): CoinSummary {
  const recent = coins.recent;

  return {
    balance: coins.balance ?? 0,
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

/** ActiveSession.progress — "3/8" → {current:3, total:8} */
function parseProgress(label: string | null | undefined): { current: number; total: number } {
  if (!label) return { current: 0, total: 0 };
  const [current, total] = label.split("/").map(Number);
  return {
    current: Number.isFinite(current) ? current : 0,
    total: Number.isFinite(total) ? total : 0,
  };
}

/** MyPageResponse.ongoing → 참여한 방의 "다시 들어가기" 카드. 없으면 null */
export function toActiveSession(ongoing: MyPageOngoing | null | undefined): ActiveSession | null {
  if (!ongoing) return null;

  return {
    code: ongoing.pin,
    pin: ongoing.pin,
    title: ongoing.title,
    hostName: ongoing.hostNickname ?? "",
    progress: parseProgress(ongoing.progressLabel),
  };
}

function toAttendedSession(room: MyPageRoom): AttendedSession {
  return {
    id: String(room.roomId),
    rank: room.myRank ?? 0,
    title: room.title,
    dateLabel: room.dateLabel ?? "",
    questionCount: room.questionCount ?? 0,
    score: room.myScore ?? 0,
  };
}

/** GET /users/me/rooms/joined → W-13 참여한 방 · 참여 기록 */
export function toLearningRecord(page: MyPageResponse): LearningRecord {
  const summary = page.summary;

  return {
    stats: {
      sessions: summary?.participationCount ?? 0,
      accuracy: summary?.accuracyPercent ?? 0,
      averageRank: summary?.avgRank ?? 0,
    },
    weakTopics: summary?.weakTopics ?? [],
    sessions: (page.rooms ?? []).map(toAttendedSession),
  };
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
