# Copilot Agent Hub (48AGENTS)

An enterprise-grade catalog and interactive platform showcasing **48 Production AI Agents** across 11 key business domains, powered by real-time streaming LLM reasoning via Groq.

![Copilot Agent Hub](https://img.shields.io/badge/Agents-48%20Enterprise-blue?style=for-the-badge)
![Groq Powered](https://img.shields.io/badge/LLM-Groq%20Real--Time%20Streaming-00e5ff?style=for-the-badge)
![Zero Dependency](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5-orange?style=for-the-badge)

---

## 🌟 Key Features

- **48 Curated Enterprise AI Agents:** Covering 11 key business functions:
  - Executive & Management
  - Program & Project Management
  - Engineering & Software Delivery
  - Sales & Business Development
  - Human Resources & People Ops
  - Finance & Procurement
  - Customer Success & Operations
  - Legal & Risk Compliance
  - Marketing & Content
  - Product & Design
  - IT Support & Operations
- **⚡ Live Real-Time Streaming AI:** Powered by Groq API (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`) delivering instant, low-latency responses.
- **📄 Document Upload & Grounding:** Upload `.pdf`, `.txt`, `.docx`, `.csv`, `.md`, or `.json` to ground agent responses directly on your company's documents.
- **🛡️ Token Budget & Rate-Limit Optimizer:** Automatically extracts query-relevant chunks and sanitizes binary streams, ensuring smooth operation within free-tier token budgets.
- **🎨 Modern Glassmorphism UI:** Complete with dark/light mode toggle, instant search, domain filtering, complexity filters, and mobile-responsive layout.
- **🔒 Privacy-First Architecture:** No backend storage. API keys and uploaded data remain strictly in your browser (`localStorage` & client memory).

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/shaikmuzamil1844-coder/48AGENTS.git
cd 48AGENTS
```

### 2. Launch the Application
No installation or dependencies required! Simply open `index.html` in any web browser:
- Double click **`index.html`**, or
- Run with a local live server:
```bash
npx serve .
```

### 3. Connect Live AI (Optional)
1. Click the **⚙️ Settings** icon in the top header.
2. Enter your free Groq API key from [console.groq.com](https://console.groq.com/keys).
3. Select your model and click **Save Settings**.
4. Click on any of the 48 agents to activate it and start chatting!

---

## 📂 Project Structure

```
48AGENTS/
├── index.html        # Main app UI structure & modals
├── style.css         # Modern glassmorphism design system & responsive layout
├── app.js            # App controller, Groq streaming, document grounding, UI events
├── data.js           # Full catalog dataset of 48 enterprise agents & prompts
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

---

## 📄 License
MIT License. Feel free to use and extend for your enterprise copilot workflows.
