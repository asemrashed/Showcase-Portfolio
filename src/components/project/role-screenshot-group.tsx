import { DeviceShowcase } from "./device-showcase";
import type { ProjectDetailData } from "@/types/api";

type RoleImage = ProjectDetailData["roles"][number]["images"][number];

export function RoleScreenshotGroup({ images }: { images: RoleImage[] }) {
  const desktop = images.filter((i) => i.device === "DESKTOP");
  const mobile = images.filter((i) => i.device === "MOBILE");

  if (images.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No screenshots for this role yet.</p>;
  }

  return <DeviceShowcase desktop={desktop} mobile={mobile} autoplay />;
}
