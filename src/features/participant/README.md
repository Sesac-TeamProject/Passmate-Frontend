# features/participant

방에 **참여**하는 화면(P-Web 풀이, 입장·결과·결제)의 도메인 컴포넌트를 둔다. 회원·게스트 공용이며 계정 역할과 무관하다.

- 예: `src/features/participant/<화면명>/<컴포넌트>.tsx`
- 화면(관련 page.tsx — 예: `/join`·`/play/[code]`·`/pay/[code]`)은 `lib/queries` 훅(조회·뮤테이션)에서 데이터를 받는 컨테이너다. DTO → 뷰 타입 변환은 각 화면 폴더의 `adapt.ts`, 뷰 타입 정의는 `types.ts`가 맡는다.
- 목 응답은 `src/lib/mocks/`에만 있다(`NEXT_PUBLIC_API_BASE_URL`이 비어 있을 때 씀). feature 폴더에는 목 데이터를 두지 않는다.
