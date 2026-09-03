# 운영 이미지 — Next.js standalone 서버.
#
#   docker build --platform linux/arm64 \
#     --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.passmate.kr -t passmate-web .
#
# ⚠️ NEXT_PUBLIC_* 는 **빌드 시점에 번들에 박힌다.** 런타임 환경변수로는 바꿀 수 없어서
# build-arg 로 받는다. 주소가 바뀌면 이미지를 다시 구워야 한다.
#
# 배포 대상이 t4g(arm64)라 이미지도 arm64 여야 한다. Tailwind 4 의 @tailwindcss/oxide 처럼
# 플랫폼별 네이티브 바이너리가 node_modules 에 들어오므로 amd64 에서 구워 arm64 에 올리면 죽는다.
# CI 는 arm64 러너(ubuntu-24.04-arm)에서 네이티브로 빌드한다.

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
# 락파일만 먼저 복사해 의존성 레이어를 캐시한다 — 소스만 바뀐 배포는 설치를 건너뛴다
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
# standalone 출력은 서버와 필요한 node_modules 만 담는다(이미지가 1GB → 200MB 대로 줄어든다).
# .next/static 과 public 은 standalone 에 포함되지 않아 따로 복사해야 한다 — 빠뜨리면
# 페이지는 뜨는데 CSS·JS 가 전부 404 난다
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
