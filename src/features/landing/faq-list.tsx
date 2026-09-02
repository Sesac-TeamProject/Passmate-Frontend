"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  items: readonly { q: string; a: string }[];
};

/**
 * FAQ 아코디언 — 시안은 회색 판(960 · r24) 위에 흰 카드를 쌓고, 펼친 카드만 구분선 아래로 답을 편다.
 * 한 번에 하나만 펼친다.
 */
export function FaqList({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2.5 rounded-3xl bg-background p-5">
      {items.map((item, index) => {
        const open = index === openIndex;
        const panelId = `faq-panel-${index}`;
        return (
          <div key={item.q} className="rounded-2xl bg-card">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-mint"
            >
              <span className={cn("text-heading-sm text-ink", open && "font-bold")}>{item.q}</span>
              {open ? (
                <Minus aria-hidden className="size-5 shrink-0 text-mint-dark" strokeWidth={2} />
              ) : (
                <Plus aria-hidden className="size-5 shrink-0 text-ink-disabled" strokeWidth={2} />
              )}
            </button>
            <div
              id={panelId}
              hidden={!open}
              className="border-t border-line-soft px-6 pt-[18px] pb-6"
            >
              <p className="text-body-lg leading-[1.75] text-muted-foreground">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
