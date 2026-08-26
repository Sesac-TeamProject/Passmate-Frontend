import { getRoute } from "@/config/routes";

type Props = {
  /** routes.ts에 등록된 path. 예: "/admin/dashboard" */
  path: string;
  /** 검색창 placeholder. 화면마다 다르다 (A-06은 캠페인 기준). */
  searchPlaceholder?: string;
  /** 우측 날짜 칩. 데이터 연동 전까지 고정값. */
  date?: string;
};

/** 관리자 화면 상단바. 제목·설명은 routes.ts에서 읽는다. */
export function AdminPageHeader({
  path,
  searchPlaceholder = "검색 (사용자 · 방 코드 · 문제 ID)",
  date = "2026-08-24",
}: Props) {
  const route = getRoute(path);
  return (
    <header className="flex w-full shrink-0 items-center gap-3 border-b border-[#e5e7eb] bg-white px-7 py-[18px]">
      <div className="flex flex-col gap-[2px]">
        <h1 className="text-[19px] leading-[1.25] font-black text-[#1b1733]">{route.title}</h1>
        <p className="text-[11.5px] leading-[1.3] text-[#6e6a85]">{route.description}</p>
      </div>
      <div className="ml-2 flex flex-1 items-center gap-3">
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full max-w-[320px] rounded-[8px] border border-[#e5e7eb] bg-[#f3f4f6] px-3 py-2 text-[11.5px] leading-[1.2] text-[#1b1733] placeholder:text-[#6e6a85] focus-visible:ring-2 focus-visible:ring-[#17b884] focus-visible:outline-none"
        />
        <span className="shrink-0 rounded-[6px] bg-[#f3f4f6] px-2 py-[3px] text-[10px] leading-[1.2] font-bold text-[#0e8a63]">
          {date}
        </span>
      </div>
    </header>
  );
}
