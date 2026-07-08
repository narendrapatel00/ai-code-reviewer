# AI Code Reviewer – Intelligent Code Analysis Platform

🚀 **Live Deployment:** [https://ai-code-reviewer-mfno.vercel.app](https://ai-code-reviewer-mfno.vercel.app)

An intelligent, full-stack AI-powered code analysis platform designed for modern developers. Paste code, upload files, or trigger comparisons to get detailed feedback on security, performance, clean code best practices, and maintainability.

---

## 🌟 Core Features

- **AI Code Review Pipeline**: Automatic scan of code scripts for bug detection, security vulnerabilities, performance hot spots, readability, and design pattern improvements.
- **Interactive Code Compare**: Side-by-side Monaco Diff Editor comparing file versions with structural AI diff analysis highlighting changes, improvements, and regressions.
- **Contextual AI Chat Panel**: Sidebar chat drawer equipped with quick shortcuts (*Explain Code*, *Generate Unit Tests*, *Document Code*, *Convert Language*) to discuss refactoring actions.
- **Complexity & Dependency Visualizer**:
  - Computes **Cyclomatic Complexity** (decision structures) and **Cognitive Load** (indent depths).
  - Renders a interactive SVG **import dependency graph** showing linkages between modules.
- **Global Command Palette**: Fuzzy-search routing overlay triggered via `Ctrl+K` / `Cmd+K` for instant page navigation and theme toggling.
- **Demo Mode Sandbox**: Full cookie-based session database bypass allowing instant trial access with fully functional mock data storage and AI engine hooks.
- **SaaS Export & Reporting**: Download analysis reports directly to PDF, Markdown, or JSON.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling & UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Code Inputs**: Monaco Editor (with `DiffEditor` support)
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth
- **AI Model Engine**: Groq Cloud API (Llama 3 / Mixtral) / OpenAI BYOK API

---

## ⚙️ Local Development

### 1. Environment Setup
Clone the repository and duplicate `.env.example` as `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Optional Supabase variables (leaving blank defaults to Demo Sandbox Mode)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Provider Credentials
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Deployment

### Deploying to Vercel
1. Link your repository in the Vercel Dashboard.
2. In the Environment Variables configuration, add:
   - `GROQ_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
3. Build & Deploy. (If your host environment experiences SWC node binding issues, the Next configuration will fall back to the Webpack bundler automatically).
