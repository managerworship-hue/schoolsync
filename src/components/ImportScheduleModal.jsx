import React, { useState } from "react";

// ─── Horários pré-definidos para escolas portuguesas ─────────────────────────
const DEFAULT_SLOTS = [
  "08:30 - 09:20",
  "09:20 - 10:10",
  "10:30 - 11:20",
  "11:20 - 12:10",
  "13:30 - 14:20",
  "14:20 - 15:10",
  "15:10 - 16:00",
  "16:15 - 17:05",
  "17:05 - 17:55",
];

// ─── Disciplinas comuns (sugestões) ──────────────────────────────────────────
const COMMON_SUBJECTS = [
  "Matemática","Português","Inglês","Físico-Química","Ciências Naturais",
  "História","Geografia","Educação Física","Educação Visual","TIC","Filosofia",
  "Biologia e Geologia","Química","Física","Francês","Espanhol",
  "Educação Tecnológica","EMRC","Música","Teatro","EVT","Latim",
];

const DAYS = ["Seg","Ter","Qua","Qui","Sex"];
const DAY_FULL = ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira"];

// ─── Cria grelha vazia ────────────────────────────────────────────────────────
const emptyGrid = () =>
  DEFAULT_SLOTS.map((time) => ({
    time,
    cells: { 1: "", 2: "", 3: "", 4: "", 5: "" },
  }));

export default function ImportScheduleModal({ activeChild, onClose, onImportSuccess }) {
  const [activeTab, setActiveTab] = useState("manual"); // "manual" | "inovar"

  // ─── Estado: Manual Grid ────────────────────────────────────────────────────
  const [rows, setRows] = useState(emptyGrid);
  const [activeCell, setActiveCell] = useState(null); // {row, day}
  const [inputVal, setInputVal]     = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  // ─── Estado: Inovar Consulta ────────────────────────────────────────────────
  const [inovarUrl, setInovarUrl] = useState("");
  const [inovarUser, setInovarUser] = useState("");
  const [inovarPass, setInovarPass] = useState("");
  const [inovarLoading, setInovarLoading] = useState(false);
  const [inovarError, setInovarError] = useState("");
  const [inovarSuccess, setInovarSuccess] = useState(false);
  const [extractedSchedule, setExtractedSchedule] = useState(null);

  // ─── Lógica: Manual Grid ────────────────────────────────────────────────────
  const activateCell = (rowIdx, day) => {
    setActiveCell({ row: rowIdx, day });
    setInputVal(rows[rowIdx].cells[day]);
    setShowSuggest(true);
  };

  const commitCell = (val) => {
    if (!activeCell) return;
    const { row, day } = activeCell;
    setRows((prev) =>
      prev.map((r, i) =>
        i === row ? { ...r, cells: { ...r.cells, [day]: val.trim() } } : r
      )
    );
    setActiveCell(null);
    setInputVal("");
    setShowSuggest(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { commitCell(inputVal); }
    if (e.key === "Escape") { setActiveCell(null); setShowSuggest(false); }
    if (e.key === "Tab") {
      e.preventDefault();
      commitCell(inputVal);
      if (activeCell) {
        const nextRow = activeCell.row + 1;
        if (nextRow < rows.length) activateCell(nextRow, activeCell.day);
      }
    }
  };

  const suggestions = inputVal.length >= 1
    ? COMMON_SUBJECTS.filter((s) => s.toLowerCase().includes(inputVal.toLowerCase())).slice(0, 6)
    : COMMON_SUBJECTS.slice(0, 6);

  const addRow = () =>
    setRows((prev) => [...prev, { time: "", cells: { 1: "", 2: "", 3: "", 4: "", 5: "" } }]);

  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const clearDay = (day) =>
    setRows((prev) =>
      prev.map((r) => ({ ...r, cells: { ...r.cells, [day]: "" } }))
    );

  const totalFilled = rows.reduce(
    (s, r) => s + Object.values(r.cells).filter((v) => v.trim()).length, 0
  );

  const handleConfirmManual = () => {
    const schedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    rows.forEach((row) => {
      [1, 2, 3, 4, 5].forEach((day) => {
        const subject = row.cells[day]?.trim();
        if (subject) {
          schedule[day].push({
            id: `manual-${day}-${row.time}-${Math.random().toString(36).substr(2,5)}`,
            subject,
            time: row.time,
            room: "", teacher: "", email: "",
          });
        }
      });
    });
    const total = Object.values(schedule).reduce((s, a) => s + a.length, 0);
    if (total === 0) { alert("Preencha pelo menos uma célula antes de confirmar."); return; }
    onImportSuccess(activeChild.id, schedule);
    onClose();
  };

  // ─── Lógica: Inovar Consulta ────────────────────────────────────────────────
  const handleInovarImport = async (e) => {
    e.preventDefault();
    if (!inovarUrl || !inovarUser || !inovarPass) {
      setInovarError("Preencha todos os campos.");
      return;
    }

    setInovarLoading(true);
    setInovarError("");
    setInovarSuccess(false);

    try {
      const apiUrl = process.env.NODE_ENV === "production" ? "/api/inovar/extract-schedule" : "http://localhost:3000/api/inovar/extract-schedule";
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolUrl: inovarUrl,
          username: inovarUser,
          password: inovarPass
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro desconhecido ao conectar com a escola.");
      }

      setExtractedSchedule(data.schedule);
      setInovarSuccess(true);
      
    } catch (err) {
      setInovarError(err.message);
    } finally {
      setInovarLoading(false);
    }
  };

  const handleConfirmInovar = () => {
    if (!extractedSchedule) return;
    const total = Object.values(extractedSchedule).reduce((s, a) => s + a.length, 0);
    if (total === 0) {
      alert("Nenhuma aula foi extraída do Inovar Consulta.");
      return;
    }
    onImportSuccess(activeChild.id, extractedSchedule);
    onClose();
  };

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }} onClick={() => { if (activeCell) commitCell(inputVal); }}>
      <div
        className="glass-panel modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: activeTab === "manual" ? "720px" : "480px", padding: "1.2rem 1.3rem", width: "98vw", transition: "max-width 0.3s ease" }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Cabeçalho */}
        <div style={{ marginBottom: "0.9rem", textAlign: "center" }}>
          <h3 className="gradient-text" style={{ fontSize: "1.15rem", margin: 0 }}>
            📅 Horário de {activeChild.name}
          </h3>
        </div>

        {/* Tabs de Seleção */}
        <div style={{ display: "flex", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1rem" }}>
          {[
            { id: "manual", label: "✎ Preenchimento Rápido" },
            { id: "inovar", label: "📡 Inovar Consulta (Auto)" },
          ].map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
              flex: 1, padding: "0.6rem 0.5rem", background: activeTab === t.id ? "rgba(6,182,212,0.12)" : "rgba(0,0,0,0.2)",
              border: "none", cursor: "pointer", color: activeTab === t.id ? "var(--color-primary)" : "var(--color-text-secondary)",
              fontWeight: activeTab === t.id ? "700" : "500", fontSize: "0.78rem", transition: "all 0.15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB: MANUAL ════════════════════════════════════════════ */}
        {activeTab === "manual" && (
          <div className="animate-fade-in">
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.2rem", marginBottom: "0.8rem" }}>
              Clique numa célula e escreva a disciplina. Use <kbd style={{ background: "rgba(255,255,255,0.08)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.65rem" }}>Tab</kbd> para avançar, <kbd style={{ background: "rgba(255,255,255,0.08)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.65rem" }}>Enter</kbd> para confirmar.
            </p>

            {/* Grelha */}
            <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "55vh" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
                <thead>
                  <tr>
                    <th style={thStyle("#0b0f19")}>⏱ Hora</th>
                    {[1,2,3,4,5].map((day) => (
                      <th key={day} style={thStyle("rgba(6,182,212,0.06)")}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                          <span style={{ fontWeight: "700", fontSize: "0.75rem" }}>{DAYS[day-1]}</span>
                          <button type="button" onClick={() => clearDay(day)} title={`Limpar ${DAY_FULL[day-1]}`}
                            style={{ background: "rgba(239,68,68,0.07)", border: "none", color: "#f87171", borderRadius: "3px", padding: "1px 5px", fontSize: "0.58rem", cursor: "pointer", lineHeight: 1.4 }}>
                            limpar
                          </button>
                        </div>
                      </th>
                    ))}
                    <th style={thStyle("#0b0f19")} />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "3px 4px", verticalAlign: "middle", minWidth: "115px" }}>
                        <input type="text" value={row.time} onChange={(e) => setRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, time: e.target.value } : r))}
                          placeholder="08:30 - 09:20" style={{ width: "100%", fontSize: "0.68rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--color-text-secondary)", borderRadius: "4px", padding: "4px 5px", textAlign: "center", outline: "none", fontFamily: "monospace" }} />
                      </td>
                      {[1,2,3,4,5].map((day) => {
                        const isActive = activeCell?.row === rowIdx && activeCell?.day === day;
                        const val = row.cells[day];
                        return (
                          <td key={day} style={{ padding: "3px", verticalAlign: "middle", position: "relative" }}>
                            {isActive ? (
                              <div style={{ position: "relative" }}>
                                <input autoFocus type="text" value={inputVal} onChange={(e) => { setInputVal(e.target.value); setShowSuggest(true); }} onKeyDown={handleKeyDown} onBlur={() => setTimeout(() => { commitCell(inputVal); }, 150)}
                                  style={{ width: "100%", fontSize: "0.78rem", fontWeight: "700", background: "rgba(6,182,212,0.12)", border: "1.5px solid var(--color-primary)", color: "var(--color-text-primary)", borderRadius: "5px", padding: "5px 6px", outline: "none", boxSizing: "border-box" }} />
                                {showSuggest && suggestions.length > 0 && (
                                  <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 1000, background: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", minWidth: "160px", overflow: "hidden" }}>
                                    {suggestions.map((s) => (
                                      <div key={s} onMouseDown={() => { setInputVal(s); commitCell(s); }}
                                        style={{ padding: "7px 10px", fontSize: "0.75rem", cursor: "pointer", color: "var(--color-text-primary)", transition: "background 0.1s", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                        onMouseEnter={(e) => e.target.style.background = "rgba(6,182,212,0.1)"} onMouseLeave={(e) => e.target.style.background = "transparent"}>{s}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div onClick={() => activateCell(rowIdx, day)}
                                style={{ minHeight: "32px", padding: "5px 6px", borderRadius: "5px", background: val ? "rgba(6,182,212,0.06)" : "rgba(255,255,255,0.015)", border: `1px solid ${val ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.05)"}`, cursor: "text", fontSize: "0.75rem", fontWeight: val ? "600" : "400", color: val ? "var(--color-text-primary)" : "var(--color-text-muted)", transition: "all 0.12s", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.2 }}
                                onMouseEnter={(e) => { if (!val) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }} onMouseLeave={(e) => { if (!val) e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}>
                                {val || <span style={{ fontSize: "0.65rem", opacity: 0.3 }}>—</span>}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ padding: "3px 4px", verticalAlign: "middle" }}>
                        <button type="button" onClick={() => removeRow(rowIdx)} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", fontSize: "0.8rem", padding: "2px 4px", lineHeight: 1 }} title="Remover linha">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <button type="button" onClick={addRow} style={{ background: "transparent", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--color-text-muted)", fontSize: "0.73rem", padding: "5px", cursor: "pointer", width: "100%" }}>
                ＋ Adicionar linha de horário
              </button>
            </div>

            {/* Rodapé Manual */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.7rem" }}>
              <div style={{ flex: 1, fontSize: "0.73rem", color: "var(--color-text-muted)" }}>
                {totalFilled > 0 ? <span style={{ color: "#10b981", fontWeight: "600" }}>✓ {totalFilled} aula(s) preenchida(s)</span> : <span>Nenhuma aula preenchida ainda</span>}
              </div>
              <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: "0.5rem 1rem" }}>Cancelar</button>
              <button type="button" className="btn-primary" onClick={handleConfirmManual} style={{ padding: "0.5rem 1.2rem", fontWeight: "700" }} disabled={totalFilled === 0}>
                ✓ Aplicar Horário
              </button>
            </div>
          </div>
        )}

        {/* ═══ TAB: INOVAR CONSULTA ════════════════════════════════════════ */}
        {activeTab === "inovar" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            
            {!inovarSuccess ? (
              <form onSubmit={handleInovarImport} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "var(--radius-md)", padding: "0.8rem", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                  <p style={{ margin: 0 }}>O nosso sistema fará login automaticamente no Inovar Consulta da escola para extrair o horário do aluno.</p>
                  <p style={{ margin: "0.4rem 0 0", fontSize: "0.65rem", opacity: 0.7 }}>🔒 As credenciais são usadas apenas neste momento e não são guardadas.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Link do Inovar Consulta da Escola</label>
                  <input type="url" className="form-input" placeholder="ex: https://inovar.ae-salvaterra.pt/inovarconsulta/"
                    value={inovarUrl} onChange={(e) => setInovarUrl(e.target.value)} required />
                </div>
                
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Nº Processo / Login</label>
                    <input type="text" className="form-input" placeholder="ex: a12345"
                      value={inovarUser} onChange={(e) => setInovarUser(e.target.value)} required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Senha</label>
                    <input type="password" className="form-input" placeholder="Senha do Inovar"
                      value={inovarPass} onChange={(e) => setInovarPass(e.target.value)} required />
                  </div>
                </div>

                {inovarError && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", padding: "0.7rem", fontSize: "0.75rem", color: "#f87171" }}>
                    ⚠️ {inovarError}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.7rem", marginTop: "0.5rem" }}>
                  <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1, padding: "0.6rem" }}>Cancelar</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2, padding: "0.6rem", fontWeight: "700" }} disabled={inovarLoading}>
                    {inovarLoading ? "A sincronizar..." : "📡 Extrair Horário"}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "1rem 0" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                  ✅
                </div>
                <div>
                  <h4 style={{ color: "#10b981", margin: "0 0 0.3rem", fontSize: "1.1rem" }}>Horário Extraído com Sucesso!</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", margin: 0 }}>
                    Foram encontradas {Object.values(extractedSchedule).reduce((s, a) => s + a.length, 0)} aulas no sistema.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.7rem", width: "100%", marginTop: "1rem" }}>
                  <button type="button" className="btn-secondary" onClick={() => setInovarSuccess(false)} style={{ flex: 1, padding: "0.6rem" }}>
                    Tentar Novamente
                  </button>
                  <button type="button" className="btn-primary" onClick={handleConfirmInovar} style={{ flex: 2, padding: "0.6rem", fontWeight: "700" }}>
                    ✓ Aplicar na Agenda
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Estilo base de cabeçalho da tabela ──────────────────────────────────────
const thStyle = (bg) => ({
  padding: "6px 5px", background: bg, fontSize: "0.7rem", fontWeight: "700",
  color: "var(--color-text-secondary)", textAlign: "center", position: "sticky",
  top: 0, zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.06)",
});
