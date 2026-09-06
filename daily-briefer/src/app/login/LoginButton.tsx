"use client";

import { useState } from "react";
import { GoogleMark } from "@/components/Icons";
import { signInWithGoogle } from "@/lib/signin";

export default function LoginButton() {
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="login-btn"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const { error } = await signInWithGoogle("/");
        if (error) setBusy(false);
      }}
    >
      <GoogleMark />
      {busy ? "מעביר ל-Google…" : "כניסה עם Google"}
    </button>
  );
}
