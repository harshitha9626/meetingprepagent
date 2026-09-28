// AI-Generated Code - 2026-09-28 - Composer

const steps = [
  "Interaction",
  "Hindsight Retain",
  "Long-term Memory",
  "Hindsight Recall",
  "Personalized Brief",
];

export function MemoryFlowStrip({ activeIndex = 2 }: { activeIndex?: number }) {
  return (
    <div className="panel-surface overflow-x-auto rounded-2xl border border-[#1f6b56]/15 bg-white/60 px-3 py-4">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9842a]">
        Why this is not a normal chatbot
      </p>
      <ol className="flex min-w-[640px] items-center justify-between gap-1 px-2">
        {steps.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center text-center">
              <span
                className={`flow-node flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  i <= activeIndex
                    ? "is-lit bg-[#0f4a3a] text-white"
                    : "bg-[#d7e4dc] text-[#2a4038]"
                }`}
              >
                {i + 1}
              </span>
              <span className="mt-2 max-w-[7.5rem] text-[11px] font-semibold leading-snug text-[#10241f]">
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`flow-rail mx-1 h-0.5 flex-1 ${
                  i < activeIndex ? "bg-[#1f6b56]" : "bg-[#d7e4dc]"
                }`}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
