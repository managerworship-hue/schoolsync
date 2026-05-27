import React, { useState } from "react";

// ─── Horários comuns em escolas portuguesas ────────────────────────────────
const TIME_SLOTS = [
  // Manhã
  "08:15 - 09:05", "08:15 - 09:45", "08:25 - 09:15", "08:25 - 09:55",
  "08:30 - 09:20", "08:30 - 10:00", "09:20 - 10:10", "10:05 - 10:55",
  "10:15 - 11:05", "10:15 - 11:45", "10:20 - 11:10", "10:20 - 11:50",
  "10:30 - 11:20", "10:30 - 12:00", "11:15 - 12:05", "11:20 - 12:10",
  "11:20 - 12:50", "11:30 - 12:20", "11:35 - 12:25", "12:10 - 13:00",
  "12:25 - 13:15",
  
  // Tarde
  "13:30 - 14:20", "13:30 - 15:00", "13:45 - 14:35", "13:45 - 15:15",
  "14:20 - 15:10", "14:30 - 15:20", "14:30 - 16:00", "15:10 - 16:00",
  "15:25 - 16:15", "15:25 - 16:55", "15:30 - 16:20", "16:15 - 17:05",
  "16:30 - 17:20", "17:05 - 17:55", "17:25 - 18:15"
];

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

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const DAY_FULL = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

const emptyGrid = () =>
  DEFAULT_GRID_SLOTS.map((time) => ({
    time,
    cells: { 1: "", 2: "", 3: "", 4: "", 5: "" },
  }));

export default function ImportScheduleModal({ activeChild, onClose, onImportSuccess }) {
  const [rows, setRows] = useState(emptyGrid);

  const updateCell = (rowIdx, day, val) => {
    setRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, cells: { ...r.cells, [day]: val } } : r));
  };

  const updateTime = (rowIdx, val) => {
    setRows((prev) => prev.map((r, i) => i === rowIdx ? { ...r, time: val } : r));
  };

  const addRow = () =>
    setRows((prev) => [...prev, { time: TIME_SLOTS[0], cells: { 1: "", 2: "", 3: "", 4: "", 5: "" } }]);

  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  const clearDay = (day) =>
    setRows((prev) => prev.map((r) => ({ ...r, cells: { ...r.cells, [day]: "" } })));

  const handleConfirm = () => {
    const schedule = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    rows.forEach((row) => {
      [1, 2, 3, 4, 5].forEach((day) => {
        const subject = row.cells[day]?.trim();
        if (subject) {
          schedule[day].push({
            id: `manual-${day}-${row.time}-${Math.random().toString(36).substr(2, 5)}`,
            subject,
            time: row.time,
            room: "", teacher: "", email: "",
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
      <div className="glass-panel modal-content" style={{ maxWidth: "780px", padding: "1.2rem 1.3rem", width: "98vw" }}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div style={{ marginBottom: "0.9rem" }}>
          <h3 className="gradient-text" style={{ fontSize: "1.15rem", margin: 0 }}>📅 Horário de {activeChild.name}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.2rem" }}>
            Selecione a hora e as disciplinas usando as caixas de seleção. Não precisa digitar nada manualmente.
          </p>
        </div>

        <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "65vh" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "650px" }}>
            <thead>
              <tr>
                <th style={thStyle("#0b0f19")}>⏱ Hora</th>
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
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  
                  {/* Select Hora */}
                  <td style={{ padding: "3px 4px", verticalAlign: "middle", width: "120px" }}>
                    <select
                      value={row.time}
                      onChange={(e) => updateTime(rowIdx, e.target.value)}
                      style={{
                        width: "100%", fontSize: "0.68rem", background: "rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.06)", color: "var(--color-text-primary)",
                        borderRadius: "4px", padding: "4px 2px", outline: "none",
                        fontFamily: "monospace", cursor: "pointer", appearance: "auto"
                      }}
                    >
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
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
                          {Object.entries(SUBJECTS_BY_CYCLE).map(([group, subjects]) => (
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
              ))}
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
