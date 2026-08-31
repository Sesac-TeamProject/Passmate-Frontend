"use client";

import {
  AVATAR_KEYS,
  AVATAR_LABEL,
  StudentAvatar,
  type AvatarKey,
} from "@/components/common/student-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: AvatarKey;
  onChange: (next: AvatarKey) => void;
  disabled?: boolean;
  className?: string;
};

const ITEMS = AVATAR_KEYS.map((key) => ({ value: key, label: AVATAR_LABEL[key] }));

/**
 * 캐릭터 드롭다운 — 트리거는 폼 입력 규격(h48·r12·bg-muted)에 아바타 30 + chevron,
 * 펼치면 12종 아바타 + 이름 목록. 시안 W-11 참가자 정보 카드의 "캐릭터" 셀렉트.
 */
export function AvatarSelect({ id, value, onChange, disabled, className }: Props) {
  return (
    <Select
      items={ITEMS}
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as AvatarKey);
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label="캐릭터 선택"
        className={cn(
          "gap-2 rounded-xl border-0 bg-muted px-3 outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-mint data-[size=default]:h-12",
          className,
        )}
      >
        <SelectValue>
          {(selected: AvatarKey) => <StudentAvatar avatar={selected} size={30} />}
        </SelectValue>
      </SelectTrigger>
      {/* 8줄(288px)까지만 보이고 스크롤 — 트리거 아래 공간(≈410px)에 들어가야 위로 뒤집히지 않는다 */}
      <SelectContent align="end" alignItemWithTrigger={false} className="max-h-72">
        {ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value} className="text-label-lg">
            <StudentAvatar avatar={item.value} size={28} />
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
