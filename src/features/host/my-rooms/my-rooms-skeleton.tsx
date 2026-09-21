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
 *
 * 폰은 들어올 화면이 아예 다르다(M-13) — PC 골격을 390에 밀어 넣으면 KPI 3칸·카드 2장이
 * 짜부라지고, 데이터가 오는 순간 구조가 통째로 바뀐다. 폭마다 제 화면의 골격을 그린다.
 */
export function MyRoomsSkeleton() {
  return (
    <SkeletonScreen label="내가 만든 방을 불러오는 중">
      <div className="flex flex-col gap-6 px-9 py-7 max-md:hidden">
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

      <MyRoomsSkeletonMobile />
    </SkeletonScreen>
  );
}

/**
 * M-13 내가 만든 방 — 스켈레톤 (앱) · 시안 690:8756.
 * 치수는 시안 그대로다 — 제목 120×22 · 명성 카드 350×76 · 묶음 머리글 90×26 · 방 행 350×72.
 *
 * 하단 탭바는 그리지 않는다 — 레이아웃(host/(nav))이 이미 fixed로 깔고 있어, 여기서 또 그리면
 * 두 겹이 된다. 시안이 탭바를 포함한 건 프레임 한 장으로 화면 전체를 보이려던 것뿐이다.
 *
 * 제목 오른쪽 50×18 블록도 뺐다 — M-13 본화면의 제목줄에는 오른쪽 요소가 없다. 채워질 것이
 * 없는 자리를 잡아 두면 데이터가 온 순간 그만큼 자리가 튄다(스켈레톤이 막으려던 바로 그 일).
 */
function MyRoomsSkeletonMobile() {
  return (
    <div className="flex flex-col px-5 pt-11 md:hidden">
      <Skeleton className="h-[22px] w-30" />

      {/* 명성 카드 — 엠블럼 44 · 등급 줄 120×18 · 부제 190×12 */}
      <div className="mt-6 flex h-19 items-center gap-4 rounded-2xl border bg-card px-4">
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <span className="flex flex-col gap-1.5">
          <Skeleton className="h-[18px] w-30" />
          <Skeleton soft className="h-3 w-[190px]" />
        </span>
      </div>

      {/* 진행 중 / 종료 묶음 머리글 자리 — 묶음이 몇 개일지는 아직 모른다 */}
      <Skeleton soft className="mt-6 h-[26px] w-[90px] rounded-full" />

      <div className="mt-4 flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex h-18 items-center justify-between gap-3 rounded-2xl border bg-card px-4"
          >
            <span className="flex flex-col gap-1.5">
              <Skeleton className="h-[18px] w-50" />
              <Skeleton soft className="h-3 w-[150px]" />
            </span>
            <Skeleton soft className="h-5 w-[66px] shrink-0 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
