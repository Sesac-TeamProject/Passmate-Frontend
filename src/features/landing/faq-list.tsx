"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  items: readonly { q: string; a: string }[];
};

/** FAQ 아코디언 — 시안(PHPJI)은 닫힌 질문 목록만 있다. 한 번에 하나만 펼친다. */
export function FaqList({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col divide-y rounded-[20px] border bg-card">
      {items.map((item, index) => {
        const open = index === openIndex;
        const panelId = `faq-panel-${index}`;
        return (
          <div key={item.q}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-7 py-[22px] text-left text-heading-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-mint"
            >
              {item.q}
              <ChevronDown
                aria-hidden
                className={cn("size-[22px] shrink-0 transition-transform", open && "rotate-180")}
                strokeWidth={2}
              />
            </button>
            <div id={panelId} hidden={!open} className="px-7 pb-[22px]">
              <p className="text-body-lg text-muted-foreground">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
