import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";
import { cn } from "@/lib/utils";

/** 제출 여부까지 붙은 참가자 — 계약의 SubmissionParticipant에서 온다 */
export type SolvingStudent = Student & { submitted: boolean };

type Props = { students: SolvingStudent[] };

/**
 * W-05 제출 현황 레일 (펼침 300px).
 * 제출한 학생은 민트 배경 + 링 + "제출" 칩, 아직 푸는 학생은 평범한 행 + "풀이 중".
 */
export function LiveRail({ students }: Props) {
  const pending = students.filter((s) => !s.submitted);

  return (
    <div className="flex h-full flex-col">
      <div className="px-[26px] pt-7 pb-[18px]">
        <p className="text-body-md text-muted-foreground">지금 {students.length}명이</p>
        <p className="text-heading-md">같이 풀고 있어요</p>
      </div>

      <ul className="flex flex-col gap-2 border-t px-3.5 pt-2.5">
        {students.map((s) => (
          <li
            key={s.id}
            className={cn(
              "flex h-[54px] shrink-0 items-center gap-3.5 rounded-2xl px-3",
              s.submitted && "bg-mint-bg",
            )}
          >
            <StudentAvatar
              avatar={s.avatar}
              size={36}
              className={cn(s.submitted && "ring-2 ring-mint ring-offset-2 ring-offset-mint-bg")}
            />
            <span className="min-w-0 flex-1 truncate text-heading-md">{s.name}</span>
            {s.submitted ? (
              <span className="shrink-0 rounded-full bg-mint px-3.5 py-1 text-label-md font-bold text-white">
                제출
              </span>
            ) : (
              <span className="shrink-0 text-body-md text-muted-foreground">풀이 중</span>
            )}
          </li>
        ))}
      </ul>

      {pending.length > 0 && (
        <div className="mt-auto px-[26px] pb-8">
          <div className="border-t pt-5">
            <p className="text-label-md font-bold tracking-[0.08em] text-muted-foreground">
              아직 안 낸 학생
            </p>
            <p className="mt-2 text-heading-md">{pending.map((s) => s.name).join(" · ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** W-05 제출 현황 레일 (접힘 72px) — 제출/전체 카운트 + 제출한 학생만 링 강조 */
export function LiveRailMini({ students }: Props) {
  const submittedCount = students.filter((s) => s.submitted).length;

  return (
    <div className="flex h-full flex-col items-center pt-8">
      <p className="text-heading-lg text-mint">{submittedCount}</p>
      <p className="text-label-md text-muted-foreground">/ {students.length}</p>
      <div className="mt-5 h-px w-10 bg-border" />

      <ul className="mt-4 flex flex-col items-center gap-5">
        {students.map((s) => (
          <li key={s.id}>
            <StudentAvatar
              avatar={s.avatar}
              size={36}
              className={cn(
                s.submitted && "ring-2 ring-mint ring-offset-2 ring-offset-surface-subtle",
              )}
            />
          </li>
        ))}
      </ul>

      <p className="mt-5 text-label-md text-ink-disabled">제출</p>
    </div>
  );
}
