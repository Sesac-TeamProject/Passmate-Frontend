import { BrandLogo } from "@/components/common/brand-logo";
import { FailureScreen } from "@/components/common/failure-screen";
import { Button } from "@/components/ui/button";

type Props = {
  /**
   * 점검이 끝나는 예상 시각 문구. 예: "오늘 14:30"
   *
   * TODO(계약): 점검 정보를 주는 API가 없다 (DESIGN_GAPS G-4c). 시각을 지어내면
   * 사용자가 그 시간까지 기다리므로, 값이 없으면 줄을 통째로 감춘다.
   * 서버가 죽었을 때 부를 API라 정적 파일·CDN이 오히려 맞을 수 있다는 점도 함께 논의 중이다.
   */
  estimatedLabel?: string | null;
  onRefresh: () => void;
};

/**
 * E-500 점검 중 · 서버 오류 (design.pen "04 · 상태 · 오류 — 웹" 프레임 IGGaP).
 *
 * 04 보드 규칙: 브랜드는 유지하되 사용자가 돌아갈 길을 반드시 둔다.
 * "진행 중이던 방과 답안은 그대로 저장돼 있어요"가 이 화면의 핵심이다 —
 * 서버가 멈춘 것과 내 작업이 날아간 것은 다르다는 걸 먼저 알린다.
 */
export function MaintenanceScreen({ estimatedLabel, onRefresh }: Props) {
  return (
    <FailureScreen
      header={
        <header className="px-20 py-5">
          <BrandLogo />
        </header>
      }
      title="지금은 접속할 수 없어요"
      description="잠깐 점검 중이에요. 진행 중이던 방과 답안은 그대로 저장돼 있어요."
      note={estimatedLabel ? { tone: "plain", title: `예상 완료 · ${estimatedLabel}` } : undefined}
      actions={
        <Button size="xl" className="flex-1" onClick={onRefresh}>
          새로고침
        </Button>
      }
      footnote="진행 상황은 공지 채널에서 알려드려요"
    />
  );
}
