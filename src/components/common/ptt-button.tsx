"use client";

import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** 녹음이 끝나면 클립과 길이(ms)를 넘긴다 — 업로드는 컨테이너가 한다 */
  onRecorded: (clip: Blob, durationMs: number) => void;
  /** 권한 거부·미지원 등 사용자에게 보여줄 문구 */
  onError?: (message: string) => void;
  uploading?: boolean;
  disabled?: boolean;
  className?: string;
};

/** 브라우저가 지원하면 이 코덱으로, 아니면 기본값으로 녹음한다 */
const PREFERRED_MIME = "audio/webm;codecs=opus";

const PERMISSION_MESSAGE = "마이크 권한이 필요해요";
const UNSUPPORTED_MESSAGE = "이 브라우저에서는 음성 힌트를 쓸 수 없어요";

/**
 * PTT(Push-To-Talk) 버튼 — 누르고 있는 동안 녹음하고 떼면 클립을 넘긴다(W-05 음성 힌트).
 * 포인터를 누른 채 버튼 밖으로 나가거나 취소돼도 녹음을 정리한다.
 */
export function PttButton({
  onRecorded,
  onError,
  uploading = false,
  disabled = false,
  className,
}: Props) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  // 권한 팝업이 뜬 사이에 손을 떼면 녹음을 시작하지 않는다
  const heldRef = useRef(false);
  // 언마운트 뒤에는 클립을 올리지 않는다 — 사라진 화면의 콜백을 부르지 않기 위해
  const unmountedRef = useRef(false);

  // 누른 채로 화면이 바뀌어도(진행 → 결과 라우팅 등) 녹음기와 마이크를 반드시 놓는다
  useEffect(() => {
    const recorderHolder = recorderRef;
    const streamHolder = streamRef;
    const unmountedHolder = unmountedRef;
    const heldHolder = heldRef;

    return () => {
      unmountedHolder.current = true;
      heldHolder.current = false;
      const recorder = recorderHolder.current;
      recorderHolder.current = null;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      streamHolder.current?.getTracks().forEach((t) => t.stop());
      streamHolder.current = null;
    };
  }, []);

  const stopRecording = () => {
    heldRef.current = false;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    setRecording(false);
    if (recorder && recorder.state !== "inactive") recorder.stop();
  };

  const startRecording = async () => {
    if (disabled || uploading || recorderRef.current) return;
    heldRef.current = true;

    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      heldRef.current = false;
      onError?.(UNSUPPORTED_MESSAGE);
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      heldRef.current = false;
      onError?.(PERMISSION_MESSAGE);
      return;
    }

    const stopTracks = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (streamRef.current === stream) streamRef.current = null;
    };
    // 권한 팝업을 기다리는 사이에 손을 떼거나 화면이 사라졌으면 시작하지 않는다
    if (!heldRef.current || unmountedRef.current) {
      stopTracks();
      return;
    }
    streamRef.current = stream;

    const recorder = new MediaRecorder(
      stream,
      MediaRecorder.isTypeSupported(PREFERRED_MIME) ? { mimeType: PREFERRED_MIME } : undefined,
    );
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      stopTracks();
      const clip = new Blob(chunks, { type: recorder.mimeType || PREFERRED_MIME });
      if (clip.size > 0 && !unmountedRef.current)
        onRecorded(clip, Date.now() - startedAtRef.current);
    };

    startedAtRef.current = Date.now();
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  const label = uploading
    ? "전송 중…"
    : recording
      ? "녹음 중… 손을 떼면 전송"
      : "길게 눌러 힌트 말하기";

  return (
    <button
      type="button"
      aria-pressed={recording}
      disabled={disabled || uploading}
      onPointerDown={() => void startRecording()}
      onPointerUp={stopRecording}
      onPointerLeave={stopRecording}
      onPointerCancel={stopRecording}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "flex h-12 touch-none items-center gap-2.5 rounded-full border bg-card px-[22px] text-label-lg text-mint-dark transition-colors select-none hover:bg-mint-bg disabled:opacity-60",
        recording && "border-mint bg-mint-tint",
        className,
      )}
    >
      <Mic className={cn("size-4 text-mint", recording && "animate-pulse")} aria-hidden />
      {label}
    </button>
  );
}
