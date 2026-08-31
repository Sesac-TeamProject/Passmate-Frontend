# features/me

회원 마이페이지 화면(C-02: 프로필·등급·코인·정산·계좌·알림·참여한 방·탈퇴 등)의 도메인 컴포넌트를 둔다. 계정에 역할은 없다 — 같은 회원이 여기서 자기 정보를 보고 `features/host`·`features/participant`에서 방을 열거나 참여한다.

- 예: `src/features/me/<화면명>/<컴포넌트>.tsx`
- 화면(`src/app/(member)/me/**/page.tsx`)은 `lib/queries` 훅(조회·뮤테이션)에서 데이터를 받는 컨테이너다. DTO → 뷰 타입 변환은 `adapt.ts`, 뷰 타입 정의는 `types.ts`(화면별 폴더가 있으면 그 폴더의 `types.ts`)가 맡는다.
- 목 응답은 `src/lib/mocks/`에만 있다(`NEXT_PUBLIC_API_BASE_URL`이 비어 있을 때 씀). feature 폴더에는 목 데이터를 두지 않는다 — 계약이 아직 없는 값(비밀번호 변경 등)은 `TODO(API)`로 표시한다.
