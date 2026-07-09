import AIFlowClient from '@devvibex/aiflow';
// The appId is injected at build time by the platform gateway.
// NO API KEY is needed — credit billing is handled server-side.
export const aiflow869 = new AIFlowClient({
  appId: 'ck-mwDPJSoWXgkePno5b7ZED7PkNYORzs0Jb7xe8k1mJ2c',
  baseUrl: 'https://app.vibe-x.app/v1/aiflow',
});
// Pre-warm the server config (default models, system prompt, limits).
export const aiflow869ConfigPromise = aiflow869.getConfig().catch((err) => {
  console.warn('AIFlow config preload failed:', err?.message);
  return null;
});