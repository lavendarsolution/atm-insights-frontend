import * as React from "react";

import type { NotificationActionElement, NotificationProps } from "@/components/ui/notification";

const NOTIFICATION_LIMIT = 1;
const NOTIFICATION_REMOVE_DELAY = 6000;

type NotifierNotification = NotificationProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: NotificationActionElement;
};

const actionTypes = {
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  UPDATE_NOTIFICATION: "UPDATE_NOTIFICATION",
  DISMISS_NOTIFICATION: "DISMISS_NOTIFICATION",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_NOTIFICATION"];
      notification: NotifierNotification;
    }
  | {
      type: ActionType["UPDATE_NOTIFICATION"];
      notification: Partial<NotifierNotification>;
    }
  | {
      type: ActionType["DISMISS_NOTIFICATION"];
      notificationId?: NotifierNotification["id"];
    }
  | {
      type: ActionType["REMOVE_NOTIFICATION"];
      notificationId?: NotifierNotification["id"];
    };

interface State {
  notifications: NotifierNotification[];
}

const notificationTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (notificationId: string) => {
  if (notificationTimeouts.has(notificationId)) {
    return;
  }

  const timeout = setTimeout(() => {
    notificationTimeouts.delete(notificationId);
    dispatch({
      type: "REMOVE_NOTIFICATION",
      notificationId: notificationId,
    });
  }, NOTIFICATION_REMOVE_DELAY);

  notificationTimeouts.set(notificationId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications].slice(0, NOTIFICATION_LIMIT),
      };

    case "UPDATE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.notification.id ? { ...n, ...action.notification } : n)),
      };

    case "DISMISS_NOTIFICATION": {
      const { notificationId } = action;

      // ! Side effects ! - This could be extracted into a dismissNotification() action,
      // but I'll keep it here for simplicity
      if (notificationId) {
        addToRemoveQueue(notificationId);
      } else {
        state.notifications.forEach((notification) => {
          addToRemoveQueue(notification.id);
        });
      }

      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === notificationId || notificationId === undefined
            ? {
                ...n,
                open: false,
              }
            : n
        ),
      };
    }
    case "REMOVE_NOTIFICATION":
      if (action.notificationId === undefined) {
        return {
          ...state,
          notifications: [],
        };
      }
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.notificationId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { notifications: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Notification = Omit<NotifierNotification, "id">;

function notification({ ...props }: Notification) {
  const id = genId();

  const update = (props: NotifierNotification) =>
    dispatch({
      type: "UPDATE_NOTIFICATION",
      notification: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_NOTIFICATION", notificationId: id });

  dispatch({
    type: "ADD_NOTIFICATION",
    notification: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useNotification() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    notification,
    dismiss: (notificationId?: string) => dispatch({ type: "DISMISS_NOTIFICATION", notificationId }),
  };
}

export { useNotification, notification };
