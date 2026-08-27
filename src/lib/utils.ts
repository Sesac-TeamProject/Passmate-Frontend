import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** 디자인 시스템 v5 타이포 10종 (globals.css --text-*). tailwind-merge가 텍스트 색과 충돌로 오인하지 않도록 font-size 그룹에 등록한다. */
const TYPOGRAPHY_STYLES = [
  "display-lg",
  "display-md",
  "display-sm",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "body-lg",
  "body-md",
  "label-lg",
  "label-md",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: TYPOGRAPHY_STYLES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
