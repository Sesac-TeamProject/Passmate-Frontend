"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Clock } from "lucide-react";
import { MOBILE_PRIMARY_BUTTON } from "@/components/common/mobile-action-bar";
import type { LiveQuestion } from "@/features/host/types";
import { CHOICE_CLASS } from "@/features/host/live/choice-letter";
import { QUESTION_TYPE_LABEL } from "@/features/host/editor/question-type-chip";
import { remainingMs } from "@/lib/datetime";
import type { QuestionEndedPayload } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import {
  toDistributionRows,
  toRevealView,
  toTimerProgress,
  type DistributionRow,
  type RankChip,
  type RevealView,
  type ScoreView,
} from "./adapt";
import { LeaveRoomButton } from "./leave-room-button";

type Props = {
  question: LiveQuestion;
  /** 객관식·OX는 고른 보기의 원문, 서술형은 입력한 텍스트 */
  onSubmit: (content: string) => void;
  submitting?: boolean;
  /** 이 문항을 이미 제출했으면 재제출을 막고 완료 상태를 보인다 */
  hasSubmitted?: boolean;
  /** 이 문항에 낸 답을 서버가 채점해 돌려준 점수. 응답이 없으면(새로고침 뒤 등) null — "제출 완료"로 접는다 */
  score?: ScoreView | null;
  /** 폰 폭 문항 결과(앱 M-04)의 "현재 4위 ▲1". 내가 누구인지 모르면 null — 칩을 감춘다 */
  rankChip?: RankChip | null;
  /** 이 문항이 마감됐을 때 서버가 준 정답·해설·응답 분포. 다음 문항이 열리면 null로 돌아간다 */
  reveal?: Pick<QuestionEndedPayload, "answer" | "explanation" | "distribution"> | null;
  banner?: ReactNode;
  /** 머리 오른쪽 "나가기"(앱 M-03 · M-04). 없으면(랜딩 목업 등) 그리지 않는다 */
  onLeave?: () => void;
};

/** 마감 결과 한 줄 — 내 답이 어땠는지 먼저 말한다 */
const OUTCOME_LABEL: Record<Exclude<RevealView["outcome"], "essay">, string> = {
  correct: "정답이에요!",
  wrong: "아쉬워요, 다음 문항에서 만회해요",
  missed: "시간이 끝났어요 · 제출하지 않았어요",
  submitted: "제출 완료 · 결과는 리포트에서 볼 수 있어요",
};

/** 점수 카드 배지 — 서버 채점 결과 그대로 */
const VERDICT_LABEL: Record<ScoreView["verdict"], string> = {
  correct: "정답",
  wrong: "오답",
  grading: "채점 중",
};

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** 앱 M-03 타이머 표기 — 콜론 양옆을 띄운다("00 : 23") */
const mmssSpaced = (s: number) => mmss(Math.max(0, s)).replace(":", " : ");

/**
 * P-Web 풀이 카드 — 문항 헤더(타이머) + 선택지·서술형 입력 + 제출.
 *
 * 폰 폭(768px 미만)은 앱 시안을 따른다.
 * - M-03 풀이: 머리에 "Q2 / 8 · 객관식"과 시계·진행 막대 타이머, 음성 힌트와 제출 버튼은 화면 아래에 붙는다.
 * - M-04 문항 결과: 답을 냈거나 문항이 마감되면 문제 대신 점수·정답·응답 분포를 보인다.
 *   문제 카드는 **감추기만** 한다 — 지우면 서술형에 쓰던 답안이 날아간다.
 * PC(md 이상)는 이전 배치 그대로다.
 */
export function PlayCard({
  question: q,
  onSubmit,
  submitting = false,
  hasSubmitted = false,
  score = null,
  rankChip = null,
  reveal = null,
  banner,
  onLeave,
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
  // 폰 폭은 답을 냈거나(점수 응답) 문항이 마감되면 문제 대신 결과 화면(앱 M-04)을 보인다
  const showMobileResult = score !== null || result !== null;
  const distribution = reveal && !isEssay ? toDistributionRows(reveal, q) : [];

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(content);
  };

  return (
    <>
      <div className="flex h-10 items-center justify-between max-md:hidden">
        <span className="text-label-lg text-muted-foreground">
          Q{q.index} / {q.total} · {QUESTION_TYPE_LABEL[q.type]}
        </span>
        <span className="flex items-center gap-4">
          <span className="rounded-full bg-yellow px-3 py-[5px] text-label-lg text-ink tabular-nums">
            {result ? "마감" : mmss(remaining)}
          </span>
          {onLeave && <LeaveRoomButton onClick={onLeave} />}
        </span>
      </div>

      {/* 폰 폭 머리 — 앱 M-03 "Q2 / 8 · 객관식 + 타이머 막대 · 나가기" / M-04 "Q2 / 8 · 결과 · 나가기" */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-label-lg text-ink">
            Q{q.index} / {q.total} · {showMobileResult ? "결과" : QUESTION_TYPE_LABEL[q.type]}
          </span>
          {onLeave && <LeaveRoomButton onClick={onLeave} />}
        </div>
        {showMobileResult ? (
          <div className="h-px bg-border" />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex h-[26px] items-center gap-2">
              <Clock className="size-[18px] text-yellow" strokeWidth={2} aria-hidden />
              <span className="text-heading-md text-ink tabular-nums">{mmssSpaced(remaining)}</span>
              <span className="ml-auto text-label-md text-ink-secondary">남은 시간</span>
            </div>
            <div className="h-2 overflow-hidden rounded-[4px] bg-yellow-soft">
              <div
                className="h-full rounded-[4px] bg-yellow"
                style={{ width: `${toTimerProgress(remaining, q.seconds) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/*
        음성 힌트 + 폰 폭 제출 버튼 한 묶음. 힌트는 오디오를 자동 재생하므로 **한 번만** 그린다.
        PC는 `md:contents`로 이 상자가 사라져 힌트가 원래 자리(카드 위)에 흐르고,
        폰 폭은 화면 아래에 붙는다(앱 M-03 — 힌트 바 아래 제출하기).
      */}
      <div className="max-md:sticky max-md:bottom-0 max-md:z-30 max-md:order-2 max-md:-mx-5 max-md:mt-auto max-md:flex max-md:flex-col max-md:gap-3 max-md:bg-card max-md:px-5 max-md:pt-3 max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:contents">
        {banner}
        {!showMobileResult && (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(MOBILE_PRIMARY_BUTTON, "md:hidden")}
          >
            {submitLabel}
          </button>
        )}
      </div>

      <section
        className={cn(
          "flex flex-col gap-3.5 rounded-3xl border bg-card px-8 pt-7 pb-6 max-md:order-1 max-md:gap-3 max-md:px-5 max-md:pt-11 max-md:pb-[22px]",
          showMobileResult && "max-md:hidden",
        )}
      >
        {/* 긴 지문도 잘리지 않게 줄바꿈을 살린다 — 카드 높이는 내용에 따라 늘어난다 */}
        <h1 className="text-heading-sm break-keep whitespace-pre-wrap text-ink max-md:mb-6 max-md:text-center max-md:text-heading-md">
          {q.prompt}
        </h1>

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
          <ol className="flex flex-col gap-3.5 max-md:gap-3">
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
                      "flex min-h-12 w-full items-start gap-3 rounded-xl px-3.5 py-3 text-label-lg transition-colors max-md:min-h-14 max-md:items-center max-md:rounded-[14px] max-md:text-heading-sm",
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
                        "mt-px flex size-[26px] shrink-0 items-center justify-center rounded-lg text-label-lg max-md:mt-0 max-md:size-[30px] max-md:rounded-[10px]",
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

        {/* 점수 카드는 제출 직후부터 다음 문항이 열릴 때까지 — 마감되면 그 아래에 정답·해설이 붙는다 */}
        {score && <ScoreCard score={score} />}

        {result ? (
          <RevealBlock result={result} showOutcome={score === null} />
        ) : score ? (
          <span className="text-center text-label-md text-muted-foreground">
            정답과 해설은 문항이 마감되면 보여요
          </span>
        ) : (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="flex h-[50px] items-center justify-center rounded-[14px] bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark disabled:opacity-50 max-md:hidden"
          >
            {submitLabel}
          </button>
        )}
      </section>

      {showMobileResult && (
        <MobileResult
          question={q}
          score={score}
          rankChip={rankChip}
          result={result}
          distribution={distribution}
        />
      )}
    </>
  );
}

/**
 * 제출 직후 점수 카드(앱 M-04와 같은 구성) — 배지 · `+147점` · 점수 내역.
 * 정답일 때만 민트를 쓴다 — 오답·채점 중까지 민트면 실패가 성공처럼 읽힌다(앱에서 실측된 문제).
 */
function ScoreCard({ score }: { score: ScoreView }) {
  const isCorrect = score.verdict === "correct";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col gap-2 rounded-2xl px-5 py-4",
        isCorrect ? "bg-mint-bg" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "w-fit rounded-full px-3.5 py-1 text-label-lg",
          isCorrect ? "bg-mint text-white" : "bg-card text-muted-foreground",
        )}
      >
        {VERDICT_LABEL[score.verdict]}
      </span>
      {score.verdict === "grading" ? (
        <p className="text-label-lg text-muted-foreground">
          서술형은 AI 분석·선생님 첨삭 후 확정돼요
        </p>
      ) : (
        <>
          <p
            className={cn(
              "text-display-md tabular-nums",
              isCorrect ? "text-mint-dark" : "text-ink",
            )}
          >
            +{score.score}점
          </p>
          <p
            className={cn("text-label-lg", isCorrect ? "text-mint-dark" : "text-muted-foreground")}
          >
            {isCorrect
              ? `기본 +${score.baseScore} · 속도 보너스 +${score.speedBonus}`
              : "아쉬워요, 다음 문항에서 만회해요"}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * 마감 결과 — 정오 한 줄(서술형은 모범 답안) + 해설. 제출 버튼 자리에 들어간다.
 * 다음 문항은 서버 이벤트가 연다(자동 넘김 5초 또는 선생님의 "다음 문항") — 학생이 누를 것은 없다.
 *
 * `showOutcome`이 false면 위에 점수 카드가 이미 정오·채점 안내를 말했다 — 같은 말을 되풀이하지 않는다.
 */
function RevealBlock({ result, showOutcome }: { result: RevealView; showOutcome: boolean }) {
  const tone =
    result.outcome === "correct"
      ? "bg-mint-bg text-mint-dark"
      : result.outcome === "wrong"
        ? "bg-negative-bg text-negative-soft-foreground"
        : "bg-muted text-ink";

  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      {result.outcome === "essay" ? (
        (showOutcome || result.modelAnswer) && (
          <div className="flex flex-col gap-1.5 rounded-xl bg-mint-bg px-4 py-3">
            <span className="text-label-md text-mint-dark">모범 답안</span>
            <p className="text-body-md break-keep whitespace-pre-wrap text-ink">
              {result.modelAnswer ?? "선생님이 첨삭하면 점수가 반영돼요"}
            </p>
            {result.modelAnswer && showOutcome && (
              <span className="text-label-md text-muted-foreground">
                선생님이 첨삭하면 점수가 반영돼요
              </span>
            )}
          </div>
        )
      ) : showOutcome ? (
        <p className={cn("rounded-xl px-4 py-3 text-label-lg", tone)}>
          {OUTCOME_LABEL[result.outcome]}
        </p>
      ) : null}

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

/**
 * 폰 폭 문항 결과(앱 M-04) — 점수 카드 → 정답 → 응답 분포 → 대기 안내. PC는 그리지 않는다.
 * 점수·정답·인원은 모두 서버가 준 값이다(점수 응답 · `QUESTION_ENDED`). 앱에 없는 해설은 웹 기능이라 남긴다.
 */
function MobileResult({
  question,
  score,
  rankChip,
  result,
  distribution,
}: {
  question: LiveQuestion;
  score: ScoreView | null;
  rankChip: RankChip | null;
  result: RevealView | null;
  distribution: DistributionRow[];
}) {
  const answerChoice =
    result !== null && result.correctIndex !== null ? question.choices[result.correctIndex] : null;

  return (
    <section
      role="status"
      aria-live="polite"
      className="flex flex-col gap-6 max-md:order-1 md:hidden"
    >
      {score ? (
        <MobileScoreCard score={score} rankChip={rankChip} />
      ) : result?.outcome === "missed" ? (
        <p className="rounded-[18px] bg-muted px-5 py-4 text-label-lg text-ink">
          {OUTCOME_LABEL.missed}
        </p>
      ) : null}

      {result?.outcome === "essay" && result.modelAnswer ? (
        <div className="flex flex-col gap-2.5">
          <SectionLabel>모범 답안</SectionLabel>
          <p className="text-body-md break-keep whitespace-pre-wrap text-ink">
            {result.modelAnswer}
          </p>
        </div>
      ) : null}

      {answerChoice ? (
        <div className="flex flex-col gap-2.5">
          <SectionLabel>정답</SectionLabel>
          <div className="flex items-center gap-3">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-mint text-label-lg font-bold text-white">
              {answerChoice.key}
            </span>
            <span className="min-w-0 flex-1 text-heading-md break-keep text-ink">
              {answerChoice.text}
            </span>
            {result?.outcome === "correct" ? (
              <span className="shrink-0 text-label-md text-mint-dark">내가 고른 답과 같아요</span>
            ) : result?.outcome === "wrong" ? (
              <span className="shrink-0 text-label-md text-negative-soft-foreground">
                내가 고른 답과 달라요
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {distribution.length > 0 ? (
        <div className="flex flex-col gap-2.5 border-t pt-6">
          <SectionLabel>응답 분포</SectionLabel>
          <ol className="flex flex-col gap-1.5">
            {distribution.map((row) => (
              <DistributionItem key={row.key} row={row} />
            ))}
          </ol>
        </div>
      ) : null}

      {result?.explanation ? (
        <div className="flex flex-col gap-1.5 rounded-xl bg-muted px-4 py-3">
          <span className="text-label-md text-muted-foreground">해설</span>
          <p className="text-body-md break-keep whitespace-pre-wrap text-ink">
            {result.explanation}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3 border-t pt-7">
        <p className="text-body-lg text-muted-foreground">
          {result ? "다음 문항을 기다리고 있어요" : "정답과 해설은 문항이 마감되면 보여요"}
        </p>
        <span aria-hidden className="flex gap-2">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-2 animate-pulse rounded-full bg-mint"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </section>
  );
}

/** 앱 M-04 점수 카드 — 배지 · 현재 순위 칩 · `+87점`(40) · 점수 내역 */
function MobileScoreCard({ score, rankChip }: { score: ScoreView; rankChip: RankChip | null }) {
  const isCorrect = score.verdict === "correct";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[18px] px-5 py-5",
        isCorrect ? "bg-mint-bg" : "bg-muted",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-3.5 py-1 text-label-lg font-bold",
            isCorrect ? "bg-mint text-white" : "bg-card text-muted-foreground",
          )}
        >
          {VERDICT_LABEL[score.verdict]}
        </span>
        {rankChip ? (
          <span className="rounded-full bg-card px-3.5 py-1.5 text-label-lg font-bold text-mint-dark">
            현재 {rankChip.rank}위{rankChip.change > 0 ? ` ▲${rankChip.change}` : null}
            {rankChip.change < 0 ? (
              <span className="text-negative-soft-foreground"> ▼{-rankChip.change}</span>
            ) : null}
          </span>
        ) : null}
      </div>
      {score.verdict === "grading" ? (
        <p className="text-label-lg text-muted-foreground">
          서술형은 AI 분석·선생님 첨삭 후 확정돼요
        </p>
      ) : (
        <>
          <p
            className={cn(
              "text-display-lg tabular-nums",
              isCorrect ? "text-mint-dark" : "text-ink",
            )}
          >
            +{score.score}점
          </p>
          <p className={cn("text-body-md", isCorrect ? "text-mint-dark" : "text-muted-foreground")}>
            {isCorrect
              ? `기본 +${score.baseScore} · 속도 보너스 +${score.speedBonus}`
              : "아쉬워요, 다음 문항에서 만회해요"}
          </p>
        </>
      )}
    </div>
  );
}

/** 앱 M-04 "응답 분포" 한 줄 — 정답 보기만 연민트 바탕 · 민트 막대 */
function DistributionItem({ row }: { row: DistributionRow }) {
  return (
    <li className={cn("flex flex-col gap-2 rounded-2xl px-2 py-2", row.isAnswer && "bg-mint-bg")}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full text-label-md font-bold",
            row.isAnswer
              ? "bg-mint text-white"
              : "border-[1.5px] border-border text-muted-foreground",
          )}
        >
          {row.key}
        </span>
        <span className="min-w-0 flex-1 truncate text-heading-sm text-ink">{row.text}</span>
        <span
          className={cn(
            "shrink-0 text-label-md font-bold",
            row.isAnswer ? "text-mint-dark" : "text-muted-foreground",
          )}
        >
          {row.count}명
        </span>
      </div>
      <div className="ml-[42px] h-3 overflow-hidden rounded-full bg-line-soft">
        <div
          className={cn("h-full rounded-full", row.isAnswer ? "bg-mint" : "bg-border")}
          style={{ width: `${row.percent}%` }}
        />
      </div>
    </li>
  );
}

/** 앱 M-04 구역 이름("정 답" · "응 답 분 포") — 작은 굵은 회색, 자간을 넓힌다 */
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-label-md font-bold tracking-[0.16em] text-muted-foreground">
      {children}
    </span>
  );
}
