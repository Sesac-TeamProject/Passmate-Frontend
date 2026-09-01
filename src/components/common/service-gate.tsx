"use client";

import { MaintenanceScreen } from "@/components/common/maintenance-screen";
import { useServiceStatusStore } from "@/lib/stores/service-status-store";

/**
 * E-500 게이트. 서버가 503으로 답하면 화면을 가리지 않고 통째로 바꾼다 —
 * 앱이 못 도는 상황이라 각 화면이 따로 "불러오지 못했어요"를 띄우는 것보다,
 * 무슨 일인지와 내 작업이 남아 있다는 사실을 한 번 말하는 쪽이 맞다.
 *
 * 시안 [새로고침]대로 페이지를 다시 연다. 서버가 살아났으면 그대로 이어지고,
 * 아직이면 다시 이 화면이 뜬다.
 */
export function ServiceGate({ children }: { children: React.ReactNode }) {
  const unavailable = useServiceStatusStore((s) => s.unavailable);

  if (unavailable) {
    return (
      // TODO(계약): 예상 완료 시각을 줄 API가 없어 그 줄은 감춰 둔다 (DESIGN_GAPS G-4c).
      <MaintenanceScreen onRefresh={() => window.location.reload()} />
    );
  }

  return <>{children}</>;
}
