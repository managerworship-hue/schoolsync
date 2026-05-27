import React, { useState } from "react";

// ─── Helper: converte File para base64 ───────────────────────────────────────
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Prompt enviado ao Gemini para extração da tabela ────────────────────────
const buildPrompt = () => `
Analise esta imagem de um horário escolar português.
Extraia EXATAMENTE o horário na estrutura JSON abaixo.

Regras obrigatórias:
- As chaves "1","2","3","4","5" representam Segunda, Terça, Quarta, Quinta e Sexta-feira.
- "time" deve ser exatamente no formato "HH:MM - HH:MM" conforme aparece na imagem.
- "subject" deve ser EXATAMENTE o nome da disciplina como aparece na imagem, sem abreviações e sem parênteses.
- NÃO inclua intervalos, recreios, almoços ou períodos sem aula.
- Se um dia não tiver aulas, coloque uma lista vazia [].
- Responda APENAS com o JSON válido, sem explicações, sem markdown, sem código de blocos.

Formato exato a devolver:
{"1":[{"time":"08:30 - 09:20","subject":"Matemática"},...],"2":[...],"3":[...],"4":[...],"5":[...]}
`;

export default function ImportScheduleModal({ activeChild, onClose, onImportSuccess }) {
  // Passos: 1=apikey, 2=upload, 3=analyzing, 4=preview
  const [step, setStep] = useState(() => {
    const savedKey = localStorage.getItem("schoolsync_gemini_key");
    return savedKey ? 2 : 1;
  });

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("schoolsync_gemini_key") || ""
  );
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [error, setError] = useState("");

  const [extractedSchedule, setExtractedSchedule] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  // ── Guardar chave API ──────────────────────────────────────────────────────
  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed || !trimmed.startsWith("AI")) {
      setError("Chave API inválida. Deve começar por 'AI'. Obtenha a sua em aistudio.google.com/app/apikey");
      return;
    }
    localStorage.setItem("schoolsync_gemini_key", trimmed);
    setApiKey(trimmed);
    setError("");
    setStep(2);
  };

  const handleChangeApiKey = () => {
    localStorage.removeItem("schoolsync_gemini_key");
    setApiKey("");
    setApiKeyInput("");
    setStep(1);
  };

  // ── Upload de ficheiro ─────────────────────────────────────────────────────
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setImageUrl(URL.createObjectURL(selectedFile));
    setError("");
    analyzeImage(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  // ── Análise com Gemini Vision ──────────────────────────────────────────────
  const analyzeImage = async (imageFile) => {
    setStep(3);
    setAnalyzing(true);
    setAnalyzeProgress(5);
    setAnalyzeStatus("A preparar imagem para análise...");
    setError("");

    try {
      // Converter imagem para base64
      const base64Data = await fileToBase64(imageFile);
      setAnalyzeProgress(20);
      setAnalyzeStatus("A enviar imagem para IA Gemini...");

      const mimeType = imageFile.type || "image/jpeg";
      const currentKey = localStorage.getItem("schoolsync_gemini_key") || apiKey;

      if (!currentKey) {
        setError("Chave API não encontrada. Por favor, configure a sua chave Gemini.");
        setStep(1);
        setAnalyzing(false);
        return;
      }

      setAnalyzeProgress(40);
      setAnalyzeStatus("Gemini a analisar a estrutura da tabela de horário...");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${currentKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: buildPrompt() },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              topK: 1,
              topP: 1,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      setAnalyzeProgress(75);
      setAnalyzeStatus("A processar resposta da IA...");

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || `Erro ${response.status}`;
        
        if (response.status === 400 && errMsg.includes("API_KEY")) {
          throw new Error("Chave API inválida ou expirada. Verifique a sua chave em aistudio.google.com.");
        }
        if (response.status === 429) {
          throw new Error("Limite de utilização gratuita atingido. Aguarde um momento e tente de novo.");
        }
        throw new Error(`Erro da API Gemini: ${errMsg}`);
      }

      const data = await response.json();

      setAnalyzeProgress(90);
      setAnalyzeStatus("A mapear disciplinas e horários extraídos...");

      // Extrair o JSON da resposta do Gemini
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("SchoolSync Gemini — Resposta bruta:", rawText);

      // Limpar o JSON da resposta (remover markdown se presente)
      let cleanJson = rawText.trim();
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch {
        throw new Error("A IA não devolveu um JSON válido. Tente com uma imagem mais nítida.");
      }

      // Normalizar e validar o horário extraído
      const normalized = {};
      const days = ["1", "2", "3", "4", "5"];
      days.forEach((day) => {
        const dayData = parsed[day] || parsed[parseInt(day)] || [];
        normalized[day] = Array.isArray(dayData)
          ? dayData
              .filter((slot) => slot.subject && slot.subject.trim() !== "")
              .map((slot, idx) => ({
                id: `gemini-${day}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                subject: slot.subject
                  .replace(/\(.*?\)/g, "")
                  .replace(/\[.*?\]/g, "")
                  .trim(),
                time: slot.time || "",
                room: "",
                teacher: "",
                email: "",
              }))
          : [];
      });

      const totalClasses = Object.values(normalized).reduce(
        (sum, arr) => sum + arr.length,
        0
      );

      if (totalClasses === 0) {
        throw new Error("Nenhuma aula foi detetada na imagem. Certifique-se de que a imagem está nítida e contém uma tabela de horário.");
      }

      setAnalyzeProgress(100);
      setAnalyzeStatus(`✓ ${totalClasses} aulas extraídas com sucesso!`);

      setTimeout(() => {
        setExtractedSchedule(normalized);
        setEditSchedule(JSON.parse(JSON.stringify(normalized))); // deep copy para edição
        setAnalyzing(false);
        setStep(4);
      }, 600);

    } catch (err) {
      console.error("SchoolSync Gemini Error:", err);
      setError(err.message || "Erro desconhecido ao analisar a imagem.");
      setAnalyzing(false);
      setStep(2);
    }
  };

  // ── Edição pós-extração ────────────────────────────────────────────────────
  const handleEditSlot = (day, idx, field, value) => {
    setEditSchedule((prev) => {
      const updated = { ...prev };
      updated[day] = [...(updated[day] || [])];
      updated[day][idx] = { ...updated[day][idx], [field]: value };
      return updated;
    });
  };

  const handleDeleteSlot = (day, idx) => {
    setEditSchedule((prev) => {
      const updated = { ...prev };
      updated[day] = updated[day].filter((_, i) => i !== idx);
      return updated;
    });
  };

  const handleAddSlot = (day) => {
    setEditSchedule((prev) => {
      const updated = { ...prev };
      updated[day] = [
        ...(updated[day] || []),
        {
          id: `manual-${day}-${Date.now()}`,
          subject: "",
          time: "",
          room: "",
          teacher: "",
          email: "",
        },
      ];
      return updated;
    });
  };

  // ── Confirmar e injetar na grelha ──────────────────────────────────────────
  const handleConfirm = () => {
    if (!editSchedule) return;

    const filtered = {};
    let hasAny = false;

    Object.entries(editSchedule).forEach(([day, slots]) => {
      filtered[day] = slots.filter((s) => s.subject.trim() !== "");
      if (filtered[day].length > 0) hasAny = true;
    });

    if (!hasAny) {
      alert("Nenhuma disciplina encontrada. Adicione pelo menos uma aula antes de confirmar.");
      return;
    }

    onImportSuccess(activeChild.id, filtered);
    onClose();
  };

  const DAY_NAMES = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];
  const DAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex"];

  const totalExtracted = editSchedule
    ? Object.values(editSchedule).reduce((sum, arr) => sum + arr.filter(s => s.subject?.trim()).length, 0)
    : 0;

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }}>
      <div
        className="glass-panel modal-content"
        style={{
          maxWidth: step === 4 ? "780px" : "540px",
          padding: "1.5rem",
          transition: "max-width 0.3s ease",
        }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        {/* ═══ PASSO 1: CONFIGURAÇÃO DA CHAVE API ═══════════════════════════ */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="modal-header" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔑</div>
              <h3 className="gradient-text" style={{ fontSize: "1.3rem", margin: 0 }}>
                Configurar IA de Importação
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.3rem", lineHeight: "1.5" }}>
                Para ler prints automaticamente, a aplicação utiliza a IA Gemini da Google (gratuito).
                A sua chave é guardada apenas no seu telemóvel e nunca enviada para terceiros.
              </p>
            </div>

            {/* Como obter a chave */}
            <div style={{
              background: "rgba(6, 182, 212, 0.05)",
              border: "1px solid rgba(6, 182, 212, 0.15)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1rem",
              fontSize: "0.78rem",
              lineHeight: "1.6",
              color: "var(--color-text-secondary)"
            }}>
              <strong style={{ color: "var(--color-primary)", display: "block", marginBottom: "0.3rem" }}>
                Como obter a chave gratuita (30 segundos):
              </strong>
              <ol style={{ margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <li>Aceda a <strong style={{ color: "var(--color-text-primary)" }}>aistudio.google.com/app/apikey</strong></li>
                <li>Clique em <strong style={{ color: "var(--color-text-primary)" }}>"Criar chave de API"</strong></li>
                <li>Copie a chave gerada (começa por "AI...")</li>
                <li>Cole-a abaixo e clique em Guardar</li>
              </ol>
            </div>

            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-md)", padding: "0.65rem 0.9rem", fontSize: "0.78rem", color: "#f87171" }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Chave API Gemini (Google AI Studio)</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  className="form-input"
                  placeholder="AIza..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveApiKey()}
                  style={{ paddingRight: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "1rem", padding: "0.2rem" }}
                >
                  {showApiKey ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveApiKey}
              style={{ width: "100%", padding: "0.75rem", fontWeight: "700", fontSize: "0.9rem" }}
            >
              Guardar e Continuar →
            </button>

            <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textAlign: "center", margin: 0 }}>
              🔒 A chave fica guardada apenas neste telemóvel. Não é partilhada com ninguém.
            </p>
          </div>
        )}

        {/* ═══ PASSO 2: UPLOAD DO PRINT ════════════════════════════════════ */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="modal-header" style={{ textAlign: "center" }}>
              <h3 className="gradient-text" style={{ fontSize: "1.3rem" }}>
                📤 Importar Horário de {activeChild.name}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
                Carregue um print ou foto do horário escolar. A IA Gemini irá extrair automaticamente todas as disciplinas e horários com exatidão.
              </p>
            </div>

            {error && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-md)", padding: "0.65rem 0.9rem", fontSize: "0.78rem", color: "#f87171", lineHeight: "1.5" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Drop Zone */}
            <form
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload-gemini").click()}
              style={{
                border: `2px dashed ${dragActive ? "var(--color-primary)" : "rgba(255, 255, 255, 0.12)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "3rem 1.5rem",
                textAlign: "center",
                background: dragActive ? "rgba(var(--color-primary-rgb), 0.04)" : "rgba(255, 255, 255, 0.005)",
                cursor: "pointer",
                transition: "var(--transition-smooth)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
              }}
            >
              <input
                id="file-upload-gemini"
                type="file"
                multiple={false}
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: "2.5rem" }}>🤖</div>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                  {dragActive ? "Solte o print aqui..." : "Arraste o print ou clique para selecionar"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  Suporta PNG, JPG, JPEG — A IA Gemini lê a imagem e extrai tudo automaticamente
                </p>
              </div>
            </form>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ padding: "0.6rem 0.85rem", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.12)", borderRadius: "var(--radius-md)", fontSize: "0.73rem", color: "var(--color-text-secondary)", lineHeight: "1.4", display: "flex", gap: "0.4rem", alignItems: "center", flex: 1 }}>
                <span>✅</span>
                <span><strong style={{ color: "#10b981" }}>IA Gemini configurada.</strong> Cada análise usa o crédito gratuito da sua conta Google.</span>
              </div>
              <button
                type="button"
                onClick={handleChangeApiKey}
                style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", fontSize: "0.7rem", cursor: "pointer", marginLeft: "0.75rem", textDecoration: "underline", whiteSpace: "nowrap" }}
              >
                Alterar chave
              </button>
            </div>
          </div>
        )}

        {/* ═══ PASSO 3: ANÁLISE EM CURSO ════════════════════════════════════ */}
        {step === 3 && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "2rem 0", textAlign: "center" }}>
            {/* Ícone animado */}
            <div style={{
              position: "relative",
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              background: "rgba(6, 182, 212, 0.06)",
              border: "2px solid rgba(6, 182, 212, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)",
              animation: "pulsateGlow 2s ease-in-out infinite"
            }}>
              <span style={{ fontSize: "3rem" }}>🤖</span>
            </div>

            <style>{`
              @keyframes pulsateGlow {
                0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.15); }
                50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.35), 0 0 60px rgba(6, 182, 212, 0.1); }
              }
            `}</style>

            <div style={{ width: "100%" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.2rem" }}>Gemini IA a ler o horário...</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                A inteligência artificial Gemini está a analisar a estrutura da tabela e a extrair cada disciplina e horário exatamente como aparecem no print.
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", height: "8px", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{
                height: "100%",
                width: `${analyzeProgress}%`,
                background: "linear-gradient(90deg, #06b6d4, #10b981)",
                borderRadius: "4px",
                transition: "width 0.4s ease-out"
              }}></div>
            </div>

            <div style={{ fontSize: "0.82rem", color: "var(--color-text-primary)", fontWeight: "500" }}>
              {analyzeStatus} <strong style={{ color: "#10b981" }}>{analyzeProgress}%</strong>
            </div>

            {/* Thumbnail da imagem */}
            {imageUrl && (
              <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", opacity: 0.7 }}>
                <img src={imageUrl} alt="Print" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
        )}

        {/* ═══ PASSO 4: REVISÃO E CONFIRMAÇÃO ══════════════════════════════ */}
        {step === 4 && editSchedule && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>

            {/* Header de sucesso */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "var(--radius-md)", padding: "0.7rem 1rem" }}>
              <span style={{ fontSize: "1.4rem" }}>✅</span>
              <div>
                <p style={{ margin: 0, fontWeight: "700", fontSize: "0.9rem", color: "#10b981" }}>
                  {totalExtracted} aulas extraídas pela IA Gemini
                </p>
                <p style={{ margin: 0, fontSize: "0.73rem", color: "var(--color-text-muted)" }}>
                  Verifique abaixo se tudo está correto. Pode editar ou remover aulas individualmente.
                </p>
              </div>
            </div>

            {/* Layout: imagem + tabela */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>

              {/* Imagem do print (esquerda) */}
              {imageUrl && (
                <div style={{ flex: "0 0 160px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--color-text-muted)" }}>Print Original:</span>
                  <div style={{
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    height: "320px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px"
                  }}>
                    <img
                      src={imageUrl}
                      alt="Print do Horário"
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "4px", cursor: "zoom-in" }}
                      onClick={(e) => {
                        const img = e.target;
                        if (img.style.transform === "scale(2)") {
                          img.style.transform = "scale(1)";
                          img.style.position = "static";
                          img.style.zIndex = "auto";
                        } else {
                          img.style.transform = "scale(2)";
                          img.style.position = "relative";
                          img.style.zIndex = "100";
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Tabela por dia (direita) */}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                
                {/* Tabs dos dias */}
                <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5].map((day) => {
                    const count = (editSchedule[day] || []).filter(s => s.subject?.trim()).length;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          border: "1px solid",
                          borderColor: selectedDay === day ? "var(--color-primary)" : "rgba(255,255,255,0.08)",
                          background: selectedDay === day ? "rgba(6, 182, 212, 0.12)" : "transparent",
                          color: selectedDay === day ? "var(--color-primary)" : "var(--color-text-secondary)",
                          fontSize: "0.72rem",
                          fontWeight: selectedDay === day ? "700" : "500",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        {DAY_SHORT[day - 1]}
                        {count > 0 && (
                          <span style={{
                            background: selectedDay === day ? "var(--color-primary)" : "rgba(255,255,255,0.1)",
                            color: selectedDay === day ? "#0b0f19" : "var(--color-text-muted)",
                            borderRadius: "10px",
                            padding: "0 5px",
                            fontSize: "0.62rem",
                            fontWeight: "700"
                          }}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Aulas do dia selecionado */}
                <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--color-text-secondary)" }}>
                  {DAY_NAMES[selectedDay - 1]}
                </div>

                <div style={{
                  maxHeight: "285px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  padding: "0.1rem"
                }}>
                  {(editSchedule[selectedDay] || []).length === 0 ? (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "center", padding: "1.5rem 0" }}>
                      Sem aulas neste dia
                    </div>
                  ) : (
                    editSchedule[selectedDay].map((slot, idx) => (
                      <div
                        key={slot.id || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                          borderRadius: "6px",
                          padding: "5px 8px"
                        }}
                      >
                        {/* Hora */}
                        <input
                          type="text"
                          value={slot.time}
                          onChange={(e) => handleEditSlot(String(selectedDay), idx, "time", e.target.value)}
                          style={{
                            width: "105px",
                            fontSize: "0.68rem",
                            background: "rgba(0,0,0,0.25)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            color: "var(--color-text-secondary)",
                            borderRadius: "4px",
                            padding: "3px 4px",
                            textAlign: "center",
                            outline: "none"
                          }}
                          placeholder="08:30 - 09:20"
                        />

                        {/* Disciplina */}
                        <input
                          type="text"
                          value={slot.subject}
                          onChange={(e) => handleEditSlot(String(selectedDay), idx, "subject", e.target.value)}
                          style={{
                            flex: 1,
                            fontSize: "0.78rem",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "var(--color-text-primary)",
                            borderRadius: "4px",
                            padding: "3px 6px",
                            fontWeight: "600",
                            outline: "none"
                          }}
                          placeholder="Disciplina"
                        />

                        {/* Apagar */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(String(selectedDay), idx)}
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "none",
                            color: "#f87171",
                            borderRadius: "4px",
                            padding: "3px 6px",
                            cursor: "pointer",
                            fontSize: "0.68rem"
                          }}
                          title="Remover"
                        >
                          🗑️
                        </button>
                      </div>
                    ))
                  )}

                  {/* Botão adicionar aula */}
                  <button
                    type="button"
                    onClick={() => handleAddSlot(String(selectedDay))}
                    style={{
                      background: "transparent",
                      border: "1px dashed rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      color: "var(--color-text-muted)",
                      fontSize: "0.72rem",
                      padding: "5px",
                      cursor: "pointer",
                      width: "100%",
                      marginTop: "0.2rem"
                    }}
                  >
                    ＋ Adicionar aula
                  </button>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: "flex", gap: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.7rem" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setStep(2); setFile(null); setImageUrl(null); setEditSchedule(null); setExtractedSchedule(null); setError(""); }}
                style={{ flex: 1, padding: "0.6rem" }}
              >
                Importar Outro Print
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirm}
                style={{ flex: 2, padding: "0.6rem", fontWeight: "700" }}
              >
                ✓ Aplicar Horário na Agenda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
