import type {
  HostedRoomDto,
  ParticipantEntry,
  PublicRoomDto,
  QuestionSetDto,
  RoomInfoResponse,
  SnapshotQuestion,
  UserProfileResponse,
} from "@/lib/types/dto";

/**
 * 여러 도메인 목이 공유하는 값. 화면이 지금 보여주는 값(features/**\/mock.ts)을 DTO 모양으로 옮긴다.
 * 백엔드 연동 시 lib/mocks 폴더를 통째로 걷어낸다.
 */

/** 로그인 회원 = 이한결(여우, Lv.3). features/me/mock.ts PROFILE. avatarId 6 = fox(AVATAR_KEYS 6번째) */
export const ME_USER_ID = 1;
export const ME_PROFILE: UserProfileResponse = {
  nickname: "한결",
  email: "hangyeol@passmate.app",
  joinedAt: "2026-08-01",
  avatarId: 6,
  level: 3,
  coins: 1200,
  joinedRoomCount: 3,
  hostedRoomCount: 24,
};

/**
 * 시연 방 — PIN "482913". features/host/my-rooms/mock.ts MY_ROOMS[0]·구 features/home/mock.ts(삭제됨)의
 * POPULAR_ROOMS[0]·features/participant/pay/mock.ts PAID_ROOM이 같은 방을 가리킨다.
 * 호스트 등급(Lv.3)·평점(4.5)은 PAID_ROOM(features/participant/pay/mock.ts) 기준으로 통일한다
 * (과제 지시) — PAID_ROOM.host.level이 3이므로 여기도 3.
 */
export const DEMO_ROOM_ID = 1;
export const DEMO_PIN = "482913";
export const DEMO_ROOM: RoomInfoResponse = {
  roomId: DEMO_ROOM_ID,
  pin: DEMO_PIN,
  title: "Spring 실전 모의고사 4주차",
  topic: "백엔드",
  status: "WAITING",
  questionCount: 8,
  estimatedMinutes: 40,
  scheduledAt: "2026-08-28T20:00:00+09:00",
  participantCount: 24,
  maxParticipants: 40,
  isPaid: true,
  entryFee: 10000,
  host: { userId: 42, nickname: "김민지", level: 3, avgStars: 4.5, ratingCount: 312 },
};

/**
 * 아바타 12종 ↔ avatarId 1..12 (components/common/student-avatar.tsx AVATAR_KEYS 순서:
 * cat,dog,bear,panda,rabbit,fox,frog,penguin,owl,tiger,raccoon,dino).
 * features/host/mock.ts LIVE_ROOM.students를 옮긴다. participantId는 11부터.
 */
export const PARTICIPANTS: ParticipantEntry[] = [
  { participantId: 11, nickname: "준영", avatarId: 1, isGuest: true }, // cat
  { participantId: 12, nickname: "혜림", avatarId: 5, isGuest: true }, // rabbit
  { participantId: 13, nickname: "승혁", avatarId: 2, isGuest: true }, // dog
  { participantId: 14, nickname: "희표", avatarId: 3, isGuest: true }, // bear
  { participantId: 15, nickname: "민지", avatarId: 6, isGuest: true }, // fox
  { participantId: 16, nickname: "도윤", avatarId: 8, isGuest: true }, // penguin
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
    status: "FINISHED",
    participantCount: 9,
    scheduledAt: null,
    endedAtLabel: "8/19 종료",
    avgAccuracyPercent: 77,
  },
  {
    roomId: 102,
    title: "CS 기술면접 라운드 2",
    status: "FINISHED",
    participantCount: 21,
    scheduledAt: null,
    endedAtLabel: "8/15 종료",
    avgAccuracyPercent: 68,
  },
  {
    roomId: 103,
    title: "JPA 복습 방",
    status: "FINISHED",
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
export const PUBLIC_ROOMS: PublicRoomDto[] = [
  {
    roomId: DEMO_ROOM_ID,
    pin: DEMO_PIN,
    title: "Spring 실전 모의고사 4주차",
    topic: "백엔드",
    hostId: 42,
    hostName: "김민지",
    hostLevel: 3,
    status: "WAITING",
    participantCount: 24,
    maxParticipants: 40,
    isPaid: true,
    entryFee: 10000,
    scheduledAt: DEMO_ROOM.scheduledAt,
  },
  {
    roomId: 201,
    pin: "CS0002",
    title: "CS 기술면접 라운드 2",
    topic: "CS 면접",
    hostName: "박세라",
    hostLevel: 4,
    status: "WAITING",
    participantCount: 18,
    isPaid: false,
  },
  {
    roomId: 202,
    pin: "NET001",
    title: "네트워크 한 번에 정리",
    topic: "네트워크",
    hostName: "정우진",
    hostLevel: 2,
    status: "WAITING",
    participantCount: 9,
    isPaid: false,
  },
  {
    roomId: 203,
    pin: "JPA003",
    title: "JPA 영속성 컨텍스트 뽀개기",
    topic: "백엔드",
    hostName: "이서준",
    hostLevel: 3,
    status: "WAITING",
    participantCount: 15,
    isPaid: false,
  },
  {
    roomId: 204,
    pin: "DB0004",
    title: "인덱스와 실행 계획 실전",
    topic: "데이터베이스",
    hostName: "최유나",
    hostLevel: 5,
    status: "WAITING",
    participantCount: 31,
    isPaid: true,
  },
  {
    roomId: 205,
    pin: "OS0005",
    title: "운영체제 핵심 30문항",
    topic: "CS 면접",
    hostName: "한지훈",
    hostLevel: 2,
    status: "WAITING",
    participantCount: 12,
    isPaid: false,
  },
  {
    roomId: 206,
    pin: "ALG006",
    title: "코딩테스트 개념 점검",
    topic: "알고리즘",
    hostName: "오다은",
    hostLevel: 3,
    status: "WAITING",
    participantCount: 27,
    isPaid: false,
  },
  {
    roomId: 207,
    pin: "SEC007",
    title: "웹 보안 취약점 라운드 1",
    topic: "보안",
    hostName: "김민지",
    hostLevel: 3,
    status: "WAITING",
    participantCount: 8,
    isPaid: true,
  },
  {
    roomId: 208,
    pin: "FE0008",
    title: "React 렌더링 원리 퀴즈",
    topic: "프론트엔드",
    hostName: "장하늘",
    hostLevel: 4,
    status: "WAITING",
    participantCount: 22,
    isPaid: false,
  },
  {
    roomId: 209,
    pin: "DEV009",
    title: "Docker · K8s 기초 다지기",
    topic: "DevOps",
    hostName: "박세라",
    hostLevel: 4,
    status: "WAITING",
    participantCount: 14,
    isPaid: false,
  },
  {
    roomId: 210,
    pin: "JAV010",
    title: "Java 컬렉션 한 방 정리",
    topic: "백엔드",
    hostName: "정우진",
    hostLevel: 2,
    status: "WAITING",
    participantCount: 11,
    isPaid: false,
  },
  {
    roomId: 211,
    pin: "SYS011",
    title: "시스템 디자인 첫걸음",
    topic: "CS 면접",
    hostName: "최유나",
    hostLevel: 5,
    status: "WAITING",
    participantCount: 19,
    isPaid: true,
  },
];

/**
 * features/host/mock.ts QUESTION_SETS → setId, status "CONFIRMED"(확정 세트만 목록에 노출),
 * usedCount=usage.count, lastUsedAt=usage.lastUsed.
 */
export const QUESTION_SETS: QuestionSetDto[] = [
  {
    setId: 1,
    title: "Spring 기술면접",
    status: "CONFIRMED",
    questionCount: 8,
    usedCount: 2,
    lastUsedAt: "8/22",
  },
  {
    setId: 2,
    title: "JPA 심화",
    status: "CONFIRMED",
    questionCount: 10,
    usedCount: 1,
    lastUsedAt: "8/20",
  },
  {
    setId: 3,
    title: "CS 기초 다지기",
    status: "CONFIRMED",
    questionCount: 10,
    usedCount: 3,
    lastUsedAt: "8/17",
  },
  {
    setId: 4,
    title: "네트워크 면접 대비",
    status: "CONFIRMED",
    questionCount: 6,
    usedCount: null,
    lastUsedAt: null,
  },
];

/**
 * 진행 문항 8개 — features/host/mock.ts DRAFT_QUESTIONS(type·body·points·seconds) 순서를 기반으로,
 * 2번 문항은 LIVE_QUESTION(실제 choices가 있는 유일한 예시)의 내용으로 채운다(그래서 1·2번 순서를 맞바꿨다).
 * OX 문항의 choices는 계약 주석("OX: O|X")을 그대로 쓴 것으로 화면 값을 지어낸 것이 아니다.
 * endsAt은 session.ts가 호출 시점에 계산해 덮어쓰므로 여기서는 자리표시자만 둔다.
 */
const ENDS_AT_PLACEHOLDER = new Date(0).toISOString();

export const LIVE_QUESTIONS: SnapshotQuestion[] = [
  {
    questionId: 1,
    questionNo: 1,
    type: "ESSAY",
    body: "JPA 영속성 컨텍스트의 1차 캐시 동작을 설명하세요.",
    points: 100,
    timeLimitSec: 120,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
  {
    questionId: 2,
    questionNo: 2,
    type: "MULTIPLE_CHOICE",
    body: "@Transactional의 기본 전파(propagation) 속성은 무엇인가?",
    choices: ["REQUIRED", "REQUIRES_NEW", "SUPPORTS", "NESTED"],
    points: 100,
    timeLimitSec: 30,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
  {
    questionId: 3,
    questionNo: 3,
    type: "OX",
    body: "Spring Bean의 기본 스코프는 prototype이다.",
    choices: ["O", "X"],
    points: 100,
    timeLimitSec: 20,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
  {
    questionId: 4,
    questionNo: 4,
    type: "MULTIPLE_CHOICE",
    body: "Spring AOP가 기본으로 사용하는 프록시 방식은?",
    points: 100,
    timeLimitSec: 30,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
  {
    questionId: 5,
    questionNo: 5,
    type: "MULTIPLE_CHOICE",
    body: "@Autowired 주입 방식 중 권장되는 것은?",
    points: 100,
    timeLimitSec: 30,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
  {
    questionId: 6,
    questionNo: 6,
    type: "ESSAY",
    body: "N+1 문제가 발생하는 원인과 해결 방법을 설명하세요.",
    points: 100,
    timeLimitSec: 120,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
  {
    questionId: 7,
    questionNo: 7,
    type: "MULTIPLE_CHOICE",
    body: "JPA에서 지연 로딩(LAZY)의 기본 대상은?",
    points: 100,
    timeLimitSec: 30,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
  {
    questionId: 8,
    questionNo: 8,
    type: "ESSAY",
    body: "Spring Security 필터 체인의 동작 순서를 설명하세요.",
    points: 100,
    timeLimitSec: 120,
    endsAt: ENDS_AT_PLACEHOLDER,
  },
];
