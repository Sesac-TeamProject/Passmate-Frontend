"use client";

import { Fragment, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Student } from "@/features/host/types";
import { formatPin } from "@/lib/format";
import { LobbyRail, LobbyRailMini } from "./lobby-rail";
import { ProjectorShell } from "./projector-shell";
import { PendingLabel } from "@/components/common/pending-label";

// window.location을 읽는 QR은 서버 렌더에서 제외한다 — 자리는 회색 박스로 잡아 둔다.
const JoinQr = dynamic(() => import("./join-qr").then((m) => m.JoinQr), {
  ssr: false,
  loading: () => <div aria-label="QR 코드" className="size-[116px] rounded-[10px] bg-muted" />,
});

/** 시안이 문항 수를 두 자리로 맞춘다("08 문항") */
function padCount(value: number | null): string {
  return value === null ? "—" : String(value).padStart(2, "0");
}

/**
 * 학생에게 알려 줄 접속 주소.
 * 도메인을 코드에 박으면 배포 주소가 바뀔 때 **학생이 없는 주소로 간다** —
 * 실제로 `passmate.app`이 박혀 있었지만 서비스 도메인은 `passmate.kr`이었다.
 * QR과 같은 값을 쓰도록 지금 열려 있는 주소에서 읽는다.
 */
const NO_SUBSCRIBE = () => () => {};
const readHostOnServer = () => "";
const readHost = () => window.location.host;

/** 입장 방법 3단계 안내 — 가운데 단계에만 PIN이 들어간다 */
function toSteps(prettyPin: string, host: string): string[] {
  return [
    host ? `${host} 접속` : "선생님 화면의 주소로 접속",
    `코드 ${prettyPin} 입력`,
    "닉네임 · 캐릭터 고르기",
  ];
}

/**
 * 방에 확정 세트가 아직 연결되지 않았을 때 대기실에서 바로 붙이는 셀렉트.
 * 서버는 세트 없이 세션을 시작하면 409 `QUESTION_SET_REQUIRED`로 막는다.
 */
export type SetLinkPanel = {
  options: { id: string; title: string; questionCount: number }[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  errorMessage: string | null;
};

type Props = {
  /** 6자리 참여 PIN */
  pin: string;
  title: string;
  /** 헤더 오른쪽 진행 날짜. scheduledAt이 없으면 null */
  dateLabel: string | null;
  /** 방을 연 선생님 닉네임 */
  hostName: string | null;
  students: Student[];
  questionCount: number | null;
  /** 문항당 제한 시간(초). 호스트용 방 상세 계약이 없어 지금은 늘 null (DESIGN_GAPS D-6) */
  timeLimitSec: number | null;
  isPaid: boolean;
  maxParticipants: number | null;
  onStart: () => void;
  /** 세션 시작 요청 중 */
  starting?: boolean;
  errorMessage?: string | null;
  /** 세트가 연결돼 있으면 null — 연결 UI를 그리지 않는다 */
  setLink?: SetLinkPanel | null;
  /** 참가자 내보내기(강퇴) */
  onKick?: (studentId: string) => void;
  kickingId?: string | null;
};

/**
 * W-04 대기실 (프로젝터) — 흰 바탕에 PIN·QR을 민트 패널 하나로 묶고,
 * 입장 방법 3단계와 방 설정 통계를 아래에 깔고, 들어온 학생은 오른쪽 레일에 쌓는다.
 */
export function LobbyPage({
  pin,
  title,
  dateLabel,
  hostName,
  students,
  questionCount,
  timeLimitSec,
  isPaid,
  maxParticipants,
  onStart,
  starting,
  errorMessage,
  setLink,
  onKick,
  kickingId,
}: Props) {
  const prettyPin = formatPin(pin);
  // 서버 렌더에는 주소가 없다 — 빈 값으로 그렸다가 브라우저에서 채운다(하이드레이션 어긋남 방지)
  const host = useSyncExternalStore(NO_SUBSCRIBE, readHost, readHostOnServer);
  const steps = toSteps(prettyPin, host);
  const meta = [
    { value: padCount(questionCount), label: "문항" },
    { value: timeLimitSec === null ? "—" : `${timeLimitSec}초`, label: "문항당 제한" },
    { value: isPaid ? "유료" : "무료", label: "방 유형", accent: true },
    { value: maxParticipants === null ? "—" : `${maxParticipants}명`, label: "최대 인원" },
  ];

  return (
    <ProjectorShell
      rail={<LobbyRail students={students} onKick={onKick} kickingId={kickingId} />}
      railCollapsed={<LobbyRailMini students={students} />}
      top={
        <>
          <div className="flex items-center gap-[18px]">
            <span className="flex items-center gap-2.5">
              <span aria-hidden className="size-[9px] rounded-full bg-mint" />
              <span className="text-label-md font-bold tracking-[0.16em] text-mint-dark">
                대기중
              </span>
            </span>
            <span aria-hidden className="h-4 w-px bg-border" />
            <h1 className="text-heading-md">{title}</h1>
          </div>
          <p className="text-body-md text-muted-foreground">
            {[dateLabel, hostName && `${hostName} 선생님`].filter(Boolean).join("   ·   ")}
          </p>
        </>
      }
      bottom={
        <>
          {errorMessage ? (
            <p role="alert" className="text-body-md text-negative">
              {errorMessage}
            </p>
          ) : setLink ? (
            <p className="text-body-md text-negative">확정한 문제 세트를 먼저 연결해 주세요</p>
          ) : (
            <p className="text-body-md text-muted-foreground">
              학생이 들어오는 대로 오른쪽에 쌓여요
            </p>
          )}
          <span className="flex items-center gap-3">
            {setLink ? (
              <span className="flex items-center gap-2">
                <select
                  aria-label="연결할 문제 세트"
                  value={setLink.value}
                  onChange={(e) => setLink.onChange(e.target.value)}
                  className="h-13 rounded-2xl bg-muted px-4 text-body-md text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">세트 고르기</option>
                  {setLink.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.title} — {option.questionCount}문항
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={setLink.onSubmit}
                  disabled={setLink.pending || setLink.value === ""}
                  className="h-13 rounded-2xl bg-mint-tint px-5 text-label-lg font-bold text-mint-dark transition-colors hover:bg-mint hover:text-white disabled:opacity-60"
                >
                  {setLink.pending ? <PendingLabel>연결 중…</PendingLabel> : "세트 연결"}
                </button>
              </span>
            ) : null}
            {/* 시안 W-04: 시험 시작 왼쪽에 문항별 시간 설정 진입 — 시작 전에만 바꿀 수 있다 */}
            <Link
              href={`/host/rooms/${pin}/timing`}
              className="flex h-13 items-center rounded-2xl px-5 text-label-lg font-bold text-mint-dark transition-colors hover:bg-mint-tint"
            >
              문항별 시간 설정 ›
            </Link>
            <button
              type="button"
              onClick={onStart}
              disabled={starting || Boolean(setLink)}
              className="h-13 w-[180px] rounded-2xl bg-mint text-heading-sm font-bold text-white transition-colors hover:bg-mint-dark disabled:opacity-60"
            >
              {starting ? <PendingLabel>시작하는 중…</PendingLabel> : "시험 시작"}
            </button>
          </span>
        </>
      }
    >
      <section className="mt-7 flex flex-col rounded-3xl bg-mint-bg p-10">
        <span className="text-label-md font-bold tracking-[0.2em] text-mint-dark">방 코드</span>
        <strong className="mt-1 text-display-2xl">{prettyPin}</strong>
        <span aria-hidden className="mt-5 h-[3px] w-[430px] rounded-sm bg-mint-dark" />
        <p className="mt-5 text-body-lg text-mint-dark">
          {host ? `${host} 에 접속해 ` : ""}코드를 입력하면 바로 들어옵니다
        </p>
        <div className="mt-11 flex items-center gap-7">
          <div className="rounded-2xl bg-card p-2.5">
            <JoinQr pin={pin} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-heading-sm">QR 입장</span>
            <span className="text-body-md text-mint-dark">카메라로 비추면 바로 넘어가요</span>
          </div>
        </div>
      </section>

      {/* 구분선을 형제 항목으로 두어 ol의 gap이 양쪽에 똑같이 걸리게 한다 */}
      <ol className="mt-8 flex items-center gap-7">
        {steps.map((step, i) => (
          <Fragment key={step}>
            {i > 0 && <li aria-hidden className="h-[30px] w-px bg-line-soft" />}
            <li className="flex items-center gap-3.5">
              <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-mint text-label-lg font-bold text-white">
                {i + 1}
              </span>
              <span className="text-heading-sm">{step}</span>
            </li>
          </Fragment>
        ))}
      </ol>

      <div className="mt-8 border-t" />

      <ul className="mt-8 flex h-24 items-center rounded-[18px] bg-surface-subtle px-8">
        {meta.map((m, i) => (
          <li key={m.label} className="flex flex-1 items-center">
            {i > 0 && <span aria-hidden className="mr-10 h-11 w-px bg-border" />}
            <span className="flex flex-col gap-0.5">
              <span className={m.accent ? "text-display-sm text-mint" : "text-display-sm"}>
                {m.value}
              </span>
              <span className="text-body-md text-muted-foreground">{m.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </ProjectorShell>
  );
}
