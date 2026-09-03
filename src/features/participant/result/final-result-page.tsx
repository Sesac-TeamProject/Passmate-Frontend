import { MyResultCard } from "./my-result-card";
import { PodiumCard, type PodiumEntry } from "./podium-card";
import { QuestionChips } from "./question-chips";
import { RankingTable, type RankRow } from "./ranking-table";
import type { ReportComparison } from "./report-insights";
import type { ReportRow } from "./report-question-table";

type Props = {
  roomTitle: string;
  /** "최종 결과 · 8문항 · 24명 참여 · 20:00 종료" — 있는 조각만 컨테이너가 이어 붙인다 */
  subtitle: string;
  myRank: number | null;
  myScore: number;
  myCorrectCount: number;
  questionCount: number;
  /** @draft 계약 없음 */
  elapsedSeconds: number | null;
  comparison: ReportComparison | null;
  /** 1~3위. 3명이 안 되면 있는 만큼만 세운다 */
  podium: PodiumEntry[];
  /** 오른쪽 전체 순위표 */
  rankRows: RankRow[];
  /** 문항별 칩 */
  questionRows: ReportRow[];
  /** 게스트면 가입 유도 버튼과 안내 줄을 보여 준다 */
  isGuest: boolean;
  onOpenReport: () => void;
  onSignUp: () => void;
  onOpenQuestion?: (no: number) => void;
};

/**
 * P-Web 최종 결과 (시안 788:8834) — 렌더 전용.
 * 세션이 끝나면 학생이 처음 보는 화면. 왼쪽은 내 성적, 오른쪽은 전체 순위다.
 */
export function FinalResultPage({
  roomTitle,
  subtitle,
  myRank,
  myScore,
  myCorrectCount,
  questionCount,
  elapsedSeconds,
  comparison,
  podium,
  rankRows,
  questionRows,
  isGuest,
  onOpenReport,
  onSignUp,
  onOpenQuestion,
}: Props) {
  return (
    <main className="min-h-screen bg-background px-20 pt-6 pb-10">
      {/* 시안은 1440에서 본문 1280 — 폭을 묶고 남는 공간은 좌우로 나눈다 */}
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4">
        <header className="flex flex-col gap-0.5">
          <h1 className="truncate text-heading-lg text-ink">{roomTitle}</h1>
          <p className="truncate text-label-md text-muted-foreground">{subtitle}</p>
        </header>

        <div className="flex gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <PodiumCard entries={podium} />

            <MyResultCard
              rank={myRank}
              score={myScore}
              correctCount={myCorrectCount}
              questionCount={questionCount}
              elapsedSeconds={elapsedSeconds}
              comparison={comparison}
            />

            <QuestionChips rows={questionRows} onOpenQuestion={onOpenQuestion} />

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onOpenReport}
                className="h-12 w-[234px] rounded-xl bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark"
              >
                내 리포트 보기
              </button>
              {isGuest && (
                <button
                  type="button"
                  onClick={onSignUp}
                  className="h-12 w-[234px] rounded-xl border bg-card text-label-lg text-ink transition-colors hover:bg-muted"
                >
                  가입하고 이 기록 저장하기
                </button>
              )}
            </div>

            {isGuest && (
              <p className="text-label-md text-ink-disabled">
                게스트로 풀었어요 — 가입하지 않으면 이 기록은 세션이 끝나면 사라져요
              </p>
            )}
          </div>

          <RankingTable rows={rankRows} questionCount={questionCount} />
        </div>
      </div>
    </main>
  );
}
