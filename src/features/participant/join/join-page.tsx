import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { formatNumber } from "@/lib/format";
import type { RoomPreview } from "./adapt";
import { JoinForm, type JoinValues } from "./join-form";

/** 입장 전 닉네임 중복 확인 결과 */
export type NicknameHint = { available: boolean; suggestions: string[] };

type Props = {
  values: JoinValues;
  onChange: (next: JoinValues) => void;
  onSubmit: () => void;
  pending?: boolean;
  /** PIN 조회·입장 실패 문구 (유료 방 로그인 안내 포함) */
  errorMessage?: string | null;
  /** errorMessage가 유료 방 안내일 때만: "로그인하기" 버튼이 가리킬 경로(/login?next=/pay/{pin}) */
  loginHref?: string | null;
  /** PIN을 다 넣으면 보이는 방 미리보기. 조회 전·실패면 null */
  room?: RoomPreview | null;
  /** 닉네임 중복 확인 결과. 확인 전이면 null */
  nickname?: NicknameHint | null;
  onPickSuggestion?: (nickname: string) => void;
};

/** C-03 게스트 입장 (웹) — PIN · 닉네임 · 캐릭터 한 카드. 렌더 전용, 상태는 app/(bare)/join/page.tsx가 소유 */
export function JoinPage({
  values,
  onChange,
  onSubmit,
  pending = false,
  errorMessage = null,
  loginHref = null,
  room = null,
  nickname = null,
  onPickSuggestion,
}: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
      <BrandLogo size="lg" />

      <section className="flex w-[380px] flex-col gap-5 rounded-3xl border bg-card px-[22px] py-[26px]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-md text-ink">PIN으로 입장하기</h1>
          <p className="text-body-md text-muted-foreground">
            선생님 화면의 6자리 숫자를 입력하세요
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex flex-col items-start gap-1.5 rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
          >
            <p>{errorMessage}</p>
            {loginHref && (
              <Link href={loginHref} className="text-label-md font-semibold underline">
                로그인하기 →
              </Link>
            )}
          </div>
        )}

        {room && (
          <div className="flex flex-col gap-1 rounded-xl bg-mint-bg px-3.5 py-3">
            <p className="text-label-lg text-ink">{room.title}</p>
            <p className="text-label-md text-mint-dark">
              {[
                room.topic,
                room.capacity,
                room.fee !== null ? `참가비 ${formatNumber(room.fee)} C` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        )}

        <JoinForm
          variant="guest"
          values={values}
          onChange={onChange}
          onSubmit={onSubmit}
          pending={pending}
        />

        {/* 입장 버튼을 누르기 전에 미리 알려 준다 — 서버도 입장 순간 같은 규칙으로 막는다 */}
        {nickname && !nickname.available && (
          <div className="flex flex-col gap-2">
            <p className="text-label-md text-negative">
              이미 쓰고 있는 닉네임이에요. 다른 이름을 골라 주세요
            </p>
            {nickname.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {nickname.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onPickSuggestion?.(suggestion)}
                    className="rounded-full bg-muted px-3 py-1.5 text-label-md text-mint-dark hover:bg-mint-tint"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <p className="flex items-center gap-1">
        <span className="text-body-md text-muted-foreground">기록을 남기고 싶다면</span>
        <Link href="/login" className="text-label-lg text-mint">
          로그인 →
        </Link>
      </p>
    </main>
  );
}
