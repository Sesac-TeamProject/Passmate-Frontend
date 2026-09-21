/**
 * 정답률 3단계 색 — 민트 · 연노랑 · 진노랑.
 *
 * 낮은 정답률에 빨강을 쓰지 않는다. 리포트에서 빨강은 "틀렸다"는 판정이라 문항 전체를 실패로
 * 읽히게 하고, 화면에 빨간 막대가 여러 줄 깔리면 어디부터 볼지가 오히려 사라진다.
 * 같은 계열 안에서 진해지기만 하면 순서가 그대로 읽힌다.
 */
export function accuracyFill(accuracyPercent: number): string {
  if (accuracyPercent >= 70) return "bg-mint";
  if (accuracyPercent >= 50) return "bg-choice-c";
  return "bg-warning";
}

/** 정답률 숫자 색 — 50% 미만만 경고색으로 올린다 */
export function accuracyText(accuracyPercent: number): string {
  return accuracyPercent < 50 ? "text-warning-strong" : "text-ink";
}
