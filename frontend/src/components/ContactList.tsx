// AI-Generated Code - 2026-09-28 - Composer

import type { Contact } from "../lib/api";

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
      <div className="rounded-2xl border border-dashed border-[#1f6b56]/30 bg-white/40 p-4 text-sm text-[#2a4038]">
        No contacts yet. Seed the Priya demo or create a contact.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {contacts.map((contact) => {
        const active = contact.id === selectedId;
        return (
          <li key={contact.id}>
            <button
              type="button"
              onClick={() => onSelect(contact.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-[#1f6b56] bg-[#1f6b56] text-white shadow-lg shadow-[#1f6b56]/20"
                  : "border-[#1f6b56]/15 bg-white/70 text-[#10241f] hover:border-[#1f6b56]/40"
              }`}
            >
              <p className="font-semibold">{contact.name}</p>
              <p className={`text-sm ${active ? "text-white/80" : "text-[#2a4038]"}`}>
                {contact.role} · {contact.company}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
