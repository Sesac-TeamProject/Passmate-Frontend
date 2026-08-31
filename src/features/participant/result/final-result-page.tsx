import { Mascot } from "@/components/common/mascot";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

/** 등수별 스탠드 — 시안은 포디움 토큰이 아니라 보기(choice) 색을 쓴다 */
const STAND = {
  1: { height: "h-[102px]", cls: "bg-choice-c text-choice-c-foreground" },
  2: { height: "h-[74px]", cls: "bg-choice-b text-choice-b-foreground" },
  3: { height: "h-[62px]", cls: "bg-avatar-peach text-avatar-peach-foreground" },
} as const;

export type PodiumPlace = 1 | 2 | 3;
export type PodiumEntry = { rank: PodiumPlace; student: Student };
export type RankRow = { rank: number; student: Student; score: number; isMe: boolean };

function Stand({ entry }: { entry: PodiumEntry }) {
  const stand = STAND[entry.rank];
  return (
    <li className="relative flex w-20 flex-col items-center pt-[30px]">
      <StudentAvatar
        avatar={entry.student.avatar}
        size={44}
        className="absolute top-0 left-1/2 -translate-x-1/2"
      />
      <span
        className={cn(
          "flex w-full justify-center rounded-xl pt-[18px] text-heading-sm",
          stand.height,
          stand.cls,
        )}
      >
        {entry.rank}
      </span>
    </li>
  );
}

type Props = {
  /** 내 등수. 아직 채점 전이면 null */
  myRank: number | null;
  myScore: number;
  myCorrectCount: number;
  questionCount: number;
  /** 1~3위. 3명이 안 되면 있는 만큼만 세운다 */
  podium: PodiumEntry[];
  /** 순위 카드에 담을 행 */
  rows: RankRow[];
  /** 게스트면 가입 유도 버튼을 보여 준다 */
  isGuest: boolean;
  /** 리포트로 이동. 없으면 버튼을 비활성으로 둔다 */
  onOpenReport?: () => void;
  onSignUp: () => void;
};

/**
 * M-05 최종 결과 (앱 시안 → 데스크톱 웹 이식).
 * 세션이 끝나면 학생이 처음 보는 화면 — 내 등수와 상위 순위를 함께 보여 준다.
 */
export function FinalResultPage({
  myRank,
  myScore,
  myCorrectCount,
  questionCount,
  podium,
  rows,
  isGuest,
  onOpenReport,
  onSignUp,
}: Props) {
  // 시안은 2위 · 1위 · 3위 순으로 세운다
  const ordered = [2, 1, 3]
    .map((rank) => podium.find((p) => p.rank === rank))
    .filter((p): p is PodiumEntry => p !== undefined);

  const mySummary = `${myRank === null ? "순위 집계 중" : `${myRank}위`} · ${formatNumber(myScore)}점 · 정답 ${myCorrectCount}/${questionCount}`;

  return (
    <main className="flex min-h-screen flex-col pb-6">
      {/* 히어로 배경만 전체 폭으로 깔고 안쪽 내용은 앱 시안 폭에 맞춘다 */}
      <section className="relative flex flex-col items-center bg-mint-bg px-5 pt-14 pb-[70px]">
        <div className="flex w-full max-w-sm flex-col items-center gap-3.5">
          <p className="text-label-lg text-mint-ink">최종 결과</p>

          {ordered.length > 0 && (
            <ol className="flex items-end gap-3.5">
              {ordered.map((entry) => (
                <Stand key={entry.rank} entry={entry} />
              ))}
            </ol>
          )}

          <p className="text-heading-sm">{mySummary}</p>
        </div>

        <span aria-hidden className="absolute top-9 right-6">
          <span className="relative block">
            <Mascot className="h-[66px] w-[60px]" />
            <span className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-lg bg-mint px-2 py-0.5 text-label-md font-black text-mint-ink">
              PASS
            </span>
          </span>
        </span>
      </section>

      {/* 히어로가 relative라 그냥 두면 카드가 그 뒤로 깔린다 — 겹쳐 올라오는 쪽에도 relative를 준다 */}
      <div className="relative -mt-10 flex justify-center px-5">
        <div className="flex w-full max-w-sm flex-col gap-2.5 rounded-3xl border bg-card px-5 py-[22px]">
          <p className="text-heading-sm">{mySummary}</p>
          {rows.length === 0 ? (
            <p className="text-label-md text-muted-foreground">순위는 채점이 끝나면 채워져요</p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {rows.map((row) => (
                <li
                  key={row.student.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-[11px]",
                    row.isMe && "bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-label-lg",
                      row.rank <= 3
                        ? STAND[row.rank as PodiumPlace].cls
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {row.rank}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate text-label-lg",
                      row.isMe && "text-mint-dark",
                    )}
                  >
                    {row.isMe ? `나 (${row.student.name})` : row.student.name}
                  </span>
                  <span className={cn("text-label-lg", row.isMe && "text-mint-dark")}>
                    {formatNumber(row.score)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mx-auto mt-auto flex w-full max-w-sm flex-col gap-2.5 px-5 pt-8">
        <button
          type="button"
          onClick={onOpenReport}
          disabled={onOpenReport === undefined}
          className="h-[54px] rounded-2xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
        >
          내 리포트 보기
        </button>
        {isGuest && (
          <button
            type="button"
            onClick={onSignUp}
            className="h-[50px] rounded-2xl border bg-card text-label-lg text-mint-dark transition-colors hover:bg-muted"
          >
            가입하고 이 기록 저장하기
          </button>
        )}
      </div>
    </main>
  );
}
