import React, { useState, useEffect } from "react";

export default function ImportScheduleModal({ activeChild, onClose, onImportSuccess }) {
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Scanning, 3 = Preview
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("A inicializar motor de IA...");
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [startHour, setStartHour] = useState("08:30");

  // Estados para o OCR e o assistente de "Pintar Grelha"
  const [tesseractLoaded, setTesseractLoaded] = useState(false);
  const [detectedWords, setDetectedWords] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [cycle, setCycle] = useState(() => {
    let gradeNumber = 7;
    const match = activeChild.grade.match(/(\d+)/);
    if (match) {
      gradeNumber = parseInt(match[1], 10);
    }
    return gradeNumber <= 9 ? "basico" : "secundario";
  });
  
  // Pincel ativo para "pintar" as disciplinas na grelha
  const [activeBrush, setActiveBrush] = useState("Matemática");
  const [customBrushText, setCustomBrushText] = useState("");

  // Carregar o Tesseract.js a partir do CDN de forma assíncrona
  useEffect(() => {
    if (window.Tesseract) {
      setTesseractLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
    script.async = true;
    script.onload = () => {
      console.log("SchoolSync OCR: Tesseract.js carregado com sucesso!");
      setTesseractLoaded(true);
    };
    script.onerror = () => {
      console.error("SchoolSync OCR: Falha ao carregar Tesseract.js do CDN.");
    };
    document.body.appendChild(script);
  }, []);

  // Inicializar grelha em branco estruturada e alinhada
  const initializeBlankGrid = (selectedCycle, startHr) => {
    const basicoHours = ["08:30 - 09:20", "09:25 - 10:15", "10:30 - 11:20", "11:25 - 12:15", "12:25 - 13:15", "13:30 - 14:20", "14:25 - 15:15"];
    const secundarioHours = ["08:30 - 10:00", "10:15 - 11:45", "12:00 - 13:30", "13:45 - 15:15", "15:30 - 17:00"];
    
    const adjustHours = (hoursList, start) => {
      if (start === "08:30") return hoursList;
      
      const parseMin = (s) => {
        const [h, m] = s.split(":").map(Number);
        return h * 60 + m;
      };
      
      const formatMin = (m) => {
        const h = Math.floor(m / 60) % 24;
        const min = m % 60;
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      };
      
      const originalStart = parseMin(hoursList[0].split(" - ")[0]);
      const targetStart = parseMin(start);
      const diff = targetStart - originalStart;
      
      return hoursList.map(slot => {
        const [s, e] = slot.split(" - ");
        return `${formatMin(parseMin(s) + diff)} - ${formatMin(parseMin(e) + diff)}`;
      });
    };

    const finalHours = adjustHours(selectedCycle === "basico" ? basicoHours : secundarioHours, startHr);
    
    const blank = {};
    for (let day = 1; day <= 5; day++) {
      blank[day] = finalHours.map((time, idx) => ({
        id: `cell-${day}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        subject: "",
        time: time,
        room: "",
        teacher: "",
        email: ""
      }));
    }
    return blank;
  };

  // Trigger automático ao entrar no Passo 3 ou mudar o ciclo/hora
  useEffect(() => {
    if (step === 3 && !generatedSchedule) {
      setGeneratedSchedule(initializeBlankGrid(cycle, startHour));
    }
  }, [step, cycle, startHour]);

  // Recriar grelha se o utilizador alterar o ciclo ou hora de início manualmente
  const handleGridReset = (newCycle, newStartHour) => {
    setCycle(newCycle);
    setStartHour(newStartHour);
    setGeneratedSchedule(initializeBlankGrid(newCycle, newStartHour));
  };

  // OCR de Leitura Real
  useEffect(() => {
    if (step !== 2) return;

    let isSubscribed = true;

    const runOCR = async () => {
      let simProgress = 0;
      const simInterval = setInterval(() => {
        if (simProgress < 30) {
          simProgress += 2;
          if (isSubscribed) {
            setScanProgress(simProgress);
            setScanStatus("A otimizar print e contraste...");
          }
        } else {
          clearInterval(simInterval);
        }
      }, 80);

      if (window.Tesseract && file) {
        try {
          if (isSubscribed) {
            setScanStatus("A carregar motor OCR...");
          }

          const worker = await window.Tesseract.createWorker({
            logger: (m) => {
              if (m.status === "recognizing text") {
                const progressPercent = Math.min(30 + Math.round(m.progress * 65), 95);
                if (isSubscribed) {
                  setScanProgress(progressPercent);
                  setScanStatus("A extrair texto e disciplinas do documento...");
                }
              }
            }
          });

          await worker.loadLanguage("por");
          await worker.initialize("por");

          const { data: { lines } } = await worker.recognize(file);
          await worker.terminate();

          if (!isSubscribed) return;

          // Processar palavras lidas para a paleta
          const wordSet = new Set();
          lines.forEach(line => {
            const cleanText = line.text.trim();
            if (cleanText.length > 2 && cleanText.length < 30) {
              const cleaned = cleanText.replace(/[().,;:!?\[\]]/g, "").trim();
              if (cleaned.length > 2 && !/^\d+$/.test(cleaned) && !["sala", "prof", "intervalo", "recreio", "almoco", "segunda", "terca", "quarta", "quinta", "sexta"].includes(cleaned.toLowerCase())) {
                const capitalized = cleaned.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
                wordSet.add(capitalized);
              }
            }
          });

          const uniqueWordsList = Array.from(wordSet).sort();
          setDetectedWords(uniqueWordsList);
          
          // Se ler alguma disciplina, define-a como pincel ativo inicial
          if (uniqueWordsList.length > 0) {
            setActiveBrush(uniqueWordsList[0]);
          }

          setScanProgress(100);
          setScanStatus("Documento lido com sucesso!");

          setTimeout(() => {
            if (isSubscribed) {
              setStep(3);
            }
          }, 400);

        } catch (err) {
          console.error("Falha no OCR, avançando para preenchimento manual:", err);
          fallbackToSimulation();
        }
      } else {
        fallbackToSimulation();
      }
    };

    const fallbackToSimulation = () => {
      let progress = 30;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          if (isSubscribed) {
            setScanProgress(100);
            setScanStatus("A carregar assistente...");
            setTimeout(() => {
              if (isSubscribed) {
                setStep(3);
              }
            }, 400);
          }
        } else {
          if (isSubscribed) {
            setScanProgress(progress);
            setScanStatus("A inicializar assistente interativo...");
          }
        }
      }, 100);
    };

    runOCR();

    return () => {
      isSubscribed = false;
    };
  }, [step]);

  // Função para "Pintar" o valor na grelha ao clicar na célula
  const handleCellClick = (dayIndex, slotIdx) => {
    if (!generatedSchedule) return;

    setGeneratedSchedule((prev) => {
      const updated = { ...prev };
      const currentCell = updated[dayIndex][slotIdx];
      
      // Se for a borracha, limpa a célula. Caso contrário, atribui a disciplina selecionada
      if (activeBrush === "eraser") {
        currentCell.subject = "";
      } else {
        currentCell.subject = activeBrush;
      }
      
      return updated;
    });
  };

  // Alterar a hora de um bloco específico
  const handleRowTimeChange = (slotIdx, newTimeValue) => {
    setGeneratedSchedule((prev) => {
      if (!prev) return null;
      const updated = { ...prev };
      Object.keys(updated).forEach((dayIndex) => {
        if (updated[dayIndex][slotIdx]) {
          updated[dayIndex][slotIdx].time = newTimeValue;
        }
      });
      return updated;
    });
  };

  // Adicionar uma nova linha (bloco de tempo)
  const handleAddRow = () => {
    setGeneratedSchedule((prev) => {
      if (!prev) return null;
      const updated = { ...prev };
      const currentLength = updated[1].length;
      
      // Calcular um tempo sugerido baseado na última linha
      let suggestedTime = "17:00 - 18:00";
      if (currentLength > 0) {
        const lastTime = updated[1][currentLength - 1].time;
        const parts = lastTime.split(" - ");
        if (parts.length === 2) {
          const [sh, sm] = parts[1].split(":").map(Number);
          const endHourFormatted = `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
          const nextHourFormatted = `${String(sh + 1).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
          suggestedTime = `${endHourFormatted} - ${nextHourFormatted}`;
        }
      }

      for (let day = 1; day <= 5; day++) {
        updated[day].push({
          id: `cell-${day}-${currentLength}-${Math.random().toString(36).substr(2, 5)}`,
          subject: "",
          time: suggestedTime,
          room: "",
          teacher: "",
          email: ""
        });
      }
      return updated;
    });
  };

  // Remover uma linha (tempo de aula)
  const handleRemoveRow = (slotIdx) => {
    setGeneratedSchedule((prev) => {
      if (!prev) return null;
      const updated = { ...prev };
      for (let day = 1; day <= 5; day++) {
        updated[day] = updated[day].filter((_, idx) => idx !== slotIdx);
      }
      return updated;
    });
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
      setStep(2);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
      setStep(2);
    }
  };

  // Confirmar a injeção na aplicação
  const handleConfirmImport = () => {
    if (!generatedSchedule) return;

    const filtered = {};
    let hasValidClasses = false;

    Object.entries(generatedSchedule).forEach(([dayIndex, dayClasses]) => {
      // Filtra apenas células que têm disciplinas atribuídas
      const validClasses = dayClasses
        .filter(c => c.subject.trim() !== "")
        .map(c => {
          // Limpeza de parênteses por segurança
          const cleanSubject = c.subject
            .replace(/\(.*?\)/g, "")
            .replace(/\[.*?\]/g, "")
            .trim();
          return {
            ...c,
            subject: cleanSubject
          };
        });

      filtered[dayIndex] = validClasses;
      if (validClasses.length > 0) hasValidClasses = true;
    });

    if (!hasValidClasses) {
      alert("Por favor, pinte pelo menos uma disciplina na grelha antes de confirmar.");
      return;
    }

    onImportSuccess(activeChild.id, filtered);
    onClose();
  };

  // Disciplinas padrão em Portugal
  const DEFAULT_SUBJECTS = [
    "Matemática", "Português", "Inglês", "Ciências Naturais", "Física e Química", 
    "História", "Geografia", "Educação Física", "TIC", "Francês", 
    "Educação Visual", "Cidadania", "Filosofia", "Direção de Turma"
  ];

  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }}>
      <div className="glass-panel modal-content" style={{ maxWidth: step === 3 ? "950px" : "600px", padding: "1.5rem", transition: "max-width 0.3s ease" }}>
        <button className="modal-close" onClick={onClose}>×</button>

        {step === 1 && (
          /* ================= PASSO 1: UPLOAD ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="modal-header" style={{ textAlign: "center" }}>
              <h3 className="gradient-text" style={{ fontSize: "1.4rem" }}>📤 Importar Horário de {activeChild.name}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                Carregue um print ou foto do horário. O nosso assistente inteligente ajudá-lo-á a recriar a grelha em segundos com 100% de exatidão e zero digitação!
              </p>
            </div>

            <form 
              onDragEnter={handleDrag} 
              onDragOver={handleDrag} 
              onDragLeave={handleDrag} 
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload").click()}
              style={{
                border: "2px dashed rgba(255, 255, 255, 0.15)",
                borderColor: dragActive ? "var(--color-primary)" : "rgba(255, 255, 255, 0.12)",
                borderRadius: "var(--radius-lg)",
                padding: "3rem 1.5rem",
                textAlign: "center",
                background: dragActive ? "rgba(var(--color-primary-rgb), 0.05)" : "rgba(255, 255, 255, 0.005)",
                cursor: "pointer",
                transition: "var(--transition-smooth)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem"
              }}
            >
              <input 
                id="file-upload" 
                type="file" 
                multiple={false} 
                accept="image/*,.pdf" 
                onChange={handleFileChange} 
                style={{ display: "none" }} 
              />
              
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                📁
              </div>
              
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                  {dragActive ? "Solte o print aqui..." : "Arraste o print do telemóvel ou clique para carregar"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  Suporta imagens PNG, JPG, JPEG ou documentos PDF
                </p>
              </div>
            </form>

            <div style={{ padding: "0.8rem 1rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-md)", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: "1.4", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span>💡</span>
              <span><strong>Dica:</strong> Pode carregar um print da caderneta de aluno ou da plataforma escolar (ex: Inovar Consulta).</span>
            </div>
          </div>
        )}

        {step === 2 && (
          /* ================= PASSO 2: DIGITALIZAÇÃO IA (OCR) ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "2rem 0", textAlign: "center" }}>
            <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "16px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: "3rem" }}>📄</span>
              <div style={{ position: "absolute", left: 0, width: "100%", height: "3px", background: "#10b981", boxShadow: "0 0 10px #10b981, 0 0 20px #10b981", animation: "scanLaser 2s linear infinite" }}></div>
            </div>

            <style>{`
              @keyframes scanLaser {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}</style>

            <div style={{ width: "100%" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.25rem" }}>A Ler Print com Inteligência Artificial (OCR)</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", wordBreak: "break-all" }}>Ficheiro: {file?.name || "imagem_horario.png"}</p>
            </div>

            <div style={{ width: "100%", background: "rgba(255, 255, 255, 0.04)", height: "8px", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <div style={{ height: "100%", width: `${scanProgress}%`, background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))", borderRadius: "4px", transition: "width 0.15s ease-out" }}></div>
            </div>

            <div style={{ fontSize: "0.82rem", color: "var(--color-text-primary)", fontWeight: "500", minHeight: "1.2rem" }}>
              {scanStatus} <strong style={{ color: "var(--color-secondary)" }}>{scanProgress}%</strong>
            </div>
          </div>
        )}

        {step === 3 && (
          /* ================= PASSO 3: ASSISTENTE PINTAR GRELHA (100% EXATO) ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            
            {/* Cabeçalho do Assistente */}
            <div className="modal-header" style={{ textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
              <h3 className="gradient-text" style={{ fontSize: "1.25rem", margin: 0 }}>🎨 Pintar Horário de {activeChild.name}</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginTop: "0.15rem" }}>
                1. Escolha uma disciplina na paleta. 2. Clique nos blocos da tabela para a preencher. 100% Exato e sem erros!
              </p>
            </div>

            {/* Ajustes Rápidos da Grelha */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", background: "rgba(255, 255, 255, 0.01)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(255, 255, 255, 0.04)", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-secondary)" }}>Escolaridade:</span>
                <select 
                  value={cycle} 
                  onChange={(e) => handleGridReset(e.target.value, startHour)}
                  className="form-select"
                  style={{ width: "auto", padding: "0.2rem 1.6rem 0.2rem 0.4rem", fontSize: "0.72rem", borderRadius: "4px" }}
                >
                  <option value="basico">Básico (5º ao 9º Ano — Tempos de 50m)</option>
                  <option value="secundario">Secundário (10º ao 12º Ano — Tempos de 90m)</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--color-text-secondary)" }}>Hora de Início:</span>
                <select 
                  value={startHour} 
                  onChange={(e) => handleGridReset(cycle, e.target.value)}
                  className="form-select"
                  style={{ width: "auto", padding: "0.2rem 1.6rem 0.2rem 0.4rem", fontSize: "0.72rem", borderRadius: "4px" }}
                >
                  <option value="08:00">08:00</option>
                  <option value="08:15">08:15</option>
                  <option value="08:30">08:30</option>
                  <option value="09:00">09:00</option>
                </select>
              </div>
            </div>

            {/* LADO A LADO: Print Original (Esquerda) + Grelha de Toque (Direita) */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              
              {/* Esquerda: Print Consultor (Imagem) */}
              <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--color-text-secondary)" }}>📄 Print Original (Clique p/ Zoom):</span>
                <div style={{
                  background: "rgba(0, 0, 0, 0.25)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.4rem",
                  height: "270px"
                }}>
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Print do Horário" 
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "100%", 
                        objectFit: "contain",
                        borderRadius: "4px",
                        cursor: "zoom-in",
                        transition: "all 0.2s ease"
                      }} 
                      onClick={(e) => {
                        const img = e.target;
                        if (img.style.transform === "scale(1.8)") {
                          img.style.transform = "scale(1)";
                          img.style.position = "static";
                          img.style.zIndex = "auto";
                          img.style.boxShadow = "none";
                        } else {
                          img.style.transform = "scale(1.8)";
                          img.style.position = "relative";
                          img.style.zIndex = "1000";
                          img.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
                        }
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Sem imagem</span>
                  )}
                </div>
              </div>

              {/* Direita: Grelha Interativa de Toque */}
              <div style={{ flex: "2 1 450px", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--color-text-secondary)" }}>✏️ Clique nos blocos para pintar:</span>
                  <button 
                    type="button"
                    onClick={handleAddRow}
                    style={{ background: "transparent", border: "none", color: "var(--color-primary)", fontSize: "0.7rem", fontWeight: "600", cursor: "pointer" }}
                  >
                    ＋ Adicionar Tempo (Linha)
                  </button>
                </div>

                <div style={{ maxHeight: "270px", overflow: "auto", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)", background: "rgba(0,0,0,0.15)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem", textAlign: "center" }}>
                    <thead>
                      <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <th style={{ padding: "6px 8px", width: "95px", fontWeight: "600", color: "var(--color-text-muted)" }}>Hora / Bloco</th>
                        <th style={{ padding: "6px 4px", fontWeight: "700", color: "var(--color-text-primary)" }}>Seg</th>
                        <th style={{ padding: "6px 4px", fontWeight: "700", color: "var(--color-text-primary)" }}>Ter</th>
                        <th style={{ padding: "6px 4px", fontWeight: "700", color: "var(--color-text-primary)" }}>Qua</th>
                        <th style={{ padding: "6px 4px", fontWeight: "700", color: "var(--color-text-primary)" }}>Qui</th>
                        <th style={{ padding: "6px 4px", fontWeight: "700", color: "var(--color-text-primary)" }}>Sex</th>
                        <th style={{ width: "30px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedSchedule && generatedSchedule[1].map((_, slotIdx) => {
                        const rowTime = generatedSchedule[1][slotIdx]?.time || "08:30 - 09:20";
                        return (
                          <tr key={slotIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.1s" }} className="grid-row-hover">
                            {/* Hora Editável da Linha */}
                            <td style={{ padding: "4px" }}>
                              <input 
                                type="text"
                                value={rowTime}
                                onChange={(e) => handleRowTimeChange(slotIdx, e.target.value)}
                                style={{
                                  width: "90px",
                                  fontSize: "0.68rem",
                                  background: "rgba(0,0,0,0.2)",
                                  border: "none",
                                  color: "var(--color-text-secondary)",
                                  borderRadius: "4px",
                                  padding: "2px",
                                  textAlign: "center",
                                  outline: "none"
                                }}
                              />
                            </td>

                            {/* Células de Dias de Aulas Pintáveis */}
                            {[1, 2, 3, 4, 5].map((dayIndex) => {
                              const cell = generatedSchedule[dayIndex][slotIdx] || { subject: "" };
                              const isEmpty = !cell.subject.trim();
                              return (
                                <td key={dayIndex} style={{ padding: "2px" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleCellClick(dayIndex, slotIdx)}
                                    style={{
                                      width: "100%",
                                      minHeight: "26px",
                                      border: isEmpty ? "1px dashed rgba(255, 255, 255, 0.08)" : "1px solid rgba(var(--color-primary-rgb), 0.15)",
                                      background: isEmpty 
                                        ? "transparent" 
                                        : "rgba(var(--color-primary-rgb), 0.08)",
                                      color: isEmpty ? "rgba(255,255,255,0.25)" : "var(--color-text-primary)",
                                      fontWeight: isEmpty ? "normal" : "700",
                                      borderRadius: "4px",
                                      fontSize: "0.68rem",
                                      cursor: "pointer",
                                      padding: "2px 4px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      transition: "all 0.1s ease",
                                      wordBreak: "break-word"
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.borderColor = activeBrush === "eraser" ? "#ef4444" : "var(--color-primary)";
                                      e.target.style.background = activeBrush === "eraser" ? "rgba(239, 68, 68, 0.08)" : "rgba(var(--color-primary-rgb), 0.12)";
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.borderColor = isEmpty ? "rgba(255,255,255,0.08)" : "rgba(var(--color-primary-rgb), 0.15)";
                                      e.target.style.background = isEmpty ? "transparent" : "rgba(var(--color-primary-rgb), 0.08)";
                                    }}
                                    title="Clique para pintar esta disciplina"
                                  >
                                    {isEmpty ? "—" : cell.subject}
                                  </button>
                                </td>
                              );
                            })}

                            {/* Eliminar Linha */}
                            <td style={{ padding: "2px" }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(slotIdx)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                  opacity: 0.45
                                }}
                                onMouseOver={(e) => e.target.style.opacity = 1}
                                onMouseOut={(e) => e.target.style.opacity = 0.45}
                                title="Remover este tempo"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* SEÇÃO DA PALETA: Onde selecionam a cor/disciplina ativa para pintura */}
            <div style={{ 
              background: "rgba(255, 255, 255, 0.015)", 
              padding: "0.6rem 0.8rem", 
              borderRadius: "var(--radius-md)", 
              border: "1px solid rgba(255, 255, 255, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}>
              
              {/* Disciplina Selecionada no Pincel */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Pincel Selecionado:</span>
                  <span 
                    style={{ 
                      fontSize: "0.75rem", 
                      fontWeight: "700", 
                      background: activeBrush === "eraser" ? "rgba(239, 68, 68, 0.15)" : "rgba(6, 182, 212, 0.15)",
                      border: activeBrush === "eraser" ? "1px solid #ef4444" : "1px solid #06b6d4",
                      color: activeBrush === "eraser" ? "#f87171" : "#22d3ee",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: activeBrush === "eraser" ? "none" : "0 0 10px rgba(6, 182, 212, 0.2)"
                    }}
                  >
                    {activeBrush === "eraser" ? "🧽 Borracha (Limpar Célula)" : `✏️ ${activeBrush}`}
                  </span>
                </div>

                {/* Caixa de Texto para Criar Pincel Personalizado */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input 
                    type="text"
                    value={customBrushText}
                    onChange={(e) => setCustomBrushText(e.target.value)}
                    placeholder="Outra disciplina..."
                    style={{
                      padding: "3px 6px",
                      fontSize: "0.68rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "4px",
                      color: "var(--color-text-primary)",
                      width: "120px",
                      outline: "none"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customBrushText.trim()) {
                        setActiveBrush(customBrushText.trim());
                        setCustomBrushText("");
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (customBrushText.trim()) {
                        setActiveBrush(customBrushText.trim());
                        setCustomBrushText("");
                      }
                    }}
                    style={{
                      background: "var(--color-primary)",
                      border: "none",
                      color: "white",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      fontSize: "0.68rem",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Usar
                  </button>
                </div>
              </div>

              {/* Badges do Print Lidos por OCR */}
              {detectedWords.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "#10b981" }}>Texto detetado no print (Clique para usar como pincel):</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", maxHeight: "60px", overflowY: "auto" }}>
                    {detectedWords.map((word, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveBrush(word)}
                        style={{
                          background: activeBrush === word ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
                          border: activeBrush === word ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "20px",
                          padding: "1px 7px",
                          fontSize: "0.65rem",
                          color: "var(--color-text-primary)",
                          cursor: "pointer",
                          transition: "all 0.1s"
                        }}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Disciplinas Padrão Escolares */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--color-text-muted)" }}>Disciplinas padrão & Utilitários:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() => setActiveBrush("eraser")}
                    style={{
                      background: activeBrush === "eraser" ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.02)",
                      border: activeBrush === "eraser" ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "20px",
                      padding: "1px 7px",
                      fontSize: "0.65rem",
                      color: "#f87171",
                      cursor: "pointer",
                      fontWeight: "700",
                      transition: "all 0.1s"
                    }}
                  >
                    🧽 Limpar Célula (Borracha)
                  </button>

                  {DEFAULT_SUBJECTS.map((sub, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveBrush(sub)}
                      style={{
                        background: activeBrush === sub ? "rgba(6, 182, 212, 0.12)" : "rgba(255, 255, 255, 0.02)",
                        border: activeBrush === sub ? "1px solid #06b6d4" : "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "20px",
                        padding: "1px 7px",
                        fontSize: "0.65rem",
                        color: "var(--color-text-primary)",
                        cursor: "pointer",
                        transition: "all 0.1s"
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Ações Inferiores */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.1rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.6rem" }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setStep(1); setFile(null); setGeneratedSchedule(null); setDetectedWords([]); }}
                style={{ flex: 1, padding: "0.5rem" }}
              >
                Voltar a Carregar Print
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleConfirmImport}
                style={{ flex: 2, padding: "0.5rem", fontWeight: "700" }}
              >
                Confirmar e Aplicar na Agenda
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
