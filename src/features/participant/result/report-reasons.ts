import type { ReportType } from "@/lib/types/dto";

/**
 * 신고 항목 라벨 (design.pen "P-Web — 신고 다이얼로그" 프레임 Ozq4i).
 *
 * 서버는 종류(`type`)와 자유 서술(`reason`)을 **따로** 받는다 — 화면이 고른 라벨을 `reason`에
 * 그대로 실어 보내므로, enum이 시안 문구를 완전히 담지 못해도 뜻이 뭉개지지 않는다.
 *
 * TODO(계약): 시안의 "그 밖의 문제"에 해당하는 enum 값이 없다(DESIGN_GAPS G-8).
 * 임의로 다른 종류에 밀어 넣으면 운영팀이 잘못 분류된 신고를 받으므로 아직 넣지 않는다.
 */
export const ROOM_REPORT_REASONS: { value: ReportType; label: string }[] = [
  /** 추정 — 방 설명과 실제가 다르다는 뜻으로 읽었다 */
  { value: "SPAM", label: "수업 내용이 설명과 달라요" },
  { value: "QUESTION_ERROR", label: "문제가 부적절해요" },
  { value: "OPERATION", label: "선생님이 불쾌하게 했어요" },
  { value: "PAID_ROOM", label: "참가비를 받고 진행하지 않았어요" },
];

/** 고른 종류의 화면 문구 — 자유 서술을 안 적었을 때 `reason`으로 보낸다 */
export function reportTypeLabel(type: ReportType): string {
  return ROOM_REPORT_REASONS.find((item) => item.value === type)?.label ?? type;
}
