import { RoleSidebar } from "@/components/layout/role-sidebar";
import { EditorPage } from "@/features/host/editor/editor-page";
import { ReviewPage } from "@/features/host/review/review-page";
import { ACCOUNT } from "@/features/me/mock";

/*
 * 랜딩 기능 섹션에 넣는 실제 화면 3종. 각 화면은 자기 목 데이터로 완결돼 있어 그대로 렌더한다.
 * 화면 루트의 min-h-screen(100vh)은 zoom 안에서 900보다 커져 하단이 잘리므로 min-h-full로 덮는다.
 */

/** W-03 문제 에디터 — AI로 문제 만들기 */
export function EditorMockup() {
  return (
    <div className="h-full bg-background *:min-h-full!">
      <EditorPage />
    </div>
  );
}

// W-05 진행 목업은 콜백을 넘겨야 해서 클라이언트 경계 안(live-mockup.tsx)에 둔다
export { LiveMockup } from "./live-mockup";

/** W-07 방 리포트 — 회원 사이드바(내가 만든 방 활성) + 리포트 본문 */
export function ReportMockup() {
  return (
    <div className="flex h-full bg-background [&_aside]:h-full! [&_main]:min-h-full!">
      <RoleSidebar nav="host" user={ACCOUNT} activePath="/host/rooms" />
      <div className="min-w-0 flex-1">
        <ReviewPage />
      </div>
    </div>
  );
}
