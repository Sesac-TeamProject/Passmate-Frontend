import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

/**
 * 홈 우측 하단 "+ 새 방 만들기" 플로팅 버튼 (W-01 v6) — 56px 원형 mint · 그림자 mint 35%.
 * 폰 폭은 하단 탭바가 뜨므로 `--mobile-tab-bar-h`만큼 띄운다 — 탭바 높이를 여기서 하드코딩하지 않는다.
 */
export function CreateRoomFab({ onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="새 방 만들기"
      onClick={onClick}
      className="fixed right-5 bottom-7 z-40 flex size-14 items-center justify-center rounded-full bg-mint text-white shadow-[0_6px_14px] shadow-mint/35 transition-colors outline-none hover:bg-mint-dark focus-visible:ring-2 focus-visible:ring-mint-dark focus-visible:ring-offset-2 max-md:bottom-[calc(var(--mobile-tab-bar-h)+16px)]"
    >
      <Plus size={24} strokeWidth={2} aria-hidden />
    </button>
  );
}
