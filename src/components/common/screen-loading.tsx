type Props = { label?: string };

/** 화면 단위 로딩 상태. 쿼리 pending·세션 복원 중에 쓴다. */
export function ScreenLoading({ label = "불러오는 중…" }: Props) {
  return (
    <div role="status" aria-live="polite" className="flex flex-1 items-center justify-center p-10">
      <p className="text-label-md text-muted-foreground">{label}</p>
    </div>
  );
}
