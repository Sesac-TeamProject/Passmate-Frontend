import { PendingLabel } from "@/components/common/pending-label";
import { FinalRail, FinalRailMini, type HardestQuestion, type SessionSummary } from "./final-rail";
import { Podium, type PodiumEntry } from "./podium";
import { ProjectorShell } from "./projector-shell";
import { QuestionRail } from "./question-rail";
import { RankColumns, type FinalRankRow } from "./rank-columns";

export type { FinalRankRow };

type Props = {
  title: string;
  questionTotal: number;
  /** 1~3위 — 참가자가 적으면 있는 만큼(0~3자리). 비어 있으면 포디움을 그리지 않는다 */
  podium: PodiumEntry[];
  /** 포디움에 오르지 못한 나머지 순위 */
  rest: FinalRankRow[];
  summary: SessionSummary;
  accuracyByQuestion: (number | null)[];
  hardest: HardestQuestion | null;
  onExport: () => void;
  onOpenReport: () => void;
  /** 내보내기 요청 중 */
  exporting?: boolean;
};

/**
 * W-12 최종 순위 (프로젝터) — 세션이 끝나고 벽에 띄우는 마지막 화면.
 * 1~3위는 틴트 포디움, 4위부터는 2열 목록, 오른쪽 레일은 세션 요약이다.
 */
export function FinalPage({
  title,
  questionTotal,
  podium,
  rest,
  summary,
  accuracyByQuestion,
  hardest,
  onExport,
  onOpenReport,
  exporting = false,
}: Props) {
  return (
    <ProjectorShell
      rail={
        <FinalRail summary={summary} accuracyByQuestion={accuracyByQuestion} hardest={hardest} />
      }
      railCollapsed={<FinalRailMini summary={summary} accuracyByQuestion={accuracyByQuestion} />}
      railLabel="세션 요약"
      top={
        <>
          <QuestionRail current={questionTotal} total={questionTotal} completed />
          <span className="text-label-md font-bold tracking-[0.16em] text-mint-dark">
            세션 종료
          </span>
        </>
      }
      bottom={
        <>
          <p className="text-body-md text-muted-foreground">
            학생 화면에는 자기 순위와 리포트가 열려요
          </p>
          <div className="flex items-center gap-5">
            {/*
              순위 내보내기는 아직 계약이 없다(DESIGN_GAPS D-8). 눌러도 아무 일도 없던 버튼이라
              준비 중임을 밝히고 잠근다 — 방 리포트 화면의 CSV 내보내기는 그대로 쓸 수 있다
              (시나리오 테스트, 2026-09-08)
            */}
            <button
              type="button"
              onClick={onExport}
              disabled
              title="순위 내보내기는 준비 중이에요. 방 리포트에서 CSV로 받을 수 있어요"
              className="h-13 w-44 rounded-2xl border-[1.5px] text-heading-sm font-bold transition-colors hover:bg-muted disabled:opacity-60"
            >
              {exporting ? <PendingLabel>내보내는 중…</PendingLabel> : "순위 내보내기 (준비 중)"}
            </button>
            <button
              type="button"
              onClick={onOpenReport}
              className="h-13 w-44 rounded-2xl bg-mint text-heading-sm font-bold text-white transition-colors hover:bg-mint-dark"
            >
              방 리포트 보기
            </button>
          </div>
        </>
      }
    >
      <div className="mt-8 flex items-baseline justify-between">
        <h1 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
          최종 순위
        </h1>
        <p className="text-body-md text-muted-foreground">
          {title} · {questionTotal}문항
        </p>
      </div>

      {podium.length > 0 && (
        <div className="mt-10">
          <Podium entries={podium} questionTotal={questionTotal} />
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-10 border-t pt-5">
          <h2 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
            4위부터
          </h2>
          <div className="mt-3.5">
            <RankColumns rows={rest} questionTotal={questionTotal} />
          </div>
        </div>
      )}

      {podium.length === 0 && rest.length === 0 && (
        // 아무도 제출하지 않고 끝난 세션 — 비워 두면 본문 가운데가 통째로 빈다
        <p className="mt-10 border-t pt-10 text-center text-heading-md text-muted-foreground">
          순위에 올라온 학생이 없어요
        </p>
      )}
    </ProjectorShell>
  );
}
