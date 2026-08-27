import Link from "next/link";
import { HeroBanner } from "@/components/common/hero-banner";

type Props = { name: string; createHref: string };

export function WelcomeBanner({ name, createHref }: Props) {
  return (
    <HeroBanner
      title={`안녕하세요, ${name} 님!`}
      description="오늘도 스터디원들과 실전처럼 연습해 보세요"
      action={
        <Link
          href={createHref}
          className="flex h-13 items-center rounded-2xl bg-mint px-6 text-heading-sm text-white transition-colors hover:bg-mint-dark"
        >
          +&nbsp;&nbsp;새 방 만들기
        </Link>
      }
    />
  );
}
