import Link from "next/link";

type Props = { title: string; href: string };

/** 섹션 제목 + 우측 "전체 보기 ›" 링크 */
export function SectionHeader({ title, href }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-heading-sm text-ink">{title}</h2>
      <Link href={href} className="text-label-lg text-mint-dark hover:underline">
        전체 보기 ›
      </Link>
    </div>
  );
}
