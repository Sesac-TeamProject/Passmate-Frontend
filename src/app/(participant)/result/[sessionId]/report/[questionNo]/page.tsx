"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import { toQuestionDetail } from "@/features/participant/result/adapt";
import { QuestionDetailPage } from "@/features/participant/result/question-detail-page";
import { Button } from "@/components/ui/button";
import { useMyResult } from "@/lib/queries/use-results";

/**
 * P-Web 리포트 — 문항 상세 컨테이너.
 * 리포트(M-06)의 문항 행에서 들어온다. 데이터는 리포트와 같은 개인 결과 조회를 쓴다 —
 * 문항 하나만 주는 계약이 따로 없고, 리포트를 거쳐 오므로 캐시가 이미 데워져 있다.
 */
export default function Page() {
  const params = useParams<{ sessionId: string; questionNo: string }>();
  const roomId = Number(params.sessionId);
  const no = Number(params.questionNo);

  const result = useMyResult(Number.isFinite(roomId) ? roomId : null);

  const backHref = `/result/${params.sessionId}/report`;

  if (result.isPending) return <ScreenLoading />;
  if (result.isError)
    return <ScreenError message={result.error.message} onRetry={() => result.refetch()} />;

  const questions = result.data.questions ?? [];
  const detail = Number.isFinite(no) ? toQuestionDetail(questions, no) : null;

  // 없는 문항 번호로 들어온 경우 — 04 보드 문구 규칙대로 돌아갈 길을 함께 준다
  if (detail === null)
    return (
      <ScreenError message="그런 문항이 없어요. 리포트에서 다시 골라 주세요">
        <Button variant="outline" nativeButton={false} render={<Link href={backHref} />}>
          리포트로 돌아가기
        </Button>
      </ScreenError>
    );

  const hasPrev = questions.some((q) => q.questionNo === no - 1);
  const hasNext = questions.some((q) => q.questionNo === no + 1);

  return (
    <QuestionDetailPage
      detail={detail}
      backHref={backHref}
      prevHref={hasPrev ? `${backHref}/${no - 1}` : null}
      nextHref={hasNext ? `${backHref}/${no + 1}` : null}
    />
  );
}
