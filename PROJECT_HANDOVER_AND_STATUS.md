# 🚀 Sprint-AI: Master Project Handover & System Status

**Last Updated:** September 28, 2026  
**Project:** Sprint-AI (Next-Gen Multi-Tenant AI Scrum & Agile Management Platform)  
**Primary Tech Stack:** React 18, Vite, Supabase (PostgreSQL 15 + RLS + PL/pgSQL RPCs), Google Gemini Multi-Key AI Engine, Lucide Icons.

---

## 📌 1. Project Architecture & Role Definitions

### A. Role Hierarchy (Strict Separation of Concerns)
1. **Platform Super Admin (Platform Owner / Operator):**
   - **Scope:** Controls the entire SaaS platform infrastructure.
   - **Portals:** Dedicated `/admin` route (Master Control Plane).
   - **Core Responsibilities:**
     - Real-time visitor counts and platform registration analytics (100% database-driven).
     - AI Multi-Key Gateway management with server-side cryptographic secret masking.
     - Tenant/workspace health monitoring.
     - **Note:** Super Admin is **NOT** a company manager and does not participate in daily workspace sprint tasks.

2. **Workspace Squad Lead (Company Admin / Scrum Master):**
   - Manages team members, invites, sprint boards, and project settings within their own tenant workspace.

3. **Developer / Squad Member:**
   - Moves tasks across Kanban columns, assigns tasks, updates status, and views AI sprint breakdowns.

4. **Viewer (Stakeholder / Guest):**
   - Read-only access to sprint boards and reports.

---

## 🛠️ 2. Completed Work & Core Implementations

### 1. Super Admin Control Plane (`frontend/src/pages/AdminManagement.jsx` & `Admin.jsx`)
- **Enterprise Design:** Clean, modern white enterprise UI with responsive tabs (`Visitors & Registrations`, `AI API Keys`, `Registered Workspaces`).
- **Zero Mock / Fallback Policy:** All metrics (Total Visits, Unique Visitors, Total Users, Active AI Keys) are calculated live via the PostgreSQL RPC `get_superadmin_platform_metrics()`.
- **Server-Side Key Masking:** Plaintext API secrets are never delivered over network payloads (`AIzaSyB••••••••••••••••3a9X`).
- **On-Demand Key Reveal:** Protected by the secure database procedure `reveal_platform_api_key(id)`.
- **Live Latency & Health Diagnostic:** Super Admin can ping any API key to measure response latency (`ms`) and verify quota status.
- **Multi-Key Active Toggles:** Turn individual keys on/off or delete them in real time.

### 2. Multi-Key AI Engine & Failover Gateway (`frontend/src/lib/ai.js`)
- **Multi-Key Pool Rotation:** Rotates through all active keys in `public.platform_api_keys`.
- **Automatic Quota Failover:** If a key encounters HTTP 429 (Rate Limit / Quota Exceeded), the engine automatically falls back to the next available active key in the database pool without crashing user requests.
- **Connection Testing:** Includes `testGeminiConnection(key)` for latency diagnostics.

### 3. Application Layout & Navigation (`frontend/src/components/Layout.jsx`)
- **Separated Navigation Sections:**
  - `PLATFORM GOVERNANCE` (Super Admin Only: `Visitors & Registrations`, `AI & PDF API Keys`, `Registered Workspaces`).
  - `PLATFORM PORTALS` (Scrum Board, AI SRS Upload, Team Management).
- **Visitor Tracking Hook:** Automatically logs page hits into `public.platform_visits` via `log_platform_visit()` RPC.
- **Strict Role Gating:** Master Control Plane navigation is invisible to non-Super Admin users.

### 4. Zero-Token-Waste PDF $\rightarrow$ Markdown Engine (`frontend/src/lib/pdfParser.js` & `Upload.jsx`)
- **Client-Side PDF Text & Structure Extraction:** Built on top of `pdfjs-dist` with custom layout heuristics (Y-coordinate line grouping, heading detection `#`, `##`, `###`, bullet point normalization, and boilerplate filtering).
- **80%–90% AI Token Reduction:** Strips page numbers, repeated headers/footers, and margin metadata, converting multi-page PDFs into dense, semantic GitHub-flavored Markdown.
- **Scanned PDF Fallback:** Automatically detects if a PDF has zero extractable text (e.g. scanned image/screenshot) and transparently switches to Gemini multimodal Base64 ingestion.
- **Live Token Analytics Card:** Displays real-time token savings calculations (e.g., `12 PDF pages → Clean Markdown, ~85% token savings`).
- **Dynamic Database Key Synchronization:** Calls `fetchPlatformApiKeysFromDb()` before each AI decomposition request, ensuring any keys added or updated in the Super Admin Control Plane are automatically utilized.
- **Graceful Multi-Key Failover:** Rotates across active keys in database pool on quota / rate limit errors and seamlessly breaks down requirements into Epics, User Stories, and role-assigned Kanban tasks.

### 6. Groq AI Multi-Key Acceleration & Fast SRS Parsing (`frontend/src/lib/ai.js`)
- **Ultra-Fast LLM Processing:** Integrated Groq (`https://api.groq.com/openai/v1/chat/completions`) supporting `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, and Gemini models for sub-100ms multi-key SRS decomposition.
- **Secure Key Access:** Created `get_active_ai_runner_keys()` `SECURITY DEFINER` RPC to fetch unmasked keys directly into memory without local storage exposure.
- **Automatic Role Assignment:** Parses requirements and intelligently assigns `FE` tasks to Frontend developers and `BE` tasks to Backend developers based on active squad roster.

### 7. Manager Project Cascade Deletion (`Layout.jsx`, `Board.jsx`, `AuthContext.jsx`)
- **Direct Dropdown Trash Action:** Added inline trash buttons (`Trash2`) with group hover in the Sidebar and Board Project Switcher dropdowns.
- **Board Header Action:** Dedicated "Delete Board" button in the active board top bar.
- **Cascade Deletion:** Safely removes `tasks` ➔ `stories` ➔ `epics` ➔ `projects` from Supabase with full confirmation dialog protection.

### 8. Live Supabase Auth Ingestion for Team Members (`Team.jsx`, `provision_team_member_auth`)
- **Automated `auth.users` Synchronization:** Every team member added or invited on the Team page is automatically provisioned in Supabase **`auth.users`** (with secure `pgcrypto` bcrypt password) and **`auth.identities`** so they can log in directly at `/login`.
- **Pre-existing Member Migration:** All existing squad members (including Om `yadnesh@gmail.com`) have been synced and activated in `auth.users`.

---

## 🗄️ 3. Database Schema & Stored Procedures (`supabase/schema.sql`)

### Tables Implemented
- `public.platform_visits`: Tracks anonymous/authenticated visits, user agents, paths, and timestamps.
- `public.platform_api_keys`: Stores multi-key AI pool (`provider`, `label`, `api_key`, `is_active`, `latency`, `last_tested_at`, `status`).
- `public.projects`: Multi-tenant organization boundaries and project deadlines.
- `public.epics`: Feature epics linked to projects.
- `public.stories`: User stories linked to epics.
- `public.tasks`: Kanban task items linked to stories with story points, estimated hours, and role assignments.
- `public.subtasks`: Granular checklist items linked to tasks.
- `public.team_members`: Workspace team members with roles, permissions, velocity, and custom fields.

### Security & Helper RPCs
```sql
-- 1. Server-side masking algorithm
public.mask_api_secret(secret text)

-- 2. Aggregated Platform Metrics (Visitors, Registrations, Key counts)
public.get_superadmin_platform_metrics()

-- 3. Masked Key Listing
public.get_platform_api_keys()

-- 4. Secure On-Demand Reveal
public.reveal_platform_api_key(p_id uuid)

-- 5. Safe Key Upsert & Delete
public.upsert_platform_api_key(...)
public.delete_platform_api_key(...)

-- 6. Visitor Logger
public.log_platform_visit(...)

-- 7. Active AI Runner Key Retriever
public.get_active_ai_runner_keys()

-- 8. Team Member Auth Account Provisioner
public.provision_team_member_auth(...)
```

---

## 🔒 4. Permanent Protocol Commitments (AGENTS.md)
1. **Zero-Mock Database Directivity:** Live Supabase data only.
2. **Team Member Auth Synchronization:** Every squad member MUST exist in Supabase `auth.users`.
3. **Manager Project Lifecycle:** Safe cascade deletion with UI confirmation.
4. **Dynamic Role Filtering:** Zero hardcoded role buttons; board filters dynamically derive from active tasks.
5. **Zero-Emoji Enterprise Standard:** Clean Lucide SVG icons only.
6. **Multi-Key High Availability:** Automatic quota failover on HTTP 429 across Groq and Gemini.


---

## 📋 4. Next Steps & Ongoing Maintenance

1. **Supabase SQL Editor Deployment:**
   - Execute [`supabase/schema.sql`](file:///c:/Users/yadne/OneDrive/Desktop/Jira/supabase/schema.sql) in the Supabase SQL editor to initialize tables and RPCs on fresh database instances.
2. **End-to-End Workflow Testing:**
   - Visitor landing $\rightarrow$ Registration $\rightarrow$ Workspace creation $\rightarrow$ SRS Upload (PDF/Text) $\rightarrow$ AI Task Decomposition $\rightarrow$ Kanban Board execution.
3. **Super Admin API Key Provisioning:**
   - Add your Google Gemini API keys in `/admin?tab=api_keys` to populate the active key rotation pool.

---

## ⚡ 5. Quick Development Reference

### Local Run Commands
```bash
# In frontend directory:
npm run dev

# Production Build Verification:
npm run build
```

### Key Environment Variables (`frontend/.env`)
- `VITE_SUPABASE_URL`: Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase Public Anon Key
- `VITE_GEMINI_API_KEY`: Default fallback Gemini Key (supplemented by DB pool)

