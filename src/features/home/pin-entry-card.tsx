import { JoinForm, type JoinValues } from "@/features/participant/join/join-form";

type Props = {
  values: JoinValues;
  onChange: (next: JoinValues) => void;
  onSubmit: () => void;
  pending?: boolean;
};

/** 홈 PIN 입장 카드 (W-01 v6) — r20 · padding [24,40] · 내부 폭 360 가운데 */
export function PinEntryCard({ values, onChange, onSubmit, pending }: Props) {
  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-[20px] border bg-card px-10 py-6">
      <h2 className="text-center text-heading-lg text-ink">PIN으로 입장</h2>
      <p className="text-center text-body-md text-muted-foreground">
        선생님이 알려준 6자리 PIN을 입력하면 바로 방에 들어가요
      </p>
      <JoinForm
        variant="home"
        values={values}
        onChange={onChange}
        onSubmit={onSubmit}
        pending={pending}
        className="w-[360px]"
      />
    </section>
  );
}
