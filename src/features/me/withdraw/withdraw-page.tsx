import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { formatNumber } from "@/lib/format";

type Props = {
  /** 보유 코인 — 안내 문구에 표시 */
  balance: number;
  confirmed: boolean;
  onConfirmedChange: (confirmed: boolean) => void;
  pending: boolean;
  onWithdraw: () => void;
};

const CONFIRM_ID = "withdraw-confirm";

/** C-02-12 회원 탈퇴 — 회색 안내 카드(삭제 항목 3개) · 정산 안내 · 확인 체크 · 취소/탈퇴하기 */
export function WithdrawPage({
  balance,
  confirmed,
  onConfirmedChange,
  pending,
  onWithdraw,
}: Props) {
  const items = [
    "참여 기록 · 뱃지 · 명성 등급",
    `보유 코인 ${formatNumber(balance)} C (환불되지 않아요)`,
    "내가 만든 방 · 문제 세트 · 방 리포트",
  ];

  return (
    <MeFormPage title="회원 탈퇴">
      <div className="flex flex-col gap-2.5 rounded-2xl bg-muted p-5">
        <p className="text-label-lg text-foreground">탈퇴하면 아래 내용이 모두 삭제돼요</p>
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="size-1.5 shrink-0 rounded-full bg-ink-disabled" aria-hidden />
              <span className="text-body-md text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-label-md text-muted-foreground">
        정산 예정 금액이 있으면 지급이 끝난 뒤 탈퇴할 수 있어요.
      </p>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id={CONFIRM_ID}
          checked={confirmed}
          onCheckedChange={(checked) => onConfirmedChange(checked)}
          className="size-5 rounded-[5px]"
        />
        <label htmlFor={CONFIRM_ID} className="cursor-pointer text-body-md text-foreground">
          위 내용을 확인했어요
        </label>
      </div>

      <div className="flex justify-end gap-2.5">
        <Button
          variant="outline"
          size="xl"
          className="bg-card text-foreground"
          nativeButton={false}
          render={<Link href="/me" />}
        >
          취소
        </Button>
        <Button
          size="xl"
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={!confirmed || pending}
          onClick={onWithdraw}
        >
          탈퇴하기
        </Button>
      </div>
    </MeFormPage>
  );
}
