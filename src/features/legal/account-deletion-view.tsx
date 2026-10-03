import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ACCOUNT_DELETION, DATA_DELETION } from "./account-deletion";

type Props = {
  /** 폰 폭 "← 제목" 줄. 뒤로 가기 배선이 있어 컨테이너가 넘긴다 */
  mobileTopBar: ReactNode;
};

/** 계정 삭제·데이터 삭제 두 페이지가 같이 쓰는 문서 틀 — 약관(C-04)과 같은 800 폭 흰 카드 */
function DeletionShell({
  title,
  mobileTopBar,
  children,
}: Props & { title: string; children: ReactNode }) {
  return (
    <main className="w-full flex-1 px-5 pt-8 pb-16 max-md:bg-card max-md:pt-10 max-md:pb-12">
      <div className="mx-auto flex max-w-[800px] flex-col gap-5 max-md:gap-0">
        {mobileTopBar}
        <article className="flex flex-col gap-6 rounded-2xl border bg-card px-14 pt-12 pb-14 max-md:mt-5 max-md:gap-5 max-md:rounded-none max-md:border-0 max-md:p-0">
          <h1 className="text-heading-lg text-ink max-md:sr-only">{title}</h1>
          {children}
        </article>
      </div>
    </main>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-body-md leading-[1.7] break-keep text-ink-secondary"
        >
          <span
            aria-hidden
            className="mt-[0.75em] size-1.5 shrink-0 rounded-full bg-ink-disabled"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * C-06 계정 삭제 요청 (웹 · 공개). 시안의 "이메일 입력 → 확인 메일" 흐름 대신, 이미 있는 회원 탈퇴(C-02-12)로
 * 보낸다 — 로그인하면 바로 지울 수 있고 백엔드가 새로 할 일이 없다. 로그인 전이면 가드가 `/login?next=`로 돌린다.
 */
export function AccountDeletionView({ mobileTopBar }: Props) {
  const doc = ACCOUNT_DELETION;
  return (
    <DeletionShell title={doc.title} mobileTopBar={mobileTopBar}>
      <p className="text-body-md leading-[1.7] break-keep text-ink-secondary">{doc.intro}</p>
      <hr className="border-border max-md:border-line-soft" />

      <section className="flex flex-col gap-2">
        <h2 className="text-heading-sm font-bold text-ink">삭제되는 데이터</h2>
        <BulletList items={doc.deleted} />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-heading-sm font-bold text-ink">보관되는 데이터</h2>
        <BulletList items={doc.retained} />
      </section>

      <Button
        size="xl"
        className="w-full bg-foreground text-background hover:bg-foreground/90"
        nativeButton={false}
        render={<Link href={doc.withdrawPath} />}
      >
        {doc.ctaLabel}
      </Button>

      <p className="text-label-md text-ink-disabled">
        {doc.appHint} · 문의: 개인정보 보호책임자 {DATA_DELETION.officer} ·{" "}
        <a href={`mailto:${DATA_DELETION.contactEmail}`} className="underline">
          {DATA_DELETION.contactEmail}
        </a>
      </p>
    </DeletionShell>
  );
}

/**
 * C-07 데이터 삭제 요청 (웹 · 공개). 접수 API가 아직 없어 메일로 받는다 — 제목·본문 틀을 채운 mailto 링크.
 * 백엔드에 접수 API가 생기면 이 버튼만 폼으로 바꾼다.
 */
export function DataDeletionView({ mobileTopBar }: Props) {
  const doc = DATA_DELETION;
  const mailto = `mailto:${doc.contactEmail}?subject=${encodeURIComponent(doc.mailSubject)}&body=${encodeURIComponent(doc.mailBody)}`;
  return (
    <DeletionShell title={doc.title} mobileTopBar={mobileTopBar}>
      <p className="text-body-md leading-[1.7] break-keep text-ink-secondary">{doc.intro}</p>
      <hr className="border-border max-md:border-line-soft" />

      <section className="flex flex-col gap-2">
        <h2 className="text-heading-sm font-bold text-ink">삭제를 요청할 수 있는 데이터</h2>
        <BulletList items={doc.items} />
      </section>

      <p className="text-label-md leading-[1.7] break-keep text-muted-foreground">
        {doc.notice}{" "}
        <Link href={ACCOUNT_DELETION.path} className="font-bold text-mint-dark hover:underline">
          계정 삭제 요청 ›
        </Link>
      </p>

      <Button size="xl" className="w-full" nativeButton={false} render={<a href={mailto} />}>
        {doc.ctaLabel}
      </Button>

      <p className="text-label-md text-ink-disabled">
        문의: 개인정보 보호책임자 {doc.officer} ·{" "}
        <a href={`mailto:${doc.contactEmail}`} className="underline">
          {doc.contactEmail}
        </a>
      </p>
    </DeletionShell>
  );
}
