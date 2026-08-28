"use client";

import Link from "next/link";
import { useState } from "react";
import { QUESTION_SETS } from "@/features/host/mock";
import { SetCard } from "./set-card";
import { SetDetailPanel } from "./set-detail-panel";

/** W-08 문제 세트 관리 — 목록 + 우측 상세 패널(세트 재활용) */
export function SetsPage() {
  const [selectedId, setSelectedId] = useState(QUESTION_SETS[0].id);
  const selected = QUESTION_SETS.find((s) => s.id === selectedId) ?? QUESTION_SETS[0];

  return (
    <div className="flex min-h-screen">
      <main className="flex flex-1 flex-col gap-[18px] py-7 pr-6 pl-8">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-lg text-ink">문제 세트</h1>
          <Link
            href="/host/editor"
            className="flex h-[46px] items-center rounded-[14px] bg-mint-tint px-5 text-label-lg text-mint-dark transition-colors hover:bg-mint hover:text-white"
          >
            + 새 세트
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-[18px]">
          {QUESTION_SETS.map((s) => (
            <SetCard
              key={s.id}
              set={s}
              selected={s.id === selectedId}
              onSelect={() => setSelectedId(s.id)}
            />
          ))}
        </div>
      </main>
      <SetDetailPanel set={selected} />
    </div>
  );
}
