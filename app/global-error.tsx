"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: 520, textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.75rem" }}>Нещо се счупи</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              Грешката е изпратена към нашия екип. Опитай отново.
            </p>
            <button
              onClick={reset}
              style={{
                background: "#c8ff00",
                color: "#000",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Опитай пак
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
