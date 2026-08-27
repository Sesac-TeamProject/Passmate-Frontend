# features/admin

`admin` 역할 화면(A-01~A-06)에서만 쓰는 렌더 전용 컴포넌트를 둔다. 데이터·상태는 여기 두지 않는다.

- `src/app/admin/**/page.tsx`가 컨테이너다: `'use client'`, 쿼리 훅(`lib/queries`)·스토어 구독·로딩/에러 분기·다이얼로그 소유.
- `<화면>/<화면>-view.tsx`는 `*View` — props(상태 + 콜백)만 받고 훅을 부르지 않는다. 카드·표 같은 조각도 props만 받는다.
- 서버 데이터 모양은 `lib/types/dto.ts`의 DTO를 그대로 쓰고, 표기 변환(`formatNumber`, 상태 → 칩 문구)은 렌더 시 계산한다.
- 색은 `globals.css` 시맨틱 토큰만(`components/tone.ts` 참고). hex 하드코딩 금지.
- `components/` — 관리자 화면 공통 조각(AdminCard, StatChip). `layout/` — 사이드바·상단바.
- 역할 무관 공용 컴포넌트는 `src/components/common`, shadcn 생성물은 `src/components/ui`.
