import type { LiveQuestion } from "@/features/host/types";
import type { QuestionEndedPayload, VoiceHintEntry } from "@/lib/types/dto";
import type { RankChip, ScoreView } from "./adapt";
import { HintBanner } from "./hint-banner";
import { PlayCard } from "./play-card";

type Props = {
  question: LiveQuestion;
  onSubmit: (content: string) => void;
  submitting?: boolean;
  hasSubmitted?: boolean;
  /** 이 문항에 낸 답의 서버 채점 결과. 제출 응답이 없으면 null */
  score?: ScoreView | null;
  /** 폰 폭 문항 결과의 "현재 N위 ▲n". 내가 누구인지 모르면 null */
  rankChip?: RankChip | null;
  /** 이 문항의 마감 결과(정답·해설·응답 분포). 다음 문항이 열리기 전까지 카드가 결과를 보인다 */
  reveal?: Pick<QuestionEndedPayload, "answer" | "explanation" | "distribution"> | null;
  /** 선생님이 화면을 잠갔을 때 카드 위에 덮는다 */
  isLocked?: boolean;
  /** 가장 최근 음성 힌트. 없으면 배너를 보이지 않는다 */
  hint?: VoiceHintEntry | null;
  /** 제출 실패 문구(이미 제출·화면 잠김 등). 카드 아래 한 줄로 알린다 */
  errorMessage?: string | null;
  /** 머리 오른쪽 "나가기". 확인 창은 컨테이너가 띄운다 */
  onLeave?: () => void;
};

/**
 * P-Web 학생 풀이 — 데스크톱 웹 (앱과 동일한 컴포넌트, 폭 560 고정). 렌더 전용, 상태는 app/(bare)/play/[code]/page.tsx가 소유.
 * 폰 폭(768px 미만)은 흰 바탕에 화면을 세로로 채운다 — 제출 바가 화면 아래에 붙도록(앱 M-03).
 */
export function PlayPage({
  question,
  onSubmit,
  submitting = false,
  hasSubmitted = false,
  score = null,
  rankChip = null,
  reveal = null,
  isLocked = false,
  hint = null,
  errorMessage = null,
  onLeave,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 pt-9 pb-10 max-md:min-h-dvh max-md:bg-card max-md:px-5 max-md:pt-11 max-md:pb-0">
      <div className="relative flex w-full max-w-[560px] flex-col gap-4 max-md:flex-1">
        <PlayCard
          question={question}
          onSubmit={onSubmit}
          submitting={submitting}
          hasSubmitted={hasSubmitted}
          score={score}
          rankChip={rankChip}
          reveal={reveal}
          onLeave={onLeave}
          banner={
            hint && (
              <HintBanner key={hint.hintId} clipUrl={hint.audioUrl} durationMs={hint.durationMs} />
            )
          }
        />
        {errorMessage ? (
          <p
            role="alert"
            // 폰 폭은 앱 "답안 제출 실패 (M-03)"처럼 보기 아래 옅은 빨강 상자 — 아래 제출 바보다 위에 선다
            className="text-label-lg text-negative max-md:order-1 max-md:rounded-2xl max-md:bg-negative-bg max-md:px-4 max-md:py-3"
          >
            {errorMessage}
          </p>
        ) : null}

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-ink/70 text-heading-sm text-white">
            선생님이 화면을 잠갔어요
          </div>
        )}
      </div>
    </main>
  );
}
