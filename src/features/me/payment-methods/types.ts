// 결제 수단 관리(C-02-8) 뷰 타입. API 응답 → 이 타입 변환은 ../adapt.ts가 맡는다.
// 계약은 기본 결제 수단 1개 선택만 지원한다 — 카드 목록·삭제·빌링키는 없다 (DESIGN_GAPS C-4).
import type { PayMethod } from "@/lib/portone";

export type PaymentMethodItem = {
  /** 포트원 PayMethod 문자열을 그대로 쓴다 — 서버가 관리하는 카드 id가 없다 */
  id: string;
  kind: PayMethod;
  name: string;
  isDefault: boolean;
};
