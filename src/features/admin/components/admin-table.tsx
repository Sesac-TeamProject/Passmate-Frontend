import { cn } from "@/lib/utils";

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  /** px 고정 폭. 없으면 남는 폭을 다른 유동 열과 균등 분배 */
  width?: number;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage: string;
  /** 가로 스크롤이 생기기 시작하는 최소 폭 */
  minWidth?: number;
};

const DEFAULT_MIN_WIDTH = 820;

/**
 * 관리자 화면 공용 표 (A-02 사용자 목록, A-03 방 목록·검수 큐 …).
 * 시안대로 모든 셀을 가운데 정렬하고 짝수 행에 옅은 배경을 깐다.
 * 시안의 헤더 셀은 좌측이지만 그러면 열이 어긋나 보여 헤더도 가운데로 맞췄다.
 */
export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage,
  minWidth = DEFAULT_MIN_WIDTH,
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <p className="w-full py-10 text-center text-label-md text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth }}>
        <div className="flex w-full items-center border-b border-border pt-2 pb-[9px]">
          {columns.map((c) => (
            <div key={c.key} className={cellClass(c.width)} style={cellStyle(c.width)}>
              <p className="text-label-lg text-muted-foreground">{c.header}</p>
            </div>
          ))}
        </div>

        {rows.map((row, i) => (
          <div
            key={rowKey(row)}
            className={cn(
              "flex w-full items-center border-b border-border py-[11px]",
              i % 2 === 1 && "bg-muted",
            )}
          >
            {columns.map((c) => (
              <div key={c.key} className={cellClass(c.width)} style={cellStyle(c.width)}>
                {c.render(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function cellClass(width?: number): string {
  return width === undefined
    ? "flex min-w-0 flex-1 justify-center px-2"
    : "flex shrink-0 justify-center px-3";
}

function cellStyle(width?: number): React.CSSProperties | undefined {
  return width === undefined ? undefined : { width };
}
