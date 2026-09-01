import { Skeleton, SkeletonCard, SkeletonScreen, SkeletonText } from "@/components/common/skeleton";

/**
 * W-08 문제 세트 — 스켈레톤.
 * 시안에 전용 프레임은 없지만 "화면별 로딩 방식" 표가 W-08을 전체 스켈레톤으로 지정한다
 * (목록·카드 구조를 이미 알고 있어 자리를 그대로 그릴 수 있음).
 * SetsPage와 같은 좌 목록 + 우 패널 2열을 그린다.
 */
export function SetsSkeleton() {
  return (
    <SkeletonScreen label="문제 세트를 불러오는 중">
      <div className="flex flex-1 flex-col gap-[18px] py-7 pr-6 pl-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="flex flex-1 gap-4">
          <div className="flex min-w-0 flex-[3] flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} className="flex-row items-center gap-4">
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-[48%]" />
                  <Skeleton soft className="w-[32%]" />
                </span>
                <Skeleton soft className="h-8 w-24 shrink-0 rounded-xl" />
              </SkeletonCard>
            ))}
          </div>

          <SkeletonCard className="flex-[2] gap-4">
            <Skeleton className="h-4 w-36" />
            <div className="flex gap-2">
              <Skeleton soft className="h-6 w-20 rounded-full" />
              <Skeleton soft className="h-6 w-20 rounded-full" />
            </div>
            <SkeletonText lines={4} soft />
            <Skeleton className="mt-auto h-10 w-full rounded-xl" />
          </SkeletonCard>
        </div>
      </div>
    </SkeletonScreen>
  );
}
