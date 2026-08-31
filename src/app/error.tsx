"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ScreenError } from "@/components/common/screen-error";
import { Button } from "@/components/ui/button";

/**
 * 앱 전역 에러 경계 (Next 16 error.tsx — 클라이언트 컴포넌트여야 한다).
 * 렌더·이벤트에서 새어 나온 예외(예: 형식이 깨진 실시간 프레임)로 화면이 빈 채 멈추는 것을 막는다.
 * 재시도는 Next 16 권장 API인 retry()를 쓴다 — reset()은 다시 가져오지 않고 상태만 비운다.
 * 사용자에게는 원인 문구를 그대로 보이지 않는다(내부 메시지일 수 있어 콘솔로만 남긴다).
 */
export default function AppError({ error, retry }: { error: Error; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ScreenError
      message="화면을 여는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요"
      onRetry={retry}
    >
      <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
        홈으로
      </Button>
    </ScreenError>
  );
}
