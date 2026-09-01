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
          "group relative glass flex h-12 w-12 cursor-pointer items-center justify-center p-0.5",
          "bg-white/10 border border-white/20 shadow-lg",
          "transition-all duration-300 hover:scale-110 hover:border-white/30 hover:shadow-xl",
        )}
      >
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-splat-blue/20 via-splat-pink/20 to-splat-blue/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Image
          src="/logo.png"
          alt="MiyoriCode"
          width={48}
          height={48}
          priority
          className="relative z-10 h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </div>
  );
}
