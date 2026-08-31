import type { LiveQuestion } from "@/features/host/mock";
import type { VoiceHintEntry } from "@/lib/types/dto";
import { HintBanner } from "./hint-banner";
import { PlayCard } from "./play-card";

type Props = {
  question: LiveQuestion;
  onSubmit: (content: string) => void;
  submitting?: boolean;
  hasSubmitted?: boolean;
  /** 선생님이 화면을 잠갔을 때 카드 위에 덮는다 */
  isLocked?: boolean;
  /** 가장 최근 음성 힌트. 없으면 배너를 보이지 않는다 */
  hint?: VoiceHintEntry | null;
};

/** P-Web 학생 풀이 — 데스크톱 웹 (앱과 동일한 컴포넌트, 폭 560 고정). 렌더 전용, 상태는 app/(bare)/play/[code]/page.tsx가 소유 */
export function PlayPage({
  question,
  onSubmit,
  submitting = false,
  hasSubmitted = false,
  isLocked = false,
  hint = null,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 pt-9 pb-10">
      <div className="relative flex w-full max-w-[560px] flex-col gap-4">
        <PlayCard
          question={question}
          onSubmit={onSubmit}
          submitting={submitting}
          hasSubmitted={hasSubmitted}
          banner={
            hint && (
              <HintBanner key={hint.hintId} clipUrl={hint.clipUrl} durationMs={hint.durationMs} />
            )
          }
        />

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-ink/70 text-heading-sm text-white">
            선생님이 화면을 잠갔어요
          </div>
        )}
      </div>
    </main>
  );
}
