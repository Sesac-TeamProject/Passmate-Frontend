import { ACCOUNT } from "@/features/me/mock";
import { DASHBOARD_STATS, PAST_SESSIONS, QUESTION_SETS } from "@/features/teacher/mock";
import { QuestionSetCards } from "./question-set-cards";
import { RecentSessions } from "./recent-sessions";
import { StatCards } from "./stat-cards";
import { WelcomeBanner } from "./welcome-banner";

/** W-01 대시보드. 목업 데이터를 조립해 렌더한다. */
export function TeacherDashboard() {
  return (
    <main className="flex flex-col gap-6 px-9 py-7">
      <WelcomeBanner name={ACCOUNT.name.slice(1)} createHref="/teacher/rooms/new" />
      <StatCards stats={DASHBOARD_STATS} />
      <QuestionSetCards sets={QUESTION_SETS.slice(0, 3)} allHref="/teacher/sets" />
      <RecentSessions
        sessions={PAST_SESSIONS}
        allHref="/teacher/sessions/1/review"
        reportHref={(s) => `/teacher/sessions/${s.id}/review`}
      />
    </main>
  );
}
