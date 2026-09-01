import type { ReportReason } from "@/lib/types/dto";

/**
 * 신고 사유 라벨 (design.pen "P-Web — 신고 다이얼로그" 프레임 Ozq4i).
 *
 * TODO(계약): 시안 라벨 5개와 서버 `ReportReason` 6개가 맞물리지 않는다.
 * "그 밖의 문제"에 해당하는 값이 enum에 없고, 시안에 없는 NICKNAME·DIFFICULTY가 남는다.
 * 잘못 이으면 관리자 신고 목록이 엉뚱하게 분류되는데 타입 검사에는 안 걸린다.
 * DESIGN_GAPS G-8로 확인 요청 중 — 회신이 오면 이 표만 고치면 된다.
 */
export const ROOM_REPORT_REASONS: { value: ReportReason; label: string }[] = [
  /** 추정 — 방 설명과 실제가 다르다는 뜻으로 읽었다 */
  { value: "SPAM", label: "수업 내용이 설명과 달라요" },
  { value: "QUESTION_ERROR", label: "문제가 부적절해요" },
  { value: "OPERATION", label: "선생님이 불쾌하게 했어요" },
  { value: "PAID_ROOM", label: "참가비를 받고 진행하지 않았어요" },
  // 시안의 "그 밖의 문제"는 대응하는 enum이 없어 넣지 않았다.
  // 임의로 다른 사유에 밀어 넣으면 운영팀이 잘못 분류된 신고를 받는다.
];
