# features/student

`student` 역할 화면에서만 쓰는 도메인 컴포넌트·훅·유틸을 둔다.

- 화면 하나가 커지면 `src/app/.../page.tsx`는 조립만 하고 실제 UI는 여기로 뺀다.
- 역할 무관 공용 컴포넌트는 `src/components/common`, shadcn 생성물은 `src/components/ui`.
- 예: `src/features/student/<화면명>/<컴포넌트>.tsx`
