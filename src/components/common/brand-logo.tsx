import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  /** sm: 32px r10 mint-tint 마크(헤더·사이드바) · lg: 40px 원형 mint 마크(로그인·게스트 입장 카드) */
  size?: "sm" | "lg";
  className?: string;
};

/** "P" 민트 마크 + 패스메이트 워드마크. */
export function BrandLogo({ href = "/", size = "sm", className }: Props) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center",
          size === "sm"
            ? "size-8 rounded-[10px] bg-mint-tint text-heading-sm text-mint-dark"
            : "size-10 rounded-full bg-mint text-heading-md text-white",
        )}
      >
        P
      </span>
      <span className="text-heading-md text-ink">패스메이트</span>
    </Link>
  );
}
