// AI-Generated Code - 2026-09-29 - Composer

export function MemoryToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: "memory" | "generic";
  onChange: (mode: "memory" | "generic") => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="inline-flex max-w-full flex-wrap rounded-full border border-[#1f6b56]/25 bg-white/70 p-1"
      role="group"
      aria-label="Memory comparison mode"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("memory")}
        className={`btn-interactive rounded-full px-4 py-1.5 text-xs font-semibold ${
          mode === "memory"
            ? "bg-[#1f6b56] text-white shadow-sm"
            : "text-[#2a4038] hover:text-[#10241f]"
        }`}
      >
        With Hindsight
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("generic")}
        className={`btn-interactive rounded-full px-4 py-1.5 text-xs font-semibold ${
          mode === "generic"
            ? "bg-[#2a4038] text-white shadow-sm"
            : "text-[#2a4038] hover:text-[#10241f]"
        }`}
      >
        Without memory
      </button>
    </div>
  );
}
