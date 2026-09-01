import Image from "next/image";
import { AVATAR_KEYS, type AvatarKey } from "@/lib/types/dto";
import { cn } from "@/lib/utils";

export { AVATAR_KEYS, toAvatarKey, type AvatarKey } from "@/lib/types/dto";

export const AVATAR_LABEL: Record<AvatarKey, string> = {
  cat: "고양이",
  dog: "강아지",
  bear: "곰",
  panda: "판다",
  rabbit: "토끼",
  fox: "여우",
  frog: "개구리",
  penguin: "펭귄",
  owl: "부엉이",
  tiger: "호랑이",
  raccoon: "너구리",
  dino: "공룡",
};

type Props = {
  avatar: AvatarKey;
  /** 렌더 크기(px). 원본은 132px */
  size?: number;
  className?: string;
};

/** 학생 신원 식별용 동물 아바타 (닉네임 옆에 붙는다) */
export function StudentAvatar({ avatar, size = 30, className }: Props) {
  return (
    <Image
      src={`/avatars/${avatar}.png`}
      alt={AVATAR_LABEL[avatar]}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", className)}
      // 132px PNG 12종 — 최적화 파이프라인을 거치면 개발 모드에서 늦게 떠서 원본을 그대로 쓴다
      unoptimized
    />
  );
}
