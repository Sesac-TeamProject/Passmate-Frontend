"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * 헤더(80px) 내용. 시안의 네 화면 모두 좌우 두 덩어리(왼쪽 상태·문항 레일 / 오른쪽 날짜·타이머·상태 라벨)라
   * 껍데기가 `justify-between`을 쥔다. 자식을 둘 넘기면 그대로 양끝으로 벌어진다.
   */
  top: ReactNode;
  children: ReactNode;
  /** 하단 액션 바 내용. 왼쪽 안내 문구 + 오른쪽 버튼 묶음이 기본 형태다 */
  bottom: ReactNode;
  /** 오른쪽 레일 펼침(300px) 내용. 넘기지 않으면 레일도 토글도 렌더하지 않는다 */
  rail?: ReactNode;
  /** 오른쪽 레일 접힘(72px) 내용. `rail`이 있을 때만 쓴다 */
  railCollapsed?: ReactNode;
};

/**
 * 프로젝터 화면(W-04·05·06·12) 공통 뼈대.
 *
 * 교실 뒤에서 3~10m 거리로 보는 화면이라 앱·웹과 규칙이 다르다(시안 "프로젝터 모드 — 디자인 규칙" 보드):
 * 흰 바탕에 카드·그림자를 쓰지 않고 헤어라인과 여백으로만 구조를 만든다.
 *
 * 기하는 시안 1440×900 기준이다:
 * - 상단 4px 민트 상태선은 레일 위까지 화면 전체를 가로지른다("레이아웃 골격" 카드 기준).
 * - 헤더 80px. 구분선은 본문 칼럼 전체를, 안쪽 내용은 콘텐츠 폭을 따른다.
 * - 본문 좌우 여백 80px. 레일을 접으면 칼럼이 넓어지지만 콘텐츠는 1080px에서 멈춘다
 *   (시안 접힘 프레임이 펼침 980 → 접힘 1080까지만 넓히고 오른쪽 여백을 208px로 남긴다).
 * - 레일은 펼침 300px / 접힘 72px, 토글은 레일 왼쪽 경계에 걸쳐 세로 중앙에 놓인다.
 *
 * 접힘 여부는 서버 상태가 아닌 순수 표시 상태라 껍데기가 직접 들고 있는다.
 */
export function ProjectorShell({ top, children, bottom, rail, railCollapsed }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const hasRail = rail !== undefined;

  return (
    <div className="relative flex min-h-screen bg-card">
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-mint" />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center border-b px-20">
          <div className="flex w-full max-w-[1080px] items-center justify-between">{top}</div>
        </header>

        <div className="flex flex-1 flex-col px-20">
          <div className="flex w-full max-w-[1080px] flex-1 flex-col">
            <main className="flex flex-1 flex-col">{children}</main>
            <footer className="flex items-center justify-between border-t pt-4 pb-8">
              {bottom}
            </footer>
          </div>
        </div>
      </div>

      {hasRail && (
        <aside
          className={cn(
            "relative shrink-0 border-l bg-surface-subtle",
            collapsed ? "w-[72px]" : "w-[300px]",
          )}
        >
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "참여자 레일 펼치기" : "참여자 레일 접기"}
            className="absolute top-1/2 left-0 z-10 flex h-[72px] w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[14px] border bg-card text-muted-foreground shadow-md transition-colors hover:text-foreground"
          >
            {collapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          {collapsed ? railCollapsed : rail}
        </aside>
      )}
    </div>
  );
}
