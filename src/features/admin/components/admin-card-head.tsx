type Props = {
  title: string;
  /** 제목 오른쪽에 붙는 회색 보조 문구. 예: "최근 14일" */
  hint?: string;
  children?: React.ReactNode;
};

/** 카드 상단 제목 줄. 오른쪽 끝에 놓을 요소는 children으로 넘긴다. */
export function AdminCardHead({ title, hint, children }: Props) {
  return (
    <div className="flex w-full items-center gap-2">
      <h2 className="text-label-lg text-foreground">{title}</h2>
      {hint ? <p className="text-label-md text-muted-foreground">{hint}</p> : null}
      {children ? <div className="ml-auto">{children}</div> : null}
    </div>
  );
}
