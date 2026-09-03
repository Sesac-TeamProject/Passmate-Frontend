import { FailureScreen } from "@/components/common/failure-screen";
import { Button } from "@/components/ui/button";
import { PendingLabel } from "@/components/common/pending-label";
import { FlowTopBar } from "./flow-top-bar";

type Props = {
  /** 입력한 설정 한 줄 요약. 예: "8월 4주차 Spring 스터디 · Spring 기술면접 8문항 · 무료" */
  summary: string;
  onRetry: () => void;
  onBack: () => void;
  retrying: boolean;
};

/**
 * W-02e 방 생성 실패 (design.pen "04 · 상태 · 오류 — 웹" 프레임 es1CE).
 *
 * 입력 오류(레벨 부족·검증 실패)는 여기로 오지 않는다 — 04 보드 A 규칙대로 폼 안에서
 * 한 줄로 처리한다. 이 화면은 서버·네트워크 때문에 PIN 발급이 깨진 경우만 맡는다.
 */
export function NewRoomFailed({ summary, onRetry, onBack, retrying }: Props) {
  return (
    <FailureScreen
      header={<FlowTopBar backHref="/home" title="새 방 만들기" />}
      title="방을 만들지 못했어요"
      description={
        <>
          PIN을 발급하는 중에 문제가 생겼어요.
          <br />
          다시 시도하면 대부분 해결돼요.
        </>
      }
      note={{ title: "입력한 설정은 그대로 남아 있어요", detail: summary }}
      actions={
        <>
          <Button size="xl" className="flex-1" onClick={onRetry} disabled={retrying}>
            {retrying ? <PendingLabel>만드는 중…</PendingLabel> : "다시 만들기"}
          </Button>
          <Button size="xl" variant="outline" className="flex-1" onClick={onBack}>
            설정으로 돌아가기
          </Button>
        </>
      }
    />
  );
}
