"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** 힌트 음성 파일 URL — 없으면(자리표시 상태) 재생 없이 정적으로만 보인다 */
  clipUrl?: string;
  /** 서버가 준 길이(ms). 실제 오디오 메타데이터가 로드되면 그 값으로 갱신한다 */
  durationMs?: number | null;
};

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * 선생님 음성 힌트 수신 배너 (재생 진행 표시).
 * clipUrl이 있으면 자동 재생을 시도하고, 브라우저 정책으로 막히면 ♪ 배지를 눌러 수동 재생한다.
 */
export function HintBanner({ clipUrl, durationMs }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState((durationMs ?? 0) / 1000);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);

  useEffect(() => {
    if (!clipUrl) return;
    // <audio autoPlay>는 실패해도 알려주지 않는다 — 직접 play()를 호출해 정책 차단(reject)을 잡는다.
    audioRef.current?.play().catch(() => setNeedsManualPlay(true));
  }, [clipUrl]);

  const handlePlayClick = () => {
    audioRef.current
      ?.play()
      .then(() => setNeedsManualPlay(false))
      .catch(() => {
        // 사용자 제스처로 시도했는데도 실패하면 더 안내할 방법이 없다 — 조용히 무시
      });
  };

  return (
    <div className="flex items-center gap-3 self-center rounded-2xl border bg-card py-2.5 pr-4 pl-3.5">
      <button
        type="button"
        onClick={clipUrl ? handlePlayClick : undefined}
        aria-label="음성 힌트 재생"
        className="flex size-[30px] items-center justify-center rounded-full bg-mint-tint text-label-lg text-mint-dark disabled:opacity-60"
        disabled={!clipUrl}
      >
        ♪
      </button>
      <span className="text-label-lg text-ink">
        선생님 음성 힌트 {needsManualPlay ? "도착 — 눌러서 재생" : "재생 중"}
      </span>
      <span className="h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-muted">
        <span
          className="block h-full rounded-[3px] bg-mint"
          style={{ width: `${duration > 0 ? Math.min(100, (position / duration) * 100) : 0}%` }}
        />
      </span>
      <span className="text-label-lg text-muted-foreground tabular-nums">
        {mmss(position)} / {mmss(duration)}
      </span>
      {clipUrl && (
        <audio
          ref={audioRef}
          src={clipUrl}
          autoPlay
          hidden
          onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setNeedsManualPlay(false)}
          onError={() => setNeedsManualPlay(true)}
        />
      )}
    </div>
  );
}
