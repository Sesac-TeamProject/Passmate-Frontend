import { FailureScreen } from "@/components/common/failure-screen";
import { Button } from "@/components/ui/button";
import { PendingLabel } from "@/components/common/pending-label";
import { formatKrw } from "@/lib/format";

type Props = {
  /** 실패 사유 한 줄. 서버·포트원이 준 말을 04 보드 규칙에 맞게 다듬어 넘긴다 */
  message: string;
  amount: number;
  /**
   * `payment` 결제(충전·차감)가 안 됐다 / `join` 참가비는 이미 차감됐는데 입장만 실패했다(닉네임 중복 등).
   * 후자에 "결제가 완료되지 않았어요 · 3일 안에 자동 취소"라고 적으면 이미 빠진 코인이 돌아오는 줄 안다
   * (2026-09-09 시나리오 테스트 S-03)
   */
  kind?: "payment" | "join";
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
  kind = "payment",
  onRetry,
  onChangeMethod,
  retrying,
}: Props) {
  const joinOnly = kind === "join";
  return (
    <FailureScreen
      title={joinOnly ? "입장이 완료되지 않았어요" : "결제가 완료되지 않았어요"}
      description={
        <>
          {message}
          <br />
          {joinOnly
            ? "참가비는 이미 차감돼 다시 빠지지 않아요. 닉네임을 바꿔 다시 시도해 주세요."
            : "다른 결제 수단으로 다시 시도할 수 있어요."}
        </>
      }
      note={{
        tone: "plain",
        title: joinOnly
          ? `참가비 · ${formatKrw(amount)} 차감됨`
          : `결제 금액 · ${formatKrw(amount)}`,
        detail: joinOnly ? "보유 코인에서 차감 · 입장만 남았어요" : "수단 · 포트원 결제창에서 선택",
      }}
      actions={
        <>
          <Button size="xl" className="flex-1" onClick={onRetry} disabled={retrying}>
            {retrying ? (
              <PendingLabel>{joinOnly ? "입장하는 중…" : "결제 중…"}</PendingLabel>
            ) : joinOnly ? (
              "다시 입장하기"
            ) : (
              "다시 결제하기"
            )}
          </Button>
          <Button size="xl" variant="outline" className="flex-1" onClick={onChangeMethod}>
            돌아가기
          </Button>
        </>
      }
      footnote={
        joinOnly
          ? "세션 시작 전에 취소하면 차감된 코인이 전액 돌아와요"
          : "금액이 빠져나갔다면 3일 안에 자동으로 취소돼요"
      }
    />
  );
}
