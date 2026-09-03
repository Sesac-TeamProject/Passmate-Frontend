"use client";

import { useEffect, useState } from "react";

/**
 * 끊긴 뒤 이만큼 지나도 안 붙으면 오류 화면으로 넘긴다.
 * design.pen "07 · 로딩 · 스켈레톤" 규격 카드: "최소 300ms 노출 · 10초 넘으면 오류 화면(04 · 05)으로".
 */
const DISCONNECTED_GRACE_MS = 10_000;

/**
 * 실시간 연결이 "잠깐 끊김"인지 "복구 실패"인지 시간으로 가른다.
 * 그 전까지는 얇은 띠로만 알리고 화면을 갈아 끼우지 않는다 — 잠깐 끊겼다 붙는 경우가 훨씬 흔하다.
 */
export function useDisconnectedTooLong(disconnected: boolean): boolean {
  const [tooLong, setTooLong] = useState(false);
  const [synced, setSynced] = useState(disconnected);

  // 연결 상태가 바뀌면 카운트를 처음부터 다시 센다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — effect 안에서 곧바로 setState하지 않는다.
  if (disconnected !== synced) {
    setSynced(disconnected);
    setTooLong(false);
  }

  useEffect(() => {
    if (!disconnected) return;

    const timer = setTimeout(() => setTooLong(true), DISCONNECTED_GRACE_MS);
    return () => clearTimeout(timer);
  }, [disconnected]);

  return tooLong;
}
