import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/state";

export default function ProjectNotFound() {
  return (
    <Container className="py-24">
      <ErrorState
        title="Project not found"
        description="This project may have been unpublished or the link is incorrect."
        action={{ label: "Browse all projects", href: "/projects" }}
        showHomeLink
      />
    </Container>
  );
}
