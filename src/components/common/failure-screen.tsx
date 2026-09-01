import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Note = {
  title: string;
  detail?: string;
  /**
   * mint: 잃은 게 없다고 안심시키는 정보 (W-02e "입력한 설정은 그대로 남아 있어요")
   * plain: 사실만 나열하는 정보 (W-11e 결제 금액·수단)
   */
  tone?: "mint" | "plain";
};

type Props = {
  /**
   * 화면 위 상단바. 사이드바가 없는 흐름(방 만들기 등)에서만 넘긴다 —
   * 사이드바 안쪽 화면에 또 그리면 브랜드가 두 번 나온다.
   */
  header?: ReactNode;
  title: string;
  description: ReactNode;
  note?: Note;
  /** 되돌아갈 길. 04 보드 B 규칙 — 실패 화면에는 반드시 다음 행동이 있어야 한다 */
  actions: ReactNode;
  /** 카드 밖 아래 한 줄. 지금 당장 누를 것은 아니지만 알아야 하는 사실 */
  footnote?: string;
};

/**
 * 작업 실패 화면의 공통 뼈대 (design.pen "04 · 상태 · 오류 — 웹" 규칙 카드 B).
 *
 * W-02e 방 생성 실패 · W-11e 결제 실패 · E-401 세션 만료 · E-500 점검 중이 같은 골격을 쓴다.
 * 시안이 넷을 한 규칙으로 묶어 놨으므로 문구만 갈아 끼우게 한 곳에 둔다.
 *
 * 문구는 04 보드 세 줄 규칙을 따른다 — 무엇이 잘못됐는지 → 지금 뭘 하면 되는지 → 끝.
 * 사과·오류코드·전문용어를 넣지 않는다.
 */
export function FailureScreen({ header, title, description, note, actions, footnote }: Props) {
  return (
    <main role="alert" className="flex flex-1 flex-col">
      {header}

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-24">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-3 rounded-[20px] border bg-card px-10 py-9">
          <h1 className="text-center text-display-md text-ink">{title}</h1>
          <p className="text-center text-body-lg leading-relaxed text-muted-foreground">
            {description}
          </p>

          {note ? (
            <div
              className={cn(
                "mt-3 flex w-full flex-col gap-1 rounded-xl px-5 py-4",
                note.tone === "plain" ? "bg-muted" : "bg-mint-bg",
              )}
            >
              <p
                className={cn(
                  "text-label-lg",
                  note.tone === "plain" ? "text-ink" : "text-mint-dark",
                )}
              >
                {note.title}
              </p>
              {note.detail ? (
                <p
                  className={cn(
                    "text-label-md",
                    note.tone === "plain" ? "text-muted-foreground" : "text-mint-dark",
                  )}
                >
                  {note.detail}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex w-full items-center gap-3">{actions}</div>
        </div>

        {footnote ? <p className="text-body-lg text-muted-foreground">{footnote}</p> : null}
      </div>
    </main>
  );
}
