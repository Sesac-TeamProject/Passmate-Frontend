import { AppError } from "@/lib/types/app-error";
import {
  mockAdminDashboard,
  mockAdminPayments,
  mockAdminReports,
  mockAdminReviewQueue,
  mockAdminRooms,
  mockAdminSanctions,
  mockAdminSettlements,
  mockAdminUsers,
} from "./admin";
import { MOCK_ME, MOCK_TOKENS } from "./auth";

/**
 * 목 모드 라우트 표. 키는 "METHOD /path". api/client.ts가 IS_MOCK일 때만 여기로 온다.
 * 실제 네트워크와 비슷하게 짧은 지연을 둔다.
 */
const MOCK_LATENCY_MS = 250;
const MOCK_ORIGIN = "http://mock.local";

type MockHandler = (url: URL) => unknown;

const HANDLERS: Record<string, MockHandler> = {
  "POST /auth/refresh": () => MOCK_TOKENS,
  "GET /me": () => MOCK_ME,
  "GET /admin/dashboard": () => mockAdminDashboard(),
  "GET /admin/users": (url) => mockAdminUsers(url.searchParams.get("filter")),
  "GET /admin/rooms": () => mockAdminRooms(),
  "GET /admin/questions/review-queue": () => mockAdminReviewQueue(),
  "GET /admin/reports": () => mockAdminReports(),
  "GET /admin/sanctions": () => mockAdminSanctions(),
  "GET /admin/payments": () => mockAdminPayments(),
  "GET /admin/settlements/pending": () => mockAdminSettlements(),
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function resolveMock<T>(method: string, url: string): Promise<T> {
  const parsed = new URL(url, MOCK_ORIGIN);
  const handler = HANDLERS[`${method} ${parsed.pathname}`];

  if (!handler) {
    throw new AppError("NotFound", { code: "MOCK_ROUTE_MISSING", serverMessage: url });
  }

  await delay(MOCK_LATENCY_MS);

  return handler(parsed) as T;
}
