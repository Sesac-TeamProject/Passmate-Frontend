import Link from "next/link";
import { Mascot } from "@/components/common/mascot";
import type { LevelStatus } from "./types";

type Props = {
  status: LevelStatus;
  /** "방 운영 24회 · 평균 평가 4.6" — 있는 조각만 컨테이너가 이어 붙인다 */
  subtitle: string;
  /** 명성 상세(W-14)로 가는 링크 */
  detailHref: string;
};

/** W-09 명성 카드 — 마스코트 밴드 + 현재 레벨 + 다음 레벨까지 진행 바 (시안 806:8758) */
export function ReputationCard({ status, subtitle, detailHref }: Props) {
  return (
    <section className="flex w-85 shrink-0 flex-col overflow-hidden rounded-2xl bg-mint-bg pb-4">
      <MascotBand />

      <div className="flex flex-col items-center gap-1 px-5 pt-3">
        <h2 className="text-heading-sm text-ink">
          Lv.{status.level} {status.title}
        </h2>
        <p className="text-label-md text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex flex-col items-center gap-2 px-[50px] pt-4">
        <span className="h-2.5 w-full overflow-hidden rounded-full bg-card">
          <span
            className="block h-full rounded-full bg-mint"
            style={{ width: `${Math.min(100, Math.max(0, status.next.progress))}%` }}
          />
        </span>
        <p className="text-label-md text-mint-dark">다음 레벨까지 {status.next.progress}%</p>
      </div>

      <Link
        href={detailHref}
        className="mt-4 flex h-[34px] w-39 items-center justify-center self-center rounded-full bg-card text-label-md text-mint-dark transition-colors hover:bg-mint-tint"
      >
        내 명성 상세 정보 ›
      </Link>
    </section>
  );
}

/**
 * 카드 머리의 장식 밴드 — 마스코트 뒤로 차트·지표 조각이 떠 있다 (시안 806:8759).
 * 조각은 전부 도형이라 이미지를 쓰지 않고 토큰 색으로 그린다.
 */
function MascotBand() {
  return (
    <div aria-hidden className="relative h-[138px] w-full bg-mint-line/60">
      <div className="absolute top-[34px] left-[34px] h-[66px] w-[110px] rounded-[10px] bg-card/75">
        <span className="absolute top-2 left-[62px] h-[9px] w-[22px] rounded-[3px] bg-mint" />
        <svg viewBox="0 0 86 34" className="absolute top-5 left-3 h-[34px] w-[86px]" fill="none">
          <path
            d="M2 30L20 18L36 24L52 8L68 12L84 4"
            className="stroke-mint"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="absolute top-[30px] left-[232px] flex h-[74px] w-[82px] flex-col justify-center gap-[10px] rounded-[10px] bg-card/75 px-2.5">
        <MetricRow width="w-10" fill="bg-mint" />
        <MetricRow width="w-7" fill="bg-line-soft" />
        <MetricRow width="w-12" fill="bg-mint/45" />
      </div>

      <Mascot className="absolute top-[9px] left-[107px] h-[138px] w-[126px]" />
    </div>
  );
}

function MetricRow({ width, fill }: { width: string; fill: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 shrink-0 rounded-[3px] bg-mint-tint" />
      <span className={`h-[5px] rounded-full ${width} ${fill}`} />
    </span>
  );
}
