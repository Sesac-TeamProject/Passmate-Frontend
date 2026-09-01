import { Skeleton, SkeletonCard, SkeletonScreen, SkeletonText } from "@/components/common/skeleton";

/**
 * W-01 홈 — 스켈레톤 (design.pen "07 · 로딩 · 스켈레톤" 프레임 PbULq).
 * 시안 구성: 인사 배너 · PIN 입장 카드 · 인기 방 3장.
 * 인사 배너는 민트 배경을 그대로 두고 안의 글자만 블록으로 바꾼다 — 시안이 그렇게 그려져 있고,
 * 배경까지 회색으로 덮으면 화면이 통째로 바뀐 것처럼 보인다.
 */
export function HomeSkeleton() {
  return (
    <SkeletonScreen label="홈을 불러오는 중">
      <div className="flex flex-col gap-5 px-24 py-5">
        <SkeletonCard className="gap-3 bg-mint-bg">
          <Skeleton className="h-5 w-56" />
          <Skeleton soft className="w-[38%]" />
        </SkeletonCard>

        <SkeletonCard className="items-center gap-4 py-9">
          <Skeleton className="h-4 w-48" />
          <span className="flex gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="size-11 rounded-xl" />
            ))}
          </span>
          <Skeleton soft className="h-10 w-[46%] rounded-xl" />
          <Skeleton className="h-11 w-[46%] rounded-xl" />
        </SkeletonCard>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <SkeletonCard key={i} className="flex-1">
                <Skeleton soft className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-[72%]" />
                <SkeletonText lines={2} soft />
                <Skeleton soft className="mt-1 h-8 w-24 self-end rounded-xl" />
              </SkeletonCard>
            ))}
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
