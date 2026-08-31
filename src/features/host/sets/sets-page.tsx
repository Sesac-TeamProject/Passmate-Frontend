"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuestionSet } from "@/features/host/types";
import { SetCard } from "./set-card";
import { SetDetailPanel } from "./set-detail-panel";

type Props = {
  sets: QuestionSet[];
  onClone: (setId: string) => void;
  cloning?: boolean;
};

/** W-08 문제 세트 관리 — 목록 + 우측 상세 패널(세트 재활용) */
export function SetsPage({ sets, onClone, cloning }: Props) {
  const [selectedId, setSelectedId] = useState(sets[0]?.id ?? null);
  const selected = sets.find((s) => s.id === selectedId) ?? sets[0] ?? null;

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
        {sets.length === 0 ? (
          // TODO(design): DESIGN_GAPS W-08 빈 상태
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed py-16 text-center text-body-md text-muted-foreground">
            아직 만든 문제 세트가 없어요
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-[18px]">
            {sets.map((s) => (
              <SetCard
                key={s.id}
                set={s}
                selected={s.id === selectedId}
                onSelect={() => setSelectedId(s.id)}
                onClone={() => onClone(s.id)}
                cloning={cloning}
              />
            ))}
          </div>
        )}
      </main>
      {selected && (
        <SetDetailPanel set={selected} onClone={() => onClone(selected.id)} cloning={cloning} />
      )}
    </div>
  );
}
