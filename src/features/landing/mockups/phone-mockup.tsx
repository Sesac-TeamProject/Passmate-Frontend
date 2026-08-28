import { Check, Clock, Mic } from "lucide-react";
import { StudentAvatar } from "@/components/common/student-avatar";
import { CHOICE_CLASS } from "@/features/host/live/choice-letter";
import { LIVE_QUESTION } from "@/features/host/mock";
import { cn } from "@/lib/utils";

/** 흰 플로팅 칩 공통 — r16 · 그림자 (시안 float/*) */
const CHIP = "absolute flex items-center rounded-2xl bg-card shadow-[0_10px_21px] shadow-ink/15";

/**
 * 히어로 오른쪽 "stage"(600×700, 시안 1:1) — 민트 원 위에 학생 폰(M-03 풀이) + 플로팅 칩 5개.
 * 학생 앱은 웹 코드에 없어 시안대로 직접 그린다. 문항 데이터는 진행 화면과 같은 LIVE_QUESTION.
 */
export function PhoneMockup() {
  const q = LIVE_QUESTION;

  return (
    <div aria-hidden className="relative h-[700px] w-[600px] shrink-0 overflow-hidden select-none">
      <span className="absolute top-[60px] left-10 size-[520px] rounded-full bg-mint-bg" />

      {/* 폰 본체 316×660 · 화면 296×640 */}
      <div className="absolute top-5 left-[142px] h-[660px] w-[316px] rounded-[44px] bg-ink shadow-[0_24px_52px] shadow-ink/25">
        <div className="absolute inset-[10px] flex flex-col overflow-hidden rounded-[34px] bg-card pb-[18px]">
          <div className="flex flex-col gap-2 px-[15px] pt-[46px] pb-[59px]">
            <div className="flex items-center justify-between text-label-lg text-muted-foreground">
              <span>
                Q{q.index} / {q.total} · 객관식
              </span>
              <span>나가기</span>
            </div>
            <div className="flex gap-[3px]" aria-hidden>
              {Array.from({ length: q.total }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-[4.5px] rounded-[2px]",
                    i < q.index ? "w-5 bg-yellow" : "w-[9px] bg-muted",
                  )}
                />
              ))}
            </div>
          </div>

          {/* 문항 카드 — 헤더와 35px 겹치고 타이머 배지가 경계에 걸린다 */}
          <div className="-mt-[35px] px-[15px]">
            <div className="relative flex flex-col gap-2 rounded-[18px] border bg-card px-[15px] pt-[33px] pb-[17px]">
              <span className="absolute -top-[23px] left-1/2 flex size-[46px] -translate-x-1/2 items-center justify-center rounded-full border-[4.5px] border-yellow bg-card text-heading-md text-mint-dark">
                {q.remaining}
              </span>
              <p className="text-center text-heading-sm text-ink">{q.prompt}</p>
              <span className="h-[76px]" />
              {q.choices.map((c) => {
                const active = c.key === "A";
                return (
                  <div
                    key={c.key}
                    className={cn(
                      "flex h-[42px] items-center gap-2 rounded-[10px] px-2.5 text-label-lg",
                      active ? "bg-mint text-white" : "bg-muted text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-[7px] text-label-md",
                        active ? "bg-card text-mint-dark" : CHOICE_CLASS[c.key].solid,
                      )}
                    >
                      {c.key}
                    </span>
                    <span className="flex-1">{c.text}</span>
                    {active && <Check className="size-4" strokeWidth={2.5} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1" />
          <div className="px-[15px]">
            <span className="flex h-[41px] items-center justify-center rounded-xl bg-mint text-heading-sm text-white">
              제출하기
            </span>
          </div>

          {/* 선생님 음성 힌트 플레이어 — 제출 버튼 위에 떠 있다 */}
          <div className="absolute top-[528px] left-[15px] flex h-[46px] w-[266px] items-center gap-2 rounded-[14px] border bg-card py-2 pr-3 pl-2.5 shadow-[0_5px_11px] shadow-ink/15">
            <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-mint">
              <Mic className="size-3 text-white" strokeWidth={2.5} />
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-label-md text-ink">선생님 음성 힌트</span>
              <span className="h-1 w-[106px] overflow-hidden rounded-[2px] bg-muted">
                <span className="block h-full w-3/5 rounded-[2px] bg-mint" />
              </span>
            </span>
            <span className="text-label-md text-muted-foreground tabular-nums">00:03 / 00:05</span>
            <span className="flex gap-[2px]">
              <span className="h-[11px] w-[3px] rounded-[1.5px] bg-mint" />
              <span className="h-[11px] w-[3px] rounded-[1.5px] bg-mint" />
            </span>
          </div>
        </div>
      </div>

      {/* 플로팅 칩 5개 (시안 float/PIN·랭킹·타이머·첨삭·정답률) */}
      <div className={cn(CHIP, "top-[90px] left-0 gap-2 px-4 py-3")}>
        <span className="text-label-md text-muted-foreground">PIN</span>
        <span className="text-heading-md text-ink">482 913</span>
      </div>
      <div className={cn(CHIP, "top-[170px] right-0 gap-2.5 px-3.5 py-3")}>
        <span className="flex size-7 items-center justify-center rounded-[14px] bg-podium-gold text-label-md text-podium-gold-foreground">
          1
        </span>
        <StudentAvatar avatar="fox" size={28} />
        <span className="flex flex-col">
          <span className="text-label-lg text-ink">민지</span>
          <span className="text-label-md text-muted-foreground">990점 · 정답률 92%</span>
        </span>
      </div>
      <div className={cn(CHIP, "top-[320px] left-5 gap-2 rounded-full px-3.5 py-2.5")}>
        <Clock className="size-[18px] text-yellow" strokeWidth={2} />
        <span className="text-label-lg text-ink">00:23 남음</span>
      </div>
      <div className="absolute top-[490px] left-[380px] flex flex-col gap-1 rounded-2xl bg-mint px-4 py-3 shadow-[0_10px_21px] shadow-ink/20">
        <span className="text-label-md text-mint-tint">AI 첨삭</span>
        <span className="text-label-lg text-white">핵심 단어 2개가 빠졌어요 →</span>
      </div>
      <div className={cn(CHIP, "top-[540px] left-10 gap-2 px-3.5 py-2.5")}>
        <Check className="size-[18px] text-mint" strokeWidth={2} />
        <span className="text-label-lg text-ink">Q3 정답률 67%</span>
      </div>
    </div>
  );
}
