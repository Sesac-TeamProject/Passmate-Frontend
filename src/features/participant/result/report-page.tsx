import { Mascot } from "@/components/common/mascot";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** 채점 결과 칩 — 시안은 포디움이 아니라 보기(choice) 색을 쓴다 */
const VERDICT = {
  CORRECT: { label: "정답", cls: "bg-choice-d text-choice-d-foreground" },
  WRONG: { label: "오답", cls: "bg-choice-a text-choice-a-foreground" },
  AI_ANALYZED: { label: "AI 분석", cls: "bg-choice-c text-choice-c-foreground" },
  PENDING: { label: "분석 중", cls: "bg-muted text-muted-foreground" },
  UNKNOWN: { label: "미채점", cls: "bg-muted text-muted-foreground" },
} as const;

export type ReportVerdict = keyof typeof VERDICT;
export type ReportQuestion = {
  questionId: number;
  no: number;
  title: string;
  verdict: ReportVerdict;
};
export type ReportFeedback = {
  /** 카드 머리말. 예: "Q3 · AI 분석 (참고 의견)" */
  heading: string;
  /** 분석이 아직 안 끝났으면 본문 대신 안내 한 줄만 보여 준다 */
  isPending: boolean;
  covered: string | null;
  missing: string | null;
  improvement: string | null;
  hostComment: string | null;
};

type Props = {
  roomTitle: string;
  /** 아직 채점 전이면 null */
  myRank: number | null;
  myScore: number;
  correctCount: number;
  questionCount: number;
  /** 계약의 weakTopics. 비면 행 자체를 감춘다 */
  weakTopics: string[];
  questions: ReportQuestion[];
  /** AI 분석이 붙은 문항이 없으면 null — 카드를 통째로 감춘다 */
  feedback: ReportFeedback | null;
  onBack: () => void;
};

/**
 * M-06 학생 리포트 (앱 시안 → 데스크톱 웹 이식).
 * M-05 최종 결과에서 "내 리포트 보기"로 들어온다.
 */
export function ReportPage({
  roomTitle,
  myRank,
  myScore,
  correctCount,
  questionCount,
  weakTopics,
  questions,
  feedback,
  onBack,
}: Props) {
  // 방 제목이 길어도 등수·점수는 잘리면 안 된다 — 제목만 줄이고 뒤는 항상 붙여 둔다
  const rankAndScore = `${myRank === null ? "순위 집계 중" : `${myRank}위`} · ${formatNumber(myScore)}점`;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col gap-3.5 px-5 pt-6 pb-6">
      {/* 앱 시안에는 없다 — 웹에서는 결과로 돌아갈 길이 필요해 추가했다 */}
      <button
        type="button"
        onClick={onBack}
        className="self-start text-label-lg text-muted-foreground transition-colors hover:text-foreground"
      >
        ← 결과로
      </button>

      <section className="relative flex items-center gap-4 rounded-3xl border bg-card p-5">
        <span className="flex size-[76px] shrink-0 flex-col items-center justify-center rounded-full border-[6px] border-mint bg-card">
          <span className="text-heading-md text-mint-dark">
            {correctCount}/{questionCount}
          </span>
          <span className="text-label-lg text-muted-foreground">정답</span>
        </span>

        {/* 마스코트가 앉을 자리를 비워 둔다 — 안 그러면 긴 방 제목이 그 아래로 흘러든다 */}
        <span className="flex min-w-0 flex-1 flex-col gap-[3px] pr-16">
          <span className="text-heading-lg">내 리포트</span>
          <span className="flex min-w-0 gap-1 text-label-lg text-muted-foreground">
            <span className="truncate">{roomTitle}</span>
            <span className="shrink-0">· {rankAndScore}</span>
          </span>
        </span>

        <span aria-hidden className="absolute top-7 right-5">
          <Mascot className="h-[57px] w-[52px]" />
        </span>
      </section>

      {weakTopics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-lg text-muted-foreground">보완할 주제</span>
          {weakTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-orange-soft px-3 py-1.5 text-label-lg text-orange"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {questions.length === 0 ? (
        <p className="text-label-md text-muted-foreground">문항별 결과는 채점이 끝나면 채워져요</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {questions.map((question) => (
            <li
              key={question.questionId}
              className="flex items-center gap-2.5 rounded-2xl border bg-card px-4 py-3.5"
            >
              <span className="flex h-6 w-[30px] shrink-0 items-center justify-center rounded-lg bg-muted text-label-lg text-mint-dark">
                Q{question.no}
              </span>
              <span className="min-w-0 flex-1 truncate text-label-lg">{question.title}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-[3px] text-label-lg",
                  VERDICT[question.verdict].cls,
                )}
              >
                {VERDICT[question.verdict].label}
              </span>
              {/* TODO(design): 셰브론이 가리킬 문항 상세 화면이 시안에 없다 — 아직 누를 수 없다 */}
              <span aria-hidden className="shrink-0 text-label-lg text-muted-foreground">
                ›
              </span>
            </li>
          ))}
        </ul>
      )}

      {feedback !== null && (
        <section className="overflow-hidden rounded-[20px] border bg-card">
          <h2 className="bg-mint px-4 py-[11px] text-label-lg text-white">{feedback.heading}</h2>

          {feedback.isPending ? (
            <p className="px-4 pt-3 pb-3.5 text-label-lg text-muted-foreground">
              AI가 분석 중이에요
            </p>
          ) : (
            <div className="flex flex-col gap-[9px] px-4 pt-3 pb-3.5">
              {feedback.covered !== null && (
                <Bullet tone="bg-mint-light">핵심 포함 — {feedback.covered}</Bullet>
              )}
              {feedback.missing !== null && (
                <Bullet tone="bg-yellow">부족 — {feedback.missing}</Bullet>
              )}
              {feedback.improvement !== null && (
                <Bullet tone="bg-muted-foreground">제안 — {feedback.improvement}</Bullet>
              )}
              <p className="text-label-md text-muted-foreground">
                {feedback.hostComment ?? "선생님 코멘트가 도착하면 여기에 표시돼요"}
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function Bullet({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2">
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", tone)} />
      <span className="text-label-lg">{children}</span>
    </p>
  );
}
