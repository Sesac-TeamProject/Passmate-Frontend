import {
  ReportInsights,
  type ReportComparison,
  type ReportConcept,
  type ReportTrendPoint,
} from "./report-insights";
import { ReportQuestionTable, type ReportRow } from "./report-question-table";
import { ReportSummaryCard } from "./report-summary-card";

type Props = {
  roomTitle: string;
  /** "8/22 (금) · 3회차 참여 · 문항 8개" — 있는 조각만 이어 붙여 컨테이너가 만든다 */
  subtitle: string;
  correctCount: number;
  questionCount: number;
  myRank: number | null;
  participantCount: number | null;
  accuracyPercent: number;
  elapsedSeconds: number | null;
  myScore: number;
  comparison: ReportComparison | null;
  trend: ReportTrendPoint[];
  concepts: ReportConcept[];
  rows: ReportRow[];
  /** 틀린 문항이 없으면 "다시 풀기" 버튼을 감춘다 */
  wrongCount: number;
  /** 가장 약한 개념. 없으면 "복습 방 찾기" 버튼을 감춘다 */
  weakestConcept: string | null;
  onBack: () => void;
  onSavePdf: () => void;
  onRetryWrong: () => void;
  onFindReviewRoom: () => void;
  onShare: () => void;
  /** 문항 행 링크 → 문항 상세. 없으면 링크를 그리지 않는다 */
  onOpenQuestion?: (no: number) => void;
  /** 방 신고 — 시안에 없지만 학생이 마지막으로 머무는 화면이라 조용한 진입점을 남긴다 */
  onReport?: () => void;
};

/**
 * P-Web 내 리포트 (시안 787:8834) — 렌더 전용.
 * 시안 크기는 10종 타이포 토큰에 스냅한다: 18/700 제목→heading-md, 16/700 KPI→heading-sm,
 * 14/700 카드 제목→label-lg, 12.5 이하 본문·표·칩→label-md.
 */
export function ReportPage({
  roomTitle,
  subtitle,
  correctCount,
  questionCount,
  myRank,
  participantCount,
  accuracyPercent,
  elapsedSeconds,
  myScore,
  comparison,
  trend,
  concepts,
  rows,
  wrongCount,
  weakestConcept,
  onBack,
  onSavePdf,
  onRetryWrong,
  onFindReviewRoom,
  onShare,
  onOpenQuestion,
  onReport,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col gap-4 bg-background px-20 pt-[26px] pb-10">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-label-md text-muted-foreground transition-colors hover:text-foreground"
      >
        ‹ 참여한 방으로
      </button>

      <ReportSummaryCard
        roomTitle={roomTitle}
        subtitle={subtitle}
        correctCount={correctCount}
        questionCount={questionCount}
        rank={myRank}
        participantCount={participantCount}
        accuracyPercent={accuracyPercent}
        elapsedSeconds={elapsedSeconds}
        score={myScore}
        onSavePdf={onSavePdf}
      />

      <ReportInsights comparison={comparison} trend={trend} concepts={concepts} />

      <ReportQuestionTable rows={rows} onOpenQuestion={onOpenQuestion} />

      <section className="flex flex-col gap-2.5 pt-2">
        <h2 className="text-label-lg text-ink">다음에 이렇게 해보세요</h2>
        <div className="flex flex-wrap gap-4">
          {wrongCount > 0 && (
            <NextStep onClick={onRetryWrong} primary>
              틀린 {wrongCount}문항만 다시 풀기
            </NextStep>
          )}
          {weakestConcept !== null && (
            <NextStep onClick={onFindReviewRoom}>{weakestConcept} 복습 방 찾기</NextStep>
          )}
          <NextStep onClick={onShare}>리포트 공유하기</NextStep>
        </div>
      </section>

      {onReport !== undefined && (
        <button
          type="button"
          onClick={onReport}
          className="self-center text-label-md text-muted-foreground underline underline-offset-2 transition-colors hover:text-ink"
        >
          이 방 신고하기
        </button>
      )}
    </main>
  );
}

/** 하단 제안 버튼 — 첫 칸만 채운 민트, 나머지는 테두리 (시안 787:9029~9033) */
function NextStep({
  primary,
  onClick,
  children,
}: {
  primary?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "h-11 w-55 rounded-[10px] bg-mint text-label-md text-white transition-colors hover:bg-mint-dark"
          : "h-11 w-55 rounded-[10px] border bg-card text-label-md text-ink transition-colors hover:bg-muted"
      }
    >
      {children}
    </button>
  );
}
