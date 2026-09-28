# 🌐 Universal AI Agent Operating Protocol (AGENTS.md)

> **Universal Master Directive:** Any AI agent working on this codebase (or any project containing this file) MUST strictly adhere to the standards, architectural patterns, security rules, and scalability protocols outlined below.

---

## 🏛️ 1. Database & Live Synchronization Protocol (`Supabase / PostgreSQL`)

### 1.1 Zero-Mock & Live-Sync Rule
- **Never rely on hardcoded mock data** for core features when a database connection is configured.
- **Rule of Atomic Sync:** Whenever modifying `schema.sql` or frontend database queries, **DO NOT STOP AT LOCAL CODE EDITS**. You must immediately execute the corresponding SQL updates against the live database instance (via Supabase MCP `execute_sql` or migration CLI).

### 1.2 Mandatory 5-Layer Security & Tenant Isolation
Every table and function in the database MUST satisfy:
1. **Row-Level Security (RLS) Active:** Every table must have `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`.
2. **Tenant Isolation:**
   - Parent tables: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`.
   - Child tables: Cascading ownership check linked back to `projects.user_id` or parent `user_id`.
   - Unauthenticated visitors evaluate to `auth.uid() = NULL` and receive **`0 rows`**.
3. **Super Admin Authorization Guards:** Every `SECURITY DEFINER` administrative function must check `is_super_admin()` and reject unauthorized callers with a 403 exception.
4. **Server-Side Secret Masking:** Never return plaintext API keys or credentials in list queries. Mask the center using `mask_api_secret()`.
5. **Route Guards:** Pair database security with React client-side guards (`RequireAuth` and `RequireSuperAdmin`).

---

## 🛡️ 2. Comprehensive Security Engineering Standards

### 2.1 Zero-Trust Multi-Tenant Isolation
- Every database query filtering by ID must also verify tenant ownership (`.eq('user_id', user.id)` or via PostgreSQL RLS).
- Prevent IDOR (Insecure Direct Object Reference) by ensuring foreign keys cannot be hijacked by passing another user's UUID.

### 2.2 Input Sanitization & Attack Mitigation
- **SQL Injection:** Always use parameterized queries or Supabase client SDK bindings (`.eq()`, `.in()`). Never concatenate user input directly into raw SQL strings.
- **XSS & HTML Injection:** Sanitize user-provided text, markdown, or rich text before rendering.
- **Payload Validation:** Validate schema and types for all incoming request bodies on edge functions and client handlers before processing.

### 2.3 Secret Encapsulation & Environment Security
- Never hardcode API keys, service role secrets, or private certificates into client code.
- Client `.env` files must only contain public identifiers (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Elevated secrets (e.g. `SUPABASE_SERVICE_ROLE_KEY`) belong exclusively in backend edge functions or database vaults.

---

## 📈 3. Scalability & High-Throughput Engineering Standards

### 3.1 PostgreSQL Indexing & Query Optimization
- **Foreign Key Indexing:** Every foreign key column used in joins or RLS policies (`user_id`, `project_id`, `epic_id`, `story_id`, `assigned_to`) MUST have a corresponding B-Tree index:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_epics_project_id ON epics(project_id);
  CREATE INDEX IF NOT EXISTS idx_stories_epic_id ON stories(epic_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_story_id ON tasks(story_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  ```
- **Compound Indexes:** Add compound indexes for frequently filtered combinations (e.g., `(user_id, created_at DESC)`).
- **Pagination & Result Limits:** Always enforce `LIMIT` (or keyset pagination) on list queries to prevent full-table scans when datasets grow to millions of rows.

### 3.2 Connection Pooling & Resource Management
- Utilize Supavisor / PgBouncer connection pooling for high-concurrency client connections.
- Keep database transactions short and avoid holding row locks across external network calls.

### 3.3 Client-Side & Edge Caching
- Cache static or infrequently changing configuration in memory or local storage.
- Implement optimistic UI updates so user interactions feel instantaneous while background database synchronization runs asynchronously.

---

## ⚡ 4. Token-Optimization & Document Parsing Protocol

### 4.1 The 90% Token Reduction Standard
- **Never send raw multi-page PDF images directly to vision LLMs** when text can be extracted. Raw vision parsing consumes ~250–1,000+ tokens per page and hallucinates on small text.
- **Client-Side Structuring (`pdfjs-dist`):** Extract document text in the browser or edge runtime before sending to the LLM:
  1. Group lines by physical coordinate positions ($Y$-axis).
  2. Strip recurring boilerplate: page numbers (*"Page 1 of 12"*), headers, and legal disclaimers.
  3. Detect semantic hierarchy: Convert sections into `#`, `##`, `###` headings and normalize bullet lists.
  4. Format tables into standard Markdown grids (`| Col 1 | Col 2 |`).
- **Scanned Fallback:** If extracted text is under 30 characters (e.g. image-only scans), automatically fall back to base64 multimodal ingestion.

---

## 🔑 5. Multi-Key AI Engine & Failover Gateway

### 5.1 High-Availability AI Ingestion
- **Key Pool Rotation:** Rotate requests across active keys in the database pool (`platform_api_keys`).
- **Automatic Quota Failover:** Wrap LLM API calls in a loop. If an API key encounters an HTTP 429 (Rate Limit) or exhausted quota, automatically log a warning and fail over to the next candidate key without crashing the user's workflow.
- **Dynamic Hot-Reloading:** Always fetch the latest active key pool from the database before executing AI operations so admin changes take effect immediately.

---

## 🎨 6. Enterprise UI & Iconography Standards (Zero-Emoji Rule)

### 6.1 Strict Prohibition of Raw Emojis as UI Icons
- **Never use raw emoji characters as UI icons:** Do not use emoji characters (e.g. 👑, 💻, 👁️, 🚀, ⚡, 🎉, 🔥) inside badges, pills, buttons, tables, or navigation headers. Raw emojis look childish, render inconsistently across OS platforms (Windows vs macOS vs Linux), and break professional enterprise SaaS aesthetics.
- **Mandatory SVG / Vector Icon Usage:** Always use clean, professional vector icons from established libraries (e.g., `lucide-react` like `<Crown size={12} />`, `<Code2 size={12} />`, `<ShieldCheck size={12} />`, `<Eye size={12} />`).
- **Pill & Badge Design Standard:** Style role badges with subtle tinted backgrounds, refined borders, and crisp monochrome/themed SVG icons (e.g., `bg-purple-50 text-purple-800 border-purple-200`).

---

## 👥 8. Team Member Auth Provisioning Protocol (`Supabase Auth & Roles`)

### 8.1 Dual-Layer Auth & Roster Synchronization
- **Mandatory `auth.users` Ingestion:** Whenever a manager adds or invites a team member (Frontend, Backend, QA, etc.), the backend procedure `provision_team_member_auth()` MUST create the user account in Supabase **`auth.users`** (with secure bcrypt encryption) and **`auth.identities`** alongside the `public.team_members` row.
- **Login Readiness:** Every team member added to a squad must be immediately enabled to sign in at `/login` with their provisioned email & password credentials.
- **Role & Org Metadata:** Always synchronize user metadata (`name`, `role`, `permission`, `organization`, `avatarColor`) into `raw_user_meta_data`.

---

## 🗂️ 9. Project Lifecycle & Cascade Management

### 9.1 Manager Cascade Deletion Standard
- **Zero Orphaned Records:** Project deletions triggered by managers from the Dashboard or Board dropdowns must perform cascade deletions in atomic sequence: `tasks` ➔ `stories` ➔ `epics` ➔ `projects`.
- **UI Confirmation Safeguard:** Always present a confirmation modal dialog with explicit cascade warnings before executing destructive deletion.
- **Active Board Hot-Swapping:** After a project is deleted, seamlessly switch the active project ID in `AuthContext` to the next available board or to `'ALL'` (Unified Portfolio View).

---

## 🎯 10. Dynamic Role Allocation & Board Filtering

### 10.1 Zero Hardcoded Role Filters
- **Dynamic Filter Generation:** Role filters on sprint boards MUST be dynamically derived from the actual tasks present in the workspace (`['ALL', ...new Set(tasks.map(t => t.requiredRole))]`).
- **No Ghost Roles:** Never render hardcoded role pills (e.g., `DB`) if no tasks with that role exist in the current project.
- **Smart AI Task Allocation:** AI SRS ingestion engines must prioritize assigning tasks to real active team members in `team_members` based on matched skill sets (`FE` ➔ Frontend, `BE` ➔ Backend).

---

## 🧪 11. Build Verification & Code Integrity Protocol

### 11.1 Verification Checklist Before Completion
Before reporting any task complete, the agent MUST:
1. Run the production build (`npm run build`) to ensure zero JSX syntax, import, or TypeScript errors.
2. Verify all routes, components, and stored procedures match 100% between frontend calls and SQL definitions.
3. Keep project documentation updated (`PROJECT_HANDOVER_AND_STATUS.md` and `AGENTS.md`).

---

*This protocol serves as the permanent, universal engineering blueprint for all future agentic workflows.*

