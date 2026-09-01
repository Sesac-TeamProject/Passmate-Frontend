"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingLabel } from "@/components/common/pending-label";
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
  onSubmit: (body: SubmitRatingRequest) => void;
  onSkip: () => void;
  pending: boolean;
  errorMessage: string | null;
};

/**
 * P-Web 별점 시트 (design.pen 프레임 NSaex) — 세션이 끝난 학생이 선생님을 평가한다.
 * 세션당 한 번만 낼 수 있어(409 ALREADY_RATED) 결과의 canRate가 참일 때만 띄운다.
 */
export function RatingSheet({
  hostName,
  subtitle,
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

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-10">
      <div className="flex w-full max-w-[520px] flex-col gap-4 rounded-[20px] border bg-card px-10 py-9">
        <div className="flex flex-col items-center gap-1">
          {hostName ? <p className="text-heading-md text-ink">{hostName} 선생님</p> : null}
          <p className="text-body-lg text-muted-foreground">{subtitle}</p>
        </div>

        <h1 className="mt-3 text-center text-heading-lg text-ink">오늘 수업 어땠나요?</h1>

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
          <p className="text-label-lg text-muted-foreground">
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
                    "rounded-full px-4 py-2 text-label-lg transition-colors",
                    on
                      ? "bg-mint-bg text-mint-dark"
                      : "border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {RATING_TAG_LABEL[tag]}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-2 flex flex-col gap-2">
          <span className="text-label-lg text-muted-foreground">한 줄 후기 (선택)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="선생님께 한 마디 남겨 주세요"
            rows={3}
            className="resize-none rounded-xl bg-muted px-4 py-3 text-body-lg text-ink outline-none placeholder:text-ink-disabled focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        {errorMessage ? (
          <p role="alert" className="text-label-lg text-negative-soft-foreground">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-3">
          <Button size="xl" variant="outline" className="w-[140px]" onClick={onSkip}>
            건너뛰기
          </Button>
          <Button
            size="xl"
            className="flex-1"
            disabled={stars === null || pending}
            onClick={() => stars && onSubmit({ stars, tags, comment: comment.trim() || null })}
          >
            {pending ? <PendingLabel>보내는 중…</PendingLabel> : "보내기"}
          </Button>
        </div>
      </div>

      <p className="text-body-lg text-muted-foreground">
        평가는 익명으로 전달돼요. 선생님은 누가 남겼는지 알 수 없어요.
      </p>
    </main>
  );
}
