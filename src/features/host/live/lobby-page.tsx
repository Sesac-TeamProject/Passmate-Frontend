import Link from "next/link";
import { formatPin, LIVE_ROOM } from "@/features/host/mock";
import { ProjectorShell } from "./projector-shell";
import { StudentChip } from "./student-chip";

/** W-04 대기실 (프로젝터 · 기본형) — 민트 배경, PIN/QR 표시, 입장한 학생 목록 */
export function LobbyPage() {
  const room = LIVE_ROOM;
  const pin = formatPin(room.pin);

  return (
    <ProjectorShell
      tone="mint"
      mascot
      top={
        <header className="flex h-[60px] shrink-0 items-center justify-center gap-2 text-heading-sm">
          <span className="text-mint-ink-secondary">passmate.app 에 접속해서</span>
          <span className="text-mint-ink">PIN {pin}</span>
          <span className="text-mint-ink-secondary">을 입력하세요</span>
        </header>
      }
      bottom={
        <>
          <p className="text-label-lg text-mint-ink-secondary">
            학생 이름을 누르면 내보낼 수 있어요
          </p>
          <Link
            href={`/host/rooms/${room.code}/live`}
            className="flex h-14 w-[190px] items-center justify-center rounded-2xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark"
          >
            세션 시작
          </Link>
        </>
      }
    >
      <h1 className="pt-11 text-heading-lg text-mint-ink">{room.title}</h1>

      <div className="flex items-center gap-7 pt-7">
        <div className="flex flex-col items-center gap-0.5 rounded-[28px] border bg-card px-16 pt-[26px] pb-[30px]">
          <span className="text-display-lg text-mint-dark">{pin}</span>
          <span className="text-label-lg text-muted-foreground">참여 PIN</span>
        </div>
        <div className="flex flex-col items-center gap-2.5 rounded-3xl border bg-card px-[22px] pt-[22px] pb-4">
          {/* TODO(API): 방 입장 URL QR */}
          <div aria-label="QR 코드" className="size-[116px] rounded-[10px] bg-muted" />
          <span className="text-label-lg text-muted-foreground">QR로 바로 입장</span>
        </div>
      </div>

      <section className="flex flex-col items-center gap-3.5 pt-10">
        <h2 className="text-heading-sm text-mint-ink">학생 {room.students.length}명이 함께해요</h2>
        <ul className="flex flex-wrap items-center justify-center gap-2.5">
          {room.students.map((s) => (
            <li key={s.id}>
              <StudentChip student={s} />
            </li>
          ))}
          <li className="rounded-full bg-mint-tint px-[18px] py-[11px] text-label-lg text-mint-dark">
            입장 중 · · ·
          </li>
        </ul>
      </section>
    </ProjectorShell>
  );
}
