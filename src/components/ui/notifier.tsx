import { useNotification } from "@/hooks/use-notification";

import {
  Notification,
  NotificationClose,
  NotificationDescription,
  NotificationProvider,
  NotificationTitle,
  NotificationViewport,
} from "@/components/ui/notification";

export function Notifier() {
  const { notifications } = useNotification();

  return (
    <NotificationProvider>
      {notifications.map(function ({ id, title, description, action, ...props }) {
        return (
          <Notification key={id} {...props}>
            <div className="grid gap-1">
              {title && <NotificationTitle>{title}</NotificationTitle>}
              {description && <NotificationDescription>{description}</NotificationDescription>}
            </div>
            {action}
            <NotificationClose />
          </Notification>
        );
      })}
      <NotificationViewport />
    </NotificationProvider>
  );
}
