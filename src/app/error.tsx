"use client";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/state";
import { StandaloneShell } from "@/components/layout/standalone-shell";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StandaloneShell>
      <ErrorState
        title="Something went wrong"
        description="We hit an unexpected error loading this page. You can try again, or head back home."
        action={{ label: "Try again", onClick: reset }}
        showHomeLink
      />
    </StandaloneShell>
  );
}
