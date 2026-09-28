// AI-Generated Code - 2026-09-29 - Composer

const DEMO_STEPS = [
  { id: 1, label: "Ravi — New Contact" },
  { id: 2, label: "First interaction retained" },
  { id: 3, label: "Timeline grows (M2–M3)" },
  { id: 4, label: "Prepare Meeting" },
  { id: 5, label: "Recall + brief" },
];

export function DemoStepper({ current }: { current: number }) {
  return (
    <nav
      aria-label="Demo steps"
      className="panel-surface rounded-2xl border border-[#1f6b56]/15 bg-[#f3f7f4]/80 p-3"
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9842a]">
        2–3 min demo
      </p>
      <ol className="stagger-in space-y-1.5">
        {DEMO_STEPS.map((step) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <li
              key={step.id}
              className={`stepper-row flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                active
                  ? "bg-[#1f6b56] text-white"
                  : done
                    ? "text-[#0f4a3a]"
                    : "text-[#2a4038]/70"
              }`}
            >
              <span
                className={`flow-node flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "is-lit bg-white text-[#0f4a3a]"
                    : done
                      ? "bg-[#c9842a] text-white"
                      : "bg-[#d7e4dc] text-[#2a4038]"
                }`}
              >
                {done ? "✓" : step.id}
              </span>
              <span className="font-medium">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
