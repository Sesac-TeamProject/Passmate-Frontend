"use client";

import { LivePage } from "@/features/host/live/live-page";
import { LIVE_QUESTION, LIVE_ROOM } from "./mock-data";

/** 목업은 조작할 수 없다 — 진행 버튼은 아무 일도 하지 않는다 */
const noop = () => {};

/**
 * W-05 진행(프로젝터) 목업 — 목 문항으로 그리고 타이머는 시안 숫자(23)에서 멈춘다.
 * 진행 화면이 콜백을 받는 클라이언트 컴포넌트라 목업도 클라이언트 경계 안에 둔다.
 */
export function LiveMockup() {
  return (
    <div className="h-full *:min-h-full!">
      <LivePage
        question={LIVE_QUESTION}
        totalCount={LIVE_ROOM.students.length}
        isLocked={false}
        isLastQuestion={false}
        onNext={noop}
        onEndCurrent={noop}
        onEndSession={noop}
        onToggleLock={noop}
        onHint={noop}
        frozen
      />
    </div>
  );
}
