import { JoinedPage } from "@/features/me/joined/joined-page";
import { ACTIVE_SESSION } from "@/features/me/joined/mock";
import { LEARNING_RECORD } from "@/features/me/mock";

/** W-13 참여한 방 — 참여 기록. TODO(API): 참여 기록·진행 중 세션 조회 후 lib/queries로 교체 */
export default function Page() {
  return <JoinedPage learning={LEARNING_RECORD} activeSession={ACTIVE_SESSION} />;
}
