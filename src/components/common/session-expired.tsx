import { FailureScreen } from "@/components/common/failure-screen";
import { Button } from "@/components/ui/button";

type Props = {
  onLogin: () => void;
};

/**
 * E-401 세션 만료 (design.pen "04 · 상태 · 오류 — 웹" 프레임 o4J13).
 *
 * 쓰던 도중에 세션이 끊긴 경우에만 보인다. 처음부터 미로그인이면 이 화면 없이
 * 곧장 로그인으로 보낸다 — 하던 일이 없으면 알릴 것도 없다.
 *
 * 시안에는 "작성 중이던 내용은 임시 저장돼 있어요 (문제 세트 · 방 설정 · 코멘트)"
 * 안내가 하나 더 있는데 넣지 않았다. **임시 저장이 아직 없어서 넣으면 거짓말이 된다.**
 * 로컬 저장인지 서버 초안 저장인지도 정해지지 않았다 — DESIGN_GAPS G-2 회신 대기.
 */
export function SessionExpired({ onLogin }: Props) {
  return (
    <FailureScreen
      title="로그인이 만료됐어요"
      description={
        <>
          보안을 위해 일정 시간이 지나면 자동으로 로그아웃돼요.
          <br />
          다시 로그인하면 보던 화면으로 그대로 돌아옵니다.
        </>
      }
      actions={
        <Button size="xl" className="flex-1" onClick={onLogin}>
          다시 로그인
        </Button>
      }
      footnote="이 방을 진행 중이었다면, 학생 화면은 그대로 유지되고 있어요"
    />
  );
}
