import { cn } from "@/lib/utils";
import type { PromotionRule } from "./types";

type Props = { targetLevel: number; rules: PromotionRule[]; note: string };

function valueClass(rule: PromotionRule) {
  if (!rule.met) return "text-orange";
  return rule.tone === "mint" ? "text-mint-dark" : "text-positive";
}

/** W-09 승급 조건 카드 — 규칙 4행(미충족 orange · 충족 positive) + 하락 규칙 */
export function PromotionCard({ targetLevel, rules, note }: Props) {
  return (
    <section className="flex w-[420px] shrink-0 flex-col gap-2.5 rounded-[20px] border bg-card px-7 py-6">
      <h2 className="text-heading-sm text-ink">Lv.{targetLevel} 승급 조건</h2>
      <ul className="flex flex-col gap-2.5">
        {rules.map((rule) => (
          <li key={rule.label} className="flex items-center justify-between gap-3">
            <span className="text-label-lg text-ink">{rule.label}</span>
            <span className={cn("text-label-lg", valueClass(rule))}>{rule.value}</span>
          </li>
        ))}
      </ul>
      <p className="text-label-md text-muted-foreground">{note}</p>
    </section>
  );
}
