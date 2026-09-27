import { ErrorState } from "@/components/ui/state";

export default function DashboardNotFound() {
  return (
    <ErrorState
      title="Page not found"
      description="This dashboard page doesn't exist or you don't have access to it."
      action={{ label: "Back to dashboard", href: "/dashboard" }}
    />
  );
}
