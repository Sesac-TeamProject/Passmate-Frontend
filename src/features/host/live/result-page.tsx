import { StudentAvatar } from "@/components/common/student-avatar";
import type { QuestionResult, Student } from "@/features/host/types";
import { ChoiceRow, type ChoiceRowState } from "./choice-row";
import { ProjectorShell } from "./projector-shell";
import { QuestionRail } from "./question-rail";
import { RANKING_LIMIT, ResultRail, ResultRailMini, type RankingRow } from "./result-rail";

type Props = {
  /** 방금 끝난 문항 번호와 총 문항 수 */
  questionIndex: number;
  questionTotal: number;
  result: QuestionResult;
  /** 랭킹 이름·아바타를 찾을 학생 목록 */
  students: Student[];
  /**
   * 이 문항을 틀린 학생. 문항별 오답자 목록은 계약에 없어 지금은 늘 빈 배열이고,
   * 비면 섹션 자체를 감춘다 (DESIGN_GAPS D-17).
   */
  wrongStudents: Student[];
  /**
   * 문항별 정답률(%) — 아직 풀지 않은 문항은 null. 진행 중 누적 정답률 계약이 없어
   * 지금은 현재 문항만 채워진다 (DESIGN_GAPS D-18).
   */
  accuracyByQuestion: (number | null)[];
  /** 마지막 문항이면 "다음 문항" 대신 "세션 종료" */
  isLastQuestion: boolean;
  onNext: () => void;
  onEndSession: () => void;
  pending?: boolean;
  /** 다음 문항·세션 종료 요청이 실패했을 때 보여줄 문구 */
  errorMessage?: string | null;
};

const FALLBACK_STUDENT: Omit<Student, "id"> = { name: "학생", avatar: "cat" };

/**
 * W-06 문항 결과 (프로젝터) — 정답과 정답률을 크게 세우고, 응답 분포를 정답/많이 고른 오답/기본
 * 3상태 행으로 보여 주고, 랭킹은 오른쪽 레일로 뺀다.
 */
export function ResultPage({
  questionIndex,
  questionTotal,
  result: r,
  students,
  wrongStudents,
  accuracyByQuestion,
  isLastQuestion,
  onNext,
  onEndSession,
  pending = false,
  errorMessage = null,
}: Props) {
  const byId = new Map(students.map((s) => [s.id, s]));
  const student = (id: string): Student => byId.get(id) ?? { id, ...FALLBACK_STUDENT };

  const correctIndex = r.distribution.findIndex((d) => d.key === r.correct);
  const correctText = correctIndex >= 0 ? r.distribution[correctIndex].text : null;
  const maxCount = Math.max(...r.distribution.map((d) => d.count), 0);

  // 정답을 뺀 보기 중 가장 많이 고른 것 하나만 "많이 고른 오답"으로 세운다 (아무도 안 골랐으면 없음)
  const commonWrongKey = r.distribution
    .filter((d) => d.key !== r.correct && d.count > 0)
    .sort((a, b) => b.count - a.count)[0]?.key;

  const rows: RankingRow[] = r.ranking.slice(0, RANKING_LIMIT).map((row) => ({
    rank: row.rank,
    student: student(row.studentId),
    score: row.score,
    change: row.change,
  }));
  const averageScore = r.ranking.length
    ? Math.round(r.ranking.reduce((sum, row) => sum + row.score, 0) / r.ranking.length)
    : null;

  return (
    <ProjectorShell
      rail={
        <ResultRail
          rows={rows}
          accuracyByQuestion={accuracyByQuestion}
          averageScore={averageScore}
          totalStudents={students.length}
        />
      }
      railCollapsed={<ResultRailMini rows={rows} />}
      top={
        <>
          <QuestionRail current={questionIndex} total={questionTotal} />
          <span className="text-label-md font-bold tracking-[0.16em] text-mint-dark">
            문항 종료
          </span>
        </>
      }
      bottom={
        <>
          {errorMessage ? (
            <p role="alert" className="text-body-md text-negative">
              {errorMessage}
            </p>
          ) : (
            <p className="text-body-md text-muted-foreground">
              마지막 문항이 끝나면 최종 결과와 리포트가 열려요
            </p>
          )}
          <button
            type="button"
            onClick={isLastQuestion ? onEndSession : onNext}
            disabled={pending}
            className="h-13 w-44 rounded-2xl bg-mint text-heading-sm font-bold text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
          >
            {isLastQuestion ? "세션 종료" : "다음 문항"}
          </button>
        </>
      }
    >
      <div className="mt-8 flex items-start justify-between">
        <div className="flex flex-col gap-3.5">
          <span className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
            정답
          </span>
          {correctText === null ? (
            <p className="text-heading-lg text-muted-foreground">
              서술형 — 정답 대신 AI 분석이 리포트에 담겨요
            </p>
          ) : (
            <div className="flex items-center gap-[18px]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint text-heading-md text-white">
                {correctIndex + 1}
              </span>
              <strong className="text-display-lg">{correctText}</strong>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3.5">
          <span className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
            정답률
          </span>
          <strong className="text-display-lg text-mint">{r.accuracy}%</strong>
          {r.accuracyDelta !== 0 && (
            <span className="text-body-md text-mint-dark">
              {r.accuracyDelta > 0 ? "▲" : "▼"} 지난 문항보다 {Math.abs(r.accuracyDelta)}%p{" "}
              {r.accuracyDelta > 0 ? "올랐어요" : "내렸어요"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-7">
        <h2 className="text-label-md font-bold tracking-[0.2em] text-muted-foreground">
          응답 분포
        </h2>
        <ul className="mt-3.5 flex flex-col gap-2">
          {r.distribution.map((d, i) => {
            const state: ChoiceRowState =
              d.key === r.correct
                ? "correct"
                : d.key === commonWrongKey
                  ? "commonWrong"
                  : "default";
            return (
              <ChoiceRow
                key={d.key}
                no={i + 1}
                text={d.text}
                count={d.count}
                maxCount={maxCount}
                state={state}
              />
            );
          })}
        </ul>
      </div>

      {wrongStudents.length > 0 && (
        <div className="mt-7 border-t pt-6">
          <h2 className="text-label-md font-bold tracking-[0.08em] text-muted-foreground">
            이 문항을 틀린 학생
          </h2>
          <div className="mt-3.5 flex items-center gap-10">
            <ul className="flex items-center gap-10">
              {wrongStudents.map((s) => (
                <li key={s.id} className="flex items-center gap-2.5">
                  <StudentAvatar avatar={s.avatar} size={30} />
                  <span className="text-heading-md">{s.name}</span>
                </li>
              ))}
            </ul>
            {/* TODO(API): 이름을 눌러 고른 보기를 여는 상호작용은 계약이 없다 (DESIGN_GAPS D-17) */}
            <p className="text-body-md text-muted-foreground">
              이름을 누르면 그 학생이 고른 보기를 볼 수 있어요
            </p>
          </div>
        </div>
      )}
    </ProjectorShell>
  );
}
