import { Zap, Loader2 } from 'lucide-react';
import { useMailStore, TASK_TYPES, TONES } from '@/store/useMailStore';
const MAX_LEN = 200;
export default function MailForm() {
  const {
    customerName,
    taskType,
    attachmentName,
    additionalRequest,
    tone,
    isGenerating,
    update,
    generate,
  } = useMailStore();
  const onEnter = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      generate();
    }
  };
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8EE] shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563EB] text-white text-sm font-bold tabular-nums">
          01
        </span>
        <div>
          <h2 className="text-lg font-bold text-[#1A2332]">메일 정보 입력</h2>
          <p className="text-xs text-[#8A94A6]">필요한 정보를 입력하면 AI가 메일을 작성합니다</p>
        </div>
      </div>
      <div role="form" aria-label="메일 정보 입력 폼" className="space-y-5">
        {/* 고객명 */}
        <div>
          <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">고객명</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => update({ customerName: e.target.value })}
            onKeyDown={onEnter}
            placeholder="예: 홍길동 고객님"
            className="w-full px-4 py-3 rounded-lg border border-[#E5E8EE] text-[#1A2332] placeholder:text-[#B0B7C3] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition"
          />
        </div>
        {/* 업무 유형 */}
        <div>
          <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">업무 유형</label>
          <select
            value={taskType}
            onChange={(e) => update({ taskType: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-[#E5E8EE] text-[#1A2332] bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition appearance-none cursor-pointer"
          >
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        {/* 첨부파일명 */}
        <div>
          <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">
            첨부파일명 <span className="text-[#8A94A6] font-normal">(선택)</span>
          </label>
          <input
            type="text"
            value={attachmentName}
            onChange={(e) => update({ attachmentName: e.target.value })}
            onKeyDown={onEnter}
            placeholder="예: 투자제안서.pdf"
            className="w-full px-4 py-3 rounded-lg border border-[#E5E8EE] text-[#1A2332] placeholder:text-[#B0B7C3] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition"
          />
        </div>
        {/* 추가 요청사항 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-[#1A2332]">
              추가 요청사항 <span className="text-[#8A94A6] font-normal">(선택)</span>
            </label>
            <span className="text-xs tabular-nums text-[#8A94A6]">
              {additionalRequest.length}/{MAX_LEN}
            </span>
          </div>
          <textarea
            value={additionalRequest}
            onChange={(e) => update({ additionalRequest: e.target.value.slice(0, MAX_LEN) })}
            maxLength={MAX_LEN}
            rows={3}
            placeholder="메일에 반영할 요청사항을 입력하세요. (민감정보 입력 금지)"
            className="w-full px-4 py-3 rounded-lg border border-[#E5E8EE] text-[#1A2332] placeholder:text-[#B0B7C3] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition resize-none"
          />
        </div>
        {/* 톤 선택 */}
        <div>
          <label className="block text-sm font-semibold text-[#1A2332] mb-2">톤 선택</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {TONES.map((t) => {
              const active = tone === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update({ tone: t.value })}
                  className={`text-left rounded-xl border p-3 transition ${
                    active
                      ? 'border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]'
                      : 'border-[#E5E8EE] bg-white hover:border-[#C7D2FE]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                        active ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#C4CBD8]'
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${active ? 'text-[#2563EB]' : 'text-[#1A2332]'}`}
                    >
                      {t.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A94A6] mt-1 leading-snug">{t.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
        {/* 생성 버튼 */}
        <button
          type="button"
          onClick={generate}
          disabled={isGenerating}
          className="w-full mt-1 bg-[#2563EB] text-white rounded-lg py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-[#1d4ed8] transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> 생성 중...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" /> AI 메일 생성
            </>
          )}
        </button>
      </div>
    </div>
  );
}