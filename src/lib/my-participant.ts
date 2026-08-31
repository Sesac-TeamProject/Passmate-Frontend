/**
 * 내가 이 방에서 누구인지(참가자 id·닉네임) 보관.
 * 참여 응답은 participantId만 주고 닉네임은 내가 방금 입력한 값이라, 대기실이 "OO 님"으로 부르려면
 * 어딘가 남겨야 한다. 탭을 닫으면 사라져야 하므로 sessionStorage.
 * SSR·테스트처럼 window가 없는 곳에서는 조용히 null을 돌려준다.
 */
const KEY = "passmate.myParticipant";

export type MyParticipant = { participantId: number; nickname: string };

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function readMyParticipant(): MyParticipant | null {
  const raw = storage()?.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "participantId" in parsed &&
      "nickname" in parsed &&
      typeof parsed.participantId === "number" &&
      typeof parsed.nickname === "string"
    ) {
      return { participantId: parsed.participantId, nickname: parsed.nickname };
    }
  } catch {
    // 남의 손을 탄 값이면 없는 것으로 친다
  }
  return null;
}

export function writeMyParticipant(value: MyParticipant): void {
  storage()?.setItem(KEY, JSON.stringify(value));
}

export function clearMyParticipant(): void {
  storage()?.removeItem(KEY);
}
