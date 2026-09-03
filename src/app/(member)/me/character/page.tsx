"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toAvatarKey, type AvatarKey } from "@/components/common/student-avatar";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage } from "@/features/me/adapt";
import { CharacterPage } from "@/features/me/settings/character-page";
import { useMe, useUpdateProfile } from "@/lib/queries/use-me";

/** C-02-7 컨테이너 — 선택한 캐릭터 상태를 소유한다 */
export default function Page() {
  const router = useRouter();
  const me = useMe();
  const update = useUpdateProfile();

  const [selected, setSelected] = useState<AvatarKey>("cat");
  const [seeded, setSeeded] = useState(false);

  if (!seeded && me.data) {
    setSeeded(true);
    setSelected(toAvatarKey(me.data.avatarId));
  }

  const handleSubmit = () => {
    if (update.isPending) return;
    update.mutate({ avatarId: selected }, { onSuccess: () => router.push("/me") });
  };

  if (me.isPending) return <ScreenLoading />;
  if (me.isError) return <ScreenError message={me.error.message} onRetry={() => me.refetch()} />;

  return (
    <CharacterPage
      selected={selected}
      onSelect={setSelected}
      onSubmit={handleSubmit}
      pending={update.isPending}
      errorMessage={update.isError ? toMeErrorMessage(update.error) : null}
    />
  );
}
