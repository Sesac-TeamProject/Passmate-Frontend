import {
  ArrowRight,
  Check,
  DoorOpen,
  FileText,
  MessageSquareText,
  Sparkles,
  SquarePlus,
  Timer,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/common/brand-logo";
import { Mascot } from "@/components/common/mascot";
import { StudentAvatar } from "@/components/common/student-avatar";
import { cn } from "@/lib/utils";
import { CTA, FOOTER_LINKS, STEPS } from "./content";
import {
  AnswerFeedbackMockup,
  FinalResultMockup,
  GenerateMockup,
  JoinMockup,
  MaterialAttachMockup,
  PlayMockup,
  PlayResultMockup,
  QuestionListMockup,
} from "./mockups/app-mockups";
import { LIVE_ROOM, REPORT_ESSAY_ANSWERS_MOCK, STEP_GENERATED } from "./mockups/mock-data";
import { PhoneFrame } from "./mockups/phone-frame";
import { PinChip } from "./mockups/phone-mockup";
import { STEP_VISUALS } from "./mockups/step-visuals";

/**
 * L-01m 폰 랜딩 (768 미만) — 스크롤을 내리면서 "아 이런 서비스구나"가 잡히게 짠 서비스 소개 페이지.
 * 스픽 이벤트 랜딩의 정보 흐름(작은 라벨 → 두 줄 제목 → 큰 화면 → 짧은 설명, 섹션마다 바탕 바꾸기)만 참고했다.
 *
 * 흐름: 첫 화면 → 문제 제기 → 소개 → 핵심 기능 6 → 사용 흐름 → AI가 하는 일 → 결과 화면 → 마지막 CTA
 *
 * 화면은 전부 실제 컴포넌트를 목 데이터로 렌더한 것이다(mockups/app-mockups.tsx) — 그림을 따로 그리지 않는다.
 * 문구는 웹 랜딩·실제 화면에 이미 있는 문장을 옮겨 쓴다. 새 기능을 약속하는 문장은 넣지 않는다.
 * 섹션 앵커(id)는 웹 랜딩이 갖는다 — 둘 다 렌더되므로 여기서는 달지 않는다.
 */
export function LandingMobile() {
  return (
    <div className="flex min-h-dvh flex-col bg-card break-keep text-foreground md:hidden">
      <MobileHeader />
      <main className="flex flex-col">
        <HeroSection />
        <ProblemSection />
        <IntroSection />
        <FeatureSection />
        <FlowSection />
        <AiSection />
        <ResultSection />
        <CtaSection />
      </main>
      <MobileFooter />
    </div>
  );
}

/* ── 공통 조각 ─────────────────────────────────────────────── */

/** 본문 폭 — 폰 가로 · 폴더블에서도 한 줄 배치가 늘어지지 않게 480에서 멈춘다 */
const COLUMN = "mx-auto w-full max-w-[480px]";

const PILL = {
  mint: "inline-flex h-14 items-center justify-center rounded-full bg-mint px-6 text-heading-sm font-bold text-white transition-colors hover:bg-mint-dark",
  outline:
    "inline-flex h-14 items-center justify-center rounded-full border bg-card px-6 text-heading-sm font-bold text-ink transition-colors hover:bg-muted",
  white:
    "inline-flex h-14 items-center justify-center rounded-full bg-card px-6 text-heading-sm font-bold text-mint-dark",
  ghost:
    "inline-flex h-14 items-center justify-center rounded-full border border-white/40 px-6 text-heading-sm font-bold text-white",
} as const;

/** 제목 속 강조 단어 */
function Em({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return <span className={dark ? "text-landing-glow" : "text-mint"}>{children}</span>;
}

/** 섹션 머리 — 작은 라벨 · 두 줄 제목 · (있으면) 한두 줄 설명 */
function SectionHead({
  kicker,
  title,
  lead,
  dark,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <span
        className={cn(
          "rounded-full px-3.5 py-1.5 text-label-md font-bold",
          dark ? "bg-white/10 text-landing-glow" : "bg-mint-bg text-mint-dark",
        )}
      >
        {kicker}
      </span>
      <h2
        className={cn("mt-4 text-display-sm whitespace-pre-line", dark ? "text-white" : "text-ink")}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "mt-3 text-body-lg leading-[1.6] whitespace-pre-line",
            dark ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/* ── 상단 바 ───────────────────────────────────────────────── */

function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 px-3 pt-3">
      <div
        className={cn(
          COLUMN,
          "flex h-[60px] items-center justify-between rounded-full bg-card pr-2 pl-4 shadow-[0_6px_24px] shadow-ink/10",
        )}
      >
        <span className="flex items-center gap-2">
          <BrandMark size={30} />
          <span className="text-heading-md text-ink">패스메이트</span>
        </span>
        <Link
          href="/login"
          className="inline-flex h-11 items-center gap-1 rounded-full bg-mint pr-3.5 pl-4 text-label-lg font-bold text-white transition-colors hover:bg-mint-dark"
        >
          방 만들기
          <ArrowRight aria-hidden className="size-4" strokeWidth={2.5} />
        </Link>
      </div>
    </header>
  );
}

/* ── 1. 첫 화면 ────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="overflow-hidden bg-linear-to-b from-card to-mint-bg pt-10">
      <div className={cn(COLUMN, "flex flex-col items-center px-5 text-center")}>
        <span className="rounded-full bg-mint-bg px-3.5 py-1.5 text-label-md font-bold text-mint-dark">
          자격증 · 면접 · 전공 시험
        </span>
        <h1 className="mt-4 text-display-md whitespace-pre-line text-ink">
          {"혼자 시작한 공부,\n"}
          <Em>함께하는 합격</Em>까지.
        </h1>
        <p className="mt-4 text-body-lg leading-[1.6] whitespace-pre-line text-muted-foreground">
          {"AI로 자격증·면접 문제를 만들고\nPIN 하나로 친구들과 같이 풀어요."}
        </p>
        <div className="mt-7 grid w-full grid-cols-2 gap-2.5">
          <Link href="/login" className={PILL.mint}>
            방 만들기
          </Link>
          <Link href="/join" className={PILL.outline}>
            방 참여하기
          </Link>
        </div>
      </div>

      {/* 학생 폰(풀이 화면)을 크게 세우고 아랫부분은 섹션 경계에서 자른다. 패시가 옆에서 폰을 들고 있다 */}
      <div className={cn(COLUMN, "relative mt-10 h-[500px]")}>
        <span
          aria-hidden
          className="absolute top-24 left-1/2 size-[340px] -translate-x-1/2 rounded-full bg-mint-tint"
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <PhoneFrame label="학생 폰 — 문항을 푸는 화면" screenWidth={262} screenHeight={560}>
            <PlayMockup />
          </PhoneFrame>
        </div>
        <div aria-hidden className="break-normal select-none">
          <PinChip className="top-[330px] right-1" />
        </div>
        <Mascot variant="phone" className="absolute bottom-6 left-2 h-auto w-[104px]" />
      </div>
    </section>
  );
}

/* ── 2. 문제 제기 ──────────────────────────────────────────── */

/** 혼자 공부할 때 — 먼저 써 본 사람들 후기에서 나온 불편을 말풍선으로 */
const PAINS = [
  { text: "모의고사 문제 뽑는 데만 두 시간이 걸려요", avatar: "fox" },
  { text: "혼자 풀면 어디서 깎였는지 모르겠어요", avatar: "tiger" },
  { text: "스터디는 자꾸 늘어지고요", avatar: "rabbit" },
] as const;

function ProblemSection() {
  return (
    <section className="bg-background px-4 pt-16 pb-14">
      <div className={COLUMN}>
        <SectionHead
          kicker="혼자 공부할 때"
          title={
            <>
              {"문제 뽑는 데만\n"}
              <Em>두 시간</Em>씩 걸리죠
            </>
          }
        />
        <ul className="mt-9 flex flex-col gap-3.5">
          {PAINS.map((pain, index) => {
            const right = index % 2 === 1;
            return (
              <li
                key={pain.text}
                className={cn("flex items-end gap-2.5", right && "flex-row-reverse")}
              >
                <StudentAvatar avatar={pain.avatar} size={40} className="shrink-0" />
                <p
                  className={cn(
                    "max-w-[260px] rounded-3xl bg-card px-5 py-3.5 text-body-lg font-medium text-ink shadow-[0_6px_16px] shadow-ink/6",
                    right ? "rounded-br-md" : "rounded-bl-md",
                  )}
                >
                  {pain.text}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex items-center justify-center gap-2">
          <Mascot variant="sleep" className="h-auto w-[60px]" />
          <p className="text-body-md font-medium text-muted-foreground">같이 풀면 달라져요</p>
        </div>
      </div>
    </section>
  );
}

/* ── 3. 패스메이트 소개 ────────────────────────────────────── */

function RoleCard({ role, text, children }: { role: string; text: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/15 bg-white/10 p-3">
      <div className="flex items-center gap-2.5 px-2 pt-2 pb-3.5">
        <span className="shrink-0 rounded-full bg-card px-3 py-1 text-label-md font-bold text-mint-dark">
          {role}
        </span>
        <p className="text-body-md font-medium text-white">{text}</p>
      </div>
      {children}
    </div>
  );
}

function IntroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-landing-green to-landing-green-deep px-4 pt-16 pb-14">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--landing-glow)_0%,transparent_70%)] opacity-20"
      />
      <div className={cn(COLUMN, "relative")}>
        <SectionHead
          dark
          kicker="패스메이트는"
          title={
            <>
              {"같이 풀면\n공부가 "}
              <Em dark>더 쉬워져요</Em>
            </>
          }
          lead={"선생님은 문제를 만들고,\n참여자는 PIN으로 바로 들어와요."}
        />
        <div className="mt-9 flex flex-col items-center">
          <RoleCard role="선생님" text="문제 세트를 고르면 PIN이 나와요">
            {STEP_VISUALS.pin}
          </RoleCard>
          {/* 두 역할을 잇는 PIN — 선생님이 알려 주고 참여자가 친다 */}
          <div aria-hidden className="flex flex-col items-center">
            <span className="h-5 border-l-2 border-dashed border-white/40" />
            <span className="rounded-full bg-landing-glow px-4 py-2 text-heading-sm font-bold text-landing-green-deep">
              PIN {LIVE_ROOM.pin.slice(0, 3)} {LIVE_ROOM.pin.slice(3)}
            </span>
            <span className="h-5 border-l-2 border-dashed border-white/40" />
          </div>
          <RoleCard role="참여자" text="PIN과 닉네임만 치면 들어와요">
            {STEP_VISUALS.live}
          </RoleCard>
        </div>
      </div>
    </section>
  );
}

/* ── 4. 핵심 기능 ──────────────────────────────────────────── */

type FeatureShot = {
  title: string;
  text: string;
  /** 화면 판 바탕 — 기능마다 번갈아 바꿔 한 덩어리로 보이지 않게 한다 */
  tone: "mint" | "gray";
  shot: ReactNode;
};

/** 폰 화면 하나를 판 위에 세우고 아랫부분은 판 경계에서 자른다 */
function PhoneShot({
  label,
  children,
  scrollY,
}: {
  label: string;
  children: ReactNode;
  scrollY?: number;
}) {
  return (
    <div className="h-[380px]">
      <PhoneFrame label={label} screenWidth={250} screenHeight={470} scrollY={scrollY}>
        {children}
      </PhoneFrame>
    </div>
  );
}

/** 웹 화면 조각(에디터 패널 · 문항 목록)을 흰 카드째 줄여 세운다 */
function WebShot({
  label,
  width,
  zoom,
  height,
  children,
}: {
  label: string;
  width: number;
  zoom: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <figure
      role="img"
      aria-label={label}
      className="overflow-hidden rounded-t-3xl text-left break-normal shadow-[0_12px_28px] shadow-ink/10"
      style={{ height }}
    >
      <div inert className="pointer-events-none select-none" style={{ zoom, width }}>
        {children}
      </div>
    </figure>
  );
}

const FEATURES: FeatureShot[] = [
  {
    title: "AI 문제 출제",
    text: "주제와 난이도만 정하면\n객관식·서술형이 채워져요.",
    tone: "mint",
    shot: (
      <WebShot label="문제 에디터 — AI로 문제 만들기" width={340} zoom={0.9} height={330}>
        <GenerateMockup />
      </WebShot>
    ),
  },
  {
    title: "PIN · QR로 빠른 입장",
    text: "회원가입 없이 PIN 6자리나 QR로\n들어와요.",
    tone: "gray",
    shot: (
      <PhoneShot label="학생 폰 — PIN · 닉네임 · 캐릭터를 고르는 입장 화면">
        <JoinMockup />
      </PhoneShot>
    ),
  },
  {
    title: "실시간 동시 풀이",
    text: "타이머가 돌고,\n다 같이 같은 문제를 풀어요.",
    tone: "mint",
    shot: (
      <PhoneShot label="학생 폰 — 타이머가 도는 문항 풀이 화면">
        <PlayMockup />
      </PhoneShot>
    ),
  },
  {
    title: "순위 확인",
    text: "문항이 끝날 때마다\n정답률과 랭킹이 바로 떠요.",
    tone: "gray",
    shot: (
      <PhoneShot label="학생 폰 — 문항 결과와 현재 순위">
        <PlayResultMockup />
      </PhoneShot>
    ),
  },
  {
    title: "AI 오답 · 서술형 피드백",
    text: "모범답안과 견줘 잘한 점·놓친 점·\n다시 볼 것을 알려 줘요.",
    tone: "mint",
    shot: (
      <PhoneShot label="학생 폰 — 서술형 답안의 AI 분석" scrollY={330}>
        <AnswerFeedbackMockup />
      </PhoneShot>
    ),
  },
  {
    title: "선생님 문제 수정 · 재출제",
    text: "마음에 안 드는 문항은\n바로 고치거나 다시 뽑아요.",
    tone: "gray",
    shot: (
      <WebShot
        label="문제 에디터 — 문항마다 수정 · 재생성 · 삭제"
        width={520}
        zoom={0.62}
        height={240}
      >
        <div className="bg-background p-4">
          <QuestionListMockup />
        </div>
      </WebShot>
    ),
  },
];

function FeatureSection() {
  return (
    <section className="px-4 pt-16 pb-6">
      <div className={COLUMN}>
        <SectionHead
          kicker="핵심 기능"
          title={
            <>
              {"만들고, 들어오고,\n"}
              <Em>같이 푸는</Em> 화면
            </>
          }
        />
        <ol className="mt-10 flex flex-col gap-12">
          {FEATURES.map((feature, index) => (
            <li key={feature.title} className="flex flex-col items-center text-center">
              <span className="text-label-lg font-bold text-mint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 text-heading-lg text-ink">{feature.title}</h3>
              <p className="mt-2 text-body-md leading-[1.6] whitespace-pre-line text-muted-foreground">
                {feature.text}
              </p>
              <div
                className={cn(
                  "mt-5 flex w-full justify-center overflow-hidden rounded-[32px] px-5 pt-8",
                  feature.tone === "mint" ? "bg-mint-bg" : "bg-background",
                )}
              >
                {feature.shot}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 5. 사용 흐름 ──────────────────────────────────────────── */

type FlowStep = { icon: LucideIcon; title: string; text: string; extra: ReactNode };

const FLOW: FlowStep[] = [
  {
    icon: SquarePlus,
    title: "방 만들기",
    text: STEPS[0].body.replace("\n", " "),
    extra: (
      <span className="rounded-full bg-white/10 px-3 py-1.5 text-label-lg font-bold text-landing-glow">
        PIN {LIVE_ROOM.pin.slice(0, 3)} {LIVE_ROOM.pin.slice(3)}
      </span>
    ),
  },
  {
    icon: DoorOpen,
    title: "친구들이 입장",
    text: "PIN 6자리와 닉네임만 있으면 바로 들어와요.",
    extra: (
      <span className="flex">
        {LIVE_ROOM.students.map((student, index) => (
          <StudentAvatar
            key={student.id}
            avatar={student.avatar}
            size={32}
            className={cn("ring-2 ring-ink", index > 0 && "-ml-2")}
          />
        ))}
      </span>
    ),
  },
  {
    icon: Timer,
    title: "함께 문제 풀기",
    text: STEPS[2].body.replace("\n", " "),
    extra: (
      <span className="rounded-full bg-white/10 px-3 py-1.5 text-label-lg font-bold text-white">
        00:23 남음
      </span>
    ),
  },
  {
    icon: Trophy,
    title: "결과 확인",
    text: "문항별 정답률과 서술형 AI 첨삭이 정리돼요.",
    extra: (
      <span className="flex items-center gap-2 rounded-full bg-white/10 py-1 pr-3.5 pl-1">
        <StudentAvatar avatar={LIVE_ROOM.students[0].avatar} size={26} />
        <span className="text-label-lg font-bold text-white">1위 준영 · 1,240점</span>
      </span>
    ),
  },
];

function FlowSection() {
  return (
    <section className="bg-ink px-4 pt-16 pb-14">
      <div className={COLUMN}>
        <SectionHead
          dark
          kicker="사용 흐름"
          title={
            <>
              {"방 만들기부터\n"}
              <Em dark>결과 확인</Em>까지
            </>
          }
        />
        <ol className="mt-10 flex flex-col px-2">
          {FLOW.map(({ icon: Icon, title, text, extra }, index) => (
            <li key={title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint text-white">
                  <Icon aria-hidden className="size-6" strokeWidth={2} />
                </span>
                {index < FLOW.length - 1 && (
                  <span
                    aria-hidden
                    className="w-0 flex-1 border-l-2 border-dashed border-white/25"
                  />
                )}
              </div>
              <div
                className={cn("flex flex-col items-start pt-1", index < FLOW.length - 1 && "pb-9")}
              >
                <span className="text-label-md font-bold text-landing-glow">STEP {index + 1}</span>
                <h3 className="mt-0.5 text-heading-md text-white">{title}</h3>
                <p className="mt-1.5 text-body-md leading-[1.6] text-white/70">{text}</p>
                <div className="mt-3">{extra}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 6. AI가 하는 일 ───────────────────────────────────────── */

function AiCard({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mint-bg text-mint-dark">
          <Icon aria-hidden className="size-5" strokeWidth={2} />
        </span>
        <h3 className="text-heading-md text-ink">{title}</h3>
      </div>
      <p className="mt-2.5 text-body-md leading-[1.6] text-muted-foreground">{text}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** 서술형 피드백 칩 — 답안 목업의 AI 판정(핵심 포함 · 부족 · 제안) 그대로 */
const FINDING_TONE = {
  good: "bg-mint-bg text-mint-dark",
  lack: "bg-negative-bg text-negative-soft-foreground",
  tip: "bg-yellow-soft text-choice-c-foreground",
} as const;

function AiSection() {
  const essay = REPORT_ESSAY_ANSWERS_MOCK[0];

  return (
    <section className="bg-background px-4 pt-16 pb-14">
      <div className={COLUMN}>
        <SectionHead
          kicker="AI가 하는 일"
          title={
            <>
              {"AI는 "}
              <Em>이 세 군데</Em>
              {"에서\n일해요"}
            </>
          }
        />
        <div className="mt-9 flex flex-col gap-3.5">
          <AiCard
            icon={Sparkles}
            title="문제 출제"
            text="주제·난이도·유형별 문항 수를 정하면 문항을 만들어요."
          >
            <div className="flex flex-col gap-2 rounded-2xl bg-background p-3">
              {STEP_GENERATED.map((item) => (
                <div
                  key={item.prompt}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl bg-card px-2.5",
                    item.pending && "opacity-50",
                  )}
                >
                  <span className="shrink-0 rounded-full bg-mint-bg px-2 py-0.5 text-label-md font-bold text-mint-dark">
                    {item.type}
                  </span>
                  <span className="truncate text-label-lg text-ink">{item.prompt}</span>
                </div>
              ))}
            </div>
          </AiCard>

          <AiCard
            icon={FileText}
            title="강의자료 기반 문제 생성"
            text="PDF·PPT 강의자료를 올리면 그 범위 안에서 출제해요."
          >
            <div inert className="pointer-events-none break-normal select-none">
              <MaterialAttachMockup />
            </div>
          </AiCard>

          <AiCard
            icon={MessageSquareText}
            title="서술형 답변 피드백"
            text="서술형 답을 모범답안과 견줘 빠진 부분을 짚어 줘요."
          >
            <div className="flex flex-col gap-2 rounded-2xl bg-background p-3">
              <p className="line-clamp-2 text-label-lg text-ink">{essay.text}</p>
              <div className="flex flex-col items-start gap-1.5">
                {essay.findings.map((finding) => (
                  <span
                    key={finding.text}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-label-md font-bold",
                      FINDING_TONE[finding.tone],
                    )}
                  >
                    {finding.text}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2.5 text-label-md text-muted-foreground">
              AI 분석은 참고 의견이에요. 점수는 선생님 첨삭으로만 바뀌어요.
            </p>
          </AiCard>
        </div>
      </div>
    </section>
  );
}

/* ── 7. 결과 화면 ──────────────────────────────────────────── */

const RESULT_CHECKS = [
  "최종 순위와 내 점수",
  "문항별 정답 · 오답",
  "틀린 문항만 다시 풀기",
  "리포트 저장 · 공유",
];

function ResultSection() {
  return (
    <section className="overflow-hidden bg-mint-bg px-4 pt-16 pb-14">
      <div className={COLUMN}>
        <SectionHead
          kicker="다 풀고 나면"
          title={
            <>
              {"순위랑 내 결과가\n"}
              <Em>바로</Em> 나와요
            </>
          }
        />
        <div className="relative mt-9 flex justify-center">
          <PhoneFrame label="학생 폰 — 최종 순위와 내 결과" screenWidth={262} screenHeight={500}>
            <FinalResultMockup />
          </PhoneFrame>
          <Mascot variant="pass" className="absolute right-0 bottom-8 h-auto w-[92px]" />
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-2.5">
          {RESULT_CHECKS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-2xl bg-card px-3.5 py-3.5 text-label-lg font-bold text-ink"
            >
              <Check aria-hidden className="size-4 shrink-0 text-mint" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 8. 마지막 CTA ─────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="px-4 pt-24 pb-10">
      <div
        className={cn(
          COLUMN,
          "relative rounded-[32px] bg-linear-to-b from-landing-green to-landing-green-deep px-6 pt-16 pb-7 text-center",
        )}
      >
        <Mascot
          variant="default"
          className="absolute -top-16 left-1/2 h-auto w-[104px] -translate-x-1/2"
        />
        <h2 className="text-display-sm whitespace-pre-line text-white">
          {"지금 바로\n문제를 만들어보세요"}
        </h2>
        <p className="mt-3 text-body-lg leading-[1.6] whitespace-pre-line text-white/80">
          {CTA.mobileBody}
        </p>
        <div className="mt-7 flex flex-col gap-2.5">
          <Link href="/login" className={PILL.white}>
            방 만들기
          </Link>
          <Link href="/join" className={PILL.ghost}>
            방 참여하기
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 푸터 ──────────────────────────────────────────────────── */

const FOOTER_LINK = "text-label-md text-muted-foreground";

function MobileFooter() {
  return (
    <footer className="px-6 pb-10">
      <div className={cn(COLUMN, "flex flex-col items-center gap-4 border-t pt-8")}>
        <span className="flex items-center gap-2">
          <BrandMark size={24} />
          <span className="text-heading-sm font-bold text-ink">패스메이트</span>
        </span>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {FOOTER_LINKS.map(({ label, href }) =>
            href ? (
              <Link key={label} href={href} className={FOOTER_LINK}>
                {label}
              </Link>
            ) : (
              // TODO: 문의·GitHub 링크 대상 미정 (웹 푸터와 같다)
              <a key={label} href="#" className={FOOTER_LINK}>
                {label}
              </a>
            ),
          )}
        </nav>
        <p className="text-label-md text-ink-disabled">© 2026 새싹수들 · PassMate</p>
      </div>
    </footer>
  );
}
