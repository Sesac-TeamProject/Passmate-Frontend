import { cn } from "@/lib/utils";
import { getRoute } from "@/config/routes";
import { TYPE } from "../components/typography";

type Props = {
  /** routes.ts에 등록된 path. 예: "/admin/dashboard" */
  path: string;
  /** 검색창 placeholder. 화면마다 다르다 (A-06은 캠페인 기준). */
  searchPlaceholder?: string;
  /** 우측 날짜 칩. 데이터 연동 전까지 고정값. */
  date?: string;
};

/**
 * 관리자 화면 상단바. 제목·설명은 routes.ts에서 읽는다.
 * 활자는 A-02 시안의 타입 토큰(heading-md / label-md / label-lg)을 따른다.
 */
export function AdminPageHeader({
  path,
  searchPlaceholder = "검색 (사용자 · 방 코드 · 문제 ID)",
  date = "2026-08-24",
}: Props) {
  const route = getRoute(path);
  return (
    <header className="flex w-full shrink-0 items-center gap-3 border-b border-[#e5e7eb] bg-white px-7 py-[18px]">
      <div className="flex flex-col gap-[2px]">
        <h1 className={cn("text-[#1b1733]", TYPE.headingMd)}>{route.title}</h1>
        <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{route.description}</p>
      </div>
      <input
        type="search"
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className={cn(
          "ml-1 w-[300px] rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 text-[#1b1733] placeholder:text-[#6e6a85] focus-visible:ring-2 focus-visible:ring-[#17b884] focus-visible:outline-none",
          TYPE.labelMd,
        )}
      />
      <span
        className={cn(
          "shrink-0 rounded-[6px] bg-[#f3f4f6] px-2 py-[3px] text-[#0e8a63]",
          TYPE.labelLg,
        )}
      >
        {date}
      </span>
    </header>
  );
}
