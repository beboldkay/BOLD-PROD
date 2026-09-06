"use client";

import { useCallback, useEffect, useState } from "react";

/** VAPID keys are base64url; PushManager wants raw bytes. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

type State = "unsupported" | "off" | "on" | "busy" | "denied";

export default function PushToggle() {
  const [state, setState] = useState<State>("busy");
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!vapidKey || typeof window === "undefined") return setState("unsupported");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return setState("unsupported");
      }
      if (Notification.permission === "denied") return setState("denied");

      const reg = await navigator.serviceWorker.ready.catch(() => null);
      const sub = await reg?.pushManager.getSubscription().catch(() => null);
      if (!cancelled) setState(sub ? "on" : "off");
    })();
    return () => {
      cancelled = true;
    };
  }, [vapidKey]);

  const enable = useCallback(async () => {
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey!) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setState(res.ok ? "on" : "off");
    } catch {
      setState("off");
    }
  }, [vapidKey]);

  const disable = useCallback(async () => {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
    } finally {
      setState("off");
    }
  }, []);

  if (state === "unsupported") return null;
  if (state === "denied") {
    return (
      <button className="ghost-btn" disabled title="ההתראות חסומות בהגדרות הדפדפן">
        התראות חסומות
      </button>
    );
  }

  return (
    <button
      className={`ghost-btn${state === "on" ? " on" : ""}`}
      disabled={state === "busy"}
      onClick={state === "on" ? disable : enable}
      title="התראות רק על דברים דחופים — לא על כל ריענון"
    >
      {state === "busy" ? "רגע…" : state === "on" ? "התראות פועלות" : "הפעל התראות"}
    </button>
  );
}
