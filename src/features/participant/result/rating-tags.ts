import type { RatingTag } from "@/lib/types/dto";

/**
 * 별점 태그 라벨 (design.pen "P-Web 별점 시트" 프레임 NSaex).
 *
 * TODO(계약): 시안 라벨과 서버 enum의 대응이 확실하지 않다. 앞의 셋은 뜻이 겹치지만
 * 뒤의 둘은 추정이다 — HELPFUL_HINTS("힌트")를 시안은 "피드백"이라 부르고,
 * GOOD_QUALITY("품질")를 "분위기"라 부른다. 잘못 이으면 선생님 프로필에 엉뚱한 태그가
 * 쌓이는데 타입 검사에는 안 걸린다. DESIGN_GAPS G-8로 확인 요청 중.
 */
export const RATING_TAG_LABEL: Record<RatingTag, string> = {
  CLEAR_EXPLANATION: "설명이 쉬웠어요",
  GOOD_DIFFICULTY: "문제가 실전 같았어요",
  GOOD_PACING: "진행이 매끄러웠어요",
  /** 추정 */
  HELPFUL_HINTS: "피드백이 자세해요",
  /** 추정 */
  GOOD_QUALITY: "분위기가 좋았어요",
};

/** 시안이 놓인 순서 그대로 */
export const RATING_TAGS: RatingTag[] = [
  "CLEAR_EXPLANATION",
  "GOOD_DIFFICULTY",
  "GOOD_PACING",
  "HELPFUL_HINTS",
  "GOOD_QUALITY",
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
