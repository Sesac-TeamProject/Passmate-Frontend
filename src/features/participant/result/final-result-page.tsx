import { MobileActionBar } from "@/components/common/mobile-action-bar";
import { Mascot } from "@/components/common/mascot";
import { StudentAvatar } from "@/components/common/student-avatar";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MyResultCard } from "./my-result-card";
import { PodiumCard, type PodiumEntry, type PodiumPlace } from "./podium-card";
import { QuestionChips } from "./question-chips";
import { RankingTable, type RankRow } from "./ranking-table";
import type { ReportComparison } from "./report-insights";
import type { ReportRow } from "./report-question-table";

type Props = {
  roomTitle: string;
  /** "최종 결과 · 8문항 · 24명 참여 · 20:00 종료" — 있는 조각만 컨테이너가 이어 붙인다 */
  subtitle: string;
  myRank: number | null;
  myScore: number;
  myCorrectCount: number;
  questionCount: number;
  /** @draft 계약 없음 */
  elapsedSeconds: number | null;
  comparison: ReportComparison | null;
  /** 1~3위. 3명이 안 되면 있는 만큼만 세운다 */
  podium: PodiumEntry[];
  /** 오른쪽 전체 순위표 */
  rankRows: RankRow[];
  /** 문항별 칩 */
  questionRows: ReportRow[];
  /** 게스트면 가입 유도 버튼과 안내 줄을 보여 준다 */
  isGuest: boolean;
  /**
   * 게스트 기록 보관 안내. 보관 표가 없으면(만료·다른 기기) null —
   * **지키지 못할 약속은 하지 않는다.** 서버는 `guestToken`으로 7일간 이관을 받아 준다.
   */
  guestRecordNotice?: string | null;
  /** 별점을 못 남기는 이유. 남길 수 있으면 null */
  ratingNotice?: string | null;
  onOpenReport: () => void;
  onSignUp: () => void;
  onOpenQuestion?: (no: number) => void;
};

/**
 * P-Web 최종 결과 (시안 788:8834) — 렌더 전용.
 * 세션이 끝나면 학생이 처음 보는 화면. 왼쪽은 내 성적, 오른쪽은 전체 순위다.
 *
 * 폰 폭(768px 미만)은 앱 시안 M-05를 따른다 — 민트 띠의 시상대 → 요약 한 줄 + 상위 목록 카드 →
 * 아래에 붙는 [내 리포트 보기] · [가입하고 이 기록 저장하기]. 앱에 없는 문항 칩은 웹 기능이라 남긴다.
 */
export function FinalResultPage({
  roomTitle,
  subtitle,
  myRank,
  myScore,
  myCorrectCount,
  questionCount,
  elapsedSeconds,
  comparison,
  podium,
  rankRows,
  questionRows,
  isGuest,
  onOpenReport,
  onSignUp,
  guestRecordNotice = null,
  ratingNotice = null,
  onOpenQuestion,
}: Props) {
  const guestNotice =
    guestRecordNotice ?? "게스트로 풀었어요 — 가입하면 이 기록을 계정으로 옮길 수 있어요";
  const mobileSummary = [
    myRank === null ? "순위 집계 중" : `${myRank}위`,
    `${formatNumber(myScore)}점`,
    `정답 ${myCorrectCount}/${questionCount}`,
  ].join(" · ");

  return (
    <>
      <main className="min-h-screen bg-background px-4 pt-6 pb-10 max-md:hidden sm:px-8 lg:px-20">
        {/* 시안은 1440에서 본문 1280 — 폭을 묶고 남는 공간은 좌우로 나눈다 */}
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4">
          <header className="flex flex-col gap-0.5">
            <h1 className="truncate text-heading-lg text-ink">{roomTitle}</h1>
            <p className="truncate text-label-md text-muted-foreground">{subtitle}</p>
          </header>

          {/* 시안은 좌우 2단(1280)이지만 순위표가 480px 고정이라 좁은 화면에서 넘친다 — lg 미만은 세로로 쌓는다 */}
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <PodiumCard entries={podium} />

              <MyResultCard
                rank={myRank}
                score={myScore}
                correctCount={myCorrectCount}
                questionCount={questionCount}
                elapsedSeconds={elapsedSeconds}
                comparison={comparison}
              />

              <QuestionChips rows={questionRows} onOpenQuestion={onOpenQuestion} />

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={onOpenReport}
                  className="h-12 w-full rounded-xl bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark sm:w-[234px]"
                >
                  내 리포트 보기
                </button>
                {isGuest && (
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="h-12 w-full rounded-xl border bg-card text-label-lg text-ink transition-colors hover:bg-muted sm:w-[234px]"
                  >
                    가입하고 이 기록 저장하기
                  </button>
                )}
              </div>

              {ratingNotice !== null && (
                <p className="text-label-md text-muted-foreground">{ratingNotice}</p>
              )}

              {isGuest && (
                <p className="text-label-md text-ink-disabled">
                  {/* 기록은 7일간 보관된다 — 보관 표가 있을 때만 그렇게 말한다 */}
                  {guestNotice}
                </p>
              )}
            </div>

            <RankingTable rows={rankRows} questionCount={questionCount} />
          </div>
        </div>
      </main>

      {/* 폰 폭 — 앱 M-05 */}
      <main className="flex min-h-dvh flex-col bg-card md:hidden">
        <section className="relative flex flex-col items-center gap-3.5 bg-mint-bg px-5 pt-14 pb-[70px]">
          <h1 className="text-label-lg text-mint-ink">최종 결과</h1>
          <MobilePodium entries={podium} />
          <Mascot variant="pass" className="absolute top-9 right-6 h-[66px] w-[60px]" />
        </section>

        {/* 민트 띠(relative)가 먼저 그려져 겹친 카드 윗부분을 덮었다 — 카드를 한 층 위로 올린다 */}
        <div className="relative z-10 -mt-10 px-5">
          <section className="flex flex-col items-center gap-2.5 rounded-3xl border bg-card px-5 py-[22px]">
            <p className="text-heading-sm text-ink">{mobileSummary}</p>
            <MobileRankList rows={rankRows} />
          </section>
        </div>

        {questionRows.length > 0 ? (
          <div className="px-5 pt-4">
            <QuestionChips rows={questionRows} onOpenQuestion={onOpenQuestion} />
          </div>
        ) : null}

        <MobileActionBar className="pt-4">
          {/* 앱 "미제출 토스트(M-05 하단)" — 별점을 못 남기는 이유를 버튼 위에 알린다 */}
          {ratingNotice !== null && (
            <p
              role="status"
              className="rounded-xl bg-ink/85 px-4 py-3 text-center text-label-md text-white"
            >
              {ratingNotice}
            </p>
          )}
          <button
            type="button"
            onClick={onOpenReport}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark"
          >
            내 리포트 보기
          </button>
          {isGuest && (
            <>
              <button
                type="button"
                onClick={onSignUp}
                className="flex h-[50px] w-full items-center justify-center rounded-2xl border bg-card text-label-lg text-mint-dark transition-colors hover:bg-muted"
              >
                가입하고 이 기록 저장하기
              </button>
              <p className="text-center text-label-md text-ink-disabled">{guestNotice}</p>
            </>
          )}
        </MobileActionBar>
      </main>
    </>
  );
}

/** 앱 M-05 시상대 스탠드 — 높이·색은 시안 그대로(1위 102 · 2위 74 · 3위 62) */
const MOBILE_STAND: Record<PodiumPlace, string> = {
  1: "h-[102px] bg-choice-c text-choice-c-foreground",
  2: "h-[74px] bg-choice-b text-choice-b-foreground",
  3: "h-[62px] bg-avatar-peach text-avatar-peach-foreground",
};

/** 시안이 세우는 순서 — 2등 · 1등 · 3등 (가운데가 1등) */
const MOBILE_ORDER: PodiumPlace[] = [2, 1, 3];

/** 앱 M-05 민트 띠 안의 시상대 — 스탠드 위에 아바타만 올리고 이름·점수는 아래 목록이 맡는다 */
function MobilePodium({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) {
    return <p className="py-10 text-label-md text-mint-ink">순위는 채점이 끝나면 채워져요</p>;
  }

  const byRank = new Map(entries.map((entry) => [entry.rank, entry]));

  return (
    <ol className="flex items-end gap-3.5">
      {MOBILE_ORDER.map((place) => {
        const entry = byRank.get(place);
        if (entry === undefined) return null;

        return (
          <li key={place} className="relative flex w-20 flex-col items-center pt-[30px]">
            <span
              className={cn(
                "flex w-20 justify-center rounded-xl pt-[18px] text-heading-sm",
                MOBILE_STAND[place],
              )}
            >
              {place}
            </span>
            <StudentAvatar
              avatar={entry.student.avatar}
              size={44}
              className="absolute top-0 left-[18px]"
            />
          </li>
        );
      })}
    </ol>
  );
}

/** 순위 번호 원 색 — 시상대와 같은 색 */
const MOBILE_MEDAL: Record<number, string> = {
  1: "bg-choice-c text-choice-c-foreground",
  2: "bg-choice-b text-choice-b-foreground",
  3: "bg-avatar-peach text-avatar-peach-foreground",
};

/**
 * 앱 M-05 상위 목록 — 1~3위 줄, 내가 4위 아래면 내 줄을 하나 더 붙인다. 내 줄은 회색 바탕 · 민트 글자.
 * 전체 순위는 PC 순위표가 맡고, 폰은 앱처럼 짧게 둔다.
 */
function MobileRankList({ rows }: { rows: RankRow[] }) {
  const top = rows.filter((row) => row.rank <= 3);
  const me = rows.find((row) => row.isMe && row.rank > 3);
  const shown = me ? [...top, me] : top;

  if (shown.length === 0) return null;

  return (
    <ol className="flex w-full flex-col">
      {shown.map((row) => (
        <li
          key={row.participantId}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-[11px]",
            row.isMe && "bg-muted",
          )}
        >
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-label-lg",
              MOBILE_MEDAL[row.rank] ?? "bg-muted text-muted-foreground",
            )}
          >
            {row.rank}
          </span>
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-label-lg",
              row.isMe ? "text-mint-dark" : "text-ink",
            )}
          >
            {row.isMe ? `나 (${row.name})` : row.name}
          </span>
          <span className={cn("shrink-0 text-label-lg", row.isMe ? "text-mint-dark" : "text-ink")}>
            {formatNumber(row.score)}
          </span>
        </li>
      ))}
    </ol>
  );
}
