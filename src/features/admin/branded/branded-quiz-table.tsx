import { formatKrw, formatNumber } from "@/lib/format";
import type { BrandedQuiz, BrandedQuizPurpose, BrandedQuizStatus } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-06 브랜디드 퀴즈) 기준: 퀴즈명 열만 고정 폭, 나머지 6열 균등. */
const NAME_COL_W = 220;
const EMPTY = "—";

const PURPOSE_LABEL: Record<BrandedQuizPurpose, string> = {
  RECRUITING: "채용",
  BRANDING: "브랜드",
  TRAINING: "교육",
};

const STATUS_CHIP: Record<BrandedQuizStatus, { label: string; tone: Tone }> = {
  LIVE: { label: "운영 중", tone: "success" },
  IN_PRODUCTION: { label: "제작 중", tone: "info" },
  ENDED: { label: "종료", tone: "neutral" },
};

const COLUMNS: AdminTableColumn<BrandedQuiz>[] = [
  {
    key: "name",
    header: "퀴즈명",
    width: NAME_COL_W,
    render: (q) => <p className="truncate text-label-lg text-foreground">{q.name}</p>,
  },
  {
    key: "company",
    header: "기업",
    render: (q) => <p className="text-label-md text-muted-foreground">{q.company}</p>,
  },
  {
    key: "purpose",
    header: "목적",
    render: (q) => (
      <p className="text-label-md text-muted-foreground">{PURPOSE_LABEL[q.purpose]}</p>
    ),
  },
  {
    key: "participants",
    header: "참여자",
    render: (q) => (
      <p className="text-label-md text-muted-foreground">
        {q.participantCount === null ? EMPTY : `${formatNumber(q.participantCount)}명`}
      </p>
    ),
  },
  {
    key: "completion",
    header: "완주율",
    render: (q) => (
      <p className="text-label-md text-muted-foreground">
        {q.completionRatePct === null ? EMPTY : `${q.completionRatePct}%`}
      </p>
    ),
  },
  {
    key: "contract",
    header: "계약액",
    render: (q) => (
      <p className="text-label-md text-muted-foreground">{formatKrw(q.contractKrw)}</p>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (q) => (
      <StatChip tone={STATUS_CHIP[q.status].tone}>{STATUS_CHIP[q.status].label}</StatChip>
    ),
  },
];

type Props = { quizzes: BrandedQuiz[] };

/** 기업 브랜디드 퀴즈 운영 현황 표. */
export function BrandedQuizTable({ quizzes }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={quizzes}
      rowKey={(q) => q.id}
      emptyMessage="운영 중인 브랜디드 퀴즈가 없습니다."
    />
  );
}
