import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  enter?: boolean;
};

export function Logo({ enter = true }: LogoProps) {
  return (
    <div className={enter ? "logo-enter mb-5" : "mb-5"}>
      <div
        className={cn(
          "glass flex h-12 w-12 items-center justify-center p-0.5",
          "bg-white/10",
          "border border-white/20 shadow-lg",
        )}
      >
        <Image
          src="/logo.png"
          alt="MiyoriCode"
          width={48}
          height={48}
          priority
          className="h-11 w-11 object-contain"
        />
      </div>
    </div>
  );
}
