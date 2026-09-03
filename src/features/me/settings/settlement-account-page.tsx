"use client";

import type { FormEvent } from "react";
import { FIELD_INPUT_CLASS, FieldInput, FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { cn } from "@/lib/utils";

export type SettlementAccountValues = { bank: string; accountNumber: string; holder: string };

type Props = {
  banks: readonly string[];
  values: SettlementAccountValues;
  onChange: (next: SettlementAccountValues) => void;
  onSubmit: () => void;
  pending?: boolean;
  errorMessage?: string | null;
};

/** C-02-3 정산 계좌 등록 — 은행 select · 계좌번호 · 예금주 · 등록하기. 렌더 전용 */
export function SettlementAccountPage({
  banks,
  values,
  onChange,
  onSubmit,
  pending = false,
  errorMessage,
}: Props) {
  /**
   * 서버는 **넘긴 값 그대로 저장한다** — 빈 계좌번호를 보내면 등록된 계좌가 지워진다.
   * 조회는 마스킹된 번호만 주므로 폼이 비어 시작하는 것이 정상이고, 그래서 여기서 막아야 한다.
   */
  const canSubmit = values.accountNumber.trim() !== "" && values.holder.trim() !== "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  };

  return (
    <MeFormPage title="정산 계좌 등록">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errorMessage && (
          <p
            role="alert"
            className="rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
          >
            {errorMessage}
          </p>
        )}
        <FormField label="은행" htmlFor="settlement-bank">
          <Select
            value={values.bank}
            onValueChange={(bank) => bank && onChange({ ...values, bank })}
            disabled={pending}
          >
            {/* shadcn 트리거(h-8·테두리)를 시안 입력 규격(h-12·r12·bg-muted)으로 덮어쓴다. chevron 24px ink */}
            <SelectTrigger
              id="settlement-bank"
              className={cn(
                FIELD_INPUT_CLASS,
                "justify-between border-0 data-[size=default]:h-12 [&_svg]:size-6 [&_svg]:text-foreground",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {banks.map((bank) => (
                <SelectItem
                  key={bank}
                  value={bank}
                  className="rounded-lg px-3 py-2.5 text-body-md text-foreground"
                >
                  {bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="계좌번호" htmlFor="settlement-account-number">
          <FieldInput
            id="settlement-account-number"
            name="accountNumber"
            inputMode="numeric"
            autoComplete="off"
            value={values.accountNumber}
            onChange={(e) => onChange({ ...values, accountNumber: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <FormField label="예금주" htmlFor="settlement-holder">
          <FieldInput
            id="settlement-holder"
            name="holder"
            autoComplete="name"
            value={values.holder}
            onChange={(e) => onChange({ ...values, holder: e.target.value })}
            disabled={pending}
          />
        </FormField>

        <p className="text-label-md text-muted-foreground">
          정산은 매월 5일, 등록된 계좌로 지급돼요. 예금주는 가입한 이름과 같아야 해요.
        </p>

        <div className="flex justify-end">
          <Button type="submit" size="xl" disabled={pending || !canSubmit}>
            등록하기
          </Button>
        </div>
      </form>
    </MeFormPage>
  );
}
