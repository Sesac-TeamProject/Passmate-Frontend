import { FailureScreen } from "@/components/common/failure-screen";
import { Button } from "@/components/ui/button";
import { PendingLabel } from "@/components/common/pending-label";
import { formatKrw } from "@/lib/format";
import { PAY_METHOD_LABEL, type PayMethod } from "@/lib/portone";

type Props = {
  /** 실패 사유 한 줄. 서버·포트원이 준 말을 04 보드 규칙에 맞게 다듬어 넘긴다 */
  message: string;
  amount: number;
  payMethod: PayMethod;
  onRetry: () => void;
  onChangeMethod: () => void;
  retrying: boolean;
};

/**
 * W-11e 결제 실패 (design.pen "04 · 상태 · 오류 — 웹" 프레임 u4psFS).
 *
 * 사용자가 결제창에서 스스로 취소한 경우는 여기로 오지 않는다 — 취소는 실패가 아니라
 * 되돌아온 것이라 폼 위 한 줄로 알린다. 이 화면은 승인 거절·확인 실패만 맡는다.
 */
export function PayFailed({
  message,
  amount,
  payMethod,
  onRetry,
  onChangeMethod,
  retrying,
}: Props) {
  return (
    <FailureScreen
      title="결제가 완료되지 않았어요"
      description={
        <>
          {message}
          <br />
          다른 결제 수단으로 다시 시도할 수 있어요.
        </>
      }
      note={{
        tone: "plain",
        title: `결제 금액 · ${formatKrw(amount)}`,
        detail: `수단 · ${PAY_METHOD_LABEL[payMethod]} · 포트원`,
      }}
      actions={
        <>
          <Button size="xl" className="flex-1" onClick={onRetry} disabled={retrying}>
            {retrying ? <PendingLabel>결제 중…</PendingLabel> : "다시 결제하기"}
          </Button>
          <Button size="xl" variant="outline" className="flex-1" onClick={onChangeMethod}>
            다른 결제 수단 고르기
          </Button>
        </>
      }
      footnote="금액이 빠져나갔다면 3일 안에 자동으로 취소돼요"
    />
  );
}
