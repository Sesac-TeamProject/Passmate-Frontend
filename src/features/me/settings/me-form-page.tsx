import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** "마이페이지 › " 뒤에 붙는 화면명. 예: "계정 정보 변경" */
  title: string;
  children: ReactNode;
  /** 카드 클래스 덮어쓰기 (완료 화면은 py-12 · items-center 등) */
  cardClassName?: string;
};

/**
 * 마이페이지 서브화면 공통 뼈대 (디자인 C-02-1 ~ C-02-12) —
 * main padding [28,36] gap 20 · 제목 heading-lg "마이페이지 › …" · 흰 카드 640px r20 padding 28 gap 16
 */
export function MeFormPage({ title, children, cardClassName }: Props) {
  return (
    <main className="flex flex-col gap-5 px-9 py-7">
      <h1 className="text-heading-lg text-foreground">마이페이지 › {title}</h1>
      <section
        className={cn(
          "flex w-[640px] max-w-full flex-col gap-4 rounded-[20px] border bg-card p-7",
          cardClassName,
        )}
      >
        {children}
      </section>
    </main>
  );
}
