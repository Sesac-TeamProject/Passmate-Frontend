// 데이터 연동 전 화면 확인용 목업 (결제 수단 관리 C-02-8).
// TODO(API): 결제 수단(빌링키) DTO 계약이 없다 — lib/types/dto.ts 갱신 후 lib/queries 로 교체한다.
import type { PayMethod } from "@/lib/portone";

export type PaymentMethodItem = {
  id: string;
  kind: PayMethod;
  name: string;
  /** 카드 뒷자리 등 부가 정보. 없으면 "연결됨" */
  detail?: string;
  isDefault: boolean;
};

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: "pm1", kind: "kakaopay", name: "카카오페이", isDefault: true },
  { id: "pm2", kind: "naverpay", name: "네이버페이", isDefault: false },
  { id: "pm3", kind: "card", name: "신용 · 체크카드", detail: "국민 **** 1234", isDefault: false },
];
