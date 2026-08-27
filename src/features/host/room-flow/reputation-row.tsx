import { LevelEmblem } from "@/features/me/level-emblem";

type Props = {
  level: number;
  title: string;
  /** 유료 방 개설에 필요한 최소 레벨 */
  minLevel: number;
};

/** W-02 v2 명성 조건 — 레벨 뱃지 + 유료 방 개설 가능 여부 안내 */
export function ReputationRow({ level, title, minLevel }: Props) {
  const eligible = level >= minLevel;
  return (
    <div className="flex w-full items-center gap-2.5">
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#c4eedb] py-1 pr-2.5 pl-[5px]">
        <LevelEmblem size={14} />
        <span className="text-label-lg text-[#0b6b4c]">
          Lv.{level} {title}
        </span>
      </span>
      <p className="min-w-0 flex-1 text-label-lg text-[#338158]">
        {eligible
          ? `유료 방 개설 가능 — Lv.${minLevel} 이상 조건 충족. Lv.${minLevel - 1} 이하는 이 옵션이 잠겨 있어요`
          : `유료 방은 Lv.${minLevel}부터 열 수 있어요 — 현재 Lv.${level}. 방을 더 운영하면 레벨이 올라가요`}
      </p>
    </div>
  );
}
