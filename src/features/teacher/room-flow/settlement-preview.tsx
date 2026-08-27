type Props = {
  /** 참가비(원) */
  fee: number;
  /** 선생님 정산 비율 (0~1) */
  teacherShare: number;
};

function won(amount: number) {
  return `₩ ${amount.toLocaleString("ko-KR")}`;
}

/** W-02 v2 정산 미리보기 — 학생 1명 결제 시 선생님·플랫폼 배분 */
export function SettlementPreview({ fee, teacherShare }: Props) {
  const teacher = Math.round(fee * teacherShare);
  const platform = fee - teacher;
  const teacherPct = Math.round(teacherShare * 100);

  return (
    <div className="flex w-full flex-col gap-1.5 rounded-2xl bg-muted px-[18px] py-3">
      <p className="text-label-lg text-mint-dark">정산 미리보기 — 학생 1명 결제 시</p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-body-md text-muted-foreground">참가비</span>
        <span className="text-label-lg text-muted-foreground">{won(fee)}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-label-lg text-ink">선생님 정산 ({teacherPct}%)</span>
        <span className="text-heading-sm text-mint-dark">{won(teacher)}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-body-md text-muted-foreground">
          플랫폼 수수료 ({100 - teacherPct}%)
        </span>
        <span className="text-label-lg text-muted-foreground">{won(platform)}</span>
      </div>
      <p className="text-label-md text-muted-foreground">
        세션 종료 후 정산 · 매월 5일 지급 · 비율은 확정 전 예시 (§13.5)
      </p>
    </div>
  );
}
