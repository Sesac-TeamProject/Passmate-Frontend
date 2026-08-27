import { CoinBalanceCard } from "@/features/me/coins/coin-balance-card";
import {
  COIN_HISTORY_FILTER_LABEL,
  COIN_HISTORY_FILTERS,
  type CoinHistoryFilter,
  type CoinHistoryItem,
} from "@/features/me/coins/mock";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { SettingsList } from "@/features/me/settings/settings-list";
import { formatNumber, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  balance: number;
  filter: CoinHistoryFilter;
  onFilterChange: (filter: CoinHistoryFilter) => void;
  /** 필터가 적용된 내역 */
  items: CoinHistoryItem[];
};

/** C-02-9 코인 사용 · 충전 내역 — 잔액 카드 · 필 탭(전체/충전/사용) · 내역 리스트 */
export function CoinsPage({ balance, filter, onFilterChange, items }: Props) {
  return (
    <MeFormPage title="코인 사용 · 충전 내역">
      <CoinBalanceCard balance={balance} />

      <div className="flex gap-2" role="group" aria-label="내역 필터">
        {COIN_HISTORY_FILTERS.map((key) => {
          const active = key === filter;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(key)}
              className={cn(
                "rounded-full px-3.5 py-2 text-label-lg transition-colors",
                active ? "bg-mint-tint text-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {COIN_HISTORY_FILTER_LABEL[key]}
            </button>
          );
        })}
      </div>

      <SettingsList>
        {items.length === 0 ? (
          // 시안에 빈 상태 없음 — 안내 문구 톤(label-md muted)으로 통일
          <p className="px-5 py-4 text-label-md text-muted-foreground">
            {COIN_HISTORY_FILTER_LABEL[filter]} 내역이 없어요
          </p>
        ) : (
          items.map((item) => <CoinHistoryRow key={item.id} item={item} />)
        )}
      </SettingsList>
    </MeFormPage>
  );
}

function CoinHistoryRow({ item }: { item: CoinHistoryItem }) {
  const positive = item.amount > 0;
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className="text-label-md text-muted-foreground">{formatShortDate(item.date)}</span>
      <span className="min-w-0 flex-1 truncate text-label-lg text-foreground">{item.title}</span>
      <span className={cn("text-label-lg", positive ? "text-mint-dark" : "text-foreground")}>
        {positive ? "+" : "-"}
        {formatNumber(Math.abs(item.amount))} C
      </span>
    </div>
  );
}
