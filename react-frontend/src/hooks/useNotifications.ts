import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export type NotificationItem = {
  id: string;
  sender_id?: string | null;
  receiver_id?: string | null; // auth user id
  user_id?: string | null; // optional patient DB id
  type?: string | null;
  message: string;
  is_read?: boolean | null;
  created_at?: string | null;
};

export const useNotifications = (opts: { authId?: string | null; patientId?: string | null }) => {
  const { authId, patientId } = opts;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // fetch existing relevant notifications
  useEffect(() => {
    if (!authId && !patientId) return;

    const fetchNotifications = async () => {
      try {
        console.debug("[useNotifications] fetch start", { authId, patientId });
        let query = supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (authId && patientId) {
          query = query.or(`receiver_id.eq.${authId},user_id.eq.${patientId}`);
        } else if (authId) {
          query = query.eq("receiver_id", authId);
        } else if (patientId) {
          query = query.eq("user_id", patientId);
        }

        const { data, error } = await query;
        if (error) console.error("[useNotifications] fetch error", error);
        if (!error && mounted.current) {
          console.debug("[useNotifications] fetched", data?.length ?? 0);
          setNotifications(data || []);
        }
      } catch (err) {
        console.error("[useNotifications] fetch exception", err);
      }
    };

    fetchNotifications();
  }, [authId, patientId]);

  // realtime listener for INSERT on notifications table
  useEffect(() => {
    if (!authId && !patientId) return;

    console.debug("[useNotifications] subscribing to realtime", { authId, patientId });
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications"
        },
        (payload: any) => {
          // handle SDK payload shapes
          const raw = payload?.new ?? payload?.record ?? payload?.payload ?? payload?.payload?.record ?? null;
          console.debug("[useNotifications] realtime payload", payload, "raw:", raw);
          if (!raw) return;

          const n = raw as NotificationItem;
          const matches =
            (authId && String(n.receiver_id) === String(authId)) ||
            (patientId && String(n.user_id) === String(patientId));

          if (matches) {
            setNotifications(prev => {
              if (prev.find(p => p.id === n.id)) return prev;
              return [n, ...prev];
            });
          }
        }
      )
      .subscribe();

    // cleanup
    return () => {
      try {
        supabase.removeChannel(channel);
        console.debug("[useNotifications] unsubscribed");
      } catch (err) {
        console.error("[useNotifications] removeChannel error", err);
      }
    };
  }, [authId, patientId]);

  // mark read (server)
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) {
        console.error("markAsRead error:", error);
        return false;
      }
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
      return true;
    } catch (err) {
      console.error("markAsRead exception:", err);
      return false;
    }
  };

  // remove locally (use when user dismisses without updating server)
  const removeLocal = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return { notifications, markAsRead, removeLocal };
};