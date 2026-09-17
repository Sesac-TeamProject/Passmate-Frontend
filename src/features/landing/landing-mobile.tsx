import { ArrowRight, DoorOpen, SquarePlus, Timer, Trophy, type LucideIcon } from "lucide-react";
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
  PlayMockup,
  PlayResultMockup,
} from "./mockups/app-mockups";
import { LIVE_ROOM } from "./mockups/mock-data";
import { PhoneFrame } from "./mockups/phone-frame";

/**
 * L-01m 폰 랜딩 (768 미만) — 스크롤을 내리면서 "아 이런 서비스구나"가 잡히게 짠 서비스 소개 페이지.
 * 스픽 이벤트 랜딩의 정보 흐름(작은 라벨 → 두 줄 제목 → 큰 화면 → 짧은 설명, 섹션마다 바탕 바꾸기)만 참고했다.
 *
 * 흐름: 첫 화면 → 문제 제기 → 사용 흐름 → 핵심 기능(옆으로 넘기기 3장) → 결과 화면 → 마지막 CTA
 * 겹치는 이야기는 한 번만 한다 — 페이지가 길면 끝까지 안 내려간다.
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
        <FlowSection />
        <FeatureSection />
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

/**
 * 큰 제목 굵기 — Pretendard ExtraBold(800). 시안(Figma)은 Noto Sans KR Bold라 Pretendard Bold(700)로는 한 단계
 * 얇아 보인다(layout.tsx `--font-pretendard-heavy` 참고). font-family 를 임의 속성으로 적어 cn 이 굵기 클래스와 섞지 않게 한다.
 */
const HEAVY = "[font-family:var(--font-pretendard-heavy)] font-extrabold";

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
        className={cn(
          "mt-4 text-display-sm whitespace-pre-line",
          HEAVY,
          dark ? "text-white" : "text-ink",
        )}
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
        <h1 className={cn("mt-4 text-display-md whitespace-pre-line text-ink", HEAVY)}>
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

      {/* 학생 폰(풀이 화면)을 크게 세우고 아랫부분은 섹션 경계에서 자른다 */}
      <div className={cn(COLUMN, "relative mt-10 h-[460px]")}>
        <span
          aria-hidden
          className="absolute top-24 left-1/2 size-[340px] -translate-x-1/2 rounded-full bg-mint-tint"
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <PhoneFrame label="학생 폰 — 문항을 푸는 화면" screenWidth={262} screenHeight={560}>
            <PlayMockup />
          </PhoneFrame>
        </div>
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
      </div>
    </section>
  );
}

/* ── 3. 사용 흐름 ──────────────────────────────────────────── */

type FlowStep = { icon: LucideIcon; title: string; text: string; extra: ReactNode };

const FLOW: FlowStep[] = [
  {
    icon: SquarePlus,
    title: "방 만들기",
    text: "문제 세트를 고르면 PIN 6자리가 바로 나와요.",
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
    extra: null,
  },
  {
    icon: Trophy,
    title: "결과 확인",
    text: "문항별 정답률과 서술형 AI 첨삭이 정리돼요.",
    extra: null,
  },
];

function FlowSection() {
  return (
    <section className="bg-ink px-4 pt-16 pb-14">
      <div className={COLUMN}>
        <SectionHead
          dark
          kicker="이렇게 써요"
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
                className={cn("flex flex-col items-start pt-1", index < FLOW.length - 1 && "pb-7")}
              >
                <span className="text-label-md font-bold text-landing-glow">STEP {index + 1}</span>
                <h3 className={cn("mt-0.5 text-heading-md text-white", HEAVY)}>{title}</h3>
                <p className="mt-1.5 text-body-md leading-[1.6] text-white/70">{text}</p>
                {extra && <div className="mt-3">{extra}</div>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 4. 핵심 기능 — 옆으로 넘기는 카드 3장 ──────────────────── */

/** 카드 한 장의 화면 판 높이 — 폰 · 에디터 조각은 아래 경계에서 잘린다 */
const SHOT_HEIGHT = "h-[380px]";

type Slide = { title: string; text: string; tone: "mint" | "gray"; shot: ReactNode };

const SLIDES: Slide[] = [
  {
    title: "AI 문제 출제",
    text: "주제와 난이도만 정하면 객관식·서술형이 채워져요.",
    tone: "mint",
    // 세 장 모두 폰 틀로 맞춘다 — 에디터 패널도 폰 화면 안에 담는다
    shot: (
      <PhoneFrame label="문제 에디터 — AI로 문제 만들기" screenWidth={240} screenHeight={460}>
        <GenerateMockup />
      </PhoneFrame>
    ),
  },
  {
    title: "문항마다 바로 순위",
    text: "문항이 끝날 때마다 정답률과 랭킹이 바로 떠요.",
    tone: "gray",
    shot: (
      <PhoneFrame label="학생 폰 — 문항 결과와 현재 순위" screenWidth={240} screenHeight={460}>
        <PlayResultMockup />
      </PhoneFrame>
    ),
  },
  {
    title: "서술형 AI 피드백",
    text: "모범답안과 견줘 잘한 점·놓친 점을 짚어 줘요.",
    tone: "mint",
    shot: (
      <PhoneFrame
        label="학생 폰 — 서술형 답안의 AI 분석"
        screenWidth={240}
        screenHeight={460}
        scrollY={85}
      >
        <AnswerFeedbackMockup />
      </PhoneFrame>
    ),
  },
];

function FeatureSection() {
  return (
    <section className="pt-16 pb-14">
      <div className={cn(COLUMN, "px-4")}>
        <SectionHead
          kicker="핵심 기능"
          title={
            <>
              {"만들고, 풀고,\n"}
              <Em>바로 확인</Em>해요
            </>
          }
        />
      </div>
      {/*
        옆으로 넘기는 카드 — 다음 카드가 살짝 보여 넘길 수 있다는 걸 알린다.
        카드는 모두 왼쪽 16px에 멈춘다. 끝에 빈 칸이 없으면 마지막 카드가 왼쪽까지 못 와 01·02와 줄이 어긋난다 —
        오른쪽 여백은 padding 대신 빈 칸으로 둔다(사파리는 가로 스크롤 끝 padding을 무시한다).
      */}
      <ul className="mt-9 flex snap-x snap-mandatory scroll-pl-4 [scrollbar-width:none] gap-3 overflow-x-auto pb-2 pl-4 [&::-webkit-scrollbar]:hidden">
        {SLIDES.map((slide, index) => (
          <li key={slide.title} className="w-[292px] shrink-0 snap-start">
            {/*
              items-start: 기본 stretch면 폰 틀이 판 높이로 눌려 틀만 짧아지고 안쪽 화면이 아래로 삐져나온다.
              clip-path: 사파리는 줄인 안쪽을 overflow-hidden + 둥근 모서리로 자르지 못한다 — 모서리째 잘라 준다
            */}
            <div
              className={cn(
                "flex items-start justify-center overflow-hidden rounded-[28px] px-3 pt-7 [clip-path:inset(0_round_28px)]",
                SHOT_HEIGHT,
                slide.tone === "mint" ? "bg-mint-bg" : "bg-background",
              )}
            >
              {slide.shot}
            </div>
            <p className="mt-4 px-1 text-label-lg font-bold text-mint">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className={cn("mt-0.5 px-1 text-heading-md text-ink", HEAVY)}>{slide.title}</h3>
            <p className="mt-1 px-1 text-body-md leading-[1.6] text-muted-foreground">
              {slide.text}
            </p>
          </li>
        ))}
        {/* 화면 폭 − 왼쪽 16 − 카드 292 − 간격 12 */}
        <li aria-hidden className="w-[calc(100vw-320px)] shrink-0" />
      </ul>
    </section>
  );
}

/* ── 5. 결과 화면 ──────────────────────────────────────────── */

function ResultSection() {
  return (
    <section className="overflow-hidden bg-mint-bg px-4 pt-16">
      <div className={COLUMN}>
        <SectionHead
          kicker="다 풀고 나면"
          title={
            <>
              {"순위랑 내 결과가\n"}
              <Em>바로</Em> 나와요
            </>
          }
          lead={"틀린 문항만 다시 풀고,\n리포트로 저장 · 공유해요."}
        />
        {/*
          폰은 섹션 아래 경계에서 자른다 — 시상대 · 내 결과 카드 바로 아래(330)에서 끊어 카드 중간이 잘리지 않게 한다.
          화면을 틀보다 길게 둬야 아래 고정 버튼이 잘린 자리에 삐져나오지 않고, items-start 여야 틀이 눌리지 않는다.
          결과 화면 안의 패시(눈 감은 PASS)는 가린다 — 시상대 캐릭터와 겹쳐 어수선하다.
        */}
        <div className="relative mt-9 flex h-[330px] items-start justify-center [&_img[src*='passy']]:invisible">
          <PhoneFrame label="학생 폰 — 최종 순위와 내 결과" screenWidth={262} screenHeight={560}>
            <FinalResultMockup />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

/* ── 6. 마지막 CTA ─────────────────────────────────────────── */

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
        <h2 className={cn("text-display-sm whitespace-pre-line text-white", HEAVY)}>
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
