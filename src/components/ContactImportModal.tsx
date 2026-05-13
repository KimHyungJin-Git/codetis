'use client';

import { useState } from 'react';
import { mockImportContacts } from '@/lib/mockData';

interface ImportContact {
  id: string;
  name: string;
  phone: string;
}

interface ContactImportModalProps {
  onClose: () => void;
  onImport: (contacts: ImportContact[]) => void;
}

export default function ContactImportModal({ onClose, onImport }: ContactImportModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === mockImportContacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(mockImportContacts.map((c) => c.id)));
    }
  };

  const handleImport = () => {
    const contacts = mockImportContacts.filter((c) => selected.has(c.id));
    onImport(contacts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative w-full max-w-[393px] bg-white rounded-t-3xl bottom-sheet overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-7 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-picks-dark">연락처에서 불러오기</h2>
            <button onClick={onClose} className="p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Select all */}
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 mb-3 text-sm text-gray-500"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected.size === mockImportContacts.length
                ? 'bg-picks-rose border-picks-rose'
                : 'border-gray-300'
            }`}>
              {selected.size === mockImportContacts.length && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="2,6 5,9 10,3" />
                </svg>
              )}
            </div>
            전체 선택
          </button>

          {/* Contact list */}
          <div className="overflow-y-auto max-h-64 space-y-2">
            {mockImportContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => toggle(contact.id)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  selected.has(contact.id)
                    ? 'bg-picks-rose border-picks-rose'
                    : 'border-gray-300'
                }`}>
                  {selected.has(contact.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: '#D6536D' }}
                >
                  {contact.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-picks-dark">{contact.name}</p>
                  <p className="text-xs text-gray-400">{contact.phone}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Import button */}
          <button
            onClick={handleImport}
            disabled={selected.size === 0}
            className="mt-4 w-full py-3.5 rounded-2xl font-semibold text-white text-[15px] transition-colors disabled:opacity-40"
            style={{ background: selected.size > 0 ? '#D6536D' : '#ccc' }}
          >
            선택한 연락처 추가 ({selected.size}명)
          </button>
        </div>
        <div style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
}
