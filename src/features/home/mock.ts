// 홈(W-01 v6) 화면 확인용 목업. 데이터 연동 시 lib/queries로 대체한다 — TODO(API)

export type RoomFeeType = "free" | "paid";

/** 인기 방 카드 (홈 캐러셀 · /rooms 공개 목록 공용) */
export type PopularRoom = {
  code: string;
  /** 주제 칩. 예: "백엔드" */
  topic: string;
  type: RoomFeeType;
  title: string;
  /** 선생님 이름 */
  host: string;
  /** 선생님 명성 레벨 */
  level: number;
  /** 현재 참여 중인 인원 */
  participants: number;
};

/** 캐러셀 한 페이지에 보이는 카드 수 */
export const POPULAR_PAGE_SIZE = 3;

export const POPULAR_ROOMS: PopularRoom[] = [
  {
    code: "482913",
    topic: "백엔드",
    type: "paid",
    title: "Spring 실전 모의고사 4주차",
    host: "김민지",
    level: 3,
    participants: 24,
  },
  {
    code: "CS0002",
    topic: "CS 면접",
    type: "free",
    title: "CS 기술면접 라운드 2",
    host: "박세라",
    level: 4,
    participants: 18,
  },
  {
    code: "NET001",
    topic: "네트워크",
    type: "free",
    title: "네트워크 한 번에 정리",
    host: "정우진",
    level: 2,
    participants: 9,
  },
  {
    code: "JPA003",
    topic: "백엔드",
    type: "free",
    title: "JPA 영속성 컨텍스트 뽀개기",
    host: "이서준",
    level: 3,
    participants: 15,
  },
  {
    code: "DB0004",
    topic: "데이터베이스",
    type: "paid",
    title: "인덱스와 실행 계획 실전",
    host: "최유나",
    level: 5,
    participants: 31,
  },
  {
    code: "OS0005",
    topic: "CS 면접",
    type: "free",
    title: "운영체제 핵심 30문항",
    host: "한지훈",
    level: 2,
    participants: 12,
  },
  {
    code: "ALG006",
    topic: "알고리즘",
    type: "free",
    title: "코딩테스트 개념 점검",
    host: "오다은",
    level: 3,
    participants: 27,
  },
  {
    code: "SEC007",
    topic: "보안",
    type: "paid",
    title: "웹 보안 취약점 라운드 1",
    host: "김민지",
    level: 3,
    participants: 8,
  },
  {
    code: "FE0008",
    topic: "프론트엔드",
    type: "free",
    title: "React 렌더링 원리 퀴즈",
    host: "장하늘",
    level: 4,
    participants: 22,
  },
  {
    code: "DEV009",
    topic: "DevOps",
    type: "free",
    title: "Docker · K8s 기초 다지기",
    host: "박세라",
    level: 4,
    participants: 14,
  },
  {
    code: "JAV010",
    topic: "백엔드",
    type: "free",
    title: "Java 컬렉션 한 방 정리",
    host: "정우진",
    level: 2,
    participants: 11,
  },
  {
    code: "SYS011",
    topic: "CS 면접",
    type: "paid",
    title: "시스템 디자인 첫걸음",
    host: "최유나",
    level: 5,
    participants: 19,
  },
];
