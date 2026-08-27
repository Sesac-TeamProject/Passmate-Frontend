import Link from "next/link";
import { clsx } from "clsx";
import { LIVE_QUESTION, LIVE_ROOM, QUESTION_RESULT } from "@/features/host/mock";
import { cn } from "@/lib/utils";
import { CHOICE_CLASS } from "./choice-letter";
import { Podium } from "./podium";
import { ProjectorShell } from "./projector-shell";

/** W-06 문항 결과 (프로젝터 · 민트 톤 G7rpdd) — 정답 공개, 랭킹 TOP 5, 응답 분포 */
export function ResultPage() {
  const q = LIVE_QUESTION;
  const r = QUESTION_RESULT;
  const room = LIVE_ROOM;
  const byId = new Map(room.students.map((s) => [s.id, s]));
  const student = (id: string) => byId.get(id)!;
  const correct = r.distribution.find((d) => d.key === r.correct)!;
  const maxCount = Math.max(...r.distribution.map((d) => d.count), 1);
  const [top1, top2, top3, ...rest] = r.ranking;

  return (
    <ProjectorShell
      tone="mint"
      top={
        <header className="flex items-center justify-between px-10 pt-[22px] pb-4">
          <span className="text-heading-lg text-[#0f3d2e]">
            Q{q.index} / {q.total} · 결과
          </span>
          <span className="flex items-center gap-2.5 rounded-[14px] bg-[#338158] py-2.5 pr-5 pl-[18px] text-heading-sm text-white">
            <span className="flex size-[26px] items-center justify-center rounded-lg bg-card text-label-lg text-[#338158]">
              {r.correct}
            </span>
            정답 · {correct.text}
          </span>
        </header>
      }
      bottomClassName="py-[18px]"
      bottom={
        <>
          <p className="text-label-lg text-[#3f6b5b]">
            마지막 문항이 끝나면 최종 결과와 리포트가 열려요
          </p>
          <Link
            href={`/host/rooms/${room.code}/live`}
            className="flex h-[46px] items-center rounded-xl bg-mint px-[26px] text-label-lg text-white transition-colors hover:bg-mint-dark"
          >
            다음 문항
          </Link>
        </>
      }
    >
      <main className="flex w-full flex-col gap-5 px-12 pt-2 pb-7">
        <section className="flex flex-col gap-[18px] rounded-3xl border bg-card px-[34px] py-[26px]">
          <h2 className="text-heading-lg text-ink">랭킹 TOP 5</h2>
          <div className="flex items-center gap-14">
            <Podium
              first={student(top1.studentId)}
              second={student(top2.studentId)}
              third={student(top3.studentId)}
            />
            <ol className="flex flex-1 flex-col gap-1">
              {rest.map((row) => (
                <li
                  key={row.rank}
                  className="flex items-center gap-4 border-t-2 py-3.5 text-heading-md"
                >
                  <span className="text-muted-foreground">{row.rank}</span>
                  <span className="flex-1 text-ink">{student(row.studentId).name}</span>
                  <span className="text-ink">{row.score}</span>
                  <RankChange change={row.change} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="flex flex-col gap-[18px] rounded-3xl border bg-card px-8 py-[26px]">
          <h2 className="text-heading-sm text-ink">응답 분포</h2>
          {r.distribution.map((d) => {
            const isCorrect = d.key === r.correct;
            return (
              <div key={d.key} className="flex items-center gap-3">
                <span
                  className={clsx(
                    "flex size-8 shrink-0 items-center justify-center rounded-[10px] text-heading-sm",
                    isCorrect ? CHOICE_CLASS[d.key].solid : CHOICE_CLASS[d.key].muted,
                  )}
                >
                  {d.key}
                </span>
                <span
                  className={clsx(
                    "w-[170px] text-heading-sm",
                    isCorrect ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {d.text}
                </span>
                <div className="flex-1">
                  <div
                    className={cn(
                      "h-5 rounded-lg",
                      CHOICE_CLASS[d.key].bar,
                      !isCorrect && "opacity-35",
                    )}
                    style={{ width: `max(54px, ${(d.count / maxCount) * 100}%)` }}
                  />
                </div>
                <span
                  className={clsx(
                    "w-10 text-label-lg",
                    isCorrect ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {d.count}명
                </span>
              </div>
            );
          })}
          <p className="flex items-center gap-1.5 pt-1 text-label-lg text-muted-foreground">
            <span className="flex size-[22px] items-center justify-center rounded-full bg-[#fdf3de] text-[#916616]">
              {r.accuracyDelta >= 0 ? "↑" : "↓"}
            </span>
            정답률 {r.accuracy}% — 지난 문항보다 {Math.abs(r.accuracyDelta)}%p{" "}
            {r.accuracyDelta >= 0 ? "올랐어요" : "내렸어요"}
          </p>
        </section>
      </main>
    </ProjectorShell>
  );
}

/** 랭킹 변동 (▲n / ▼n / –). twMerge의 text-* 충돌을 피하려 clsx 사용 */
function RankChange({ change }: { change: number }) {
  if (change === 0) return <span className="w-7 text-label-lg text-muted-foreground">–</span>;
  const up = change > 0;
  return (
    <span className={clsx("w-7 text-label-lg", up ? "text-[#338158]" : "text-[#e03131]")}>
      {up ? "▲" : "▼"}
      {Math.abs(change)}
    </span>
  );
}
