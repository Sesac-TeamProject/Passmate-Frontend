import type { SessionReport } from "@/features/host/types";
import type { FinalRankRow } from "@/features/host/live/rank-columns";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { ReportOverview } from "./report-overview";

type Props = {
  report: SessionReport;
  rankRows: FinalRankRow[];
};

/**
 * PDF 저장(인쇄) 전용 문서 — **개요 + 문항별을 한 장에** 담는다.
 *
 * 화면은 탭이라 한 번에 한 탭만 보이지만, 내보낸 리포트는 지금 보던 탭만 나오면 반쪽짜리다.
 * 그래서 화면에서는 `hidden`, 인쇄에서만 `print:block` 으로 나타나 두 섹션을 세로로 쌓는다.
 * 우측 상세 패널·문항 선택 같은 조작 요소는 종이에 의미가 없어 표만 간결히 그린다.
 */
export function ReportPrintDoc({ report, rankRows }: Props) {
  // 화면 표와 같은 순서 — 정답률이 낮은 문항부터
  const sorted = [...report.questions].sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

  return (
    <div className="hidden flex-col gap-6 print:flex">
      <section className="flex flex-col gap-2">
        <h2 className="text-heading-sm text-ink">개요</h2>
        <ReportOverview
          title={report.title}
          questionTotal={report.stats.questions}
          rows={rankRows}
        />
      </section>

      {/* 인쇄에서 페이지가 넘어갈 때 문항별 표 머리가 개요와 붙지 않게 새 페이지에서 시작한다 */}
      <section className="flex break-before-page flex-col gap-2">
        <h2 className="text-heading-sm text-ink">문항별</h2>
        <table className="w-full table-fixed border-collapse rounded-lg border bg-card">
          <colgroup>
            <col className="w-[64px]" />
            <col className="w-[72px]" />
            <col className="w-auto" />
            <col className="w-24" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="border-b text-label-md text-muted-foreground">
              <th scope="col" className="h-9 pl-[18px] text-left font-normal">
                문항
              </th>
              <th scope="col" className="h-9 text-left font-normal">
                유형
              </th>
              <th scope="col" className="h-9 text-left font-normal">
                문제
              </th>
              <th scope="col" className="h-9 text-left font-normal">
                정답률
              </th>
              <th scope="col" className="h-9 pr-[18px] text-left font-normal">
                오답
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((question) => (
              <tr key={question.id} className="border-b text-label-lg text-ink last:border-0">
                <td className="h-11 pl-[18px]">Q{question.index}</td>
                <td className="h-11">{QUESTION_TYPE_LABEL[question.type]}</td>
                {/* 종이에서는 잘림 없이 제목 전문을 보인다 — 표 제목이 줄임말이면 prompt 로 대체 */}
                <td className="h-11 pr-3">{question.prompt ?? question.title}</td>
                <td className="h-11">
                  {/* 서술형은 자동 채점이 없어 정답률 대신 AI 분석 건수를 보인다(화면과 같은 규칙) */}
                  {question.accuracy === undefined
                    ? question.aiCount
                      ? `AI ${question.aiCount}건`
                      : "—"
                    : `${question.accuracy}%`}
                </td>
                <td className="h-11 pr-[18px]">
                  {question.wrongCount === undefined ? "—" : `${question.wrongCount}명`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
