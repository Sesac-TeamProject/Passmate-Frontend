/*
 * 랜딩 기능 섹션에 넣는 실제 화면 3종의 재수출 지점. 각 화면은 자기 목 데이터(mock-data.ts)로 완결돼 있다.
 * 콜백 props를 받는 화면(에디터·리포트·진행)은 클라이언트 경계 안(interactive-mockups.tsx·live-mockup.tsx)에 둔다.
 */
export { EditorMockup, ReportMockup } from "./interactive-mockups";
export { LiveMockup } from "./live-mockup";
