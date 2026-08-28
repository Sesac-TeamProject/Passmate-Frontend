import { KeyValueRow } from "@/components/common/key-value-row";
import { ReputationBadge } from "@/components/common/reputation-badge";
import { StatusChip } from "@/components/common/status-chip";
import { StudentAvatar } from "@/components/common/student-avatar";
import { formatWon } from "./format";
import type { PaidRoom } from "./mock";

type Props = { room: PaidRoom };

/** 방 정보 카드 — ₩ 유료 칩 · 제목 · 선생님 명성 · 일정/인원/참가비 */
export function RoomInfoCard({ room }: Props) {
  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border bg-card px-[22px] py-5">
      <div className="flex items-center gap-2">
        <StatusChip tone="paid" size="lg">
          ₩ 유료
        </StatusChip>
        <span className="text-label-md text-muted-foreground">
          {room.topic} · {room.composition}
        </span>
      </div>

      <h2 className="text-heading-md text-ink">{room.title}</h2>

      <div className="flex flex-wrap items-center gap-2">
        <StudentAvatar avatar={room.host.avatar} size={28} />
        <span className="text-label-lg text-ink">{room.host.name} 선생님</span>
        <ReputationBadge level={room.host.level} title={room.host.levelTitle} />
        <span className="text-label-md text-muted-foreground">
          · 별점 {room.rating} · 학생 {room.students}명
        </span>
      </div>

      <div className="h-px bg-border" />

      <KeyValueRow label="일정" value={room.schedule} />
      <KeyValueRow
        label="참가 인원"
        value={`${room.capacity.current}명 참여 중 · 최대 ${room.capacity.max}명`}
      />
      <KeyValueRow label="참가비" value={`${formatWon(room.fee)} (1회 세션)`} />
    </section>
  );
}
