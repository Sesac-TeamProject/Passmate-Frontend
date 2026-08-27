"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AvatarKey } from "@/components/common/student-avatar";
import { PROFILE } from "@/features/me/mock";
import { CharacterPage } from "@/features/me/settings/character-page";

/** C-02-7 컨테이너 — 선택한 캐릭터 상태를 소유한다 */
export default function Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<AvatarKey>(PROFILE.avatar);

  const handleSubmit = () => {
    // TODO(API): PATCH /me { avatar } → auth-store 갱신 (사이드바·대기실에 반영)
    router.push("/me");
  };

  return <CharacterPage selected={selected} onSelect={setSelected} onSubmit={handleSubmit} />;
}
