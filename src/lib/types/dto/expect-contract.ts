import { expect } from "vitest";

/**
 * DTO 계약 대조 도우미 — 목이 돌려주는 **실제 값의 키**를 백엔드 필드 목록과 맞춘다.
 *
 * 타입만 검사하면(`expectTypeOf`) 런타임에는 no-op이라 목이 어긋나도 초록으로 지나간다.
 * 서버는 `non_null` 직렬화라 값이 없는 필드는 응답에서 빠지므로 "정확히 같은 키"가 아니라
 * **"필수 키는 모두 있고, 계약에 없는 키는 하나도 없다"** 로 본다.
 *
 * @param required 값이 항상 오는 필드 (Kotlin 비-nullable)
 * @param optional 값이 없으면 빠지는 필드 (Kotlin nullable)
 */
export function expectContract(value: object, required: string[], optional: string[] = []): void {
  const keys = Object.keys(value);
  expect(required.filter((k) => !keys.includes(k))).toEqual([]);
  expect(keys.filter((k) => !required.includes(k) && !optional.includes(k))).toEqual([]);
}
