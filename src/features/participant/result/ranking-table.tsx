import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export type RankRow = {
  rank: number;
  participantId: number;
  name: string;
  score: number;
  /** @draft 랭킹 계약에 없다 — null이면 "—"로 비운다 */
  correctCount: number | null;
  isMe: boolean;
};

type Props = {
  rows: RankRow[];
  questionCount: number;
};

/** 최종 결과 오른쪽 전체 순위표 — 내 줄은 연민트 + 왼쪽 민트 막대 (시안 788:8959) */
export function RankingTable({ rows, questionCount }: Props) {
  return (
    <section className="flex w-120 shrink-0 flex-col overflow-hidden rounded-2xl border bg-card">
      {rows.length === 0 ? (
        <p className="flex h-40 items-center justify-center text-label-md text-muted-foreground">
          순위는 채점이 끝나면 채워져요
        </p>
      ) : (
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[62px]" />
            <col className="w-auto" />
            <col className="w-[106px]" />
            <col className="w-[150px]" />
          </colgroup>
          <thead>
            <tr className="border-b text-label-md text-muted-foreground">
              <th scope="col" className="h-[34px] pl-[18px] text-left font-normal">
                순위
              </th>
              <th scope="col" className="h-[34px] text-left font-normal">
                이름
              </th>
              <th scope="col" className="h-[34px] text-left font-normal">
                정답
              </th>
              <th scope="col" className="h-[34px] pr-[18px] text-right font-normal">
                점수
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Row key={row.participantId} row={row} questionCount={questionCount} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/** 1~3위는 번호에 메달 배경을 준다 (시안 788:8966) */
const MEDAL: Record<number, string> = {
  1: "bg-choice-c text-choice-c-foreground",
  2: "bg-muted text-ink",
  3: "bg-avatar-peach text-avatar-peach-foreground",
};

function Row({ row, questionCount }: { row: RankRow; questionCount: number }) {
  const medal = MEDAL[row.rank];

  return (
    <tr
      className={cn("relative border-b border-line-soft last:border-b-0", row.isMe && "bg-mint-bg")}
    >
      <td className="h-11 pl-[18px]">
        {row.isMe && <span aria-hidden className="absolute top-0 left-0 h-11 w-[3px] bg-mint" />}
        <span
          className={cn(
            "inline-flex h-5 w-5.5 items-center justify-center rounded text-label-md",
            medal ?? "text-muted-foreground",
          )}
        >
          {row.rank}
        </span>
      </td>
      <td className="max-w-0 truncate pr-2 text-label-lg text-ink">
        {row.isMe ? `${row.name} (나)` : row.name}
      </td>
      <td className="text-label-md text-muted-foreground">
        {row.correctCount === null ? "—" : `${row.correctCount}/${questionCount}`}
      </td>
      {/* 점수는 랭킹 계약에 늘 있다 — 맞힌 문항 수(@draft)가 없다고 함께 감추지 않는다 */}
      <td className="pr-[18px] text-right text-label-lg text-ink">{formatNumber(row.score)}점</td>
    </tr>
  );
}
