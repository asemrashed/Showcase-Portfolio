import Image from "next/image";
import { cn } from "@/lib/utils";

export function PhoneFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[280px]", className)}>
      <div className="rounded-[2rem] border-[6px] border-foreground/90 bg-foreground/90 p-1.5 shadow-lg">
        <div className="relative">
          <span className="absolute left-1/2 top-0 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-foreground/90" />
          <div className="max-h-[520px] overflow-y-auto rounded-[1.6rem] bg-surface thin-scroll">
            <Image src={src} alt={alt} width={390} height={4200} sizes="280px" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
