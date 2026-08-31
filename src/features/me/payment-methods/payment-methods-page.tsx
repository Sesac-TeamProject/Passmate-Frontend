import type { PaymentMethodItem } from "@/features/me/payment-methods/types";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { SettingsList, SettingsRow } from "@/features/me/settings/settings-list";

type Props = {
  items: PaymentMethodItem[];
  onSetDefault: (id: string) => void;
  pending?: boolean;
  errorMessage?: string | null;
};

/**
 * C-02-8 결제 수단 관리 — 기본 결제 수단 선택. 계약은 기본 수단 1개 선택만 지원한다(카드 등록·삭제 없음, DESIGN_GAPS C-4) —
 * 시안의 카드 추가·삭제 UI는 목업이었다.
 */
export function PaymentMethodsPage({ items, onSetDefault, pending = false, errorMessage }: Props) {
  return (
    <MeFormPage title="결제 수단 관리">
      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl bg-destructive-soft px-3.5 py-3 text-label-md text-destructive"
        >
          {errorMessage}
        </p>
      )}
      <SettingsList>
        {items.map((item) => (
          <SettingsRow
            key={item.id}
            title={
              <span className="flex items-center gap-1.5">
                {item.name}
                {item.isDefault && (
                  <span className="rounded-full bg-mint-tint px-2 py-0.5 text-label-md text-mint-dark">
                    기본
                  </span>
                )}
              </span>
            }
            description={item.isDefault ? "기본 결제 수단" : undefined}
            action={
              item.isDefault ? null : (
                <button
                  type="button"
                  onClick={() => onSetDefault(item.id)}
                  disabled={pending}
                  className="text-label-md text-mint transition-colors hover:text-mint-dark disabled:opacity-50"
                >
                  기본으로
                </button>
              )
            }
          />
        ))}
      </SettingsList>

      <p className="text-label-md text-muted-foreground">
        결제는 포트원(PortOne)을 통해 안전하게 처리돼요. 카드 정보는 저장하지 않아요.
      </p>
    </MeFormPage>
  );
}
