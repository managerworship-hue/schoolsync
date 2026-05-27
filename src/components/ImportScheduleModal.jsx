import React, { useState } from "react";

const DEFAULT_GRID_SLOTS = [
  "08:30 - 09:20", "09:20 - 10:10", "10:30 - 11:20", "11:20 - 12:10",
  "13:30 - 14:20", "14:20 - 15:10", "15:10 - 16:00", "16:15 - 17:05"
];

// ─── Disciplinas por ciclo ──────────────────────────────────────────────────
const SUBJECTS_BY_CYCLE = {
  "Geral & Outros": [
    "Intervalo", "DTA", "Apoio ao Estudo", "Oferta Complementar", "Oferta de Escola", "EMRC", "Cidadania e Desenvolvimento"
  ],
  "1º Ciclo": [
    "Português (1º)", "Matemática (1º)", "Estudo do Meio", "Expressão Artística", "Expressão Físico-Motora", "Inglês (1º)"
  ],
  "2º Ciclo (5º/6º)": [
    "Português", "Inglês", "HGP", "Matemática", "Ciências Naturais", "Educação Visual (EV)", "Educação Tecnológica (ET)", "Educação Musical", "Educação Física", "TIC"
  ],
  "3º Ciclo (7º ao 9º)": [
    "Português", "Inglês", "Francês", "Espanhol", "Alemão", "História", "Geografia", "Matemática", "Ciências Naturais", "Físico-Química", "Educação Visual", "Educação Física", "TIC", "Teatro", "Dança"
  ],
  "Secundário (10º ao 12º)": [
    "Filosofia", "Matemática A", "Matemática B", "MACS", "Biologia e Geologia", "Física e Química A", "Geometria Descritiva A", "Desenho A", "História A", "História B", "Geografia A", "Economia A", "Economia C", "Literatura Portuguesa", "Latim A", "Sociologia", "Psicologia B", "Ciência Política", "Direito", "Aplicações Informáticas B", "Biologia", "Geologia", "Física", "Química"
  ]
};

const getCycleForYear = (grade) => {
  if (!grade) return null;
  const match = grade.match(/^(\d+)/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  if (year >= 1 && year <= 4) return "1º Ciclo";
  if (year >= 5 && year <= 6) return "2º Ciclo (5º/6º)";
  if (year >= 7 && year <= 9) return "3º Ciclo (7º ao 9º)";
  if (year >= 10 && year <= 12) return "Secundário (10º ao 12º)";
  return null;
};

const getRowTimes = (timeStr) => {
  const parts = (timeStr || "").split(" - ");
  return {
    start: parts[0] || "08:30",
    end: parts[1] || "09:20"
  };
};

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const DAY_FULL = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

const emptyGrid = () =>
  DEFAULT_GRID_SLOTS.map((time) => ({
    time,
    cells: { 1: "", 2: "", 3: "", 4: "", 5: "" },
  }));

const loadExistingGrid = (activeChild) => {
  const schedule = activeChild?.schedule;
  if (!schedule) return emptyGrid();

  const slotsSet = new Set();
  [1, 2, 3, 4, 5].forEach((day) => {
    const dayClasses = schedule[day] || [];
    dayClasses.forEach((c) => {
      if (c.time) {
        slotsSet.add(c.time);
      }
    });
  });

  const uniqueSlots = Array.from(slotsSet).sort((a, b) => {
    const timeA = a.split(" - ")[0] || "";
    const timeB = b.split(" - ")[0] || "";
    return timeA.localeCompare(timeB);
  });

  if (uniqueSlots.length === 0) {
    return emptyGrid();
  }

  return uniqueSlots.map((time) => {
    const cells = { 1: "", 2: "", 3: "", 4: "", 5: "" };
    [1, 2, 3, 4, 5].forEach((day) => {
      const dayClasses = schedule[day] || [];
      const classAtSlot = dayClasses.find((c) => c.time === time);
      if (classAtSlot) {
        cells[day] = classAtSlot.subject;
      }
    });
    return { time, cells };
  });
};

export default function ImportScheduleModal({ activeChild, onClose, onImportSuccess }) {
  const [rows, setRows] = useState(() => loadExistingGrid(activeChild));

  const cycle = getCycleForYear(activeChild?.grade);

  // Filtered subjects list based on child profile grade/year
  const filteredSubjects = {};
  if (cycle && SUBJECTS_BY_CYCLE[cycle]) {
    filteredSubjects["Geral & Outros"] = SUBJECTS_BY_CYCLE["Geral & Outros"];
    filteredSubjects[cycle] = SUBJECTS_BY_CYCLE[cycle];
  } else {
    Object.assign(filteredSubjects, SUBJECTS_BY_CYCLE);
  }

  const updateCell = (rowIdx, day, val) => {
    setRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, cells: { ...r.cells, [day]: val } } : r));
  };

  const updateTime = (rowIdx, val) => {
    setRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, time: val } : r));
  };

  const handleTimeChange = (rowIdx, newStart, newEnd) => {
    updateTime(rowIdx, `${newStart || "00:00"} - ${newEnd || "00:00"}`);
  };

  const addRow = () =>
    setRows((prev) => [...prev, { time: "08:30 - 09:20", cells: { 1: "", 2: "", 3: "", 4: "", 5: "" } }]);

  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const clearDay = (day) =>
    setRows((prev) => prev.map((r) => ({ ...r, cells: { ...r.cells, [day]: "" } })));

  const handleConfirm = () => {
    const schedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    const originalSchedule = activeChild?.schedule || {};

    rows.forEach((row) => {
      [1, 2, 3, 4, 5].forEach((day) => {
        const subject = row.cells[day]?.trim();
        if (subject) {
          const existingClass = (originalSchedule[day] || []).find(
            (c) => c.time === row.time && c.subject === subject
          );

          schedule[day].push({
            id: existingClass?.id || `manual-${day}-${row.time}-${Math.random().toString(36).substr(2, 5)}`,
            subject,
            time: row.time,
            room: existingClass?.room || "",
            teacher: existingClass?.teacher || "",
            email: existingClass?.email || "",
          });
        }
      });
    });
    const total = Object.values(schedule).reduce((s, a) => s + a.length, 0);
    if (total === 0) { alert("Preencha pelo menos uma aula ou intervalo antes de confirmar."); return; }
    onImportSuccess(activeChild.id, schedule);
    onClose();
  };

  const totalFilled = rows.reduce((s, r) => s + Object.values(r.cells).filter((v) => v.trim()).length, 0);

  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }}>
      <div className="glass-panel modal-content" style={{ maxWidth: "820px", padding: "1.2rem 1.3rem", width: "98vw" }}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div style={{ marginBottom: "0.9rem" }}>
          <h3 className="gradient-text" style={{ fontSize: "1.15rem", margin: 0 }}>📅 Horário de {activeChild.name}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
            Defina o horário inserindo a hora desejada e selecionando as disciplinas da lista (filtrada para o ano {activeChild.grade || "escolar"}).
          </p>
        </div>

        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "65vh" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr>
                <th style={{
                  ...thStyle("#0b0f19"),
                  position: "sticky",
                  left: 0,
                  zIndex: 20,
                  background: "#0b0f19",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "2px 0 5px rgba(0,0,0,0.3)"
                }}>⏱ Hora</th>
                {[1, 2, 3, 4, 5].map((day) => (
                  <th key={day} style={thStyle("rgba(6,182,212,0.06)")}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.75rem" }}>{DAYS[day - 1]}</span>
                      <button type="button" onClick={() => clearDay(day)} title={`Limpar ${DAY_FULL[day - 1]}`} style={{ background: "rgba(239,68,68,0.07)", border: "none", color: "#f87171", borderRadius: "3px", padding: "1px 5px", fontSize: "0.58rem", cursor: "pointer", lineHeight: 1.4 }}>
                        limpar
                      </button>
                    </div>
                  </th>
                ))}
                <th style={thStyle("#0b0f19")} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => {
                const { start, end } = getRowTimes(row.time);
                return (
                  <tr key={rowIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    
                    {/* Caixa de Hora */}
                    <td style={{
                      padding: "3px 4px",
                      verticalAlign: "middle",
                      width: "150px",
                      position: "sticky",
                      left: 0,
                      zIndex: 2,
                      background: "#111928",
                      borderRight: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "2px 0 5px rgba(0,0,0,0.3)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", width: "100%" }}>
                        <input
                          type="time"
                          value={start}
                          onChange={(e) => handleTimeChange(rowIdx, e.target.value, end)}
                          style={{
                            flex: 1,
                            fontSize: "0.72rem",
                            background: "rgba(0,0,0,0.25)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "var(--color-text-primary)",
                            borderRadius: "4px",
                            padding: "4px 2px",
                            outline: "none",
                            textAlign: "center",
                            fontFamily: "monospace",
                            cursor: "pointer"
                          }}
                        />
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.7rem" }}>-</span>
                        <input
                          type="time"
                          value={end}
                          onChange={(e) => handleTimeChange(rowIdx, start, e.target.value)}
                          style={{
                            flex: 1,
                            fontSize: "0.72rem",
                            background: "rgba(0,0,0,0.25)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "var(--color-text-primary)",
                            borderRadius: "4px",
                            padding: "4px 2px",
                            outline: "none",
                            textAlign: "center",
                            fontFamily: "monospace",
                            cursor: "pointer"
                          }}
                        />
                      </div>
                    </td>

                    {/* Select Disciplinas */}
                    {[1, 2, 3, 4, 5].map((day) => {
                      const isIntervalo = row.cells[day] === "Intervalo";
                      return (
                        <td key={day} style={{ padding: "3px", verticalAlign: "middle", width: "16%" }}>
                          <select
                            value={row.cells[day] || ""}
                            onChange={(e) => updateCell(rowIdx, day, e.target.value)}
                            style={{
                              width: "100%", fontSize: "0.72rem", fontWeight: row.cells[day] ? "600" : "400",
                              background: isIntervalo ? "rgba(16,185,129,0.15)" : (row.cells[day] ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.03)"),
                              border: `1px solid ${isIntervalo ? "rgba(16,185,129,0.4)" : (row.cells[day] ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.05)")}`,
                              color: isIntervalo ? "#10b981" : (row.cells[day] ? "var(--color-text-primary)" : "var(--color-text-muted)"),
                              borderRadius: "5px", padding: "5px 2px", outline: "none", cursor: "pointer",
                              appearance: "auto", textOverflow: "ellipsis"
                            }}
                          >
                            <option value="">— Livre —</option>
                            {Object.entries(filteredSubjects).map(([group, subjects]) => (
                              <optgroup key={group} label={group}>
                                {subjects.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                    <td style={{ padding: "3px 4px", verticalAlign: "middle", width: "20px" }}>
                      <button type="button" onClick={() => removeRow(rowIdx)} style={{ background: "none", border: "none", color: "rgba(239,68,68,0.5)", cursor: "pointer", fontSize: "0.9rem", padding: "2px 4px" }}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "0.6rem" }}>
          <button type="button" onClick={addRow} style={{ background: "transparent", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--color-text-muted)", fontSize: "0.73rem", padding: "6px", cursor: "pointer", width: "100%" }}>
            ＋ Adicionar linha de horário
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.8rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.7rem" }}>
          <div style={{ flex: 1, fontSize: "0.73rem", color: "var(--color-text-muted)" }}>
            {totalFilled > 0 ? <span style={{ color: "#10b981", fontWeight: "600" }}>✓ {totalFilled} preenchida(s)</span> : <span>Nenhuma disciplina selecionada</span>}
          </div>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: "0.5rem 1rem" }}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={handleConfirm} style={{ padding: "0.5rem 1.2rem", fontWeight: "700" }} disabled={totalFilled === 0}>
            ✓ Guardar Horário
          </button>
        </div>
      </div>
    </div>
  );
}

const thStyle = (bg) => ({
  padding: "6px 5px", background: bg, fontSize: "0.7rem", fontWeight: "700",
  color: "var(--color-text-secondary)", textAlign: "center", position: "sticky",
  top: 0, zIndex: 10, borderBottom: "1px solid rgba(255,255,255,0.06)",
});
