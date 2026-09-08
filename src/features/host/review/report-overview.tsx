import { Podium } from "@/features/host/live/podium";
import { toPodium } from "@/features/host/live/adapt";
import { RankColumns, type FinalRankRow } from "@/features/host/live/rank-columns";

type Props = {
  title: string;
  questionTotal: number;
  /** 1위부터 순서대로. 비어 있으면 "순위에 올라온 학생이 없어요" */
  rows: FinalRankRow[];
};

/**
 * W-07 개요 탭 — 세션이 끝날 때 벽에 띄운 **최종 순위(W-12)를 그대로** 다시 보여준다.
 * 포디움·"4위부터" 목록은 프로젝터 화면과 같은 컴포넌트라 두 화면이 어긋나지 않는다.
 * 다른 점은 담기는 그릇뿐이다 — 프로젝터는 전체 화면, 여기는 리포트 카드 안이다.
 */
export function ReportOverview({ title, questionTotal, rows }: Props) {
  const { podium, rest } = toPodium(rows);

  return (
    <section className="flex flex-1 flex-col rounded-lg border bg-card px-8 py-7">
      <div className="flex items-baseline justify-between">
        <h2 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
          최종 순위
        </h2>
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
          <h3 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
            4위부터
          </h3>
          <div className="mt-3.5">
            <RankColumns rows={rest} questionTotal={questionTotal} />
          </div>
        </div>
      )}

      {rows.length === 0 && (
        <p className="mt-10 border-t pt-10 text-center text-heading-md text-muted-foreground">
          순위에 올라온 학생이 없어요
        </p>
      )}
    </section>
  );
}
