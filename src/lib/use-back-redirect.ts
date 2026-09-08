import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 브라우저 뒤로가기를 `href`로 보낸다.
 *
 * 대기실·진행·풀이 화면은 앞 화면(방 만들기 폼, PIN 입력)으로 돌아갈 이유가 없고, 돌아가면
 * 상태 리다이렉트가 다시 이 화면으로 튕겨 뒤로가기가 먹지 않는 것처럼 보였다. 그래서 히스토리에
 * 현재 항목을 하나 더 쌓아 뒤로가기가 그 자리에서 멈추게 하고, 그때 목록 화면으로 옮긴다
 * (시나리오 테스트 "방 생성 중 뒤로가기 · 진행 중인 방 · 세션 종료", 2026-09-08).
 */
export function useBackRedirect(href: string): void {
  const router = useRouter();

  useEffect(() => {
    window.history.pushState(window.history.state, "", window.location.href);
    const onPop = () => router.replace(href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [href, router]);
}
