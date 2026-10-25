# 48AGENTS — Enterprise Multi-Agent AI Platform
## Master Architecture & Migration Plan (Phase 0)

---

### Executive Summary & Vision

**48AGENTS** is an enterprise multi-agent copilot platform featuring 48 domain-specific AI agents organized across 10 business domains and 4 operational tiers. 

Currently, the project exists as a high-fidelity client-side prototype hosted on GitHub Pages with in-browser document parsing, local storage session persistence, and client-side Groq LLM streaming.

This architectural blueprint outlines the strategic evolution of 48AGENTS from a client-side prototype into a **production-grade enterprise AI agent operating system**, introducing:
1. A **modular Python / FastAPI Agent Runtime** with native streaming, structured tool calling, and RAG context injection.
2. A **Supabase PostgreSQL database** with **pgvector** semantic embeddings, robust schema relations, and Row Level Security (RLS).
3. A **secure multi-provider LLM abstraction layer** keeping credentials completely out of the browser.
4. **Verifiable document grounding** with chunk-level citations, document metadata tracking, and zero hallucination guarantees.
5. **Three deep reference agents** (Data Analyst, Resume Screening, Incident RCA) with executable tool registries.
6. A **production React + TypeScript + Tailwind CSS** frontend architecture that preserves 100% of the existing dark navy visual identity, responsive mobile layout, and 48-agent catalog.

---

## 1. Deep Inspection of Current State

### 1.1 Current UI Architecture
- **Tech Stack**: Vanilla HTML5, vanilla JavaScript (ES6+), custom CSS3 with CSS variables and glassmorphism styling.
- **Layout Model**: Two-panel enterprise dashboard (`.catalog-panel` left, `.chat-panel` right) with fixed 100vh viewport, independent internal scrolling, expandable chat drawer (`.chat-wide`), and mobile navigation tabs (`#mobile-nav-bar`).
- **Design Tokens**: Defined in `style.css` (`--bg-primary: #0b0f19`, `--bg-card: rgba(17, 24, 39, 0.75)`, `--accent-primary: #6366f1`, `--accent-cyan: #06b6d4`, etc.). Supports light and dark modes via `data-theme`.
- **Modals**: Custom modal overlays for Agent Blueprint (`#agent-modal`), Settings (`#settings-modal`), and History (`#history-modal`).

### 1.2 Current Agent Data Structure
- Defined in `data.js` as an array of 48 objects (`AGENT_CATALOG`):
  ```javascript
  {
    id: 1,
    domain: "Executive & Management",
    tier: "Tier 1",
    mode: "Basic",
    name: "Executive Briefing Agent",
    complexity: "Intermediate",
    problem: "Leadership needs fast context before business reviews.",
    prompt: "Review the attached monthly business pack...",
    attachments: "Monthly business review PDF/PPT, KPI Excel...",
    output: "Executive brief, key risks, decision points...",
    persona: "CXO, BU Head, Delivery Head",
    whyGood: "Works well with uploaded documents..."
  }
  ```
- **Domains (10)**: Executive & Management (5), IT Services & Engineering (9), Banking / BFSI (5), HR & Workforce (5), Sales & Consulting (4), Operations & Administration (5), Finance & Accounting (4), Marketing & Communication (4), Manufacturing / Logistics (4), Education & Training (4).
- **Tiers (4)**: Tier 1 (High Priority / Executive), Tier 2 (Core Departmental), Tier 3 (Operational Support), Tier 4 (Frontline / Field).

### 1.3 Current LLM Integration
- Direct browser-to-API HTTP calls to Groq (`https://api.groq.com/openai/v1/chat/completions`).
- Supports Server-Sent Events (SSE) streaming with `ReadableStream` reader and `TextDecoder`.
- Handles `delta.reasoning` for live `💭 Thinking: ...` previews, followed by `delta.content` markdown streaming.
- Supported models: `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`, `allam-2-7b`.
- Fallback mode: Built-in simulated responses if no API key is provided.

### 1.4 Current Document & Grounding Implementation
- Browser `FileReader.readAsText()` handles client-side file reading (`.txt`, `.md`, `.csv`, `.json`, `.pdf`, `.doc`, `.docx`).
- Text sanitization: Strips raw PDF byte streams, object markers (`obj ... endobj`), and unprintable ASCII chars.
- Keyword relevance scorer: Chunks text into 500-character segments, calculates query term intersection scores, sorts, and limits context to 3,500 characters to stay within token limits.
- Limitations: No semantic vector embeddings, no multi-page citation mapping, binary files (actual PDFs/DOCX) lose formatting when read as plain text.

### 1.5 Current Persistence & History Implementation
- Browser `localStorage` keys:
  - `copilot_chat_sessions_v2`: Array of up to 50 conversation objects with message HTML, timestamps, and active agent name.
  - `copilot_active_session_id_v2`: Active session UUID/string.
  - `groq_api_key`: Plaintext API key stored in browser storage.
  - `groq_model`: Selected model identifier.
- Limitations: Sessions are bound to a single browser/device; clearing site data wipes all history; storing API keys in `localStorage` poses an XSS exfiltration risk.

### 1.6 Current Deployment
- GitHub Pages static hosting deployed on `main` branch from the root directory: `https://shaikmuzamil1844-coder.github.io/48AGENTS/`.

### 1.7 Existing Security Weaknesses
1. **Frontend API Key Exposure**: The Groq API key is held in client memory and `localStorage`.
2. **Missing Backend Authorization**: Anyone with access to the client can make direct LLM calls without rate limiting, authentication, or token throttling.
3. **Unvalidated Client-Side Parsing**: Client browser attempts to parse arbitrary files without server-side validation or virus scanning.
4. **No Server-Side Audit Logs**: Zero observability into user queries, latency, prompt injection attempts, or token costs.

### 1.8 Existing Reusable Components & Functions
- **Filtering Logic**: Domain pill navigation, tier dropdown, complexity dropdown, and fuzzy search across title, problem, prompt, and persona.
- **Markdown & Table Renderer**: Robust zero-dependency markdown parser (`renderSimpleMarkdown`) handling headers, inline code, fenced code blocks, responsive tables (`<table class="chat-table">`), and ordered/unordered lists without third-party libraries.
- **Enterprise Design System**: High-contrast dark CSS theme with glassmorphic cards, tier badges, responsive bottom bar, and smooth transitions.

---

## 2. Target Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + TS + Tailwind)                │
│                                                                        │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Enterprise Agent Hub   │  │ Interactive Copilot Chat             │  │
│  │ • 48 Agent Cards       │  │ • Streaming AI Responses             │  │
│  │ • Domain & Tier Filter │  │ • Tool Execution Indicators          │  │
│  │ • Search Bar           │  │ • Grounding Citations                │  │
│  │ • Agent Blueprint Modal│  │ • Persistent Session Drawer          │  │
│  └───────────┬────────────┘  └──────────────────┬───────────────────┘  │
│              │ Typed API Service Layer          │ SSE / JSON           │
└──────────────┼──────────────────────────────────┼──────────────────────┘
               │                                  │
               ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (Python / FastAPI)                  │
│                                                                        │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ Agent Runtime Engine    │  │ Tool Execution Registry              │ │
│  │ • Agent Config Loader   │  │ • Python Code / CSV Data Analysis    │ │
│  │ • Session & User State  │  │ • PDF Resume / Job Requirement Parser│ │
│  │ • Prompt & System Rules │  │ • Incident Log Search & RCA Engine   │ │
│  │ • Multi-turn History    │  │ • Calculator / Web Search            │ │
│  └───────────┬─────────────┘  └──────────────────┬───────────────────┘ │
│              │                                   │                     │
│              ▼                                   ▼                     │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ RAG & Grounding Engine  │  │ LLM Provider Adapter (Groq/OpenAI)   │ │
│  │ • Text Extraction       │  │ • Server-Side API Key Management     │ │
│  │ • Chunking & Metadata   │  │ • Streaming SSE Generator            │ │
│  │ • Semantic Vector Match │  │ • Usage & Token Cost Tracking        │ │
│  └───────────┬─────────────┘  └──────────────────┬───────────────────┘ │
└──────────────┼───────────────────────────────────┼─────────────────────┘
               │                                   │
               ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATABASE & STORAGE (Supabase)                   │
│                                                                        │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ PostgreSQL + pgvector   │  │ Supabase Auth & Storage              │ │
│  │ • users, agents         │  │ • JWT Bearer Authentication          │ │
│  │ • conversations, msgs   │  │ • Row Level Security (RLS)           │ │
│  │ • document_chunks       │  │ • Encrypted Document Storage Buckets │ │
│  │ • citations, agent_runs │  │                                      │ │
│  └─────────────────────────┘  └──────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Preservation vs. Refactoring Strategy

| Component | Status | Strategy |
| :--- | :--- | :--- |
| **48 Agent Catalog (`data.js`)** | **Preserve & Elevate** | Preserve all 48 names, domains, tiers, problems, prompts, and personas. Migrate into typed JSON registry (`agents.json`) and Python Pydantic models with tool & capability bindings. |
| **Visual Design System (`style.css`)** | **Preserve** | Port all CSS variables, glassmorphic card classes, responsive breakpoints, and animations directly into the new architecture. |
| **Existing Frontend (`index.html`, `app.js`)** | **Preserve as runnable fallback** | Keep existing static files working for GitHub Pages static hosting while introducing the production frontend and backend. |
| **LLM Key Management** | **Refactor & Secure** | Relocate API keys from browser `localStorage` to backend server `.env`. Frontend communicates exclusively through authenticated `/api/chat` endpoints. |
| **Document Ingestion** | **Upgrade** | Transition from naive client-side string truncation to robust backend PDF/DOCX/CSV extraction, chunking, and pgvector embeddings. |
| **Chat Sessions** | **Upgrade** | Transition from local-only browser storage to Supabase PostgreSQL database tables with user-level persistence. |

---

## 4. File Structure & New Files Required

```
48AGENTS/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint, middleware, CORS, routers
│   │   ├── config.py                   # Pydantic BaseSettings, environment variables
│   │   ├── agents/
│   │   │   ├── models.py               # Pydantic Agent schema, Domain & Tier Enums
│   │   │   ├── registry.py             # Agent registry: lookup, search, filter, load 48 agents
│   │   │   ├── runtime.py              # Central Agent Runtime loop (Prompt, RAG, Tools, LLM, Stream)
│   │   │   └── router.py               # /api/agents endpoints
│   │   ├── chat/
│   │   │   ├── models.py               # ChatRequest, ChatResponse, StreamChunk schemas
│   │   │   ├── router.py               # /api/chat, /api/agents/{id}/chat endpoints
│   │   │   └── service.py              # Conversation orchestration & streaming
│   │   ├── rag/
│   │   │   ├── parser.py               # Extract text from PDF, DOCX, CSV, TXT, MD
│   │   │   ├── chunker.py              # Recursive character / semantic chunking
│   │   │   ├── embeddings.py           # Vector embedding generator (Groq/OpenAI compatible)
│   │   │   ├── retriever.py            # Similarity search & relevance scoring
│   │   │   └── router.py               # /api/documents upload & indexing endpoints
│   │   ├── tools/
│   │   │   ├── base.py                 # BaseTool abstract class & schema definitions
│   │   │   ├── registry.py             # Tool registry & permission validator
│   │   │   ├── data_analyst_tools.py   # Python/CSV statistical analysis tools (Agent 1)
│   │   │   ├── resume_tools.py         # PDF parser, skill extractor, candidate scorer (Agent 2)
│   │   │   ├── rca_tools.py            # Incident log search, 5-Whys, RCA generator (Agent 3)
│   │   │   ├── calculator.py           # Math & business logic calculator
│   │   │   └── router.py               # /api/tools/execute endpoint
│   │   └── db/
│   │       ├── client.py               # Supabase / PostgreSQL client
│   │       └── repository.py           # Conversations, messages, runs, citations CRUD
│   ├── tests/
│   │   ├── test_agents.py              # Tests for agent lookup, search, and filtering
│   │   ├── test_runtime.py             # Tests for runtime execution & error handling
│   │   ├── test_tools.py               # Tests for tool execution and schemas
│   │   └── test_rag.py                 # Tests for parsing, chunking, and citations
│   ├── requirements.txt                # FastAPI, uvicorn, pydantic, httpx, python-multipart, etc.
│   └── .env.example                    # Backend environment template
│
├── database/
│   ├── schema.sql                      # Complete PostgreSQL + pgvector schema definition
│   └── README.md                       # Supabase migration and setup instructions
│
├── frontend/                           # React + TypeScript + Tailwind modern client
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── types/                      # TypeScript definitions (Agent, Message, Citation, Tool)
│   │   ├── services/                   # Typed API service wrappers (api.ts, chat.ts, agents.ts)
│   │   ├── components/
│   │   │   ├── Header.tsx              # Top navigation bar & status pill
│   │   │   ├── AgentCatalog.tsx        # Filterable 48-agent grid & domain pills
│   │   │   ├── AgentCard.tsx           # Individual card with tier badge & actions
│   │   │   ├── AgentModal.tsx          # Full blueprint & persona inspector
│   │   │   ├── ChatPanel.tsx           # Copilot chat, streaming bubble, tool indicators
│   │   │   ├── CitationsList.tsx       # Grounded source references & excerpt chips
│   │   │   └── HistoryDrawer.tsx       # Persistent conversation list
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── .env.example
│
├── index.html                          # Preserved original client-side application
├── app.js                              # Preserved original client-side engine (with backend connectivity toggle)
├── data.js                             # Preserved canonical 48-agent catalog
├── style.css                           # Preserved enterprise design system
└── README.md                           # Comprehensive documentation
```

---

## 5. Database Schema (PostgreSQL + pgvector)

```sql
-- Enable UUID and pgvector extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agents Registry Table
CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    tier TEXT NOT NULL,
    complexity TEXT NOT NULL,
    problem TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    attachments TEXT,
    output TEXT,
    persona TEXT,
    why_good TEXT,
    model TEXT DEFAULT 'default',
    tools JSONB DEFAULT '[]'::jsonb,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id TEXT REFERENCES agents(id),
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Document Chunks (pgvector Embeddings)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    page_number INT,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Grounding Citations Table
CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    source_text TEXT NOT NULL,
    relevance_score FLOAT,
    page_number INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Observability: Agent Runs Table
CREATE TABLE agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id TEXT REFERENCES agents(id),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    model TEXT NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_agent_runs_agent ON agent_runs(agent_id);
```

---

## 6. Real-World Reference Agents (Phase 8 Specification)

To prove enterprise capability without overcomplicating all 48 agents at once, 3 deep vertical agents will be built with real tools:

### Agent 1: Data Analyst Agent (Tier 2, Finance & Operations)
- **Input**: CSV file upload + user inquiry.
- **Tools**:
  - `inspect_dataset`: Extracts column names, data types, row count, null counts.
  - `compute_statistics`: Computes mean, median, standard deviation, min, max, quartiles.
  - `detect_anomalies`: Finds 3-sigma outliers or anomalous transactions.
- **Output**: Clean markdown table with data metrics, narrative summary of trends, and actionable takeaways.

### Agent 2: Resume Screening Assistant (Tier 1, HR & Workforce)
- **Input**: Candidate resume (PDF/TXT) + Target Job Description.
- **Tools**:
  - `parse_resume_skills`: Extracts technical competencies, years of experience, certifications.
  - `calculate_match_score`: Compares resume competencies against mandatory and preferred requirements.
  - `gap_analysis`: Identifies missing critical skills and generates targeted interview questions.
- **Output**: Executive candidate evaluation scorecard, match percentage (0–100%), strengths, gaps, and recommendation.

### Agent 3: Incident RCA Assistant (Tier 2, IT Services & Engineering)
- **Input**: Outage timeline, service logs, incident notes.
- **Tools**:
  - `search_incident_logs`: Regex/keyword analysis on raw server and application error logs.
  - `five_whys_analyzer`: Iteratively traces symptoms back to systemic root causes.
  - `generate_action_plan`: Formulates immediate mitigations and preventive architecture upgrades.
- **Output**: Formatted Root Cause Analysis (RCA) report with incident summary, root cause, contributing factors, impact analysis, and preventive Jira action items.

---

## 7. Migration & Phased Execution Strategy

### Step 1: Inspect Repository (Completed in Phase 0)
Thoroughly cataloged all files, data schemas, CSS variables, and runtime logic.

### Step 2: Architecture Plan (This Document)
Establish architectural alignment, schemas, and API contracts.

### Step 3: Refactor Agent Registry
Create `backend/app/agents/registry.py` and `backend/app/agents/models.py`. Export the 48 agents from `data.js` into structured JSON while preserving the frontend `data.js` intact.

### Step 4: Create FastAPI Backend Skeleton
Implement FastAPI application in `backend/app/main.py` with health checks, CORS middleware, and config management.

### Step 5: Create Secure Chat API & Runtime Loop
Implement `backend/app/chat/router.py` and `backend/app/agents/runtime.py` with streaming Server-Sent Events (SSE) and server-side Groq integration.

### Step 6: Connect Existing UI to Backend
Add a configurable backend API endpoint adapter in `app.js` that seamlessly routes chat requests through the secure backend while keeping direct client mode as a fallback.

### Step 7: Supabase Schema & Persistence
Create `database/schema.sql` and integrate repository operations in `backend/app/db/` for conversations and message storage.

### Step 8 & 9: RAG Grounding & Citations
Implement text parsing (`backend/app/rag/parser.py`), chunking, vector scoring, and chunk-level citation attribution.

### Step 10 – 13: Modular Tool System & 3 Deep Reference Agents
Build `backend/app/tools/` registry and implement the 3 deep reference agents (Data Analyst, Resume Screening, Incident RCA).

### Step 14 & 15: Upgrade Chat & History Experience
Enhance chat UI with tool execution status events, citation drawer, and persistent server-side history.

### Step 16 & 17: Security & Comprehensive Testing
Implement input sanitization, rate limiting, and write automated tests for registry, runtime, tools, and endpoints.

### Step 18 & 19: Browser Verification & Polish
Run full browser automation tests across desktop and mobile viewports.

### Step 20: Documentation & Deployment
Update `README.md` with full architecture diagrams, setup commands, and deployment guides for GitHub Pages, Vercel, and Render/Fly.io.
