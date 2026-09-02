import type {
  HostedRoomDto,
  MyProfileResponse,
  ParticipantResponse,
  PublicRoomResponse,
  QuestionResponse,
  QuestionSetSummaryResponse,
  RoomResponse,
  SnapshotQuestion,
} from "@/lib/types/dto";

/**
 * 여러 도메인 목이 공유하는 값. 화면이 지금 보여주는 값(features/**\/mock.ts)을 DTO 모양으로 옮긴다.
 * 백엔드 연동 시 lib/mocks 폴더를 통째로 걷어낸다.
 */

/**
 * 로그인 회원 = 이한결(여우). features/me/mock.ts PROFILE.
 * 백엔드 `MyProfileResponse` 형태 그대로다 — **등급·뱃지·별점 필드는 서버에 없으므로 넣지 않는다.**
 * 시각은 서버와 같은 UTC naive 문자열(`parseServerDateTime`이 읽는 형식).
 */
export const ME_USER_ID = 1;
export const ME_PROFILE: MyProfileResponse = {
  id: ME_USER_ID,
  nickname: "한결",
  email: "hangyeol@passmate.app",
  provider: "GOOGLE",
  defaultAvatarId: "fox",
  isAdmin: true,
  joinedAt: "2026-08-01T00:12:31.284000",
  lastLoginAt: "2026-09-02T02:12:49.123456",
  stats: {
    joinedRoomCount: 3,
    hostedRoomCount: 24,
    hostedSessionCount: 18,
    totalStudentCount: 312,
  },
  coinBalance: 1200,
};

/**
 * 시연 방 — PIN "482913". features/host/my-rooms/mock.ts MY_ROOMS[0]·구 features/home/mock.ts(삭제됨)의
 * POPULAR_ROOMS[0]·features/participant/pay/mock.ts PAID_ROOM이 같은 방을 가리킨다.
 * 호스트 등급(Lv.3)·평점(4.5)은 PAID_ROOM(features/participant/pay/mock.ts) 기준으로 통일한다
 * (과제 지시) — PAID_ROOM.host.level이 3이므로 여기도 3.
 */
export const DEMO_ROOM_ID = 1;
export const DEMO_PIN = "482913";
export const DEMO_ROOM: RoomResponse = {
  id: DEMO_ROOM_ID,
  title: "Spring 실전 모의고사 4주차",
  topic: "백엔드",
  pin: DEMO_PIN,
  status: "WAITING",
  type: "PAID",
  fee: 10000,
  questionSetId: 1,
  hostUserId: 42,
  maxParticipants: 40,
  participantCount: 24,
  isPublic: true,
  screenLocked: false,
  currentQuestionNo: 0,
  // UTC naive — KST 20:00에 해당한다(서버가 UTC로 돈다)
  scheduledAt: "2026-08-28T11:00:00",
};

/**
 * 아바타는 문자열 키다 (lib/types/dto/common.ts AVATAR_KEYS — ERD avatar_id varchar(30)).
 * features/host/mock.ts LIVE_ROOM.students를 옮긴다. participantId는 11부터.
 */
export const PARTICIPANTS: ParticipantResponse[] = [
  { id: 11, nickname: "준영", avatarId: "cat", isGuest: true, joinedAt: "2026-09-02T02:00:11" },
  { id: 12, nickname: "혜림", avatarId: "rabbit", isGuest: true, joinedAt: "2026-09-02T02:00:24" },
  { id: 13, nickname: "승혁", avatarId: "dog", isGuest: true, joinedAt: "2026-09-02T02:00:39" },
  { id: 14, nickname: "희표", avatarId: "bear", isGuest: true, joinedAt: "2026-09-02T02:01:02" },
  { id: 15, nickname: "민지", avatarId: "fox", isGuest: false, joinedAt: "2026-09-02T02:01:17" },
  { id: 16, nickname: "도윤", avatarId: "penguin", isGuest: true, joinedAt: "2026-09-02T02:01:45" },
];

/**
 * features/host/my-rooms/mock.ts MY_ROOMS → roomId 100+, status live→RUNNING·ended→FINISHED,
 * averageScore→avgAccuracyPercent, endedLabel→endedAtLabel, startsLabel→scheduledAt(그대로).
 */
export const HOSTED_ROOMS: HostedRoomDto[] = [
  {
    roomId: 100,
    pin: "482913",
    title: "Spring 실전 모의고사 4주차",
    status: "RUNNING",
    participantCount: 24,
    scheduledAt: "20:00 시작",
    avgAccuracyPercent: null,
    endedAtLabel: null,
  },
  {
    roomId: 101,
    title: "네트워크 한 번에 정리",
    status: "ENDED",
    participantCount: 9,
    scheduledAt: null,
    endedAtLabel: "8/19 종료",
    avgAccuracyPercent: 77,
  },
  {
    roomId: 102,
    title: "CS 기술면접 라운드 2",
    status: "ENDED",
    participantCount: 21,
    scheduledAt: null,
    endedAtLabel: "8/15 종료",
    avgAccuracyPercent: 68,
  },
  {
    roomId: 103,
    title: "JPA 복습 방",
    status: "ENDED",
    participantCount: 18,
    scheduledAt: null,
    endedAtLabel: "8/08 종료",
    avgAccuracyPercent: 64,
  },
];

/**
 * 구 features/home/mock.ts(삭제됨)의 POPULAR_ROOMS 값 — hostName=host, hostLevel=level,
 * participantCount=participants, isPaid=type==="paid". 첫 항목(482913)은 DEMO_ROOM과 같은 방.
 */
/**
 * 공개 방 목록의 "20:00 시작 · 내일 19:00" 문구를 보려면 날짜가 흘러도 미래여야 한다.
 * 고정 ISO를 박으면 하루만 지나도 전부 과거가 되므로 오늘을 기준으로 만든다.
 */
function eveningAfter(days: number, hour: number): string {
  const at = new Date();
  at.setDate(at.getDate() + days);
  at.setHours(hour, 0, 0, 0);
  // 서버와 같은 형식(UTC naive)으로 돌려준다 — 화면은 parseServerDateTime으로 읽는다
  return at.toISOString().slice(0, 19);
}

const TODAY_EVENING = eveningAfter(0, 20);
const TOMORROW_EVENING = eveningAfter(1, 19);
const DAY_AFTER_EVENING = eveningAfter(2, 21);

export const PUBLIC_ROOMS: PublicRoomResponse[] = [
  {
    id: DEMO_ROOM_ID,
    title: "Spring 실전 모의고사 4주차",
    topic: "백엔드",
    status: "WAITING",
    type: "PAID",
    fee: 10000,
    questionCount: 8,
    participantCount: 24,
    maxParticipants: 40,
    host: { userId: 42, nickname: "김민지" },
    scheduledAt: DEMO_ROOM.scheduledAt,
  },
  {
    id: 201,
    title: "CS 기술면접 라운드 2",
    topic: "CS 면접",
    status: "WAITING",
    type: "FREE",
    questionCount: 10,
    participantCount: 18,
    host: { userId: 43, nickname: "박세라" },
    scheduledAt: TODAY_EVENING,
  },
  {
    id: 202,
    title: "네트워크 한 번에 정리",
    topic: "네트워크",
    status: "WAITING",
    type: "FREE",
    questionCount: 6,
    participantCount: 9,
    host: { userId: 44, nickname: "정우진" },
  },
  {
    id: 203,
    title: "JPA 영속성 컨텍스트 뽀개기",
    topic: "백엔드",
    status: "WAITING",
    type: "FREE",
    questionCount: 10,
    participantCount: 15,
    host: { userId: 45, nickname: "이서준" },
  },
  {
    id: 204,
    title: "인덱스와 실행 계획 실전",
    topic: "데이터베이스",
    status: "WAITING",
    type: "PAID",
    fee: 8000,
    questionCount: 12,
    participantCount: 31,
    host: { userId: 46, nickname: "최유나" },
    scheduledAt: TOMORROW_EVENING,
  },
  {
    id: 205,
    title: "운영체제 핵심 30문항",
    topic: "CS 면접",
    status: "WAITING",
    type: "FREE",
    questionCount: 30,
    participantCount: 12,
    host: { userId: 47, nickname: "한지훈" },
  },
  {
    id: 206,
    title: "코딩테스트 개념 점검",
    topic: "알고리즘",
    status: "WAITING",
    type: "FREE",
    questionCount: 8,
    participantCount: 21,
    host: { userId: 48, nickname: "오다은" },
    scheduledAt: DAY_AFTER_EVENING,
  },
];

/**
 * features/host/mock.ts QUESTION_SETS → 백엔드 `QuestionSetSummaryResponse` 형태.
 * 시각은 서버와 같은 UTC naive 문자열이다.
 */
export const QUESTION_SETS: QuestionSetSummaryResponse[] = [
  {
    id: 1,
    title: "Spring 기술면접",
    status: "CONFIRMED",
    source: "AI",
    questionCount: 8,
    totalPoints: 800,
    estimatedSeconds: 480,
    usageCount: 2,
    lastUsedAt: "2026-08-22T05:00:00",
    confirmedAt: "2026-08-20T02:10:00",
    createdAt: "2026-08-19T09:30:00",
  },
  {
    id: 2,
    title: "JPA 심화",
    status: "CONFIRMED",
    source: "MIXED",
    questionCount: 10,
    totalPoints: 1000,
    estimatedSeconds: 600,
    usageCount: 1,
    lastUsedAt: "2026-08-20T04:00:00",
    confirmedAt: "2026-08-18T01:00:00",
    createdAt: "2026-08-17T23:00:00",
  },
  {
    id: 3,
    title: "CS 기초 다지기",
    status: "CONFIRMED",
    source: "AI",
    questionCount: 10,
    totalPoints: 1000,
    estimatedSeconds: 540,
    usageCount: 3,
    lastUsedAt: "2026-08-17T07:20:00",
    confirmedAt: "2026-08-10T02:00:00",
    createdAt: "2026-08-09T12:00:00",
  },
  {
    id: 4,
    title: "네트워크 면접 대비",
    status: "CONFIRMED",
    source: "MANUAL",
    questionCount: 6,
    totalPoints: 600,
    estimatedSeconds: 360,
    usageCount: 0,
    confirmedAt: "2026-08-05T06:00:00",
    createdAt: "2026-08-04T13:00:00",
  },
];

/**
 * 진행 문항 8개 — features/host/mock.ts DRAFT_QUESTIONS(type·body·points·seconds) 순서를 기반으로,
 * 2번 문항은 LIVE_QUESTION(실제 choices가 있는 유일한 예시)의 내용으로 채운다(그래서 1·2번 순서를 맞바꿨다).
 * OX 문항의 choices는 계약 주석("OX: O|X")을 그대로 쓴 것으로 화면 값을 지어낸 것이 아니다.
 * 4·5·7번(MCQ)의 choices는 body 질문에 맞춰 채운 보기 4개 — session.ts의
 * CORRECT_ANSWERS가 그중 하나를 정답으로 표시한다.
 * endsAt은 session.ts가 호출 시점에 계산해 덮어쓰므로 여기서는 자리표시자만 둔다.
 */
const ENDS_AT_PLACEHOLDER = new Date(0).toISOString();

/**
 * 세트 문항 8개 — 목의 **단일 출처**다. 백엔드 `QuestionResponse` 형태로 두고,
 * 세션 진행용 스냅샷(`LIVE_QUESTIONS`)은 여기서 파생시킨다(정답은 진행 중에 내려가지 않는다).
 *
 * 4·5·7번(MCQ)의 보기는 지문에 맞춰 채운 4개이고, 정답은 `answer`에 **보기 원문**으로 둔다.
 * OX 보기는 계약 주석("OX: O|X")을 그대로 쓴 것이라 화면 값을 지어낸 것이 아니다.
 */
export const SET_QUESTIONS: QuestionResponse[] = [
  {
    id: 1,
    orderNo: 1,
    type: "ESSAY",
    content: "JPA 영속성 컨텍스트의 1차 캐시 동작을 설명하세요.",
    answer:
      "같은 트랜잭션 안에서 조회한 엔티티를 식별자 기준으로 보관해 재조회 시 SQL 없이 돌려준다.",
    topic: "JPA",
    difficulty: "NORMAL",
    points: 100,
    timeLimitSec: 120,
    source: "AI",
  },
  {
    id: 2,
    orderNo: 2,
    type: "MCQ",
    content: "@Transactional의 기본 전파(propagation) 속성은 무엇인가?",
    choices: ["REQUIRED", "REQUIRES_NEW", "SUPPORTS", "NESTED"],
    answer: "REQUIRED",
    explanation: "진행 중인 트랜잭션이 있으면 참여하고, 없으면 새로 만든다.",
    topic: "Spring",
    difficulty: "NORMAL",
    points: 100,
    timeLimitSec: 30,
    source: "AI",
  },
  {
    id: 3,
    orderNo: 3,
    type: "OX",
    content: "Spring Bean의 기본 스코프는 prototype이다.",
    choices: ["O", "X"],
    answer: "X",
    explanation: "기본 스코프는 singleton이다.",
    topic: "Spring",
    difficulty: "EASY",
    points: 100,
    timeLimitSec: 20,
    source: "AI",
  },
  {
    id: 4,
    orderNo: 4,
    type: "MCQ",
    content: "Spring AOP가 기본으로 사용하는 프록시 방식은?",
    choices: ["JDK 동적 프록시", "CGLIB", "ByteBuddy", "AspectJ 위빙"],
    answer: "CGLIB",
    explanation: "스프링 부트는 proxyTargetClass=true가 기본이라 CGLIB 프록시를 쓴다.",
    topic: "Spring",
    difficulty: "HARD",
    points: 100,
    timeLimitSec: 30,
    source: "AI",
  },
  {
    id: 5,
    orderNo: 5,
    type: "MCQ",
    content: "@Autowired 주입 방식 중 권장되는 것은?",
    choices: ["필드 주입", "세터 주입", "생성자 주입", "세터·필드 혼용"],
    answer: "생성자 주입",
    explanation: "순환 참조를 컴파일 시점에 막을 수 있어 스프링 공식 문서가 권장한다.",
    topic: "Spring",
    difficulty: "NORMAL",
    points: 100,
    timeLimitSec: 30,
    source: "AI",
  },
  {
    id: 6,
    orderNo: 6,
    type: "ESSAY",
    content: "N+1 문제가 발생하는 원인과 해결 방법을 설명하세요.",
    answer:
      "지연 로딩된 연관관계를 반복 조회할 때 생긴다. fetch join·@EntityGraph·batch size로 줄인다.",
    topic: "JPA",
    difficulty: "HARD",
    points: 100,
    timeLimitSec: 120,
    source: "AI",
  },
  {
    id: 7,
    orderNo: 7,
    type: "MCQ",
    content: "JPA에서 지연 로딩(LAZY)의 기본 대상은?",
    choices: [
      "@ManyToOne 연관관계",
      "@OneToOne 연관관계",
      "@OneToMany·@ManyToMany 연관관계",
      "모든 연관관계",
    ],
    answer: "@OneToMany·@ManyToMany 연관관계",
    explanation: "ManyToOne·OneToOne은 기본 EAGER, 컬렉션 연관관계만 기본 LAZY다.",
    topic: "JPA",
    difficulty: "NORMAL",
    points: 100,
    timeLimitSec: 30,
    source: "AI",
  },
  {
    id: 8,
    orderNo: 8,
    type: "ESSAY",
    content: "Spring Security 필터 체인의 동작 순서를 설명하세요.",
    answer:
      "서블릿 필터 체인 앞단의 DelegatingFilterProxy가 SecurityFilterChain으로 위임해 순서대로 실행한다.",
    topic: "Spring",
    difficulty: "HARD",
    points: 100,
    timeLimitSec: 120,
    source: "AI",
  },
];

/**
 * 진행 문항 — 스냅샷·이벤트용. `SET_QUESTIONS`에서 **정답을 뺀** 형태다.
 * endsAt은 session.ts가 호출 시점에 계산해 덮어쓰므로 여기서는 자리표시자만 둔다.
 */
export const LIVE_QUESTIONS: SnapshotQuestion[] = SET_QUESTIONS.map((q) => ({
  questionId: q.id,
  questionNo: q.orderNo,
  type: q.type,
  body: q.content,
  choices: q.choices ?? null,
  points: q.points,
  timeLimitSec: q.timeLimitSec,
  endsAt: ENDS_AT_PLACEHOLDER,
}));
