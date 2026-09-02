// L-01 랜딩 문구 (design.pen "L-01 랜딩 (웹)" · v6). 마케팅 카피라 목이 아니라 화면의 일부 — 바꿀 때는 디자이너와 맞춘다.
import type { AvatarKey } from "@/components/common/student-avatar";

export const NAV_LINKS = [
  { href: "#how", label: "어떻게 쓰나요" },
  { href: "#teacher", label: "선생님" },
  { href: "#student", label: "학생" },
  { href: "#faq", label: "FAQ" },
] as const;

/** 히어로 하단 "먼저 쓰고 있어요" 아바타 4개(시안 순서: 호랑이·여우·토끼·강아지) */
export const PROOF_AVATARS: readonly AvatarKey[] = ["tiger", "fox", "rabbit", "dog"];

export const STATS = [
  { value: "5분", label: "문제 세트 고르고 첫 방 열기까지" },
  { value: "0원", label: "무료 방은 코인 없이" },
  { value: "6자리", label: "회원가입 대신 PIN" },
  { value: "12종", label: "학생이 고르는 캐릭터" },
] as const;

/** HOW 섹션 머리말 (시안 초록 섹션 상단, 가운데 정렬) */
export const HOW = {
  kicker: "HOW IT WORKS",
  title: "방 열고, 문제 받고, 같이 풀기.",
  subtitle: "딱 세 단계예요. 준비물은 문제 세트 하나와 PIN 6자리뿐.",
} as const;

export type StepVisualKey = "pin" | "generate" | "live";

export const STEPS = [
  {
    no: "01",
    title: "방 열기",
    body: "문제 세트를 고르면 PIN 6자리가 바로 나와요.\n프로젝터에 띄우면 준비 끝.",
    visual: "pin",
  },
  {
    no: "02",
    title: "문제 받기",
    body: "주제와 난이도만 정하면 객관식·서술형이\n자동으로 채워져요.",
    visual: "generate",
  },
  {
    no: "03",
    title: "같이 풀기",
    body: "타이머가 돌고 랭킹이 바뀌는 화면을\n교실 전체가 함께 봐요.",
    visual: "live",
  },
] as const satisfies readonly { no: string; title: string; body: string; visual: StepVisualKey }[];

export type MockupKey = "editor" | "live" | "report";

export type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  /** 오른쪽/왼쪽에 넣을 실제 화면 (W-03 에디터 · W-05 진행 · W-07 리포트) */
  mockup: MockupKey;
  /** 목업 접근성 설명 */
  mockupLabel: string;
  /** 화면을 감싸는 카드의 그라데이션 (시안 shot 3장이 서로 다른 초록을 쓴다) */
  gradient: string;
  /** 목업을 왼쪽에 두는 행 */
  reverse?: boolean;
};

export const FEATURES: readonly Feature[] = [
  {
    id: "teacher",
    eyebrow: "AI 출제",
    title: "문제 세트만 고르면\n문제는 AI가 만들어요",
    body: "주제와 난이도만 정하면 객관식·서술형이 채워져요.\n마음에 안 드는 문항은 바로 고치거나 다시 뽑고요.",
    mockup: "editor",
    mockupLabel: "문제 에디터 — AI로 문제 만들기 화면",
    gradient: "from-mint to-mint-deep",
  },
  {
    id: "student",
    eyebrow: "실전 모드",
    title: "시험장처럼,\n그런데 다 같이",
    body: "프로젝터에는 문제와 타이머, 학생 폰에는 답안지.\n문항이 끝날 때마다 정답률과 랭킹이 바로 떠요.",
    mockup: "live",
    mockupLabel: "진행 화면 — 문항과 타이머가 뜬 프로젝터 화면",
    gradient: "from-mint-dark to-landing-shot-dark",
    reverse: true,
  },
  {
    id: "report",
    eyebrow: "첨삭 리포트",
    title: "끝나면 바로,\n어디가 약한지",
    body: "문항별 정답률과 서술형 AI 첨삭이 정리돼요.\n선생님은 코멘트만 얹으면 됩니다.",
    mockup: "report",
    mockupLabel: "방 리포트 — 문항별 정답률과 서술형 AI 분석 화면",
    gradient: "from-landing-shot-light to-mint-dark",
  },
];

export const REVIEWS = [
  {
    quote: '"매주 모의고사 문제 뽑는 데 쓰던 두 시간이 십 분이 됐어요."',
    name: "김민지",
    role: "국비 부트캠프 강사",
    avatar: "fox" as AvatarKey,
  },
  {
    quote: '"PIN만 치면 들어가서 부담이 없어요. 첨삭이 어디서 깎였는지 짚어줘요."',
    name: "이준영",
    role: "취준생 · 백엔드",
    avatar: "tiger" as AvatarKey,
  },
  {
    quote: '"프로젝터에 띄워놓고 다 같이 푸니까 스터디가 늘어지지 않아요."',
    name: "박서연",
    role: "스터디장 · CS 면접",
    avatar: "rabbit" as AvatarKey,
  },
] as const;

/**
 * 첫 문답은 v6 시안에 답까지 적혀 있어 그대로 옮겼다.
 * 나머지 넷은 시안에 질문만 있어 서비스 사실(코인·AI 수정·정산)로 채운 우리 문구다
 * — TODO(copy): 디자이너·기획 확정 문구로 교체.
 * TODO(계약): 시안 답변의 "그동안 푼 방과 점수가 그대로 계정에 들어옵니다"는
 * 게스트 기록을 회원으로 옮기는 동작인데 계약에 없다 — DESIGN_GAPS로 물을 것.
 */
export const FAQS = [
  {
    q: "학생도 회원가입을 해야 하나요?",
    a: "PIN 6자리와 닉네임만 있으면 바로 들어와요. 기록을 남기고 싶어질 때 나중에 가입하면 그동안 푼 방과 점수가 그대로 계정에 들어옵니다.",
  },
  {
    q: "무료 방과 유료 방은 뭐가 다른가요?",
    a: "무료 방은 코인 없이 누구나 열고 들어와요. 유료 방은 참가비(코인)를 받는 방으로, 세션 시작 전까지는 100% 환급되고 정산은 선생님 계좌로 들어가요.",
  },
  {
    q: "AI가 만든 문제를 고칠 수 있나요?",
    a: "네. 생성된 문항은 에디터에서 바로 고치거나 다시 뽑을 수 있고, 직접 출제한 문항을 섞어도 돼요. 세트로 저장하면 다음 방에서 재활용할 수 있어요.",
  },
  {
    q: "정산은 어떻게 받나요?",
    a: "마이페이지에 정산 계좌를 등록하면 유료 방 참가비가 모여 정해진 주기에 지급돼요. 내역은 마이페이지 › 정산에서 확인해요.",
  },
  {
    q: "어떤 시험 · 과목에 쓸 수 있나요?",
    a: "주제와 난이도를 글로 적어 문제를 만들기 때문에 기술 면접·자격증·전공 시험 등 객관식·서술형으로 풀 수 있는 과목이면 모두 쓸 수 있어요.",
  },
] as const;

export const FOOTER_LINKS = ["이용 약관", "개인정보 처리방침", "문의", "GitHub"] as const;
