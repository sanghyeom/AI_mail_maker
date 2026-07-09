# AI 고객 메일 작성기

Base source frontend built with **React 18** + **Vite** + **TailwindCSS 3**.

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

### 3. Connect an AI provider

Open the profile button in the top-right header and enter either an OpenAI or Gemini API key.

- The API key is kept in browser memory only.
- Refreshing the page clears the key.
- Usage and billing belong to the API key owner.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (port 5173) |
| `npm run dev:low-mem` | Start dev server with low memory mode (256MB) |
| `npm run build` | Build for production |
| `npm start` | Serve the production build with the LLM API route |
| `npm run preview` | Preview static frontend only; LLM API calls are not available |

Production-style local run:

```bash
npm run build
npm start
```

---

## Local Development Notes

The app can run locally without VibeX iframe tooling. These features are disabled by default:

| Variable | Default | Description |
|---|---:|---|
| `VITE_ENABLE_VIBEX_TOOLS` | `false` | Enables VibeX visual-edit/iframe development scripts |
| `VITE_ENABLE_GENERATION_LOGS` | `false` | Enables `GenerationLog` writes to the VibeX entities API |

Enable `VITE_ENABLE_GENERATION_LOGS` only from an origin allowed by the VibeX backend. Otherwise the API returns `403 Origin not allowed`.
