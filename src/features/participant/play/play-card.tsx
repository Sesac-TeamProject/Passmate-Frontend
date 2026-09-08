"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LiveQuestion } from "@/features/host/types";
import { CHOICE_CLASS } from "@/features/host/live/choice-letter";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { remainingMs } from "@/lib/datetime";
import type { QuestionEndedPayload } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { toRevealView, type RevealView } from "./adapt";

type Props = {
  question: LiveQuestion;
  /** 객관식·OX는 고른 보기의 원문, 서술형은 입력한 텍스트 */
  onSubmit: (content: string) => void;
  submitting?: boolean;
  /** 이 문항을 이미 제출했으면 재제출을 막고 완료 상태를 보인다 */
  hasSubmitted?: boolean;
  /** 이 문항이 마감됐을 때 서버가 준 정답·해설. 다음 문항이 열리면 null로 돌아간다 */
  reveal?: Pick<QuestionEndedPayload, "answer" | "explanation"> | null;
  banner?: ReactNode;
};

/** 마감 결과 한 줄 — 내 답이 어땠는지 먼저 말한다 */
const OUTCOME_LABEL: Record<Exclude<RevealView["outcome"], "essay">, string> = {
  correct: "정답이에요!",
  wrong: "아쉬워요, 다음 문항에서 만회해요",
  missed: "시간이 끝났어요 · 제출하지 않았어요",
  submitted: "제출 완료 · 결과는 리포트에서 볼 수 있어요",
};

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** P-Web 풀이 카드 — 문항 헤더(타이머) + 선택지·서술형 입력 + 제출 */
export function PlayCard({
  question: q,
  onSubmit,
  submitting = false,
  hasSubmitted = false,
  reveal = null,
  banner,
}: Props) {
  // 고른 보기는 **순번**으로 기억한다 — 표시용 A·B·C·D 글자는 보기가 넷을 넘으면
  // 중복되므로(`CHOICE_KEYS[i] ?? "D"`) 글자로 되찾으면 다른 보기가 잡힌다(QA_BACKLOG F-5).
  const [selected, setSelected] = useState<number | null>(null);
  const [essay, setEssay] = useState("");
  const [tick, setTick] = useState(0);
  const [syncedIndex, setSyncedIndex] = useState(q.index);

  // 문항이 바뀌면(index 변경) 이전 선택·서술형 입력을 지운다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes").
  if (q.index !== syncedIndex) {
    setSyncedIndex(q.index);
    setSelected(null);
    setEssay("");
    // endsAt 이 없는 화면(랜딩 목업)의 카운트다운도 새 문항에서 처음부터 센다
    setTick(0);
  }

  // 남은 시간은 **매 초 서버 마감 시각에서 다시 계산한다.** 초를 하나씩 빼는 로컬 카운트다운은
  // 배경 탭에서 느려지고 재접속해도 다시 맞춰지지 않아, 서버가 이미 닫은 문항에 시간이 남은 것처럼
  // 보였다(시나리오 테스트 "시간이 남아 있는데 답을 낼 수 없음", 2026-09-08).
  const remaining = q.endsAt
    ? Math.round(remainingMs(q.endsAt) / 1000)
    : Math.max(0, q.remaining - tick);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => setTick((t) => t + 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  const isEssay = q.type === "essay";
  // 마감 페이로드가 오면 정답·해설을 그린다 — 다음 문항이 열릴 때까지 00:00 에 멈춘 문제만 보이던 자리
  const result = reveal ? toRevealView(reveal, q, selected, hasSubmitted) : null;
  // 시간이 다 되면 서버가 문항을 닫는다 — 눌러도 실패할 제출을 미리 막고 이유를 보인다
  const timeUp = q.endsAt !== null && remaining <= 0;
  const disabled = hasSubmitted || submitting || timeUp || result !== null;
  const content = isEssay ? essay.trim() : (q.choices[selected ?? -1]?.text ?? "");
  const canSubmit = !disabled && content.length > 0;
  const submitLabel = hasSubmitted ? "제출 완료" : timeUp ? "시간 종료" : "제출하기";

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(content);
  };

  return (
    <>
      <div className="flex h-10 items-center justify-between">
        <span className="text-label-lg text-muted-foreground">
          Q{q.index} / {q.total} · {QUESTION_TYPE_LABEL[q.type]}
        </span>
        <span className="rounded-full bg-yellow px-3 py-[5px] text-label-lg text-ink tabular-nums">
          {result ? "마감" : mmss(remaining)}
        </span>
      </div>

      {banner}

      <section className="flex flex-col gap-3.5 rounded-3xl border bg-card px-8 pt-7 pb-6">
        {/* 긴 지문도 잘리지 않게 줄바꿈을 살린다 — 카드 높이는 내용에 따라 늘어난다 */}
        <h1 className="text-heading-sm break-keep whitespace-pre-wrap text-ink">{q.prompt}</h1>

        {isEssay ? (
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={disabled}
            placeholder="답을 입력하세요"
            rows={6}
            className="w-full resize-y rounded-xl border bg-muted px-3.5 py-3 text-body-md text-ink outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:opacity-60"
          />
        ) : (
          <ol className="flex flex-col gap-3.5">
            {q.choices.map((c, i) => {
              const active = selected === i;
              const isAnswer = result?.correctIndex === i;
              // 마감 뒤에는 정답 보기를 민트로, 내가 고른 오답을 빨강으로 — 나머지는 흐리게
              const missedPick = result !== null && active && !isAnswer;
              return (
                <li key={i}>
                  <button
                    type="button"
                    aria-pressed={active}
                    disabled={disabled}
                    onClick={() => setSelected(i)}
                    className={cn(
                      // 보기 높이를 고정하면 두 줄짜리 보기가 버튼 밖으로 넘친다 —
                      // 최소 높이만 두고 글자 수에 맞춰 늘어나게 한다(시나리오 테스트, 2026-09-08)
                      "flex min-h-12 w-full items-start gap-3 rounded-xl px-3.5 py-3 text-label-lg transition-colors",
                      result === null && "disabled:opacity-60",
                      isAnswer
                        ? "bg-mint text-white"
                        : missedPick
                          ? "bg-negative-bg text-negative-soft-foreground"
                          : active && result === null
                            ? "bg-mint text-white"
                            : result !== null
                              ? "bg-muted text-ink opacity-60"
                              : "bg-muted text-ink hover:bg-mint-bg",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-px flex size-[26px] shrink-0 items-center justify-center rounded-lg text-label-lg",
                        isAnswer || (active && result === null)
                          ? "bg-card text-mint-dark"
                          : CHOICE_CLASS[c.key].solid,
                      )}
                    >
                      {c.key}
                    </span>
                    <span className="flex-1 text-left break-keep whitespace-pre-wrap">
                      {c.text}
                    </span>
                    {isAnswer ? (
                      <span className="shrink-0 text-label-md">정답</span>
                    ) : active ? (
                      <span aria-hidden>✓</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {result ? (
          <RevealBlock result={result} />
        ) : (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark disabled:opacity-50"
          >
            {submitLabel}
          </button>
        )}
      </section>
    </>
  );
}

/**
 * 마감 결과 — 정오 한 줄(서술형은 모범 답안) + 해설. 제출 버튼 자리에 들어간다.
 * 다음 문항은 서버 이벤트가 연다(자동 넘김 5초 또는 선생님의 "다음 문항") — 학생이 누를 것은 없다.
 */
function RevealBlock({ result }: { result: RevealView }) {
  const tone =
    result.outcome === "correct"
      ? "bg-mint-bg text-mint-dark"
      : result.outcome === "wrong"
        ? "bg-negative-bg text-negative-soft-foreground"
        : "bg-muted text-ink";

  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      {result.outcome === "essay" ? (
        <div className="flex flex-col gap-1.5 rounded-xl bg-mint-bg px-4 py-3">
          <span className="text-label-md text-mint-dark">모범 답안</span>
          <p className="text-body-md break-keep whitespace-pre-wrap text-ink">
            {result.modelAnswer ?? "선생님이 첨삭하면 점수가 반영돼요"}
          </p>
          {result.modelAnswer && (
            <span className="text-label-md text-muted-foreground">
              선생님이 첨삭하면 점수가 반영돼요
            </span>
          )}
        </div>
      ) : (
        <p className={cn("rounded-xl px-4 py-3 text-label-lg", tone)}>
          {OUTCOME_LABEL[result.outcome]}
        </p>
      )}

      {result.explanation && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-muted px-4 py-3">
          <span className="text-label-md text-muted-foreground">해설</span>
          <p className="text-body-md break-keep whitespace-pre-wrap text-ink">
            {result.explanation}
          </p>
        </div>
      )}

      <span className="text-center text-label-md text-muted-foreground">
        다음 문항이 열리면 바로 넘어가요
      </span>
    </div>
  );
}
