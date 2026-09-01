/**
 * W-00 첫 로딩 (웹) — design.pen "01 · 웹" 프레임 UJwK9.
 *
 * 로그인 판정이 끝나기 전 첫 페인트에만 쓴다. 이 순간은 아직 어떤 화면으로 갈지 모르므로
 * 스켈레톤을 그릴 수 없다 — 07 보드의 "구조를 모를 때는 스피너" 규칙에 해당한다.
 * 시안 구성: 로고 · 워드마크 · 진행 위치를 모르는 가는 바 · "불러오는 중".
 *
 * 스플래시가 아니라 로딩이라 일부러 시간을 끌지 않는다. 판정이 끝나면 즉시 넘어간다.
 * 락업이 세로로 쌓여 있고 아직 갈 곳이 없어 링크가 아니라서, 가로 링크형인 BrandLogo를
 * 쓰지 않고 마크를 여기서 직접 그린다.
 */
export function AppBoot() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy
      className="flex flex-1 flex-col items-center justify-center gap-3"
    >
      <span
        aria-hidden
        className="flex size-14 items-center justify-center rounded-2xl bg-mint text-display-md text-white"
      >
        P
      </span>

      <p className="text-heading-lg text-ink">패스메이트</p>

      <span aria-hidden className="mt-3 h-[3px] w-[120px] overflow-hidden rounded-full bg-border">
        <span className="block h-full w-2/5 animate-[app-boot-bar_1.2s_ease-in-out_infinite] rounded-full bg-mint" />
      </span>

      <p className="text-label-lg text-muted-foreground">불러오는 중</p>
    </div>
  );
}
