'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import type { MessageTemplate } from '@/lib/types';
import {
  getCurrentSeason,
  SEASON_TEMPLATES,
  RELATIONSHIP_TEMPLATE_SETS,
  type TemplateSuggestion,
} from '@/lib/templates';

export default function TemplatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'mine' | 'suggest'>('mine');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ category: '기본 안부', content: '' });
  const [toast, setToast] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  const season = getCurrentSeason();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/onboarding');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchTemplates = async () => {
      setDataLoading(true);
      const { data } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');
      setTemplates((data as MessageTemplate[]) ?? []);
      setDataLoading(false);
    };
    fetchTemplates();
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const startEdit = (t: MessageTemplate) => {
    setEditingId(t.id);
    setEditContent(t.content);
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('message_templates')
      .update({ content: editContent })
      .eq('id', id);
    if (error) { showToast('저장 중 오류가 발생했습니다.'); return; }
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, content: editContent } : t));
    setEditingId(null);
    showToast('템플릿이 저장되었습니다.');
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase.from('message_templates').delete().eq('id', id);
    if (error) { showToast('삭제 중 오류가 발생했습니다.'); return; }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('템플릿이 삭제되었습니다.');
  };

  const addTemplate = async () => {
    if (!newTemplate.content || !user) return;
    const { data, error } = await supabase
      .from('message_templates')
      .insert({ user_id: user.id, category: newTemplate.category, content: newTemplate.content })
      .select()
      .single();
    if (error) { showToast('추가 중 오류가 발생했습니다.'); return; }
    setTemplates((prev) => [...prev, data as MessageTemplate]);
    setNewTemplate({ category: '기본 안부', content: '' });
    setShowAdd(false);
    showToast('새 템플릿이 추가되었습니다!');
  };

  const addSuggestedTemplate = async (suggestion: TemplateSuggestion) => {
    if (!user) return;
    const key = `${suggestion.category}-${suggestion.content.slice(0, 10)}`;
    setAddingId(key);
    const { data, error } = await supabase
      .from('message_templates')
      .insert({ user_id: user.id, category: suggestion.category, content: suggestion.content })
      .select()
      .single();
    setAddingId(null);
    if (error) { showToast('추가 중 오류가 발생했습니다.'); return; }
    setTemplates((prev) => [...prev, data as MessageTemplate]);
    showToast('내 템플릿에 추가했어요!');
  };

  const categoryColors: Record<string, string> = {
    '기본 안부': '#D6536D',
    '친한 친구': '#EFB11D',
    '어색한 친구': '#4CAF50',
    '가족': '#E43D12',
    '비즈니스': '#2196F3',
    '대학생용': '#9C27B0',
  };

  const seasonSuggestions = SEASON_TEMPLATES[season.key];

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
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[17px] font-bold text-picks-dark">메시지 템플릿</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-24" style={{ paddingTop: '56px' }}>

        {/* 탭 */}
        <div className="flex px-7 pt-4 gap-2 mb-4">
          {(['mine', 'suggest'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
              style={{
                background: tab === t ? '#D6536D' : 'white',
                color: tab === t ? 'white' : '#888',
                border: tab === t ? 'none' : '1.5px solid #e5e5e5',
              }}
            >
              {t === 'mine' ? '내 템플릿' : `추천 문구 ${season.emoji}`}
            </button>
          ))}
        </div>

        {/* ── 내 템플릿 탭 ── */}
        {tab === 'mine' && (
          <>
            <div className="px-7 mb-4">
              <button
                onClick={() => setShowAdd(!showAdd)}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors"
                style={{ borderColor: '#D6536D', color: '#D6536D' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                새 템플릿 추가
              </button>
            </div>

            {showAdd && (
              <div className="px-7 mb-4">
                <div className="picks-card p-4">
                  <h3 className="text-[14px] font-bold text-picks-dark mb-3">새 템플릿</h3>
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-gray-500 mb-1">카테고리</label>
                    <div className="flex gap-2 flex-wrap">
                      {['기본 안부', '친한 친구', '가족', '비즈니스'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewTemplate((p) => ({ ...p, category: cat }))}
                          className="px-3 py-1 rounded-full text-[12px] font-medium transition-all"
                          style={{
                            background: newTemplate.category === cat ? '#D6536D' : '#f5f5f5',
                            color: newTemplate.category === cat ? 'white' : '#666',
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate((p) => ({ ...p, content: e.target.value }))}
                    placeholder="메시지 내용을 입력하세요..."
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-picks-dark focus:border-picks-rose transition-colors resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowAdd(false)}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 bg-gray-100"
                    >
                      취소
                    </button>
                    <button
                      onClick={addTemplate}
                      disabled={!newTemplate.content}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-white disabled:opacity-50"
                      style={{ background: '#D6536D' }}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="px-7 space-y-3">
              {dataLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-picks-rose border-t-transparent rounded-full animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <div className="picks-card p-8 text-center">
                  <p className="text-gray-400 text-[14px] mb-3">아직 템플릿이 없어요</p>
                  <button
                    onClick={() => setTab('suggest')}
                    className="text-[13px] font-semibold px-4 py-2 rounded-full"
                    style={{ background: '#fdf0f2', color: '#D6536D' }}
                  >
                    추천 문구에서 가져오기
                  </button>
                </div>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="picks-card p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{
                          background: (categoryColors[template.category] ?? '#D6536D') + '20',
                          color: categoryColors[template.category] ?? '#D6536D',
                        }}
                      >
                        {template.category}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(template)}
                          className="p-1.5 rounded-lg"
                          style={{ background: '#fdf0f2' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D6536D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1.5 rounded-lg"
                          style={{ background: '#fff0f0' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E43D12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {editingId === template.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-picks-rose bg-gray-50 text-[14px] text-picks-dark resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl text-[13px] font-medium text-gray-500 bg-gray-100">취소</button>
                          <button onClick={() => saveEdit(template.id)} className="flex-1 py-2 rounded-xl text-[13px] font-medium text-white" style={{ background: '#D6536D' }}>저장</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[14px] text-picks-dark leading-relaxed">{template.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── 추천 문구 탭 ── */}
        {tab === 'suggest' && (
          <div className="px-7 space-y-6">

            {/* 시즌 추천 */}
            <div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                style={{ background: season.color + '15' }}
              >
                <span className="text-[18px]">{season.emoji}</span>
                <div>
                  <p className="text-[14px] font-bold" style={{ color: season.color }}>{season.label} 추천 문구</p>
                  <p className="text-[11px] text-gray-400">지금 시즌에 딱 맞는 문구예요</p>
                </div>
              </div>
              <div className="space-y-3">
                {seasonSuggestions.map((s, idx) => {
                  const key = `${s.category}-${s.content.slice(0, 10)}`;
                  const isAdded = templates.some((t) => t.content === s.content);
                  return (
                    <SuggestionCard
                      key={idx}
                      suggestion={s}
                      isAdded={isAdded}
                      isLoading={addingId === key}
                      color={season.color}
                      onAdd={() => addSuggestedTemplate(s)}
                    />
                  );
                })}
              </div>
            </div>

            {/* 관계별 추천 */}
            {RELATIONSHIP_TEMPLATE_SETS.map((set) => (
              <div key={set.category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[18px]">{set.emoji}</span>
                  <p className="text-[14px] font-bold text-picks-dark">{set.category} 관계 문구</p>
                </div>
                <div className="space-y-3">
                  {set.templates.map((s, idx) => {
                    const key = `${s.category}-${s.content.slice(0, 10)}`;
                    const isAdded = templates.some((t) => t.content === s.content);
                    return (
                      <SuggestionCard
                        key={idx}
                        suggestion={s}
                        isAdded={isAdded}
                        isLoading={addingId === key}
                        color="#D6536D"
                        onAdd={() => addSuggestedTemplate(s)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="h-4" />
          </div>
        )}
      </div>

      <BottomNav />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-enter">
          <div className="bg-picks-dark text-white px-5 py-3 rounded-2xl shadow-lg text-[14px] font-medium whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionCard({
  suggestion,
  isAdded,
  isLoading,
  color,
  onAdd,
}: {
  suggestion: TemplateSuggestion;
  isAdded: boolean;
  isLoading: boolean;
  color: string;
  onAdd: () => void;
}) {
  return (
    <div className="picks-card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: color + '18', color }}
          >
            {suggestion.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500">
            {suggestion.label}
          </span>
        </div>
        <button
          onClick={onAdd}
          disabled={isAdded || isLoading}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-semibold transition-all active:scale-95 disabled:opacity-60"
          style={{
            background: isAdded ? '#f0f0f0' : color,
            color: isAdded ? '#999' : 'white',
          }}
        >
          {isLoading ? (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isAdded ? (
            '추가됨'
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              추가
            </>
          )}
        </button>
      </div>
      <p className="text-[13px] text-picks-dark leading-relaxed">{suggestion.content}</p>
    </div>
  );
}
