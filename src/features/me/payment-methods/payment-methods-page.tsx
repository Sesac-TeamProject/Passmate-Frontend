import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentMethodItem } from "@/features/me/payment-methods/mock";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { SettingsList, SettingsRow } from "@/features/me/settings/settings-list";

type Props = {
  items: PaymentMethodItem[];
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
};

/** C-02-8 결제 수단 관리 — 수단 3행(기본 칩 · 삭제/기본으로) · 추가 버튼 · 안내 */
export function PaymentMethodsPage({ items, onSetDefault, onDelete, onAdd }: Props) {
  return (
    <MeFormPage title="결제 수단 관리">
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
            description={item.isDefault ? "기본 결제 수단" : (item.detail ?? "연결됨")}
            action={
              item.isDefault ? (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="text-label-md text-ink-disabled transition-colors hover:text-foreground"
                >
                  삭제
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSetDefault(item.id)}
                  className="text-label-md text-mint transition-colors hover:text-mint-dark"
                >
                  기본으로
                </button>
              )
            }
          />
        ))}
      </SettingsList>

      <Button
        variant="outline"
        size="xl"
        className="w-full gap-1.5 bg-card text-foreground"
        onClick={onAdd}
      >
        <Plus className="size-[18px]" aria-hidden />
        결제 수단 추가
      </Button>

      <p className="text-label-md text-muted-foreground">
        결제는 포트원(PortOne)을 통해 안전하게 처리돼요. 카드 정보는 저장하지 않아요.
      </p>
    </MeFormPage>
  );
}
