// 빌드된 앱(pnpm build 선행)을 임시 포트로 띄우고 routes.ts의 모든 라우트를 검사한다.
// 사용: pnpm build && pnpm check:routes
import { spawn } from "node:child_process";
import { ROUTES, REDIRECTS } from "../src/config/routes.ts";

const PORT = process.env.PORT ?? "3100";
const BASE = `http://localhost:${PORT}`;

const server = spawn("pnpm", ["exec", "next", "start", "-p", PORT], {
  stdio: "ignore",
  detached: true,
});
const stop = () => {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {}
};
process.on("exit", stop);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${BASE} 가 30초 안에 응답하지 않음`);
}

const failures = [];

async function expectOk(url) {
  const res = await fetch(BASE + url, { redirect: "follow" });
  const ok = res.status === 200;
  console.log(`${ok ? "OK " : "FAIL"} ${res.status} ${url}`);
  if (!ok) failures.push(`${url} → ${res.status}`);
}

async function expectRedirect(from, to) {
  const res = await fetch(BASE + from, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  const ok = res.status >= 300 && res.status < 400 && location.endsWith(to);
  console.log(`${ok ? "OK " : "FAIL"} ${res.status} ${from} → ${location || "(없음)"}`);
  if (!ok) failures.push(`${from} → 기대 ${to}, 실제 ${res.status} ${location}`);
}

try {
  await waitForServer();
  await expectOk("/");
  for (const r of ROUTES) await expectOk(r.sample);
  for (const r of REDIRECTS) await expectRedirect(r.from, r.to);
} finally {
  stop();
}

if (failures.length) {
  console.error(`\n${failures.length}개 실패:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`\n모든 라우트 통과 (${ROUTES.length + REDIRECTS.length + 1}개)`);
