// 데이터 연동 전 화면 확인용 목업. 뷰 타입은 ./types로 옮겼고 여기에는 데이터만 남는다.
// 화면이 API에 연결되는 대로 이 파일은 통째로 걷어낸다.
import type {
  DashboardStat,
  LiveQuestion,
  LiveRoom,
  PastSession,
  Question,
  QuestionResult,
  QuestionSet,
  RoomSetup,
  SessionReport,
} from "./types";

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: "rooms", label: "개설한 방", value: "12개", tile: { label: "P", tone: "mint" } },
  { id: "sessions", label: "진행한 세션", value: "8회", tile: { label: "S", tone: "blue" } },
  { id: "students", label: "누적 학생", value: "64명", tile: { label: "U", tone: "orange" } },
];

export const QUESTION_SETS: QuestionSet[] = [
  {
    id: "qs-1",
    title: "Spring 기술면접",
    summary: "객관식 5 · 서술형 3 · 8문항",
    questionCount: 8,
    tile: { label: "Sp", tone: "mint" },
    composition: [
      { type: "multiple", count: 5 },
      { type: "essay", count: 3 },
    ],
    totalPoints: 800,
    minutes: 20,
    usage: { count: 2, lastUsed: "8/22" },
    preview: [
      "@Transactional 기본 전파 속성",
      "영속성 컨텍스트 설명 (서술형)",
      "Bean 기본 스코프 (OX)",
    ],
  },
  {
    id: "qs-2",
    title: "JPA 심화",
    summary: "객관식 8 · OX 2 · 10문항",
    questionCount: 10,
    tile: { label: "J", tone: "blue" },
    composition: [
      { type: "multiple", count: 8 },
      { type: "ox", count: 2 },
    ],
    totalPoints: 1000,
    minutes: 15,
    usage: { count: 1, lastUsed: "8/20" },
    preview: ["N+1 문제의 원인", "지연 로딩 기본 대상", "영속성 전이 CASCADE"],
  },
  {
    id: "qs-3",
    title: "CS 기초 다지기",
    summary: "객관식 10 · 10문항",
    questionCount: 10,
    tile: { label: "CS", tone: "orange" },
    composition: [{ type: "multiple", count: 10 }],
    totalPoints: 1000,
    minutes: 12,
    usage: { count: 3, lastUsed: "8/17" },
    preview: ["프로세스와 스레드 차이", "TCP 3-way handshake", "HTTP 상태 코드 4xx"],
  },
  {
    id: "qs-4",
    title: "네트워크 면접 대비",
    summary: "서술형 6 · 6문항",
    questionCount: 6,
    tile: { label: "네", tone: "gray" },
    composition: [{ type: "essay", count: 6 }],
    totalPoints: 600,
    minutes: 30,
    preview: ["HTTPS 동작 원리", "TCP vs UDP", "CORS 동작 과정"],
  },
];

export const PAST_SESSIONS: PastSession[] = [
  { id: "1", date: "8/22", title: "8월 4주차 Spring 스터디", participants: 6, averageScore: 72 },
  { id: "2", date: "8/20", title: "CS 모의면접 3회차", participants: 5, averageScore: 68 },
];

/** 방 설정 기본값 (W-02 v2). 참가비 10,000원 → 선생님 8,000 · 플랫폼 2,000 */
export const ROOM_SETUP: RoomSetup = {
  defaultFee: 10000,
  hostShare: 0.8,
  paidMinLevel: 3,
  reputation: { level: 3, title: "검증된 운영자" },
};

/** 에디터에서 검토 중인 세트 (W-03) */
export const DRAFT_SET = {
  id: "qs-1",
  title: "Spring 기술면접",
  condition: {
    topic: "Spring, JPA 트랜잭션",
    composition: "객관식 5 · 서술형 3",
    level: "중급",
    count: 8,
  },
};

export const DRAFT_QUESTIONS: Question[] = [
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

/** 대기실·진행 중인 방 (W-04~W-06) */
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

/** "482913" → "482 913" */
export function formatPin(pin: string): string {
  return `${pin.slice(0, 3)} ${pin.slice(3)}`;
}

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

export const QUESTION_RESULT: QuestionResult = {
  correct: "A",
  distribution: [
    { key: "A", text: "REQUIRED", count: 4 },
    { key: "B", text: "REQUIRES_NEW", count: 1 },
    { key: "C", text: "SUPPORTS", count: 1 },
    { key: "D", text: "NESTED", count: 0 },
  ],
  accuracy: 67,
  accuracyDelta: 12,
  ranking: [
    { rank: 1, studentId: "s1", score: 1240, change: 0 },
    { rank: 2, studentId: "s2", score: 1100, change: 1 },
    { rank: 3, studentId: "s5", score: 980, change: -1 },
    { rank: 4, studentId: "s3", score: 870, change: 2 },
    { rank: 5, studentId: "s4", score: 760, change: -1 },
  ],
};

export const SESSION_REPORT: SessionReport = {
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
  essayAnswers: {
    q3: [
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
    ],
  },
};
