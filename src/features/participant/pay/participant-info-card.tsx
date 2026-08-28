import { FieldInput, FormField } from "@/components/common/form-field";
import type { AvatarKey } from "@/components/common/student-avatar";
import { AvatarSelect } from "./avatar-select";

type Props = {
  nickname: string;
  avatar: AvatarKey;
  onNicknameChange: (nickname: string) => void;
  onAvatarChange: (avatar: AvatarKey) => void;
  disabled?: boolean;
};

/** 참가자 정보 카드 — 닉네임 입력 · 캐릭터 드롭다운(12종) 한 줄 */
export function ParticipantInfoCard({
  nickname,
  avatar,
  onNicknameChange,
  onAvatarChange,
  disabled,
}: Props) {
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
          <AvatarSelect
            id="pay-avatar"
            value={avatar}
            onChange={onAvatarChange}
            disabled={disabled}
          />
        </FormField>
      </div>

      <p className="text-label-md text-ink-disabled">
        대기실·결과 화면에서 이 닉네임과 캐릭터로 보여요
      </p>
    </section>
  );
}
