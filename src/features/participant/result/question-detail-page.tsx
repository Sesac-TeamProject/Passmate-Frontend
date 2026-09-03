import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusChip } from "@/components/common/status-chip";
import { cn } from "@/lib/utils";

export type QuestionDetailFeedback = {
  /** 잘한 점 */
  covered: string | null;
  /** 놓친 점 */
  missing: string | null;
  /** 다시 볼 것 */
  improvement: string | null;
};

/** @draft 계약 없음 — 보기 하나에 몇 명이 답했는지 (시안 "다른 학생들은") */
export type QuestionDetailChoice = { label: string; count: number; isCorrect: boolean };

export type QuestionDetail = {
  no: number;
  total: number;
  title: string;
  /** "객관식" · "서술형" · "OX" */
  typeLabel: string;
  /** 획득 점수 문구. 계약에 배점이 없어 "획득"임을 밝힌다 */
  scoreLabel: string | null;
  isCorrect: boolean;
  verdictLabel: string;
  myAnswer: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  feedback: QuestionDetailFeedback | null;
  /** 비면 "다른 학생들은" 칸을 감춘다 */
  choices: QuestionDetailChoice[];
};

type Props = {
  detail: QuestionDetail;
  backHref: string;
  prevHref: string | null;
  nextHref: string | null;
};

/**
 * P-Web 리포트 — 문항 상세 (시안 620:8221).
 * 리포트의 문항 행에서 들어온다. "다른 학생들은"(보기별 응답 분포)은 계약에 아직 없어
 * @draft 필드로 받는다 — 서버가 안 주면 그 칸만 사라진다.
 */
export function QuestionDetailPage({ detail, backHref, prevHref, nextHref }: Props) {
  return (
    // 브랜드 상단바는 (participant) 레이아웃의 SiteHeader가 이미 그린다 — 여기서 또 그리면 두 번 나온다
    <main className="flex flex-1 flex-col bg-background px-20">
      {/* 시안 620:8221은 1440에서 본문 1200 — 폭을 묶고 남는 공간은 좌우로 나눈다 */}
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between py-6">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-label-lg text-muted-foreground hover:text-ink"
        >
          <ArrowLeft size={18} aria-hidden />
          리포트로 돌아가기
        </Link>
        <span className="text-label-lg text-muted-foreground">
          문항 {detail.no} / {detail.total}
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 rounded-[20px] border bg-card px-8 py-7">
        <div className="flex items-center gap-3">
          <StatusChip tone={detail.isCorrect ? "free" : "paid"}>{detail.verdictLabel}</StatusChip>
          <span className="text-label-lg text-muted-foreground">
            {[detail.typeLabel, detail.scoreLabel].filter(Boolean).join(" · ")}
          </span>
        </div>

        <h1 className="text-display-sm text-ink">{detail.title}</h1>

        <div className="flex gap-4">
          <AnswerBox
            label="내가 고른 답"
            value={detail.myAnswer ?? "답하지 않았어요"}
            tone="mine"
          />
          {/* 서술형은 정해진 정답이 없다 — 빈 상자를 세우면 "정답이 없다"가 아니라 "못 불러왔다"로 읽힌다 */}
          {detail.correctAnswer !== null ? (
            <AnswerBox label="정답" value={detail.correctAnswer} tone="correct" />
          ) : null}
        </div>

        {detail.explanation ? (
          <p className="text-body-lg text-muted-foreground">{detail.explanation}</p>
        ) : null}

        {detail.choices.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-label-md text-muted-foreground">다른 학생들은</h2>
            {detail.choices.map((choice) => (
              <ChoiceRow key={choice.label} choice={choice} people={detail.choices} />
            ))}
          </section>
        ) : null}

        {detail.feedback ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
              AI 첨삭
            </h2>
            <FeedbackRow label="잘한 점" value={detail.feedback.covered} />
            <FeedbackRow label="놓친 점" value={detail.feedback.missing} />
            <FeedbackRow label="다시 볼 것" value={detail.feedback.improvement} />
          </section>
        ) : null}
      </div>

      <div className="mx-auto mt-auto flex w-full max-w-[1200px] items-center justify-between py-8">
        <NavLink href={prevHref}>‹ 이전 문항</NavLink>
        <NavLink href={nextHref} primary>
          다음 문항 ›
        </NavLink>
      </div>
    </main>
  );
}

function AnswerBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "mine" | "correct";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1 rounded-xl px-5 py-4",
        tone === "correct" ? "bg-mint-bg" : "bg-negative-bg",
      )}
    >
      <span
        className={cn(
          "text-label-md font-bold tracking-[0.08em]",
          tone === "correct" ? "text-mint-dark" : "text-negative-soft-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "truncate text-heading-md",
          tone === "correct" ? "text-mint-dark" : "text-negative-soft-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** 보기 한 줄 — 정답 보기만 민트로 세운다 (시안 620:8221 "다른 학생들은") */
function ChoiceRow({
  choice,
  people,
}: {
  choice: QuestionDetailChoice;
  people: QuestionDetailChoice[];
}) {
  const peak = Math.max(...people.map((c) => c.count), 1);

  return (
    <p className="flex items-center gap-3">
      <span
        className={cn(
          "w-40 shrink-0 truncate text-label-md",
          choice.isCorrect ? "text-mint-dark" : "text-muted-foreground",
        )}
      >
        {choice.label}
      </span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft">
        <span
          className={cn("block h-full rounded-full", choice.isCorrect ? "bg-mint" : "bg-muted")}
          style={{ width: `${(choice.count / peak) * 100}%` }}
        />
      </span>
      <span className="w-12 shrink-0 text-right text-label-md text-muted-foreground">
        {choice.count}명
      </span>
    </p>
  );
}

function FeedbackRow({ label, value }: { label: string; value: string | null }) {
  if (value === null) return null;

  return (
    <p className="flex gap-3">
      <span className="w-20 shrink-0 text-label-md font-bold tracking-[0.06em] text-mint-dark">
        {label}
      </span>
      <span className="text-body-lg text-ink">{value}</span>
    </p>
  );
}

function NavLink({
  href,
  primary,
  children,
}: {
  href: string | null;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const className = cn(
    "flex h-13 w-40 items-center justify-center rounded-xl text-label-lg transition-colors",
    primary ? "bg-mint text-white hover:bg-mint-dark" : "border bg-card text-ink hover:bg-muted",
  );

  if (href === null) {
    return (
      <span aria-hidden className={cn(className, "pointer-events-none opacity-40")}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
