import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-12 max-w-6xl items-center px-4">
        <Link href="/" className="font-bold">
          PassMate
        </Link>
      </div>
    </header>
  );
}
