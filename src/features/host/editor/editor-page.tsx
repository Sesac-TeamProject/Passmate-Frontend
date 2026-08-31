import type { Question } from "@/features/host/types";
import { FlowTopBar } from "@/features/host/room-flow/flow-top-bar";
import type { AiUsageResponse, GenerateQuestionSetRequest } from "@/lib/types/dto";
import { GeneratePanel } from "./generate-panel";
import { QuestionList } from "./question-list";

type Props = {
  title: string;
  questions: Question[];
  usage?: AiUsageResponse;
  onGenerate: (body: GenerateQuestionSetRequest) => void;
  generating?: boolean;
  generateError?: string | null;
  onConfirm: () => void;
  confirming?: boolean;
  canConfirm: boolean;
};

/** W-03 문제 에디터 (방 만들기 2/3) */
export function EditorPage({
  title,
  questions,
  usage,
  onGenerate,
  generating,
  generateError,
  onConfirm,
  confirming,
  canConfirm,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <FlowTopBar backHref="/host/rooms/new" title={title} badge="2/3 단계">
        <button
          type="button"
          className="flex h-[42px] items-center rounded-[14px] border-2 bg-card px-[18px] text-label-lg text-mint-dark transition-colors hover:bg-muted"
        >
          미리보기
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm || confirming}
          className="flex h-[42px] items-center rounded-[14px] bg-mint-tint px-5 text-label-lg text-mint-dark transition-colors hover:bg-mint hover:text-white disabled:opacity-60"
        >
          {confirming ? "확정하는 중…" : "세트 확정하기"}
        </button>
      </FlowTopBar>
      <main className="flex flex-1 gap-6 px-8 py-6">
        <GeneratePanel
          usage={usage}
          onGenerate={onGenerate}
          generating={generating}
          errorMessage={generateError}
        />
        <QuestionList
          key={questions.length > 0 ? questions.map((q) => q.id).join(",") : "empty"}
          initial={questions}
        />
      </main>
    </div>
  );
}
