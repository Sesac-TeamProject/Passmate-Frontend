"use client";

import { useEffect, useState } from "react";

type Props = { from: number; className?: string };

/** 남은 시간(초) 카운트다운 숫자. 0에서 멈춘다. */
export function Countdown({ from, className }: Props) {
  const [remaining, setRemaining] = useState(from);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  return <span className={className}>{remaining}</span>;
}
