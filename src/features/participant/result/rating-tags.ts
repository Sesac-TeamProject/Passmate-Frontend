import type { RatingTag } from "@/lib/types/dto";

/**
 * 별점 태그 라벨.
 *
 * 문구는 **서버 enum이 들고 있는 label**을 그대로 쓴다(`rating/domain/RatingTag.kt`).
 * API가 코드만 내려 주기 때문에 문구는 화면이 들고 있어야 하는데, 예전처럼 시안 문구로
 * 뜻을 추측하면 `HELPFUL_HINT`("힌트")를 "피드백"이라 부르는 식으로 어긋난다 —
 * 선생님 프로필에 엉뚱한 태그가 쌓이고 타입 검사에는 안 걸린다.
 */
export const RATING_TAG_LABEL: Record<RatingTag, string> = {
  CLEAR_EXPLANATION: "설명이 명확해요",
  FAIR_DIFFICULTY: "난이도가 적당해요",
  GOOD_PACING: "시간 배분이 좋아요",
  HELPFUL_HINT: "힌트가 도움됐어요",
  GOOD_QUESTIONS: "문제 품질이 좋아요",
};

/** 서버 enum이 선언된 순서 그대로 */
export const RATING_TAGS: RatingTag[] = [
  "CLEAR_EXPLANATION",
  "FAIR_DIFFICULTY",
  "GOOD_PACING",
  "HELPFUL_HINT",
  "GOOD_QUESTIONS",
];

/**
 * 별점 숫자 옆 한 마디.
 * TODO(design): 시안에는 4점("좋았어요")만 있다. 나머지 넷은 같은 결로 채웠으니
 * 디자이너 확인이 필요하다.
 */
export const STAR_LABEL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "아쉬웠어요",
  2: "조금 아쉬웠어요",
  3: "괜찮았어요",
  4: "좋았어요",
  5: "최고였어요",
};
