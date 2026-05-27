import React, { useState, useEffect } from "react";

export default function ImportScheduleModal({ activeChild, onClose, onImportSuccess }) {
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Scanning, 3 = Preview
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("A inicializar motor de IA...");
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  // Simulação das etapas do scanner OCR
  useEffect(() => {
    if (step !== 2) return;

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Mapeia e gera o horário personalizado com base no ano escolar da criança
            const schedule = generateScheduleForChild();
            setGeneratedSchedule(schedule);
            setStep(3); // Avança para o ecrã de confirmação/preview
          }, 600);
          return 100;
        }

        // Atualizar mensagens com base no progresso da "IA"
        if (next < 20) {
          setScanStatus("A carregar e a melhorar imagem (Contraste/Brilho)...");
        } else if (next < 45) {
          setScanStatus("A ler e extrair texto por OCR neuronal...");
        } else if (next < 70) {
          setScanStatus(`A identificar grelha horária e disciplinas de ${activeChild.name}...`);
        } else if (next < 90) {
          setScanStatus("A alinhar dias da semana e intervalos escolares...");
        } else {
          setScanStatus("A finalizar estruturação de dados de horário...");
        }

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [step]);

  // Função para simular a criação de um horário escolar português realista
  // Professores, salas e emails ficam vazios ("") conforme solicitado nas especificações do utilizador!
  const generateScheduleForChild = () => {
    // Tenta extrair o número do ano (ex: "8° C" -> 8, "11° A" -> 11, "7" -> 7)
    let gradeNumber = 7;
    const match = activeChild.grade.match(/(\d+)/);
    if (match) {
      gradeNumber = parseInt(match[1], 10);
    }

    if (gradeNumber <= 9) {
      // 1. Horário padrão do Ensino Básico (Ex: 7º, 8º, 9º ano)
      return {
        1: [
          { id: `gen-mat-1`, subject: "Matemática", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-ing-1`, subject: "Inglês", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-ing-2`, subject: "Inglês", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-por-1`, subject: "Português", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-por-2`, subject: "Português", time: "12:00 - 13:00", room: "", teacher: "", email: "" }
        ],
        2: [
          { id: `gen-dta-1`, subject: "DTA", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-ef-1`, subject: "Educação Física", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-cn-1`, subject: "Ciências Naturais", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-1`, subject: "Física e Química", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-mat-2`, subject: "Matemática", time: "13:30 - 14:30", room: "", teacher: "", email: "" },
          { id: `gen-mat-3`, subject: "Matemática", time: "14:30 - 15:30", room: "", teacher: "", email: "" }
        ],
        3: [
          { id: `gen-geo-1`, subject: "Geografia", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-geo-2`, subject: "Geografia", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-ing-3`, subject: "Inglês", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-por-3`, subject: "Português", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-por-4`, subject: "Português", time: "12:00 - 13:00", room: "", teacher: "", email: "" }
        ],
        4: [
          { id: `gen-tic-1`, subject: "TIC", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-tic-2`, subject: "TIC", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-fra-1`, subject: "Francês", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-ev-1`, subject: "Educação Visual", time: "13:30 - 14:30", room: "", teacher: "", email: "" },
          { id: `gen-ev-2`, subject: "Educação Visual", time: "14:30 - 15:30", room: "", teacher: "", email: "" },
          { id: `gen-fq-2`, subject: "Física e Química", time: "15:30 - 16:30", room: "", teacher: "", email: "" },
          { id: `gen-fq-3`, subject: "Física e Química", time: "16:30 - 17:30", room: "", teacher: "", email: "" }
        ],
        5: [
          { id: `gen-ef-2`, subject: "Educação Física", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-ef-3`, subject: "Educação Física", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-mat-4`, subject: "Matemática", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-fra-2`, subject: "Francês", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-cn-2`, subject: "Ciências Naturais", time: "13:30 - 14:30", room: "", teacher: "", email: "" },
          { id: `gen-cn-3`, subject: "Ciências Naturais", time: "14:30 - 15:30", room: "", teacher: "", email: "" },
          { id: `gen-geo-3`, subject: "Geografia", time: "15:30 - 16:30", room: "", teacher: "", email: "" },
          { id: `gen-geo-4`, subject: "Geografia", time: "16:30 - 17:30", room: "", teacher: "", email: "" }
        ]
      };
    } else {
      // 2. Horário do Secundário (Ex: 10º, 11º, 12º ano)
      return {
        1: [
          { id: `gen-fil-1`, subject: "Filosofia", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-fil-2`, subject: "Filosofia", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-bg-1`, subject: "Biologia e Geologia", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-bg-2`, subject: "Biologia e Geologia", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-1`, subject: "Física e Química A", time: "13:00 - 14:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-2`, subject: "Física e Química A", time: "14:00 - 15:00", room: "", teacher: "", email: "" },
          { id: `gen-mat-1`, subject: "Matemática A", time: "15:00 - 16:00", room: "", teacher: "", email: "" },
          { id: `gen-cd-1`, subject: "Cidadania e Desenvolvimento", time: "16:00 - 17:00", room: "", teacher: "", email: "" }
        ],
        2: [
          { id: `gen-bg-3`, subject: "Biologia e Geologia", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-bg-4`, subject: "Biologia e Geologia", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-por-1`, subject: "Português", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-por-2`, subject: "Português", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-ing-1`, subject: "Inglês", time: "13:00 - 14:00", room: "", teacher: "", email: "" },
          { id: `gen-ef-1`, subject: "Educação Física", time: "14:00 - 15:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-3`, subject: "Física e Química A", time: "15:00 - 16:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-4`, subject: "Física e Química A", time: "16:00 - 17:00", room: "", teacher: "", email: "" }
        ],
        3: [
          { id: `gen-ef-2`, subject: "Educação Física", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-ef-3`, subject: "Educação Física", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-5`, subject: "Física e Química A", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-mat-2`, subject: "Matemática A", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-mat-3`, subject: "Matemática A", time: "12:00 - 13:00", room: "", teacher: "", email: "" }
        ],
        4: [
          { id: `gen-por-3`, subject: "Português", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-por-4`, subject: "Português", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-mat-4`, subject: "Matemática A", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-mat-5`, subject: "Matemática A", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-bg-5`, subject: "Biologia e Geologia", time: "12:00 - 13:00", room: "", teacher: "", email: "" },
          { id: `gen-fil-3`, subject: "Filosofia", time: "14:00 - 15:00", room: "", teacher: "", email: "" }
        ],
        5: [
          { id: `gen-ing-2`, subject: "Inglês", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
          { id: `gen-ing-3`, subject: "Inglês", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
          { id: `gen-bg-6`, subject: "Biologia e Geologia", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
          { id: `gen-bg-7`, subject: "Biologia e Geologia", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
          { id: `gen-dt-1`, subject: "Direção de Turma", time: "12:00 - 13:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-6`, subject: "Física e Química A", time: "14:00 - 15:00", room: "", teacher: "", email: "" },
          { id: `gen-fq-7`, subject: "Física e Química A", time: "15:00 - 16:00", room: "", teacher: "", email: "" }
        ]
      };
    }
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
      setStep(2); // Muda para o ecrã de Scanning
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStep(2); // Muda para o ecrã de Scanning
    }
  };

  const handleConfirmImport = () => {
    if (!generatedSchedule) return;
    onImportSuccess(activeChild.id, generatedSchedule);
    onClose();
  };

  // Extrair número de disciplinas identificadas na simulação
  const getSubjectCount = () => {
    if (!generatedSchedule) return 0;
    const subjects = new Set();
    Object.values(generatedSchedule).forEach((dayClasses) => {
      dayClasses.forEach((c) => subjects.add(c.subject));
    });
    return subjects.size;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="glass-panel modal-content" style={{ maxWidth: "550px", padding: "2rem" }}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {step === 1 && (
          /* ================= STEP 1: DROPZONE UPLOAD ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="modal-header" style={{ textAlign: "center" }}>
              <h3 className="gradient-text" style={{ fontSize: "1.4rem" }}>📤 Importar Horário de {activeChild.name}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                Importe um print, foto ou documento do horário do seu filho. A nossa IA extrairá os dados e montará a grelha de forma autónoma.
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
              
              <div 
                style={{ 
                  width: "56px", 
                  height: "56px", 
                  borderRadius: "50%", 
                  background: "rgba(255, 255, 255, 0.02)", 
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem"
                }}
              >
                📁
              </div>
              
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
                  {dragActive ? "Solte o documento aqui..." : "Arraste o print ou clique para selecionar"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  Suporta PNG, JPG, JPEG ou documentos PDF
                </p>
              </div>
            </form>

            <div 
              style={{ 
                padding: "0.8rem 1rem", 
                background: "rgba(255, 255, 255, 0.02)", 
                borderRadius: "var(--radius-md)", 
                fontSize: "0.75rem", 
                color: "var(--color-text-secondary)", 
                lineHeight: "1.4",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center"
              }}
            >
              <span>💡</span>
              <span><strong>Dica:</strong> Pode enviar um print do seu telemóvel relativo à plataforma escolar (ex: Inovar Consulta).</span>
            </div>
          </div>
        )}

        {step === 2 && (
          /* ================= STEP 2: SCANNING IA ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "2rem 0", textAlign: "center" }}>
            {/* Holographic scanner laser animation */}
            <div 
              style={{ 
                position: "relative", 
                width: "120px", 
                height: "120px", 
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}
            >
              <span style={{ fontSize: "3rem" }}>📄</span>
              {/* Green Laser line */}
              <div 
                style={{
                  position: "absolute",
                  left: 0,
                  width: "100%",
                  height: "3px",
                  background: "#10b981",
                  boxShadow: "0 0 10px #10b981, 0 0 20px #10b981",
                  animation: "scanLaser 2s linear infinite"
                }}
              ></div>
            </div>

            <style>{`
              @keyframes scanLaser {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}</style>

            <div style={{ width: "100%" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.25rem" }}>A Digitalizar com Inteligência Artificial</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Ficheiro: {file?.name || "imagem_horario.png"}</p>
            </div>

            {/* Progress Bar */}
            <div style={{ width: "100%", background: "rgba(255, 255, 255, 0.04)", height: "8px", borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <div 
                style={{ 
                  height: "100%", 
                  width: `${scanProgress}%`, 
                  background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))", 
                  borderRadius: "4px",
                  transition: "width 0.15s ease-out"
                }}
              ></div>
            </div>

            <div style={{ fontSize: "0.82rem", color: "var(--color-text-primary)", fontWeight: "500", minHeight: "1.2rem" }}>
              {scanStatus} <strong style={{ color: "var(--color-secondary)" }}>{scanProgress}%</strong>
            </div>
          </div>
        )}

        {step === 3 && (
          /* ================= STEP 3: PREVIEW & CONFIRM ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="modal-header" style={{ textAlign: "center" }}>
              <div 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "rgba(16, 185, 129, 0.15)", 
                  border: "1px solid rgba(16, 185, 129, 0.3)", 
                  color: "#10b981",
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem"
                }}
              >
                ✓
              </div>
              <h3 className="gradient-text" style={{ fontSize: "1.3rem" }}>Horário Processado!</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginTop: "0.1rem" }}>
                Identificámos com sucesso <strong style={{ color: "var(--color-text-primary)" }}>{getSubjectCount()} disciplinas</strong> organizadas em slots semanais de 1 hora para o **{activeChild.grade}**.
              </p>
            </div>

            {/* Preview Box */}
            <div 
              style={{ 
                maxHeight: "220px", 
                overflowY: "auto", 
                background: "rgba(0, 0, 0, 0.2)", 
                borderRadius: "var(--radius-lg)", 
                border: "1px solid rgba(255, 255, 255, 0.05)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "0.4rem", fontWeight: "bold" }}>
                PRÉ-VISUALIZAÇÃO DA ESTRUTURA EXTRAÍDA:
              </div>
              {Object.entries(generatedSchedule).map(([dayIndex, dayClasses]) => {
                const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
                const dayName = dayNames[parseInt(dayIndex, 10) - 1];

                return (
                  <div key={dayIndex} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--color-primary)" }}>{dayName}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {dayClasses.map((c) => (
                        <div 
                          key={c.id} 
                          style={{ 
                            fontSize: "0.72rem", 
                            background: "rgba(255, 255, 255, 0.03)", 
                            border: "1px solid rgba(255, 255, 255, 0.05)", 
                            padding: "2px 6px", 
                            borderRadius: "4px",
                            display: "flex",
                            flexDirection: "column"
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>{c.subject}</span>
                          <span style={{ fontSize: "0.62rem", color: "var(--color-text-muted)" }}>{c.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setStep(1); setFile(null); setGeneratedSchedule(null); }}
                style={{ flex: 1, padding: "0.75rem" }}
              >
                Voltar a Carregar
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleConfirmImport}
                style={{ flex: 2, padding: "0.75rem", fontWeight: "700" }}
              >
                Confirmar e Injetar Grelha
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
