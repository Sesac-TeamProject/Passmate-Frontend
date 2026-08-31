"use client";

import { RoleSidebar, type SidebarUser } from "@/components/layout/role-sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";

const FALLBACK: SidebarUser = { name: "회원", initial: "회", roleLabel: "회원", tone: "peach" };

/** RoleSidebar에 auth-store의 로그인 회원 프로필을 채워 넣는다. 목 프로필(features/me/mock)을 대체한다. */
export function SidebarAccount({ nav }: { nav: "member" | "host" }) {
  const profile = useAuthStore((s) => s.profile);
  const user: SidebarUser = profile?.nickname
    ? {
        name: profile.nickname,
        initial: profile.nickname.slice(0, 1),
        roleLabel: profile.level ? `Lv.${profile.level}` : "회원",
        tone: "peach",
      }
    : FALLBACK;
  return <RoleSidebar nav={nav} user={user} />;
}
