import { DoorOpen, Target, Trophy } from "lucide-react";
import type { LearningRecord } from "@/features/me/types";
import { ActiveSessionCard } from "./active-session-card";
import { RecordStatCard } from "./record-stat-card";
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
    <main className="flex flex-col gap-5 px-9 py-7">
      <h1 className="text-heading-lg text-ink">참여한 방 — 참여 기록</h1>

      {activeSession && <ActiveSessionCard session={activeSession} />}

      <section className="grid grid-cols-3 gap-3.5">
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

      <div className="flex items-center gap-2">
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
