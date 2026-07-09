const MAX_BODY_BYTES = 32 * 1024;

const PROVIDERS = {
  openai: {
    label: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
  },
  gemini: {
    label: 'Gemini',
    defaultModel: 'gemini-2.5-flash',
  },
};

const SYSTEM_PROMPT =
  '당신은 대한민국 증권사의 영업 및 WM 부서 직원을 돕는 고객 업무 메일 작성 보조 AI입니다. 금융권 표준 문체로 정중하고 신뢰감 있게 작성합니다. 과장된 투자 표현이나 원금 및 수익 보장 표현은 절대 사용하지 않고, 확인되지 않은 수익률, 금액, 금융 수치는 임의로 만들어내지 않습니다. 사용자가 요청한 출력 형식을 정확히 지키고 다른 부가 설명은 덧붙이지 않습니다.';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = '';

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(createHttpError(413, '요청 데이터가 너무 큽니다.'));
        req.destroy();
        return;
      }

      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(createHttpError(400, '요청 형식이 올바르지 않습니다.'));
      }
    });

    req.on('error', reject);
  });
}

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

function resolveProvider(provider) {
  const normalized = String(provider || '').toLowerCase();
  if (!PROVIDERS[normalized]) {
    throw createHttpError(400, '지원하지 않는 AI 제공자입니다.');
  }

  return normalized;
}

function resolveModel(provider, model) {
  const trimmed = String(model || '').trim();
  return trimmed || PROVIDERS[provider].defaultModel;
}

function requireApiKey(apiKey) {
  const key = String(apiKey || '').trim();
  if (!key) {
    throw createHttpError(400, 'API 키를 입력해주세요.');
  }

  return key;
}

function extractOpenAIText(payload) {
  if (typeof payload?.output_text === 'string') {
    return payload.output_text;
  }

  const parts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') {
        parts.push(content.text);
      }
    }
  }

  return parts.join('\n').trim();
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join('\n')
    .trim();
}

async function readProviderError(res) {
  const text = await res.text();
  if (!text) return `AI 제공자 요청이 실패했습니다. (${res.status})`;

  try {
    const data = JSON.parse(text);
    return (
      data?.error?.message ||
      data?.message ||
      data?.error ||
      `AI 제공자 요청이 실패했습니다. (${res.status})`
    );
  } catch {
    return text.slice(0, 300);
  }
}

function mapProviderStatus(status) {
  if (status === 401 || status === 403) return 401;
  if (status === 429) return 429;
  if (status === 402) return 402;
  return status >= 400 && status < 500 ? 400 : 502;
}

async function callOpenAI({ apiKey, model, prompt }) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_output_tokens: 1600,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    throw createHttpError(mapProviderStatus(res.status), await readProviderError(res));
  }

  const data = await res.json();
  const text = extractOpenAIText(data);
  if (!text) {
    throw createHttpError(502, 'OpenAI 응답에서 텍스트를 찾지 못했습니다.');
  }

  return text;
}

async function callGemini({ apiKey, model, prompt }) {
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  );
  url.searchParams.set('key', apiKey);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1600,
        temperature: 0.4,
      },
    }),
  });

  if (!res.ok) {
    throw createHttpError(mapProviderStatus(res.status), await readProviderError(res));
  }

  const data = await res.json();
  const text = extractGeminiText(data);
  if (!text) {
    throw createHttpError(502, 'Gemini 응답에서 텍스트를 찾지 못했습니다.');
  }

  return text;
}

export async function handleLlmGenerateRequest(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'POST 요청만 지원합니다.' });
    return;
  }

  try {
    const body = await readBody(req);
    const provider = resolveProvider(body.provider);
    const apiKey = requireApiKey(body.apiKey);
    const model = resolveModel(provider, body.model);
    const prompt = String(body.prompt || '').trim();

    if (!prompt) {
      throw createHttpError(400, '프롬프트가 비어 있습니다.');
    }

    const text =
      provider === 'openai'
        ? await callOpenAI({ apiKey, model, prompt })
        : await callGemini({ apiKey, model, prompt });

    sendJson(res, 200, {
      provider,
      model,
      text,
    });
  } catch (err) {
    sendJson(res, err.status || 500, {
      message: err.message || 'AI 생성 중 오류가 발생했습니다.',
    });
  }
}

export function isLlmGeneratePath(url = '') {
  return url.split('?')[0] === '/api/llm/generate';
}
