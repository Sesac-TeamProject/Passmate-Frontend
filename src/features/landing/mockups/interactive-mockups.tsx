"use client";

import { RoleSidebar } from "@/components/layout/role-sidebar";
import { EditorPage } from "@/features/host/editor/editor-page";
import { ReviewPage } from "@/features/host/review/review-page";
import {
  ACCOUNT,
  EDITOR_MOCK_QUESTIONS,
  EDITOR_MOCK_TITLE,
  REPORT_ESSAY_ANSWERS_MOCK,
  REPORT_SELECTED_QUESTION_ID,
  REPORT_STUDENTS_MOCK,
  SESSION_REPORT_MOCK,
} from "./mock-data";

/*
 * EditorPage·ReviewPage는 이제 콜백 props를 받는 실제 화면이라 클라이언트 경계 안에 둔다
 * (LiveMockup과 같은 이유 — live-mockup.tsx 주석 참고). 목업은 조작할 수 없다 — 콜백은 아무 일도 하지 않는다.
 */
const noop = () => {};

/** W-03 문제 에디터 — AI로 문제 만들기 */
export function EditorMockup() {
  return (
    <div className="h-full bg-background *:min-h-full!">
      <EditorPage
        title={EDITOR_MOCK_TITLE}
        questions={EDITOR_MOCK_QUESTIONS}
        onGenerate={noop}
        onConfirm={noop}
        canConfirm
      />
    </div>
  );
}

/** W-07 방 리포트 — 회원 사이드바(내가 만든 방 활성) + 리포트 본문 */
export function ReportMockup() {
  return (
    <div className="flex h-full bg-background [&_aside]:h-full! [&_main]:min-h-full!">
      <RoleSidebar nav="host" user={ACCOUNT} activePath="/host/rooms" />
      <div className="min-w-0 flex-1">
        <ReviewPage
          report={SESSION_REPORT_MOCK}
          students={REPORT_STUDENTS_MOCK}
          selectedQuestionId={REPORT_SELECTED_QUESTION_ID}
          onSelectQuestion={noop}
          essayAnswers={REPORT_ESSAY_ANSWERS_MOCK}
          onExport={noop}
        />
      </div>
    </div>
  );
}
