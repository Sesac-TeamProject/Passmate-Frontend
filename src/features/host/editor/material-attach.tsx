"use client";

import { useRef, useState, type DragEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { PendingLabel } from "@/components/common/pending-label";
import { extractMaterial } from "@/lib/api/question-sets";
import type { MaterialExtractResponse } from "@/lib/types/dto";
import { cn } from "@/lib/utils";

const ACCEPT = ".pdf,.docx,.pptx,.txt,.md";
/** 서버 정책(`material-max-upload-mb`)과 같은 값 — 넘는 파일은 올리기 전에 거른다 */
const MAX_UPLOAD_MB = 10;

type Props = {
  /** 추출된 본문을 폼의 material 로 올린다. 파일을 빼면 빈 문자열이 온다 */
  onMaterialChange: (text: string) => void;
  disabled?: boolean;
};

/**
 * W-03 "강의자료 첨부" — 붙여넣기 텍스트 박스를 파일 첨부로 바꾼 것.
 *
 * 선생님 자료는 대부분 PDF·PPT 라 붙여넣기로는 옮겨 담기 어려웠다.
 * 파일은 서버에 저장되지 않는다 — 본문 글자만 돌아와 기존 material 계약에 그대로 실린다.
 */
export function MaterialAttach({ onMaterialChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [attached, setAttached] = useState<MaterialExtractResponse | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function attach(file: File) {
    if (extracting || disabled) return;
    setError(null);

    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`강의자료는 ${MAX_UPLOAD_MB}MB 까지 올릴 수 있어요`);
      return;
    }

    setExtracting(true);
    try {
      const result = await extractMaterial(file);
      setAttached(result);
      onMaterialChange(result.text);
    } catch (e) {
      // 서버가 이유를 문장으로 준다(형식·암호·스캔 문서) — 그대로 보여 준다
      setError(e instanceof Error ? e.message : "파일을 읽지 못했어요. 다시 시도해 주세요");
    } finally {
      setExtracting(false);
    }
  }

  function detach() {
    setAttached(null);
    setError(null);
    onMaterialChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void attach(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void attach(file);
        }}
      />

      {attached === null ? (
        <button
          type="button"
          disabled={disabled || extracting}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border border-dashed bg-muted px-3.5 py-5",
            "text-label-lg text-muted-foreground transition-colors hover:border-mint hover:text-mint-dark",
            "disabled:opacity-60",
            dragOver && "border-mint bg-mint-tint text-mint-dark",
          )}
        >
          {extracting ? (
            <PendingLabel>본문을 읽는 중…</PendingLabel>
          ) : (
            <>
              <span className="flex items-center gap-1.5">
                <Paperclip size={16} aria-hidden />
                파일을 끌어다 놓거나 눌러서 고르세요
              </span>
              <span className="text-label-md">
                PDF · 워드 · PPT · 텍스트 (최대 {MAX_UPLOAD_MB}MB)
              </span>
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5">
          <Paperclip size={16} className="shrink-0 text-mint-dark" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-label-lg text-ink">
            {attached.fileName}
          </span>
          <span className="shrink-0 text-label-md text-muted-foreground">
            {attached.charCount.toLocaleString()}자
            {/* 상한을 넘긴 자료는 뒤가 빠졌다 — 조용히 자르면 왜 출제 범위가 좁은지 알 수 없다 */}
            {attached.truncated && " · 뒷부분 잘림"}
          </span>
          <button
            type="button"
            onClick={detach}
            aria-label="강의자료 제거"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-card hover:text-ink"
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      )}

      {error !== null && (
        <p role="alert" className="text-label-md text-negative">
          {error}
        </p>
      )}
    </div>
  );
}
