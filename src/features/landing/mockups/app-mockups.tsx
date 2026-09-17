"use client";

import { GeneratePanel } from "@/features/host/editor/generate-panel";
import { PlayPage } from "@/features/participant/play/play-page";
import { FinalResultPage } from "@/features/participant/result/final-result-page";
import { QuestionDetailPage } from "@/features/participant/result/question-detail-page";
import {
  ANSWER_DETAIL_MOCK,
  FINAL_PODIUM_MOCK,
  FINAL_QUESTION_ROWS_MOCK,
  FINAL_RANK_ROWS_MOCK,
  LIVE_QUESTION,
  LIVE_ROOM,
  PLAY_RANK_MOCK,
  PLAY_REVEAL_MOCK,
  PLAY_SCORE_MOCK,
} from "./mock-data";

/*
 * 폰 랜딩(L-01m)에 넣는 실제 화면들. 웹 화면 컴포넌트를 목 데이터로 그대로 렌더한다 — 폰 폭(768 미만)에서만
 * 쓰이므로 각 화면은 자기 폰 배치(M-03 · M-04 · M-05 · M-06)로 그려진다.
 * 목업은 조작할 수 없다(PhoneFrame이 inert) — 콜백은 아무 일도 하지 않는다.
 */
const noop = () => {};

/** 에디터 왼쪽 "AI로 문제 만들기" 패널 (W-03) — 폰 틀(390) 안에 담으므로 회색 바탕 가운데에 세운다 */
export function GenerateMockup() {
  return (
    <div className="flex min-h-full justify-center bg-background px-6 pt-12">
      <GeneratePanel onGenerate={noop} onAddManual={noop} />
    </div>
  );
}

/** M-03 풀이 — 타이머가 도는 객관식 문항 */
export function PlayMockup() {
  return <PlayPage question={LIVE_QUESTION} onSubmit={noop} />;
}

/** M-04 문항 결과 — 정답 · 점수 · 현재 순위 */
export function PlayResultMockup() {
  return (
    <PlayPage
      question={{ ...LIVE_QUESTION, remaining: 0 }}
      onSubmit={noop}
      hasSubmitted
      score={PLAY_SCORE_MOCK}
      rankChip={PLAY_RANK_MOCK}
      reveal={PLAY_REVEAL_MOCK}
    />
  );
}

/** M-06 문항 상세 — 서술형 AI 분석 */
export function AnswerFeedbackMockup() {
  return (
    <QuestionDetailPage detail={ANSWER_DETAIL_MOCK} backHref="#" prevHref={null} nextHref={null} />
  );
}

/** M-05 최종 결과 — 시상대 · 내 순위 · 전체 순위 */
export function FinalResultMockup() {
  return (
    <FinalResultPage
      roomTitle={LIVE_ROOM.title}
      subtitle={`최종 결과 · ${LIVE_QUESTION.total}문항 · ${LIVE_ROOM.students.length}명 참여`}
      myRank={3}
      myScore={980}
      myCorrectCount={6}
      questionCount={LIVE_QUESTION.total}
      elapsedSeconds={null}
      comparison={null}
      podium={FINAL_PODIUM_MOCK}
      rankRows={FINAL_RANK_ROWS_MOCK}
      questionRows={FINAL_QUESTION_ROWS_MOCK}
      isGuest={false}
      onOpenReport={noop}
      onSignUp={noop}
    />
  );
}
