import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/common/skeleton";

/**
 * W-07 방 리포트 — 스켈레톤 (design.pen "07 · 로딩 · 스켈레톤" 프레임 n8LEHE).
 * 시안 구성: KPI 4칸 · 좌 문항 목록 · 우 AI 패널.
 * 시안이 이 화면에 전체 스켈레톤을 붙인 이유는 "집계가 오래 걸려 빈 화면이 길게 남습니다"이다.
 *
 * 폰은 들어올 화면이 M-14 다 — 좌우 2단을 390에 밀어 넣으면 목록 130px · 패널 168px 이 되고,
 * 데이터가 오는 순간 머리글 · 제목 · KPI 2×2 · 탭 구조로 통째로 바뀐다. 폭마다 제 골격을 그린다.
 */
export function ReviewSkeleton() {
  return (
    <>
      {/* 폰 머리글은 덮지 않는다 — 제목도 뒤로 가는 길도 데이터 없이 이미 안다. 회색으로 덮으면
          집계를 기다리는 동안(이 화면이 전체 스켈레톤을 쓰는 바로 그 이유) 빠져나갈 길이 사라진다.
          "내보내기"는 리포트가 있어야 뜻이 있어 자리만 비워 둔다 — ml-auto 라 뒤늦게 떠도 제목이 안 밀린다 */}
      <header className="flex items-center gap-3 px-5 pt-14 pb-4 md:hidden">
        <Link href="/host/rooms" aria-label="내가 만든 방으로" className="text-ink">
          <ArrowLeft size={24} strokeWidth={2} aria-hidden />
        </Link>
        <h1 className="text-heading-md text-ink">방 리포트</h1>
      </header>

      <SkeletonScreen label="리포트를 불러오는 중">
        {/* 자리가 같아야 데이터가 오는 순간 튀지 않는다 — 제목·요약 띠·밑줄 탭·좌 목록/우 상세 */}
        <div className="mx-auto flex min-h-screen w-full max-w-[1136px] flex-col gap-3 px-8 pt-6 pb-7 max-md:hidden">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-6 w-64" />
              <Skeleton soft className="h-4 w-72" />
            </div>
            <div className="flex gap-2">
              <Skeleton soft className="h-8 w-16 rounded-md" />
              <Skeleton soft className="h-8 w-16 rounded-md" />
            </div>
          </div>

          {/* 요약 띠 — 평균 정답률 한 칸만 크고 나머지 다섯은 작다 */}
          <div className="flex items-start border-b pb-4">
            <div className="flex w-56 shrink-0 flex-col gap-2 pr-6">
              <Skeleton soft className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton soft className="h-1.5 w-50 rounded-full" />
            </div>
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="flex min-w-0 flex-1 flex-col gap-2 border-l border-line-soft py-1 pl-5"
              >
                <Skeleton soft className="h-3 w-[60%]" />
                <Skeleton className="h-5 w-[75%]" />
              </div>
            ))}
          </div>

          <div className="flex gap-4 border-b pb-2.5">
            <Skeleton className="h-5 w-10" />
            <Skeleton soft className="h-5 w-14" />
            <Skeleton soft className="h-5 w-14" />
          </div>

          <div className="flex flex-1 gap-6 pt-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton soft className="h-4 w-8 shrink-0" />
                  <Skeleton soft className="h-5 w-11 shrink-0 rounded" />
                  <Skeleton className="h-4 min-w-0 flex-1" />
                  <Skeleton soft className="h-1.5 w-20 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-10 shrink-0" />
                </div>
              ))}
            </div>

            <div className="flex w-[424px] shrink-0 flex-col gap-4 border-l pl-6">
              <Skeleton className="h-4 w-32" />
              <SkeletonText lines={4} soft />
              <SkeletonText lines={3} soft />
              <Skeleton className="mt-auto h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <ReviewSkeletonMobile />
      </SkeletonScreen>
    </>
  );
}

/**
 * M-14 방 리포트 — 스켈레톤 (앱). 시안에 앱 스켈레톤 프레임이 없어, 들어올 화면(M-14 개요)의
 * 실측 골격을 그대로 잡는다 — 제목 묶음 350×52 · KPI 2×2(170×68 · 간격 10) · 탭 3개 h36 ·
 * 카드. 자리가 같아야 데이터가 오는 순간 튀지 않는다.
 */
function ReviewSkeletonMobile() {
  return (
    <div className="flex flex-col gap-4 px-5 py-2 md:hidden">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-[62%]" />
        <Skeleton soft className="h-5 w-[44%]" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex h-17 flex-col justify-center gap-1.5 rounded-2xl border bg-card px-4"
          >
            <Skeleton className="h-6 w-16" />
            <Skeleton soft className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* 개요 · 문항별 · 학생별 — 첫 칸만 진하게(열릴 탭) */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-13 rounded-full" />
        <Skeleton soft className="h-9 w-[63px] rounded-full" />
        <Skeleton soft className="h-9 w-[63px] rounded-full" />
      </div>

      {/* 정답률 분포 — 구간 4줄 */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton soft className="h-3 w-14" />
        </div>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton soft className="h-3 w-14 shrink-0" />
            <Skeleton className="h-2.5 min-w-0 flex-1 rounded-full" />
            <Skeleton soft className="h-3 w-8 shrink-0" />
          </div>
        ))}
      </div>

      {/* 많이 틀린 문항 TOP 3 */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton soft className="h-3 w-12" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton soft className="h-5 w-8 shrink-0 rounded-lg" />
            <Skeleton className="h-4 min-w-0 flex-1" />
            <Skeleton soft className="h-3 w-14 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
