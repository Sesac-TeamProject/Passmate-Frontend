import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/teacher/mock";

/** 대기실 학생 목록의 알약 칩 (아바타 + 닉네임). 누르면 내보내기 — 데이터 연동 시 구현 */
export function StudentChip({ student }: { student: Student }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border bg-card py-[7px] pr-[18px] pl-2 text-[15px] font-black text-ink transition-colors hover:border-mint"
    >
      <StudentAvatar avatar={student.avatar} size={30} />
      {student.name}
    </button>
  );
}
