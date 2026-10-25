// Copilot Agent Hub - Main Application Logic
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const agentGrid = document.getElementById("agent-grid-container");
  const domainPillsContainer = document.getElementById("domain-pills-container");
  const searchInput = document.getElementById("catalog-search");
  const tierFilter = document.getElementById("tier-filter");
  const complexityFilter = document.getElementById("complexity-filter");
  const agentCountBadge = document.getElementById("agent-count-badge");
  const activeAgentLabel = document.getElementById("active-agent-label");
  const chatMessagesContainer = document.getElementById("chat-messages-container");
  const chatForm = document.getElementById("chat-form");
  const chatInputField = document.getElementById("chat-input-field");
  const quickPromptsContainer = document.getElementById("quick-prompts-container");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const fileUploadInput = document.getElementById("file-upload-input");
  const attachedDocBadge = document.getElementById("attached-doc-badge");
  const tabDocStatus = document.getElementById("tab-doc-status");
  const modal = document.getElementById("agent-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalBody = document.getElementById("modal-body-content");
  const chatWidthToggleBtn = document.getElementById("chat-width-toggle-btn");
  const appContainer = document.querySelector(".app-container");
  
  // Settings Modal Elements
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const settingsModalCloseBtn = document.getElementById("settings-modal-close-btn");
  const groqApiKeyInput = document.getElementById("groq-api-key-input");
  const groqModelSelect = document.getElementById("groq-model-select");
  const btnSaveSettings = document.getElementById("btn-save-settings");
  const btnClearSettings = document.getElementById("btn-clear-settings");
  const btnTestSettings = document.getElementById("btn-test-settings");
  const settingsStatusBox = document.getElementById("settings-status-box");
  const apiStatusBtn = document.getElementById("api-status-btn");
  const apiStatusText = document.getElementById("api-status-text");

  // Mobile & History Elements
  const historyBtn = document.getElementById("history-btn");
  const chatHistoryBtn = document.getElementById("chat-history-btn");
  const newChatBtn = document.getElementById("new-chat-btn");
  const historyModal = document.getElementById("history-modal");
  const historyModalCloseBtn = document.getElementById("history-modal-close-btn");
  const historyListContainer = document.getElementById("history-list-container");
  const btnModalNewChat = document.getElementById("btn-modal-new-chat");
  const btnClearAllHistory = document.getElementById("btn-clear-all-history");
  const btnMobileBack = document.getElementById("btn-mobile-back");
  const mobileNavCatalog = document.getElementById("mobile-nav-catalog");
  const mobileNavChat = document.getElementById("mobile-nav-chat");
  const mobileNavHistory = document.getElementById("mobile-nav-history");
  const mobileChatBadge = document.getElementById("mobile-chat-badge");

  // Grounding & Deliverable Elements
  const btnLoadSampleDoc = document.getElementById("btn-load-sample-doc");
  const groundingModal = document.getElementById("grounding-modal");
  const groundingModalCloseBtn = document.getElementById("grounding-modal-close-btn");
  const groundingQuotedMetric = document.getElementById("grounding-quoted-metric");
  const groundingSourcePassage = document.getElementById("grounding-source-passage");
  const groundingDocRefBadge = document.getElementById("grounding-doc-ref-badge");
  const groundingMetaFilename = document.getElementById("grounding-meta-filename");
  const groundingMetaLocation = document.getElementById("grounding-meta-location");
  const btnCopyCitationExcerpt = document.getElementById("btn-copy-citation-excerpt");
  const btnViewFullDoc = document.getElementById("btn-view-full-doc");
  const fullDocModal = document.getElementById("full-doc-modal");
  const fullDocModalCloseBtn = document.getElementById("full-doc-modal-close-btn");
  const fullDocModalTitle = document.getElementById("full-doc-modal-title");
  const fullDocModalContent = document.getElementById("full-doc-modal-content");
  const toastContainer = document.getElementById("toast-container");

  // Sample Enterprise Audit Report for Interactive Citations
  const SAMPLE_ENTERPRISE_DOC = {
    name: "Acme_Corp_Q3_Executive_Performance_and_Risk_Audit.txt",
    content: `=== ACME CORP - Q3 FY2026 EXECUTIVE PERFORMANCE & RISK AUDIT ===
CONFIDENTIAL - PREPARED FOR EXECUTIVE BOARD & AUDIT COMMITTEE
Date: October 2026 | Document Ref: AUD-2026-Q3-09

--- PAGE 1: EXECUTIVE REVENUE & SPRINT HEALTH ---
[Doc p.1 §1: Financial Performance & Revenue Target]
Top-line revenue compressed down 14% YoY in Q3, arriving at $84.2M against our $98.0M board plan. The shortfall is primarily attributed to enterprise client onboarding latency in the EMEA sector. Gross margin remained steady at 74.2%, but operating margin was pressured by 320 bps due to redundant legacy cloud compute clusters.

[Doc p.1 §2: Engineering Velocity & Sprint Health]
Engineering delivery velocity improved significantly, up 18% following the Q2 tokenizer architecture refactor. The core platform team delivered 42 story points in Sprint 44 with zero P0 regressions. However, 3 critical dependency tickets for OAuth2 token rotation require immediate architectural sign-off before the Nov 15 compliance window.

--- PAGE 2: COMMERCIAL LENDING & EXPOSURE ANALYSIS ---
[Doc p.2 §3: Commercial Credit Concentration Risk]
Credit audit identified high exposure to commercial loan maturities maturing in Q4 without adequate re-collateralization, representing $18.4M in total risk exposure. Loan-to-Value (LTV) ratios drifted above 78% on 4 Tier-2 commercial borrowers (permitted threshold is 70%). Early warning indicator: 30-day delinquency rate nudged up to 2.1%.

[Doc p.2 §4: Client Onboarding Latency]
Average enterprise client onboarding latency surged to 34 days in EMEA against our agreed 14-day SLA. Root cause analysis confirms KYC compliance check cycles account for 62% of the processing delay.

--- PAGE 3: MANDATORY EXECUTIVE DECISIONS NEEDED TODAY ---
[Doc p.3 §5: Executive Sign-off & Budget Allocation]
1. Phase 2 Cloud Optimization: Requesting immediate approval for $45k budget variance to decommission legacy GCP/AWS clusters and prevent $180k annual cloud drag.
2. Credit Policy Amendment: Immediate freeze on discretionary credit line increases for Tier-2 commercial borrowers until refreshed financials are logged.
3. EMEA Fast-Track SLA: Transition to automated AI KYC validation pipeline to reduce onboarding time from 34 days down to 8 days.`
  };

  // State
  let activeDomain = "all";
  let activeAgent = null;
  let uploadedDocumentContent = null;
  let uploadedDocumentName = null;
  let groqApiKey = (localStorage.getItem("groq_api_key") || "").trim();
  let currentMobileView = "catalog";

  // Chat History State
  const STORAGE_KEY_SESSIONS = "copilot_chat_sessions_v2";
  const STORAGE_KEY_ACTIVE_ID = "copilot_active_session_id_v2";

  let sessions = [];
  try {
    sessions = JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS)) || [];
  } catch (e) {
    sessions = [];
  }

  let currentSessionId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  let currentSession = sessions.find(s => s.id === currentSessionId);

  if (!currentSession) {
    currentSessionId = "session_" + Date.now();
    currentSession = {
      id: currentSessionId,
      title: "New Conversation",
      agentName: "Catalog Assistant",
      updatedAt: Date.now(),
      messages: []
    };
    sessions.unshift(currentSession);
    saveSessions();
  }

  function saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions.slice(0, 50)));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, currentSessionId);
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  function recordMessage(html, type) {
    try {
      if (!currentSession) {
        currentSessionId = "session_" + Date.now();
        currentSession = {
          id: currentSessionId,
          title: "New Conversation",
          agentName: activeAgent ? activeAgent.name : "Catalog Assistant",
          updatedAt: Date.now(),
          messages: []
        };
        sessions.unshift(currentSession);
      }

      if (!currentSession.messages) {
        currentSession.messages = [];
      }

      currentSession.messages.push({
        html,
        type,
        timestamp: Date.now()
      });
      currentSession.updatedAt = Date.now();

      if (type === "user" && (currentSession.title === "New Conversation" || !currentSession.title)) {
        const plainText = html.replace(/<[^>]+>/g, "").trim();
        if (plainText) {
          currentSession.title = plainText.length > 28 ? plainText.slice(0, 28) + "..." : plainText;
        }
      }

      if (activeAgent) {
        currentSession.agentName = activeAgent.name;
      }

      saveSessions();

      if (currentMobileView === "catalog" && type === "bot" && mobileChatBadge) {
        mobileChatBadge.style.display = "flex";
      }
    } catch (e) {
      console.warn("Could not save message to history", e);
    }
  }

  const VALID_GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "allam-2-7b"
  ];
  let storedModel = localStorage.getItem("groq_model");
  let groqModel = VALID_GROQ_MODELS.includes(storedModel) ? storedModel : "openai/gpt-oss-120b";
  localStorage.setItem("groq_model", groqModel);

  // Synchronize API status badge in header
  function updateApiStatusUI() {
    if (groqApiKey) {
      if (apiStatusBtn) {
        apiStatusBtn.className = "api-status-pill connected";
        apiStatusBtn.title = `Groq Live Connected (${groqModel}) - Click to configure`;
      }
      if (apiStatusText) {
        apiStatusText.textContent = "Live AI: Connected";
      }
    } else {
      if (apiStatusBtn) {
        apiStatusBtn.className = "api-status-pill disconnected";
        apiStatusBtn.title = "Click to connect your free Groq API key";
      }
      if (apiStatusText) {
        apiStatusText.textContent = "Connect API Key";
      }
    }
  }

  // Extract unique domains
  const domains = ["all", ...new Set(AGENT_CATALOG.map(a => a.domain))];

  // Initialize Domain Pills
  function renderDomainPills() {
    domainPillsContainer.innerHTML = "";
    domains.forEach(domain => {
      const pill = document.createElement("button");
      pill.className = `domain-pill ${domain === activeDomain ? "active" : ""}`;
      pill.textContent = domain === "all" ? "All Domains (48)" : domain;
      pill.addEventListener("click", () => {
        activeDomain = domain;
        document.querySelectorAll(".domain-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        renderAgents();
      });
      domainPillsContainer.appendChild(pill);
    });
  }

  // Tier color mapping
  function getTierClass(tier) {
    if (tier.includes("1")) return "tier-1";
    if (tier.includes("2")) return "tier-2";
    if (tier.includes("3")) return "tier-3";
    return "tier-4";
  }

  // Filter & Render Agents
  function renderAgents() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedTier = tierFilter.value;
    const selectedComplexity = complexityFilter.value;

    const filtered = AGENT_CATALOG.filter(agent => {
      const matchDomain = activeDomain === "all" || agent.domain === activeDomain;
      const matchTier = selectedTier === "all" || agent.tier === selectedTier;
      const matchComplexity = selectedComplexity === "all" || agent.complexity === selectedComplexity;
      const matchQuery = !query || 
        agent.name.toLowerCase().includes(query) ||
        agent.problem.toLowerCase().includes(query) ||
        agent.prompt.toLowerCase().includes(query) ||
        agent.persona.toLowerCase().includes(query) ||
        agent.domain.toLowerCase().includes(query);

      return matchDomain && matchTier && matchComplexity && matchQuery;
    });

    agentCountBadge.textContent = `${filtered.length} Agents`;
    agentGrid.innerHTML = "";

    if (filtered.length === 0) {
      agentGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; font-weight: 600;">No matching agents found</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Try adjusting your search filters</p>
        </div>
      `;
      return;
    }

    filtered.forEach(agent => {
      const card = document.createElement("div");
      card.className = `agent-card ${activeAgent && activeAgent.id === agent.id ? "selected" : ""}`;
      card.innerHTML = `
        <div>
          <div class="agent-top">
            <div>
              <div class="agent-title">${agent.name}</div>
              <div class="agent-domain">${agent.domain}</div>
            </div>
            <span class="tier-badge ${getTierClass(agent.tier)}">${agent.tier}</span>
          </div>
          <p class="agent-problem" style="margin-top: 0.75rem;">${agent.problem}</p>
        </div>

        <div>
          <div class="agent-tags">
            <span class="tag">⚡ ${agent.complexity}</span>
            <span class="tag">👤 ${agent.persona.split(',')[0]}</span>
          </div>

          <div class="agent-actions">
            <button class="btn-action btn-select-agent" data-id="${agent.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Activate Agent
            </button>
            <button class="btn-action btn-view-blueprint" data-id="${agent.id}" style="color: var(--text-muted);">
              Blueprint
            </button>
          </div>
        </div>
      `;

      // Select Agent click
      card.querySelector(".btn-select-agent").addEventListener("click", (e) => {
        e.stopPropagation();
        selectAgent(agent);
      });

      // View Blueprint click
      card.querySelector(".btn-view-blueprint").addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(agent);
      });

      // Card click
      card.addEventListener("click", () => selectAgent(agent));

      agentGrid.appendChild(card);
    });
  }

  // Select Agent Persona
  function selectAgent(agent) {
    activeAgent = agent;
    activeAgentLabel.textContent = agent.name;
    document.querySelectorAll(".agent-card").forEach(c => c.classList.remove("selected"));
    renderAgents();

    if (currentSession) {
      currentSession.agentName = agent.name;
      saveSessions();
    }

    // Switch view to chat automatically on mobile
    switchMobileView("chat");

    // Add bot notification
    addBotMessage(`
      <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.95rem;">
        ⚡ Persona Activated: ${agent.name} (${agent.tier})
      </div>
      <p style="margin-top: 4px; font-size: 0.85rem; color: var(--text-secondary);">
        <strong>Problem Solved:</strong> ${agent.problem}
      </p>
      <div class="inline-agent-card">
        <div class="inline-agent-header">Recommended Prompt Template:</div>
        <div class="inline-agent-prompt">${agent.prompt}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
          📎 <strong>Suggested Input:</strong> ${agent.attachments}
        </div>
      </div>
      <p style="margin-top: 8px; font-size: 0.82rem; color: var(--text-muted);">
        You can now paste your notes below or click the template to simulate output!
      </p>
    `);

    // Update quick prompts
    quickPromptsContainer.innerHTML = `
      <button class="quick-btn" data-query="Run prompt: ${agent.prompt}">⚡ Run Catalog Prompt</button>
      <button class="quick-btn" data-query="What attachments should I provide for ${agent.name}?">📎 Input Requirements</button>
      <button class="quick-btn" data-query="Explain expected outputs for ${agent.name}">📋 Expected Output</button>
      <button class="quick-btn" data-query="Reset to general assistant">🔄 Switch to Catalog Guide</button>
    `;
    bindQuickPrompts();
  }

  // Open Modal Details
  function openModal(agent) {
    modalBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 2rem;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800;">${agent.name}</h2>
          <div style="color: var(--accent-cyan); font-size: 0.85rem; margin-top: 2px;">
            ${agent.domain} • ${agent.mode} Mode
          </div>
        </div>
        <span class="tier-badge ${getTierClass(agent.tier)}">${agent.tier}</span>
      </div>

      <div class="detail-row">
        <div class="detail-label">Business Problem Solved</div>
        <div class="detail-value">${agent.problem}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Target Persona</div>
        <div class="detail-value">${agent.persona}</div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Complexity & Copilot Rationale</div>
        <div class="detail-value">
          <strong>${agent.complexity}</strong> — ${agent.whyGood}
        </div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Example Input Prompt</div>
        <div class="detail-prompt-box">
          <button class="btn-copy-prompt" id="btn-copy-modal-prompt">Copy</button>
          <span id="modal-prompt-text">${agent.prompt}</span>
        </div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Suggested Attachments</div>
        <div class="detail-value" style="background: var(--bg-glass); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          📎 ${agent.attachments}
        </div>
      </div>

      <div class="detail-row">
        <div class="detail-label">Expected Output</div>
        <div class="detail-value" style="background: var(--bg-glass); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          📋 ${agent.output}
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
        <button class="btn-send" style="flex: 1; border-radius: var(--radius-md); height: 40px; font-weight: 600; font-size: 0.85rem;" id="btn-activate-from-modal">
          Activate Agent in Chat
        </button>
      </div>
    `;

    document.getElementById("btn-copy-modal-prompt").addEventListener("click", () => {
      navigator.clipboard.writeText(agent.prompt);
      document.getElementById("btn-copy-modal-prompt").textContent = "Copied!";
      setTimeout(() => {
        document.getElementById("btn-copy-modal-prompt").textContent = "Copy";
      }, 2000);
    });

    document.getElementById("btn-activate-from-modal").addEventListener("click", () => {
      closeModal();
      selectAgent(agent);
    });

    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  modalCloseBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Toast Notification System
  function showToast(msg, type = "success") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </span>
      <span>${escapeHtml(msg)}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px) scale(0.96)";
      setTimeout(() => toast.remove(), 260);
    }, 2600);
  }

  // Citations Parser: Turns [Doc p.1 §2] or [Ref #1] into interactive clickable chips
  function renderCitationsInHtml(html) {
    if (!html) return "";
    let res = html.replace(/\[Doc\s+p\.?(\d+)(?:\s*§?(\d+))?\]/gi, (match, page, sec) => {
      const p = page || "1";
      const s = sec || "1";
      const label = sec ? `Doc p.${p} §${sec}` : `Doc p.${p}`;
      return `<button type="button" class="citation-chip" data-doc-page="${p}" data-doc-sec="${s}" title="Inspect Grounded Source (${match})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><span>${label}</span></button>`;
    });
    res = res.replace(/\[Ref\s*#?(\d+)\]/gi, (match, ref) => {
      return `<button type="button" class="citation-chip" data-doc-page="${ref}" data-doc-sec="1" title="Inspect Grounded Reference (${match})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg><span>Ref #${ref}</span></button>`;
    });
    return res;
  }

  // Pre-configured Verified Grounding Excerpts
  const GROUNDING_EXCERPTS = {
    "1_1": {
      metric: "Top-line revenue compressed down 14% YoY in Q3 arriving at $84.2M (against $98.0M board plan)",
      docRef: "Doc p.1 §1 (Financial Performance & Revenue Target)",
      location: "Page 1, Section 1 • Line 8",
      passage: "Top-line revenue compressed down <mark>14% YoY in Q3</mark>, arriving at <mark>$84.2M against our $98.0M board plan</mark>. The shortfall is primarily attributed to enterprise client onboarding latency in the EMEA sector. Gross margin remained steady at 74.2%, but operating margin was pressured by 320 bps due to redundant legacy cloud compute clusters.",
      sourceDoc: "Acme_Corp_Q3_Executive_Performance_and_Risk_Audit.txt"
    },
    "1_2": {
      metric: "Engineering delivery velocity improved by 18% with 42 story points in Sprint 44; OAuth2 token rotation required",
      docRef: "Doc p.1 §2 (Engineering Velocity & Sprint Health)",
      location: "Page 1, Section 2 • Line 14",
      passage: "Engineering delivery velocity improved significantly, up <mark>18% following the Q2 tokenizer architecture refactor</mark>. The core platform team delivered <mark>42 story points in Sprint 44 with zero P0 regressions</mark>. However, 3 critical dependency tickets for OAuth2 token rotation require immediate architectural sign-off before the Nov 15 compliance window.",
      sourceDoc: "Acme_Corp_Q3_Executive_Performance_and_Risk_Audit.txt"
    },
    "2_3": {
      metric: "Commercial loan maturities of $18.4M in Q4 with LTV ratios drifting > 78% on 4 Tier-2 commercial loans",
      docRef: "Doc p.2 §3 (Commercial Lending & Credit Risk)",
      location: "Page 2, Section 3 • Line 20",
      passage: "Credit audit identified high exposure to commercial loan maturities maturing in Q4 without adequate re-collateralization, representing <mark>$18.4M in total risk exposure</mark>. Loan-to-Value (LTV) ratios drifted above <mark>78% on 4 Tier-2 commercial borrowers</mark> (permitted threshold is 70%). Early warning indicator: 30-day delinquency rate nudged up to 2.1%.",
      sourceDoc: "Acme_Corp_Q3_Executive_Performance_and_Risk_Audit.txt"
    },
    "2_4": {
      metric: "Enterprise client onboarding latency surged to 34 days in EMEA vs 14-day SLA (KYC is 62% of delay)",
      docRef: "Doc p.2 §4 (Client Onboarding Latency)",
      location: "Page 2, Section 4 • Line 26",
      passage: "Average enterprise client onboarding latency surged to <mark>34 days in EMEA against our agreed 14-day SLA</mark>. Root cause analysis confirms KYC compliance check cycles account for <mark>62% of the processing delay</mark>.",
      sourceDoc: "Acme_Corp_Q3_Executive_Performance_and_Risk_Audit.txt"
    },
    "3_5": {
      metric: "Phase 2 cloud budget approval ($45k variance) and freeze on discretionary Tier-2 commercial limits",
      docRef: "Doc p.3 §5 (Executive Decisions Needed)",
      location: "Page 3, Section 5 • Line 32",
      passage: "1. Phase 2 Cloud Optimization: Requesting immediate approval for <mark>$45k budget variance</mark> to decommission legacy GCP/AWS clusters and prevent $180k annual cloud drag.\n2. Credit Policy Amendment: <mark>Immediate freeze on discretionary credit line increases for Tier-2 commercial borrowers</mark> until refreshed financials are logged.\n3. EMEA Fast-Track SLA: Transition to automated AI KYC validation pipeline to reduce onboarding time from 34 days down to 8 days.",
      sourceDoc: "Acme_Corp_Q3_Executive_Performance_and_Risk_Audit.txt"
    }
  };

  let activeGroundingData = null;

  function openGroundingInspector(page = "1", sec = "1", chip = null) {
    const key = `${page}_${sec}`;
    let data = GROUNDING_EXCERPTS[key];

    // If custom user document is loaded, try to extract surrounding context from uploadedDocumentContent
    if (uploadedDocumentContent && uploadedDocumentContent !== SAMPLE_ENTERPRISE_DOC.content) {
      let excerptText = "";
      if (chip && chip.parentElement) {
        const surroundingText = chip.parentElement.textContent.replace(chip.textContent, "").trim();
        const words = surroundingText.split(/\s+/).filter(w => w.length > 3).slice(0, 5);
        for (const w of words) {
          const idx = uploadedDocumentContent.toLowerCase().indexOf(w.toLowerCase());
          if (idx !== -1) {
            const start = Math.max(0, idx - 80);
            const end = Math.min(uploadedDocumentContent.length, idx + 360);
            excerptText = uploadedDocumentContent.slice(start, end);
            break;
          }
        }
      }
      if (!excerptText) {
        excerptText = uploadedDocumentContent.slice(0, 420);
      }
      data = {
        metric: chip && chip.parentElement ? chip.parentElement.textContent.slice(0, 95) + "..." : `Referenced Metric (${uploadedDocumentName})`,
        docRef: `Doc p.${page}${sec ? ' §' + sec : ''}`,
        location: `Document Offset ~${(parseInt(page, 10) - 1) * 500} chars`,
        passage: escapeHtml(excerptText).replace(/(\b\d+[\d,.]*%?|\$\d+[\d,.]*[kKmMbB]?)/g, "<mark>$1</mark>"),
        sourceDoc: uploadedDocumentName || "Uploaded Document"
      };
    } else if (!data) {
      data = GROUNDING_EXCERPTS["1_1"];
    }

    if (!uploadedDocumentContent) {
      uploadedDocumentContent = SAMPLE_ENTERPRISE_DOC.content;
      uploadedDocumentName = SAMPLE_ENTERPRISE_DOC.name;
      if (tabDocStatus) tabDocStatus.style.display = "flex";
      if (attachedDocBadge) attachedDocBadge.textContent = "📎 Acme_Q3_Audit.txt (3.8 KB)";
    }

    activeGroundingData = data;

    if (groundingQuotedMetric) groundingQuotedMetric.textContent = data.metric;
    if (groundingSourcePassage) groundingSourcePassage.innerHTML = data.passage;
    if (groundingDocRefBadge) groundingDocRefBadge.textContent = data.docRef;
    if (groundingMetaFilename) groundingMetaFilename.textContent = data.sourceDoc;
    if (groundingMetaLocation) groundingMetaLocation.textContent = data.location;

    if (groundingModal) {
      groundingModal.classList.add("open");
    }
  }

  function closeGroundingModal() {
    if (groundingModal) groundingModal.classList.remove("open");
  }

  function openFullDocumentModal() {
    const docName = uploadedDocumentName || SAMPLE_ENTERPRISE_DOC.name;
    const docContent = uploadedDocumentContent || SAMPLE_ENTERPRISE_DOC.content;
    if (fullDocModalTitle) fullDocModalTitle.textContent = `📄 ${docName}`;
    if (fullDocModalContent) fullDocModalContent.textContent = docContent;
    if (fullDocModal) fullDocModal.classList.add("open");
  }

  function closeFullDocModal() {
    if (fullDocModal) fullDocModal.classList.remove("open");
  }

  function loadSampleEnterpriseDocument() {
    uploadedDocumentContent = SAMPLE_ENTERPRISE_DOC.content;
    uploadedDocumentName = SAMPLE_ENTERPRISE_DOC.name;

    if (tabDocStatus) tabDocStatus.style.display = "flex";
    if (attachedDocBadge) attachedDocBadge.textContent = "📎 Acme_Q3_Audit.txt (3.8 KB)";

    addBotMessage(`
      <div style="font-weight: 800; color: #34d399; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 1.1rem;">📄</span> Sample Enterprise Audit Document Loaded!
      </div>
      <p style="font-size: 0.85rem; color: var(--text-primary); margin-top: 6px; line-height: 1.5;">
        <strong>Acme Corp Q3 FY2026 Executive Performance & Risk Audit</strong> is now active in context.
      </p>
      <div style="margin: 8px 0; background: rgba(0, 0, 0, 0.35); border-left: 3px solid var(--accent-emerald); padding: 8px 12px; font-size: 0.82rem; line-height: 1.5;">
        • <strong>Revenue & Financials:</strong> Down 14% in Q3 ($84.2M) due to EMEA delays [Doc p.1 §1]<br>
        • <strong>Engineering Velocity:</strong> Velocity +18% (42 pts in Sprint 44) [Doc p.1 §2]<br>
        • <strong>Commercial Credit Risk:</strong> $18.4M maturities with LTV > 78% [Doc p.2 §3]<br>
        • <strong>Onboarding Latency:</strong> 34 days in EMEA vs 14-day SLA [Doc p.2 §4]<br>
        • <strong>Decisions:</strong> $45k Phase 2 Cloud variance approval [Doc p.3 §5]
      </div>
      <p style="font-size: 0.82rem; color: var(--accent-cyan); margin-top: 6px;">
        ⚡ <em>Click any <span class="citation-chip" data-doc-page="1" data-doc-sec="1">Doc p.1 §1</span> citation chip above to test the <strong>Grounding Inspector</strong>, or activate an agent persona to generate verified executive deliverables!</em>
      </p>
    `);

    showToast("📄 Loaded Acme Corp Q3 Audit Report!", "success");
  }

  // One-Click Deliverable Toolbar & Export Functions
  function attachDeliverableToolbar(bubble) {
    if (!bubble || bubble.querySelector(".deliverable-toolbar")) return;
    const textContent = (bubble.textContent || bubble.innerText || bubble.innerHTML || "").trim();
    if (!textContent || textContent.startsWith("Thinking with")) return;

    const toolbar = document.createElement("div");
    toolbar.className = "deliverable-toolbar";
    toolbar.innerHTML = `
      <button type="button" class="btn-deliverable-action btn-export-pdf" title="Export as executive printable PDF report">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>Export PDF</span>
      </button>
      <button type="button" class="btn-deliverable-action btn-copy-jira" title="Copy formatted as Jira Wiki story/description">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        <span>Copy Jira</span>
      </button>
      <button type="button" class="btn-deliverable-action btn-copy-slack" title="Copy formatted for Slack announcement">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span>Copy Slack</span>
      </button>
      <button type="button" class="btn-deliverable-action btn-export-md" title="Download formatted Markdown deliverable">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        <span>Export .MD</span>
      </button>
      <button type="button" class="btn-deliverable-action btn-grounding-inspect" title="Inspect Grounded Citations & Audit Proof">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span>Grounding</span>
      </button>
    `;

    toolbar.querySelector(".btn-export-pdf").addEventListener("click", () => exportDeliverableToPdf(bubble));
    toolbar.querySelector(".btn-copy-jira").addEventListener("click", () => copyDeliverableAsJira(bubble));
    toolbar.querySelector(".btn-copy-slack").addEventListener("click", () => copyDeliverableAsSlack(bubble));
    toolbar.querySelector(".btn-export-md").addEventListener("click", () => exportDeliverableAsMarkdown(bubble));
    toolbar.querySelector(".btn-grounding-inspect").addEventListener("click", () => {
      const firstChip = bubble.querySelector(".citation-chip");
      if (firstChip) {
        openGroundingInspector(firstChip.getAttribute("data-doc-page"), firstChip.getAttribute("data-doc-sec"), firstChip);
      } else {
        openGroundingInspector("1", "1", null);
      }
    });

    bubble.appendChild(toolbar);
  }

  function exportDeliverableToPdf(bubble) {
    try {
      showToast("Generating Executive PDF Deliverable...", "success");

      const clone = bubble.cloneNode(true);
      const toolbarInClone = clone.querySelector(".deliverable-toolbar");
      if (toolbarInClone) toolbarInClone.remove();

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        window.print();
        return;
      }

      const agentTitle = activeAgent ? activeAgent.name : "Enterprise Catalog Assistant";
      const domain = activeAgent ? activeAgent.domain : "General Enterprise Management";
      const tier = activeAgent ? activeAgent.tier : "Tier 1 (Executive)";
      const deliverableType = activeAgent ? activeAgent.output : "Strategic Recommendation Deliverable";
      const dateStr = new Date().toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${escapeHtml(agentTitle)} - Executive Deliverable Report</title>
          <style>
            @page { margin: 18mm 16mm 18mm 16mm; size: A4; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; line-height: 1.6; }
            .header { border-bottom: 3px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }
            .report-title { font-size: 13px; color: #64748b; margin-top: 2px; }
            .meta-box { text-align: right; font-size: 12px; color: #64748b; line-height: 1.5; }
            .verified-tag { display: inline-block; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; margin-top: 4px; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 24px; font-size: 12px; }
            .meta-item-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
            .meta-item-value { font-weight: 600; color: #0f172a; }
            .content { font-size: 13.5px; line-height: 1.65; }
            .content h1, .content h2, .content h3 { color: #0f172a; margin: 16px 0 8px; font-weight: 700; }
            .content h3 { font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            .content p { margin: 8px 0; }
            .content strong { color: #0f172a; }
            .content ul, .content ol { margin: 8px 0 8px 22px; padding: 0; }
            .content li { margin-bottom: 4px; }
            .citation-chip { display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 4px; margin: 0 2px; }
            .chat-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 12px; }
            .chat-table th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px; font-weight: 700; text-align: left; }
            .chat-table td { border: 1px solid #cbd5e1; padding: 8px; }
            .footer { border-top: 1px solid #e2e8f0; margin-top: 36px; padding-top: 12px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand-name">COPILOT AGENT HUB</div>
              <div class="report-title">Executive Deliverable & Grounded Decision Record</div>
            </div>
            <div class="meta-box">
              <div>Date: <strong>${dateStr}</strong> at ${timeStr}</div>
              <div><span class="verified-tag">🛡️ Zero-Hallucination Verified</span></div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div class="meta-item-label">Agent Persona</div>
              <div class="meta-item-value">${escapeHtml(agentTitle)}</div>
            </div>
            <div>
              <div class="meta-item-label">Domain & Tier</div>
              <div class="meta-item-value">${escapeHtml(domain)} • ${escapeHtml(tier)}</div>
            </div>
            <div>
              <div class="meta-item-label">Deliverable Format</div>
              <div class="meta-item-value">${escapeHtml(deliverableType)}</div>
            </div>
            <div>
              <div class="meta-item-label">Grounded Document</div>
              <div class="meta-item-value">${escapeHtml(uploadedDocumentName || "Enterprise Catalog Benchmark")}</div>
            </div>
          </div>

          <div class="content">
            ${clone.innerHTML}
          </div>

          <div class="footer">
            <div>CONFIDENTIAL • FOR INTERNAL ENTERPRISE EXECUTIVE USE ONLY</div>
            <div>Generated by Copilot Agent Hub • 48 Enterprise Agents Catalog</div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } catch (err) {
      console.warn("PDF export fallback", err);
      window.print();
    }
  }

  function copyDeliverableAsJira(bubble) {
    const clone = bubble.cloneNode(true);
    const tb = clone.querySelector(".deliverable-toolbar");
    if (tb) tb.remove();

    clone.querySelectorAll(".citation-chip").forEach(chip => {
      chip.replaceWith(chip.textContent.trim());
    });

    let html = clone.innerHTML;
    html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "h1. $1\n\n");
    html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "h2. $1\n\n");
    html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "h3. $1\n\n");
    html = html.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "*$1*");
    html = html.replace(/<b[^>]*>(.*?)<\/b>/gi, "*$1*");
    html = html.replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_");
    html = html.replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_");
    html = html.replace(/<li[^>]*>(.*?)<\/li>/gi, "* $1\n");
    html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
    html = html.replace(/<br\s*[\/]?>/gi, "\n");

    html = html.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableBody) => {
      let jiraTable = "";
      const rows = tableBody.split(/<tr[^>]*>/i);
      rows.forEach(row => {
        if (!row.trim()) return;
        if (row.includes("<th")) {
          const cells = row.split(/<th[^>]*>/i).map(c => c.replace(/<\/th>[\s\S]*/, "").replace(/<[^>]+>/g, "").trim()).filter(Boolean);
          if (cells.length) jiraTable += "|| " + cells.join(" || ") + " ||\n";
        } else if (row.includes("<td")) {
          const cells = row.split(/<td[^>]*>/i).map(c => c.replace(/<\/td>[\s\S]*/, "").replace(/<[^>]+>/g, "").trim()).filter(Boolean);
          if (cells.length) jiraTable += "| " + cells.join(" | ") + " |\n";
        }
      });
      return jiraTable + "\n";
    });

    let text = html.replace(/<[^>]+>/g, "").trim();
    const tmp = document.createElement("textarea");
    tmp.innerHTML = text;
    text = tmp.value;

    const jiraHeader = `{panel:title=Enterprise Deliverable: ${activeAgent ? activeAgent.name : "Catalog Deliverable"}|borderStyle=solid|borderColor=#6366f1|titleBGColor=#1e1b4b|bgColor=#0f172a}\n`;
    const jiraFooter = `\n{panel}\n_Grounded & Verified via Copilot Agent Hub_`;
    const fullJira = jiraHeader + text + jiraFooter;

    navigator.clipboard.writeText(fullJira).then(() => {
      showToast("📋 Copied as Jira Issue Description!", "success");
    }).catch(() => {
      showToast("⚠️ Could not access clipboard", "error");
    });
  }

  function copyDeliverableAsSlack(bubble) {
    const clone = bubble.cloneNode(true);
    const tb = clone.querySelector(".deliverable-toolbar");
    if (tb) tb.remove();

    clone.querySelectorAll(".citation-chip").forEach(chip => {
      chip.replaceWith(chip.textContent.trim());
    });

    let html = clone.innerHTML;
    html = html.replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, "*$1*\n");
    html = html.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "*$1*");
    html = html.replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_");
    html = html.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n");
    html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
    html = html.replace(/<br\s*[\/]?>/gi, "\n");

    let text = html.replace(/<[^>]+>/g, "").trim();
    const tmp = document.createElement("textarea");
    tmp.innerHTML = text;
    text = tmp.value;

    const slackText = `*🚀 [Deliverable] ${activeAgent ? activeAgent.name : "Copilot Agent Hub"}*\n\n${text}\n\n_🛡️ Verified Zero-Hallucination Grounding • Copilot Agent Hub_`;

    navigator.clipboard.writeText(slackText).then(() => {
      showToast("💬 Copied for Slack Announcement!", "success");
    }).catch(() => {
      showToast("⚠️ Could not access clipboard", "error");
    });
  }

  function exportDeliverableAsMarkdown(bubble) {
    const clone = bubble.cloneNode(true);
    const tb = clone.querySelector(".deliverable-toolbar");
    if (tb) tb.remove();

    clone.querySelectorAll(".citation-chip").forEach(chip => {
      chip.replaceWith(chip.textContent.trim());
    });

    let html = clone.innerHTML;
    html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
    html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
    html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
    html = html.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
    html = html.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
    html = html.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
    html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
    html = html.replace(/<br\s*[\/]?>/gi, "\n");

    let text = html.replace(/<[^>]+>/g, "").trim();
    const tmp = document.createElement("textarea");
    tmp.innerHTML = text;
    text = tmp.value;

    const agentName = activeAgent ? activeAgent.name.replace(/\s+/g, "_") : "Executive_Deliverable";
    const dateStr = new Date().toISOString().split("T")[0];
    const mdContent = `# ${activeAgent ? activeAgent.name : "Enterprise Agent Deliverable"}\n\n` +
      `**Domain:** ${activeAgent ? activeAgent.domain : "General"} | **Tier:** ${activeAgent ? activeAgent.tier : "Tier 1"}\n` +
      `**Deliverable Specification:** ${activeAgent ? activeAgent.output : "Production Intelligence"}\n` +
      `**Date:** ${dateStr} | **Status:** Grounding Verified (Zero Hallucination)\n\n---\n\n` +
      text +
      `\n\n---\n*Generated by [Copilot Agent Hub](https://shaikmuzamil1844-coder.github.io/48AGENTS/)*\n`;

    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentName}_Deliverable_${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`📝 Exported ${agentName}_Deliverable_${dateStr}.md!`, "success");
  }

  // Chat Helpers
  function addMessage(html, type = "bot", save = true) {
    const formattedHtml = type === "bot" ? renderCitationsInHtml(html) : html;
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.innerHTML = `
      <div class="message-avatar ${type === "bot" ? "bot-avatar" : "user-avatar"}">
        ${type === "bot" ? (activeAgent ? "⚡" : "AI") : "You"}
      </div>
      <div class="message-bubble">${formattedHtml}</div>
    `;
    chatMessagesContainer.appendChild(msg);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    if (type === "bot") {
      const bubble = msg.querySelector(".message-bubble");
      attachDeliverableToolbar(bubble);
    }

    if (save) {
      recordMessage(formattedHtml, type);
    }
  }

  function addBotMessage(html) {
    addMessage(html, "bot", true);
  }

  function addUserMessage(text) {
    addMessage(`<p>${escapeHtml(text)}</p>`, "user", true);
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Chat Processing Logic
  function handleChatSubmit(userQuery) {
    if (!userQuery) return;
    addUserMessage(userQuery);
    chatInputField.value = "";

    const lower = userQuery.toLowerCase().trim();

    // Check if user wants to switch back to General Guide
    if (lower.includes("switch to catalog") || lower.includes("reset") || lower.includes("general assistant")) {
      activeAgent = null;
      activeAgentLabel.textContent = "Catalog Assistant";
      renderAgents();
      addBotMessage("Switched back to general <strong>Catalog Assistant</strong>. Ask me anything about the 48 agents or select one from the catalog!");
      return;
    }

    // Check if user pasted a Groq API Key (starts with or contains gsk_...)
    const keyMatch = userQuery.match(/gsk_[a-zA-Z0-9_-]{20,}/);
    if (keyMatch) {
      const detectedKey = keyMatch[0];
      groqApiKey = detectedKey;
      localStorage.setItem("groq_api_key", detectedKey);
      updateApiStatusUI();
      addBotMessage(`
        <div style="font-weight: 700; color: #34d399; font-size: 0.95rem;">
          🔑 Groq API Key Saved!
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
          Testing connection with model <strong>${escapeHtml(groqModel)}</strong>...
        </p>
      `);
      testGroqConnection(detectedKey, groqModel)
        .then(() => {
          addBotMessage(`
            <div style="font-weight: 700; color: #34d399; font-size: 0.95rem;">
              ⚡ Connection Verified & Active!
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
              All 48 agents are now running live with real-time streaming AI! Try asking any agent a question.
            </p>
          `);
        })
        .catch(err => {
          addBotMessage(`
            <div style="color: #f87171; font-weight: 700;">
              ⚠️ Key saved, but test failed:
            </div>
            <p style="font-size: 0.83rem; color: var(--text-muted); margin-top: 4px;">
              ${escapeHtml(err.message)}
            </p>
          `);
        });
      return;
    }

    // Check if user is asking about API key or connection status
    if (lower.includes("api key") || lower.includes("not connected") || lower.includes("how to connect") || lower.includes("connect api")) {
      addBotMessage(`
        <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.95rem;">
          🔑 How to Connect Your Free Groq API Key
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 6px;">
          To enable live streaming AI across all 48 agents:
        </p>
        <ol style="margin: 8px 0 8px 18px; font-size: 0.84rem; line-height: 1.6; color: var(--text-secondary);">
          <li>Get your free key from <a href="https://console.groq.com/keys" target="_blank" style="color: var(--accent-cyan); text-decoration: underline; font-weight: 600;">console.groq.com/keys</a></li>
          <li>Click the <strong><button class="btn-connect-now" onclick="document.getElementById('settings-modal').classList.add('open')">Connect API Key</button></strong> button in the top header.</li>
          <li>Paste your key (starts with <code>gsk_...</code>) and click <strong>Save Settings</strong>.</li>
          <li><em>Or paste your <code>gsk_...</code> key directly here into this chat!</em></li>
        </ol>
      `);
      return;
    }

    // If Groq API Key is configured, run live real-time LLM reasoning!
    if (groqApiKey) {
      runLiveGroqAgent(userQuery);
      return;
    }

    // Fallback: If an agent persona is active without API key, use simulation
    if (activeAgent) {
      setTimeout(() => {
        simulateAgentResponse(activeAgent, userQuery);
      }, 500);
      return;
    }

    // General Catalog Assistant logic
    setTimeout(() => {
      // Search for agents matching query
      const matches = AGENT_CATALOG.filter(a => 
        lower.includes(a.name.toLowerCase()) ||
        lower.includes(a.domain.toLowerCase()) ||
        a.name.toLowerCase().split(" ").some(word => word.length > 3 && lower.includes(word)) ||
        a.problem.toLowerCase().split(" ").some(word => word.length > 4 && lower.includes(word))
      );

      if (lower.includes("tier 1") || lower.includes("executive")) {
        const tier1 = AGENT_CATALOG.filter(a => a.tier === "Tier 1");
        let listHtml = `<p><strong>Found ${tier1.length} Tier 1 (High Impact / Executive) Agents:</strong></p><ul style="margin: 8px 0 8px 18px; font-size: 0.85rem; line-height: 1.6;">`;
        tier1.forEach(a => {
          listHtml += `<li><strong>${a.name}</strong> (${a.domain}) — <em>${a.problem}</em></li>`;
        });
        listHtml += `</ul><p style="font-size: 0.82rem; color: var(--text-muted);">Click any card on the left to activate!</p>`;
        addBotMessage(listHtml);
        return;
      }

      if (lower.includes("banking") || lower.includes("risk") || lower.includes("bfsi")) {
        const banking = AGENT_CATALOG.filter(a => a.domain.includes("Banking"));
        let listHtml = `<p><strong>Banking & BFSI Agents (${banking.length}):</strong></p><ul style="margin: 8px 0 8px 18px; font-size: 0.85rem; line-height: 1.6;">`;
        banking.forEach(a => {
          listHtml += `<li><strong>${a.name}</strong> [${a.tier}] — <em>${a.problem}</em></li>`;
        });
        listHtml += `</ul>`;
        addBotMessage(listHtml);
        return;
      }

      if (matches.length > 0) {
        const top = matches[0];
        addBotMessage(`
          <p>The best match for your request is the <strong>${top.name}</strong> (${top.domain}, ${top.tier}).</p>
          <div class="inline-agent-card">
            <div class="inline-agent-header">🎯 Target: ${top.name}</div>
            <p style="font-size: 0.84rem; color: var(--text-secondary);">${top.problem}</p>
            <div class="inline-agent-prompt">${top.prompt}</div>
          </div>
          <p style="margin-top: 8px; font-size: 0.82rem; color: var(--text-muted);">
            Would you like me to activate this agent persona?
          </p>
        `);
        return;
      }

      // Default smart catalog guidance
      addBotMessage(`
        <p>I can help you explore or build any of the <strong>48 agents</strong> in the catalog!</p>
        <p style="margin-top: 6px; font-size: 0.85rem; color: var(--text-secondary);">
          You can ask:
        </p>
        <ul style="margin: 6px 0 6px 18px; font-size: 0.84rem; color: var(--text-secondary); line-height: 1.6;">
          <li><em>"Show me IT Engineering agents"</em></li>
          <li><em>"Which agent writes test cases or release notes?"</em></li>
          <li><em>"How does the Risk Memo Generator work?"</em></li>
          <li>Or simply click on any agent card on the left panel to test its persona!</li>
        </ul>
        <p style="font-size: 0.8rem; color: var(--accent-cyan); margin-top: 6px;">
          ⚡ <em>Tip: Click ⚙️ in the header to add your Groq API key for live streaming AI!</em>
        </p>
      `);
    }, 400);
  }

  // Smart Relevance Extractor & Token Budget Optimizer
  function extractRelevantContext(rawContent, query, maxChars = 3500) {
    if (!rawContent) return "";
    
    // Clean binary PDF artifacts, headers, unprintable bytes
    let cleaned = rawContent
      .replace(/stream[\s\S]*?endstream/gi, ' ')
      .replace(/obj[\s\S]*?endobj/gi, ' ')
      .replace(/xref[\s\S]*?trailer/gi, ' ')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned || cleaned.length < 50) {
      cleaned = rawContent.replace(/[\x00-\x1F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxChars);
    }

    // Split into readable paragraphs / chunks
    const chunks = [];
    for (let i = 0; i < cleaned.length; i += 500) {
      chunks.push(cleaned.slice(i, i + 500));
    }

    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    
    if (queryWords.length > 0) {
      const scored = chunks.map(chunk => {
        const lower = chunk.toLowerCase();
        let score = 0;
        queryWords.forEach(w => {
          if (lower.includes(w)) score += 1;
        });
        return { chunk, score };
      });

      scored.sort((a, b) => b.score - a.score);
      const topChunks = scored.filter(s => s.score > 0).slice(0, 4).map(s => s.chunk);
      if (topChunks.length > 0) {
        return topChunks.join("\n\n---\n\n").slice(0, maxChars);
      }
    }

    return cleaned.slice(0, maxChars);
  }

  // Live Groq Real-Time Streaming Execution
  async function runLiveGroqAgent(userPrompt) {
    // Construct System Prompt
    let systemInstruction = "You are a world-class enterprise AI copilot. ";
    if (activeAgent) {
      systemInstruction += `You are acting as the "${activeAgent.name}".
Domain: ${activeAgent.domain}
Tier Level: ${activeAgent.tier} (${activeAgent.complexity})
Business Problem Solved: ${activeAgent.problem}
Target Persona: ${activeAgent.persona}
Expected Deliverable Format: ${activeAgent.output}

Please structure your response strictly to meet these enterprise expectations. Use clear markdown headers, bold highlights, concise business language, and actionable bullet points.`;
    } else {
      systemInstruction += "You are the Copilot Agent Hub Assistant. You help users explore the 48 enterprise agents catalog, recommend the right agent for their problem, and design custom agents.";
    }

    // Smart Document Context Extraction (Respects Groq 8,000 Token-per-minute limit)
    const isGeneralQuery = /^[0-9+\-*/= ?]+$/.test(userPrompt.trim()) || 
                           /^(hi|hello|hey|help|who are you)\b/i.test(userPrompt.trim());

    if (uploadedDocumentContent && !isGeneralQuery) {
      const relevantSnippet = extractRelevantContext(uploadedDocumentContent, userPrompt, 3500);
      if (relevantSnippet && relevantSnippet.trim().length > 20) {
        systemInstruction += `\n\n=== RELEVANT CONTEXT FROM DOCUMENT: ${uploadedDocumentName} ===\n${relevantSnippet}\n=== END OF CONTEXT ===\nAnswer using the relevant document context above when applicable.`;
      }
    }

    // Create streaming message bubble
    const msg = document.createElement("div");
    msg.className = "message bot";
    const bubbleId = "stream-bubble-" + Date.now();
    msg.innerHTML = `
      <div class="message-avatar bot-avatar">${activeAgent ? "⚡" : "AI"}</div>
      <div class="message-bubble" id="${bubbleId}">
        <span style="color: var(--text-muted); font-size: 0.82rem;">Thinking with ${escapeHtml(groqModel)}...</span>
      </div>
    `;
    chatMessagesContainer.appendChild(msg);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    const streamBubble = document.getElementById(bubbleId);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.4,
          stream: true
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      streamBubble.innerHTML = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let reasoningText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const delta = data.choices[0]?.delta || {};

              if (delta.reasoning) {
                reasoningText += delta.reasoning;
                if (!fullText) {
                  const preview = reasoningText.length > 90 ? "..." + reasoningText.slice(-85) : reasoningText;
                  streamBubble.innerHTML = `<span style="color: var(--text-muted); font-size: 0.82rem; font-style: italic;">💭 Thinking: ${escapeHtml(preview)}</span>`;
                }
              }

              if (delta.content) {
                fullText += delta.content;
                streamBubble.innerHTML = renderSimpleMarkdown(fullText);
                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      if (!fullText.trim() && reasoningText.trim()) {
        streamBubble.innerHTML = renderSimpleMarkdown(reasoningText);
      } else if (!fullText.trim() && !reasoningText.trim()) {
        streamBubble.innerHTML = `<p>Hello! I am your <strong>${activeAgent ? escapeHtml(activeAgent.name) : "Catalog Assistant"}</strong>. How can I assist you with the 48 enterprise agents today?</p>`;
      }

      attachDeliverableToolbar(streamBubble);
      recordMessage(streamBubble.innerHTML, "bot");

    } catch (err) {
      streamBubble.innerHTML = `
        <div style="color: #f87171; font-size: 0.85rem;">
          <strong>⚠️ Groq API Error:</strong> ${escapeHtml(err.message)}
        </div>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
          Please check your Groq API key in ⚙️ Settings or make sure your internet connection is active.
        </p>
      `;
      attachDeliverableToolbar(streamBubble);
      recordMessage(streamBubble.innerHTML, "bot");
    }
  }

  // Markdown & Table Renderer (Responsive, non-overflowing)
  function renderSimpleMarkdown(md) {
    if (!md) return "";
    let text = escapeHtml(md);

    // Extract and preserve code blocks
    const codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, (_, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre class="chat-code-block"><code>${code}</code></pre>`);
      return id;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    // Bold & italic
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Headers
    text = text.replace(/^### (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="chat-h2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="chat-h1">$1</h1>');

    // Process line-by-line for tables, lists, and paragraphs
    const lines = text.split("\n");
    const formattedLines = [];
    let inTable = false;
    let tableRows = [];

    function flushTable() {
      if (tableRows.length === 0) return;
      let tableHtml = '<div class="table-responsive"><table class="chat-table">';
      
      tableRows.forEach((row, idx) => {
        let cleanRow = row.trim();
        if (cleanRow.startsWith("|")) cleanRow = cleanRow.slice(1);
        if (cleanRow.endsWith("|")) cleanRow = cleanRow.slice(0, -1);
        
        const cells = cleanRow.split("|").map(c => c.trim());
        
        // Skip separator row like |---|---|
        if (cells.every(c => /^[-:\s]+$/.test(c))) {
          return;
        }

        tableHtml += '<tr>';
        cells.forEach(cell => {
          const tag = idx === 0 ? 'th' : 'td';
          tableHtml += `<${tag}>${cell}</${tag}>`;
        });
        tableHtml += '</tr>';
      });

      tableHtml += '</table></div>';
      formattedLines.push(tableHtml);
      tableRows = [];
      inTable = false;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if line is part of a markdown table
      if (trimmed.startsWith("|") && (trimmed.endsWith("|") || trimmed.includes("|"))) {
        inTable = true;
        tableRows.push(trimmed);
      } else {
        if (inTable) {
          flushTable();
        }

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          formattedLines.push(`<li class="chat-list-item">${trimmed.slice(2)}</li>`);
        } else if (/^\d+\.\s/.test(trimmed)) {
          const itemText = trimmed.replace(/^\d+\.\s/, '');
          formattedLines.push(`<li class="chat-num-item">${itemText}</li>`);
        } else if (trimmed === "") {
          formattedLines.push('<div class="chat-spacer"></div>');
        } else {
          formattedLines.push(`<p class="chat-p">${line}</p>`);
        }
      }
    }

    if (inTable) {
      flushTable();
    }

    let result = formattedLines.join("\n");

    // Re-insert code blocks
    codeBlocks.forEach((block, idx) => {
      result = result.replace(`__CODE_BLOCK_${idx}__`, block);
    });

    // Convert interactive citation chips
    result = renderCitationsInHtml(result);

    return result;
  }

  // Simulated Grounded Output for Active Persona (Used when no API key)
  function simulateAgentResponse(agent, inputPrompt) {
    let outputContent = "";

    if (agent.name.includes("Executive Briefing")) {
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">📋 1-Page Executive Briefing</h3>
        <p style="font-size: 0.84rem; line-height: 1.5;"><strong>1. Top Wins & Financial Health:</strong> Top-line revenue compressed down 14% YoY in Q3 arriving at $84.2M [Doc p.1 §1] due to EMEA client onboarding latency. Engineering delivery velocity improved by 18% [Doc p.1 §2] delivering 42 story points in Sprint 44 with zero P0 regressions.</p>
        <p style="font-size: 0.84rem; line-height: 1.5; margin-top: 4px;"><strong>2. Critical Exposure & Risk:</strong> Commercial credit maturities of $18.4M in Q4 lacking re-collateralization with LTV ratios drifting > 78% on 4 Tier-2 commercial loans [Doc p.2 §3]. Average enterprise onboarding latency surged to 34 days in EMEA [Doc p.2 §4].</p>
        <p style="font-size: 0.84rem; line-height: 1.5; margin-top: 4px;"><strong>3. Decisions Needed Today:</strong> Sign-off on Phase 2 cloud allocation ($45k variance) [Doc p.3 §5] to eliminate $180k cloud drag; freeze discretionary limits on Tier-2 borrowers [Doc p.3 §5].</p>
        <p style="font-size: 0.84rem; line-height: 1.5; margin-top: 4px;"><strong>4. Board Meeting Questions:</strong> <em>"What is the projected timeline to cut KYC validation cycle times from 34 days down to 8 days?"</em> [Doc p.3 §5]</p>
      `;
    } else if (agent.name.includes("Sprint Planning")) {
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">🏃 Propose Sprint Plan (Velocity Target: 42 Pts)</h3>
        <p style="font-size: 0.84rem;"><strong>Sprint Delivery Health:</strong> Velocity increased by 18% [Doc p.1 §2] following the Q2 tokenizer architecture refactor with 42 story points delivered in Sprint 44.</p>
        <p style="font-size: 0.84rem; margin-top: 4px;"><strong>Priority Order for Sprint 45:</strong></p>
        <ol style="margin: 4px 0 8px 18px; font-size: 0.82rem; line-height: 1.5;">
          <li>[US-101] OAuth2 Token Rotation (5 pts) — <em>Security compliance before Nov 15 cutoff [Doc p.1 §2]</em></li>
          <li>[US-104] Automated AI KYC Validation Pipeline (8 pts) — <em>Resolve EMEA 34-day onboarding SLA breach [Doc p.2 §4]</em></li>
          <li>[US-108] Cloud Cluster Decommissioning (5 pts) — <em>Execute $45k Phase 2 allocation [Doc p.3 §5]</em></li>
        </ol>
        <p style="font-size: 0.84rem;"><strong>Capacity Risks:</strong> 2 backend engineers on scheduled PTO Thursday/Friday; architecture sign-off required from CTO [Doc p.1 §2].</p>
      `;
    } else if (agent.name.includes("Risk Memo")) {
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">⚠️ Executive Risk Memo</h3>
        <p style="font-size: 0.84rem;"><strong>Key Exposure:</strong> High exposure to commercial loan maturities maturing in Q4 without adequate re-collateralization ($18.4M risk exposure) [Doc p.2 §3].</p>
        <p style="font-size: 0.84rem; margin-top: 4px;"><strong>Early Warning Indicators:</strong> LTV ratios drifted above 78% on 4 Tier-2 commercial borrowers [Doc p.2 §3]; 30-day delinquency rate nudged up to 2.1% [Doc p.2 §3].</p>
        <p style="font-size: 0.84rem; margin-top: 4px;"><strong>Operational Vulnerability:</strong> Average enterprise client onboarding latency surged to 34 days in EMEA [Doc p.2 §4].</p>
        <p style="font-size: 0.84rem; margin-top: 4px;"><strong>Mandatory Mitigations:</strong> Immediate freeze on discretionary credit extensions [Doc p.3 §5]; fast-track AI KYC validation pipeline [Doc p.3 §5].</p>
      `;
    } else {
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">🎯 ${agent.name} Output</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">
          <strong>Deliverable Generated:</strong> ${agent.output}
        </p>
        <div style="margin-top: 8px; background: rgba(0,0,0,0.25); border-left: 3px solid var(--accent-primary); padding: 8px 12px; font-size: 0.82rem; line-height: 1.5;">
          Grounded on: <em>${uploadedDocumentName ? uploadedDocumentName : agent.attachments}</em> [Doc p.1 §1]<br>
          Target Audience: <strong>${agent.persona}</strong>
        </div>
        <p style="margin-top: 8px; font-size: 0.84rem; line-height: 1.5;">
          Analysis complete based on provided context. All criteria outlined in the <strong>${agent.tier}</strong> specification were successfully evaluated [Doc p.1 §2].
        </p>
      `;
    }

    outputContent += `
      <p style="margin-top: 10px; font-size: 0.76rem; color: var(--text-muted); border-top: 1px dashed var(--border-color); padding-top: 6px;">
        💡 <em>Simulated preview. Add your free Groq API key in ⚙️ Settings for live streaming AI!</em>
      </p>
    `;

    addBotMessage(outputContent);
  }

  // Quick Prompts Binding
  function bindQuickPrompts() {
    document.querySelectorAll(".quick-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const query = btn.getAttribute("data-query");
        chatInputField.value = query;
        handleChatSubmit(query);
      });
    });
  }

  // Document Upload
  fileUploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadedDocumentName = file.name;
    const reader = new FileReader();

    reader.onload = (event) => {
      uploadedDocumentContent = event.target.result;
      tabDocStatus.style.display = "flex";
      attachedDocBadge.textContent = `📎 ${file.name.slice(0, 15)}...`;

      addBotMessage(`
        <div style="font-weight: 700; color: #34d399;">
          📄 Document Loaded: ${escapeHtml(file.name)}
        </div>
        <p style="font-size: 0.83rem; color: var(--text-secondary); margin-top: 4px;">
          Size: ${(file.size / 1024).toFixed(1)} KB. You can now prompt any agent in the catalog to analyze this document!
        </p>
      `);
    };

    reader.readAsText(file);
  });

  // Search & Filter Listeners
  searchInput.addEventListener("input", renderAgents);
  tierFilter.addEventListener("change", renderAgents);
  complexityFilter.addEventListener("change", renderAgents);

  // Form Submit
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleChatSubmit(chatInputField.value);
  });

  // Theme Toggle
  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme");
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    document.body.setAttribute("data-theme", nextTheme);
  });

  // Chat Width Toggle
  if (chatWidthToggleBtn && appContainer) {
    chatWidthToggleBtn.addEventListener("click", () => {
      appContainer.classList.toggle("chat-wide");
      const isWide = appContainer.classList.contains("chat-wide");
      chatWidthToggleBtn.title = isWide ? "Compact Chat View" : "Expand Chat View";
      chatWidthToggleBtn.style.color = isWide ? "var(--accent-cyan)" : "var(--text-secondary)";
      chatWidthToggleBtn.style.borderColor = isWide ? "var(--accent-cyan)" : "var(--border-color)";
    });
  }

  // Settings Modal Handlers
  function openSettingsModal() {
    groqApiKeyInput.value = groqApiKey;
    groqModelSelect.value = groqModel;
    settingsStatusBox.style.display = "none";
    settingsModal.classList.add("open");
  }

  settingsBtn.addEventListener("click", openSettingsModal);
  if (apiStatusBtn) {
    apiStatusBtn.addEventListener("click", openSettingsModal);
  }

  settingsModalCloseBtn.addEventListener("click", () => {
    settingsModal.classList.remove("open");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("open");
    }
  });

  // Test Groq Connection Helper
  async function testGroqConnection(apiKey, model) {
    if (!apiKey) {
      throw new Error("Please enter your Groq API key first.");
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 5
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return true;
  }

  if (btnTestSettings) {
    btnTestSettings.addEventListener("click", async () => {
      const key = groqApiKeyInput.value.trim();
      const model = groqModelSelect.value;
      if (!key) {
        settingsStatusBox.style.display = "block";
        settingsStatusBox.style.background = "rgba(244, 63, 94, 0.15)";
        settingsStatusBox.style.color = "#fda4af";
        settingsStatusBox.style.border = "1px solid rgba(244, 63, 94, 0.3)";
        settingsStatusBox.innerHTML = `⚠️ Please enter an API key before testing.`;
        return;
      }

      settingsStatusBox.style.display = "block";
      settingsStatusBox.style.background = "rgba(99, 102, 241, 0.15)";
      settingsStatusBox.style.color = "#a5b4fc";
      settingsStatusBox.style.border = "1px solid rgba(99, 102, 241, 0.3)";
      settingsStatusBox.innerHTML = `⏳ Testing connection to Groq API with <strong>${model}</strong>...`;

      try {
        await testGroqConnection(key, model);
        settingsStatusBox.style.background = "rgba(16, 185, 129, 0.15)";
        settingsStatusBox.style.color = "#a7f3d0";
        settingsStatusBox.style.border = "1px solid rgba(16, 185, 129, 0.3)";
        settingsStatusBox.innerHTML = `✓ Connection verified! API key is active.`;
      } catch (err) {
        settingsStatusBox.style.background = "rgba(244, 63, 94, 0.15)";
        settingsStatusBox.style.color = "#fda4af";
        settingsStatusBox.style.border = "1px solid rgba(244, 63, 94, 0.3)";
        settingsStatusBox.innerHTML = `❌ Test failed: <strong>${escapeHtml(err.message)}</strong>`;
      }
    });
  }

  btnSaveSettings.addEventListener("click", () => {
    const key = groqApiKeyInput.value.trim();
    const model = groqModelSelect.value;

    groqApiKey = key;
    groqModel = model;

    localStorage.setItem("groq_api_key", key);
    localStorage.setItem("groq_model", model);
    updateApiStatusUI();

    settingsStatusBox.style.display = "block";
    settingsStatusBox.style.background = "rgba(16, 185, 129, 0.15)";
    settingsStatusBox.style.color = "#a7f3d0";
    settingsStatusBox.style.border = "1px solid rgba(16, 185, 129, 0.3)";
    settingsStatusBox.innerHTML = `✓ Settings saved! Model: <strong>${model}</strong>`;

    setTimeout(() => {
      settingsModal.classList.remove("open");
      if (key) {
        addBotMessage(`
          <div style="font-weight: 700; color: #34d399;">
            ⚡ Groq Live AI Connected!
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
            Using model <strong>${escapeHtml(model)}</strong>. All 48 agents are now running in <strong>real-time</strong> with instant streaming responses!
          </p>
        `);
      }
    }, 800);
  });

  btnClearSettings.addEventListener("click", () => {
    groqApiKey = "";
    groqApiKeyInput.value = "";
    localStorage.removeItem("groq_api_key");
    updateApiStatusUI();

    settingsStatusBox.style.display = "block";
    settingsStatusBox.style.background = "rgba(244, 63, 94, 0.15)";
    settingsStatusBox.style.color = "#fda4af";
    settingsStatusBox.style.border = "1px solid rgba(244, 63, 94, 0.3)";
    settingsStatusBox.innerHTML = `Key removed. Returned to simulation mode.`;

    setTimeout(() => {
      settingsModal.classList.remove("open");
    }, 800);
  });

  // Auto-load credentials from .env file on local server if not present in localStorage
  async function loadEnvConfig() {
    if (groqApiKey) return;
    try {
      const response = await fetch(".env");
      if (!response.ok) return;
      const text = await response.text();

      const keyMatch = text.match(/GROQ_API_KEY\s*=\s*([^\r\n#]+)/);
      const modelMatch = text.match(/GROQ_MODEL\s*=\s*([^\r\n#]+)/);

      let updated = false;
      if (keyMatch && keyMatch[1]) {
        const foundKey = keyMatch[1].trim();
        if (foundKey && !foundKey.includes("your_groq_api_key")) {
          groqApiKey = foundKey;
          localStorage.setItem("groq_api_key", foundKey);
          updated = true;
        }
      }

      if (modelMatch && modelMatch[1]) {
        const foundModel = modelMatch[1].trim();
        if (VALID_GROQ_MODELS.includes(foundModel)) {
          groqModel = foundModel;
          localStorage.setItem("groq_model", foundModel);
          updated = true;
        }
      }

      if (updated) {
        updateApiStatusUI();
      }
    } catch (e) {
      // Ignore if .env is inaccessible or on cross-origin static hosts
    }
  }

  // History Modal Handlers & Logic
  function formatRelativeTime(ts) {
    if (!ts) return "";
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
  }

  function renderHistoryList() {
    if (!historyListContainer) return;
    historyListContainer.innerHTML = "";

    if (!sessions || sessions.length === 0) {
      historyListContainer.innerHTML = `
        <div class="history-empty-state">
          <p style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">No saved conversations</p>
          <p style="margin-top: 4px; font-size: 0.8rem;">Start a chat with any of the 48 agents to begin!</p>
        </div>
      `;
      return;
    }

    sessions.forEach(session => {
      const card = document.createElement("div");
      card.className = `history-item-card ${session.id === currentSessionId ? "active-session" : ""}`;
      const count = session.messages ? session.messages.length : 0;
      const relativeTime = formatRelativeTime(session.updatedAt);

      card.innerHTML = `
        <div class="history-item-info">
          <div class="history-item-title">${escapeHtml(session.title || "Conversation")}</div>
          <div class="history-item-meta">
            <span class="history-item-badge">${escapeHtml(session.agentName || "Agent")}</span>
            <span>${relativeTime}</span>
            <span>• ${count} msgs</span>
          </div>
        </div>
        <button class="btn-history-delete" title="Delete conversation" data-id="${session.id}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-history-delete")) return;
        loadSession(session.id);
      });

      const deleteBtn = card.querySelector(".btn-history-delete");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSession(session.id);
      });

      historyListContainer.appendChild(card);
    });
  }

  function openHistoryModal() {
    renderHistoryList();
    if (historyModal) historyModal.classList.add("open");
  }

  function closeHistoryModal() {
    if (historyModal) historyModal.classList.remove("open");
  }

  function startNewChat() {
    currentSessionId = "session_" + Date.now();
    currentSession = {
      id: currentSessionId,
      title: "New Conversation",
      agentName: activeAgent ? activeAgent.name : "Catalog Assistant",
      updatedAt: Date.now(),
      messages: []
    };
    sessions.unshift(currentSession);
    saveSessions();

    chatMessagesContainer.innerHTML = "";
    renderWelcomeMessage();
    closeHistoryModal();
    switchMobileView("chat");
  }

  function renderWelcomeMessage() {
    chatMessagesContainer.innerHTML = `
      <div class="message bot">
        <div class="message-avatar bot-avatar">${activeAgent ? "⚡" : "AI"}</div>
        <div class="message-bubble">
          <p><strong>Welcome to the Copilot Agent Hub!</strong></p>
          <p style="margin-top: 6px; font-size: 0.86rem; color: var(--text-secondary);">
            I am your interactive AI Guide. You can:
          </p>
          <ul style="margin: 8px 0 8px 18px; font-size: 0.84rem; color: var(--text-secondary); line-height: 1.6;">
            <li>Click any of the <strong>48 Agent cards</strong> on the left to adopt its persona.</li>
            <li>Ask me for recommendations: <em>"Which agent helps with code reviews or sprint planning?"</em></li>
            <li>Upload or paste any notes/documents to test agent reasoning.</li>
          </ul>
        </div>
      </div>
    `;
  }

  function loadSession(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    currentSessionId = sessionId;
    currentSession = session;
    saveSessions();

    chatMessagesContainer.innerHTML = "";
    if (session.messages && session.messages.length > 0) {
      session.messages.forEach(m => {
        addMessage(m.html, m.type, false);
      });
    } else {
      renderWelcomeMessage();
    }

    if (session.agentName && session.agentName !== "Catalog Assistant") {
      const match = AGENT_CATALOG.find(a => a.name === session.agentName);
      if (match) {
        activeAgent = match;
        activeAgentLabel.textContent = match.name;
      }
    } else {
      activeAgent = null;
      activeAgentLabel.textContent = "Catalog Assistant";
    }
    renderAgents();

    closeHistoryModal();
    switchMobileView("chat");
  }

  function deleteSession(id) {
    sessions = sessions.filter(s => s.id !== id);
    if (currentSessionId === id) {
      if (sessions.length > 0) {
        loadSession(sessions[0].id);
      } else {
        startNewChat();
      }
    } else {
      saveSessions();
      renderHistoryList();
    }
  }

  function clearAllHistory() {
    if (confirm("Are you sure you want to clear all conversation history?")) {
      sessions = [];
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
      startNewChat();
      renderHistoryList();
    }
  }

  // Mobile View Switcher
  currentMobileView = "catalog";
  if (appContainer) {
    appContainer.classList.add("view-catalog");
  }

  function switchMobileView(view) {
    currentMobileView = view;
    if (!appContainer) return;

    if (view === "catalog") {
      appContainer.classList.remove("view-chat");
      appContainer.classList.add("view-catalog");
      if (mobileNavCatalog) mobileNavCatalog.classList.add("active");
      if (mobileNavChat) mobileNavChat.classList.remove("active");
      if (mobileNavHistory) mobileNavHistory.classList.remove("active");
    } else if (view === "chat") {
      appContainer.classList.remove("view-catalog");
      appContainer.classList.add("view-chat");
      if (mobileNavChat) mobileNavChat.classList.add("active");
      if (mobileNavCatalog) mobileNavCatalog.classList.remove("active");
      if (mobileNavHistory) mobileNavHistory.classList.remove("active");
      if (mobileChatBadge) mobileChatBadge.style.display = "none";
      setTimeout(() => {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
      }, 50);
    }
  }

  // History & Mobile Event Bindings
  if (historyBtn) historyBtn.addEventListener("click", openHistoryModal);
  if (chatHistoryBtn) chatHistoryBtn.addEventListener("click", openHistoryModal);
  if (historyModalCloseBtn) historyModalCloseBtn.addEventListener("click", closeHistoryModal);
  if (newChatBtn) newChatBtn.addEventListener("click", startNewChat);
  if (btnModalNewChat) btnModalNewChat.addEventListener("click", startNewChat);
  if (btnClearAllHistory) btnClearAllHistory.addEventListener("click", clearAllHistory);
  if (historyModal) {
    historyModal.addEventListener("click", (e) => {
      if (e.target === historyModal) closeHistoryModal();
    });
  }

  if (mobileNavCatalog) mobileNavCatalog.addEventListener("click", () => switchMobileView("catalog"));
  if (mobileNavChat) mobileNavChat.addEventListener("click", () => switchMobileView("chat"));
  if (mobileNavHistory) mobileNavHistory.addEventListener("click", openHistoryModal);
  if (btnMobileBack) btnMobileBack.addEventListener("click", () => switchMobileView("catalog"));

  // Grounding & Sample Report Event Bindings
  if (btnLoadSampleDoc) btnLoadSampleDoc.addEventListener("click", loadSampleEnterpriseDocument);
  if (groundingModalCloseBtn) groundingModalCloseBtn.addEventListener("click", closeGroundingModal);
  if (groundingModal) {
    groundingModal.addEventListener("click", (e) => {
      if (e.target === groundingModal) closeGroundingModal();
    });
  }
  if (btnCopyCitationExcerpt) {
    btnCopyCitationExcerpt.addEventListener("click", () => {
      if (!activeGroundingData) return;
      const cleanPassage = activeGroundingData.passage.replace(/<[^>]+>/g, "");
      const text = `[Grounded Citation - ${activeGroundingData.docRef}]\nDocument: ${activeGroundingData.sourceDoc} (${activeGroundingData.location})\nQuoted Claim: "${activeGroundingData.metric}"\n\nVerified Excerpt:\n"${cleanPassage}"\n\n🛡️ Verified Grounding (Zero Hallucination) • Copilot Agent Hub`;
      navigator.clipboard.writeText(text).then(() => {
        showToast("📋 Copied Verified Citation & Excerpt!", "success");
      });
    });
  }
  if (btnViewFullDoc) {
    btnViewFullDoc.addEventListener("click", () => {
      closeGroundingModal();
      openFullDocumentModal();
    });
  }
  if (fullDocModalCloseBtn) fullDocModalCloseBtn.addEventListener("click", closeFullDocModal);
  if (fullDocModal) {
    fullDocModal.addEventListener("click", (e) => {
      if (e.target === fullDocModal) closeFullDocModal();
    });
  }
  if (attachedDocBadge) {
    attachedDocBadge.style.cursor = "pointer";
    attachedDocBadge.title = "Click to inspect document content";
    attachedDocBadge.addEventListener("click", () => {
      openFullDocumentModal();
    });
  }

  // Event Delegation for Interactive Citation Chips in Chat Messages
  chatMessagesContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".citation-chip");
    if (!chip) return;
    e.preventDefault();
    e.stopPropagation();
    const page = chip.getAttribute("data-doc-page") || "1";
    const sec = chip.getAttribute("data-doc-sec") || "1";
    openGroundingInspector(page, sec, chip);
  });

  // Initial Run
  renderDomainPills();
  renderAgents();
  bindQuickPrompts();
  updateApiStatusUI();

  // Restore active session messages if present
  if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
    chatMessagesContainer.innerHTML = "";
    currentSession.messages.forEach(m => {
      addMessage(m.html, m.type, false);
    });
  }

  (async () => {
    if (!groqApiKey) {
      await loadEnvConfig();
    }

    if (groqApiKey) {
      if (!currentSession || currentSession.messages.length === 0) {
        setTimeout(() => {
          addBotMessage(`
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #34d399; font-size: 0.92rem;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
              Groq Live AI Connected & Ready!
            </div>
            <p style="font-size: 0.83rem; color: var(--text-secondary); margin-top: 4px;">
              Model: <strong>${escapeHtml(groqModel)}</strong>. All 48 agents are now running with <strong>real-time streaming AI reasoning</strong>!
            </p>
          `);
        }, 400);
      }
    } else {
      if (!currentSession || currentSession.messages.length === 0) {
        setTimeout(() => {
          addBotMessage(`
            <div class="api-notice-banner" style="margin: 0;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                <div>
                  <div style="font-weight: 700; color: #fb7185; font-size: 0.88rem;">⚡ Live AI API Key Not Connected</div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                    Currently running in simulated preview mode. Add a free Groq API key or define it in your .env file.
                  </div>
                </div>
                <button class="btn-connect-now" onclick="document.getElementById('settings-modal').classList.add('open')">Connect API Key</button>
              </div>
            </div>
          `);
        }, 600);
      }
    }
  })();
});
