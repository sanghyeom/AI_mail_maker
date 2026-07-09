import { useEffect, useState } from 'react';
import { Award, BookOpen, User, Check, Info, Eye, EyeOff, KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import LOGO from '@/assets/logo-header.png';
import { AI_PROVIDERS, useMailStore } from '@/store/useMailStore';

const GUIDE_STEPS = [
  { title: '메일 정보 입력', desc: '고객명, 업무 유형, 첨부파일명, 추가 요청사항, 톤을 입력합니다.' },
  { title: 'AI 메일 생성', desc: '버튼을 누르면 보안 검수를 거친 뒤 제목과 본문이 자동으로 작성됩니다.' },
  { title: '검토 및 편집', desc: '생성된 제목과 본문을 직접 확인하고 필요에 따라 수정합니다.' },
  { title: '활용하기', desc: '복사, Outlook 열기, SMS·카카오톡 문구 변환으로 바로 활용합니다.' },
];
export default function AppHeader() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { aiProvider, apiKey, aiModel, update } = useMailStore();
  const [draftProvider, setDraftProvider] = useState(aiProvider);
  const [draftApiKey, setDraftApiKey] = useState(apiKey);
  const [draftModel, setDraftModel] = useState(aiModel);
  const selectedProvider =
    AI_PROVIDERS.find((provider) => provider.value === draftProvider) || AI_PROVIDERS[0];

  const changeProvider = (providerValue) => {
    const provider = AI_PROVIDERS.find((item) => item.value === providerValue) || AI_PROVIDERS[0];

    setDraftProvider(provider.value);
    setDraftModel(provider.defaultModel);
  };

  const syncDraftSettings = () => {
    const provider = AI_PROVIDERS.find((item) => item.value === aiProvider) || AI_PROVIDERS[0];

    setDraftProvider(aiProvider);
    setDraftApiKey(apiKey);
    setDraftModel(aiModel || provider.defaultModel);
    setShowApiKey(false);
  };

  const handleSettingsOpenChange = (open) => {
    if (open) {
      syncDraftSettings();
    }

    setSettingsOpen(open);
  };

  const saveSettings = () => {
    update({
      aiProvider: draftProvider,
      apiKey: draftApiKey,
      aiModel: draftModel || selectedProvider.defaultModel,
    });
    setSettingsOpen(false);
  };

  useEffect(() => {
    if (settingsOpen) {
      const provider =
        AI_PROVIDERS.find((item) => item.value === draftProvider) || AI_PROVIDERS[0];
      if (!provider.models.some((model) => model.value === draftModel)) {
        setDraftModel(provider.defaultModel);
      }
    }
  }, [draftProvider, draftModel, settingsOpen]);

  return (
    <header className="bg-[#0F1E3D] text-white sticky top-0 z-40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={LOGO}
            alt="한국투자증권 로고"
            className="h-8 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="h-6 w-px bg-white/20 hidden sm:block" />
          <span className="font-semibold text-base sm:text-lg truncate">AI 고객 메일 작성기</span>
          <span className="ml-1 hidden md:inline-flex items-center gap-1 text-xs bg-[#16A34A]/20 text-[#4ade80] px-2 py-1 rounded-full border border-[#16A34A]/30 whitespace-nowrap">
            <Award className="w-3.5 h-3.5" /> 보안등급 A
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">사용 가이드</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-[#1A2332]">사용 가이드</DialogTitle>
                <DialogDescription className="text-[#8A94A6]">
                  4단계로 고객 업무 메일을 안전하게 작성하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                {GUIDE_STEPS.map((step, idx) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 p-3 rounded-xl border border-[#E5E8EE] bg-[#F8FAFC]"
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-[#2563EB] text-white text-xs font-bold tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1A2332]">{step.title}</p>
                      <p className="text-xs text-[#8A94A6] mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <Info className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#1A2332] leading-relaxed">
                  AI 호출 전 주민등록번호·계좌번호·연락처·거래금액·수익률 등 민감정보가 자동 차단되며,
                  생성된 메일은 자동 발송되지 않습니다. 최종 검토 책임은 사용자에게 있습니다.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#16A34A] mt-1">
                <Check className="w-3.5 h-3.5" />
                <span>고객명·첨부파일명·본문 원문은 저장되지 않습니다.</span>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={settingsOpen} onOpenChange={handleSettingsOpenChange}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label="프로필"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <User className="w-5 h-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-[#1A2332] flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#2563EB]" />
                  AI 연결 설정
                </DialogTitle>
                <DialogDescription className="text-[#8A94A6]">
                  사용할 AI 제공자를 선택하고 본인의 API 키를 입력하세요.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-2">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] mb-2">
                    AI 제공자
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {AI_PROVIDERS.map((provider) => {
                      const active = draftProvider === provider.value;

                      return (
                        <button
                          key={provider.value}
                          type="button"
                          onClick={() => changeProvider(provider.value)}
                          className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${
                            active
                              ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                              : 'border-[#E5E8EE] bg-white text-[#1A2332] hover:border-[#BFDBFE]'
                          }`}
                        >
                          {provider.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">
                    API 키
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={draftApiKey}
                      onChange={(e) => setDraftApiKey(e.target.value)}
                      placeholder={selectedProvider.keyPlaceholder}
                      autoComplete="off"
                      spellCheck="false"
                      className="w-full pr-11 px-4 py-3 rounded-lg border border-[#E5E8EE] text-[#1A2332] placeholder:text-[#B0B7C3] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition"
                    />
                    <button
                      type="button"
                      aria-label={showApiKey ? 'API 키 숨기기' : 'API 키 보기'}
                      onClick={() => setShowApiKey((value) => !value)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-[#8A94A6] hover:bg-[#F1F5F9] hover:text-[#1A2332] transition"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#8A94A6] mt-1.5 leading-relaxed">
                    API 키는 브라우저 저장소에 저장하지 않고, 생성 요청 시에만 서버로 전달합니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] mb-1.5">
                    모델 버전
                  </label>
                  <select
                    value={draftModel || selectedProvider.defaultModel}
                    onChange={(e) => setDraftModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E8EE] text-[#1A2332] placeholder:text-[#B0B7C3] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition"
                  >
                    {selectedProvider.models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[#8A94A6] mt-1.5">
                    기본 설정은 {selectedProvider.defaultModel}입니다.
                  </p>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                  <Info className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1A2332] leading-relaxed">
                    OpenAI 또는 Gemini 콘솔에서 발급받은 API 키를 입력해야 합니다. 사용량과 비용은
                    해당 API 키의 계정에 청구됩니다.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-[#E5E8EE] bg-white text-sm font-semibold text-[#1A2332] hover:bg-[#F8FAFC] transition"
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    onClick={saveSettings}
                    className="px-4 py-2.5 rounded-lg bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1d4ed8] transition"
                  >
                    저장
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
