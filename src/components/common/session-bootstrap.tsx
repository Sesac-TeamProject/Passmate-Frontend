"use client";

import { useRestoreSession } from "@/lib/queries/use-restore-session";

/**
 * 앱 어디서든 auth-store.status가 idle로 남지 않도록 루트에서 한 번 세션을 복원한다
 * (RequireAuth가 같은 훅을 다시 불러도 beginRestore가 한 번만 실행되므로 중복 호출은 안전하다).
 * 목 모드는 저장된 리프레시 토큰이 없어도 고정 회원(MOCK_REFRESH_TOKEN)으로 자동 로그인된다 —
 * 그래서 로컬 확인 시 /login이 바로 /home으로 리다이렉트되고, 홈·게스트 입장의 "회원" 분기를 항상 탄다.
 */
export function SessionBootstrap() {
  useRestoreSession();
  return null;
}
