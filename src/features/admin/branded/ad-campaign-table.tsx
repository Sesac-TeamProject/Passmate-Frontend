import { formatMonthDay, formatNumber } from "@/lib/format";
import type { AdCampaign, AdCampaignStatus, AdPlacement } from "@/lib/types/dto";
import { AdminTable, type AdminTableColumn } from "../components/admin-table";
import { StatChip } from "../components/stat-chip";
import type { Tone } from "../components/tone";

/** 시안(admin/A-06 광고 캠페인) 기준: 캠페인 열만 고정 폭, 나머지 6열 균등. */
const NAME_COL_W = 190;
const EMPTY = "—";

const PLACEMENT_LABEL: Record<AdPlacement, string> = {
  RESULT_BOTTOM: "결과 화면 하단",
  LOBBY_BANNER: "대기실 배너",
  REPORT_BOTTOM: "리포트 하단",
  HOME_CARD: "홈 카드",
};

const STATUS_CHIP: Record<AdCampaignStatus, { label: string; tone: Tone }> = {
  RUNNING: { label: "집행 중", tone: "success" },
  PENDING_REVIEW: { label: "검수 대기", tone: "warning" },
  ENDED: { label: "종료", tone: "neutral" },
};

const COLUMNS: AdminTableColumn<AdCampaign>[] = [
  {
    key: "name",
    header: "캠페인",
    width: NAME_COL_W,
    render: (c) => <p className="truncate text-label-lg text-foreground">{c.name}</p>,
  },
  {
    key: "advertiser",
    header: "광고주",
    render: (c) => <p className="text-label-md text-muted-foreground">{c.advertiser}</p>,
  },
  {
    key: "placement",
    header: "노출 위치",
    render: (c) => (
      <p className="text-label-md text-muted-foreground">{PLACEMENT_LABEL[c.placement]}</p>
    ),
  },
  {
    key: "impressions",
    header: "노출수",
    render: (c) => (
      <p className="text-label-md text-muted-foreground">
        {c.impressions === null ? EMPTY : formatNumber(c.impressions)}
      </p>
    ),
  },
  {
    key: "clickRate",
    header: "클릭률",
    render: (c) => (
      <p className="text-label-md text-muted-foreground">
        {c.clickRatePct === null ? EMPTY : `${c.clickRatePct}%`}
      </p>
    ),
  },
  {
    key: "period",
    header: "기간",
    render: (c) => (
      <p className="text-label-md text-muted-foreground">
        {formatMonthDay(c.startsOn)} ~ {formatMonthDay(c.endsOn)}
      </p>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (c) => (
      <StatChip tone={STATUS_CHIP[c.status].tone}>{STATUS_CHIP[c.status].label}</StatChip>
    ),
  },
];

type Props = { campaigns: AdCampaign[] };

/** 광고 캠페인 집행 현황 표. */
export function AdCampaignTable({ campaigns }: Props) {
  return (
    <AdminTable
      columns={COLUMNS}
      rows={campaigns}
      rowKey={(c) => c.id}
      emptyMessage="등록된 캠페인이 없습니다."
    />
  );
}
