import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 마스코트 "패시"의 표정·소품. 시안이 화면마다 다른 모습을 쓴다 — 눈을 감은 그림 하나로 다 그리면
 * 입장·리포트처럼 눈을 뜬 자리까지 자는 얼굴이 나간다(2026-09-16 사용자 확인).
 */
const VARIANT = {
  /** 눈 감고 말풍선 — 대기실·최종 결과(M-02 · M-05)·프로젝터 */
  sleep: { src: "/mascot/passy.png", width: 76, height: 84 },
  /** 눈 뜬 기본, 소품 없음 — W-09 명성 카드 */
  default: { src: "/mascot/passy-default.svg", width: 126, height: 139 },
  /** 눈 뜬 + 폰 — 입장·유료 방 입장(M-01 · M-11) */
  phone: { src: "/mascot/passy-phone.svg", width: 68, height: 75 },
  /** 눈 뜬 + 리포트 카드 — 내 리포트(M-06) */
  report: { src: "/mascot/passy-report.svg", width: 59, height: 57 },
  /** 눈 감은 + "PASS" 배지 — 최종 결과(M-05) */
  pass: { src: "/mascot/passy-pass.svg", width: 68, height: 75 },
} as const;

export type MascotVariant = keyof typeof VARIANT;

type Props = {
  variant?: MascotVariant;
  className?: string;
};

/** 마스코트 "패시". 프로젝터 화면 구석이나 카드 모서리에 놓인다 */
export function Mascot({ variant = "sleep", className }: Props) {
  const { src, width, height } = VARIANT[variant];

  return (
    <Image
      src={src}
      alt="패시"
      width={width}
      height={height}
      className={cn("pointer-events-none select-none", className)}
      // 11KB PNG 한 장 — 최적화 파이프라인을 거치면 첫 표시가 늦어 대기실 카드가 빈 원으로 보인다(아바타와 같은 이유)
      unoptimized
    />
  );
}
