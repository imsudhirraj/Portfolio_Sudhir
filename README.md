# PortfolioAI 🚀
### AI-Powered Portfolio Builder SaaS Platform (100% Database-Free Architecture)

PortfolioAI is a modern, production-grade AI-powered portfolio builder SaaS application. It allows professionals and engineers to sign in with Google, upload their resume (PDF/DOCX), extract structured information using AI, review and approve suggestions without overwriting existing data, customize themes, preview live across devices, and publish a lightning-fast public portfolio URL.

---

## ⚡ Key Architectural Highlights

### 1. 100% Database-Free (JSON / File Persistence)
* **Zero Relational / NoSQL Database**: No SQL Server, PostgreSQL, MySQL, SQLite, MongoDB, Redis, or Entity Framework.
* **Pure JSON Atomic Storage**: Implemented via `JsonFileStorageService` using atomic write patterns:
  1. Write to temporary file (`.tmp`)
  2. Flush buffers to disk
  3. Atomic replace / move onto target file
* **Automatic Backup Rotation**: Preserves prior versions (`portfolio.backup1.json` through `portfolio.backup3.json`).
* **Path Traversal Protection**: Validates and confines all operations strictly within the configured storage root, rejecting `..`, absolute paths, and encoded traversal attacks.
* **Safe Concurrent Public Slugs**: Managed via thread-safe locked index `/storage/public/slugs.json`.

```
storage/
├── public/
│   └── slugs.json             <-- Public URL slug registry: { "sudhir-raj": "10823492384923" }
└── users/
    └── 10823492384923/        <-- Unique Google User ID
        ├── profile.json
        ├── portfolio.json     <-- Current active portfolio
        ├── settings.json      <-- Theme mode & resume privacy preferences
        ├── resume/
        │   ├── resume.pdf     <-- Safe server-side filename with magic-byte validation
        │   └── metadata.json
        └── ai/
            └── latest-analysis.json <-- Extracted AI suggestions awaiting user review
```

---

## 🛡️ Security & Privacy Architecture

* **Strict User Isolation**: All protected API controllers derive user identity solely from server-side JWT claims via `IUserContext`. Client-supplied user IDs or path parameters are never trusted.
* **Resume Magic-Byte Validation**: File uploads are inspected for true binary headers (`%PDF` for PDF, `PK\x03\x04` for DOCX) rather than relying on MIME-types or file extensions.
* **Prompt Injection Protection**: Uploaded resume text is treated as strictly untrusted input data. The AI service wraps the text in boundary delimiters with explicit instructions forbidding uploaded documents from altering system behavior.
* **Safe AI Review Workflow**: AI suggestions are stored in a dedicated `ai/latest-analysis.json` file. The portfolio is **never** blindly overwritten. Users review each field with confidence scores and choose **Accept**, **Edit**, or **Ignore**.
* **Public vs. Private Data Separation**: Public endpoints (`GET /api/public/{slug}`) return a sanitized `PublicPortfolioDto` that completely omits internal Google user IDs, filesystem paths, raw AI analyses, and account settings.
* **Account Deletion & Resume Privacy**: Users can choose to automatically delete resumes post-analysis or delete their entire account and storage directory with a single verified action.

---

## 🎨 Design System & Themes

* **Modern SaaS Aesthetic**: Designed with inspiration from Linear, Vercel, and Notion — deep dark mode tokens, soft glassmorphism, crisp borders, and refined typography (Inter, Plus Jakarta Sans, JetBrains Mono, Playfair Display).
* **4 Distinct Themes**:
  1. **Minimal**: Clean, high-whitespace, recruiter-friendly typography.
  2. **Executive**: Refined corporate navy and slate palette with subtle elevation.
  3. **Developer**: Tech-focused terminal styling, monospace highlights, and subtle accents.
  4. **Elegant**: Editorial serif headers, warm neutral borders, and sophisticated layout.
* **Live Multi-Device Preview**: Interactive viewport toggling between Desktop, Tablet (768px), and Mobile (375px) with real-time reactive updates as you edit.

---

## 🛠️ Technology Stack

### Backend
* **ASP.NET Core Web API (.NET 9, C#)**
* **Nullable Reference Types** enabled & strict error handling
* **Authentication**: Google OAuth2 / OpenID Connect + JWT Bearer tokens
* **Document Extraction**: `UglyToad.PdfPig` (PDF text extraction) and `DocumentFormat.OpenXml` (DOCX parsing)
* **AI Provider Abstraction**: `IResumeAIService` with Gemini 1.5 Flash integration and offline deterministic fallback
* **Testing**: xUnit with 18 automated unit and integration tests

### Frontend
* **Angular 20 (v19.2 stable)**
* **Architecture**: Standalone Components, Angular Signals, Reactive Forms, RxJS
* **Styling**: SCSS Design System with custom CSS custom properties (Dark/Light/System themes)
* **SEO**: Dynamic Title, Meta tags, OpenGraph tags, and JSON-LD Person schema on public portfolios

---

## 🚀 Getting Started

### Prerequisites
* [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
* [Node.js 18+](https://nodejs.org/) & npm

### 1. Run the Backend API
```bash
cd backend/PortfolioAI.Api
dotnet run --urls http://localhost:5000
```
*API Swagger UI is available at `http://localhost:5000/swagger` in Development mode.*

### 2. Run the Angular Frontend
```bash
cd frontend
npm install
npm start
```
*Frontend application will be accessible at `http://localhost:4200`.*

### 3. Run Backend Automated Tests
```bash
dotnet test backend/PortfolioAI.Tests
```
*Executes all 18 unit tests validating storage atomicity, path traversal guards, magic bytes, user isolation, and slug concurrency.*

---

## 🧪 Testing Credentials / Dev Quick Login

For local development without live Google Client credentials:
1. Open `http://localhost:4200/login`
2. Click **Developer Quick Login (Sudhir Raj)**
3. The application will generate a valid development JWT token with user ID `10823492384923` and initialize the default portfolio in `/storage/users/10823492384923/portfolio.json`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/google` | Exchange Google ID token for PortfolioAI JWT | No |
| `POST` | `/api/auth/dev-login` | Local development token generation | No |
| `GET` | `/api/portfolio` | Retrieve authenticated user's portfolio | Yes |
| `PUT` | `/api/portfolio` | Full update of user portfolio | Yes |
| `PUT` | `/api/portfolio/profile` | Update profile information | Yes |
| `PUT` | `/api/portfolio/summary` | Update professional summary | Yes |
| `PUT` | `/api/portfolio/theme` | Update theme & custom colors | Yes |
| `PUT` | `/api/portfolio/sections` | Reorder & toggle sections | Yes |
| `POST` | `/api/portfolio/publish` | Register slug & publish portfolio | Yes |
| `POST` | `/api/portfolio/unpublish` | Unpublish and remove public slug | Yes |
| `POST` | `/api/resume/upload` | Upload PDF/DOCX resume | Yes |
| `GET` | `/api/resume/download` | Download uploaded resume | Yes |
| `DELETE` | `/api/resume` | Delete stored resume | Yes |
| `POST` | `/api/resume/analyze` | Parse resume & generate AI suggestions | Yes |
| `GET` | `/api/ai/latest-analysis` | Get latest AI suggestions | Yes |
| `POST` | `/api/ai/apply-suggestions` | Selectively merge approved AI items | Yes |
| `POST` | `/api/ai/improve-summary` | AI text polish for summary | Yes |
| `POST` | `/api/ai/improve-project` | AI text enhancement for projects | Yes |
| `POST` | `/api/ai/generate-headline` | AI professional headline generation | Yes |
| `GET` | `/api/settings` | Get user theme & privacy preferences | Yes |
| `PUT` | `/api/settings` | Update user settings | Yes |
| `DELETE` | `/api/settings/delete-account`| Completely erase user directory | Yes |
| `GET` | `/api/public/{slug}` | Public, sanitized portfolio lookup | **No** |
