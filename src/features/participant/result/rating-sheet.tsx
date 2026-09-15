"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingLabel } from "@/components/common/pending-label";
import { RATING_COMMENT_MAX } from "@/lib/types/dto";
import type { RatingTag, SubmitRatingRequest } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
import { RATING_TAG_LABEL, RATING_TAGS, STAR_LABEL } from "./rating-tags";

type Stars = 1 | 2 | 3 | 4 | 5;

type Props = {
  /**
   * 선생님 이름. TODO(계약): GET /rooms/{id}/results/me에 호스트 이름이 없다.
   * 시안은 "김선생 선생님"을 크게 띄우는데 줄 방법이 없어, 없으면 그 줄을 감춘다
   * (DESIGN_GAPS G-8).
   */
  hostName: string | null;
  /** 카드 부제. 예: "8월 4주차 Spring 스터디 · 오늘 8문항" */
  subtitle: string;
  /** 평가 마감 안내(서버 `rating.deadline` 기준). 없으면 줄을 감춘다 */
  deadlineLabel?: string | null;
  /** 제목 요소 id — 바텀시트(폰 폭)가 대화상자 이름으로 읽는다 */
  titleId?: string;
  onSubmit: (body: SubmitRatingRequest) => void;
  onSkip: () => void;
  pending: boolean;
  errorMessage: string | null;
};

/**
 * P-Web 별점 시트 (design.pen 프레임 NSaex) — 세션이 끝난 학생이 선생님을 평가한다.
 * 세션당 한 번만 낼 수 있어 결과의 `rating.available`이 참일 때만 띄운다.
 *
 * 폰 폭(768px 미만)은 앱 시안 M-06a 바텀시트 안에 들어간다 — 제목이 맨 위 왼쪽, 방 정보는 회색 상자,
 * 고른 태그는 민트 테두리, [평가 보내기]가 꽉 차고 그 아래 "건너뛰기" 글자 버튼. PC 배치는 그대로다.
 */
export function RatingSheet({
  hostName,
  subtitle,
  deadlineLabel = null,
  titleId,
  onSubmit,
  onSkip,
  pending,
  errorMessage,
}: Props) {
  const [stars, setStars] = useState<Stars | null>(null);
  const [tags, setTags] = useState<RatingTag[]>([]);
  const [comment, setComment] = useState("");

  const toggleTag = (tag: RatingTag) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  const handleSubmit = () =>
    stars && onSubmit({ stars, tags, ...(comment.trim() ? { comment: comment.trim() } : {}) });

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-10 max-md:items-stretch max-md:gap-4 max-md:p-0">
      <div className="flex w-full max-w-[520px] flex-col gap-4 rounded-[20px] border bg-card px-10 py-9 max-md:max-w-none max-md:gap-3.5 max-md:rounded-none max-md:border-0 max-md:p-0">
        <div className="flex flex-col items-center gap-1 max-md:items-start max-md:rounded-[14px] max-md:bg-muted max-md:px-3.5 max-md:py-2.5">
          {hostName ? (
            <p className="text-heading-md text-ink max-md:text-label-lg">{hostName} 선생님</p>
          ) : null}
          <p className="text-body-lg text-muted-foreground max-md:text-label-md">{subtitle}</p>
          {deadlineLabel ? <p className="text-label-md text-mint-dark">{deadlineLabel}</p> : null}
        </div>

        <h1
          id={titleId}
          className="mt-3 text-center text-heading-lg text-ink max-md:order-first max-md:mt-0 max-md:text-left max-md:text-heading-md"
        >
          <span className="max-md:hidden">오늘 수업 어땠나요?</span>
          <span className="md:hidden">이번 세션 어땠나요?</span>
        </h1>

        <div className="flex justify-center gap-2" role="radiogroup" aria-label="별점">
          {([1, 2, 3, 4, 5] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={stars === value}
              aria-label={`${value}점 · ${STAR_LABEL[value]}`}
              onClick={() => setStars(value)}
              className="p-1"
            >
              <Star
                size={36}
                className={cn(
                  stars !== null && value <= stars
                    ? "fill-gold text-gold"
                    : "fill-muted text-ink-disabled",
                )}
              />
            </button>
          ))}
        </div>

        <p className="min-h-6 text-center text-label-lg text-mint-dark">
          {stars ? `${stars}점 · ${STAR_LABEL[stars]}` : ""}
        </p>

        <div className="flex flex-col gap-2">
          <p className="text-label-lg text-muted-foreground max-md:text-label-md">
            어떤 점이 좋았나요? (여러 개 선택 가능)
          </p>
          <div className="flex flex-wrap gap-2">
            {RATING_TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-4 py-2 text-label-lg transition-colors max-md:px-3 max-md:py-[7px]",
                    on
                      ? "bg-mint-bg text-mint-dark max-md:border max-md:border-mint max-md:bg-mint-tint max-md:text-mint-deep"
                      : "border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {RATING_TAG_LABEL[tag]}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-2 flex flex-col gap-2 max-md:mt-0">
          <span className="flex items-baseline justify-between text-label-lg text-muted-foreground max-md:text-label-md">
            한 줄 후기 (선택)
            {/* 서버가 500자에서 400을 낸다 — 다 쓰고 나서 알면 늦다 */}
            {comment.length > RATING_COMMENT_MAX - 100 ? (
              <span className="tabular-nums">
                {comment.length} / {RATING_COMMENT_MAX}자
              </span>
            ) : null}
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={RATING_COMMENT_MAX}
            placeholder="선생님께 한 마디 남겨 주세요"
            rows={3}
            className="resize-none rounded-xl bg-muted px-4 py-3 text-body-lg text-ink outline-none placeholder:text-ink-disabled focus-visible:ring-2 focus-visible:ring-ring max-md:rounded-[14px] max-md:px-3.5 max-md:text-body-md"
          />
        </label>

        {errorMessage ? (
          <p role="alert" className="text-label-lg text-negative-soft-foreground">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-3 max-md:hidden">
          <Button size="xl" variant="outline" className="w-[140px]" onClick={onSkip}>
            건너뛰기
          </Button>
          <Button
            size="xl"
            className="flex-1"
            disabled={stars === null || pending}
            onClick={handleSubmit}
          >
            {pending ? <PendingLabel>보내는 중…</PendingLabel> : "보내기"}
          </Button>
        </div>

        {/* 폰 폭 — 앱 M-06a: 꽉 찬 [평가 보내기] 아래 흐린 "건너뛰기" */}
        <div className="flex flex-col items-start gap-3.5 md:hidden">
          <Button
            size="xl"
            className="h-[52px] w-full rounded-2xl text-heading-sm"
            disabled={stars === null || pending}
            onClick={handleSubmit}
          >
            {pending ? <PendingLabel>보내는 중…</PendingLabel> : "평가 보내기"}
          </Button>
          <button type="button" onClick={onSkip} className="text-label-lg text-ink-disabled">
            건너뛰기
          </button>
        </div>
      </div>

      <p className="text-body-lg text-muted-foreground max-md:text-center max-md:text-label-md">
        평가는 익명으로 전달돼요. 선생님은 누가 남겼는지 알 수 없어요.
      </p>
    </main>
  );
}
