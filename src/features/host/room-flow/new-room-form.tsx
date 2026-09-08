"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { writeNewRoomDraft } from "@/lib/new-room-draft";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  /** 호스트 등급. 서버가 아직 등급을 안 주면 null — 그때는 잠그지도, 등급을 그리지도 않는다 */
  level: number | null;
  onSubmit: (body: RoomCreateRequest) => void;
  pending?: boolean;
  errorMessage?: string | null;
  editorHref: string;
  /** 없으면 빈 폼으로 시작한다 */
  initialValues?: NewRoomInitialValues;
  /** 에디터에서 방금 확정한 세트(`?set=`). 임시 보관값보다 이 값이 이긴다 */
  preferredSetId?: string;
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
  preferredSetId,
}: Props) {
  const setFieldId = useId();
  const [name, setName] = useState(initialValues?.title ?? "");
  // 초안에 남은 빈 세트("")는 값이 아니다 — `??` 로 두면 에디터에서 돌아온 `?set=`과 첫 세트를 가린다
  const [pickedSetId, setSetId] = useState(initialValues?.setId || preferredSetId || "");
  // 세트 목록이 늦게 와도 첫 확정 세트를 골라 둔다 — 고른 것이 없으면 만들기가 잠겨 있었다
  const setId = pickedSetId || sets[0]?.id || "";
  const [roomType, setRoomType] = useState<RoomType>(initialValues?.roomType ?? "free");
  const [fee, setFee] = useState(initialValues?.fee ?? DEFAULT_ENTRY_FEE);

  /**
   * 에디터를 다녀오면 이 화면은 새로 그려진다 — 적어 둔 값을 탭에 남겨 둔다.
   * 되살리는 쪽은 컨테이너가 맡는다(`initialValues`) — 여기서는 쓰기만 한다.
   * 빈 폼은 저장하지 않는다: 되살리기 전에 한 번 쓰면 남아 있던 값을 빈 값으로 덮는다.
   */
  useEffect(() => {
    if (name.trim() === "") return;
    writeNewRoomDraft({ title: name, setId, roomType, fee });
  }, [name, setId, roomType, fee]);

  // 확정 세트가 하나도 없으면 고를 것이 없다 — 셀렉트를 잠그고 제출도 막는다.
  // 서버는 세트 없는 방을 만들어 주지만(대기실에서 연결 가능) 빈 셀렉트를 눌러 봐야
  // 아무 것도 안 뜨는 화면이 되고, 만들어진 방은 대기실에서 다시 세트를 붙여야 한다.
  const hasSets = sets.length > 0;
  const setItems = sets.map((s) => ({ value: s.id, label: `${s.title} — ${s.questionCount}문항` }));

  // 서버가 등급을 못 준 경우(조회 실패)는 잠그지 않는다 — 없는 Lv.1을 지어내는 대신
  // 서버의 403 HOST_LEVEL_REQUIRED가 판정하게 둔다.
  const paidLocked = level !== null && level < PAID_ROOM_MIN_LEVEL;
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

      <div className="flex flex-col gap-2">
        <label htmlFor={setFieldId} className="text-label-lg text-muted-foreground">
          문제 세트
        </label>
        <Select
          items={setItems}
          // 고른 값이 없을 때는 null이어야 placeholder가 나온다(빈 문자열은 값으로 친다)
          value={setId || null}
          onValueChange={(value) => setSetId(value ?? "")}
          disabled={!hasSets}
        >
          {/* 시안의 ▾를 그대로 쓰려고 컴포넌트가 그리는 아이콘은 감춘다 */}
          <SelectTrigger
            id={setFieldId}
            className={`${FIELD} ${FOCUS} justify-between border-0 text-heading-sm text-ink disabled:cursor-not-allowed disabled:opacity-60 data-[size=default]:h-[54px] [&_svg]:hidden`}
          >
            <SelectValue placeholder="확정한 세트가 없어요" />
            <span
              aria-hidden
              className={`text-label-lg ${hasSets ? "text-mint-dark" : "text-muted-foreground"}`}
            >
              ▾
            </span>
          </SelectTrigger>
          {/*
            목록은 트리거 바로 아래에 순서대로 편다. 기본값(alignItemWithTrigger)은 고른 항목을
            트리거 위에 겹쳐 띄우는 네이티브 셀렉트 동작이라 화면이 덜컹거려 보인다.
          */}
          <SelectContent side="bottom" align="start" alignItemWithTrigger={false}>
            {setItems.map((item) => (
              <SelectItem key={item.value} value={item.value} className="text-body-md">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

          {level !== null && (
            <ReputationRow level={level} title={levelTitle(level)} minLevel={PAID_ROOM_MIN_LEVEL} />
          )}
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
        disabled={pending || !setId}
        className="flex h-14 w-[440px] items-center justify-center rounded-2xl bg-mint text-heading-sm text-white transition-colors hover:bg-mint-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <PendingLabel>방 만드는 중…</PendingLabel> : "방 만들기 → PIN 발급"}
      </button>

      <p className="text-label-md text-muted-foreground">
        방을 만들면 6자리 PIN이 자동으로 발급돼요
      </p>
    </form>
  );
}
