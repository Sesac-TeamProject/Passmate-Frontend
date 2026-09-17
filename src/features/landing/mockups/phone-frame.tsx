import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 앱 시안 화면 폭 — 앱 화면 컴포넌트는 이 폭으로 그린 뒤 줄인다 */
const APP_WIDTH = 390;

type Props = {
  /** 스크린리더용 설명 — 안쪽 화면은 inert라 읽히지 않는다 */
  label: string;
  children: ReactNode;
  /** 폰 화면 폭(px). 앱 화면 390을 이 폭으로 줄인다 */
  screenWidth: number;
  /** 보이는 화면 높이(px). 그 아래는 잘린다 */
  screenHeight: number;
  /** 화면을 앱 좌표(390 기준 px)로 이만큼 올려 아래쪽을 보여 준다 — 스크롤한 모습 */
  scrollY?: number;
  className?: string;
};

/**
 * 폰 랜딩(L-01m)의 앱 화면 목업 틀 — 실제 앱 화면 컴포넌트를 390 폭으로 렌더한 뒤 CSS zoom으로 줄여
 * 검은 폰 테두리 안에 담는다. 웹 화면 틀(ScreenMockup)의 폰판이다. 안쪽은 inert — 클릭·포커스 불가.
 */
export function PhoneFrame({
  label,
  children,
  screenWidth,
  screenHeight,
  scrollY = 0,
  className,
}: Props) {
  const zoom = screenWidth / APP_WIDTH;

  return (
    // break-normal · text-left: 폰 랜딩의 어절 단위 줄바꿈과 가운데 정렬이 실제 화면 배치까지 바꾸지 않게 되돌린다
    <figure
      role="img"
      aria-label={label}
      className={cn(
        "shrink-0 rounded-[40px] bg-ink p-2.5 text-left break-normal shadow-[0_20px_44px] shadow-ink/25",
        className,
      )}
    >
      {/* clip-path: 사파리는 zoom 걸린 안쪽을 overflow-hidden + 둥근 모서리로 자르지 못해 네모 화면이 틀 밖으로 보인다 */}
      <div
        className="overflow-hidden rounded-[31px] bg-card [clip-path:inset(0_round_31px)]"
        style={{ width: screenWidth, height: screenHeight }}
      >
        <div
          inert
          className="pointer-events-none select-none"
          style={{
            zoom,
            width: APP_WIDTH,
            height: screenHeight / zoom + scrollY,
            marginTop: -scrollY,
          }}
        >
          {children}
        </div>
      </div>
    </figure>
  );
}
