"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { Button } from "@/components/ui/button";
import { canRequestAnalysis, toQuestionDetail } from "@/features/participant/result/adapt";
import { QuestionDetailPage } from "@/features/participant/result/question-detail-page";
import { useQuestionResult } from "@/lib/queries/use-session-control";
import {
  toAnalysisErrorMessage,
  useMyAnswer,
  useMyResult,
  useRequestEssayAnalysis,
} from "@/lib/queries/use-results";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * P-Web 리포트 — 문항 상세 컨테이너.
 *
 * 문항 목록은 개인 결과에서(문항 번호 → questionId), 그 문항의 답안·AI 분석은
 * `GET …/answers/me`에서 읽는다. 분석은 **회원이 직접 요청**하고(202) 완료 알림이 없어
 * `PENDING`인 동안 훅이 폴링한다.
 */
export default function Page() {
  const params = useParams<{ sessionId: string; questionNo: string }>();
  const roomId = Number(params.sessionId);
  const no = Number(params.questionNo);
  const isMember = useAuthStore((s) => s.status) === "authenticated";

  const result = useMyResult(Number.isFinite(roomId) ? roomId : null);
  const questions = result.data?.questions ?? [];
  const target = questions.find((q) => q.orderNo === no) ?? null;

  const answer = useMyAnswer(roomId, target?.questionId ?? null);
  // 보기별 분포는 마감된 문항에만 있다 — 실패하면 그 구역만 비워진다
  const questionResult = useQuestionResult(roomId, target?.questionId ?? null);
  const requestAnalysis = useRequestEssayAnalysis(roomId, target?.questionId ?? 0);

  const backHref = `/result/${params.sessionId}/report`;
  /**
   * 폰 폭은 공용 상단바가 걷혀 있다(레이아웃) — 상태 화면이 스스로 "← 리포트"와 버튼을 그리지 않으면
   * 브라우저 뒤로가기 말고는 나갈 길이 없다.
   */
  const mobileFailure = {
    screenTitle: "리포트",
    backHref,
    homeHref: isMember ? "/home" : "/",
  };

  if (result.isPending) return <ScreenLoading />;
  if (result.isError)
    return (
      <ScreenError
        message={result.error.message}
        onRetry={() => result.refetch()}
        mobile={{
          ...mobileFailure,
          title: "문항을 불러오지 못했어요",
          description: "잠시 후 다시 시도해 주세요.",
        }}
      />
    );

  // 없는 문항 번호로 들어온 경우 — 04 보드 문구 규칙대로 돌아갈 길을 함께 준다
  if (target === null)
    return (
      <ScreenError
        message="그런 문항이 없어요. 리포트에서 다시 골라 주세요"
        mobile={{
          ...mobileFailure,
          title: "그런 문항이 없어요",
          description: "리포트에서 문항을 다시 골라 주세요.",
        }}
      >
        <Button variant="outline" nativeButton={false} render={<Link href={backHref} />}>
          리포트로 돌아가기
        </Button>
      </ScreenError>
    );

  if (answer.isPending) return <ScreenLoading />;
  if (answer.isError)
    return (
      <ScreenError
        message={answer.error.message}
        onRetry={() => answer.refetch()}
        mobile={{
          ...mobileFailure,
          title: "답안을 불러오지 못했어요",
          description: "잠시 후 다시 시도해 주세요. 제출한 답안은 이미 저장돼 사라지지 않아요.",
        }}
      />
    );

  const detail = toQuestionDetail(answer.data, questions.length, questionResult.data);
  const hasPrev = questions.some((q) => q.orderNo === no - 1);
  const hasNext = questions.some((q) => q.orderNo === no + 1);

  const canRequest = canRequestAnalysis(answer.data.type, isMember, answer.data.analysisStatus);

  return (
    <QuestionDetailPage
      detail={detail}
      backHref={backHref}
      prevHref={hasPrev ? `${backHref}/${no - 1}` : null}
      nextHref={hasNext ? `${backHref}/${no + 1}` : null}
      analysisRequest={
        canRequest
          ? {
              onRequest: () => requestAnalysis.mutate(),
              pending: requestAnalysis.isPending,
              remainingFree: answer.data.remainingFreeAnalysis ?? null,
              freeLimit: answer.data.freeAnalysisLimit,
              coinCost: answer.data.analysisCoinCost,
              errorMessage: requestAnalysis.isError
                ? toAnalysisErrorMessage(requestAnalysis.error)
                : null,
            }
          : null
      }
    />
  );
}
