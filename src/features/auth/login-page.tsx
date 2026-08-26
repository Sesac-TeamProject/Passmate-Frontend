import Link from "next/link";
import type { ChoiceKey } from "@/features/teacher/mock";
import { CHOICE_CLASS } from "@/features/teacher/live/choice-letter";
import { cn } from "@/lib/utils";

const KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

/** C-01 로그인 (웹·앱 공통) — 좌측 브랜드 패널 + 우측 시작하기 카드 */
export function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[620px] shrink-0 flex-col gap-7 bg-[#e3f5ec] px-16 pt-[88px] pb-16">
        <div className="flex gap-3" aria-hidden>
          {KEYS.map((k) => (
            <span
              key={k}
              className={cn(
                "flex size-[46px] items-center justify-center rounded-[14px] text-xl font-black",
                CHOICE_CLASS[k].solid,
              )}
            >
              {k}
            </span>
          ))}
        </div>
        <h1 className="text-[34px] leading-[1.45] font-black whitespace-pre-line text-[#0f3d2e]">
          {"선생님이 방을 열고,\nAI가 문제를 만들고,\n모두가 실전처럼 풉니다."}
        </h1>
        <p className="text-base font-bold text-[#0f3d2e]">방 코드 하나로 시작하는 실전형 학습 룸</p>
        <div className="mt-auto flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-mint text-[15px] font-black text-white">
            P
          </span>
          <span className="text-xl font-black text-[#0f3d2e]">패스메이트</span>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-8">
        <section className="flex w-[420px] flex-col items-center rounded-[28px] border bg-card px-10 pt-10 pb-9">
          <h2 className="text-[26px] font-black text-ink">시작하기</h2>
          <p className="pt-2 text-sm text-muted-foreground">선생님·학생 공용 계정이에요</p>
          <button
            type="button"
            className="mt-8 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl border bg-card text-[15px] font-bold text-ink transition-colors hover:bg-muted"
          >
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-full border text-xs font-black text-[#4285f4]"
            >
              G
            </span>
            Google로 계속하기
          </button>
          <div className="flex w-full items-center gap-3 py-[22px] text-xs text-[#7f7e88]">
            <hr className="flex-1 border-muted" />
            또는
            <hr className="flex-1 border-muted" />
          </div>
          <Link
            href="/join"
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-mint text-[15px] font-black text-white transition-colors hover:bg-mint-dark"
          >
            PIN으로 게스트 입장
          </Link>
          <p className="pt-3.5 text-xs text-[#7f7e88]">게스트 기록은 세션이 끝나면 사라져요</p>
        </section>
      </main>
    </div>
  );
}
