import { LIVE_ROOM, SESSION_REPORT } from "@/features/host/mock";
import { ReportBody } from "./report-body";
import { ReportStats } from "./report-stats";

/** W-07 방 리포트 — 내가 만든 방 › 종료 카드 › "상세 보기". 방 하나 = 세션 하나라 부제는 시안대로 "세션 리포트" */
export function ReviewPage() {
  const report = SESSION_REPORT;

  return (
    <main className="flex min-h-screen flex-col gap-4 px-8 py-[26px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-heading-lg text-ink">{report.title}</h1>
          <p className="text-body-md text-muted-foreground">{report.dateLabel} · 세션 리포트</p>
        </div>
        <button
          type="button"
          className="flex h-10 items-center rounded-[14px] bg-card px-[18px] text-label-lg text-mint-dark transition-colors hover:bg-mint-tint"
        >
          내보내기
        </button>
      </div>
      <ReportStats stats={report.stats} />
      <ReportBody report={report} students={LIVE_ROOM.students} />
    </main>
  );
}
