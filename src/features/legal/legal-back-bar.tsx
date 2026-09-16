"use client";

import { useRouter } from "next/navigation";
import { MobileTopBar } from "@/components/common/mobile-top-bar";

/**
 * 폰 폭 "← 제목" 줄 (시안 M-12-13 · M-12-14). 로그인·랜딩 푸터·마이 어디서 왔든 온 곳으로 돌아간다.
 * 주소를 바로 열어 돌아갈 곳이 없으면 랜딩으로 보낸다.
 */
export function LegalBackBar({ title }: { title: string }) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return <MobileTopBar title={title} onBack={handleBack} size="base" />;
}
