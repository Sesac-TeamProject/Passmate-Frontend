"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import { FIELD_INPUT_CLASS, FieldInput } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PendingLabel } from "@/components/common/pending-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomCreateRequest } from "@/lib/types/dto";
import { cn } from "@/lib/utils";
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 확정(CONFIRMED)된 문제 세트만 */
  sets: QuestionSetOption[];
  /** 명성 레벨. 유료 탭 잠금·명성 행에 쓴다 */
  /** 호스트 등급. 서버가 아직 등급을 안 주면 null — 그때는 잠그지도, 등급을 그리지도 않는다 */
  level: number | null;
  onSubmit: (body: RoomCreateRequest) => void;
  pending?: boolean;
  errorMessage?: string | null;
};

const LABEL = "text-label-md text-muted-foreground";

/**
 * W-01 v6 새 방 만들기 모달 (FAB · 빈 상태 CTA) — 방 이름 · 문제 세트 · 방 유형.
 * 유료를 고르면 모달 안에서 참가비 · 정산 미리보기 · 명성 행이 펼쳐진다. 확정 시 바로 PIN 발급 → 대기실.
 */
export function NewRoomDialog({
  open,
  onOpenChange,
  sets,
  level,
  onSubmit,
  pending,
  errorMessage,
}: Props) {
  const nameId = useId();
  const setFieldId = useId();
  const feeId = useId();

  const [name, setName] = useState("");
  const [questionSetId, setQuestionSetId] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("free");
  const [fee, setFee] = useState(DEFAULT_ENTRY_FEE);

  // 모달은 목록보다 먼저 마운트되므로 세트가 도착하면 첫 세트를 기본값으로 채운다.
  // 렌더 중 조정(react.dev "Adjusting state when a prop changes") — effect 안에서 setState 하지 않는다.
  const firstSetId = sets[0]?.id ?? "";
  if (questionSetId === "" && firstSetId !== "") setQuestionSetId(firstSetId);

  const setItems = sets.map((s) => ({ value: s.id, label: `${s.title} (${s.questionCount}문항)` }));
  // 서버가 등급을 못 준 경우(조회 실패)는 잠그지 않는다 — 없는 Lv.1을 지어내는 대신
  // 서버의 403 HOST_LEVEL_REQUIRED가 판정하게 둔다.
  const paidLocked = level !== null && level < PAID_ROOM_MIN_LEVEL;
  const isPaid = roomType === "paid";

  const handleFeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFee(digits ? Number(digits) : 0);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    // 값이 없는 필드는 키를 빼서 보낸다 — 서버가 null을 검증에 걸 수 있다(R-4)
    onSubmit({
      title: name.trim(),
      type: isPaid ? "PAID" : "FREE",
      ...(questionSetId ? { questionSetId: Number(questionSetId) } : {}),
      ...(isPaid ? { fee } : {}),
      isPublic: true,
    });
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
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 8월 4주차 Spring 스터디"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={setFieldId} className={LABEL}>
              문제 세트
            </label>
            <Select
              items={setItems}
              value={questionSetId}
              onValueChange={(value) => {
                if (value) setQuestionSetId(value);
              }}
            >
              <SelectTrigger
                id={setFieldId}
                className={cn(
                  FIELD_INPUT_CLASS,
                  "justify-between border-0 text-label-lg data-[size=default]:h-12",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setItems.map((item) => (
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
              paidLabel={`유료 (Lv.${PAID_ROOM_MIN_LEVEL}부터)`}
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
              <SettlementPreview fee={fee} hostShare={HOST_SHARE} />
              {level !== null && (
                <ReputationRow
                  level={level}
                  title={levelTitle(level)}
                  minLevel={PAID_ROOM_MIN_LEVEL}
                />
              )}
            </>
          )}

          {errorMessage && (
            <p role="alert" className="text-label-lg text-negative">
              {errorMessage}
            </p>
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
            <Button type="submit" size="xl" disabled={pending}>
              {pending ? <PendingLabel>방 만드는 중…</PendingLabel> : "방 만들기 → PIN 발급"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
