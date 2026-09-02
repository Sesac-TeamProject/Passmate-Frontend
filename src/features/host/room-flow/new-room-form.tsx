"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import type { RoomCreateRequest } from "@/lib/types/dto";
import {
  DEFAULT_ENTRY_FEE,
  HOST_SHARE,
  levelTitle,
  PAID_ROOM_MIN_LEVEL,
  type QuestionSetOption,
} from "./adapt";
import { ReputationRow } from "./reputation-row";
import { RoomTypeTabs, type RoomType } from "./room-type-tabs";
import { SettlementPreview } from "./settlement-preview";
import { PendingLabel } from "@/components/common/pending-label";

/** 다시 그릴 때 복원할 입력값. W-02e에서 "설정으로 돌아가기"로 돌아올 때 쓴다 */
export type NewRoomInitialValues = {
  title: string;
  setId: string;
  roomType: RoomType;
  fee: number;
};

type Props = {
  /** 확정(CONFIRMED)된 문제 세트만 */
  sets: QuestionSetOption[];
  /** 명성 레벨. 유료 탭 잠금·명성 행에 쓴다 */
  level: number;
  onSubmit: (body: RoomCreateRequest) => void;
  pending?: boolean;
  errorMessage?: string | null;
  editorHref: string;
  /** 없으면 빈 폼으로 시작한다 */
  initialValues?: NewRoomInitialValues;
};

const FIELD = "h-[54px] w-[440px] rounded-2xl bg-muted px-[18px]";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** W-02 v2 방 설정 카드 — 방 이름·문제 세트·방 유형(무료/유료)·참가비 */
export function NewRoomForm({
  sets,
  level,
  onSubmit,
  pending,
  errorMessage,
  editorHref,
  initialValues,
}: Props) {
  const [name, setName] = useState(initialValues?.title ?? "");
  const [setId, setSetId] = useState(initialValues?.setId ?? sets[0]?.id ?? "");
  const [roomType, setRoomType] = useState<RoomType>(initialValues?.roomType ?? "free");
  const [fee, setFee] = useState(initialValues?.fee ?? DEFAULT_ENTRY_FEE);

  const paidLocked = level < PAID_ROOM_MIN_LEVEL;
  const isPaid = roomType === "paid";

  function handleFeeChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setFee(digits ? Number(digits) : 0);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    // 값이 없는 필드는 키를 빼서 보낸다 — 서버가 null을 검증에 걸 수 있다(R-4)
    onSubmit({
      title: name.trim(),
      type: isPaid ? "PAID" : "FREE",
      ...(setId ? { questionSetId: Number(setId) } : {}),
      ...(isPaid ? { fee } : {}),
      isPublic: true,
    });
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
          required
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

          <SettlementPreview fee={fee} hostShare={HOST_SHARE} />

          <ReputationRow level={level} title={levelTitle(level)} minLevel={PAID_ROOM_MIN_LEVEL} />
        </>
      )}

      <p className="flex gap-1.5">
        <span className="text-body-md text-muted-foreground">맞는 세트가 없나요?</span>
        <Link href={editorHref} className="text-label-lg text-mint-dark hover:underline">
          에디터에서 새로 만들기 →
        </Link>
      </p>

      {errorMessage && (
        <p role="alert" className="text-label-lg text-negative">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-[440px] items-center justify-center rounded-2xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
      >
        {pending ? <PendingLabel>방 만드는 중…</PendingLabel> : "방 만들기 → PIN 발급"}
      </button>

      <p className="text-label-md text-muted-foreground">
        방을 만들면 6자리 PIN이 자동으로 발급돼요
      </p>
    </form>
  );
}
