import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LegalDocument } from "./types";

type Props = {
  document: LegalDocument;
  /** 웹 상단 탭. 지금 문서와 경로가 같은 탭을 선택 상태로 그린다 */
  tabs: readonly Pick<LegalDocument, "path" | "tabLabel">[];
  /** 폰 폭 "← 제목" 줄. 뒤로 가기 배선이 있어 컨테이너가 넘긴다 */
  mobileTopBar: ReactNode;
};

/**
 * C-04 서비스 이용약관 · C-05 개인정보 처리방침 (웹) / M-12-13 · M-12-14 (앱) 렌더 전용.
 *
 * 웹은 회색 바탕 위 탭 두 개 + 800 폭 흰 문서 카드, 폰 폭(768 미만)은 흰 바탕에 "← 제목" 줄과 본문뿐이다(탭 없음).
 * 훅이 없어 본문이 서버에서 그려진다 — Google 심사 봇이 스크립트 없이도 첫 HTML에서 읽는다.
 */
export function LegalDocumentView({ document, tabs, mobileTopBar }: Props) {
  return (
    <main className="w-full flex-1 px-5 pt-8 pb-16 max-md:bg-card max-md:pt-10 max-md:pb-12">
      <div className="mx-auto flex max-w-[800px] flex-col gap-5 max-md:gap-0">
        <nav aria-label="약관 문서" className="flex gap-2 max-md:hidden">
          {tabs.map((tab) => {
            const isCurrent = tab.path === document.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center rounded-lg px-5 text-label-lg font-bold transition-colors",
                  isCurrent
                    ? "bg-ink text-white"
                    : "border bg-card text-ink-secondary hover:text-ink",
                )}
              >
                {tab.tabLabel}
              </Link>
            );
          })}
        </nav>

        {mobileTopBar}

        <article className="rounded-2xl border bg-card px-14 pt-12 pb-14 max-md:mt-5 max-md:rounded-none max-md:border-0 max-md:p-0">
          {/* 폰 폭은 위 "← 제목" 줄이 제목을 보여 준다 — 제목 구조는 남기고 눈에서만 감춘다 */}
          <h1 className="text-heading-lg text-ink max-md:sr-only">{document.title}</h1>
          <p className="mt-2 text-label-md text-ink-disabled max-md:mt-0">
            시행일 {document.effectiveDate} · 버전 {document.version}
          </p>
          <hr className="mt-3 border-border max-md:border-line-soft" />

          <div className="mt-6 flex flex-col gap-6 max-md:mt-5 max-md:gap-5">
            {document.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-2 max-md:gap-1.5">
                <h2 className="text-heading-sm font-bold text-ink max-md:text-label-lg">
                  {section.heading}
                </h2>
                <p className="text-body-md leading-[1.7] break-keep text-ink-secondary max-md:text-label-md">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
