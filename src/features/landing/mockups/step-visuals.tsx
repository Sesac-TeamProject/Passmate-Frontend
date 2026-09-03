import { Check, KeyRound, Star } from "lucide-react";
import type { ReactNode } from "react";
import { StudentAvatar } from "@/components/common/student-avatar";
import { cn } from "@/lib/utils";
import type { StepVisualKey } from "../content";
import { STEP_GENERATED, STEP_PARTICIPANTS, STEP_PIN, STEP_RANKING } from "./mock-data";

/**
 * HOW 섹션(초록)의 미니 일러스트 3장 — 시안 `visual/01~03` (404×244).
 * 실제 화면을 축소한 목업이 아니라 단계를 한 장으로 요약한 그림이라 직접 그린다.
 * 초록 배경 위에 얹히므로 흰색 투명도로만 층을 나눈다.
 */

/** 카드 틀 — 반투명 흰 판 + 얇은 테두리 */
function VisualCard({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative h-[244px] w-full overflow-hidden rounded-3xl border border-white/25 bg-white/15 select-none"
    >
      {children}
    </div>
  );
}

/** 카드 안 짙은 패널 — PIN 입력·랭킹 보드 */
const PANEL = "absolute inset-x-5 rounded-2xl border border-white/20 bg-landing-green-deep/50";

/** 01 방 열기 — PIN 6칸(3+3), 앞 3칸은 입력됨 */
function PinVisual() {
  const cursorAt = STEP_PIN.findIndex((digit) => digit === null);

  return (
    <VisualCard>
      <div className={cn(PANEL, "top-5 h-[148px] px-[18px] pt-[18px]")}>
        <div className="flex items-center">
          <KeyRound aria-hidden className="size-[18px] text-mint" strokeWidth={2} />
          <span className="ml-2 text-label-md font-bold tracking-[0.1em] text-white/80">
            방 코드
          </span>
          <span className="ml-auto text-label-md text-white/80">선생님 화면에만</span>
        </div>
        <div className="mt-[18px] flex gap-4">
          {[0, 3].map((start) => (
            <div key={start} className="flex gap-2">
              {STEP_PIN.slice(start, start + 3).map((digit, index) => {
                const cursor = start + index === cursorAt;
                return (
                  <span
                    key={start + index}
                    className={cn(
                      "flex h-[66px] w-12 items-center justify-center rounded-xl",
                      digit ? "bg-card text-heading-lg text-mint-dark" : "bg-white/15",
                      cursor && "border-2 border-landing-glow",
                    )}
                  >
                    {digit ??
                      (cursor ? <span className="h-[26px] w-[3px] bg-landing-glow" /> : null)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <span className="absolute top-[186px] left-5 text-label-md text-white/80">
        입력하면 바로 입장돼요
      </span>
    </VisualCard>
  );
}

/** 02 문제 받기 — 주제 한 줄을 넣으면 문항이 채워진다 */
function GenerateVisual() {
  return (
    <VisualCard>
      <div className="absolute inset-x-5 top-5 flex h-[46px] items-center gap-3 rounded-[14px] bg-card px-[14px]">
        <Star aria-hidden className="size-4 shrink-0 text-mint" strokeWidth={2} />
        <span className="text-label-lg text-ink">Spring 트랜잭션 전파</span>
        <span className="ml-auto flex h-[30px] w-[70px] items-center justify-center rounded-[15px] bg-mint text-label-md font-bold text-white">
          생성
        </span>
      </div>
      <div className="absolute inset-x-5 top-20 flex flex-col gap-2">
        {STEP_GENERATED.map((item) => (
          <div
            key={item.prompt}
            className={cn(
              "flex h-[42px] items-center gap-2 rounded-xl px-2.5",
              item.pending ? "bg-card/35" : "bg-card",
            )}
          >
            <span
              className={cn(
                "flex h-[22px] w-[50px] shrink-0 items-center justify-center rounded-[11px] text-label-md font-bold",
                item.type === "서술형"
                  ? "bg-muted text-muted-foreground"
                  : "bg-mint-bg text-mint-dark",
              )}
            >
              {item.type}
            </span>
            <span className="truncate text-label-md font-medium text-ink">{item.prompt}</span>
            {item.pending ? (
              <span className="ml-auto flex shrink-0 gap-1 pr-1">
                <span className="size-1 rounded-full bg-muted-foreground" />
                <span className="size-1 rounded-full bg-muted-foreground" />
              </span>
            ) : (
              <Check aria-hidden className="ml-auto size-4 shrink-0 text-mint" strokeWidth={2} />
            )}
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

/** 03 같이 풀기 — 접속한 학생과 실시간 랭킹 */
function LiveVisual() {
  return (
    <VisualCard>
      <div className="absolute inset-x-5 top-4 flex items-center">
        <span className="size-2 rounded-sm bg-landing-live" />
        <span className="ml-1.5 text-label-md font-bold tracking-[0.12em] text-landing-glow">
          LIVE
        </span>
        <span className="ml-auto text-label-md text-white/80">6명 접속 중 · 4명 제출</span>
      </div>

      <div className="absolute top-[42px] left-[18px] flex items-center gap-1">
        {STEP_PARTICIPANTS.map((participant) =>
          participant.joined ? (
            <span
              key={participant.avatar}
              className="flex size-11 items-center justify-center rounded-full border-2 border-landing-glow"
            >
              <StudentAvatar avatar={participant.avatar} size={40} />
            </span>
          ) : (
            <StudentAvatar
              key={participant.avatar}
              avatar={participant.avatar}
              size={40}
              className="opacity-45"
            />
          ),
        )}
      </div>

      <div className={cn(PANEL, "top-[100px] h-[122px] rounded-[14px] px-3.5 pt-2")}>
        {STEP_RANKING.map((student, index) => (
          <div
            key={student.name}
            className={cn(
              "flex h-[34px] items-center gap-3",
              index > 0 && "border-t border-white/10",
            )}
          >
            <span
              className={cn(
                "w-3 text-label-md font-bold",
                index === 0 ? "text-landing-glow" : "text-white/80",
              )}
            >
              {index + 1}
            </span>
            <StudentAvatar avatar={student.avatar} size={22} />
            <span className="text-label-md font-bold text-white">{student.name}</span>
            <span
              className={cn(
                "ml-auto text-label-md font-bold",
                index === 0 ? "text-landing-glow" : "text-white/80",
              )}
            >
              {student.score}
            </span>
          </div>
        ))}
      </div>
    </VisualCard>
  );
}

export const STEP_VISUALS: Record<StepVisualKey, ReactNode> = {
  pin: <PinVisual />,
  generate: <GenerateVisual />,
  live: <LiveVisual />,
};
