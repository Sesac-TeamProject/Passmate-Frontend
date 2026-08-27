/** 화면 표기용 포맷 함수. 서버 DTO 값을 렌더 시점에 문자열로 바꾼다 (규칙 문서 §6 파생 값). */

const LOCALE = "ko-KR";
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatNumber(value: number): string {
  return value.toLocaleString(LOCALE);
}

/** 예: 4820000 → "₩ 4,820,000" */
export function formatKrw(value: number): string {
  return `₩ ${formatNumber(value)}`;
}

/** 예: 4.2 → "▲ 4.2%", -1.5 → "▼ 1.5%", 0 → "0%" */
export function formatDeltaPct(pct: number): string {
  if (pct > 0) return `▲ ${pct.toFixed(1)}%`;
  if (pct < 0) return `▼ ${Math.abs(pct).toFixed(1)}%`;
  return "0%";
}

/** 예: 17.09 → "17.1%" */
export function formatPct(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/** YYYY-MM-DD → "M/D" (차트 축 라벨) */
export function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${month}/${day}`;
}

/** Date → YYYY-MM-DD (로컬 기준) */
export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ISO 시각 → "방금 전" / "N분 전" / "N시간 전" / "N일 전" */
export function formatRelativeTime(iso: string, nowMs: number): string {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());

  if (diff < MINUTE_MS) return "방금 전";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}분 전`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}시간 전`;
  return `${Math.floor(diff / DAY_MS)}일 전`;
}
