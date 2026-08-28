/** 원화 표기. 예: ₩10,000 */
export function formatWon(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

/** 코인 표기. 예: 10,000 C */
export function formatCoin(amount: number): string {
  return `${amount.toLocaleString()} C`;
}
