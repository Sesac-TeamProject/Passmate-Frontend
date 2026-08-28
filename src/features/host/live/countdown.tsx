"use client";

import { useEffect, useState } from "react";

type Props = {
  from: number;
  className?: string;
  /** true면 세지 않고 from에서 멈춘다 (랜딩 목업) */ paused?: boolean;
};

/** 남은 시간(초) 카운트다운 숫자. 0에서 멈춘다. */
export function Countdown({ from, className, paused = false }: Props) {
  const [remaining, setRemaining] = useState(from);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, paused]);

  return <span className={className}>{remaining}</span>;
}
