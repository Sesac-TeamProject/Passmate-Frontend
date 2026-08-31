"use client";

import { useSyncExternalStore } from "react";
import { Input } from "@/components/ui/input";
import { getRoute } from "@/config/routes";
import { formatIsoDate } from "@/lib/format";

const DEFAULT_SEARCH_PLACEHOLDER = "검색 (사용자 · 방 코드 · 문제 ID)";

const subscribeNoop = () => () => {};
const getClientToday = () => formatIsoDate(new Date());
const getServerToday = () => null;

type Props = {
  /** routes.ts에 등록된 path. 예: "/admin/dashboard" */
  path: string;
  /** 검색창 placeholder. 화면마다 다르다 (A-06은 캠페인 기준). */
  searchPlaceholder?: string;
};

/**
 * 관리자 화면 상단바. 제목·설명은 routes.ts에서 읽는다.
 * 우측 날짜 칩은 브라우저 기준 오늘인데 SSR과 시간대가 다를 수 있어, 서버 스냅샷은 비워 두고
 * 하이드레이션 뒤 클라이언트 값으로 채운다 (useSyncExternalStore — effect 안 setState 회피).
 */
export function AdminPageHeader({ path, searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER }: Props) {
  const today = useSyncExternalStore(subscribeNoop, getClientToday, getServerToday);

  const route = getRoute(path);

  return (
    <header className="flex w-full shrink-0 items-center gap-3 border-b border-border bg-card px-7 py-[18px]">
      <div className="flex flex-col gap-[2px]">
        <h1 className="text-heading-md text-foreground">{route.title}</h1>
        <p className="text-label-md text-muted-foreground">{route.description}</p>
      </div>
      <Input
        type="search"
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="ml-1 h-auto w-[300px] rounded-[8px] bg-muted px-3 py-2 text-label-md text-foreground md:text-label-md"
      />
      {today ? (
        <span className="shrink-0 rounded-[6px] bg-muted px-2 py-[3px] text-label-lg text-primary-strong">
          {today}
        </span>
      ) : null}
    </header>
  );
}
