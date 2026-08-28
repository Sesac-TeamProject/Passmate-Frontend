"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BANKS, SETTLEMENT_ACCOUNT } from "@/features/me/mock";
import {
  SettlementAccountPage,
  type SettlementAccountValues,
} from "@/features/me/settings/settlement-account-page";

/** C-02-3 컨테이너 — 정산 계좌 폼 상태를 소유한다 */
export default function Page() {
  const router = useRouter();
  const [values, setValues] = useState<SettlementAccountValues>({
    bank: SETTLEMENT_ACCOUNT.bank,
    accountNumber: SETTLEMENT_ACCOUNT.accountNumber,
    holder: SETTLEMENT_ACCOUNT.holder,
  });

  const handleSubmit = () => {
    // TODO(API): PUT /me/settlement-account { bank, accountNumber, holder }
    router.push("/me");
  };

  return (
    <SettlementAccountPage
      banks={BANKS}
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
    />
  );
}
