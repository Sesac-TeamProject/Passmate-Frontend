type Props = { positionSec: number; durationSec: number };

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** 선생님 음성 힌트 수신 배너 (재생 진행 표시) */
export function HintBanner({ positionSec, durationSec }: Props) {
  return (
    <div className="flex items-center gap-3 self-start rounded-2xl border bg-card py-2.5 pr-4 pl-3.5">
      <span className="flex size-[30px] items-center justify-center rounded-full bg-mint-tint text-[13px] font-black text-mint-dark">
        ♪
      </span>
      <span className="text-[13px] font-black text-ink">선생님 음성 힌트 재생 중</span>
      <span className="h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-muted">
        <span
          className="block h-full rounded-[3px] bg-mint"
          style={{ width: `${(positionSec / durationSec) * 100}%` }}
        />
      </span>
      <span className="text-[11px] font-bold text-muted-foreground">
        {mmss(positionSec)} / {mmss(durationSec)}
      </span>
    </div>
  );
}
