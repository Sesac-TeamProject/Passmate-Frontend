import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  className?: string;
};

/** "P" 민트 마크 + 패스메이트 워드마크. 헤더·사이드바 공용. */
export function BrandLogo({ href = "/", className }: Props) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-mint-tint text-heading-sm text-mint-dark">
        P
      </span>
      <span className="text-heading-md text-ink">패스메이트</span>
    </Link>
  );
}
