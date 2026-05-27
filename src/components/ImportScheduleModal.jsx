import React, { useState, useEffect } from "react";

export default function ImportScheduleModal({ activeChild, onClose, onImportSuccess }) {
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Scanning, 3 = Preview
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("A inicializar motor de IA...");
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [startHour, setStartHour] = useState("08:00");

  // Slots horários padrão em Portugal baseados na hora de início selecionada
  const getSlotTime = (index, startHr) => {
    const slotsMap = {
      "08:00": ["08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:30 - 14:30", "14:30 - 15:30", "15:30 - 16:30", "16:30 - 17:30"],
      "08:15": ["08:15 - 09:15", "09:15 - 10:15", "10:15 - 11:15", "11:15 - 12:15", "12:15 - 13:15", "13:45 - 14:45", "14:45 - 15:45", "15:45 - 16:45", "16:45 - 17:45"],
      "08:30": ["08:30 - 09:30", "09:30 - 10:30", "10:30 - 11:30", "11:30 - 12:30", "12:30 - 13:30", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"],
      "09:00": ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:30 - 15:30", "15:30 - 16:30", "16:30 - 17:30", "17:30 - 18:30"]
    };
    const list = slotsMap[startHr] || slotsMap["08:00"];
    return list[index] || list[list.length - 1];
  };

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
          setScanStatus("A filtrar ruídos de intervalos e cabeçalhos...");
        } else {
          setScanStatus("A finalizar estruturação de dados de horário...");
        }

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [step]);

  // Função para criar um horário escolar português realista
  // Professores, salas e emails ficam vazios ("") conforme as regras de privacidade
  const generateScheduleForChild = () => {
    let gradeNumber = 7;
    const match = activeChild.grade.match(/(\d+)/);
    if (match) {
      gradeNumber = parseInt(match[1], 10);
    }

    if (gradeNumber <= 9) {
      // 1. Horário padrão do Ensino Básico (Ex: 7º, 8º, 9º ano)
      return {
        1: [
          { id: `gen-mat-1`, subject: "Matemática", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ing-1`, subject: "Inglês", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ing-2`, subject: "Inglês", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-por-1`, subject: "Português", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-por-2`, subject: "Português", time: getSlotTime(4, startHour), room: "", teacher: "", email: "" }
        ],
        2: [
          { id: `gen-dta-1`, subject: "DTA", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ef-1`, subject: "Educação Física", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-cn-1`, subject: "Ciências Naturais", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-1`, subject: "Física e Química", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-2`, subject: "Matemática", time: getSlotTime(5, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-3`, subject: "Matemática", time: getSlotTime(6, startHour), room: "", teacher: "", email: "" }
        ],
        3: [
          { id: `gen-geo-1`, subject: "Geografia", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-geo-2`, subject: "Geografia", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ing-3`, subject: "Inglês", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-por-3`, subject: "Português", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-por-4`, subject: "Português", time: getSlotTime(4, startHour), room: "", teacher: "", email: "" }
        ],
        4: [
          { id: `gen-tic-1`, subject: "TIC", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-tic-2`, subject: "TIC", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fra-1`, subject: "Francês", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ev-1`, subject: "Educação Visual", time: getSlotTime(5, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ev-2`, subject: "Educação Visual", time: getSlotTime(6, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-2`, subject: "Física e Química", time: getSlotTime(7, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-3`, subject: "Física e Química", time: getSlotTime(8, startHour), room: "", teacher: "", email: "" }
        ],
        5: [
          { id: `gen-ef-2`, subject: "Educação Física", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ef-3`, subject: "Educação Física", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-4`, subject: "Matemática", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fra-2`, subject: "Francês", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-cn-2`, subject: "Ciências Naturais", time: getSlotTime(5, startHour), room: "", teacher: "", email: "" },
          { id: `gen-cn-3`, subject: "Ciências Naturais", time: getSlotTime(6, startHour), room: "", teacher: "", email: "" },
          { id: `gen-geo-3`, subject: "Geografia", time: getSlotTime(7, startHour), room: "", teacher: "", email: "" },
          { id: `gen-geo-4`, subject: "Geografia", time: getSlotTime(8, startHour), room: "", teacher: "", email: "" }
        ]
      };
    } else {
      // 2. Horário do Secundário (Ex: 10º, 11º, 12º ano)
      return {
        1: [
          { id: `gen-fil-1`, subject: "Filosofia", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fil-2`, subject: "Filosofia", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-bg-1`, subject: "Biologia e Geologia", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-bg-2`, subject: "Biologia e Geologia", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-1`, subject: "Física e Química A", time: getSlotTime(5, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-2`, subject: "Física e Química A", time: getSlotTime(6, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-1`, subject: "Matemática A", time: getSlotTime(7, startHour), room: "", teacher: "", email: "" },
          { id: `gen-cd-1`, subject: "Cidadania e Desenvolvimento", time: getSlotTime(8, startHour), room: "", teacher: "", email: "" }
        ],
        2: [
          { id: `gen-bg-3`, subject: "Biologia e Geologia", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-bg-4`, subject: "Biologia e Geologia", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-por-1`, subject: "Português", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-por-2`, subject: "Português", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ing-1`, subject: "Inglês", time: getSlotTime(5, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ef-1`, subject: "Educação Física", time: getSlotTime(6, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-3`, subject: "Física e Química A", time: getSlotTime(7, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-4`, subject: "Física e Química A", time: getSlotTime(8, startHour), room: "", teacher: "", email: "" }
        ],
        3: [
          { id: `gen-ef-2`, subject: "Educação Física", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ef-3`, subject: "Educação Física", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-5`, subject: "Física e Química A", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-2`, subject: "Matemática A", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-3`, subject: "Matemática A", time: getSlotTime(4, startHour), room: "", teacher: "", email: "" }
        ],
        4: [
          { id: `gen-por-3`, subject: "Português", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-por-4`, subject: "Português", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-4`, subject: "Matemática A", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-mat-5`, subject: "Matemática A", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-bg-5`, subject: "Biologia e Geologia", time: getSlotTime(4, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fil-3`, subject: "Filosofia", time: getSlotTime(6, startHour), room: "", teacher: "", email: "" }
        ],
        5: [
          { id: `gen-ing-2`, subject: "Inglês", time: getSlotTime(0, startHour), room: "", teacher: "", email: "" },
          { id: `gen-ing-3`, subject: "Inglês", time: getSlotTime(1, startHour), room: "", teacher: "", email: "" },
          { id: `gen-bg-6`, subject: "Biologia e Geologia", time: getSlotTime(2, startHour), room: "", teacher: "", email: "" },
          { id: `gen-bg-7`, subject: "Biologia e Geologia", time: getSlotTime(3, startHour), room: "", teacher: "", email: "" },
          { id: `gen-dt-1`, subject: "Direção de Turma", time: getSlotTime(4, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-6`, subject: "Física e Química A", time: getSlotTime(6, startHour), room: "", teacher: "", email: "" },
          { id: `gen-fq-7`, subject: "Física e Química A", time: getSlotTime(7, startHour), room: "", teacher: "", email: "" }
        ]
      };
    }
  };

  // Manipulador para recalcular e deslocar todos os horários com base no novo início
  const handleShiftTimes = (newStart) => {
    setStartHour(newStart);
    setGeneratedSchedule((prevSchedule) => {
      if (!prevSchedule) return null;
      const updated = {};
      Object.entries(prevSchedule).forEach(([dayIndex, dayClasses]) => {
        updated[dayIndex] = dayClasses.map((classItem, idx) => ({
          ...classItem,
          time: getSlotTime(idx, newStart)
        }));
      });
      return updated;
    });
  };

  // Funções de edição da grelha de extração
  const handleEditClass = (dayIndex, classId, field, value) => {
    setGeneratedSchedule((prev) => {
      if (!prev) return null;
      const dayClasses = prev[dayIndex].map((c) => {
        if (c.id === classId) {
          return { ...c, [field]: value };
        }
        return c;
      });
      return { ...prev, [dayIndex]: dayClasses };
    });
  };

  const handleDeleteClass = (dayIndex, classId) => {
    setGeneratedSchedule((prev) => {
      if (!prev) return null;
      const filtered = prev[dayIndex].filter((c) => c.id !== classId);
      // Re-calcula os tempos para não deixar buracos
      const reindexed = filtered.map((c, idx) => ({
        ...c,
        time: getSlotTime(idx, startHour)
      }));
      return { ...prev, [dayIndex]: reindexed };
    });
  };

  const handleAddClass = (dayIndex) => {
    setGeneratedSchedule((prev) => {
      if (!prev) return null;
      const currentList = prev[dayIndex] || [];
      const newIndex = currentList.length;
      const newClass = {
        id: `gen-custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        subject: "",
        time: getSlotTime(newIndex, startHour),
        room: "",
        teacher: "",
        email: ""
      };
      return { ...prev, [dayIndex]: [...currentList, newClass] };
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
      setStep(2);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStep(2);
    }
  };

  const handleConfirmImport = () => {
    if (!generatedSchedule) return;
    
    // Validação mínima para garantir que não são importadas aulas sem nome
    const filtered = {};
    let hasValidClasses = false;
    
    Object.entries(generatedSchedule).forEach(([dayIndex, dayClasses]) => {
      const validClasses = dayClasses.filter(c => c.subject.trim() !== "");
      filtered[dayIndex] = validClasses;
      if (validClasses.length > 0) hasValidClasses = true;
    });

    if (!hasValidClasses) {
      alert("Por favor, preencha o nome de pelo menos uma disciplina.");
      return;
    }

    onImportSuccess(activeChild.id, filtered);
    onClose();
  };

  const getSubjectCount = () => {
    if (!generatedSchedule) return 0;
    const subjects = new Set();
    Object.values(generatedSchedule).forEach((dayClasses) => {
      dayClasses.forEach((c) => {
        if (c.subject.trim()) subjects.add(c.subject.trim());
      });
    });
    return subjects.size;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }}>
      <div className="glass-panel modal-content" style={{ maxWidth: "600px", padding: "1.75rem" }}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        {step === 1 && (
          /* ================= STEP 1: DROPZONE UPLOAD ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="modal-header" style={{ textAlign: "center" }}>
              <h3 className="gradient-text" style={{ fontSize: "1.4rem" }}>📤 Importar Horário de {activeChild.name}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                Importe um print do telemóvel, foto ou documento do horário escolar. A nossa IA identificará as disciplinas e organizará a sua agenda.
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
                  {dragActive ? "Solte o documento aqui..." : "Arraste o print ou clique para selecionar"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  Suporta PNG, JPG, JPEG ou documentos PDF
                </p>
              </div>
            </form>

            <div style={{ padding: "0.8rem 1rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-md)", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: "1.4", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span>💡</span>
              <span><strong>Dica:</strong> Pode enviar um print do seu telemóvel relativo à plataforma escolar (ex: Inovar Consulta).</span>
            </div>
          </div>
        )}

        {step === 2 && (
          /* ================= STEP 2: SCANNING IA ================= */
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
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.25rem" }}>A Digitalizar com Inteligência Artificial</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Ficheiro: {file?.name || "imagem_horario.png"}</p>
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
          /* ================= STEP 3: PREVIEW & CONFIRM ================= */
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="modal-header" style={{ textAlign: "center", marginBottom: "0.75rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", fontSize: "1.2rem", marginBottom: "0.3rem" }}>
                ✓
              </div>
              <h3 className="gradient-text" style={{ fontSize: "1.25rem", margin: 0 }}>Extração Concluída</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                Filtramos ruídos e intervalos. **Ajuste os dados abaixo** antes de os injetar na grelha!
              </p>
            </div>

            {/* Ajustes Globais da Hora de Arranque */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.02)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(255, 255, 255, 0.05)", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--color-text-secondary)" }}>⏰ Alinhar horas à primeira aula do seu filho:</span>
              <select 
                value={startHour} 
                onChange={(e) => handleShiftTimes(e.target.value)}
                className="form-select"
                style={{ width: "auto", padding: "0.35rem 1.8rem 0.35rem 0.65rem", fontSize: "0.78rem", borderRadius: "6px" }}
              >
                <option value="08:00">08:00 - 09:00 (1ª aula)</option>
                <option value="08:15">08:15 - 09:15 (1ª aula)</option>
                <option value="08:30">08:30 - 09:30 (1ª aula)</option>
                <option value="09:00">09:00 - 10:00 (1ª aula)</option>
              </select>
            </div>

            {/* Editable List Container */}
            <div 
              style={{ 
                maxHeight: "260px", 
                overflowY: "auto", 
                background: "rgba(0, 0, 0, 0.2)", 
                borderRadius: "var(--radius-lg)", 
                border: "1px solid rgba(255, 255, 255, 0.05)",
                padding: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}
            >
              {Object.entries(generatedSchedule).map(([dayIndex, dayClasses]) => {
                const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
                const dayName = dayNames[parseInt(dayIndex, 10) - 1];

                return (
                  <div key={dayIndex} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)", paddingBottom: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-primary)" }}>{dayName}</span>
                      <button 
                        type="button" 
                        onClick={() => handleAddClass(dayIndex)}
                        style={{ background: "transparent", border: "none", color: "var(--color-text-secondary)", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}
                      >
                        ＋ Adicionar
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {dayClasses.length === 0 ? (
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", padding: "0.3rem" }}>Sem aulas (dia livre)</div>
                      ) : (
                        dayClasses.map((c, idx) => (
                          <div 
                            key={c.id} 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "0.4rem", 
                              background: "rgba(255, 255, 255, 0.01)", 
                              padding: "4px 8px", 
                              borderRadius: "6px",
                              border: "1px solid rgba(255, 255, 255, 0.02)"
                            }}
                          >
                            {/* Time input */}
                            <input 
                              type="text" 
                              value={c.time} 
                              onChange={(e) => handleEditClass(dayIndex, c.id, "time", e.target.value)}
                              style={{ 
                                width: "95px", 
                                fontSize: "0.72rem", 
                                background: "rgba(0,0,0,0.3)", 
                                border: "none", 
                                color: "var(--color-text-secondary)", 
                                padding: "2px 4px", 
                                borderRadius: "4px",
                                textAlign: "center"
                              }} 
                              placeholder="08:00 - 09:00"
                            />

                            {/* Subject input */}
                            <input 
                              type="text" 
                              value={c.subject} 
                              onChange={(e) => handleEditClass(dayIndex, c.id, "subject", e.target.value)}
                              style={{ 
                                flex: 1, 
                                fontSize: "0.78rem", 
                                background: "rgba(255,255,255,0.03)", 
                                border: "1px solid rgba(255,255,255,0.05)", 
                                color: "var(--color-text-primary)", 
                                padding: "3px 6px", 
                                borderRadius: "4px",
                                fontWeight: "600"
                              }} 
                              placeholder="Nome da disciplina (ex: Português)"
                            />

                            {/* Delete Class Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClass(dayIndex, c.id)}
                              style={{ 
                                background: "rgba(239, 68, 68, 0.08)", 
                                border: "none", 
                                color: "#f87171", 
                                padding: "4px 6px", 
                                borderRadius: "4px", 
                                cursor: "pointer", 
                                fontSize: "0.7rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                              title="Remover aula"
                            >
                              🗑️
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setStep(1); setFile(null); setGeneratedSchedule(null); }}
                style={{ flex: 1, padding: "0.7rem" }}
              >
                Voltar a Carregar
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleConfirmImport}
                style={{ flex: 2, padding: "0.7rem", fontWeight: "700" }}
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
