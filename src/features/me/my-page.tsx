import { Coins } from "lucide-react";
import Link from "next/link";
import { AVATAR_LABEL } from "@/components/common/student-avatar";
import {
  ACCOUNT_SETTINGS,
  COIN_SUMMARY,
  formatNumber,
  formatWon,
  NOTIFICATION_SUMMARY,
  PROFILE,
  ROOM_COUNTS,
  SETTLEMENT_ACCOUNT,
  SETTLEMENT_SUMMARY,
} from "@/features/me/mock";
import { ProfileCard } from "@/features/me/profile-card";
import { SettingsCard } from "@/features/me/settings/settings-card";
import { SettingsRow } from "@/features/me/settings/settings-list";

const ROW_CLASS = "px-0 py-3.5";
const LINK_CLASS = "shrink-0 text-label-md text-mint-dark";

type Props = {
  /** 알림 · 기타 카드의 "로그아웃" — 컨테이너가 확인 다이얼로그를 연다 */
  onLogout: () => void;
};

/** C-02 v3 마이페이지 — 내 정보 관리 (계정 · 코인 · 정산 계좌). 방과 기록은 사이드바의 내가 만든 방 · 참여한 방 */
export function MyPage({ onLogout }: Props) {
  const lastTx = COIN_SUMMARY.lastTransaction;
  const lastTxAmount = `${lastTx.amount < 0 ? "-" : "+"}${formatNumber(Math.abs(lastTx.amount))} C`;

  return (
    <main className="flex flex-col gap-5 px-9 py-7">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-lg text-ink">내 정보 관리</h1>
        <p className="text-label-md text-muted-foreground">
          계정 · 코인 · 정산 계좌를 관리해요. 방과 기록은 왼쪽 메뉴의 내가 만든 방 · 참여한 방에서
        </p>
      </div>

      <ProfileCard
        profile={PROFILE}
        joinedRooms={ROOM_COUNTS.joined}
        hostedRooms={ROOM_COUNTS.hosted}
      />

      <div className="grid grid-cols-2 gap-5">
        {/* 좌열 */}
        <div className="flex flex-col gap-5">
          <SettingsCard title="계정">
            <SettingsRow
              className={ROW_CLASS}
              title="닉네임"
              description={PROFILE.nickname}
              action={
                <Link href="/me/account" className={LINK_CLASS}>
                  변경 ›
                </Link>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="이메일"
              description={`${PROFILE.email} · ${ACCOUNT_SETTINGS.loginProvider}`}
            />
            <SettingsRow
              className={ROW_CLASS}
              title="비밀번호"
              description={`마지막 변경 ${ACCOUNT_SETTINGS.passwordChangedAt}`}
              action={
                <Link href="/me/password" className={LINK_CLASS}>
                  변경 ›
                </Link>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="내 캐릭터"
              description={`${AVATAR_LABEL[PROFILE.avatar]} · 대기실·결과 화면에 표시`}
              action={
                <Link href="/me/character" className={LINK_CLASS}>
                  변경 ›
                </Link>
              }
            />
          </SettingsCard>

          <SettingsCard
            title={
              <>
                <Coins aria-hidden className="size-[18px] text-mint" strokeWidth={2} />
                코인 · 결제
              </>
            }
          >
            <SettingsRow
              className={ROW_CLASS}
              leading={
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-bg"
                >
                  <Coins className="size-[22px] text-mint" strokeWidth={2} />
                </span>
              }
              title="보유 코인"
              description={`${formatNumber(COIN_SUMMARY.balance)} C · 유료 방 참가비에 사용 (1C = ₩1)`}
              action={
                <Link
                  href="/me/coins/charge"
                  className="shrink-0 rounded-[10px] bg-mint px-3.5 py-2 text-label-md text-white hover:bg-mint-dark"
                >
                  코인 충전
                </Link>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="결제 수단"
              description={COIN_SUMMARY.paymentMethodLabel}
              action={
                <Link href="/me/payment-methods" className={LINK_CLASS}>
                  관리 ›
                </Link>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="코인 사용 · 충전 내역"
              description={`최근 ${lastTx.dateLabel} ${lastTx.title} ${lastTxAmount}`}
              action={
                <Link href="/me/coins" className={LINK_CLASS}>
                  내역 보기 ›
                </Link>
              }
            />
          </SettingsCard>
        </div>

        {/* 우열 */}
        <div className="flex flex-col gap-5">
          <SettingsCard
            title="정산 (내가 만든 방 수익)"
            aside={
              <span className="text-label-md text-muted-foreground">
                Lv.{SETTLEMENT_SUMMARY.paidRoomLevel}부터 유료 방 개설 가능
              </span>
            }
          >
            <SettingsRow
              className={ROW_CLASS}
              title="정산 계좌"
              description={`${SETTLEMENT_ACCOUNT.bank} ${SETTLEMENT_ACCOUNT.maskedNumber} · 예금주 ${SETTLEMENT_ACCOUNT.holder}`}
              action={
                <Link
                  href="/me/settlement-account"
                  className="shrink-0 rounded-[10px] bg-mint-bg px-3.5 py-2 text-label-md text-mint-dark hover:bg-mint-tint"
                >
                  계좌 변경
                </Link>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="이번 달 정산 예정"
              description={`${formatWon(SETTLEMENT_SUMMARY.thisMonthAmount)} · ${SETTLEMENT_SUMMARY.payoutDateLabel} 지급 · 참가비의 ${SETTLEMENT_SUMMARY.hostShare}%`}
              action={
                <Link href="/me/settlement" className={LINK_CLASS}>
                  정산 내역 보기 ›
                </Link>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="세금 · 사업소득 안내"
              description={SETTLEMENT_SUMMARY.taxNote}
              action={
                // TODO: 세금 안내 화면 — 시안 없음
                <Link href="#" className={LINK_CLASS}>
                  자세히 ›
                </Link>
              }
            />
          </SettingsCard>

          <SettingsCard title="알림 · 기타">
            <SettingsRow
              className={ROW_CLASS}
              title="알림"
              description={NOTIFICATION_SUMMARY}
              action={
                <Link href="/me/notifications" className={LINK_CLASS}>
                  설정 ›
                </Link>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="로그아웃"
              action={
                <button
                  type="button"
                  onClick={onLogout}
                  className="shrink-0 text-label-md text-negative"
                >
                  로그아웃
                </button>
              }
            />
            <SettingsRow
              className={ROW_CLASS}
              title="회원 탈퇴"
              description="기록과 코인이 모두 삭제돼요"
              action={
                <Link href="/me/withdraw" className="shrink-0 text-label-md text-ink-disabled">
                  탈퇴 ›
                </Link>
              }
            />
          </SettingsCard>
        </div>
      </div>
    </main>
  );
}
