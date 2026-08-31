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
    />
  );
}
