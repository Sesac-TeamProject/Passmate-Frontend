"use client";

import { RoleSidebar, type SidebarUser } from "@/components/layout/role-sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";

const FALLBACK: SidebarUser = { name: "회원", initial: "회", roleLabel: "회원", tone: "peach" };

/** RoleSidebar에 auth-store의 로그인 회원 프로필을 채워 넣는다. 목 프로필(features/me/mock)을 대체한다. */
export function SidebarAccount({ nav }: { nav: "member" | "host" }) {
  const profile = useAuthStore((s) => s.profile);
  // 등급(Lv.N)은 서버가 아직 계산하지 않는다 — 자리를 지어내지 않고 "회원"으로 둔다(질문 B-8·G-1).
  const user: SidebarUser = profile
    ? {
        name: profile.nickname,
        initial: profile.nickname.slice(0, 1),
        roleLabel: "회원",
        tone: "peach",
      }
    : FALLBACK;
  return <RoleSidebar nav={nav} user={user} />;
}
