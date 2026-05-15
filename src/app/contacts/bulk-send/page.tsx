'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { Connection, MessageTemplate } from '@/lib/types';
import { getCurrentSeason, SEASON_TEMPLATES } from '@/lib/templates';

export default function BulkSendPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [templateCategories, setTemplateCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [customText, setCustomText] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const season = getCurrentSeason();
  const seasonSuggestions = SEASON_TEMPLATES[season.key];

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setDataLoading(true);
      const [{ data: conns }, { data: tmps }] = await Promise.all([
        supabase.from('connections').select('*').eq('user_id', user.id).order('name'),
        supabase.from('message_templates').select('*').eq('user_id', user.id).order('created_at'),
      ]);
      setConnections((conns as Connection[]) ?? []);
      const tmpList = (tmps as MessageTemplate[]) ?? [];
      setTemplates(tmpList);
      const catSet = new Set(tmpList.map((t) => t.category));
      const cats = Array.from(catSet);
      setTemplateCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
        const firstCatTemplates = tmpList.filter((t) => t.category === cats[0]);
        if (firstCatTemplates.length > 0) {
          setCustomText(firstCatTemplates[0].content);
        }
      }
      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  const currentTemplates = templates.filter((t) => t.category === selectedCategory);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedTemplateIdx(0);
    const catTemplates = templates.filter((t) => t.category === cat);
    if (catTemplates.length > 0) {
      setCustomText(catTemplates[0].content);
    }
  };

  const handleTemplateSelect = (idx: number) => {
    setSelectedTemplateIdx(idx);
    setCustomText(currentTemplates[idx].content);
  };

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(connections.map((c) => c.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSend = async () => {
    if (selectedContacts.size === 0 || !user) return;
    const sentContacts = connections.filter((c) => selectedContacts.has(c.id));
    const failedContacts = connections.filter((c) => !selectedContacts.has(c.id));

    // Log to message_send_logs
    await supabase.from('message_send_logs').insert({
      user_id: user.id,
      template_content: customText,
      sent_to: sentContacts.map((c) => ({ name: c.name, phone: c.phone })),
      failed: failedContacts.map((c) => ({ name: c.name, phone: c.phone })),
    });

    sessionStorage.setItem('bulkSendResult', JSON.stringify({
      sent: sentContacts.map((c) => c.name),
      failed: failedContacts.map((c) => c.name),
      total: selectedContacts.size,
    }));
    router.push('/contacts/bulk-send/result');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-picks-bg">
        <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-picks-bg page-fade">
      {/* Header */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] z-40 flex items-center justify-between px-7 bg-picks-bg"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[17px] font-bold text-picks-dark">일괄 전송</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-28" style={{ paddingTop: '72px' }}>
        {/* Template section */}
        <div className="px-7">
          <h3 className="text-[15px] font-bold text-picks-dark mb-3">템플릿 선택</h3>

          {dataLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Category buttons */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
                {templateCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                    style={{
                      background: selectedCategory === cat ? '#D6536D' : 'white',
                      color: selectedCategory === cat ? 'white' : '#666',
                      border: selectedCategory === cat ? 'none' : '1.5px solid #e5e5e5',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Template cards - horizontal scroll */}
              <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-4">
                {currentTemplates.map((template, idx) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(idx)}
                    className="flex-shrink-0 w-56 p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: selectedTemplateIdx === idx ? '#D6536D' : 'white',
                      border: selectedTemplateIdx === idx ? 'none' : '1.5px solid #e5e5e5',
                      boxShadow: selectedTemplateIdx === idx ? '0 4px 12px rgba(214,83,109,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <p
                      className="text-[13px] leading-relaxed"
                      style={{ color: selectedTemplateIdx === idx ? 'white' : '#444' }}
                    >
                      {template.content}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* 시즌 추천 문구 칩 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[15px]">{season.emoji}</span>
              <p className="text-[13px] font-semibold text-picks-dark">{season.label} 추천 문구</p>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {seasonSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomText(s.content)}
                  className="flex-shrink-0 px-3 py-2 rounded-xl text-left transition-all active:scale-95 border"
                  style={{
                    background: customText === s.content ? season.color : 'white',
                    borderColor: customText === s.content ? season.color : '#e5e5e5',
                    maxWidth: '180px',
                  }}
                >
                  <p
                    className="text-[11px] font-semibold mb-0.5"
                    style={{ color: customText === s.content ? 'rgba(255,255,255,0.8)' : season.color }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-[12px] leading-snug line-clamp-2"
                    style={{ color: customText === s.content ? 'white' : '#555' }}
                  >
                    {s.content}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Editable text */}
          <div>
            <p className="text-[13px] font-medium text-gray-500 mb-2">메시지 내용 수정</p>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-[14px] text-picks-dark focus:border-picks-rose transition-colors resize-none"
              rows={4}
              placeholder="메시지 내용을 입력하세요..."
            />
            <p className="text-[11px] text-gray-400 mt-1 text-right">{customText.length}자</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-2 bg-gray-50 my-5" />

        {/* Recipients section */}
        <div className="px-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-picks-dark">전송 대상 선택</h3>
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-[13px] font-medium"
              style={{ color: '#D6536D' }}
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  selectAll ? 'bg-picks-rose border-picks-rose' : 'border-gray-300'
                }`}
              >
                {selectAll && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="1,5 4,8 9,2" />
                  </svg>
                )}
              </div>
              전체 선택
            </button>
          </div>

          <div className="space-y-2">
            {dataLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              connections.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className="flex items-center gap-3 w-full p-3.5 rounded-xl bg-white shadow-card hover:shadow-card-md transition-shadow"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                      selectedContacts.has(contact.id) ? 'bg-picks-rose border-picks-rose' : 'border-gray-300'
                    }`}
                  >
                    {selectedContacts.has(contact.id) && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ background: contact.avatar_color }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[14px] font-semibold text-picks-dark">{contact.name}</p>
                    <p className="text-[12px] text-gray-400">{contact.phone}</p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0"
                    style={{ background: '#fdf0f2', color: '#D6536D' }}
                  >
                    {contact.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fixed send button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] px-7 pb-8 pt-4 z-30 bg-picks-bg">
        <button
          onClick={handleSend}
          disabled={selectedContacts.size === 0 || !customText}
          className="w-full py-4 rounded-2xl font-semibold text-[16px] text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #D6536D 0%, #E43D12 100%)' }}
        >
          {selectedContacts.size > 0 ? `${selectedContacts.size}명에게 전송하기` : '전송 대상을 선택하세요'}
        </button>
      </div>
    </div>
  );
}
