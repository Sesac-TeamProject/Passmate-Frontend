import { RequireAuth } from "@/components/common/require-auth";

/**
 * 방 만들기·에디터·대기실·진행·문항 결과 — 로그인 가드만 씌운다.
 * 사이드바·여백은 두지 않는다(프로젝터에 띄우는 전체 화면 흐름이라 (nav) 레이아웃과 다르다).
 * 가드가 없으면 SessionBootstrap이 세션을 복구하기 전에 첫 쿼리가 나가 401로 굳는다.
 */
export default function HostFlowLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
