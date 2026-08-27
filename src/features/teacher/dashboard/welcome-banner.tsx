import Link from "next/link";

type Props = { name: string; createHref: string };

export function WelcomeBanner({ name, createHref }: Props) {
  return (
    <section className="flex items-center justify-between rounded-3xl bg-mint-bg px-8 py-[26px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-heading-lg text-[#0f3d2e]">안녕하세요, {name} 님!</h1>
        <p className="text-label-lg text-[#3f6b5b]">오늘도 스터디원들과 실전처럼 연습해 보세요</p>
      </div>
      <Link
        href={createHref}
        className="flex h-13 items-center rounded-2xl bg-mint px-6 text-heading-sm text-white transition-colors hover:bg-mint-dark"
      >
        +&nbsp;&nbsp;새 방 만들기
      </Link>
    </section>
  );
}
