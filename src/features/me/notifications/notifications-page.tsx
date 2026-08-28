import { Switch } from "@/components/ui/switch";
import type { NotificationKey, NotificationSetting } from "@/features/me/notifications/mock";
import { MeFormPage } from "@/features/me/settings/me-form-page";
import { SettingsList, SettingsRow } from "@/features/me/settings/settings-list";

type Props = {
  settings: NotificationSetting[];
  onToggle: (key: NotificationKey, enabled: boolean) => void;
};

/** C-02-10 알림 설정 — 4행 토글(44×24) · 안내 */
export function NotificationsPage({ settings, onToggle }: Props) {
  return (
    <MeFormPage title="알림 설정">
      <SettingsList>
        {settings.map((setting) => (
          <SettingsRow
            key={setting.key}
            title={setting.title}
            description={setting.description}
            action={
              <Switch
                aria-label={setting.title}
                checked={setting.enabled}
                onCheckedChange={(checked) => onToggle(setting.key, checked)}
                // 시안 44×24 · 노브 20 흰색 (shadcn 기본 32×18.4 덮어쓰기)
                className="px-px data-[size=default]:h-6 data-[size=default]:w-11 [&_span[data-slot=switch-thumb]]:size-5 [&_span[data-slot=switch-thumb][data-checked]]:translate-x-5"
              />
            }
          />
        ))}
      </SettingsList>

      <p className="text-label-md text-muted-foreground">
        이메일 알림은 가입한 주소로 가요. 브라우저 알림은 처음 켤 때 허용을 눌러주세요.
      </p>
    </MeFormPage>
  );
}
