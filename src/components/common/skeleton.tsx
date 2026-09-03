import { cn } from "@/lib/utils";

/*
 * 스켈레톤 기본 조각 (design.pen "07 · 로딩 · 스켈레톤" · card/스켈레톤 규격).
 *
 * 시안이 정한 규격:
 * - 블록 색 `--skeleton`(#E7E9EC) · 보조 `--skeleton-soft`(#F1F3F5). 민트는 절대 쓰지 않는다.
 * - 모서리: 텍스트 줄 6 · 카드는 원본과 같게 · 아바타는 원형
 * - 줄 높이: 제목 18~20 · 본문 14 · 캡션 12
 * - 폭: 실제 글자의 60~90%로 다르게, 마지막 줄은 짧게
 * - 반짝임: 묶음 하나를 1.2초에 한 번 훑는다 (`.skeleton-shimmer`, globals.css)
 *
 * 언제 쓰나 — 목록·카드·리포트처럼 들어올 구조를 아는 화면. 구조를 모르거나 한 동작을
 * 기다릴 때는 스피너, 몇 %인지 셀 수 있으면 진행 바를 쓴다. 실시간 화면(대기실·풀이·프로젝터)은
 * 스켈레톤으로 덮지 않고 상단 띠만 둔다.
 */

type SkeletonProps = {
  /** 옅은 보조 색(캡션·부제 줄). 기본은 눈이 먼저 가는 진한 블록 */
  soft?: boolean;
  className?: string;
};

/** 블록 하나. 크기·모서리는 쓰는 쪽에서 className으로 정한다. */
export function Skeleton({ soft = false, className }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "block rounded-md",
        soft ? "bg-skeleton-soft" : "bg-skeleton",
        // 명시적으로 높이를 주지 않으면 본문 한 줄(14px)로 본다
        "h-3.5",
        className,
      )}
    />
  );
}

type SkeletonTextProps = {
  /** 줄 수. 마지막 줄은 시안 규칙대로 짧게 깎는다 */
  lines?: number;
  soft?: boolean;
  className?: string;
};

/**
 * 문단 자리. 줄마다 폭을 달리해(90% → 60%) 진짜 글줄처럼 보이게 한다 —
 * 폭이 전부 같으면 표처럼 보여서 "글이 들어올 자리"로 안 읽힌다.
 */
export function SkeletonText({ lines = 2, soft = false, className }: SkeletonTextProps) {
  const widths = ["w-[90%]", "w-[78%]", "w-[84%]", "w-[70%]"];

  return (
    <span className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          soft={soft}
          className={i === lines - 1 ? "w-[58%]" : widths[i % widths.length]}
        />
      ))}
    </span>
  );
}

/**
 * 카드 자리. 시안 규칙 "카드는 원본과 같게" — 컨테이너는 제 색과 모서리를 그대로 두고
 * 안의 글자·컨트롤만 블록으로 바꾼다. 카드까지 회색으로 칠하면 화면 구조가 사라진다.
 */
export function SkeletonCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl bg-card p-5", className)}>{children}</div>
  );
}

/** KPI 가로 줄 — 카드마다 아이콘 원 + 라벨 + 값 두 줄 (W-09 · W-07 시안) */
export function SkeletonStatRow({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex gap-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} className="flex-1 flex-row items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton soft className="h-3 w-[45%]" />
            <Skeleton className="h-4 w-[70%]" />
          </span>
        </SkeletonCard>
      ))}
    </div>
  );
}

/** 목록 행 — 왼쪽 상태 칩, 가운데 제목·부제, 오른쪽 액션 버튼 자리 (W-09 · W-13 시안) */
export function SkeletonRows({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4">
          <Skeleton soft className="h-5 w-14 shrink-0 rounded-full" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-[38%]" />
            <Skeleton soft className="w-[26%]" />
          </span>
          <Skeleton soft className="h-8 w-20 shrink-0 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

type SkeletonScreenProps = {
  /** 스크린 리더가 읽을 상태 문구. 화면마다 무엇을 기다리는지 다르게 준다 */
  label?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * 스켈레톤 묶음의 바깥 껍데기. 빛줄기가 여기를 한 번에 훑고 지나간다.
 * 블록은 전부 `aria-hidden`이라, 상태는 이 껍데기 하나가 대표해서 알린다.
 */
export function SkeletonScreen({
  label = "불러오는 중",
  children,
  className,
}: SkeletonScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy
      aria-label={label}
      className={cn("skeleton-shimmer flex flex-1 flex-col", className)}
    >
      {children}
    </div>
  );
}
