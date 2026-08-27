import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** 관리자 화면의 기본 카드. 흰 배경 + 연회색 테두리 + radius 14. */
export function AdminCard({ children, className }: Props) {
  return (
    <section
      className={cn(
        "flex flex-col items-start gap-[11px] rounded-[14px] border border-border bg-card px-5 py-[15px]",
        className,
      )}
    >
      {children}
    </section>
  );
}
