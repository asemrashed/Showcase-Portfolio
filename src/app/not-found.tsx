import { ErrorState } from "@/components/ui/state";
import { StandaloneShell } from "@/components/layout/standalone-shell";

export default function NotFound() {
  return (
    <StandaloneShell>
      <ErrorState
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        showHomeLink
      />
    </StandaloneShell>
  );
}
