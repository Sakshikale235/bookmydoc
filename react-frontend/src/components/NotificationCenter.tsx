import React, { useEffect } from "react";
import { useNotifications, NotificationItem } from "@/hooks/useNotifications";

type Props = {
  authId?: string | null;
  patientId?: string | null;
};

const NotificationCard: React.FC<{ n: NotificationItem; onClose: (id: string) => void; onRead: (id: string) => void; }> = ({ n, onClose, onRead }) => {
  return (
    <div className="max-w-sm bg-white shadow rounded p-3 mb-2 border">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-semibold">{n.type ?? "Notification"}</div>
          <div className="text-sm text-gray-700">{n.message}</div>
          <div className="text-xs text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button onClick={() => onRead(n.id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Read</button>
          <button onClick={() => onClose(n.id)} className="text-xs text-gray-500 px-2 py-1" aria-label="dismiss">✕</button>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC<Props> = ({ authId, patientId }) => {
  const { notifications, markAsRead, removeLocal } = useNotifications({ authId, patientId });

  useEffect(() => {
    if (notifications.length > 0) console.debug("[NotificationCenter] notifications count", notifications.length);
  }, [notifications.length]);

  if (!authId && !patientId) return null;

  return (
    <div className="fixed top-16 right-4 z-50 w-96 pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur rounded p-3 text-sm text-gray-600 shadow">No notifications</div>
        ) : (
          notifications.map(n => (
            <NotificationCard key={n.id} n={n} onClose={removeLocal} onRead={async (id) => { await markAsRead(id); removeLocal(id); }} />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;