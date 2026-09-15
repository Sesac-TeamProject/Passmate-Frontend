import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { Mascot } from "@/components/common/mascot";
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

/**
 * C-03 게스트 입장 (웹) — PIN · 닉네임 · 캐릭터 한 카드. 렌더 전용, 상태는 app/(bare)/join/page.tsx가 소유.
 *
 * 폰 폭(768px 미만)은 앱 시안 M-01을 따른다 — 왼쪽 정렬 브랜드·부제·마스코트 상단, 좌우 20 여백의 꽉 찬 카드,
 * PIN 오류는 PIN 칸 바로 아래 한 줄, 닉네임 중복 후보는 닉네임 칸 아래. 앱의 "QR로 입장"·하단 탭바는
 * 웹에 기능이 없어 그리지 않는다.
 */
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
  const errorBody = errorMessage ? (
    <>
      <p>{errorMessage}</p>
      {loginHref && (
        <Link href={loginHref} className="text-label-md font-semibold underline">
          로그인하기 →
        </Link>
      )}
    </>
  ) : null;

  const suggestions =
    nickname && !nickname.available ? (
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
    ) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background max-md:min-h-dvh max-md:items-stretch max-md:justify-start max-md:gap-0 max-md:bg-card">
      <BrandLogo size="lg" className="max-md:hidden" />

      {/* 폰 폭 상단(앱 M-01) — 마스코트 자리는 시안 그대로다(마스코트를 쓰지 않는 곳은 풀이 화면) */}
      <header className="relative flex flex-col gap-1.5 px-6 pt-16 pb-15 md:hidden">
        <p className="text-heading-lg text-mint-dark">패스메이트</p>
        <p className="text-label-lg text-muted-foreground">방 코드를 입력하고 시작하세요</p>
        <Mascot className="absolute top-11 right-7 h-[75px] w-[68px]" />
      </header>

      <section className="flex w-[380px] flex-col gap-5 rounded-3xl border bg-card px-[22px] py-[26px] max-md:mx-5 max-md:-mt-5 max-md:w-auto">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-heading-md text-ink">PIN으로 입장하기</h1>
          <p className="text-body-md text-muted-foreground">
            선생님 화면의 6자리 숫자를 입력하세요
          </p>
        </div>

        {errorBody && (
          <div
            role="alert"
            className="flex flex-col items-start gap-1.5 rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive max-md:hidden"
          >
            {errorBody}
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
          // 폰 폭은 앱 "PIN 오류 (M-01)" — 입력값은 그대로 두고 칸 아래 한 줄로만 알린다
          pinMessage={
            errorBody ? (
              <div
                role="alert"
                className="flex items-start gap-1.5 text-label-md text-destructive md:hidden"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
                <div className="flex flex-col items-start gap-1">{errorBody}</div>
              </div>
            ) : null
          }
          nicknameMessage={suggestions ? <div className="md:hidden">{suggestions}</div> : null}
        />

        {/* 입장 버튼을 누르기 전에 미리 알려 준다 — 서버도 입장 순간 같은 규칙으로 막는다 */}
        {suggestions && <div className="max-md:hidden">{suggestions}</div>}
      </section>

      <p className="flex items-center gap-1 max-md:mt-auto max-md:justify-center max-md:pt-8 max-md:pb-6">
        <span className="text-body-md text-muted-foreground">
          <span className="max-md:hidden">기록을 남기고 싶다면</span>
          <span className="md:hidden">기록을 남기려면</span>
        </span>
        <Link href="/login" className="text-label-lg text-mint">
          로그인 <span className="max-md:hidden">→</span>
        </Link>
      </p>
    </main>
  );
}
