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
  const settingsStatusBox = document.getElementById("settings-status-box");

  // State
  let activeDomain = "all";
  let activeAgent = null;
  let uploadedDocumentContent = null;
  let uploadedDocumentName = null;
  let groqApiKey = localStorage.getItem("groq_api_key") || "";
  let storedModel = localStorage.getItem("groq_model");
  let groqModel = (storedModel && !storedModel.includes("llama")) ? storedModel : "openai/gpt-oss-120b";
  localStorage.setItem("groq_model", groqModel);

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

  // Chat Helpers
  function addMessage(html, type = "bot") {
    const msg = document.createElement("div");
    msg.className = `message ${type}`;
    msg.innerHTML = `
      <div class="message-avatar ${type === "bot" ? "bot-avatar" : "user-avatar"}">
        ${type === "bot" ? "AI" : "You"}
      </div>
      <div class="message-bubble">${html}</div>
    `;
    chatMessagesContainer.appendChild(msg);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  function addBotMessage(html) {
    addMessage(html, "bot");
  }

  function addUserMessage(text) {
    addMessage(`<p>${escapeHtml(text)}</p>`, "user");
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
              const token = data.choices[0]?.delta?.content || "";
              fullText += token;
              streamBubble.innerHTML = renderSimpleMarkdown(fullText);
              chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

    } catch (err) {
      streamBubble.innerHTML = `
        <div style="color: #f87171; font-size: 0.85rem;">
          <strong>⚠️ Groq API Error:</strong> ${escapeHtml(err.message)}
        </div>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
          Please check your Groq API key in ⚙️ Settings or make sure your internet connection is active.
        </p>
      `;
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

    return result;
  }

  // Simulated Grounded Output for Active Persona (Used when no API key)
  function simulateAgentResponse(agent, inputPrompt) {
    let outputContent = "";

    if (agent.name.includes("Executive Briefing")) {
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">📋 1-Page Executive Briefing</h3>
        <p style="font-size: 0.84rem; line-height: 1.5;"><strong>1. Top Wins & Progress:</strong> Revenue targets met at 104% of plan; deployment velocity increased by 18% following sprint optimization.</p>
        <p style="font-size: 0.84rem; line-height: 1.5; margin-top: 4px;"><strong>2. Critical Risks & Blockers:</strong> Client onboarding latency in EMEA; 3 open dependency tickets requiring executive sponsor sign-off.</p>
        <p style="font-size: 0.84rem; line-height: 1.5; margin-top: 4px;"><strong>3. Decisions Needed Today:</strong> Sign-off on Phase 2 cloud allocation ($45k variance) and staffing reallocations for Q3.</p>
        <p style="font-size: 0.84rem; line-height: 1.5; margin-top: 4px;"><strong>4. Meeting Questions:</strong> <em>"What is the mitigation plan if the legacy data migration runs past Friday?"</em></p>
      `;
    } else if (agent.name.includes("Sprint Planning")) {
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">🏃 Propose Sprint Plan (Velocity Target: 42 Pts)</h3>
        <p style="font-size: 0.84rem;"><strong>Priority Order:</strong></p>
        <ol style="margin: 4px 0 8px 18px; font-size: 0.82rem; line-height: 1.5;">
          <li>[US-101] OAuth2 Token Rotation (5 pts) — <em>Security priority</em></li>
          <li>[US-104] Document Parsing API Pipeline (8 pts) — <em>Core milestone</em></li>
          <li>[US-108] Chat Stream Response UI (5 pts) — <em>Frontend dependency</em></li>
        </ol>
        <p style="font-size: 0.84rem;"><strong>Capacity Risks:</strong> 2 backend engineers on scheduled PTO Thursday/Friday; buffer applied.</p>
        <p style="font-size: 0.84rem; margin-top: 4px;"><strong>Stand-up Focus:</strong> Ensure tokenizer benchmark clears QA gate by Day 3.</p>
      `;
    } else if (agent.name.includes("Risk Memo")) {
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">⚠️ Executive Risk Memo</h3>
        <p style="font-size: 0.84rem;"><strong>Key Exposure:</strong> High concentration of commercial credit lines maturing in Q4 without re-collateralization.</p>
        <p style="font-size: 0.84rem; margin-top: 4px;"><strong>Early Warning Indicators:</strong> LTV ratios drifting > 78% on 4 Tier-2 commercial loans.</p>
        <p style="font-size: 0.84rem; margin-top: 4px;"><strong>Recommended Actions:</strong> Trigger accelerated audit review; cap discretionary credit extensions pending committee meeting.</p>
      `;
    } else {
      // General structure derived from catalog expected output
      outputContent = `
        <h3 style="font-size: 0.95rem; color: var(--accent-cyan); margin-bottom: 6px;">🎯 ${agent.name} Output</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">
          <strong>Deliverable Generated:</strong> ${agent.output}
        </p>
        <div style="margin-top: 8px; background: rgba(0,0,0,0.25); border-left: 3px solid var(--accent-primary); padding: 8px 12px; font-size: 0.82rem; line-height: 1.5;">
          Grounded on: <em>${uploadedDocumentName ? uploadedDocumentName : agent.attachments}</em><br>
          Target Audience: <strong>${agent.persona}</strong>
        </div>
        <p style="margin-top: 8px; font-size: 0.84rem; line-height: 1.5;">
          Analysis complete based on provided context. All criteria outlined in the <strong>${agent.tier}</strong> specification were successfully evaluated.
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
  settingsBtn.addEventListener("click", () => {
    groqApiKeyInput.value = groqApiKey;
    groqModelSelect.value = groqModel;
    settingsStatusBox.style.display = "none";
    settingsModal.classList.add("open");
  });

  settingsModalCloseBtn.addEventListener("click", () => {
    settingsModal.classList.remove("open");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("open");
    }
  });

  btnSaveSettings.addEventListener("click", () => {
    const key = groqApiKeyInput.value.trim();
    const model = groqModelSelect.value;

    groqApiKey = key;
    groqModel = model;

    localStorage.setItem("groq_api_key", key);
    localStorage.setItem("groq_model", model);

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

    settingsStatusBox.style.display = "block";
    settingsStatusBox.style.background = "rgba(244, 63, 94, 0.15)";
    settingsStatusBox.style.color = "#fda4af";
    settingsStatusBox.style.border = "1px solid rgba(244, 63, 94, 0.3)";
    settingsStatusBox.innerHTML = `Key removed. Returned to simulation mode.`;

    setTimeout(() => {
      settingsModal.classList.remove("open");
    }, 800);
  });

  // Initial Run
  renderDomainPills();
  renderAgents();
  bindQuickPrompts();

  if (groqApiKey) {
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
});
