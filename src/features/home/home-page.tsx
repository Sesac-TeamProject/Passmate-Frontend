import { HeroBanner } from "@/components/common/hero-banner";
import type { JoinValues } from "@/features/participant/join/join-form";
import { CreateRoomFab } from "./fab";
import type { PopularRoom } from "./types";
import { PinEntryCard } from "./pin-entry-card";
import { PopularRooms } from "./popular-rooms";

type Props = {
  /** 배너 호칭. 예: "한결" */
  name: string;
  popularRooms: PopularRoom[];
  join: {
    values: JoinValues;
    onChange: (next: JoinValues) => void;
    onSubmit: () => void;
    pending?: boolean;
    errorMessage?: string | null;
    loginHref?: string | null;
  };
  /** FAB → 새 방 만들기 모달 */
  onCreateRoom: () => void;
};

/**
 * W-01 v6 홈 — 배너 · PIN 입장 · 인기 방 · + 새 방(FAB). 렌더 전용.
 * 최근 참여한 방·내가 만든 방 요약 카드는 사용자 결정(2026-08-27)으로 홈에서 뺐다 — 사이드바 "참여한 방"·"내가 만든 방"에서 본다.
 */
export function HomePage({ name, popularRooms, join, onCreateRoom }: Props) {
  return (
    // 시안 W-01: 좌우 96 · 위 28 · 섹션 사이 24 (아래는 잘린 프레임이라 위와 맞춘다)
    <main className="flex flex-col gap-6 px-24 py-7">
      <HeroBanner
        title={`안녕하세요, ${name} 님!`}
        description="오늘도 스터디원들과 실전처럼 연습해 보세요"
      />

      <PinEntryCard
        values={join.values}
        onChange={join.onChange}
        onSubmit={join.onSubmit}
        pending={join.pending}
        errorMessage={join.errorMessage}
        loginHref={join.loginHref}
      />

      <PopularRooms rooms={popularRooms} />

      <CreateRoomFab onClick={onCreateRoom} />
    </main>
  );
}
