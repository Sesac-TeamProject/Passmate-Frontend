import { AppError } from "@/lib/types/app-error";
import type {
  GenerateQuestionSetRequest,
  QuestionDraft,
  QuestionSetDetailResponse,
  QuestionSetDto,
  QuestionSetsResponse,
  SnapshotQuestion,
  UpdateQuestionSetRequest,
} from "@/lib/types/dto";
import { LIVE_QUESTIONS, QUESTION_SETS } from "./fixtures";

/** 문제 세트(question-sets) 목 응답. @draft 라우트(생성·상세·수정·확정·복제)는 계약 도착 시 다시 맞춘다. */

const GENERATE_DELAY_MS = 1500;
const DEFAULT_QUESTION_TIME_LIMIT_SEC = 30;
const DEFAULT_QUESTION_POINTS = 100;

let confirmedSets: QuestionSetDto[] = [...QUESTION_SETS];
let draftSets: QuestionSetDetailResponse[] = [];
let nextSetId = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDraftQuestion(q: SnapshotQuestion): QuestionDraft {
  return {
    questionId: q.questionId,
    questionNo: q.questionNo,
    type: q.type ?? "MCQ",
    body: q.body,
    choices: q.choices ?? null,
    answer: null,
    explanation: null,
    points: q.points ?? DEFAULT_QUESTION_POINTS,
    timeLimitSec: q.timeLimitSec ?? DEFAULT_QUESTION_TIME_LIMIT_SEC,
    // 시안 W-02b는 서술형만 자동 넘김이 꺼져 있다 — 표본이 하나뿐이라 추정이다
    autoAdvance: q.type !== "ESSAY",
    origin: "AI",
  };
}

/** GET /question-sets — status 쿼리가 있으면 필터, 없으면 전체(확정 세트) */
export function mockQuestionSets(url: URL): QuestionSetsResponse {
  const status = url.searchParams.get("status");
  const items = status ? confirmedSets.filter((s) => s.status === status) : confirmedSets;
  return { items, nextCursor: null, hasNext: false };
}

/** @draft POST /question-sets — 빈 세트를 직접 만들어 편집을 시작한다 */
export function mockCreateQuestionSet(body: unknown): QuestionSetDetailResponse {
  const title =
    typeof body === "object" && body !== null && "title" in body && typeof body.title === "string"
      ? body.title
      : "새 세트";
  const detail: QuestionSetDetailResponse = {
    setId: nextSetId++,
    title,
    status: "DRAFT",
    questions: [],
  };
  draftSets = [...draftSets, detail];
  return detail;
}

/** @draft POST /question-sets/{setId}/questions/generate — AI 생성은 시간이 걸린다 */
export async function mockGenerate(
  body: GenerateQuestionSetRequest,
): Promise<QuestionSetDetailResponse> {
  await delay(GENERATE_DELAY_MS);

  const detail: QuestionSetDetailResponse = {
    setId: nextSetId++,
    title: body.topic,
    status: "DRAFT",
    questions: LIVE_QUESTIONS.map(toDraftQuestion),
  };
  draftSets = [...draftSets, detail];
  return detail;
}

/** @draft GET /question-sets/{id} */
export function mockQuestionSetDetail(id: string): QuestionSetDetailResponse {
  const numericId = Number(id);
  const draft = draftSets.find((d) => d.setId === numericId);
  if (draft) return draft;

  const confirmed = confirmedSets.find((s) => s.setId === numericId);
  if (!confirmed) throw new AppError("NotFound");

  return {
    setId: confirmed.setId ?? numericId,
    title: confirmed.title ?? "",
    status: "CONFIRMED",
    questions: LIVE_QUESTIONS.map(toDraftQuestion),
  };
}

/** @draft PATCH /question-sets/{id} */
export function mockUpdateQuestionSet(
  id: string,
  body: UpdateQuestionSetRequest,
): QuestionSetDetailResponse {
  const current = mockQuestionSetDetail(id);
  const updated: QuestionSetDetailResponse = {
    ...current,
    title: body.title ?? current.title,
    questions: body.questions ?? current.questions,
  };

  const index = draftSets.findIndex((d) => d.setId === updated.setId);
  draftSets =
    index >= 0 ? draftSets.map((d, i) => (i === index ? updated : d)) : [...draftSets, updated];
  return updated;
}

/** @draft POST /question-sets/{id}/confirm — 목록에 없던 세트면 새로 올린다 */
export function mockConfirmQuestionSet(id: string): QuestionSetDetailResponse {
  const detail = mockQuestionSetDetail(id);
  const confirmed: QuestionSetDetailResponse = { ...detail, status: "CONFIRMED" };

  draftSets = draftSets.filter((d) => d.setId !== confirmed.setId);

  if (!confirmedSets.some((s) => s.setId === confirmed.setId)) {
    confirmedSets = [
      {
        setId: confirmed.setId,
        title: confirmed.title,
        status: "CONFIRMED",
        questionCount: confirmed.questions.length,
        usedCount: 0,
        lastUsedAt: null,
      },
      ...confirmedSets,
    ];
  }

  return confirmed;
}

/** @draft POST /question-sets/{setId}/duplicate */
export function mockDuplicateQuestionSet(id: string): QuestionSetDetailResponse {
  const source = mockQuestionSetDetail(id);
  const clone: QuestionSetDetailResponse = {
    ...source,
    setId: nextSetId++,
    title: `${source.title} (복제)`,
  };

  confirmedSets = [
    {
      setId: clone.setId,
      title: clone.title,
      status: clone.status,
      questionCount: clone.questions.length,
      usedCount: 0,
      lastUsedAt: null,
    },
    ...confirmedSets,
  ];

  return clone;
}

/**
 * @draft POST /question-sets/{setId}/questions/generate-from-file — 자료(PDF 등) 기반 문항 생성.
 * 경로만 확정이고 응답 필드는 미확보라, 조건 생성과 같은 세트 상세를 돌려준다.
 * 라우트 스윕이 실제 FormData가 아닌 `{}`로도 호출하므로 `instanceof` 가드를 둔다.
 */
export async function mockGenerateFromFile(form: FormData): Promise<QuestionSetDetailResponse> {
  const file = form instanceof FormData ? (form.get("file") as File | null) : null;
  return mockGenerate({
    topic: file?.name ?? "업로드 자료",
    counts: [{ type: "MCQ", count: 3 }],
    difficulty: "MEDIUM",
  });
}
