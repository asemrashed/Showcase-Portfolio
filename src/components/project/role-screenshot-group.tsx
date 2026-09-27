import { ScreenshotCarousel } from "./screenshot-carousel";
import type { ProjectDetailData } from "@/types/api";

type RoleImage = ProjectDetailData["roles"][number]["images"][number];

export function RoleScreenshotGroup({ images }: { images: RoleImage[] }) {
  const desktop = images.filter((i) => i.device === "DESKTOP");
  const mobile = images.filter((i) => i.device === "MOBILE");

  if (images.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No screenshots for this role yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[4fr_1fr]">
      {desktop.length > 0 && (
        <div className="flex flex-col">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Desktop</p>
          <ScreenshotCarousel images={desktop} className="h-64 sm:h-80 md:h-[400px]" />
        </div>
      )}
      {mobile.length > 0 && (
        <div className="flex flex-col">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Mobile</p>
          <ScreenshotCarousel images={mobile} className="h-64 sm:h-80 md:h-[400px]" />
        </div>
      )}
    </div>
  );
}
