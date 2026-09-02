import { AppError } from "@/lib/types/app-error";
import type {
  AiGenerateRequest,
  ConfirmChargeRequest,
  CreateChargeRequest,
  JoinRoomRequest,
  NotificationSettingsDto,
  QuestionRequest,
  QuestionSetUpdateRequest,
  RoomCreateRequest,
  RoomInfoResponse,
  RoomUpdateRequest,
  ScreenLockRequest,
  SettlementAccountDto,
  SubmitAnswerRequest,
  UserProfileUpdateRequest,
} from "@/lib/types/dto";
import {
  mockAdminAdCampaigns,
  mockAdminBrandedQuizzes,
  mockAdminDashboard,
  mockAdminPayments,
  mockAdminReports,
  mockAdminReviewQueue,
  mockAdminRooms,
  mockAdminSanctions,
  mockAdminSettlements,
  mockAdminUsers,
} from "./admin";
import { MOCK_TOKENS, mockLogin } from "./auth";
import {
  mockClaim,
  mockDeleteMe,
  mockGrade,
  mockHostProfile,
  mockMe,
  mockMyPage,
  mockBadges as mockMyBadges,
  mockNotificationSettings,
  mockPutNotificationSettings,
  mockReport,
  mockUpdateProfile,
} from "./me";
import {
  mockCoinBalance,
  mockCoinTransactions,
  mockConfirmCharge,
  mockCreateCharge,
  mockEarnings,
  mockEntryPayment,
  mockPutPaymentMethod,
  mockPutSettlementAccount,
  mockSettlementAccount,
} from "./payments";
import {
  mockAddQuestion,
  mockConfirmQuestionSet,
  mockCreateQuestionSet,
  mockDeleteQuestion,
  mockDuplicateQuestionSet,
  mockGenerate,
  mockGenerateFromFile,
  mockQuestionSetDetail,
  mockQuestionSets,
  mockRegenerateQuestion,
  mockUpdateQuestion,
  mockUpdateQuestionSet,
} from "./question-sets";
import {
  mockCloseRoom,
  mockCreateRoom,
  mockHostedRooms,
  mockJoinRoom,
  mockLeaveRoom,
  mockParticipants,
  mockPublicRooms,
  mockRoom,
  mockRoomByPin,
  mockUpdateRoom,
} from "./rooms";
import {
  mockEssayAnswers,
  mockMyReport,
  mockMyResult,
  mockPostReview,
  mockRoomReport,
  mockSubmitRating,
} from "./results";
import type { MockContext, MockHandler } from "./router";
import { matchMockRoute } from "./router";
import {
  mockEndCurrent,
  mockEndSession,
  mockHints,
  mockLock,
  mockNext,
  mockSnapshot,
  mockStartSession,
  mockSubmissions,
  mockSubmitAnswer,
  mockUploadHint,
} from "./session";

/**
 * 목 모드 라우트 표. 키는 "METHOD /path". api/client.ts가 IS_MOCK일 때만 여기로 온다.
 * 실제 네트워크와 비슷하게 짧은 지연을 둔다.
 */
const MOCK_LATENCY_MS = 250;
const MOCK_ORIGIN = "http://mock.local";

function asBody<T>(ctx: MockContext): T {
  return ctx.body as T;
}

const HANDLERS: Record<string, MockHandler> = {
  /* ── 인증 ─────────────────────────────────────────── */
  "POST /auth/login/:provider": () => mockLogin(),
  "POST /auth/dev-login": () => mockLogin(),
  "POST /auth/refresh": () => MOCK_TOKENS,
  "POST /auth/logout": () => undefined,

  /* ── 내 프로필 ────────────────────────────────────── */
  "GET /users/me": () => mockMe(),
  "PUT /users/me": (ctx) => mockUpdateProfile(asBody<UserProfileUpdateRequest>(ctx)),
  "DELETE /users/me": () => mockDeleteMe(),

  /* ── 방 ───────────────────────────────────────────── */
  "GET /rooms/pin/:pin": (ctx): RoomInfoResponse => mockRoomByPin(ctx.params.pin),
  "POST /rooms": (ctx) => mockCreateRoom(asBody<RoomCreateRequest>(ctx)),
  "GET /rooms/:roomId": (ctx) => mockRoom(ctx.params.roomId),
  "PUT /rooms/:roomId": (ctx) => mockUpdateRoom(ctx.params.roomId, asBody<RoomUpdateRequest>(ctx)),
  "POST /rooms/:roomId/close": (ctx) => mockCloseRoom(ctx.params.roomId),
  "GET /users/me/rooms/hosted": () => mockHostedRooms(),
  "GET /rooms/public": (ctx) => mockPublicRooms(ctx.url),
  "POST /rooms/:roomId/participants": (ctx) =>
    mockJoinRoom(ctx.params.roomId, asBody<JoinRoomRequest>(ctx)),
  "GET /rooms/:roomId/participants": () => mockParticipants(),
  "DELETE /rooms/:roomId/participants/me": () => mockLeaveRoom(),

  /* ── 진행 세션 ────────────────────────────────────── */
  "GET /rooms/:roomId/session": () => mockSnapshot(),
  "POST /rooms/:roomId/session/start": () => mockStartSession(),
  "POST /rooms/:roomId/session/next": () => mockNext(),
  "POST /rooms/:roomId/session/current/end": () => mockEndCurrent(),
  "POST /rooms/:roomId/session/end": () => mockEndSession(),
  "PUT /rooms/:roomId/session/lock": (ctx) => mockLock(asBody<ScreenLockRequest>(ctx)),
  "GET /rooms/:roomId/session/current/submissions": () => mockSubmissions(),
  "POST /rooms/:roomId/session/questions/:questionId/answers": (ctx) =>
    mockSubmitAnswer(asBody<SubmitAnswerRequest>(ctx)),
  "GET /rooms/:roomId/session/hints": () => mockHints(),
  "POST /rooms/:roomId/session/hints": (ctx) => mockUploadHint(asBody<FormData>(ctx)),

  /* ── 문제 세트 ────────────────────────────────────── */
  "GET /question-sets": (ctx) => mockQuestionSets(ctx.url),
  "POST /question-sets": (ctx) => mockCreateQuestionSet(ctx.body),
  "GET /question-sets/:id": (ctx) => mockQuestionSetDetail(ctx.params.id),
  "PUT /question-sets/:id": (ctx) =>
    mockUpdateQuestionSet(ctx.params.id, asBody<QuestionSetUpdateRequest>(ctx)),
  "POST /question-sets/:id/confirm": (ctx) => mockConfirmQuestionSet(ctx.params.id),
  "POST /question-sets/:id/duplicate": (ctx) => mockDuplicateQuestionSet(ctx.params.id),
  "POST /question-sets/:setId/questions": (ctx) =>
    mockAddQuestion(ctx.params.setId, asBody<QuestionRequest>(ctx)),
  "PUT /question-sets/:setId/questions/:questionId": (ctx) =>
    mockUpdateQuestion(ctx.params.setId, ctx.params.questionId, asBody<QuestionRequest>(ctx)),
  "DELETE /question-sets/:setId/questions/:questionId": (ctx) =>
    mockDeleteQuestion(ctx.params.setId, ctx.params.questionId),
  "POST /question-sets/:setId/questions/:questionId/regenerate": (ctx) =>
    mockRegenerateQuestion(ctx.params.setId, ctx.params.questionId),
  "POST /question-sets/:setId/questions/generate": (ctx) =>
    mockGenerate(ctx.params.setId, asBody<AiGenerateRequest>(ctx)),
  "POST /question-sets/:setId/questions/generate-from-file": (ctx) =>
    mockGenerateFromFile(ctx.params.setId, asBody<FormData>(ctx)),

  /* ── 결과 · 리포트 · 평가 ─────────────────────────── */
  "GET /rooms/:roomId/results/me": () => mockMyResult(),
  "GET /rooms/:roomId/reports/me": () => mockMyReport(),
  "GET /rooms/:roomId/results": () => mockRoomReport(),
  "GET /rooms/:roomId/answers": () => mockEssayAnswers(),
  "PUT /rooms/:roomId/answers/:answerId/review": () => mockPostReview(),
  "POST /rooms/:roomId/ratings": () => mockSubmitRating(),

  /* ── 마이페이지 ───────────────────────────────────── */
  "GET /users/me/rooms/joined": () => mockMyPage(),
  "GET /users/me/grade": () => mockGrade(),
  "GET /users/me/badges": () => mockMyBadges(),
  "GET /users/me/notification-settings": () => mockNotificationSettings(),
  "PUT /users/me/notification-settings": (ctx) =>
    mockPutNotificationSettings(asBody<NotificationSettingsDto>(ctx)),
  "GET /users/:userId/profile": (ctx) => mockHostProfile(ctx.params.userId),
  "POST /reports": () => mockReport(),
  "POST /guest-records/claim": () => mockClaim(),

  /* ── 코인 · 정산 ──────────────────────────────────── */
  "GET /users/me/coins": () => mockCoinBalance(),
  "GET /users/me/coins/transactions": () => mockCoinTransactions(),
  "POST /coins/charges": (ctx) => mockCreateCharge(asBody<CreateChargeRequest>(ctx)),
  "POST /coins/charges/:chargeId/confirm": (ctx) =>
    mockConfirmCharge(ctx.params.chargeId, asBody<ConfirmChargeRequest>(ctx)),
  "POST /rooms/:roomId/entry-payments": () => mockEntryPayment(),
  "GET /users/me/earnings": () => mockEarnings(),
  "GET /users/me/settlement-account": () => mockSettlementAccount(),
  "PUT /users/me/settlement-account": (ctx) =>
    mockPutSettlementAccount(asBody<SettlementAccountDto>(ctx)),
  "PUT /users/me/payment-method": () => mockPutPaymentMethod(),

  /* ── 관리자 (A-01~A-06) ───────────────────────────── */
  "GET /admin/dashboard": () => mockAdminDashboard(),
  "GET /admin/users": (ctx) => mockAdminUsers(ctx.url.searchParams.get("filter")),
  "GET /admin/rooms": () => mockAdminRooms(),
  "GET /admin/questions/review-queue": () => mockAdminReviewQueue(),
  "GET /admin/reports": () => mockAdminReports(),
  "GET /admin/sanctions": () => mockAdminSanctions(),
  "GET /admin/payments": () => mockAdminPayments(),
  "GET /admin/settlements": () => mockAdminSettlements(),
  "GET /admin/ad-campaigns": () => mockAdminAdCampaigns(),
  "GET /admin/branded-rooms": () => mockAdminBrandedQuizzes(),
};

/** 라우트 표 키 목록 — handlers.test.ts가 전체 커버리지를 검증할 때 쓴다. */
export const MOCK_ROUTES: readonly string[] = Object.keys(HANDLERS);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function resolveMock<T>(method: string, url: string, body?: unknown): Promise<T> {
  const parsed = new URL(url, MOCK_ORIGIN);
  const match = matchMockRoute(MOCK_ROUTES, method, parsed.pathname);

  if (!match) {
    throw new AppError("NotFound", { code: "MOCK_ROUTE_MISSING", serverMessage: url });
  }

  await delay(MOCK_LATENCY_MS);

  const handler = HANDLERS[match.key];
  return (await handler({ params: match.params, url: parsed, body })) as T;
}
