import Image from "next/image";
import { cn } from "@/lib/utils";

/** design/design.pen "학생 아바타 — Avatar 세트"에서 내보낸 12종. public/avatars/<key>.png */
export const AVATAR_KEYS = [
  "cat",
  "dog",
  "bear",
  "panda",
  "rabbit",
  "fox",
  "frog",
  "penguin",
  "owl",
  "tiger",
  "raccoon",
  "dino",
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];

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

/** avatarId(1..12) → AvatarKey. 범위를 벗어나거나 없으면 1(cat)로 안전하게 접는다 */
export function avatarKeyFromId(id: number | null | undefined): AvatarKey {
  return AVATAR_KEYS[(id ?? 1) - 1] ?? "cat";
}

/** AvatarKey → avatarId(1..12) — 서버로 보낼 때 쓴다 */
export function avatarIdFromKey(key: AvatarKey): number {
  return AVATAR_KEYS.indexOf(key) + 1;
}

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
