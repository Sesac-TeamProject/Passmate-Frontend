import { clsx } from "clsx";
import type { QuestionResult, Student } from "@/features/host/types";
import { cn } from "@/lib/utils";
import { CHOICE_CLASS } from "./choice-letter";
import { Podium } from "./podium";
import { ProjectorShell } from "./projector-shell";

type Props = {
  /** 방금 끝난 문항 번호와 총 문항 수 */
  questionIndex: number;
  questionTotal: number;
  result: QuestionResult;
  /** 랭킹 이름·아바타를 찾을 학생 목록 */
  students: Student[];
  /** 마지막 문항이면 "다음 문항" 대신 "세션 종료" */
  isLastQuestion: boolean;
  onNext: () => void;
  onEndSession: () => void;
  pending?: boolean;
  /** 다음 문항·세션 종료 요청이 실패했을 때 보여줄 문구 */
  errorMessage?: string | null;
};

const FALLBACK_STUDENT: Omit<Student, "id"> = { name: "학생", avatar: "cat" };

/** W-06 문항 결과 (프로젝터 · 민트 톤 G7rpdd) — 정답 공개, 랭킹 TOP 5, 응답 분포 */
export function ResultPage({
  questionIndex,
  questionTotal,
  result: r,
  students,
  isLastQuestion,
  onNext,
  onEndSession,
  pending = false,
  errorMessage = null,
}: Props) {
  const byId = new Map(students.map((s) => [s.id, s]));
  const student = (id: string): Student => byId.get(id) ?? { id, ...FALLBACK_STUDENT };
  const correct = r.correct ? r.distribution.find((d) => d.key === r.correct) : undefined;
  const maxCount = Math.max(...r.distribution.map((d) => d.count), 1);
  const [top1, top2, top3, ...rest] = r.ranking;
  const hasPodium = r.ranking.length >= 3;

  return (
    <ProjectorShell
      top={
        <>
          <span className="text-heading-lg">
            Q{questionIndex} / {questionTotal} · 결과
          </span>
          {r.correct ? (
            <span className="flex items-center gap-2.5 rounded-[14px] bg-positive py-2.5 pr-5 pl-[18px] text-heading-sm text-white">
              <span className="flex size-[26px] items-center justify-center rounded-lg bg-card text-label-lg text-positive">
                {r.correct}
              </span>
              정답 · {correct?.text ?? ""}
            </span>
          ) : (
            <span className="rounded-[14px] bg-card py-2.5 pr-5 pl-[18px] text-heading-sm text-muted-foreground">
              서술형 — 정답 대신 AI 분석이 리포트에 담겨요
            </span>
          )}
        </>
      }
      bottom={
        <>
          {errorMessage ? (
            <p role="alert" className="text-label-lg text-negative">
              {errorMessage}
            </p>
          ) : (
            <p className="text-label-lg text-muted-foreground">
              마지막 문항이 끝나면 최종 결과와 리포트가 열려요
            </p>
          )}
          <button
            type="button"
            onClick={isLastQuestion ? onEndSession : onNext}
            disabled={pending}
            className="flex h-[46px] items-center rounded-xl bg-mint px-[26px] text-label-lg text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
          >
            {isLastQuestion ? "세션 종료" : "다음 문항"}
          </button>
        </>
      }
    >
      <div className="flex w-full flex-col gap-5 pt-2 pb-7">
        <section className="flex flex-col gap-[18px] rounded-3xl border bg-card px-[34px] py-[26px]">
          <h2 className="text-heading-lg text-ink">랭킹 TOP 5</h2>
          {r.ranking.length === 0 ? (
            <p className="text-body-md text-muted-foreground">
              아직 채점된 점수가 없어요 — 첫 채점이 끝나면 순위가 올라옵니다
            </p>
          ) : (
            <div className="flex items-center gap-14">
              {hasPodium && (
                <Podium
                  first={student(top1.studentId)}
                  second={student(top2.studentId)}
                  third={student(top3.studentId)}
                />
              )}
              <ol className="flex flex-1 flex-col gap-1">
                {(hasPodium ? rest : r.ranking).map((row) => (
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
          )}
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
            {r.accuracyDelta === 0 ? (
              `정답률 ${r.accuracy}%`
            ) : (
              <>
                <span className="flex size-[22px] items-center justify-center rounded-full bg-warning-soft text-warning">
                  {r.accuracyDelta > 0 ? "↑" : "↓"}
                </span>
                정답률 {r.accuracy}% — 지난 문항보다 {Math.abs(r.accuracyDelta)}%p{" "}
                {r.accuracyDelta > 0 ? "올랐어요" : "내렸어요"}
              </>
            )}
          </p>
        </section>
      </div>
    </ProjectorShell>
  );
}

/** 랭킹 변동 (▲n / ▼n / –). twMerge의 text-* 충돌을 피하려 clsx 사용 */
function RankChange({ change }: { change: number }) {
  if (change === 0) return <span className="w-7 text-label-lg text-muted-foreground">–</span>;
  const up = change > 0;
  return (
    <span className={clsx("w-7 text-label-lg", up ? "text-positive" : "text-negative")}>
      {up ? "▲" : "▼"}
      {Math.abs(change)}
    </span>
  );
}
