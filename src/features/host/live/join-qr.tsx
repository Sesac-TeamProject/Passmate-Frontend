"use client";

import { QRCodeSVG } from "qrcode.react";

/** QR 한 변(px) — 시안 대기실 카드 안 QR 자리 */
const QR_SIZE = 116;

/**
 * 대기실 QR — 학생이 찍으면 PIN이 채워진 입장 화면으로 간다.
 * `window.location.origin`을 읽으므로 서버에서 렌더하면 안 된다(부르는 쪽에서 dynamic ssr:false로 불러온다).
 */
export function JoinQr({ pin }: { pin: string }) {
  return (
    <QRCodeSVG
      value={`${window.location.origin}/join?pin=${pin}`}
      size={QR_SIZE}
      aria-label="QR 코드"
    />
  );
}
