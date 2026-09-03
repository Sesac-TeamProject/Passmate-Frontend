"use client";

import { useState } from "react";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { EssayAnswer, Student } from "@/features/host/types";
import { cn } from "@/lib/utils";

export type ReviewDraft = {
  comment: string;
  improvement: string;
  /** 비우면 보정을 지운다 — 서버가 채점기 점수로 되돌린다 */
  adjustedScore: number | null;
};

type Props = {
  students: Student[];
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
};

/**
 * W-07 학생별 탭 — 학생을 고르면 그 학생의 서술형 답안이 뜨고, 답안마다 첨삭을 남긴다.
 *
 * 첨삭은 **답안 단위**다(`PUT /rooms/{id}/answers/{answerId}/review`) — 문항 단위가 아니다.
 * 세 항목 모두 선택이고 넘긴 값 그대로 저장되므로, 비워서 보내면 지워진다.
 */
export function StudentReviewPanel({
  students,
  selectedStudentId,
  onSelectStudent,
  answers,
  loading,
  progressLabel,
  onSave,
  savingAnswerId,
  saveError,
}: Props) {
  return (
    <div className="flex flex-1 gap-5">
      <ul className="flex w-[220px] shrink-0 flex-col gap-1.5">
        {students.length === 0 ? (
          <li className="rounded-xl border border-dashed px-3.5 py-6 text-center text-body-md text-muted-foreground">
            참여한 학생이 없어요
          </li>
        ) : (
          students.map((student) => (
            <li key={student.id}>
              <button
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                  student.id === selectedStudentId ? "bg-mint-bg" : "hover:bg-muted",
                )}
              >
                <StudentAvatar avatar={student.avatar} size={28} />
                <span className="truncate text-label-lg text-ink">{student.name}</span>
              </button>
            </li>
          ))
        )}
      </ul>

      <section className="flex flex-1 flex-col gap-3">
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
        {answer.reviewed && (
          <span className="shrink-0 rounded-full bg-mint-tint px-2 py-0.5 text-label-md text-mint-dark">
            첨삭함
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
            placeholder={`보정 점수 (0~${answer.points}, 비우면 해제)`}
            className="h-[46px] flex-1 rounded-xl bg-muted px-3.5 text-body-md text-ink outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => onSave({ comment, improvement, adjustedScore: parsed })}
            disabled={saving || scoreInvalid}
            className="h-[46px] shrink-0 rounded-xl bg-mint px-5 text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
          >
            {saving ? "저장하는 중…" : "첨삭 저장"}
          </button>
        </div>
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
