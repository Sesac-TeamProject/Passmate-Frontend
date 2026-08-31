// 랜딩 목업은 실제 데이터가 아니라 시안 스냅숏이므로 정적 상수를 그대로 둔다 (API 연동 대상 아님).
import type { SidebarUser } from "@/components/layout/role-sidebar";
import type {
  EssayAnswer,
  LiveQuestion,
  LiveRoom,
  Question,
  SessionReport,
  Student,
} from "@/features/host/types";

/** 로그인한 회원 시안 스냅숏 — W-07 방 리포트 목업 사이드바 전용 */
export const ACCOUNT: SidebarUser = {
  name: "이한결",
  initial: "한",
  roleLabel: "회원",
  tone: "peach",
};

/** 대기실·진행 중인 방 (W-04~W-06) 시안 스냅숏 — 히어로 목업 전용 */
export const LIVE_ROOM: LiveRoom = {
  code: "DEMO01",
  pin: "482913",
  title: "8월 4주차 Spring 스터디",
  students: [
    { id: "s1", name: "준영", avatar: "cat" },
    { id: "s2", name: "혜림", avatar: "rabbit" },
    { id: "s3", name: "승혁", avatar: "dog" },
    { id: "s4", name: "희표", avatar: "bear" },
    { id: "s5", name: "민지", avatar: "fox" },
    { id: "s6", name: "도윤", avatar: "penguin" },
  ],
};

export const LIVE_QUESTION: LiveQuestion = {
  index: 2,
  total: 8,
  type: "multiple",
  prompt: "@Transactional의 기본 전파(propagation) 속성은 무엇인가?",
  choices: [
    { key: "A", text: "REQUIRED" },
    { key: "B", text: "REQUIRES_NEW" },
    { key: "C", text: "SUPPORTS" },
    { key: "D", text: "NESTED" },
  ],
  seconds: 30,
  remaining: 23,
  submitted: 4,
};

/** W-03 문제 에디터 목업 — 검토 중인 세트 제목 + 문항 8개 (시안 스냅숏) */
export const EDITOR_MOCK_TITLE = "Spring 기술면접 · 문제 준비";

export const EDITOR_MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "multiple",
    prompt: "@Transactional의 기본 전파 속성은?",
    points: 100,
    seconds: 30,
  },
  {
    id: "q2",
    type: "essay",
    prompt: "JPA 영속성 컨텍스트의 1차 캐시 동작을 설명하세요.",
    points: 100,
    seconds: 120,
  },
  {
    id: "q3",
    type: "ox",
    prompt: "Spring Bean의 기본 스코프는 prototype이다.",
    points: 100,
    seconds: 20,
  },
  {
    id: "q4",
    type: "multiple",
    prompt: "Spring AOP가 기본으로 사용하는 프록시 방식은?",
    points: 100,
    seconds: 30,
  },
  {
    id: "q5",
    type: "multiple",
    prompt: "@Autowired 주입 방식 중 권장되는 것은?",
    points: 100,
    seconds: 30,
  },
  {
    id: "q6",
    type: "essay",
    prompt: "N+1 문제가 발생하는 원인과 해결 방법을 설명하세요.",
    points: 100,
    seconds: 120,
  },
  {
    id: "q7",
    type: "multiple",
    prompt: "JPA에서 지연 로딩(LAZY)의 기본 대상은?",
    points: 100,
    seconds: 30,
  },
  {
    id: "q8",
    type: "essay",
    prompt: "Spring Security 필터 체인의 동작 순서를 설명하세요.",
    points: 100,
    seconds: 120,
  },
];

/** W-07 방 리포트 목업 (시안 스냅숏) */
export const SESSION_REPORT_MOCK: SessionReport = {
  id: "1",
  title: "8월 4주차 Spring 스터디",
  dateLabel: "8/22 (금) 진행",
  stats: { accuracy: 71, students: 6, questions: 8, aiAnalyses: 18 },
  questions: [
    { id: "q1", index: 1, title: "DI 컨테이너 개념", type: "multiple", accuracy: 100 },
    { id: "q2", index: 2, title: "@Transactional 전파", type: "multiple", accuracy: 67 },
    { id: "q3", index: 3, title: "JPA 영속성 컨텍스트", type: "essay", aiCount: 6 },
    { id: "q4", index: 4, title: "AOP 프록시 방식", type: "multiple", accuracy: 50 },
    { id: "q5", index: 5, title: "Bean 기본 스코프", type: "ox", accuracy: 83 },
    { id: "q6", index: 6, title: "N+1 문제", type: "essay", aiCount: 6 },
    { id: "q7", index: 7, title: "지연 로딩 기본 대상", type: "multiple", accuracy: 67 },
    { id: "q8", index: 8, title: "Security 필터 체인", type: "essay", aiCount: 6 },
  ],
};

/** SESSION_REPORT_MOCK의 기본 선택 문항(q3, 서술형) — 분석 패널 목업이 이 문항의 답변을 보여준다 */
export const REPORT_SELECTED_QUESTION_ID = "q3";

export const REPORT_ESSAY_ANSWERS_MOCK: EssayAnswer[] = [
  {
    studentId: "s1",
    text: "영속성 컨텍스트는 엔티티를 관리하는 공간으로, 1차 캐시를 통해 같은 트랜잭션 안에서 동일 엔티티 조회를 보장하고…",
    findings: [
      { tone: "good", text: "핵심 포함 — 1차 캐시, 동일성 보장" },
      { tone: "lack", text: "부족 — 쓰기 지연·변경 감지 미언급" },
      { tone: "tip", text: "제안 — flush 시점을 예시와 함께 보강" },
    ],
  },
  {
    studentId: "s2",
    text: "엔티티 매니저가 관리하는 영속 상태의 엔티티 집합입니다. 변경 감지로 update 쿼리가 자동 생성됩니다.",
    findings: [
      { tone: "good", text: "핵심 포함 — 변경 감지" },
      { tone: "lack", text: "부족 — 1차 캐시·동일성 보장 미언급" },
      { tone: "tip", text: "제안 — 트랜잭션 범위와 함께 설명" },
    ],
  },
  {
    studentId: "s3",
    text: "JPA가 엔티티를 저장하는 환경입니다. persist 하면 영속 상태가 되고 commit 시점에 DB에 반영됩니다.",
    findings: [
      { tone: "good", text: "핵심 포함 — 영속 상태, 쓰기 지연" },
      { tone: "lack", text: "부족 — 1차 캐시·변경 감지 미언급" },
      { tone: "tip", text: "제안 — 준영속·삭제 상태까지 생명주기로 정리" },
    ],
  },
  {
    studentId: "s4",
    text: "엔티티를 캐싱해서 같은 id로 조회하면 DB에 다시 가지 않고 캐시에서 돌려줍니다.",
    findings: [
      { tone: "good", text: "핵심 포함 — 1차 캐시" },
      { tone: "lack", text: "부족 — 동일성 보장·변경 감지 미언급" },
      { tone: "tip", text: "제안 — 캐시 범위가 트랜잭션 단위임을 명시" },
    ],
  },
  {
    studentId: "s5",
    text: "영속성 컨텍스트는 트랜잭션 안에서 엔티티 변경을 추적해 flush 시점에 update 쿼리를 만들어 줍니다.",
    findings: [
      { tone: "good", text: "핵심 포함 — 변경 감지, flush" },
      { tone: "lack", text: "부족 — 1차 캐시·동일성 보장 미언급" },
      { tone: "tip", text: "제안 — 스냅샷 비교 원리를 한 줄 추가" },
    ],
  },
  {
    studentId: "s6",
    text: "엔티티 매니저 안에 있는 저장소로, 여기에 들어간 엔티티만 JPA가 관리합니다.",
    findings: [
      { tone: "good", text: "핵심 포함 — 관리 대상 범위" },
      { tone: "lack", text: "부족 — 1차 캐시·쓰기 지연·변경 감지 미언급" },
      { tone: "tip", text: "제안 — 영속성 컨텍스트가 주는 이점을 예시로 보강" },
    ],
  },
];

/** ReviewPage 목업이 쓰는 학생 이름 목록 — LIVE_ROOM.students에서 id·name만 추린다 */
export const REPORT_STUDENTS_MOCK: Student[] = LIVE_ROOM.students;
