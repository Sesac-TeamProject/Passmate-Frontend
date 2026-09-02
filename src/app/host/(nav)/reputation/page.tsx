"use client";

import { ScreenError } from "@/components/common/screen-error";
import { ScreenLoading } from "@/components/common/screen-loading";
import {
  toAchievedLabel,
  toEarnedBadges,
  toLevelCriteria,
  toNextTitle,
} from "@/features/host/reputation/adapt";
import { ReputationPage } from "@/features/host/reputation/reputation-page";
import { useBadges, useGrade } from "@/lib/queries/use-me";

/** 유지 조건 안내 — 계약에 문구가 없어 화면 상수로 둔다 (시안 813:8880) */
const MAINTAIN_NOTE = "별점 4.0과 월 4회 활동은 Lv.4·5의 유지 조건이에요";

/** W-14 명성 · 뱃지 상세 컨테이너 — 등급과 뱃지를 읽어 화면 뷰 타입으로 바꾼다 */
export default function Page() {
  const grade = useGrade();
  const badges = useBadges();

  if (grade.isPending) return <ScreenLoading />;
  if (grade.isError)
    return <ScreenError message={grade.error.message} onRetry={() => grade.refetch()} />;

  const level = grade.data?.level ?? 1;
  const nextLevel = grade.data?.next?.level ?? Math.min(5, level + 1);

  return (
    <ReputationPage
      currentLevel={level}
      progress={grade.data?.next?.progressPercent ?? 0}
      achievedLabel={toAchievedLabel(grade.data)}
      nextLevel={nextLevel}
      nextTitle={toNextTitle(grade.data)}
      criteria={toLevelCriteria(grade.data)}
      // 뱃지 조회가 실패해도 레벨 사다리는 보여준다 — 컬렉션만 전부 잠김으로 접힌다
      note={level >= 3 ? MAINTAIN_NOTE : null}
      earnedBadges={toEarnedBadges(badges.data?.items)}
    />
  );
}
