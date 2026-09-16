import { MobileTopBar } from "@/components/common/mobile-top-bar";
import {
  ReportInsights,
  type ReportComparison,
  type ReportConcept,
  type ReportTrendPoint,
} from "./report-insights";
import { ReportQuestionTable, type ReportRow } from "./report-question-table";
import { cn } from "@/lib/utils";
import { ReportSummaryCard } from "./report-summary-card";

type Props = {
  roomTitle: string;
  /** "8/22 (금) · 3회차 참여 · 문항 8개" — 있는 조각만 이어 붙여 컨테이너가 만든다 */
  subtitle: string;
  correctCount: number;
  questionCount: number;
  myRank: number | null;
  participantCount: number | null;
  accuracyPercent: number;
  elapsedSeconds: number | null;
  myScore: number;
  comparison: ReportComparison | null;
  trend: ReportTrendPoint[];
  concepts: ReportConcept[];
  rows: ReportRow[];
  /** 틀린 문항이 없으면 "다시 풀기" 버튼을 감춘다 */
  wrongCount: number;
  onBack: () => void;
  /**
   * 폰 폭 "←"가 갈 곳. PC의 "‹ 참여한 방으로"는 회원 전용 경로라 게스트가 누르면 로그인으로 튕긴다 —
   * 앱 M-06처럼 결과 화면으로 돌려보낸다.
   */
  mobileBackHref: string;
  onSavePdf: () => void;
  onRetryWrong: () => void;
  onShare: () => void;
  /** 문항 행 링크 → 문항 상세. 없으면 링크를 그리지 않는다 */
  onOpenQuestion?: (no: number) => void;
  /** 방 신고 — 시안에 없지만 학생이 마지막으로 머무는 화면이라 조용한 진입점을 남긴다 */
  onReport?: () => void;
};

/**
 * P-Web 내 리포트 (시안 787:8834) — 렌더 전용.
 * 시안 크기는 10종 타이포 토큰에 스냅한다: 18/700 제목→heading-md, 16/700 KPI→heading-sm,
 * 14/700 카드 제목→label-lg, 12.5 이하 본문·표·칩→label-md.
 *
 * 폰 폭(768px 미만)은 앱 시안 M-06 — "← 리포트" 줄, 정답 링 요약 카드, 문항은 표 대신 줄 목록.
 * 앱에 없는 다음 단계 제안·신고 링크는 웹 기능이라 남긴다.
 */
export function ReportPage({
  roomTitle,
  subtitle,
  correctCount,
  questionCount,
  myRank,
  participantCount,
  accuracyPercent,
  elapsedSeconds,
  myScore,
  comparison,
  trend,
  concepts,
  rows,
  wrongCount,
  onBack,
  mobileBackHref,
  onSavePdf,
  onRetryWrong,
  onShare,
  onOpenQuestion,
  onReport,
}: Props) {
  return (
    <main className="min-h-screen bg-background px-4 pt-[26px] pb-10 max-md:min-h-dvh max-md:bg-card max-md:px-5 max-md:pt-10 sm:px-8 lg:px-20">
      {/* 시안은 1440에서 본문 1280 — 폭을 묶고 남는 공간은 좌우로 나눈다 (W-09와 같은 규칙) */}
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 max-md:gap-3.5">
        <button
          type="button"
          onClick={onBack}
          className="self-start text-label-md text-muted-foreground transition-colors hover:text-foreground max-md:hidden"
        >
          ‹ 참여한 방으로
        </button>
        <MobileTopBar title="리포트" backHref={mobileBackHref} />

        <ReportSummaryCard
          roomTitle={roomTitle}
          subtitle={subtitle}
          correctCount={correctCount}
          questionCount={questionCount}
          rank={myRank}
          participantCount={participantCount}
          accuracyPercent={accuracyPercent}
          elapsedSeconds={elapsedSeconds}
          score={myScore}
          onSavePdf={onSavePdf}
        />

        <ReportInsights comparison={comparison} trend={trend} concepts={concepts} />

        <ReportQuestionTable rows={rows} onOpenQuestion={onOpenQuestion} />

        <section className="flex flex-col gap-2.5 pt-2">
          <h2 className="text-label-lg font-bold text-ink">다음에 이렇게 해보세요</h2>
          <div className="flex flex-wrap gap-4">
            {wrongCount > 0 && (
              <NextStep onClick={onRetryWrong} primary>
                틀린 {wrongCount}문항만 다시 풀기
              </NextStep>
            )}
            <NextStep onClick={onShare}>리포트 공유하기</NextStep>
          </div>
        </section>

        {onReport !== undefined && (
          <button
            type="button"
            onClick={onReport}
            className="self-center text-label-md text-muted-foreground underline underline-offset-2 transition-colors hover:text-ink"
          >
            이 방 신고하기
          </button>
        )}
      </div>
    </main>
  );
}

/** 하단 제안 버튼 — 첫 칸만 채운 민트, 나머지는 테두리 (시안 787:9029~9033) */
function NextStep({
  primary,
  onClick,
  children,
}: {
  primary?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // 폰에서는 위 카드들과 같은 폭으로 세로로 쌓이고, sm 부터 시안의 220px 로 나란히 선다 —
        // 220px 고정이면 폰에서 카드 폭(324~358px)과 어긋나 왼쪽에 몰렸다(운영 확인, 2026-09-09).
        // 라벨에 주제명이 들어가 길이가 변하므로 고정폭 대신 최소폭 — 길면 버튼이 늘어나고 줄이 늘면 높이도 따라간다
        "min-h-11 w-full rounded-[10px] px-5 text-label-md font-bold transition-colors sm:w-auto sm:min-w-55",
        primary
          ? "bg-mint text-white hover:bg-mint-dark"
          : "border bg-card text-ink hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
