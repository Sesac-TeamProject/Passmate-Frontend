import { DoorOpen, Target, Trophy } from "lucide-react";
import type { LearningRecord } from "@/features/me/mock";
import { ActiveSessionCard } from "./active-session-card";
import type { ActiveSession } from "./mock";
import { RecordStatCard } from "./record-stat-card";
import { SessionRow } from "./session-row";

type Props = {
  learning: LearningRecord;
  /** 진행 중 세션 — 없으면 카드를 숨긴다 */
  activeSession: ActiveSession | null;
};

/** W-13 참여한 방 — 참여 기록. 진행 중 재입장 · 통계 3장 · 보완할 주제 · 세션 목록 */
export function JoinedPage({ learning, activeSession }: Props) {
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
          label="평균 정답률"
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
      </section>
    </main>
  );
}
