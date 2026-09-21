"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 이보다 작게는 줄이지 않는다 (그 아래는 스크롤 허용) */
  minScale?: number;
  className?: string;
};

/** 폰 폭 — Tailwind `max-md`(48rem 미만)와 같은 경계 */
const PHONE_QUERY = "(max-width: 47.999rem)";

/**
 * 자식의 자연 높이가 뷰포트보다 크면 CSS `zoom`으로 비율을 유지한 채 축소해 스크롤 없이 한 화면에 넣는다.
 * 뷰포트가 충분히 크면 1배. 로그인처럼 시안이 1440×900 한 장으로 고정된 화면에서 쓴다.
 * 폰 폭은 줄이지 않는다 — 앱 시안이 세로로 흐르는 화면이라 줄이면 글자만 작아지고 스크롤이 맞다.
 */
export function FitToViewport({ children, minScale = 0.6, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      if (window.matchMedia(PHONE_QUERY).matches) {
        setScale(1);
        return;
      }
      // getBoundingClientRect는 zoom이 적용된 크기 — DOM에 실제 적용된 배율(React 커밋 전 state가 아니라)로 나눠 자연 높이를 구한다
      const applied = Number.parseFloat(getComputedStyle(el).zoom) || 1;
      const natural = el.getBoundingClientRect().height / applied;
      if (natural === 0) return;
      setScale(
        Math.round(Math.max(minScale, Math.min(1, window.innerHeight / natural)) * 1000) / 1000,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [minScale]);

  return (
    <div ref={ref} className={className} style={{ zoom: scale }}>
      {children}
    </div>
  );
}
