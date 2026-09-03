"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toMeErrorMessage } from "@/features/me/adapt";
import {
  SettlementAccountPage,
  type SettlementAccountValues,
} from "@/features/me/settings/settlement-account-page";
import { BANK_CODES, BANKS } from "@/features/me/types";
import { useSettlementAccount, useUpdateSettlementAccount } from "@/lib/queries/use-payments";

const EMPTY_VALUES: SettlementAccountValues = { bank: BANKS[0], accountNumber: "", holder: "" };

/** C-02-3 컨테이너 — 정산 계좌 폼 상태를 소유한다. 404(미등록)는 빈 폼으로 시작한다 */
export default function Page() {
  const router = useRouter();
  const account = useSettlementAccount();
  const update = useUpdateSettlementAccount();

  const [values, setValues] = useState<SettlementAccountValues>(EMPTY_VALUES);
  const [seeded, setSeeded] = useState(false);

  // 등록된 계좌가 있으면 폼에 한 번 채운다 — 이미 입력을 시작했으면 덮어쓰지 않는다.
  // 번호는 서버가 마스킹해서 주므로(`accountNoMasked`) 폼에는 넣지 않는다 — 바꾸려면 다시 적는다.
  if (!seeded && account.isSuccess) {
    setSeeded(true);
    const registered = account.data.account;
    if (registered !== undefined) {
      setValues({ bank: registered.bankName, accountNumber: "", holder: registered.holderName });
    }
  }

  const handleSubmit = () => {
    if (update.isPending) return;
    update.mutate(
      {
        bankCode: BANK_CODES[values.bank] ?? "",
        bankName: values.bank,
        accountNo: values.accountNumber,
        holderName: values.holder,
      },
      { onSuccess: () => router.push("/me") },
    );
  };

  // 미등록도 200(`registered: false`)이라 404를 따로 다루지 않는다
  if (account.isPending) return <ScreenLoading />;
  if (account.isError) {
    return <ScreenError message={account.error.message} onRetry={() => account.refetch()} />;
  }

  return (
    <SettlementAccountPage
      banks={BANKS}
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
      pending={update.isPending}
      errorMessage={update.isError ? toMeErrorMessage(update.error) : null}
    />
  );
}
