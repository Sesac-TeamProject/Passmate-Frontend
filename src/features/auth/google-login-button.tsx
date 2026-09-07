"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMark } from "@/components/common/google-mark";
import { Button } from "@/components/ui/button";
import { GOOGLE_CLIENT_ID } from "@/lib/env";
import { loadGoogleId } from "@/lib/google-identity";

type Props = {
  /** GIS가 준 ID 토큰. 서버 교환은 컨테이너(login/page.tsx)가 소유한다 */
  onIdToken: (idToken: string) => void;
};

/**
 * "Google로 계속하기" 버튼 (C-01 시안 규격 유지).
 *
 * GIS는 ID 토큰을 자기 버튼으로만 내주는데 시안은 자체 디자인 버튼이다 —
 * 그래서 시안 버튼을 그대로 그리고, 그 위에 **투명한 GIS 버튼을 겹쳐** 클릭이
 * 실제로는 GIS 버튼에 닿게 한다(표준적인 우회. 프로그램적 click은 iframe이라 불가능하다).
 *
 * 클라이언트 ID가 비어 있으면(로컬에서 .env.local 미설정) 버튼을 비활성화해
 * "눌러도 아무 일도 없는" 조용한 실패를 만들지 않는다.
 */
export function GoogleLoginButton({ onIdToken }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    let disposed = false;
    loadGoogleId()
      .then((gis) => {
        if (disposed) return;
        // initialize는 재호출 가능(콜백 교체) — onIdToken이 바뀌어도 최신 클로저를 쓰게 한다
        gis.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => onIdToken(response.credential),
        });
        // renderButton은 1회만 — 다시 부르면 버튼이 겹으로 쌓인다
        if (!overlay.hasChildNodes()) {
          // 겹칠 클릭 영역을 시안 버튼 폭에 맞춘다(GIS 허용 범위 200~400px로 클램프)
          const width = Math.max(200, Math.min(400, overlay.clientWidth || 320));
          gis.renderButton(overlay, {
            type: "standard",
            size: "large",
            text: "continue_with",
            locale: "ko",
            width,
          });
        }
        setReady(true);
      })
      .catch(() => {
        // 스크립트 차단·네트워크 실패 — 버튼은 비활성 상태로 남는다(아래 disabled 참고)
      });

    return () => {
      disposed = true;
    };
  }, [onIdToken]);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="xl"
        className="w-full gap-2 bg-card"
        disabled={!ready}
        aria-busy={Boolean(GOOGLE_CLIENT_ID) && !ready}
        title={GOOGLE_CLIENT_ID ? undefined : "Google 클라이언트 ID가 설정되지 않았어요"}
      >
        <GoogleMark />
        <span className="text-label-lg text-foreground">Google로 계속하기</span>
      </Button>
      {/* 실제 클릭을 받는 투명 GIS 버튼 — 시안 버튼과 같은 자리에 겹친다 */}
      <div
        ref={overlayRef}
        aria-hidden={!ready}
        className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden opacity-[0.001]"
      />
    </div>
  );
}
