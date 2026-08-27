import Link from "next/link";
import { Mic } from "lucide-react";
import { LIVE_QUESTION, LIVE_ROOM } from "@/features/teacher/mock";
import { QUESTION_TYPE_LABEL } from "@/features/teacher/editor/question-type-chip";
import { cn } from "@/lib/utils";
import { ChoiceLetter } from "./choice-letter";
import { Countdown } from "./countdown";
import { ProjectorShell } from "./projector-shell";

/** W-05 진행 (프로젝터 · 기본형) — 민트 배경, 문항·선택지·타이머·제출 현황·PTT */
export function LivePage() {
  const q = LIVE_QUESTION;
  const room = LIVE_ROOM;

  return (
    <ProjectorShell
      tone="mint"
      top={
        <header className="flex items-center justify-between px-10 pt-[22px] pb-2.5">
          <div className="flex items-center gap-3">
            <span className="text-heading-lg text-[#0f3d2e]">
              Q{q.index} / {q.total}
            </span>
            <span className="rounded-full bg-mint-tint px-3 py-[5px] text-label-lg text-mint-dark">
              {QUESTION_TYPE_LABEL[q.type]}
            </span>
          </div>
          <ol className="flex items-center gap-[5px]" aria-label="진행도">
            {Array.from({ length: q.total }, (_, i) => (
              <li
                key={i}
                className={cn("h-2 rounded", i < q.index ? "w-[22px] bg-yellow" : "w-2.5 bg-mint")}
              />
            ))}
          </ol>
        </header>
      }
      /* 3열 그리드: PTT 버튼을 좌우 요소 폭과 무관하게 화면 정중앙에 */
      bottomClassName="grid grid-cols-[1fr_auto_1fr] py-[18px]"
      bottom={
        <>
          <p className="flex items-center gap-2">
            <span className="text-heading-sm text-[#3f6b5b]">제출</span>
            <span className="text-heading-md text-[#0f3d2e]">
              {q.submitted} / {room.students.length}
            </span>
          </p>
          <button
            type="button"
            className="flex h-12 items-center gap-2.5 rounded-full border bg-card px-[22px] text-label-lg text-mint-dark transition-colors hover:bg-mint-bg"
          >
            <Mic className="size-4 text-mint" />
            길게 눌러 힌트 말하기
          </button>
          <div className="flex items-center gap-2.5 justify-self-end">
            <button
              type="button"
              className="flex h-[46px] items-center rounded-xl border-[1.5px] px-[18px] text-label-lg text-[#0f3d2e] transition-colors hover:bg-muted"
            >
              바로 마감
            </button>
            <Link
              href={`/teacher/rooms/${room.code}/result`}
              className="flex h-[46px] items-center rounded-xl bg-mint px-6 text-label-lg text-white transition-colors hover:bg-mint-dark"
            >
              다음 문항
            </Link>
          </div>
        </>
      }
    >
      <div className="flex flex-1 items-center">
        <section className="relative flex w-[1080px] flex-col gap-7 rounded-[28px] border bg-card px-14 pt-16 pb-11">
          <div className="absolute -top-[38px] left-1/2 flex size-[76px] -translate-x-1/2 items-center justify-center rounded-full border-[7px] border-yellow bg-card">
            <Countdown from={q.remaining} className="text-display-sm text-mint-dark" />
          </div>
          <h1 className="text-center text-display-md text-ink">{q.prompt}</h1>
          <ol className="grid grid-cols-2 gap-3.5">
            {q.choices.map((c) => (
              <li
                key={c.key}
                className="flex h-[72px] items-center gap-4 rounded-2xl bg-muted px-5 text-heading-md text-ink"
              >
                <ChoiceLetter choice={c.key} />
                {c.text}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </ProjectorShell>
  );
}
