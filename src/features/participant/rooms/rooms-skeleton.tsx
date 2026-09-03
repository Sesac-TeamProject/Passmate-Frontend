import { Skeleton, SkeletonCard, SkeletonScreen } from "@/components/common/skeleton";

/**
 * P-Web 공개 방 목록 — 스켈레톤.
 * 07 보드의 "화면별 로딩 방식" 표에 이 화면은 없지만, 판단 기준("목록·카드처럼 들어올 구조를
 * 아는 화면")에 그대로 해당해서 스켈레톤을 쓴다. RoomsPage와 같은 3열 격자를 그린다.
 */
export function RoomsSkeleton() {
  return (
    <SkeletonScreen label="공개 방 목록을 불러오는 중">
      <div className="flex flex-col gap-5 px-20 py-7">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton soft className="w-[34%]" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton soft className="h-12 w-[520px] max-w-full rounded-xl" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} soft className="h-12 w-[84px] shrink-0 rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i} className="border">
              <Skeleton soft className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-[72%]" />
              <Skeleton soft className="w-[38%]" />
              <Skeleton soft className="mt-1 h-11 w-full rounded-xl" />
            </SkeletonCard>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
