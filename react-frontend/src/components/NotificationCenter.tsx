import React, { useEffect, useRef } from "react";
import { useNotifications, NotificationItem } from "@/hooks/useNotifications";

type Props = {
  authId?: string | null;
  patientId?: string | null;
  open?: boolean;
  onRequestClose?: () => void;
};

const playTing = (ctxRef: React.MutableRefObject<AudioContext | null>) => {
  try {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = ctxRef.current!;
    // resume if autoplay policy suspended
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    const gain = ctx.createGain();
    // increase peak volume for a louder "tinggg"
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.003); // higher peak
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38); // slightly longer decay

    const o1 = ctx.createOscillator();
    o1.type = "sine";
    o1.frequency.setValueAtTime(1500, now);

    const o2 = ctx.createOscillator();
    o2.type = "triangle";
    o2.frequency.setValueAtTime(2600, now); // slightly brighter second harmonic

    o1.connect(gain);
    o2.connect(gain);
    gain.connect(ctx.destination);

    o1.start(now);
    o2.start(now);
    o1.stop(now + 0.38);
    o2.stop(now + 0.38);

    // cleanup shortly after stop
    setTimeout(() => {
      try {
        o1.disconnect();
        o2.disconnect();
        gain.disconnect();
      } catch (e) {}
    }, 500);
  } catch (e) {
    // ignore audio errors
  }
};

const NotificationCard: React.FC<{
  n: NotificationItem;
  onClose: (id: string) => void;
  onRead: (id: string) => void;
}> = ({ n, onClose, onRead }) => {
  return (
    <div className="max-w-md bg-white shadow rounded p-3 mb-3 border">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-semibold text-sm">{n.type ?? "Notification"}</div>
          <div className="text-sm text-gray-700 mt-1">{n.message}</div>
          <div className="text-xs text-gray-400 mt-2">{n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onRead(n.id)}
            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
          >
            Read
          </button>
          <button onClick={() => onClose(n.id)} className="text-xs text-gray-500 px-2 py-1" aria-label="dismiss">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC<Props> = ({ authId, patientId, open = false, onRequestClose }) => {
  const { notifications, markAsRead, removeLocal } = useNotifications({ authId, patientId });
  const lastSeenRef = useRef<string | null>(notifications[0]?.id ?? null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // notify other UI (navbar) about count
  useEffect(() => {
    const count = notifications.length;
    window.dispatchEvent(new CustomEvent("bm_notify_count", { detail: { count } }));
  }, [notifications.length]);

  // new-notification: play ting once + request bell shake
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const newest = notifications[0];
    if (!newest) return;
    if (lastSeenRef.current !== newest.id) {
      window.dispatchEvent(new CustomEvent("bm_notify_new", { detail: newest }));
      window.dispatchEvent(new CustomEvent("bm_notify_shake", { detail: { id: newest.id, ts: Date.now() } }));
      playTing(audioCtxRef);
      lastSeenRef.current = newest.id;
    }
  }, [notifications]);

  const handleRead = async (id: string) => {
    await markAsRead(id);
    removeLocal(id);
  };

  const handleClosePanel = () => {
    onRequestClose?.();
  };

  if (!authId && !patientId) return null;

  // position under top nav (assume ~64px). ensures first item visible.
  return (
    <div
      aria-hidden={!open}
      style={{ top: "64px", height: "calc(100% - 64px)" }}
      className={`fixed right-0 z-50 w-[360px] transform bg-transparent transition-transform duration-300 pointer-events-none ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="pointer-events-auto h-full bg-white shadow-xl p-4 overflow-auto flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleClosePanel} className="text-sm text-gray-600 px-2 py-1 rounded">Close</button>
          </div>
        </div>

        <div className="flex-1">
          {notifications.length === 0 ? (
            <div className="text-sm text-gray-600">No notifications</div>
          ) : (
            notifications.map((n) => (
              <NotificationCard key={n.id} n={n} onClose={removeLocal} onRead={handleRead} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;