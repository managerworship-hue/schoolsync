import React, { useState } from "react";

export default function ChildSelector({ childrenList, activeChildId, onSelectChild, onAddChild }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [avatar, setAvatar] = useState("👦");
  const [theme, setTheme] = useState("lucas");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !grade) return;
    
    // Add child with empty schedule for now (user can add details or we populate a basic default)
    onAddChild({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      grade,
      avatar,
      theme,
      schedule: { 1: [], 2: [], 3: [], 4: [], 5: [] }
    });

    // Reset form
    setName("");
    setGrade("");
    setShowAddForm(false);
  };

  const activeChild = childrenList.find(c => c.id === activeChildId) || childrenList[0] || { id: "default", name: "Estudante", grade: "2025/2026", theme: "lucas" };

  return (
    <div className="glass-panel child-selector-container">
      <div className="brand-section">
        <div className="brand-logo" style={{ background: "none", overflow: "hidden", padding: 0 }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="brand-text">
          <h1 className="gradient-text" style={{ fontSize: "1.4rem", margin: 0 }}>Horário Escolar</h1>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: 0 }}>Ano Letivo: 2025/2026</p>
        </div>
      </div>

      <div className="children-list">
        {childrenList.map((child) => (
          <button
            key={child.id}
            className={`child-avatar-btn glow-effect ${activeChildId === child.id ? "active" : ""}`}
            onClick={() => onSelectChild(child.id)}
          >
            <span className="avatar-circle">{child.avatar}</span>
            <div className="child-info">
              <span className="child-name">{child.name.split(" ")[0]}</span>
              <span className="child-grade">{child.grade.split(" - ")[0]}</span>
            </div>
          </button>
        ))}

        <button 
          className="add-child-btn"
          onClick={() => setShowAddForm(true)}
          title="Adicionar Perfil de Filho"
        >
          ＋
        </button>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: "400px" }}>
            <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            <div className="modal-header">
              <h3 className="gradient-text" style={{ fontSize: "1.3rem" }}>Adicionar Perfil</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>Crie um novo perfil para consultar horários</p>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body" style={{ gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Pedro Silva" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ano Escolar / Turma</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: 8º Ano - Turma A" 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)}
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Avatar</label>
                  <select 
                    className="form-select" 
                    value={avatar} 
                    onChange={(e) => setAvatar(e.target.value)}
                  >
                    <option value="👦">👦 Rapaz 1</option>
                    <option value="👧">👧 Rapariga 1</option>
                    <option value="👨‍🎓">👨‍🎓 Estudante Rapaz</option>
                    <option value="👩‍🎓">👩‍🎓 Estudante Rapariga</option>
                    <option value="🦁">🦁 Leão</option>
                    <option value="🦄">🦄 Unicórnio</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tema de Cor</label>
                  <select 
                    className="form-select" 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="lucas">Ciano & Esmeralda</option>
                    <option value="sofia">Violeta & Rosa</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem", width: "100%" }}>
                Confirmar Perfil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
