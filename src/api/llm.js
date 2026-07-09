export async function generateWithLlm({ provider, apiKey, model, prompt }) {
  const res = await fetch('/api/llm/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider,
      apiKey,
      model,
      prompt,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.message || 'AI 생성 중 오류가 발생했습니다.');
    err.status = res.status;
    throw err;
  }

  return data;
}
