# 백엔드 전달 사항 — 2026-09-06 (시안 대조)

프런트에서 화면을 시안과 하나씩 대조하면서 나온 것 중 **프런트만으로 끝낼 수 없는 것**만 모았습니다.
번호는 `QA_BACKLOG.md`의 B 번호와 같습니다. 오늘 대조가 끝날 때까지 계속 추가됩니다.

- 확인 환경: 로컬 백엔드 `http://localhost:8080` (`/v3/api-docs` 실물 대조), 프런트 `develop` + `feature/design-fix-local`
- 마지막 갱신: 2026-09-06

## 요약

| 번호 | 한 줄                                                                                | 급함    | 프런트 현재 처리                        | 상태      |
| ---- | ------------------------------------------------------------------------------------ | ------- | --------------------------------------- | --------- |
| B-18 | 확정 세트라 "문항별 시간 설정"이 **어떤 방에서도** 저장되지 않는다                   | 🔴 높음 | 확정 세트면 화면을 읽기 전용으로 잠갔다 | 답변 대기 |
| B-19 | 자동 넘김(`autoAdvance`)을 담을 필드가 계약에 없다                                   | 🟡 보통 | 토글을 잠가 뒀다                        | 답변 대기 |
| B-20 | 학생 리포트가 시안의 절반을 못 그린다 — 소요 시간·개념·반 정답률·비교/추이 값이 없다 | 🔴 높음 | 값이 없는 칸과 카드는 감춘다            | 답변 대기 |

---

## 🔴 B-18. 확정 세트라 "문항별 시간 설정"이 어떤 방에서도 저장되지 않는다

**현상**
호스트가 대기실 → `문항별 시간 설정`(W-02b)에서 제한 시간을 바꾸고 저장하면 409
`QUESTION_SET_ALREADY_CONFIRMED`로 막힙니다. 특정 방의 문제가 아니라 **모든 방에서** 그렇습니다.

**원인 (계약끼리 맞물려 막힙니다)**

1. 방에 붙일 수 있는 세트는 **확정(CONFIRMED)된 것뿐**입니다 — 방 생성 화면과 대기실의 세트 연결이
   둘 다 `GET /question-sets?status=CONFIRMED`만 읽습니다. `POST /rooms/{roomId}/session/start`
   설명도 "**확정 세트**의 문항을 복사해 두고 1번 문항을 연다"입니다.
2. 그런데 확정 세트의 문항은 `PUT /question-sets/{setId}/questions/{questionId}`가
   409 `QUESTION_SET_ALREADY_CONFIRMED`로 막습니다(확정 후 불변).

⇒ 방에 붙은 세트는 정의상 확정 세트이므로, 이 화면은 **구조적으로 저장이 불가능**합니다.

**확인 방법**
확정 세트가 붙은 방에서 `/host/rooms/{PIN}/timing` → 시간 변경 → 저장 → 409.

**프런트 현재 처리**
편집시키고 저장에서 튕기는 대신, 확정 세트면 **들어오자마자 읽기 전용**으로 두고 이유를 보입니다
(프리셋·일괄 적용·스테퍼·저장 전부 잠금).

**요청 — 둘 중 하나로 정해 주세요**

- (a) 확정 세트라도 **`timeLimitSec`만은** 수정 허용
  (`PUT /question-sets/{setId}/questions/{questionId}`에서 시간 필드만 예외)
- (b) **방 단위 시간 오버라이드** API 신설 (예: `PUT /rooms/{roomId}/question-times`)
  — 세트는 그대로 두고 이 방에서만 시간을 바꾸는 방식. 세션 시작 때 복사되는 값에 반영 필요

**정해지면 프런트가 할 일**
읽기 전용을 풀고 정해진 경로로 저장합니다. (b)면 화면이 방 기준으로 읽고 쓰도록 바꿉니다.

---

## 🟡 B-19. 자동 넘김(`autoAdvance`)을 담을 필드가 계약에 없다

**현상**
시안 W-02b에는 문항마다 "자동 넘김" 토글이 있는데, 저장할 곳이 없습니다.

**근거 (2026-09-06 `/v3/api-docs` 확인)**
`QuestionRequest`·`QuestionResponse` 어디에도 해당 필드가 없습니다.

```
QuestionRequest  -> type, content, choices, answer, explanation, topic, difficulty, timeLimitSec, points
QuestionResponse -> id, orderNo, type, content, choices, answer, explanation, topic, difficulty, timeLimitSec, points, source
```

**프런트 현재 처리**
토글을 **잠가 둡니다**. 켜지는 것처럼 두면 "설정했는데 안 먹는다"가 되기 때문입니다.

**요청**
문항에 `autoAdvance`(boolean) 필드를 추가할지 정해 주세요. 넣는다면 `QuestionRequest`·
`QuestionResponse` 양쪽에 필요합니다. "이 값은 서버가 안 갖는다"로 정해도 됩니다 — 그러면 프런트는
토글을 화면에서 걷어냅니다.

**정해지면 프런트가 할 일**
잠금을 풀고 `PUT …/questions/{questionId}` 본문에 함께 싣습니다. 안 넣기로 하면 열을 지웁니다.

---

## 🔴 B-20. 학생 리포트(P-Web `/result/{roomId}/report`)가 시안의 절반을 못 그린다

**현상**
시안에는 요약 KPI 4개 + 분석 카드 3장 + 문항표 8열이 있는데, 지금 화면은 다음이 비어 있습니다.
프런트는 값을 지어내지 않고 그 자리를 감추거나 `—`로 둡니다.

| 시안 자리                  | 필요한 값                   | 지금 계약 | 프런트 현재      |
| -------------------------- | --------------------------- | --------- | ---------------- |
| 요약 "소요 시간 11분 40초" | 내가 푸는 데 걸린 시간      | 없음      | `—`              |
| 요약 "3위 / 24명"          | 참가자 수                   | 없음      | 순위만           |
| 카드 "반 평균과 비교"      | 반 평균 정답률 · 1위 정답률 | 없음\*    | 카드 감춤        |
| 카드 "이 방에서 나의 추이" | 같은 방 회차별 내 정답률    | 없음      | 카드 감춤        |
| 카드 "개념별 정답률"       | 개념(주제)별 맞은/전체      | 없음      | 카드 감춤        |
| 표 "개념" 열               | 문항의 주제                 | 없음      | 빈칸             |
| 표 "반 정답률" 열          | 문항별 반 정답률            | 없음\*    | `—`              |
| 표 "소요" 열               | 문항별 내 소요 시간         | 없음      | `—`              |
| 버튼 "OO 복습 방 찾기"     | 약한 주제 이름              | 있음      | 주제가 비면 감춤 |

\* 값 자체는 `GET /rooms/{roomId}/results`(요약 `avgCorrectRate`, 문항별 `correctRate`)에 있지만
**호스트 전용**입니다("학생별 점수가 통째로 나가므로 호스트만"). 학생이 부를 수 있는 통로가 없습니다.

**근거 (2026-09-06 `/v3/api-docs`)**

- `GET /rooms/{roomId}/results/me` → `MySessionResultResponse`:
  `rank, totalScore, correctCount, submitCount, questionCount, questions[], rating` —
  **소요 시간·참가자 수 없음**
- 문항 한 건 `AnswerResultView`:
  `sessionQuestionId, questionId, orderNo, type, content, points, answer, explanation, submitted,
isCorrect, score, finalScore, analysisStatus, analysis, teacherReview` —
  **주제(topic)·반 정답률·제출 시각/소요 시간 없음**
- `GET /rooms/{roomId}/reports/me` → `LearningReportResponse`:
  `accuracy, totalScore, finalRank, weakTopics[], improvementPoints[]` —
  **개념별 비율·반 평균·회차 추이 없음**(`weakTopics`는 주제 이름만)

**요청 — 우선순위 순으로 나눠 주셔도 됩니다**

1. (가장 값이 큼) `AnswerResultView`에 **`topic`**, **`correctRate`**(그 문항의 반 정답률),
   **`elapsedMs` 또는 `submittedAt`** 추가 → 표의 개념·반 정답률·소요 3열이 한 번에 채워집니다.
2. `MySessionResultResponse`에 **`elapsedMs`**(내 총 소요)와 **`participantCount`** 추가
   → 요약 KPI "소요 시간"과 "3위 / 24명"이 채워집니다.
3. `LearningReportResponse`에 **`classAvgAccuracy`·`topAccuracy`**, **`topicAccuracy[]`**
   (주제별 맞은 수/전체 수) 추가 → "반 평균과 비교"·"개념별 정답률" 카드가 살아납니다.
4. "이 방에서 나의 추이"는 **같은 방을 여러 번 참여한다는 개념**이 서버에 있는지부터 알려주세요.
   없다면 이 카드는 시안에서 빼는 게 맞습니다(프런트에서 지웁니다).

**정해지면 프런트가 할 일**
`toReportRows`가 지금 `concept: ""`·`classAccuracyPercent: null`·`elapsedSeconds: null`로
비워 두는 자리에 값을 꽂고, 컨테이너가 `null`로 넘기는 `comparison`·`trend`·`concepts`·
`participantCount`·`elapsedSeconds`를 채웁니다. 화면은 이미 값이 오면 그리도록 만들어져 있습니다.
