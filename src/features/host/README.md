# features/host

방을 **개설·운영**하는 화면(W-01~W-08: 대시보드·문제 세트·에디터·방 설정·프로젝터·리포트·정산)의 도메인 컴포넌트를 둔다. 계정에 역할은 없다 — 같은 회원이 여기서 방을 열고 `features/participant`에서 참여한다.

- 예: `src/features/host/<화면명>/<컴포넌트>.tsx`
- 화면(`src/app/host/**/page.tsx`)은 `lib/queries` 훅(조회·뮤테이션)에서 데이터를 받는 컨테이너다. DTO → 뷰 타입 변환은 각 화면 폴더의 `adapt.ts`, 뷰 타입 정의는 `types.ts`가 맡는다.
- 목 응답은 `src/lib/mocks/`에만 있다(`NEXT_PUBLIC_API_BASE_URL`이 비어 있을 때 씀). feature 폴더에는 목 데이터를 두지 않는다 — 계약이 아직 없는 호출은 `@draft` 주석으로 표시한다.
