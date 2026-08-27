"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import type { QuestionSet, RoomSetup } from "@/features/teacher/mock";
import { ReputationRow } from "./reputation-row";
import { RoomTypeTabs, type RoomType } from "./room-type-tabs";
import { SettlementPreview } from "./settlement-preview";

type Props = {
  sets: QuestionSet[];
  setup: RoomSetup;
  /** 세트 확정 후 이동할 다음 단계 경로 */
  nextHref: string;
  editorHref: string;
};

const FIELD = "h-[54px] w-[440px] rounded-2xl bg-muted px-[18px]";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** W-02 v2 방 설정 카드 — 방 이름·문제 세트·방 유형(무료/유료)·참가비 */
export function NewRoomForm({ sets, setup, nextHref, editorHref }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [setId, setSetId] = useState(sets[0]?.id ?? "");
  const [roomType, setRoomType] = useState<RoomType>("free");
  const [fee, setFee] = useState(setup.defaultFee);

  const paidLocked = setup.reputation.level < setup.paidMinLevel;
  const isPaid = roomType === "paid";

  function handleFeeChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setFee(digits ? Number(digits) : 0);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO(API): 방 생성 요청(유형·참가비 포함) → PIN 발급 후 이동
    router.push(nextHref);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[520px] flex-col gap-4 rounded-3xl border bg-card px-10 py-7"
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-heading-lg text-ink">어떤 방을 만들까요?</h2>
        <p className="text-body-md text-muted-foreground">
          방 이름과 문제 세트만 정하면 바로 시작할 수 있어요
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-label-lg text-muted-foreground">방 이름</span>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 8월 4주차 Spring 스터디"
          className={`${FIELD} ${FOCUS} text-body-lg text-ink placeholder:text-muted-foreground`}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-label-lg text-muted-foreground">문제 세트</span>
        <span className="relative block w-[440px]">
          <select
            name="set"
            value={setId}
            onChange={(e) => setSetId(e.target.value)}
            className={`${FIELD} ${FOCUS} w-full appearance-none pr-11 text-heading-sm text-ink`}
          >
            {sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — {s.questionCount}문항
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-[18px] -translate-y-1/2 text-label-lg text-mint-dark"
          >
            ▾
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-label-lg text-muted-foreground">방 유형</span>
        <RoomTypeTabs value={roomType} onChange={setRoomType} paidLocked={paidLocked} />
      </div>

      {isPaid && (
        <>
          <label className="flex flex-col gap-2">
            <span className="text-label-lg text-muted-foreground">참가비 (1인당)</span>
            <span className={`${FIELD} flex items-center justify-between gap-3`}>
              <input
                type="text"
                name="fee"
                inputMode="numeric"
                value={`₩ ${fee.toLocaleString("ko-KR")}`}
                onChange={handleFeeChange}
                className={`${FOCUS} min-w-0 flex-1 bg-transparent text-heading-sm text-ink`}
              />
              <span className="shrink-0 text-label-lg text-mint-dark">원</span>
            </span>
          </label>

          <SettlementPreview fee={fee} teacherShare={setup.teacherShare} />

          <ReputationRow
            level={setup.reputation.level}
            title={setup.reputation.title}
            minLevel={setup.paidMinLevel}
          />
        </>
      )}

      <p className="flex gap-1.5">
        <span className="text-body-md text-muted-foreground">맞는 세트가 없나요?</span>
        <Link href={editorHref} className="text-label-lg text-mint-dark hover:underline">
          에디터에서 새로 만들기 →
        </Link>
      </p>

      <button
        type="submit"
        className="flex h-14 w-[440px] items-center justify-center rounded-2xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark"
      >
        다음 — 문제 준비
      </button>

      <p className="text-label-md text-muted-foreground">
        방을 만들면 6자리 PIN이 자동으로 발급돼요
      </p>
    </form>
  );
}
