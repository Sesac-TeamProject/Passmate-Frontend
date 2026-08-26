import { cn } from "@/lib/utils";
import { TYPE } from "./typography";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

/** 관리자 화면의 기본 카드. 흰 배경 + 연회색 테두리 + radius 14. */
export function AdminCard({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-start gap-[11px] rounded-[14px] border border-[#e5e7eb] bg-white px-5 py-[15px]",
        className,
      )}
    >
      {children}
    </section>
  );
}

type HeadProps = {
  title: string;
  /** 제목 오른쪽에 붙는 회색 보조 문구. 예: "최근 14일" */
  hint?: string;
  children?: React.ReactNode;
};

/** 카드 상단 제목 줄. 오른쪽 끝에 놓을 요소는 children으로 넘긴다. */
export function AdminCardHead({ title, hint, children }: HeadProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <h2 className={cn("text-[#1b1733]", TYPE.labelLg)}>{title}</h2>
      {hint ? <p className={cn("text-[#6e6a85]", TYPE.labelMd)}>{hint}</p> : null}
      {children ? <div className="ml-auto">{children}</div> : null}
    </div>
  );
}
