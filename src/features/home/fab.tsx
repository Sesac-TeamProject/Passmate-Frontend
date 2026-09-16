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
 * 기본은 화면에 고정(`fixed right-5 bottom-7`)이다. 하단 탭이 있는 화면은 탭 위로 올려야 하므로
 * `className`으로 위치를 덮어쓴다(M-13은 `bottom-[89px]`).
 */
export function CreateRoomFab({ onClick, href, className }: Props) {
  const classes = cn(FAB, "fixed right-5 bottom-7", className);

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
