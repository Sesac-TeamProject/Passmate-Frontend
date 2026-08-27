import { VOICE_HINT } from "@/features/participant/mock";
import { LIVE_QUESTION } from "@/features/host/mock";
import { HintBanner } from "./hint-banner";
import { PlayCard } from "./play-card";

/** P-Web 학생 풀이 — 데스크톱 웹 (앱과 동일한 컴포넌트, 폭 560 고정) */
export function PlayPage() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 pt-9 pb-10">
      <div className="flex w-full max-w-[560px] flex-col gap-4">
        <PlayCard
          question={LIVE_QUESTION}
          resultHref="/result/1"
          banner={
            <HintBanner positionSec={VOICE_HINT.positionSec} durationSec={VOICE_HINT.durationSec} />
          }
        />
      </div>
    </main>
  );
}
