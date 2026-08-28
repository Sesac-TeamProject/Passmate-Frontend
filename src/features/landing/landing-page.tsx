import { Check, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { StudentAvatar } from "@/components/common/student-avatar";
import { cn } from "@/lib/utils";
import {
  FAQS,
  FEATURES,
  FOOTER_LINKS,
  NAV_LINKS,
  PROOF_AVATARS,
  REVIEWS,
  STATS,
  STEPS,
  type Feature,
} from "./content";
import { FaqList } from "./faq-list";

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

/** L-01 랜딩 (시안 NOxTe, 스픽 스타일 · 실제 화면 중심). 정적 소개 페이지 — 상태 없음, FAQ 아코디언만 클라이언트 */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-card text-foreground">
      <LandingNav />
      <main className="flex flex-col">
        <Hero />
        <Stats />
        <HowItWorks />
        {FEATURES.map((feature, index) => (
          <FeatureSection key={feature.id} feature={feature} tinted={index % 2 === 0} />
        ))}
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
        <Image
          src="/landing/hero-stage.png"
          alt="학생 폰의 풀이 화면 — PIN, 남은 시간, 정답률, AI 첨삭이 함께 떠 있다"
          width={600}
          height={700}
          priority
          className="h-auto w-[600px] min-w-0 flex-1"
        />
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

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-card py-28">
      <div className={cn(INNER, "flex flex-col gap-12")}>
        <h2 className="text-display-lg whitespace-pre-line text-ink">
          {"방 열고, 문제 받고, 같이 풀기.\n딱 세 단계예요."}
        </h2>
        <ol className="grid grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <li key={step.no} className="flex flex-col gap-3">
              <span aria-hidden className="h-[3px] w-full bg-mint" />
              <span className="text-display-md text-mint">{step.no}</span>
              <h3 className="text-heading-md text-ink">{step.title}</h3>
              <p className="text-body-lg text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FeatureSection({ feature, tinted }: { feature: Feature; tinted: boolean }) {
  return (
    <section
      id={feature.id}
      className={cn("scroll-mt-20 py-24", tinted ? "bg-background" : "bg-card")}
    >
      <div className={cn(INNER, "flex items-center gap-16", feature.reverse && "flex-row-reverse")}>
        <div className="flex w-[440px] shrink-0 flex-col gap-[18px]">
          <span className="text-label-lg text-mint-dark">{feature.eyebrow}</span>
          <h2 className="text-display-lg whitespace-pre-line text-ink">{feature.title}</h2>
          <p className="text-body-lg text-muted-foreground">{feature.body}</p>
          <ul className="flex flex-col gap-2.5">
            {feature.bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5">
                <Check aria-hidden className="size-5 shrink-0 text-mint" strokeWidth={2} />
                <span className="text-body-lg text-ink">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <Image
          src={`/landing/${feature.shot}.png`}
          alt={feature.shotAlt}
          width={691}
          height={432}
          className="h-auto w-[691px] min-w-0 flex-1 rounded-[20px] shadow-[0_16px_35px] shadow-ink/12"
        />
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section className="bg-card py-28">
      <div className={cn(INNER, "flex flex-col items-center gap-10")}>
        <h2 className="text-display-lg text-ink">먼저 써본 사람들</h2>
        <ul className="grid w-full grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <li key={review.name} className="flex flex-col gap-4 rounded-[20px] bg-background p-7">
              <div className="flex gap-0.5" aria-label="별점 5점">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className="size-[18px] fill-gold text-gold"
                    strokeWidth={2}
                  />
                ))}
              </div>
              <blockquote className="text-body-lg text-ink">{review.quote}</blockquote>
              <div className="flex items-center gap-2.5">
                <StudentAvatar avatar={review.avatar} size={36} />
                <div className="flex flex-col">
                  <span className="text-label-lg text-ink">{review.name}</span>
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
    <section id="faq" className="scroll-mt-20 bg-background py-24">
      <div className={cn(INNER, "flex flex-col gap-8")}>
        <h2 className="text-display-lg text-ink">자주 묻는 질문</h2>
        <FaqList items={FAQS} />
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
