import { AlertCircle } from "lucide-react";
import { formatPin } from "@/lib/format";
import { QuestionRail } from "./question-rail";

type Props = {
  pin: string;
  /** 1-based 현재 문항 번호 */
  current: number;
  total: number;
  onRetry: () => void;
};

/**
 * W-05e 프로젝터 연결 끊김 (design.pen "04 · 상태 · 오류 — 웹" 프레임 buK7D).
 *
 * 끊긴 뒤 07 보드 규칙("10초 넘으면 오류 화면으로")만큼 지나도 안 붙을 때만 이 화면으로 넘어간다.
 * 그 전까지는 얇은 띠(ReconnectingBanner)로만 알린다.
 *
 * 프로젝터 모드 규칙(보드 12)을 따른다 — 흰 바탕에 카드·그림자 없이 헤어라인과 여백으로만
 * 구조를 만들고, 교실 뒤에서 읽히도록 글자를 크게 쓴다.
 * ProjectorShell을 쓰지 않은 이유: 껍데기는 상단 상태선이 민트로 고정이고 본문을 1080px 왼쪽
 * 정렬로 잡는데, 이 화면은 상태선이 옐로이고 본문이 화면 가운데에 놓인다.
 */
export function ProjectorDisconnected({ pin, current, total, onRetry }: Props) {
  return (
    <div role="alert" className="relative flex min-h-screen flex-col bg-card">
      {/* 상단 상태선 — 연결됐을 때의 민트 자리에 옐로가 온다 */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-yellow" />

      <header className="flex h-20 shrink-0 items-center justify-between border-b px-20">
        <QuestionRail current={current} total={total} tone="warning" />
        <span className="text-label-lg font-bold tracking-[0.16em] text-warning-strong">
          연 결 끊 김
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-20 text-center">
        <span
          aria-hidden
          className="flex size-18 items-center justify-center rounded-full bg-warning-soft"
        >
          <AlertCircle size={34} className="text-warning" />
        </span>

        <h1 className="text-[2.75rem] leading-tight font-bold tracking-[-0.02em] text-ink">
          프로젝터 연결이 끊겼어요
        </h1>
        <p className="text-heading-md font-normal text-muted-foreground">
          학생들이 낸 답은 계속 저장되고 있어요. 다시 연결하면 이어서 진행됩니다.
        </p>

        <div className="mt-2 flex w-80 flex-col items-center gap-1 rounded-[20px] bg-background py-[18px]">
          <span className="text-label-lg font-bold tracking-[0.16em] text-muted-foreground">
            방 코드
          </span>
          <span className="text-display-lg text-ink">{formatPin(pin)}</span>
        </div>

        <p className="mt-2 text-heading-sm font-normal text-mint-dark">
          선생님 앱 리모컨(M-T2)에서는 그대로 진행할 수 있어요
        </p>
      </main>

      <footer className="mx-20 flex items-center justify-between border-t py-6">
        <p className="text-body-lg text-muted-foreground">
          같은 주소를 다시 열면 자동으로 이어집니다
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="h-13 w-45 rounded-[14px] bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark"
        >
          다시 연결
        </button>
      </footer>
    </div>
  );
}
