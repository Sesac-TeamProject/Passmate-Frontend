import type {
  AdminReviewQuestion,
  QuestionDifficulty,
  QuestionFormat,
  QuestionReviewStatus,
} from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-03 문제 검수 큐) 기준: 문제 ID 열만 고정 폭, 나머지 6열 균등. */
const ID_COL_W = 98;
const EMPTY = "—";

const FORMAT_LABEL: Record<QuestionFormat, string> = {
  MULTIPLE_CHOICE: "객관식",
  ESSAY: "서술형",
};

const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  EASY: "초급",
  MEDIUM: "중급",
  HARD: "고급",
};

const REVIEW_CHIP: Record<QuestionReviewStatus, { label: string; tone: Tone }> = {
  OK: { label: "정상", tone: "success" },
  TOO_EASY: { label: "너무 쉬움", tone: "warning" },
  PENDING: { label: "검수 대기", tone: "info" },
  REJECT_NEEDED: { label: "반려 필요", tone: "danger" },
};

const COLUMNS: AdminTableColumn<AdminReviewQuestion>[] = [
  {
    key: "id",
    header: "문제 ID",
    width: ID_COL_W,
    render: (q) => <p className="text-label-lg text-foreground">{q.id}</p>,
  },
  {
    key: "prompt",
    header: "문항",
    render: (q) => <p className="truncate text-label-md text-muted-foreground">{q.prompt}</p>,
  },
  {
    key: "format",
    header: "유형",
    render: (q) => <p className="text-label-md text-muted-foreground">{FORMAT_LABEL[q.format]}</p>,
  },
  {
    key: "difficulty",
    header: "난이도",
    render: (q) => (
      <p className="text-label-md text-muted-foreground">{DIFFICULTY_LABEL[q.difficulty]}</p>
    ),
  },
  {
    key: "correctRate",
    header: "정답률",
    render: (q) => (
      <p className="text-label-md text-muted-foreground">
        {q.correctRatePct === null ? EMPTY : `${q.correctRatePct}%`}
      </p>
    ),
  },
  {
    key: "reports",
    header: "신고",
    render: (q) => <p className="text-label-md text-muted-foreground">{q.reportCount}</p>,
  },
  {
    key: "status",
    header: "상태",
    render: (q) => (
      <StatChip tone={REVIEW_CHIP[q.reviewStatus].tone}>
        {REVIEW_CHIP[q.reviewStatus].label}
      </StatChip>
    ),
  },
];

type Props = { questions: AdminReviewQuestion[] };

/** AI 생성 문항 검수 큐 표. 반려·검수 대기는 색으로 구분한다. */
export function ReviewQueueTable({ questions }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={questions}
      rowKey={(q) => q.id}
      emptyMessage="검수할 문항이 없습니다."
    />
  );
}
