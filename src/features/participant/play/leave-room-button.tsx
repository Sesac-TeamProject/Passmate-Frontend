import { cn } from "@/lib/utils";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * 대기실·풀이 머리 오른쪽의 "나가기" 글자 버튼 — 앱 시안 M-02(701:8535) · M-03(651:8435).
 * 앱과 같이 14px 보조 글자색이다. 누를 자리가 글자보다 조금 넓도록 안쪽 여백을 주고 바깥 여백으로 상쇄한다.
 */
export function LeaveRoomButton({ onClick, disabled = false, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "-m-1 shrink-0 p-1 text-label-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60",
        className,
      )}
    >
      나가기
    </button>
  );
}
