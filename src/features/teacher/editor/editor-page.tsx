import Link from "next/link";
import { DRAFT_QUESTIONS, DRAFT_SET } from "@/features/teacher/mock";
import { FlowTopBar } from "@/features/teacher/room-flow/flow-top-bar";
import { GeneratePanel } from "./generate-panel";
import { QuestionList } from "./question-list";

/** W-03 문제 에디터 (방 만들기 2/3) */
export function EditorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowTopBar
        backHref="/teacher/rooms/new"
        title={`${DRAFT_SET.title} · 문제 준비`}
        badge="2/3 단계"
      >
        <button
          type="button"
          className="flex h-[42px] items-center rounded-[14px] border-2 bg-card px-[18px] text-label-lg text-mint-dark transition-colors hover:bg-muted"
        >
          미리보기
        </button>
        <Link
          href="/teacher/rooms/DEMO01/lobby"
          className="flex h-[42px] items-center rounded-[14px] bg-mint-tint px-5 text-label-lg text-mint-dark transition-colors hover:bg-mint hover:text-white"
        >
          세트 확정 → 대기실
        </Link>
      </FlowTopBar>
      <main className="flex flex-1 gap-6 px-8 py-6">
        <GeneratePanel initial={DRAFT_SET.condition} />
        <QuestionList initial={DRAFT_QUESTIONS} />
      </main>
    </div>
  );
}
