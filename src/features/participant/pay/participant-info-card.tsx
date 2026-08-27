import { ChevronDown } from "lucide-react";
import { FieldInput, FormField } from "@/components/common/form-field";
import { type AvatarKey, StudentAvatar } from "@/components/common/student-avatar";

type Props = {
  nickname: string;
  avatar: AvatarKey;
  onNicknameChange: (nickname: string) => void;
  disabled?: boolean;
};

/** 참가자 정보 카드 — 닉네임 입력 · 캐릭터 선택 버튼 */
export function ParticipantInfoCard({ nickname, avatar, onNicknameChange, disabled }: Props) {
  return (
    <section className="flex flex-col gap-3.5 rounded-2xl border bg-card px-[22px] py-5">
      <h2 className="text-heading-sm text-ink">참가자 정보</h2>

      <div className="flex gap-3">
        <FormField label="닉네임" htmlFor="pay-nickname" className="flex-1">
          <FieldInput
            id="pay-nickname"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            disabled={disabled}
            autoComplete="nickname"
          />
        </FormField>
        <FormField label="캐릭터" htmlFor="pay-avatar">
          {/* TODO: 캐릭터 선택 UI(시안 미정) — 누르면 12종 아바타 중 고르기 */}
          <button
            id="pay-avatar"
            type="button"
            disabled={disabled}
            className="flex h-12 items-center gap-2 rounded-xl bg-muted px-3 outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:opacity-50"
            aria-label="캐릭터 선택"
          >
            <StudentAvatar avatar={avatar} size={30} />
            <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
          </button>
        </FormField>
      </div>

      <p className="text-label-md text-ink-disabled">
        대기실·결과 화면에서 이 닉네임과 캐릭터로 보여요
      </p>
    </section>
  );
}
