import Image from "next/image";
import type { BadgeType } from "@/lib/types/dto";
import { cn } from "@/lib/utils";

/** 8종 뱃지 표기 — 그림이 있는 것은 svg, 없는 것은 글자 하나로 세운다 (시안 810:8800) */
const BADGE: Record<BadgeType, { label: string; art: { src: string } | { glyph: string } }> = {
  FIRST_ROOM: { label: "첫 방 개설", art: { src: "/reputation/badge-first-room.svg" } },
  ROOMS_10: { label: "방 10회 운영", art: { glyph: "10" } },
  STUDENTS_100: { label: "학생 100명", art: { src: "/reputation/badge-students-100.svg" } },
  RATING_45: { label: "평가 4.5+", art: { src: "/reputation/badge-rating-45.svg" } },
  ACTIVE_30D: { label: "30일 연속", art: { src: "/reputation/badge-streak-30.svg" } },
  RATINGS_50: { label: "평가 50개", art: { glyph: "50" } },
  FIRST_PAID_ROOM: { label: "유료 방 첫 개설", art: { glyph: "₩" } },
  AI_SETS_50: { label: "AI 세트 50개", art: { src: "/reputation/badge-ai-sets-50.svg" } },
};

/** 시안이 세우는 순서 — 획득한 것부터 왼쪽 */
const ORDER: BadgeType[] = [
  "FIRST_ROOM",
  "ROOMS_10",
  "STUDENTS_100",
  "RATING_45",
  "ACTIVE_30D",
  "RATINGS_50",
  "FIRST_PAID_ROOM",
  "AI_SETS_50",
];

type Props = {
  /** 획득한 뱃지 종류. 나머지는 잠김으로 흐리게 그린다 */
  earned: Set<BadgeType>;
};

/** W-14 뱃지 컬렉션 — 8종 중 획득한 것만 또렷하게 (시안 810:8800) */
export function BadgeCollection({ earned }: Props) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        {/* 앱(M-09)은 "내 뱃지", 웹(W-14)은 "뱃지 컬렉션" — 시안 문구를 서로 옮기지 않는다 */}
        <h2 className="text-heading-sm text-ink max-md:hidden">뱃지 컬렉션</h2>
        <h2 className="hidden text-heading-sm text-ink max-md:block">내 뱃지</h2>
        <span className="text-label-md text-ink-disabled max-md:text-label-lg max-md:text-mint-dark">
          {earned.size} / {ORDER.length}
        </span>
      </div>

      {/* 시안 810:8800 — 위 23 · 아래 15, 목록과 안내문 사이 16 / 폰(349:9808)은 사방 14 */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card px-6 pt-[23px] pb-[15px] max-md:gap-0 max-md:rounded-[20px] max-md:p-3.5">
        {/*
         * 폰은 한 줄에 4개(시안 349:9809). 고정폭 74 + wrap 으로 하면 스크롤바가 폭을 15px 먹는
         * 순간 3개로 접힌다 — 열 수를 직접 못 박는 그리드로 둬서 폭에 상관없이 4개를 지킨다.
         */}
        <ul className="flex justify-between max-md:grid max-md:grid-cols-4 max-md:gap-x-2 max-md:gap-y-3">
          {ORDER.map((type) => (
            <BadgeItem key={type} type={type} earned={earned.has(type)} />
          ))}
        </ul>
        <p className="text-label-md text-ink-disabled max-md:hidden">
          뱃지는 프로필과 방 목록 카드에 표시돼요
        </p>
      </div>
    </section>
  );
}

function BadgeItem({ type, earned }: { type: BadgeType; earned: boolean }) {
  const { label, art } = BADGE[type];

  return (
    <li className="flex w-27 flex-col items-center gap-2.5 max-md:w-auto max-md:gap-[5px]">
      <span className={cn("block size-16 max-md:size-11", !earned && "opacity-28")}>
        {"src" in art ? (
          <Image
            src={art.src}
            alt=""
            width={64}
            height={64}
            unoptimized
            className="size-16 max-md:size-11"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-mint-line bg-mint-bg text-heading-md text-mint-dark max-md:size-11 max-md:rounded-[16px] max-md:text-heading-sm max-md:font-bold">
            {art.glyph}
          </span>
        )}
      </span>
      <span
        className={cn(
          "text-center text-label-md max-md:text-label-lg",
          earned ? "text-muted-foreground max-md:text-ink" : "text-ink-disabled",
        )}
      >
        {label}
      </span>
      {/* 앱 시안은 흐린 아트와 회색 라벨로 잠김을 보여 준다 — 글자를 겹쳐 쓰지 않는다 */}
      {!earned && <span className="text-label-md text-ink-disabled max-md:hidden">잠김</span>}
    </li>
  );
}
