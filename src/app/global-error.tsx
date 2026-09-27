"use client";
import { useEffect } from "react";

/**
 * Only fires if the root layout itself throws. Renders its own <html>/<body> —
 * intentionally plain, since Providers/fonts may not have mounted.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            display: "flex",
            minHeight: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#71717a", maxWidth: 360 }}>
            The application ran into a critical error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.625rem",
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
