"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/** 초 → "02 : 23" */
function formatClock(sec: number): string {
  const safe = Math.max(0, sec);
  const minutes = String(Math.floor(safe / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${minutes} : ${seconds}`;
}

type Props = {
  /** 남은 시간(초). 문항이 바뀌면 key로 다시 마운트해 새 값에서 시작한다 */
  remaining: number;
  /** 이 문항의 제한 시간(초) — 막대 비율의 분모 */
  total: number;
  /** true면 세지 않고 멈춘다 (랜딩 목업) */
  paused?: boolean;
};

/**
 * W-05 타이머 — 시계 아이콘 + 남은 시간 + 줄어드는 옐로 바.
 * 시안 규칙: 상단 상태선을 시간으로 쓰지 않고 별도 타이머 모듈로 표시한다.
 */
export function Timer({ remaining, total, paused = false }: Props) {
  const [left, setLeft] = useState(remaining);

  useEffect(() => {
    if (paused || left <= 0) return;
    const id = window.setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, paused]);

  const ratio = total > 0 ? Math.min(1, Math.max(0, left / total)) : 0;

  return (
    <div className="flex w-[260px] flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <Clock aria-hidden className="size-[22px] shrink-0 text-yellow" />
        <span className="text-display-sm">{formatClock(left)}</span>
        <span className="ml-auto text-body-md text-muted-foreground">남은 시간</span>
      </div>
      <div className="h-2.5 rounded-full bg-yellow-soft">
        <div
          className="h-full rounded-full bg-yellow transition-[width] duration-1000 ease-linear"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
