"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { avatarKeyFromId } from "@/components/common/student-avatar";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage } from "@/features/me/adapt";
import { AccountPage, type AccountValues } from "@/features/me/settings/account-page";
import { useMe, useUpdateProfile } from "@/lib/queries/use-me";

/** C-02-1 컨테이너 — 닉네임 폼 상태를 소유하고 렌더는 AccountPage에 맡긴다 */
export default function Page() {
  const router = useRouter();
  const me = useMe();
  const update = useUpdateProfile();

  const [values, setValues] = useState<AccountValues>({ nickname: "" });
  const [seeded, setSeeded] = useState(false);

  if (!seeded && me.data) {
    setSeeded(true);
    setValues({ nickname: me.data.nickname ?? "" });
  }

  const handleSubmit = () => {
    if (update.isPending) return;
    update.mutate({ nickname: values.nickname }, { onSuccess: () => router.push("/me") });
  };

  if (me.isPending) return <ScreenLoading />;
  if (me.isError) return <ScreenError message={me.error.message} onRetry={() => me.refetch()} />;

  return (
    <AccountPage
      avatar={avatarKeyFromId(me.data.avatarId)}
      email={me.data.email ?? ""}
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
      pending={update.isPending}
      errorMessage={update.isError ? toMeErrorMessage(update.error) : null}
    />
  );
}
