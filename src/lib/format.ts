/** 화면 표기용 포맷 함수. 서버 DTO 값을 렌더 시점에 문자열로 바꾼다 (규칙 문서 §6 파생 값). */

const LOCALE = "ko-KR";
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function formatNumber(value: number): string {
  return value.toLocaleString(LOCALE);
}

/** 예: 4820000 → "₩ 4,820,000" (KPI·정산액처럼 큰 금액 표기) */
export function formatKrw(value: number): string {
  return `₩ ${formatNumber(value)}`;
}

/** 예: 10000 → "₩10,000" (표 안의 금액 표기, 공백 없음) */
export function formatKrwInline(value: number): string {
  return `₩${formatNumber(value)}`;
}

/** YYYY-MM-DD → "08-01" (기간 표기) */
export function formatMonthDay(isoDate: string): string {
  return isoDate.slice(5);
}

/** YYYY-MM-DD → "9월 5일" */
export function formatKoreanDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${month}월 ${day}일`;
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

/** ISO 시각 → "방금 전" / "N분 전" / "N시간 전" / "어제" / "N일 전" */
export function formatRelativeTime(iso: string, nowMs: number): string {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());
  const days = Math.floor(diff / DAY_MS);

  if (diff < MINUTE_MS) return "방금 전";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}분 전`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}시간 전`;
  if (days === 1) return "어제";
  return `${days}일 전`;
}

/** 시간 단위 기간 → "24시간" / "7일". 하루를 넘고 일 단위로 떨어지면 일로 표기 */
export function formatDurationHours(hours: number): string {
  if (hours > 24 && hours % 24 === 0) return `${hours / 24}일`;
  return `${hours}시간`;
}

/** 시간(소수) → "2.4시간" */
export function formatHours(hours: number): string {
  return `${hours.toFixed(1)}시간`;
}

/** "482913" → "482 913" (6자리 참여 PIN 표기) */
export function formatPin(pin: string): string {
  return `${pin.slice(0, 3)} ${pin.slice(3)}`;
}

/** 원화 표기(공백 옵션) — 마이페이지 v3 행은 붙임("₩64,000"), W-10 정산 표는 공백("₩ 60,000") */
export function formatWon(value: number, spaced = false): string {
  return `${spaced ? "₩ " : "₩"}${formatNumber(value)}`;
}
