"use client";

import { useState } from "react";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { FinalRankRow } from "@/features/host/live/rank-columns";
import type { EssayAnswer, Student } from "@/features/host/types";
import { cn } from "@/lib/utils";
import { accuracyFill, accuracyText } from "./accuracy-tone";

export type ReviewDraft = {
  comment: string;
  improvement: string;
  /** 비우면 보정을 지운다 — 서버가 채점기 점수로 되돌린다 */
  adjustedScore: number | null;
};

type Props = {
  students: Student[];
  /** 최종 순위 행 — 학생별 정답률·맞힌 문항 수가 여기서 온다 */
  rows: FinalRankRow[];
  questionTotal: number;
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
  /** 고른 학생의 서술형 답안. 조회 중이면 빈 배열 */
  answers: EssayAnswer[];
  loading: boolean;
  /** "3/6 첨삭 완료" — 셀 값이 없으면 감춘다 */
  progressLabel: string | null;
  onSave: (answerId: number, draft: ReviewDraft) => void;
  savingAnswerId: number | null;
  saveError: string | null;
  /**
   * 폰 배치(M-14)에서 학생 목록 칸을 걷고 답안만 세로로 쌓는다 — 학생은 위 순위 목록에서 고른다.
   * 화면 폭(`md:`)으로 가르지 않는다 — 랜딩 목업은 폰에서도 PC 화면을 줄여 보여 줘야 해서 폭 조건이면 배치가 깨진다.
   */
  stacked?: boolean;
};

/** 정답률 50% 이하를 "도움이 필요해요"로 묶는다 — 절반도 못 맞힌 학생이 기준이다 */
const NEEDS_HELP_MAX = 50;

type SortKey = "accuracy" | "name";

type StudentRow = {
  student: Student;
  /** 미제출이면 null */
  accuracyPercent: number | null;
  correctCount: number | null;
};

/**
 * W-07 학생별 탭 — 학생을 **비교**해서 고르고, 고른 학생의 서술형 답안을 첨삭한다.
 *
 * 왼쪽은 이름만 나열하던 목록 대신 정답률 표다. 누가 어려워했는지는 표를 훑는 것만으로 끝나야 하고,
 * 그래서 정답률이 낮은 학생을 맨 위 그룹으로 떼어 둔다. 첨삭은 **답안 단위**다
 * (`PUT /rooms/{id}/answers/{answerId}/review`) — 세 항목 모두 선택이고 비워서 보내면 지워진다.
 */
export function StudentReviewPanel({
  students,
  rows,
  questionTotal,
  selectedStudentId,
  onSelectStudent,
  answers,
  loading,
  progressLabel,
  onSave,
  savingAnswerId,
  saveError,
  stacked = false,
}: Props) {
  const [sort, setSort] = useState<SortKey>("accuracy");

  const table = toStudentRows(students, rows, questionTotal);
  const submitted = table.filter((row) => row.accuracyPercent !== null);
  const absent = table.filter((row) => row.accuracyPercent === null);
  const ordered =
    sort === "name"
      ? [...submitted].sort((a, b) => a.student.name.localeCompare(b.student.name, "ko"))
      : [...submitted].sort((a, b) => (a.accuracyPercent ?? 0) - (b.accuracyPercent ?? 0));
  // 이름순으로 볼 때까지 그룹을 갈라 두면 순서가 두 번 뒤집힌다 — 정답률 정렬일 때만 묶는다
  const needsHelp =
    sort === "accuracy"
      ? ordered.filter((row) => (row.accuracyPercent ?? 0) <= NEEDS_HELP_MAX)
      : [];
  const rest = ordered.filter((row) => !needsHelp.includes(row));
  const selected = table.find((row) => row.student.id === selectedStudentId) ?? null;

  return (
    <div className={cn("flex flex-1 gap-6 pt-4", stacked && "flex-col gap-3 pt-0")}>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-3", stacked && "hidden")}>
        <div className="flex items-center gap-2">
          <SortChip active={sort === "accuracy"} onClick={() => setSort("accuracy")}>
            정답률 낮은 순
          </SortChip>
          <SortChip active={sort === "name"} onClick={() => setSort("name")}>
            이름순
          </SortChip>
          <p className="ml-auto text-label-md text-muted-foreground">
            제출 {submitted.length}명 · 미제출 {absent.length}명
          </p>
        </div>

        {table.length === 0 ? (
          <div className="flex flex-1 items-center justify-center border-t pt-10 text-body-md text-muted-foreground">
            참여한 학생이 없어요
          </div>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-auto" />
              <col className="w-52" />
              <col className="w-24" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="border-b text-label-md text-muted-foreground">
                <th scope="col" className="h-8 text-left font-normal">
                  학생
                </th>
                <th scope="col" className="h-8 text-left font-normal">
                  정답률
                </th>
                <th scope="col" className="h-8 text-left font-normal">
                  맞힌 문제
                </th>
                <th scope="col" className="h-8 text-right font-normal">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {needsHelp.length > 0 && (
                <GroupRow
                  label={`도움이 필요해요 — 정답률 ${NEEDS_HELP_MAX}% 이하`}
                  count={needsHelp.length}
                  warm
                />
              )}
              {needsHelp.map((row) => (
                <StudentRowView
                  key={row.student.id}
                  row={row}
                  questionTotal={questionTotal}
                  selected={row.student.id === selectedStudentId}
                  onSelect={() => onSelectStudent(row.student.id)}
                />
              ))}

              {needsHelp.length > 0 && rest.length > 0 && (
                <GroupRow label="나머지" count={rest.length} />
              )}
              {rest.map((row) => (
                <StudentRowView
                  key={row.student.id}
                  row={row}
                  questionTotal={questionTotal}
                  selected={row.student.id === selectedStudentId}
                  onSelect={() => onSelectStudent(row.student.id)}
                />
              ))}

              {absent.length > 0 && <GroupRow label="미제출" count={absent.length} />}
              {absent.map((row) => (
                <StudentRowView
                  key={row.student.id}
                  row={row}
                  questionTotal={questionTotal}
                  selected={row.student.id === selectedStudentId}
                  onSelect={() => onSelectStudent(row.student.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section
        className={cn(
          "flex flex-col gap-3",
          stacked ? "flex-1" : "w-[396px] shrink-0 border-l pl-6",
        )}
      >
        {selected !== null && !stacked && (
          <header className="flex items-center gap-2.5 pb-1">
            <StudentAvatar avatar={selected.student.avatar} size={36} />
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-heading-sm text-ink">{selected.student.name}</p>
              <p className="text-label-md text-muted-foreground">
                {selected.correctCount === null
                  ? "미제출"
                  : `맞힌 문제 ${selected.correctCount} / ${questionTotal}`}
              </p>
            </div>
            {selected.accuracyPercent !== null && (
              <span
                className={cn("ml-auto text-heading-md", accuracyText(selected.accuracyPercent))}
              >
                {selected.accuracyPercent}%
              </span>
            )}
          </header>
        )}

        {progressLabel !== null && (
          <p className="text-label-md text-muted-foreground">{progressLabel}</p>
        )}

        {selectedStudentId === null ? (
          <Empty>학생을 고르면 답안이 열려요</Empty>
        ) : loading ? (
          <Empty>답안을 불러오는 중…</Empty>
        ) : answers.length === 0 ? (
          <Empty>이 학생이 낸 서술형 답안이 없어요</Empty>
        ) : (
          answers.map((answer) => (
            <AnswerCard
              key={answer.answerId}
              answer={answer}
              onSave={(draft) => onSave(answer.answerId, draft)}
              saving={savingAnswerId === answer.answerId}
              // 저장 실패 문구는 지금 저장하던 답안 아래에만 붙인다
              errorMessage={savingAnswerId === answer.answerId ? saveError : null}
            />
          ))
        )}
      </section>
    </div>
  );
}

/** 학생 목록에 순위 행의 정답률을 붙인다. 순위에 없으면 미제출로 본다 */
function toStudentRows(
  students: Student[],
  rows: FinalRankRow[],
  questionTotal: number,
): StudentRow[] {
  const byStudentId = new Map(rows.map((row) => [row.student.id, row]));

  return students.map((student) => {
    const correctCount = byStudentId.get(student.id)?.correctCount ?? null;
    const accuracyPercent =
      correctCount === null || questionTotal === 0
        ? null
        : Math.round((correctCount / questionTotal) * 100);

    return { student, correctCount, accuracyPercent };
  });
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-7 rounded-md px-2.5 text-label-md transition-colors",
        active ? "bg-ink text-white" : "border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

/** 그룹 머리 줄 — 표 안에서 구간을 가른다. warm이면 경고 바탕 */
function GroupRow({ label, count, warm }: { label: string; count: number; warm?: boolean }) {
  return (
    <tr className={warm ? "bg-warning-soft" : "bg-muted"}>
      <td
        colSpan={3}
        className={cn("h-7 text-label-md", warm ? "text-warning-strong" : "text-muted-foreground")}
      >
        {label}
      </td>
      <td
        className={cn(
          "h-7 text-right text-label-md",
          warm ? "text-warning-strong" : "text-muted-foreground",
        )}
      >
        {count}명
      </td>
    </tr>
  );
}

/** 표 한 줄 — 누르면 오른쪽 첨삭 칸이 그 학생으로 바뀐다 */
function StudentRowView({
  row,
  questionTotal,
  selected,
  onSelect,
}: {
  row: StudentRow;
  questionTotal: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const absent = row.accuracyPercent === null;

  return (
    <tr
      onClick={onSelect}
      aria-selected={selected}
      className={cn(
        "relative cursor-pointer border-b border-line-soft",
        selected ? "bg-mint-bg" : "hover:bg-muted",
      )}
    >
      <td className="h-12">
        {selected && <span aria-hidden className="absolute top-0 -left-3 h-12 w-[3px] bg-mint" />}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          className="flex items-center gap-2.5 text-left outline-none focus-visible:underline"
        >
          <StudentAvatar avatar={row.student.avatar} size={28} />
          <span className={cn("truncate text-label-lg", absent ? "text-ink-disabled" : "text-ink")}>
            {row.student.name}
          </span>
          <span className="sr-only">답안 보기</span>
        </button>
      </td>
      <td>
        {absent ? (
          <span className="text-label-lg text-ink-disabled">—</span>
        ) : (
          <span className="flex items-center gap-2.5">
            <span className="h-1.5 w-28 overflow-hidden rounded-full bg-line-soft">
              <span
                className={cn("block h-full rounded-full", accuracyFill(row.accuracyPercent ?? 0))}
                style={{ width: `${row.accuracyPercent}%` }}
              />
            </span>
            <span className={cn("text-label-lg", accuracyText(row.accuracyPercent ?? 0))}>
              {row.accuracyPercent}%
            </span>
          </span>
        )}
      </td>
      <td className="text-label-lg text-muted-foreground">
        {absent ? "—" : `${row.correctCount} / ${questionTotal}`}
      </td>
      <td
        className={cn(
          "text-right text-label-md",
          absent ? "text-warning-strong" : "text-muted-foreground",
        )}
      >
        {absent ? "미제출" : "제출"}
      </td>
    </tr>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed text-body-md text-muted-foreground">
      {children}
    </div>
  );
}

/** 답안 한 장 — 모범답안·AI 분석을 옆에 두고 코멘트를 쓴다 */
function AnswerCard({
  answer,
  onSave,
  saving,
  errorMessage,
}: {
  answer: EssayAnswer;
  onSave: (draft: ReviewDraft) => void;
  saving: boolean;
  errorMessage: string | null;
}) {
  const [comment, setComment] = useState(answer.comment);
  const [improvement, setImprovement] = useState(answer.improvement);
  const [score, setScore] = useState(
    answer.adjustedScore === null ? "" : String(answer.adjustedScore),
  );

  const trimmed = score.trim();
  const parsed = trimmed === "" ? null : Number(trimmed);
  const scoreInvalid =
    parsed !== null && (Number.isNaN(parsed) || parsed < 0 || parsed > answer.points);
  // 0 · 절반 · 만점은 손이 가장 많이 가는 값이다 — 숫자를 치지 않고 누르게 둔다
  const quickScores = [0, Math.round(answer.points / 2), answer.points];

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card px-[17px] py-4">
      <header className="flex items-center gap-2.5">
        <span className="text-label-lg text-ink">Q{answer.questionNo}</span>
        <span className="min-w-0 flex-1 truncate text-label-md text-muted-foreground">
          {answer.questionContent}
        </span>
        <span className="shrink-0 text-label-md text-ink">
          {answer.finalScore}/{answer.points}점
        </span>
        {answer.reviewed ? (
          <span className="shrink-0 rounded-full bg-mint-tint px-2 py-0.5 text-label-md text-mint-dark">
            첨삭함
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-label-md text-warning-strong">
            채점 필요
          </span>
        )}
      </header>

      <p className="rounded-xl bg-muted px-3.5 py-3 text-body-md text-ink">{answer.text}</p>

      {answer.modelAnswer !== null && (
        <p className="rounded-xl bg-mint-bg px-3.5 py-3 text-body-md text-mint-dark">
          <span className="mr-2 text-label-md font-bold">모범답안</span>
          {answer.modelAnswer}
        </p>
      )}

      {answer.findings.length > 0 && (
        <ul className="flex flex-col gap-1">
          {answer.findings.map((finding) => (
            <li key={finding.text} className="text-label-md text-muted-foreground">
              {finding.text}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="학생에게 보일 코멘트"
          className="h-[46px] rounded-xl bg-muted px-3.5 text-body-md text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <input
          value={improvement}
          onChange={(e) => setImprovement(e.target.value)}
          placeholder="개선사항 (선택)"
          className="h-[46px] rounded-xl bg-muted px-3.5 text-body-md text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center gap-2">
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            inputMode="numeric"
            aria-label={`보정 점수 (0~${answer.points})`}
            placeholder={`보정 점수 (0~${answer.points}, 비우면 해제)`}
            className="h-[46px] min-w-0 flex-1 rounded-xl bg-muted px-3.5 text-body-md text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          {quickScores.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScore(String(value))}
              className="h-[46px] w-12 shrink-0 rounded-xl border text-label-md text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
            >
              {value}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSave({ comment, improvement, adjustedScore: parsed })}
          disabled={saving || scoreInvalid}
          className="h-[46px] rounded-xl bg-mint text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
        >
          {saving ? "저장하는 중…" : "첨삭 저장"}
        </button>
        {scoreInvalid && (
          <p role="alert" className="text-label-md text-negative">
            보정 점수는 0~{answer.points} 사이여야 해요
          </p>
        )}
        {errorMessage !== null && (
          <p role="alert" className="text-label-md text-negative">
            {errorMessage}
          </p>
        )}
      </div>
    </article>
  );
}
