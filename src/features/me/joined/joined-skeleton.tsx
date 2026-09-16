import {
  Skeleton,
  SkeletonCard,
  SkeletonRows,
  SkeletonScreen,
  SkeletonStatRow,
} from "@/components/common/skeleton";

/**
 * W-13 참여한 방 — 스켈레톤.
 * 시안에 전용 프레임은 없지만 "화면별 로딩 방식" 표가 W-13을 전체 스켈레톤으로 지정한다.
 * PC는 JoinedPage 구성(진행 중 배너 · KPI 3칸 · 보완할 주제 칩 · 세션 목록)을 그대로 따라간다.
 * 폰 폭(768px 미만)은 실제 화면(JoinedPage)의 자리 — 상단 줄 · 요약 카드 한 장(JoinedSummaryCard) ·
 * 세션 목록 — 으로 따로 그려, 불러오는 중 → 로드 완료 사이에 모양이 튀지 않게 한다.
 */
export function JoinedSkeleton() {
  return (
    <SkeletonScreen label="참여 기록을 불러오는 중">
      <div className="flex flex-col gap-5 px-9 py-7 max-md:gap-3.5 max-md:px-5 max-md:pt-3 max-md:pb-6">
        {/* 폰 폭 — MobileTopBar("참여한 방") 자리. 탭 루트라 뒤로 화살표는 없다 */}
        <div className="hidden max-md:flex">
          <Skeleton className="h-5 w-24" />
        </div>

        <SkeletonCard className="gap-3 bg-mint-bg max-md:hidden">
          <Skeleton className="h-5 w-44" />
          <Skeleton soft className="w-[46%]" />
        </SkeletonCard>

        <SkeletonStatRow count={3} className="max-md:hidden" />

        {/* 폰 폭 — JoinedSummaryCard 한 장(정답률 링 70 + 참여 횟수·평균 순위 두 줄) */}
        <div className="hidden items-center gap-4 rounded-[20px] border bg-card px-[18px] py-4 max-md:flex">
          <Skeleton className="size-[70px] shrink-0 rounded-full" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton soft className="w-[45%]" />
          </span>
        </div>

        <SkeletonCard className="gap-3 max-md:hidden">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} soft className="h-7 w-24 rounded-full" />
            ))}
          </div>
        </SkeletonCard>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24 max-md:hidden" />
          <SkeletonRows count={3} />
        </div>
      </div>
    </SkeletonScreen>
  );
}
