"use client";

import Link from "next/link";
import { type MouseEvent, type RefObject, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/common/brand-logo";
import { cn } from "@/lib/utils";
import { BUTTON, INNER } from "./styles";
import { NAV_LINKS } from "./content";

const NAV_HREFS = NAV_LINKS.map((link) => link.href);

/** 판정선을 헤더 바로 아래가 아니라 조금 더 내려 잡는다 — 섹션의 scroll-mt-20(80)보다 아래여야 클릭 직후에도 맞는다 */
const SPY_GAP = 24;

/** 판정선을 이미 지난 섹션 중 가장 마지막 것이 "지금 보고 있는" 섹션이다 (히어로 구간은 null) */
function useActiveSection(headerRef: RefObject<HTMLElement | null>): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      // 판정선은 sticky 헤더 높이에서 잰다 — 로고·메뉴가 바뀌어 헤더가 자라도 따라간다
      const line = (headerRef.current?.getBoundingClientRect().height ?? 0) + SPY_GAP;
      let current: string | null = null;
      for (const href of NAV_HREFS) {
        const section = document.getElementById(href.slice(1));
        if (section && section.getBoundingClientRect().top <= line) current = href;
      }
      // 문서 끝에 닿으면 마지막 섹션을 활성으로 둔다 — FAQ 아래(CTA·푸터)가 짧아서
      // 화면이 크면 FAQ가 판정선까지 못 올라온다
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = NAV_HREFS.at(-1) ?? current;
      setActive(current);
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headerRef]);

  return active;
}

/**
 * 섹션으로 옮기되 주소에 해시를 남기지 않는다 — 랜딩은 섹션 링크를 공유할 일이 없고,
 * 해시가 남으면 새로고침이 맨 위가 아니라 그 섹션으로 착지한다.
 * (해시를 만든 뒤 지우면 브라우저가 예약해 둔 점프까지 취소된다 — 그래서 직접 옮긴다.)
 * 섹션이 없으면 기본 동작에 맡긴다.
 */
function scrollToSection(event: MouseEvent<HTMLAnchorElement>, href: string) {
  // 새 탭·새 창으로 열려는 클릭은 브라우저에 맡긴다 (그때는 해시가 있어야 섹션으로 들어간다)
  if (event.metaKey || event.ctrlKey || event.shiftKey) return;
  const section = document.getElementById(href.slice(1));
  if (!section) return;
  event.preventDefault();
  section.scrollIntoView();
}

/** L-01 랜딩 상단 바 — 스크롤·클릭 어느 쪽으로 옮겨도 지금 보고 있는 섹션 이름을 굵게 둔다 */
export function LandingNav() {
  const headerRef = useRef<HTMLElement>(null);
  const active = useActiveSection(headerRef);

  return (
    <header ref={headerRef} className="sticky top-0 z-10 bg-card py-[18px]">
      <div className={cn(INNER, "flex items-center justify-between")}>
        <BrandLogo size="lg" />
        <nav className="flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => scrollToSection(event, link.href)}
              aria-current={active === link.href ? "true" : undefined}
              // ::after로 굵은 글자 폭을 미리 잡아 둔다 — 볼드로 바뀔 때 메뉴가 밀리지 않게
              data-label={link.label}
              className={cn(
                "text-label-lg text-muted-foreground transition-colors hover:text-ink",
                "after:invisible after:block after:h-0 after:overflow-hidden after:font-bold after:content-[attr(data-label)]",
                active === link.href && "font-bold text-ink",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className={cn(BUTTON.base, BUTTON.nav, BUTTON.outline)}>
            로그인
          </Link>
          {/* TODO: 회원가입 라우트 없음 — 로그인으로 보낸다 */}
          <Link href="/login" className={cn(BUTTON.base, BUTTON.nav, BUTTON.mint)}>
            무료로 방 열기
          </Link>
        </div>
      </div>
    </header>
  );
}
