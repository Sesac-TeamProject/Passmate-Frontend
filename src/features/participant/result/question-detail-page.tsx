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
};

type Props = {
  detail: QuestionDetail;
  backHref: string;
  prevHref: string | null;
  nextHref: string | null;
};

/**
 * P-Web 리포트 — 문항 상세 (design.pen 프레임 HZ1Mr).
 * 리포트의 문항 행에서 들어온다. 시안의 "다른 학생들은"(보기별 응답 분포)은 계약에
 * 그 필드가 없어 그리지 않았다 — DESIGN_GAPS G-8 옆에 같이 물어야 한다.
 */
export function QuestionDetailPage({ detail, backHref, prevHref, nextHref }: Props) {
  return (
    // 브랜드 상단바는 (participant) 레이아웃의 SiteHeader가 이미 그린다 — 여기서 또 그리면 두 번 나온다
    <main className="flex flex-1 flex-col bg-background">
      <div className="flex items-center justify-between px-20 py-6">
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

      <div className="mx-20 flex flex-col gap-5 rounded-[20px] border bg-card px-8 py-7">
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

      {/* TODO(계약): 시안에는 "다른 학생들은"(보기별 응답 분포)이 있는데
          GET /rooms/{id}/results/me가 보기별 인원을 주지 않아 그리지 않았다 */}

      <div className="mt-auto flex items-center justify-between px-20 py-8">
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
