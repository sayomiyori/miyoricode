export function Watermark() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute -top-1/2 left-1/2 size-[120%] -translate-x-1/2">
        <p className="absolute bottom-0 left-1/2 w-max -translate-x-1/2 translate-y-1/2 origin-bottom select-none whitespace-nowrap font-display wdth-condensed text-[20vw] font-bold leading-none bg-gradient-to-b from-ink/8 via-splat-blue/4 to-splat-pink/4 bg-clip-text text-transparent scale-x-[0.86]">
          SAYOMI
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-splat-blue/[0.02] via-transparent to-splat-pink/[0.02]" />
    </div>
  );
}
