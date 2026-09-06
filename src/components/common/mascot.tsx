import Image from "next/image";
import { cn } from "@/lib/utils";

/** 마스코트 "패시". 프로젝터 화면 구석에 놓인다. 원본 76×84 */
export function Mascot({ className }: { className?: string }) {
  return (
    <Image
      src="/mascot/passy.png"
      alt="패시"
      width={76}
      height={84}
      className={cn("pointer-events-none select-none", className)}
      // 11KB PNG 한 장 — 최적화 파이프라인을 거치면 첫 표시가 늦어 대기실 카드가 빈 원으로 보인다(아바타와 같은 이유)
      unoptimized
    />
  );
}
