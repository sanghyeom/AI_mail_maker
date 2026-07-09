import { create } from 'zustand';
import { generateWithLlm } from '@/api/llm';
import { GenerationLog } from '@/api/entities';
export const TASK_TYPES = [
  { value: 'proposal', label: '제안서 송부' },
  { value: 'transaction', label: '거래내역서 송부' },
  { value: 'product', label: '상품 안내자료 전달' },
  { value: 'account', label: '계좌 개설 안내' },
  { value: 'consultation', label: '상담 일정 안내' },
  { value: 'contract', label: '계약서 전달' },
  { value: 'thanks', label: '사후 감사 메일' },
];
export const TONES = [
  { value: 'polite', label: '정중한 톤', desc: '격식을 갖춘 공식 문체' },
  { value: 'friendly', label: '친근한 톤', desc: '부드럽고 다가가기 쉬운 문체' },
  { value: 'concise', label: '간결한 톤', desc: '핵심만 명확하게 전달' },
];
export const AI_PROVIDERS = [
  {
    value: 'gemini',
    label: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    keyPlaceholder: 'AIza...',
    models: [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  {
    value: 'openai',
    label: 'OpenAI GPT',
    defaultModel: 'gpt-4o-mini',
    keyPlaceholder: 'sk-...',
    models: [
      { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
      { value: 'gpt-4.1', label: 'GPT-4.1' },
    ],
  },
];
// AI 호출 전 클라이언트 사이드 민감정보 차단 패턴
const SECURITY_PATTERNS = [
  { label: '주민등록번호', regex: /\d{6}[-\s]?[1-4]\d{6}/ },
  { label: '휴대전화번호', regex: /01[0-9][-\s.]?\d{3,4}[-\s.]?\d{4}/ },
  { label: '이메일 주소', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
  { label: '계좌번호 형식', regex: /\d{2,6}[-\s]\d{2,6}[-\s]\d{2,7}/ },
  { label: '거래금액', regex: /(\d{1,3}(,\d{3})+\s*(원|만원|억원|달러|USD))|(\d+\s*(억원|만원|달러))/ },
  { label: '수익률', regex: /\d+(\.\d+)?\s*(%|퍼센트)/ },
  { label: '긴 숫자 나열', regex: /\d{9,}/ },
];
export function detectSensitive(text) {
  const detected = [];
  for (const p of SECURITY_PATTERNS) {
    if (p.regex.test(text)) detected.push(p.label);
  }
  return [...new Set(detected)];
}
function parseEmail(text) {
  const titleMatch = text.match(/===제목===\s*([\s\S]*?)(?:===본문===|$)/);
  const bodyMatch = text.match(/===본문===\s*([\s\S]*)$/);
  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    body: bodyMatch ? bodyMatch[1].trim() : '',
  };
}
const RESULT_DEFAULTS = {
  securityError: '',
  errorType: '',
  detectedItems: [],
  securityPassed: false,
  isGenerating: false,
  isStreaming: false,
  hasGenerated: false,
  generatedTitle: '',
  generatedBody: '',
  smsText: '',
  kakaoText: '',
  smsLoading: false,
  kakaoLoading: false,
};

const ENABLE_GENERATION_LOGS = import.meta.env.VITE_ENABLE_GENERATION_LOGS === 'true';

async function recordGenerationLog(payload) {
  if (!ENABLE_GENERATION_LOGS) return;

  try {
    await GenerationLog.create(payload);
  } catch (e) {
    /* 통계 기록 실패는 사용자 흐름과 분리 */
  }
}

function getProviderMeta(provider) {
  return AI_PROVIDERS.find((item) => item.value === provider) || AI_PROVIDERS[0];
}

function getModel(state) {
  return state.aiModel.trim() || getProviderMeta(state.aiProvider).defaultModel;
}

function getApiKeyMissingMessage(state) {
  const provider = getProviderMeta(state.aiProvider);
  return `상단 프로필 버튼을 눌러 ${provider.label} API 키를 입력해주세요.`;
}

function getLlmErrorType(err) {
  if (err?.status === 401 || err?.status === 403) return 'auth';
  if (err?.status === 429) return 'rate';
  if (err?.status === 402) return 'credits';
  return 'generation';
}

function getLlmErrorMessage(err) {
  if (err?.status === 401 || err?.status === 403) {
    return 'API 키가 올바르지 않거나 권한이 없습니다. 상단 프로필 버튼에서 API 키를 다시 확인해주세요.';
  }

  if (err?.status === 429) {
    return 'AI 제공자의 사용량 한도 또는 요청 제한에 도달했습니다. 잠시 후 다시 시도하거나 결제/쿼터를 확인해주세요.';
  }

  return err?.message || '메일 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

export const useMailStore = create((set, get) => ({
  customerName: '',
  taskType: 'proposal',
  attachmentName: '',
  additionalRequest: '',
  tone: 'polite',
  aiProvider: 'gemini',
  apiKey: '',
  aiModel: 'gemini-2.5-flash',
  ...RESULT_DEFAULTS,
  update: (patch) => set(patch),
  resetResult: () => set(RESULT_DEFAULTS),
  runSecurityPreview: () => {
    const { customerName, attachmentName, additionalRequest } = get();
    const combined = [customerName, attachmentName, additionalRequest].filter(Boolean).join(' \n ');
    return detectSensitive(combined);
  },
  generate: async () => {
    const state = get();
    if (state.isGenerating) return;

    if (!state.apiKey.trim()) {
      set({
        securityError: getApiKeyMissingMessage(state),
        errorType: 'configuration',
        detectedItems: [],
        securityPassed: false,
        hasGenerated: false,
        isGenerating: false,
        isStreaming: false,
        generatedTitle: '',
        generatedBody: '',
        smsText: '',
        kakaoText: '',
      });
      return;
    }

    const combined = [state.customerName, state.attachmentName, state.additionalRequest]
      .filter(Boolean)
      .join(' \n ');
    const detected = detectSensitive(combined);
    if (detected.length > 0) {
      set({
        securityError:
          '개인정보 또는 민감정보가 포함되어 있어 메일을 생성할 수 없습니다. 해당 정보를 제거한 후 다시 시도해주세요.',
        errorType: 'security',
        detectedItems: detected,
        securityPassed: false,
        hasGenerated: false,
        isGenerating: false,
        isStreaming: false,
        generatedTitle: '',
        generatedBody: '',
        smsText: '',
        kakaoText: '',
      });
      // 보안 검수 실패 통계 기록 (개인정보는 저장하지 않음)
      await recordGenerationLog({
        taskType: state.taskType,
        tone: state.tone,
        securityPassed: false,
        createdAt: new Date().toISOString(),
      });
      return;
    }
    set({
      securityError: '',
      errorType: '',
      detectedItems: [],
      securityPassed: true,
      isGenerating: true,
      isStreaming: true,
      hasGenerated: true,
      generatedTitle: '',
      generatedBody: '',
      smsText: '',
      kakaoText: '',
    });
    const taskLabel = TASK_TYPES.find((t) => t.value === state.taskType)?.label || '';
    const toneLabel = TONES.find((t) => t.value === state.tone)?.label || '';
    const prompt = `증권사 직원이 고객에게 보낼 업무 이메일을 작성해줘.
[입력 정보]
- 고객명: ${state.customerName || '고객'}
- 업무 유형: ${taskLabel}
- 첨부파일명: ${state.attachmentName || '없음'}
- 추가 요청사항: ${state.additionalRequest || '없음'}
- 톤: ${toneLabel}
[작성 규칙]
- 선택한 톤을 반영하되 공손한 비즈니스 문체를 유지해줘.
- 인사말 → 용건 → 첨부파일 안내 → 마무리 인사 순서로 본문을 구성해줘.
- 첨부파일명이 없음이면 첨부 안내 문장은 생략해줘.
- 과장된 투자 표현이나 원금·수익 보장 표현은 절대 쓰지 마.
- 확인되지 않은 수익률, 금액 등 구체적 금융 수치는 임의로 만들지 마.
- 지나치게 길지 않게, 금융권 표준 문체로 작성해줘.
- 회사명이 필요하면 한국투자증권으로 표기해줘.
- 본문 마지막 서명은 [담당자명] / 한국투자증권 형태의 자리표시자로 넣어줘.
[출력 형식] 아래 형식을 반드시 그대로 지켜줘. 다른 설명은 출력하지 마.
===제목===
(이메일 제목 한 줄)
===본문===
(이메일 본문)`;
    try {
      const res = await generateWithLlm({
        provider: state.aiProvider,
        apiKey: state.apiKey.trim(),
        model: getModel(state),
        prompt,
      });
      const full = res.text || '';
      let { title, body } = parseEmail(full);
      if (!title && !body) {
        body = full.trim();
      }
      set({ generatedTitle: title, generatedBody: body, isGenerating: false, isStreaming: false });
      // 생성 통계 기록 (개인정보·본문 원문은 저장하지 않음)
      await recordGenerationLog({
        taskType: state.taskType,
        tone: state.tone,
        securityPassed: true,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      set({
        isGenerating: false,
        isStreaming: false,
        errorType: getLlmErrorType(err),
        securityError: getLlmErrorMessage(err),
      });
    }
  },
  convertSms: async () => {
    const state = get();
    const { generatedBody, smsLoading } = state;
    if (!generatedBody || smsLoading) return;
    if (!state.apiKey.trim()) {
      set({ smsText: getApiKeyMissingMessage(state) });
      return;
    }

    set({ smsLoading: true, smsText: '' });
    try {
      const res = await generateWithLlm({
        provider: state.aiProvider,
        apiKey: state.apiKey.trim(),
        model: getModel(state),
        prompt: `아래 이메일 본문을 고객에게 보낼 SMS 단문(90자 내외)으로 재구성해줘. 핵심 안내만 간결하고 정중하게 담고, 다른 설명 없이 SMS 문구만 출력해줘.\n\n${generatedBody}`,
      });
      set({ smsText: (res.text || '').trim(), smsLoading: false });
    } catch (err) {
      set({
        smsLoading: false,
        smsText: getLlmErrorMessage(err),
      });
    }
  },
  convertKakao: async () => {
    const state = get();
    const { generatedBody, kakaoLoading } = state;
    if (!generatedBody || kakaoLoading) return;
    if (!state.apiKey.trim()) {
      set({ kakaoText: getApiKeyMissingMessage(state) });
      return;
    }

    set({ kakaoLoading: true, kakaoText: '' });
    try {
      const res = await generateWithLlm({
        provider: state.aiProvider,
        apiKey: state.apiKey.trim(),
        model: getModel(state),
        prompt: `아래 이메일 본문을 카카오톡 비즈니스 알림톡 형태의 안내 메시지로 재구성해줘. 짧은 인사말과 핵심 안내를 포함하고, 친근하면서도 정중한 문체로. 다른 설명 없이 카카오톡 메시지 문구만 출력해줘.\n\n${generatedBody}`,
      });
      set({ kakaoText: (res.text || '').trim(), kakaoLoading: false });
    } catch (err) {
      set({
        kakaoLoading: false,
        kakaoText: getLlmErrorMessage(err),
      });
    }
  },
}));
