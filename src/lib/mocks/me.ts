import type {
  GuestClaimResponse,
  ReportRequest,
  ReportResponse,
  BadgesResponse,
  BadgeType,
  GradeResponse,
  HostProfileResponse,
  CumulativeReportResponse,
  JoinedRoomsResponse,
  MyProfileResponse,
  NotificationSettingsDto,
  NotificationSettingsUpdate,
  UserProfileUpdateRequest,
} from "@/lib/types/dto";
import { DEMO_ROOM_ID, ME_PROFILE, PUBLIC_ROOMS } from "./fixtures";

/**
 * 내 프로필(me) 목 응답. features/me/mock.ts·features/me/joined/mock.ts·
 * features/host/my-rooms/mock.ts LEVEL_STATUS·PROMOTION을 DTO 모양으로 옮긴다.
 */

let profile: MyProfileResponse = { ...ME_PROFILE };
let notificationSettings: NotificationSettingsDto = {
  sessionStart: true,
  ratingRequest: true,
  settlementDone: true,
};

/** 현재 프로필(mutable). 다른 도메인 목이 내 닉네임·아바타를 읽을 때 이 getter로 단일 출처를 쓴다. */
export function currentProfile(): MyProfileResponse {
  return profile;
}

/** GET /users/me — isAdmin: true는 관리자 화면 확인용으로 유지한다 */
export function mockMe(): MyProfileResponse {
  return { ...profile };
}

/** PUT /users/me — 갱신된 프로필 전체를 돌려준다(서버와 동일) */
export function mockUpdateProfile(body: UserProfileUpdateRequest): MyProfileResponse {
  profile = {
    ...profile,
    nickname: body.nickname,
    profileImageUrl: body.profileImageUrl ?? profile.profileImageUrl,
    defaultAvatarId: body.defaultAvatarId ?? profile.defaultAvatarId,
  };
  return mockMe();
}

/** DELETE /users/me */
export function mockDeleteMe(): undefined {
  return undefined;
}

/** 참여한 방 목 데이터 — 진행 중 1개 + 종료 3개 */
const JOINED_ROOMS: JoinedRoomsResponse["rooms"]["content"] = [
  {
    roomId: DEMO_ROOM_ID,
    title: "Spring 실전 모의고사 4주차",
    hostNickname: "김민지",
    status: "RUNNING",
    startedAt: "2026-09-02T02:00:00",
    questionCount: 8,
    fee: 10000,
    hasReport: false,
  },
  {
    roomId: 11,
    title: "8월 4주차 Spring 스터디",
    hostNickname: "김선생",
    status: "ENDED",
    startedAt: "2026-08-22T10:00:00",
    endedAt: "2026-08-22T11:00:00",
    questionCount: 8,
    myScore: 990,
    myRank: 3,
    myAccuracy: 75,
    hasReport: true,
  },
  {
    roomId: 12,
    title: "CS 모의면접 3회차",
    hostNickname: "박세라",
    status: "ENDED",
    startedAt: "2026-08-20T11:00:00",
    endedAt: "2026-08-20T12:00:00",
    questionCount: 10,
    myScore: 1120,
    myRank: 2,
    myAccuracy: 80,
    hasReport: true,
  },
  {
    roomId: 13,
    title: "JPA 복습 세션",
    hostNickname: "이서준",
    status: "ENDED",
    startedAt: "2026-08-17T08:00:00",
    endedAt: "2026-08-17T09:00:00",
    questionCount: 6,
    myScore: 640,
    myRank: 5,
    myAccuracy: 50,
    hasReport: true,
  },
];

const JOINED_PAGE_SIZE = 20;

/** GET /users/me/rooms/joined?page&size — 요약 + 오프셋 페이지 */
export function mockJoinedRooms(url: URL): JoinedRoomsResponse {
  const page = Number(url.searchParams.get("page") ?? 0) || 0;
  const size = Number(url.searchParams.get("size") ?? JOINED_PAGE_SIZE) || JOINED_PAGE_SIZE;
  const content = JOINED_ROOMS.slice(page * size, page * size + size);

  return {
    summary: {
      completedSessionCount: 3,
      averageAccuracy: 71,
      averageRank: 3.3,
      weakTopics: ["JPA 영속성", "트랜잭션", "인덱스"],
    },
    rooms: {
      content,
      page,
      size,
      totalElements: JOINED_ROOMS.length,
      totalPages: Math.max(1, Math.ceil(JOINED_ROOMS.length / size)),
      hasNext: (page + 1) * size < JOINED_ROOMS.length,
    },
  };
}

/** GET /users/me/report — 누적 학습 리포트 */
export function mockCumulativeReport(): CumulativeReportResponse {
  return {
    joinedRoomCount: 4,
    completedSessionCount: 3,
    averageAccuracy: 71,
    averageRank: 3.3,
    accuracyChangeFromLastWeek: 4.2,
    trend: [
      {
        roomId: 3,
        roomTitle: "JPA 복습 세션",
        totalScore: 640,
        accuracy: 50,
        finalRank: 5,
        playedAt: "2026-08-17T09:00:00",
      },
      {
        roomId: 2,
        roomTitle: "CS 모의면접 3회차",
        totalScore: 1120,
        accuracy: 80,
        finalRank: 2,
        playedAt: "2026-08-20T12:00:00",
      },
      {
        roomId: 1,
        roomTitle: "8월 4주차 Spring 스터디",
        totalScore: 990,
        accuracy: 75,
        finalRank: 3,
        playedAt: "2026-08-22T11:00:00",
      },
    ],
    weakTopics: ["JPA 영속성", "트랜잭션", "인덱스"],
  };
}

/** GET /users/me/grade — 백엔드 `HostGradeResponses.kt` 1:1 */
export function mockGrade(): GradeResponse {
  return {
    level: 3,
    levelName: "숙련",
    levelAchievedAt: "2026-08-10T09:12:00",
    roomsHosted: 24,
    totalStudents: 312,
    avgRating: 4.6,
    ratingCount: 128,
    nextLevel: 4,
    nextLevelName: "전문",
    nextRequirements: [
      { type: "ROOMS_HOSTED", label: "방 운영 횟수", current: 24, target: 40, met: false },
      { type: "TOTAL_STUDENTS", label: "누적 학생 수", current: 312, target: 400, met: false },
    ],
    // 서버는 0~1로 준다
    nextLevelProgress: 0.72,
    ratingSamplePending: false,
    maintenance: {
      windowDays: 30,
      sessionsInWindow: 12,
      requiredSessions: 4,
      avgRating: 4.6,
      requiredAvgRating: 4,
      met: true,
      nextEvaluationAt: "2026-10-03T00:00:00",
    },
    unlocked: ["프로필 뱃지", "유료 방 개설"],
    lastEvaluatedAt: "2026-09-01T03:00:00",
  };
}

const BADGE_NAME: Record<BadgeType, string> = {
  FIRST_ROOM: "첫 방 개설",
  ROOMS_10: "방 10회 운영",
  STUDENTS_100: "학생 100명",
  RATING_45: "평가 4.5+",
  RATINGS_50: "평가 50개 받기",
  ACTIVE_30D: "30일 연속 활동",
  FIRST_PAID_ROOM: "유료 방 첫 개설",
  AI_SETS_50: "AI 세트 50개",
};

const EARNED_BADGES: readonly BadgeType[] = [
  "FIRST_ROOM",
  "ROOMS_10",
  "STUDENTS_100",
  "FIRST_PAID_ROOM",
];
const ALL_BADGES: readonly BadgeType[] = [
  "FIRST_ROOM",
  "ROOMS_10",
  "STUDENTS_100",
  "RATING_45",
  "RATINGS_50",
  "ACTIVE_30D",
  "FIRST_PAID_ROOM",
  "AI_SETS_50",
];

/** GET /users/me/badges — 8종 중 4개 획득. 획득한 것 먼저, 그 안에서는 최근 획득 순 */
export function mockBadges(): BadgesResponse {
  const badges = [...ALL_BADGES]
    .sort((a, b) => Number(EARNED_BADGES.includes(b)) - Number(EARNED_BADGES.includes(a)))
    .map((code) => ({
      code,
      name: BADGE_NAME[code],
      achieved: EARNED_BADGES.includes(code),
      achievedAt: EARNED_BADGES.includes(code) ? "2026-08-10T09:12:00" : undefined,
      progress: EARNED_BADGES.includes(code) ? 1 : 0,
    }));

  return { achievedCount: EARNED_BADGES.length, totalCount: ALL_BADGES.length, badges };
}

/** GET /users/me/notification-settings */
export function mockNotificationSettings(): NotificationSettingsDto {
  return notificationSettings;
}

/** PUT /users/me/notification-settings — 서버는 바뀐 설정을 그대로 돌려준다 */
export function mockPutNotificationSettings(
  body: NotificationSettingsUpdate,
): NotificationSettingsDto {
  notificationSettings = { ...notificationSettings, ...body };
  return notificationSettings;
}

/** GET /users/{userId}/profile — 호스트 공개 프로필. 42 = DEMO_ROOM 호스트(김민지) */
export function mockHostProfile(userId: string): HostProfileResponse {
  const badge = (code: BadgeType) => ({
    code,
    name: BADGE_NAME[code],
    achieved: true,
    achievedAt: "2026-08-10T09:12:00",
    progress: 1,
  });

  if (userId === "42") {
    return {
      userId: 42,
      nickname: "김민지",
      activeSince: "2026-03-02T00:00:00",
      level: 3,
      levelName: "숙련",
      avgRating: 4.5,
      ratingCount: 312,
      roomsHosted: 24,
      totalStudents: 312,
      badgeCount: 4,
      // 공개 프로필은 획득한 뱃지만 준다
      badges: ["FIRST_ROOM", "ROOMS_10", "STUDENTS_100", "FIRST_PAID_ROOM"].map((code) =>
        badge(code as BadgeType),
      ),
      openRooms: PUBLIC_ROOMS.filter((r) => r.host.nickname === "김민지"),
    };
  }

  return {
    userId: Number(userId),
    nickname: "호스트",
    level: 1,
    levelName: "새싹",
    ratingCount: 0,
    roomsHosted: 0,
    totalStudents: 0,
    badgeCount: 0,
    badges: [],
    openRooms: [],
  };
}

/** POST /reports — 게스트 익명 신고 가능 */
export function mockReport(body: ReportRequest): ReportResponse {
  return {
    id: nextReportId++,
    targetType: body.targetType,
    targetId: body.targetId,
    type: body.type,
    reason: body.reason,
    status: "OPEN",
    createdAt: new Date().toISOString().slice(0, 19),
  };
}

let nextReportId = 1;

/** POST /guest-records/claim — 가입 후 7일 내. 목에서는 항상 한 건이 옮겨진다 */
export function mockClaim(): GuestClaimResponse {
  return {
    roomId: 1,
    roomTitle: "8월 4주차 Spring 스터디",
    participantId: 1,
    nickname: "게스트",
    totalScore: 320,
    finalRank: 3,
    claimedAt: new Date().toISOString().slice(0, 19),
  };
}
