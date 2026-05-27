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
  const [rows, setRows] = useState(emptyGrid);
  const [activeCell, setActiveCell] = useState(null); // {row, day}
  const [inputVal, setInputVal]     = useState("");
  const [showSuggest, setShowSuggest] = useState(false);

  // ─── Editar célula ──────────────────────────────────────────────────────────
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
      // Avança para próxima célula (mesmo dia, linha seguinte)
      if (activeCell) {
        const nextRow = activeCell.row + 1;
        if (nextRow < rows.length) activateCell(nextRow, activeCell.day);
      }
    }
  };

  // Filtra sugestões pelo que o utilizador está a escrever
  const suggestions = inputVal.length >= 1
    ? COMMON_SUBJECTS.filter((s) => s.toLowerCase().includes(inputVal.toLowerCase())).slice(0, 6)
    : COMMON_SUBJECTS.slice(0, 6);

  // ─── Adicionar / remover linhas de horário ──────────────────────────────────
  const addRow = () =>
    setRows((prev) => [...prev, { time: "", cells: { 1: "", 2: "", 3: "", 4: "", 5: "" } }]);

  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  // ─── Limpar coluna (dia) ────────────────────────────────────────────────────
  const clearDay = (day) =>
    setRows((prev) =>
      prev.map((r) => ({ ...r, cells: { ...r.cells, [day]: "" } }))
    );

  // ─── Copiar dia para outro ──────────────────────────────────────────────────
  const [copyFrom, setCopyFrom] = useState(null);

  // ─── Confirmar ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
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

  const totalFilled = rows.reduce(
    (s, r) => s + Object.values(r.cells).filter((v) => v.trim()).length, 0
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }} onClick={() => { if (activeCell) commitCell(inputVal); }}>
      <div
        className="glass-panel modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px", padding: "1.2rem 1.3rem", width: "98vw" }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Cabeçalho */}
        <div style={{ marginBottom: "0.9rem" }}>
          <h3 className="gradient-text" style={{ fontSize: "1.15rem", margin: 0 }}>
            📅 Horário de {activeChild.name}
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
            Clique numa célula e escreva a disciplina. Use <kbd style={{ background: "rgba(255,255,255,0.08)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.65rem" }}>Tab</kbd> para avançar, <kbd style={{ background: "rgba(255,255,255,0.08)", borderRadius: "3px", padding: "1px 5px", fontSize: "0.65rem" }}>Enter</kbd> para confirmar.
          </p>
        </div>

        {/* Grelha */}
        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "62vh" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
            <thead>
              <tr>
                <th style={thStyle("#0b0f19")}>⏱ Hora</th>
                {[1,2,3,4,5].map((day) => (
                  <th key={day} style={thStyle("rgba(6,182,212,0.06)")}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.75rem" }}>{DAYS[day-1]}</span>
                      <button
                        type="button"
                        onClick={() => clearDay(day)}
                        title={`Limpar ${DAY_FULL[day-1]}`}
                        style={{ background: "rgba(239,68,68,0.07)", border: "none", color: "#f87171", borderRadius: "3px", padding: "1px 5px", fontSize: "0.58rem", cursor: "pointer", lineHeight: 1.4 }}
                      >
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

                  {/* Hora */}
                  <td style={{ padding: "3px 4px", verticalAlign: "middle", minWidth: "115px" }}>
                    <input
                      type="text"
                      value={row.time}
                      onChange={(e) =>
                        setRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, time: e.target.value } : r))
                      }
                      placeholder="08:30 - 09:20"
                      style={{
                        width: "100%", fontSize: "0.68rem", background: "rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.06)", color: "var(--color-text-secondary)",
                        borderRadius: "4px", padding: "4px 5px", textAlign: "center", outline: "none",
                        fontFamily: "monospace",
                      }}
                    />
                  </td>

                  {/* Células de disciplina */}
                  {[1,2,3,4,5].map((day) => {
                    const isActive = activeCell?.row === rowIdx && activeCell?.day === day;
                    const val = row.cells[day];
                    return (
                      <td key={day} style={{ padding: "3px", verticalAlign: "middle", position: "relative" }}>
                        {isActive ? (
                          <div style={{ position: "relative" }}>
                            <input
                              autoFocus
                              type="text"
                              value={inputVal}
                              onChange={(e) => { setInputVal(e.target.value); setShowSuggest(true); }}
                              onKeyDown={handleKeyDown}
                              onBlur={() => setTimeout(() => { commitCell(inputVal); }, 150)}
                              style={{
                                width: "100%", fontSize: "0.78rem", fontWeight: "700",
                                background: "rgba(6,182,212,0.12)", border: "1.5px solid var(--color-primary)",
                                color: "var(--color-text-primary)", borderRadius: "5px",
                                padding: "5px 6px", outline: "none", boxSizing: "border-box",
                              }}
                            />
                            {showSuggest && suggestions.length > 0 && (
                              <div style={{
                                position: "absolute", top: "100%", left: 0, zIndex: 1000,
                                background: "var(--color-surface)", border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "6px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                                minWidth: "160px", overflow: "hidden",
                              }}>
                                {suggestions.map((s) => (
                                  <div
                                    key={s}
                                    onMouseDown={() => { setInputVal(s); commitCell(s); }}
                                    style={{
                                      padding: "7px 10px", fontSize: "0.75rem", cursor: "pointer",
                                      color: "var(--color-text-primary)", transition: "background 0.1s",
                                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = "rgba(6,182,212,0.1)"}
                                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                                  >
                                    {s}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() => activateCell(rowIdx, day)}
                            style={{
                              minHeight: "32px", padding: "5px 6px", borderRadius: "5px",
                              background: val ? "rgba(6,182,212,0.06)" : "rgba(255,255,255,0.015)",
                              border: `1px solid ${val ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.05)"}`,
                              cursor: "text", fontSize: "0.75rem", fontWeight: val ? "600" : "400",
                              color: val ? "var(--color-text-primary)" : "var(--color-text-muted)",
                              transition: "all 0.12s", display: "flex", alignItems: "center",
                              justifyContent: "center", textAlign: "center", lineHeight: 1.2,
                            }}
                            onMouseEnter={(e) => { if (!val) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={(e) => { if (!val) e.currentTarget.style.background = "rgba(255,255,255,0.015)"; }}
                          >
                            {val || <span style={{ fontSize: "0.65rem", opacity: 0.3 }}>—</span>}
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Botão remover linha */}
                  <td style={{ padding: "3px 4px", verticalAlign: "middle" }}>
                    <button
                      type="button"
                      onClick={() => removeRow(rowIdx)}
                      style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", fontSize: "0.8rem", padding: "2px 4px", lineHeight: 1 }}
                      title="Remover linha"
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Adicionar linha + chips de disciplinas rápidas */}
        <div style={{ marginTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <button type="button" onClick={addRow} style={{
            background: "transparent", border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: "6px", color: "var(--color-text-muted)", fontSize: "0.73rem",
            padding: "5px", cursor: "pointer", width: "100%",
          }}>
            ＋ Adicionar linha de horário
          </button>

          {/* Chips de disciplinas rápidas */}
          <div>
            <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", marginBottom: "0.3rem", fontWeight: "600" }}>
              SUGESTÕES RÁPIDAS — clique numa célula e depois toque numa disciplina:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
              {COMMON_SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { if (activeCell) { setInputVal(s); commitCell(s); } }}
                  style={{
                    padding: "3px 9px", borderRadius: "12px", fontSize: "0.67rem", cursor: "pointer",
                    background: activeCell ? "rgba(6,182,212,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${activeCell ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.06)"}`,
                    color: activeCell ? "var(--color-primary)" : "var(--color-text-muted)",
                    transition: "all 0.12s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.7rem" }}>
          <div style={{ flex: 1, fontSize: "0.73rem", color: "var(--color-text-muted)" }}>
            {totalFilled > 0
              ? <span style={{ color: "#10b981", fontWeight: "600" }}>✓ {totalFilled} aula{totalFilled !== 1 ? "s" : ""} preenchida{totalFilled !== 1 ? "s" : ""}</span>
              : <span>Nenhuma aula preenchida ainda</span>
            }
          </div>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: "0.5rem 1rem" }}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleConfirm} style={{ padding: "0.5rem 1.2rem", fontWeight: "700" }} disabled={totalFilled === 0}>
            ✓ Aplicar Horário
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Estilo base de cabeçalho da tabela ──────────────────────────────────────
const thStyle = (bg) => ({
  padding: "6px 5px",
  background: bg,
  fontSize: "0.7rem",
  fontWeight: "700",
  color: "var(--color-text-secondary)",
  textAlign: "center",
  position: "sticky",
  top: 0,
  zIndex: 10,
  borderBottom: "1px solid rgba(255,255,255,0.06)",
});
