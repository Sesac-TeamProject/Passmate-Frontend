import { DoorOpen, Target, Trophy } from "lucide-react";
import { MobileTopBar } from "@/components/common/mobile-top-bar";
import type { LearningRecord } from "@/features/me/types";
import { ActiveSessionCard } from "./active-session-card";
import { JoinedSummaryCard, RecordStatCard } from "./record-stat-card";
import { SessionRow } from "./session-row";
import type { ActiveSession } from "./types";

type Props = {
  learning: LearningRecord;
  /** 아직 열려 있는 방 — 없으면 카드를 숨긴다 */
  activeSession: ActiveSession | null;
  /** 0부터. 서버가 오프셋 페이지로 준다 */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  /** "지난주보다 4.2%p 올랐어요" — 누적 리포트가 없으면 null */
  accuracyChangeLabel?: string | null;
};

/** W-13 참여한 방 — 참여 기록. 진행 중 방 · 통계 3장 · 보완할 주제 · 세션 목록 */
export function JoinedPage({
  learning,
  activeSession,
  page = 0,
  totalPages = 1,
  onPageChange,
  accuracyChangeLabel = null,
}: Props) {
  return (
    <main className="flex flex-col gap-5 px-9 py-7 max-md:gap-3.5 max-md:px-5 max-md:pt-3 max-md:pb-6">
      {/* 앱 M-08은 탭 루트라 뒤로가기 화살표가 없다 */}
      <MobileTopBar title="참여한 방" className="-mx-5 px-5 pb-1" />
      <h1 className="text-heading-lg text-ink max-md:hidden">참여한 방 — 참여 기록</h1>

      {activeSession && <ActiveSessionCard session={activeSession} />}

      <section className="grid grid-cols-3 gap-3.5 max-md:hidden">
        <RecordStatCard
          icon={DoorOpen}
          tone="mint"
          label="참여 세션"
          value={`${learning.stats.sessions}회`}
        />
        <RecordStatCard
          icon={Target}
          tone="blue"
          label={accuracyChangeLabel ?? "평균 정답률"}
          value={`${learning.stats.accuracy}%`}
        />
        <RecordStatCard
          icon={Trophy}
          tone="orange"
          label="평균 순위"
          value={`${learning.stats.averageRank}위`}
        />
      </section>

      {/* 폰 폭 — 앱 M-08 SummaryCard(정답률 링 + 참여 횟수·평균 순위 + 추이). PC의 3칸 통계를 대신한다 */}
      <JoinedSummaryCard
        accuracyPercent={learning.stats.accuracy}
        sessions={learning.stats.sessions}
        averageRank={learning.stats.averageRank}
        trendLabel={accuracyChangeLabel}
      />

      {/* 약한 주제가 없으면 라벨만 덩그러니 남는다 — 줄 자체를 감춘다 */}
      {learning.weakTopics.length > 0 && (
        <div className="flex items-center gap-2 max-md:flex-wrap max-md:gap-2.5">
          <span className="text-label-lg text-muted-foreground">보완할 주제</span>
          {learning.weakTopics.slice(0, 2).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-orange-soft px-3 py-1.5 text-label-lg text-orange"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-heading-sm text-ink">참여한 방 · 세션</h2>
        <ul className="flex flex-col gap-3">
          {learning.sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </ul>

        {/* 서버가 오프셋 페이지로 준다 — 한 페이지뿐이면 조작을 그리지 않는다 */}
        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 0}
              className="text-label-lg text-mint-dark disabled:text-muted-foreground"
            >
              ‹ 이전
            </button>
            <span className="text-label-lg text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page + 1 >= totalPages}
              className="text-label-lg text-mint-dark disabled:text-muted-foreground"
            >
              다음 ›
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
