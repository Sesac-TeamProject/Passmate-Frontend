import type {
  BadgesResponse,
  BadgeType,
  GradeResponse,
  HostProfileResponse,
  MyPageResponse,
  MyProfileResponse,
  NotificationSettingsDto,
  UserProfileUpdateRequest,
} from "@/lib/types/dto";
import { DEMO_PIN, DEMO_ROOM_ID, ME_PROFILE, PUBLIC_ROOMS } from "./fixtures";

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

/** GET /users/me/rooms/joined — 요약+진행 중+참여 방. features/me/joined/mock.ts ACTIVE_SESSION */
export function mockMyPage(): MyPageResponse {
  return {
    summary: {
      participationCount: 3,
      accuracyPercent: 71,
      avgRank: 3.3,
      trendText: null,
      weakTopics: ["JPA 영속성", "트랜잭션", "인덱스"],
    },
    ongoing: {
      roomId: DEMO_ROOM_ID,
      pin: DEMO_PIN,
      title: "Spring 실전 모의고사 4주차",
      hostNickname: "김선생",
      progressLabel: "3/8",
    },
    rooms: [
      {
        roomId: 1,
        title: "8월 4주차 Spring 스터디",
        dateLabel: "8/22 (금)",
        questionCount: 8,
        myScore: 990,
        myRank: 3,
        hasReport: true,
      },
      {
        roomId: 2,
        title: "CS 모의면접 3회차",
        dateLabel: "8/20 (수)",
        questionCount: 10,
        myScore: 1120,
        myRank: 2,
        hasReport: true,
      },
      {
        roomId: 3,
        title: "JPA 복습 세션",
        dateLabel: "8/17 (일)",
        questionCount: 6,
        myScore: 640,
        myRank: 5,
        hasReport: true,
      },
    ],
    nextCursor: null,
  };
}

/** GET /users/me/grade — features/host/my-rooms/mock.ts LEVEL_STATUS·PROMOTION */
export function mockGrade(): GradeResponse {
  return {
    level: 3,
    achievedAt: "2026-08-10",
    stats: {
      participationCount: 24,
      avgAccuracyPercent: null,
      roomCount: 24,
      totalStudents: 312,
      avgStars: 4.6,
      ratingCount: undefined,
    },
    next: {
      level: 4,
      progressPercent: 72,
      criteria: [
        { label: "방 운영 횟수 40회 이상", current: 24, target: 40, met: false },
        { label: "총 학생 400명 이상", current: 312, target: 400, met: false },
        { label: "평균 별점 4.0 이상 (유지 조건)", current: 4.6, target: 4, met: true },
        { label: "최근 30일 활동 4회 이상 (유지 조건)", current: 12, target: 4, met: true },
      ],
    },
  };
}

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
  "STREAK_30",
  "FIRST_PAID_ROOM",
  "AI_SETS_50",
];

/** GET /users/me/badges — 8종 중 4개 획득(features/me/mock.ts HOST_RECORD.badges 기준) */
export function mockBadges(): BadgesResponse {
  return {
    items: ALL_BADGES.map((type) => ({
      type,
      earned: EARNED_BADGES.includes(type),
      earnedAt: null,
      progressCurrent: null,
      progressTarget: null,
    })),
  };
}

/** GET /users/me/notification-settings */
export function mockNotificationSettings(): NotificationSettingsDto {
  return notificationSettings;
}

/** PUT /users/me/notification-settings */
export function mockPutNotificationSettings(
  body: NotificationSettingsDto,
): NotificationSettingsDto {
  notificationSettings = { ...notificationSettings, ...body };
  return notificationSettings;
}

/** GET /users/{userId}/profile — 호스트 공개 프로필. 42 = DEMO_ROOM 호스트(김민지) */
export function mockHostProfile(userId: string): HostProfileResponse {
  if (userId === "42") {
    return {
      userId: 42,
      nickname: "김민지",
      intro: "백엔드 실전 모의고사를 진행합니다.",
      level: 3,
      avgStars: 4.5,
      ratingCount: 312,
      roomCount: 24,
      totalStudents: 312,
      badges: ["FIRST_ROOM", "ROOMS_10", "STUDENTS_100", "FIRST_PAID_ROOM"],
      rooms: PUBLIC_ROOMS.filter((r) => r.host.nickname === "김민지").map((r) => ({
        roomId: r.id,
        title: r.title,
        topic: r.topic ?? null,
        status: r.status,
        participantCount: r.participantCount,
        scheduledAt: r.scheduledAt ?? null,
        isPaid: r.type === "PAID",
        entryFee: r.fee ?? null,
      })),
    };
  }

  return {
    userId: Number(userId),
    nickname: "호스트",
    intro: null,
    level: 1,
    avgStars: null,
    ratingCount: 0,
    roomCount: 0,
    totalStudents: 0,
    badges: [],
    rooms: [],
  };
}

/** POST /reports — 게스트 익명 신고 가능 */
export function mockReport(): undefined {
  return undefined;
}

/** POST /guest-records/claim — 가입 후 7일 내. 목에서는 항상 성공한다 */
export function mockClaim(): undefined {
  return undefined;
}
