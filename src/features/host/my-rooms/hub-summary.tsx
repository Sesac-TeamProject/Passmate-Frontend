import Link from "next/link";

export type HubStat = {
  id: string;
  /** 타일 안 기호. 시안은 ▦ ★ ₩ */
  icon: string;
  value: string;
  description: string;
};

type Props = {
  stats: HubStat[];
  links: { label: string; href: string }[];
};

/** W-09 가운데 요약 — 운영 실적 3줄 + 바로가기 칩 (시안 803:8803~8818) */
export function HubSummary({ stats, links }: Props) {
  return (
    <section className="flex min-w-0 flex-1 flex-col justify-between py-3">
      <dl className="flex flex-col gap-[44px]">
        {stats.map((stat) => (
          <div key={stat.id} className="flex items-center gap-3.5">
            <span
              aria-hidden
              className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-mint-bg text-label-lg text-mint-dark"
            >
              {stat.icon}
            </span>
            {/* 값이 위·설명이 아래인데 dl은 dt가 먼저여야 해서 순서를 뒤집어 그린다 */}
            <div className="flex min-w-0 flex-col-reverse">
              <dt className="truncate text-label-md text-muted-foreground">{stat.description}</dt>
              <dd className="truncate text-heading-sm text-ink">{stat.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="flex gap-4 pt-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex h-9 w-24 items-center justify-center rounded-full border bg-card text-label-md text-ink transition-colors hover:bg-muted"
          >
            {link.label} ›
          </Link>
        ))}
      </div>
    </section>
  );
}
