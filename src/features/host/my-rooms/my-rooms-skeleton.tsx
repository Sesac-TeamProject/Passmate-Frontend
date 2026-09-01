import {
  Skeleton,
  SkeletonCard,
  SkeletonRows,
  SkeletonScreen,
  SkeletonStatRow,
  SkeletonText,
} from "@/components/common/skeleton";

/**
 * W-09 내가 만든 방 — 스켈레톤 (design.pen "07 · 로딩 · 스켈레톤" 프레임 y73NjG).
 * 시안 구성: 제목 · KPI 3칸 · 명성 배너 · 목록 5행.
 * MyRoomsPage와 같은 껍데기(px-9 py-7 · gap-6)를 써서 데이터가 오는 순간 자리가 안 튀게 한다.
 */
export function MyRoomsSkeleton() {
  return (
    <SkeletonScreen label="내가 만든 방을 불러오는 중">
      <div className="flex flex-col gap-6 px-9 py-7">
        <SkeletonCard className="gap-3 bg-mint-bg">
          <Skeleton className="h-5 w-40" />
          <Skeleton soft className="w-[52%]" />
        </SkeletonCard>

        <SkeletonStatRow count={3} />

        <div className="flex gap-4">
          <SkeletonCard className="flex-1">
            <Skeleton className="h-4 w-28" />
            <SkeletonText lines={3} soft />
          </SkeletonCard>
          <SkeletonCard className="flex-1">
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={3} soft />
          </SkeletonCard>
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32" />
          <SkeletonRows count={5} />
        </div>
      </div>
    </SkeletonScreen>
  );
}
