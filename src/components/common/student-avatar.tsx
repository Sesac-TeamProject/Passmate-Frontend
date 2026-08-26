import Image from "next/image";
import { cn } from "@/lib/utils";

/** design/student-teacher.pen "학생 아바타 — Avatar 세트"에서 내보낸 12종. public/avatars/<key>.png */
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
    />
  );
}
