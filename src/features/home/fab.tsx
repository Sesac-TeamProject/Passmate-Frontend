import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** 누르면 할 일 — 다이얼로그를 여는 화면은 onClick, 방 만들기로 바로 가는 화면은 href */
type Props = { className?: string } & (
  { onClick: () => void; href?: never } | { href: string; onClick?: never }
);

const FAB =
  "z-40 flex size-14 items-center justify-center rounded-full bg-mint text-white shadow-[0_6px_14px] shadow-mint/35 transition-colors outline-none hover:bg-mint-dark focus-visible:ring-2 focus-visible:ring-mint-dark focus-visible:ring-offset-2";

/**
 * 우측 하단 "+ 새 방 만들기" 플로팅 버튼 (W-01 v6 · M-13) — 56px 원형 mint · 그림자 mint 35%.
 *
 * 기본은 화면에 고정(`fixed right-5 bottom-7`)이다. 폰 폭은 레이아웃의 하단 탭바(`MobileTabBar`)가
 * 뜨므로 `--mobile-tab-bar-h`만큼 더 띄운다 — 탭바 높이를 여기서도, 쓰는 화면에서도 하드코딩하지 않는다.
 * 그래서 홈(다이얼로그)과 M-13(이동) 모두 위치를 따로 넘기지 않는다.
 */
export function CreateRoomFab({ onClick, href, className }: Props) {
  const classes = cn(
    FAB,
    "fixed right-5 bottom-7 max-md:bottom-[calc(var(--mobile-tab-bar-h)+16px)]",
    className,
  );

  if (href !== undefined) {
    return (
      <Link href={href} aria-label="새 방 만들기" className={classes}>
        <Plus size={24} strokeWidth={2} aria-hidden />
      </Link>
    );
  }

  return (
    <button type="button" aria-label="새 방 만들기" onClick={onClick} className={classes}>
      <Plus size={24} strokeWidth={2} aria-hidden />
    </button>
  );
}
