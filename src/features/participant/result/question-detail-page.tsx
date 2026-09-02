import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PendingLabel } from "@/components/common/pending-label";
import { StatusChip } from "@/components/common/status-chip";
import type { AnalysisStatus } from "@/lib/types/dto";
import { cn } from "@/lib/utils";

/** 서술형 AI 분석. `status`가 DONE이 아니면 본문은 비어 있고 상태만 뜻이 있다 */
export type QuestionDetailAnalysis = {
  status: AnalysisStatus;
  keyPoints: string[];
  missingPoints: string[];
  suggestions: string[];
  summary: string;
};

export type QuestionDetail = {
  no: number;
  total: number;
  title: string;
  /** "객관식" · "서술형" · "OX" */
  typeLabel: string;
  /** "획득/배점점" */
  scoreLabel: string | null;
  isCorrect: boolean;
  verdictLabel: string;
  myAnswer: string | null;
  correctAnswer: string | null;
  explanation: string | null;
  /** 아직 요청하지 않았으면 null */
  analysis: QuestionDetailAnalysis | null;
  /** 선생님 첨삭 코멘트 */
  teacherComment: string | null;
  /** 보기별 응답 분포(마감된 문항만). 서술형·미마감이면 빈 배열 */
  distribution: { text: string; count: number; isAnswer: boolean }[];
};

/** "AI 분석 요청" 버튼. 게스트이거나 서술형이 아니면 컨테이너가 null을 넘긴다 */
export type AnalysisRequestPanel = {
  onRequest: () => void;
  pending: boolean;
  /** 이번 달 남은 무료 횟수. 모르면 null */
  remainingFree: number | null;
  /** 무료 횟수를 넘겼을 때 1건당 코인 */
  coinCost: number;
  errorMessage: string | null;
};

type Props = {
  detail: QuestionDetail;
  backHref: string;
  prevHref: string | null;
  nextHref: string | null;
  analysisRequest?: AnalysisRequestPanel | null;
};

/**
 * P-Web 리포트 — 문항 상세 (design.pen 프레임 HZ1Mr).
 * 리포트의 문항 행에서 들어온다. 시안의 "다른 학생들은"(보기별 응답 분포)은 계약에
 * 그 필드가 없어 그리지 않았다 — DESIGN_GAPS G-8 옆에 같이 물어야 한다.
 */
export function QuestionDetailPage({
  detail,
  backHref,
  prevHref,
  nextHref,
  analysisRequest = null,
}: Props) {
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

        <AnalysisSection analysis={detail.analysis} request={analysisRequest} />

        {detail.teacherComment ? (
          <section className="flex flex-col gap-1.5 rounded-xl bg-mint-bg px-5 py-4">
            <span className="text-label-md font-bold tracking-[0.08em] text-mint-dark">
              선생님 첨삭
            </span>
            <p className="text-body-lg text-mint-dark">{detail.teacherComment}</p>
          </section>
        ) : null}

        {/* 시안의 "다른 학생들은" — 문항 결과 API의 보기별 분포로 채운다(마감된 문항만) */}
        {detail.distribution.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
              다른 학생들은
            </h2>
            <ul className="flex flex-col gap-1.5">
              {detail.distribution.map((row) => (
                <li key={row.text} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-body-md",
                      row.isAnswer ? "text-mint-dark" : "text-muted-foreground",
                    )}
                  >
                    {row.text}
                  </span>
                  <span className="shrink-0 text-label-lg text-muted-foreground">
                    {row.count}명
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

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

/**
 * 서술형 AI 분석 구역 — 상태 4종을 각각 다르게 말한다.
 * 실패해도 정오·점수는 그대로다(FR-029) — 분석은 참고 의견이라는 뜻이다.
 */
function AnalysisSection({
  analysis,
  request,
}: {
  analysis: QuestionDetailAnalysis | null;
  request: AnalysisRequestPanel | null;
}) {
  const status: AnalysisStatus = analysis?.status ?? "NOT_REQUESTED";

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">AI 첨삭</h2>

      {status === "DONE" && analysis ? (
        <>
          {analysis.summary ? <p className="text-body-lg text-ink">{analysis.summary}</p> : null}
          <FeedbackRow label="잘한 점" value={joinOrNull(analysis.keyPoints)} />
          <FeedbackRow label="놓친 점" value={joinOrNull(analysis.missingPoints)} />
          <FeedbackRow label="다시 볼 것" value={joinOrNull(analysis.suggestions)} />
        </>
      ) : null}

      {status === "PENDING" ? (
        <p className="text-body-md text-muted-foreground">
          분석하고 있어요. 30초쯤 걸려요 — 끝나면 이 화면이 바뀝니다
        </p>
      ) : null}

      {status === "FAILED" ? (
        <p className="text-body-md text-negative">
          분석하지 못했어요. 정오와 점수는 그대로예요 — 다시 요청할 수 있어요
        </p>
      ) : null}

      {status === "NOT_REQUESTED" && !request ? (
        <p className="text-body-md text-muted-foreground">이 문항에는 AI 분석을 받을 수 없어요</p>
      ) : null}

      {request ? (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={request.onRequest}
            disabled={request.pending}
            className="flex h-11 w-fit items-center rounded-xl bg-mint px-4 text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
          >
            {request.pending ? (
              <PendingLabel>요청하는 중…</PendingLabel>
            ) : status === "FAILED" ? (
              "다시 분석 요청"
            ) : (
              "AI 분석 요청"
            )}
          </button>
          <p className="text-label-md text-muted-foreground">
            {request.remainingFree !== null && request.remainingFree > 0
              ? `이번 달 무료 ${request.remainingFree}회 남았어요`
              : `무료 횟수를 다 썼어요 · 1건당 ${request.coinCost} C`}
          </p>
          {request.errorMessage ? (
            <p role="alert" className="text-label-md text-negative">
              {request.errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function joinOrNull(points: string[]): string | null {
  return points.length > 0 ? points.join(", ") : null;
}
