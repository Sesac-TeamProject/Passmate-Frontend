import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

/** 표 "결과" 칩 5종 — 채점은 서버가 하고 화면은 판정값을 옮기기만 한다 */
const VERDICT = {
  CORRECT: { label: "정답", cls: "bg-mint-bg text-mint-dark" },
  WRONG: { label: "오답", cls: "bg-negative-bg text-negative-soft-foreground" },
  PARTIAL: { label: "부분", cls: "bg-yellow-soft text-choice-c-foreground" },
  PENDING: { label: "분석 중", cls: "bg-muted text-muted-foreground" },
  UNKNOWN: { label: "미채점", cls: "bg-muted text-muted-foreground" },
} as const;

/** 표 "유형" 칩 — 시안은 객관식 회색 · 서술형 파랑 · OX 주황 */
const KIND = {
  MULTIPLE: { label: "객관식", cls: "bg-muted text-muted-foreground" },
  ESSAY: { label: "서술형", cls: "bg-blue-soft text-choice-b-foreground" },
  OX: { label: "OX", cls: "bg-orange-soft text-choice-c-foreground" },
} as const;

export type ReportVerdict = keyof typeof VERDICT;
export type ReportKind = keyof typeof KIND;
export type ReportRow = {
  questionId: number;
  no: number;
  kind: ReportKind;
  /** @draft 계약 없음 — 비면 칸을 비워 둔다 */
  concept: string;
  title: string;
  /** 서술형은 "작성 142자"처럼 컨테이너가 요약해 넘긴다 */
  myAnswer: string;
  verdict: ReportVerdict;
  /** @draft 계약 없음 — null이면 띠와 % 대신 "—" */
  classAccuracyPercent: number | null;
  /** @draft 계약 없음 */
  elapsedSeconds: number | null;
};

type Props = {
  rows: ReportRow[];
  /** 행 끝 링크 — 없으면 링크를 그리지 않는다 */
  onOpenQuestion?: (no: number) => void;
};

/** 리포트 문항 표 (시안 P-Web 내 리포트 787:8905) */
export function ReportQuestionTable({ rows, onOpenQuestion }: Props) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border bg-card px-[17px] py-6 text-label-md text-muted-foreground">
        문항별 결과는 채점이 끝나면 채워져요
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[1246px] table-fixed border-collapse">
        <colgroup>
          <col className="w-14" />
          <col className="w-[66px]" />
          <col className="w-[118px]" />
          <col className="w-[412px]" />
          <col className="w-[162px]" />
          <col className="w-[70px]" />
          <col className="w-46" />
          <col className="w-[90px]" />
          <col className="w-22" />
        </colgroup>
        <thead>
          <tr className="border-b bg-surface-subtle text-label-md text-muted-foreground">
            <Th className="pl-[17px]">문항</Th>
            <Th>유형</Th>
            <Th>개념</Th>
            <Th>문제</Th>
            <Th>내 답</Th>
            <Th>결과</Th>
            <Th align="right">반 정답률</Th>
            <Th align="right">소요</Th>
            <Th align="right" className="pr-[17px]">
              <span className="sr-only">해설 열기</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.questionId} className="border-b border-line-soft last:border-b-0">
              <Td className="pl-[17px] text-label-md text-ink">Q{row.no}</Td>
              <Td>
                <Chip className={KIND[row.kind].cls}>{KIND[row.kind].label}</Chip>
              </Td>
              <Td className="truncate text-label-md text-muted-foreground">{row.concept}</Td>
              <Td className="truncate text-label-md text-ink">{row.title}</Td>
              <Td className="truncate text-label-md text-muted-foreground">{row.myAnswer}</Td>
              <Td>
                <Chip className={VERDICT[row.verdict].cls}>{VERDICT[row.verdict].label}</Chip>
              </Td>
              <Td>
                <ClassAccuracy percent={row.classAccuracyPercent} />
              </Td>
              <Td align="right" className="text-label-md text-muted-foreground">
                {row.elapsedSeconds === null ? "—" : formatDuration(row.elapsedSeconds)}
              </Td>
              <Td align="right" className="pr-[17px]">
                {onOpenQuestion !== undefined && (
                  <button
                    type="button"
                    onClick={() => onOpenQuestion(row.no)}
                    className="text-label-md text-mint-dark transition-colors hover:text-mint"
                  >
                    {row.kind === "ESSAY" ? "AI 첨삭" : "해설"} ›
                  </button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 반 정답률 칸 — 띠 96 + 오른쪽 정렬 % (시안 787:8925) */
function ClassAccuracy({ percent }: { percent: number | null }) {
  if (percent === null) {
    return <span className="block text-right text-label-md text-muted-foreground">—</span>;
  }

  const fill = percent >= 70 ? "bg-mint" : percent >= 50 ? "bg-choice-c" : "bg-choice-a";

  return (
    <span className="flex items-center gap-2.5">
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-line-soft">
        <span className={cn("block h-full rounded-full", fill)} style={{ width: `${percent}%` }} />
      </span>
      <span className="flex-1 text-right text-label-md text-muted-foreground">{percent}%</span>
    </span>
  );
}

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-[19px] items-center justify-center rounded px-1.5 text-label-md",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Th({
  align,
  className,
  children,
}: {
  align?: "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "h-[34px] px-2 font-normal",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  align,
  className,
  children,
}: {
  align?: "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <td
      className={cn(
        "h-[39px] max-w-0 px-2 align-middle",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}
