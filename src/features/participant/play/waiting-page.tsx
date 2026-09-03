import { Mascot } from "@/components/common/mascot";
import { StudentAvatar } from "@/components/common/student-avatar";
import type { Student } from "@/features/host/types";
import { formatPin } from "@/lib/format";

/** 아바타 스택에 늘어놓는 최대 인원 — 넘치면 "+N" 원으로 접는다 (시안 4명 + "+1") */
const STACK_LIMIT = 4;

type Props = {
  roomTitle: string;
  /** 6자리 참여 PIN */
  pin: string;
  /** 내 닉네임. 참여 기록이 없으면(새로고침·다른 탭) null */
  myName: string | null;
  students: Student[];
  /** 회원으로 들어왔는가 — 기록이 계정에 남는다는 약속은 회원에게만 한다 */
  isMember?: boolean;
};

/**
 * M-02 대기실 (앱 시안 → 데스크톱 웹 이식).
 * 학생이 입장한 뒤 선생님이 시작할 때까지 머무는 화면.
 */
export function WaitingPage({ roomTitle, pin, myName, students, isMember }: Props) {
  const shown = students.slice(0, STACK_LIMIT);
  const overflow = students.length - shown.length;

  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-screen flex-col items-center px-5 pt-16 pb-10"
    >
      <div className="flex w-full max-w-sm flex-col gap-1.5">
        <h1 className="text-heading-md">{roomTitle}</h1>
        <p className="text-label-lg text-mint-dark">PIN {formatPin(pin)}</p>
      </div>

      <div className="mt-16 flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border bg-card px-6 py-8">
        <span
          aria-hidden
          className="flex size-22 items-center justify-center rounded-full bg-muted"
        >
          <Mascot className="h-[66px] w-[60px]" />
        </span>

        <p className="text-heading-lg">입장 완료!</p>
        <p className="text-label-lg text-muted-foreground">
          {myName ? `${myName} 님, ` : ""}선생님이 곧 시작해요
        </p>

        <ul className="flex items-center gap-1.5">
          {shown.map((s) => (
            <li key={s.id}>
              <StudentAvatar avatar={s.avatar} size={34} />
            </li>
          ))}
          {overflow > 0 && (
            <li className="flex size-[34px] items-center justify-center rounded-full bg-muted text-label-lg text-muted-foreground">
              +{overflow}
            </li>
          )}
        </ul>

        <p className="text-body-md text-muted-foreground">학생 {students.length}명이 함께해요</p>

        {isMember ? (
          <p className="text-label-md text-mint-dark">오늘 푼 기록은 내 계정에 저장돼요</p>
        ) : null}
      </div>

      <span aria-hidden className="mt-auto flex items-center gap-1.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-[7px] animate-pulse rounded-full bg-mint"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </main>
  );
}
