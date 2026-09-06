"use client";

import { useState } from "react";
import { PendingLabel } from "@/components/common/pending-label";
import { FlowTopBar } from "@/features/host/room-flow/flow-top-bar";
import type { AiGenerateRequest } from "@/lib/types/dto";
import { GeneratePanel } from "./generate-panel";
import { PreviewDialog } from "./preview-dialog";
import { QuestionForm } from "./question-form";
import { QuestionList } from "./question-list";
import type { EditorQuestion, QuestionFormValues } from "./types";

type FormState = {
  values: QuestionFormValues;
  mode: "create" | "edit";
  onChange: (values: QuestionFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  pending: boolean;
  errorMessage: string | null;
};

type Props = {
  title: string;
  questions: EditorQuestion[];
  /** 확정된 세트면 편집을 막는다(서버도 409로 막는다) */
  readOnly: boolean;
  onGenerate: (body: AiGenerateRequest) => void;
  generating: boolean;
  generateError: string | null;
  /** 열려 있을 때만 폼을 그린다 */
  form: FormState | null;
  onAddManual: () => void;
  onEdit: (question: EditorQuestion) => void;
  onRegenerate: (question: EditorQuestion) => void;
  onDelete: (question: EditorQuestion) => void;
  onMove: (question: EditorQuestion, direction: "up" | "down") => void;
  busyQuestionId: number | null;
  listError: string | null;
  onConfirm: () => void;
  confirming: boolean;
  canConfirm: boolean;
  confirmError: string | null;
};

/**
 * W-03 문제 에디터.
 *
 * 진입은 "문제 세트 › 수정하기"다 — 방 만들기는 W-02에서 끝나므로 예전 "2/3 단계" 배지는 뺐다.
 */
export function EditorPage({
  title,
  questions,
  readOnly,
  onGenerate,
  generating,
  generateError,
  form,
  onAddManual,
  onEdit,
  onRegenerate,
  onDelete,
  onMove,
  busyQuestionId,
  listError,
  onConfirm,
  confirming,
  canConfirm,
  confirmError,
}: Props) {
  // 확정 전에 학생이 볼 모습을 훑는 창. 서버와 주고받는 게 없어 화면 안에서만 여닫는다
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <FlowTopBar backHref="/host/sets" title={title} badge="문제 세트 › 수정하기">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="flex h-[42px] items-center rounded-[14px] bg-muted px-5 text-label-lg text-mint-dark transition-colors hover:bg-mint-tint"
        >
          미리보기
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm || confirming}
          className="flex h-[42px] items-center rounded-[14px] bg-mint-tint px-5 text-label-lg text-mint-dark transition-colors hover:bg-mint hover:text-white disabled:opacity-60"
        >
          {confirming ? <PendingLabel>확정하는 중…</PendingLabel> : "세트 확정하기"}
        </button>
      </FlowTopBar>

      {confirmError ? (
        <p role="alert" className="px-8 pt-4 text-label-lg text-negative">
          {confirmError}
        </p>
      ) : null}

      <main className="flex flex-1 gap-6 px-8 py-6">
        <GeneratePanel
          onGenerate={onGenerate}
          onAddManual={onAddManual}
          generating={generating}
          errorMessage={generateError}
          disabled={readOnly}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {form ? (
            <QuestionForm
              values={form.values}
              mode={form.mode}
              onChange={form.onChange}
              onSubmit={form.onSubmit}
              onCancel={form.onCancel}
              pending={form.pending}
              errorMessage={form.errorMessage}
            />
          ) : null}

          {listError ? (
            <p role="alert" className="text-label-md text-negative">
              {listError}
            </p>
          ) : null}

          <QuestionList
            questions={questions}
            busyQuestionId={busyQuestionId}
            readOnly={readOnly}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            onDelete={onDelete}
            onMove={onMove}
          />
        </div>
      </main>

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={title}
        questions={questions}
      />
    </div>
  );
}
