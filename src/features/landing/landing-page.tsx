import { Star } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/common/brand-logo";
import { StudentAvatar } from "@/components/common/student-avatar";
import { cn } from "@/lib/utils";
import {
  FAQS,
  FEATURES,
  FOOTER_LINKS,
  HOW,
  NAV_LINKS,
  PROOF_AVATARS,
  REVIEWS,
  STATS,
  STEPS,
  type Feature,
  type MockupKey,
} from "./content";
import { FaqList } from "./faq-list";
import { PhoneMockup } from "./mockups/phone-mockup";
import { STEP_VISUALS } from "./mockups/step-visuals";
import { ScreenMockup, ShotCard } from "./mockups/screen-mockup";
import { EditorMockup, LiveMockup, ReportMockup } from "./mockups/screen-mockups";

/** 시안 폭 1440 안의 콘텐츠 폭 1200 (좌우 여백 120). 패딩 24를 더해 1248 이상에서 콘텐츠가 정확히 1200이 되게 한다 */
const INNER = "mx-auto w-full max-w-[1248px] px-6";

/** 랜딩 전용 버튼 — r14. 시안 nav [12,22] · 히어로/CTA [16,28] (공용 Button size=xl(h48·r12)과 규격이 달라 따로 둔다) */
const BUTTON = {
  base: "inline-flex shrink-0 items-center justify-center rounded-[14px] whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-mint",
  nav: "px-[22px] py-3 text-label-lg",
  hero: "px-7 py-4 text-heading-sm",
  mint: "bg-mint text-white hover:bg-mint-dark",
  outline: "border bg-card text-ink hover:bg-muted",
  white: "bg-card text-ink hover:bg-mint-tint",
  ink: "bg-ink text-white hover:bg-mint-ink",
} as const;

/** 기능 섹션 목업 — 실제 화면 컴포넌트를 축소해 넣는다 ("실제 화면 중심") */
const MOCKUPS: Record<MockupKey, ReactNode> = {
  editor: <EditorMockup />,
  live: <LiveMockup />,
  report: <ReportMockup />,
};

/** L-01 랜딩 (시안 MGeTr, 스픽 스타일 · 실제 화면 중심). 정적 소개 페이지 — 상태 없음, FAQ 아코디언만 클라이언트 */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-card text-foreground">
      <LandingNav />
      <main className="flex flex-col">
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <Reviews />
        <Faq />
        <Cta />
      </main>
      <LandingFooter />
    </div>
  );
}

function LandingNav() {
  return (
    <header className="sticky top-0 z-10 bg-card py-[18px]">
      <div className={cn(INNER, "flex items-center justify-between")}>
        <BrandLogo size="lg" />
        <nav className="flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-label-lg text-muted-foreground transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className={cn(BUTTON.base, BUTTON.nav, BUTTON.outline)}>
            로그인
          </Link>
          {/* TODO: 회원가입 라우트 없음 — 로그인으로 보낸다 */}
          <Link href="/login" className={cn(BUTTON.base, BUTTON.nav, BUTTON.mint)}>
            무료로 방 열기
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-card py-16">
      <div className={cn(INNER, "flex items-center gap-10")}>
        <div className="flex w-[560px] shrink-0 flex-col gap-7">
          <h1 className="text-display-2xl whitespace-pre-line text-ink">
            {"혼자 시작한 공부,\n함께하는 합격까지."}
          </h1>
          <p className="text-body-lg whitespace-pre-line text-muted-foreground">
            {
              "선생님은 PIN 하나로 방을 열고, 학생은 회원가입 없이 들어와요.\n문제는 AI가, 첨삭은 선생님과 AI가 같이. 시험장 그대로."
            }
          </p>
          <div className="flex gap-3">
            <Link href="/login" className={cn(BUTTON.base, BUTTON.hero, BUTTON.mint)}>
              무료로 방 열기
            </Link>
            <Link href="/join" className={cn(BUTTON.base, BUTTON.hero, BUTTON.outline)}>
              PIN으로 입장하기
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex">
              {PROOF_AVATARS.map((avatar, index) => (
                <StudentAvatar
                  key={avatar}
                  avatar={avatar}
                  size={32}
                  className={cn("ring-2 ring-card", index > 0 && "-ml-2.5")}
                />
              ))}
            </div>
            <p className="text-body-md text-muted-foreground">
              새싹 부트캠프 4기 스터디가 먼저 쓰고 있어요
            </p>
          </div>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="bg-ink py-10">
      <dl className={cn(INNER, "flex items-start justify-between")}>
        {STATS.map((stat) => (
          <div key={stat.value} className="flex flex-col items-center gap-1">
            <dt className="order-2 text-body-md text-ink-disabled">{stat.label}</dt>
            <dd className="order-1 text-display-lg text-mint">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** HOW·후기 섹션은 콘텐츠 폭이 1260이다 (카드 404 × 3 + 간격 24). 히어로·네비는 INNER(1200) */
const WIDE_INNER = "mx-auto w-full max-w-[1308px] px-6";

function HowItWorks() {
  return (
    <section
      id="how"
      className="relative scroll-mt-20 overflow-hidden bg-linear-to-b from-landing-green to-landing-green-deep pt-[76px] pb-[60px]"
    >
      {/* 민트 글로우 — 섹션 위로 넘겨 자른다 (시안 900×900, y −300) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-[300px] left-[270px] size-[900px] rounded-full bg-[radial-gradient(circle,var(--landing-glow)_0%,transparent_70%)] opacity-20"
      />
      <div className={cn(WIDE_INNER, "relative flex flex-col items-center")}>
        <span className="text-label-md font-bold tracking-[0.2em] text-landing-glow">
          {HOW.kicker}
        </span>
        <h2 className="mt-4 text-display-xl text-white">{HOW.title}</h2>
        <p className="mt-3 text-body-lg text-white/80">{HOW.subtitle}</p>

        <ol className="mt-[50px] flex w-full gap-6">
          {STEPS.map((step, index) => (
            <li key={step.no} className="relative flex flex-1 flex-col">
              {/* 앞 단계에서 넘어오는 화살표 — 열 사이 24 간격 한가운데, 카드 세로 가운데 */}
              {index > 0 && (
                <span
                  aria-hidden
                  className="absolute top-[198px] -left-[18px] w-3 text-center text-heading-md text-white/80"
                >
                  ›
                </span>
              )}
              <span className="text-display-2xl text-landing-glow/90">{step.no}</span>
              <div className="mt-3">{STEP_VISUALS[step.visual]}</div>
              <h3 className="mt-[30px] text-display-sm text-white">{step.title}</h3>
              <p className="mt-2.5 text-body-lg leading-[1.75] whitespace-pre-line text-white/80">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 시안 기능 섹션은 콘텐츠 폭이 1280이다 (글 560 + 간격 100 + 카드 620) */
const FEATURE_INNER = "mx-auto w-full max-w-[1328px] px-6";

/** 기능 3종 — 시안은 배경 교대 없이 흰 한 덩어리(1440×1500)에 블록 3개를 80 간격으로 둔다 */
function Features() {
  return (
    <section className="bg-card pt-[60px] pb-20">
      <div className="flex flex-col gap-20">
        {FEATURES.map((feature) => (
          <FeatureBlock key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}

function FeatureBlock({ feature }: { feature: Feature }) {
  return (
    <div id={feature.id} className="scroll-mt-20">
      <div
        className={cn(
          FEATURE_INNER,
          "flex items-center gap-[100px]",
          feature.reverse && "flex-row-reverse",
        )}
      >
        <div className="flex w-[560px] shrink-0 flex-col">
          <span className="text-label-lg font-bold tracking-[0.08em] text-mint-dark">
            {feature.eyebrow}
          </span>
          <h2 className="mt-2.5 text-display-lg whitespace-pre-line text-ink">{feature.title}</h2>
          <p className="mt-6 text-body-lg leading-[1.7] whitespace-pre-line text-muted-foreground">
            {feature.body}
          </p>
        </div>
        <ShotCard gradient={feature.gradient}>
          <ScreenMockup label={feature.mockupLabel}>{MOCKUPS[feature.mockup]}</ScreenMockup>
        </ShotCard>
      </div>
    </div>
  );
}

function Reviews() {
  return (
    <section className="bg-background pt-16 pb-[90px]">
      <div className={cn(WIDE_INNER, "flex flex-col items-center")}>
        <h2 className="text-display-lg text-ink">먼저 써본 사람들</h2>
        <ul className="mt-[38px] flex w-full gap-6">
          {REVIEWS.map((review) => (
            <li
              key={review.name}
              className="flex h-[280px] flex-1 flex-col rounded-3xl bg-card p-7 shadow-[0_8px_17px] shadow-ink/6"
            >
              <div className="flex gap-1" aria-label="별점 5점">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className="size-[18px] fill-gold text-gold"
                    strokeWidth={2}
                  />
                ))}
              </div>
              <blockquote className="mt-6 text-body-lg leading-[1.65] font-medium text-ink">
                {review.quote}
              </blockquote>
              <div className="mt-auto flex items-center gap-2.5">
                <StudentAvatar avatar={review.avatar} size={36} />
                <div className="flex flex-col">
                  <span className="text-label-lg font-bold text-ink">{review.name}</span>
                  <span className="text-label-md text-muted-foreground">{review.role}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-card pt-[60px] pb-[90px]">
      <div className={cn(INNER, "flex flex-col items-center")}>
        <span className="text-label-md font-bold tracking-[0.22em] text-mint-dark">FAQ</span>
        <h2 className="mt-2 text-display-lg text-ink">자주 묻는 질문</h2>
        <div className="mt-12 w-[960px] max-w-full">
          <FaqList items={FAQS} />
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="bg-mint py-24">
      <div className={cn(INNER, "flex flex-col items-center gap-6 text-center")}>
        <h2 className="text-display-xl text-white">오늘 수업부터 실전처럼</h2>
        <p className="text-body-lg text-mint-tint">
          문제 세트 하나면 5분 안에 첫 방이 열려요. 카드 없이, 무료로.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className={cn(BUTTON.base, BUTTON.hero, BUTTON.white)}>
            무료로 방 열기
          </Link>
          <Link href="/join" className={cn(BUTTON.base, BUTTON.hero, BUTTON.ink)}>
            PIN으로 입장하기
          </Link>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="bg-card py-10">
      <div className={cn(INNER, "flex items-center justify-between")}>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-6 items-center justify-center rounded-xl bg-mint text-label-md text-white"
          >
            P
          </span>
          <span className="text-label-md text-ink-disabled">© 2026 새싹수들 · PassMate</span>
        </div>
        <nav className="flex gap-5">
          {FOOTER_LINKS.map((label) => (
            // TODO: 약관·개인정보·문의·GitHub 링크 대상 미정
            <a key={label} href="#" className="text-label-md text-muted-foreground hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
