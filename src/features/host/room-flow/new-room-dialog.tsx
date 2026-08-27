"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import { FIELD_INPUT_CLASS, FieldInput } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUESTION_SETS, ROOM_SETUP } from "@/features/host/mock";
import { cn } from "@/lib/utils";
import { ReputationRow } from "./reputation-row";
import { RoomTypeTabs, type RoomType } from "./room-type-tabs";
import { SettlementPreview } from "./settlement-preview";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** 방 생성 후 이동할 대기실 — 목 단계 데모 방 (host/mock LIVE_ROOM.code) */
const DEMO_LOBBY_HREF = "/host/rooms/DEMO01/lobby";

const SET_ITEMS = QUESTION_SETS.map((s) => ({
  value: s.id,
  label: `${s.title} (${s.questionCount}문항)`,
}));

const LABEL = "text-label-md text-muted-foreground";

/**
 * W-01 v6 새 방 만들기 모달 (FAB · 빈 상태 CTA) — 방 이름 · 문제 세트 · 방 유형.
 * 유료를 고르면 모달 안에서 참가비 · 정산 미리보기 · 명성 행이 펼쳐진다. 확정 시 바로 PIN 발급 → 대기실.
 */
export function NewRoomDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const nameId = useId();
  const setId = useId();
  const feeId = useId();

  const [name, setName] = useState("");
  const [questionSetId, setQuestionSetId] = useState(QUESTION_SETS[0]?.id ?? "");
  const [roomType, setRoomType] = useState<RoomType>("free");
  const [fee, setFee] = useState(ROOM_SETUP.defaultFee);

  const paidLocked = ROOM_SETUP.reputation.level < ROOM_SETUP.paidMinLevel;
  const isPaid = roomType === "paid";

  const handleFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFee(digits ? Number(digits) : 0);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO(API): 방 생성(이름·세트·유형·참가비) → 발급된 PIN/code로 대기실 이동
    onOpenChange(false);
    router.push(DEMO_LOBBY_HREF);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-[560px] max-w-[560px] flex-col gap-5 rounded-[20px] bg-card p-7 text-body-md shadow-[0_16px_35px] ring-0 shadow-black/18 sm:max-w-[560px]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-heading-md text-foreground">새 방 만들기</DialogTitle>
            <DialogClose
              aria-label="닫기"
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-mint"
            >
              <X size={24} strokeWidth={2} aria-hidden />
            </DialogClose>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={nameId} className={LABEL}>
              방 이름
            </label>
            <FieldInput
              id={nameId}
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 8월 4주차 Spring 스터디"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={setId} className={LABEL}>
              문제 세트
            </label>
            <Select
              items={SET_ITEMS}
              value={questionSetId}
              onValueChange={(value) => {
                if (value) setQuestionSetId(value);
              }}
            >
              <SelectTrigger
                id={setId}
                className={cn(
                  FIELD_INPUT_CLASS,
                  "justify-between border-0 text-label-lg data-[size=default]:h-12",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SET_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="text-label-lg">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL}>방 유형</span>
            <RoomTypeTabs
              size="sm"
              value={roomType}
              onChange={setRoomType}
              paidLocked={paidLocked}
              paidLabel={`유료 (Lv.${ROOM_SETUP.paidMinLevel}부터)`}
            />
          </div>

          {isPaid && (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor={feeId} className={LABEL}>
                  참가비 (1인당)
                </label>
                <FieldInput
                  id={feeId}
                  type="text"
                  name="fee"
                  inputMode="numeric"
                  value={`₩ ${fee.toLocaleString("ko-KR")}`}
                  onChange={handleFeeChange}
                  className="text-label-lg"
                />
              </div>
              <SettlementPreview fee={fee} hostShare={ROOM_SETUP.hostShare} />
              <ReputationRow
                level={ROOM_SETUP.reputation.level}
                title={ROOM_SETUP.reputation.title}
                minLevel={ROOM_SETUP.paidMinLevel}
              />
            </>
          )}

          <p className="text-label-md text-ink-disabled">
            PIN은 방을 만들면 자동으로 발급돼요 · 프로젝터 화면은 웹에서 열립니다
          </p>

          <div className="flex justify-end gap-2.5">
            <Button
              type="button"
              size="xl"
              className="bg-mint-bg text-mint-dark hover:bg-mint-tint"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" size="xl">
              방 만들기 → PIN 발급
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
