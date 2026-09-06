"use client";

import { useEffect } from "react";

/** Registers the service worker that makes the app installable and lets it
 *  receive push while closed. Kept out of the render tree deliberately. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* An unregistered SW only costs offline support; never block the app. */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
