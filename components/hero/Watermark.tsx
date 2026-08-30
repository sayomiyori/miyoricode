export function Watermark() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <p className="absolute bottom-0 left-1/2 w-max -translate-x-1/2 translate-y-1/2 origin-bottom select-none whitespace-nowrap font-display wdth-condensed text-[20vw] font-bold leading-none text-ink/[0.06] scale-x-[0.86]">
        SAYOMI
      </p>
    </div>
  );
}
