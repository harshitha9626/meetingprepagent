// AI-Generated Code - 2026-09-29 - Composer

import type { Contact } from "../lib/api";

function isDemoContact(contact: Contact): boolean {
  return (
    contact.name === "Ravi Sharma" && contact.company === "Nimbus Retail"
  );
}

export function ContactList({
  contacts,
  selectedId,
  onSelect,
}: {
  contacts: Contact[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <p className="font-medium text-[#10241f]">No contacts yet.</p>
        <p className="mt-1">
          Click <span className="font-semibold">Start Ravi demo</span> to create
          Ravi Sharma and begin building relationship memory.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {contacts.map((contact) => {
        const active = contact.id === selectedId;
        const isDemo = isDemoContact(contact);
        return (
          <li key={contact.id}>
            <button
              type="button"
              onClick={() => onSelect(contact.id)}
              aria-pressed={active}
              className={`nav-item w-full rounded-2xl border px-4 py-3 text-left ${
                active
                  ? "is-active border-[#1f6b56] bg-[#1f6b56] text-white shadow-lg shadow-[#1f6b56]/20"
                  : "border-[#1f6b56]/15 bg-white/70 text-[#10241f]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{contact.name}</p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {isDemo && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-[#f0d7a8] text-[#10241f]"
                      }`}
                    >
                      Demo
                    </span>
                  )}
                  {active && (
                    <span className="contact-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
              </div>
              <p
                className={`mt-0.5 text-sm ${
                  active ? "text-white/80" : "text-[#2a4038]"
                }`}
              >
                {contact.role} · {contact.company}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
