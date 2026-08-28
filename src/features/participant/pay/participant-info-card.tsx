import { FieldInput, FormField } from "@/components/common/form-field";
import type { AvatarKey } from "@/components/common/student-avatar";
import { AvatarPicker } from "@/features/participant/join/avatar-picker";

type Props = {
  nickname: string;
  avatar: AvatarKey;
  onNicknameChange: (nickname: string) => void;
  onAvatarChange: (avatar: AvatarKey) => void;
  disabled?: boolean;
};

/** 참가자 정보 카드 — 닉네임 입력 · 내 캐릭터 12종 선택(6×2, 게스트 입장 카드와 같은 피커) */
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

      <FormField label="닉네임" htmlFor="pay-nickname">
        <FieldInput
          id="pay-nickname"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          disabled={disabled}
          autoComplete="nickname"
        />
      </FormField>

      <div className="flex flex-col gap-2">
        <span className="text-label-lg text-foreground">내 캐릭터</span>
        <AvatarPicker
          value={avatar}
          onChange={onAvatarChange}
          size={40}
          layout="grid"
          disabled={disabled}
          className="w-max"
        />
      </div>

      <p className="text-label-md text-ink-disabled">
        대기실·결과 화면에서 이 닉네임과 캐릭터로 보여요
      </p>
    </section>
  );
}
