import { useState } from 'react';
import {
  Mail,
  MessageCircle,
  Copy,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Send,
  Info,
} from 'lucide-react';
import { useMailStore } from '@/store/useMailStore';
export default function ResultPanel() {
  const {
    securityError,
    errorType,
    detectedItems,
    securityPassed,
    isGenerating,
    isStreaming,
    hasGenerated,
    generatedTitle,
    generatedBody,
    smsText,
    kakaoText,
    smsLoading,
    kakaoLoading,
    update,
    generate,
    convertSms,
    convertKakao,
  } = useMailStore();
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };
  const copy = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label}이(가) 복사되었습니다`);
    } catch {
      showToast('복사에 실패했습니다');
    }
  };
  const openOutlook = () => {
    const subject = encodeURIComponent(generatedTitle || '');
    const body = encodeURIComponent(generatedBody || '');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  const showResult = hasGenerated && !securityError;
  const streamingIdle = isStreaming && !generatedTitle && !generatedBody;
  const errorTitles = {
    configuration: 'AI 설정 필요',
    auth: 'API 키 확인 필요',
    rate: 'AI 사용량 제한',
    credits: 'AI 크레딧 부족',
    generation: '메일 생성 오류',
  };
  const errorTitle = errorTitles[errorType] || '보안 검수 미통과';

  return (
    <div className="bg-white rounded-2xl border border-[#E5E8EE] shadow-sm p-6 relative">
      {/* Toast */}
      {toast && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-[#0F1E3D] text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          <Check className="w-4 h-4 text-[#4ade80]" />
          {toast}
        </div>
      )}
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563EB] text-white text-sm font-bold tabular-nums">
          03
        </span>
        <div>
          <h2 className="text-lg font-bold text-[#1A2332]">AI 생성 메일</h2>
          <p className="text-xs text-[#8A94A6]">생성된 결과를 검토하고 활용하세요</p>
        </div>
      </div>
      {/* 검토 안내 배너 (항상 표시) */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] mb-4">
        <Info className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#92400E] leading-relaxed">
          <span className="font-bold">반드시 검토 후 사용하세요.</span> 생성된 메일은 자동 발송되지
          않으며, 내용의 정확성은 발신 전 직접 확인해야 합니다.
        </p>
      </div>
      {/* 오류 및 보안 검수 결과 */}
      {securityError ? (
        <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#991B1B]">{errorTitle}</p>
              <p className="text-sm text-[#B91C1C] mt-1 leading-relaxed">{securityError}</p>
              {errorType === 'security' && detectedItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {detectedItems.map((item) => (
                    <span
                      key={item}
                      className="text-xs bg-[#FEE2E2] text-[#DC2626] px-2 py-1 rounded-md border border-[#FCA5A5]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : securityPassed && hasGenerated ? (
        <div className="flex items-center gap-2 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3 mb-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#16A34A]">
            <Check className="w-4 h-4 text-white" />
          </span>
          <span className="text-sm font-semibold text-[#15803D]">
            보안 검수 통과 — 민감정보가 감지되지 않았습니다
          </span>
        </div>
      ) : null}
      {/* 결과 본문 */}
      {!hasGenerated && !securityError ? (
        <div className="text-center py-16 border border-dashed border-[#E5E8EE] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-[#2563EB]" />
          </div>
          <h3 className="text-base font-semibold text-[#1A2332]">아직 생성된 메일이 없습니다</h3>
          <p className="text-sm text-[#8A94A6] mt-1.5 px-6 leading-relaxed">
            왼쪽에서 메일 정보를 입력하고 <span className="text-[#2563EB] font-medium">AI 메일 생성</span>{' '}
            버튼을 눌러주세요.
          </p>
        </div>
      ) : showResult ? (
        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-[#1A2332]">제목</label>
              <button
                type="button"
                onClick={() => copy(generatedTitle, '제목')}
                disabled={!generatedTitle}
                className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded-md transition disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5" /> 제목 복사
              </button>
            </div>
            <div className="w-full px-4 py-3 rounded-lg border border-[#E5E8EE] bg-[#F8FAFC] text-[#1A2332] font-medium min-h-[48px] flex items-center">
              {generatedTitle || (
                <span className="text-[#B0B7C3] font-normal">제목을 생성하는 중...</span>
              )}
            </div>
          </div>
          {/* 본문 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-[#1A2332]">
                본문 <span className="text-[#8A94A6] font-normal">(직접 수정 가능)</span>
              </label>
              <button
                type="button"
                onClick={() => copy(generatedBody, '본문')}
                disabled={!generatedBody}
                className="inline-flex items-center gap-1 text-xs text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded-md transition disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5" /> 본문 복사
              </button>
            </div>
            <div className="relative">
              <textarea
                value={generatedBody}
                onChange={(e) => update({ generatedBody: e.target.value })}
                readOnly={isStreaming}
                rows={12}
                placeholder={streamingIdle ? '' : '본문이 여기에 표시됩니다'}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E8EE] text-[#1A2332] leading-relaxed focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition resize-y"
              />
              {isStreaming && (
                <span className="absolute left-4 top-3 inline-flex items-center gap-1.5 text-xs text-[#2563EB] pointer-events-none">
                  {streamingIdle && (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> 메일을 작성하고 있습니다...
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
          {/* 활용 버튼 */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={generate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E8EE] bg-white text-[#1A2332] py-3 font-semibold text-sm hover:bg-[#F8FAFC] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} /> 다시 생성
            </button>
            <button
              type="button"
              onClick={openOutlook}
              disabled={!generatedBody}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F1E3D] text-white py-3 font-semibold text-sm hover:bg-[#1a3160] transition disabled:opacity-50"
            >
              <Mail className="w-4 h-4" /> Outlook 열기
            </button>
          </div>
          {/* 부가 활용: SMS / 카카오톡 */}
          <div className="pt-4 mt-1 border-t border-[#E5E8EE] space-y-4">
            {/* SMS */}
            <div className="rounded-xl border border-[#E5E8EE] p-4 bg-[#F8FAFC]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#2563EB]" />
                  </span>
                  <span className="text-sm font-semibold text-[#1A2332]">SMS 단문 변환</span>
                </div>
                <button
                  type="button"
                  onClick={convertSms}
                  disabled={smsLoading || !generatedBody}
                  className="text-xs font-semibold text-[#2563EB] border border-[#BFDBFE] bg-white px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {smsLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> 변환 중
                    </>
                  ) : (
                    'SMS로 변환'
                  )}
                </button>
              </div>
              {smsText ? (
                <div className="bg-white rounded-lg border border-[#E5E8EE] p-3">
                  <p className="text-sm text-[#1A2332] whitespace-pre-wrap leading-relaxed">
                    {smsText}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(smsText, 'SMS 문구')}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded-md transition"
                  >
                    <Copy className="w-3.5 h-3.5" /> 복사
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#8A94A6]">
                  본문을 90자 내외의 SMS 단문으로 재구성합니다.
                </p>
              )}
            </div>
            {/* 카카오톡 */}
            <div className="rounded-xl border border-[#E5E8EE] p-4 bg-[#F8FAFC]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                    <Send className="w-4 h-4 text-[#B45309]" />
                  </span>
                  <span className="text-sm font-semibold text-[#1A2332]">카카오톡 안내 문구</span>
                </div>
                <button
                  type="button"
                  onClick={convertKakao}
                  disabled={kakaoLoading || !generatedBody}
                  className="text-xs font-semibold text-[#B45309] border border-[#FDE68A] bg-white px-3 py-1.5 rounded-lg hover:bg-[#FFFBEB] transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {kakaoLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> 변환 중
                    </>
                  ) : (
                    '카카오톡 문구 생성'
                  )}
                </button>
              </div>
              {kakaoText ? (
                <div className="bg-white rounded-lg border border-[#E5E8EE] p-3">
                  <p className="text-sm text-[#1A2332] whitespace-pre-wrap leading-relaxed">
                    {kakaoText}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(kakaoText, '카카오톡 문구')}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#2563EB] hover:bg-[#EFF6FF] px-2 py-1 rounded-md transition"
                  >
                    <Copy className="w-3.5 h-3.5" /> 복사
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#8A94A6]">
                  본문을 카카오톡 비즈니스 메시지 형태로 재구성합니다.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
