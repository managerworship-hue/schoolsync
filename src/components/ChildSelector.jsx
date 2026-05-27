import React from "react";

export default function ChildSelector({ 
  childrenList, 
  activeChildId, 
  onSelectChild, 
  onOpenAddModal, 
  currentUser, 
  onLogout, 
  onDeleteChild, 
  onEditChild,
  schoolYear = "2025/2026",
  onEditSchoolYear,
  onOpenBackupModal
}) {
  const handleChildClick = (child) => {
    if (activeChildId === child.id) {
      onEditChild(child);
    } else {
      onSelectChild(child.id);
    }
  };

  return (
    <div className="glass-panel child-selector-container">
      {/* Brand Logo & Title */}
      <div className="brand-section">
        <div className="brand-logo" style={{ background: "none", overflow: "hidden", padding: 0 }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="brand-text">
          <h1 className="gradient-text" style={{ fontSize: "1.4rem", margin: 0 }}>Horário Escolar</h1>
          <p 
            style={{ 
              fontSize: "0.75rem", 
              color: "var(--color-text-secondary)", 
              margin: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
            onClick={onEditSchoolYear}
            title="Clique para editar o Ano Letivo"
          >
            Ano Letivo: <span style={{ fontWeight: "700", textDecoration: "underline var(--color-primary) 2px" }}>{schoolYear}</span> ✏️
          </p>
        </div>
      </div>

      {/* Children list profiles */}
      <div className="children-list">
        {childrenList.map((child) => (
          <div key={child.id} className="child-avatar-wrapper" style={{ position: "relative" }}>
            <button
              className={`child-avatar-btn glow-effect ${activeChildId === child.id ? "active" : ""}`}
              onClick={() => handleChildClick(child)}
              style={{ width: "100%" }}
              title={`Clique para selecionar ou editar o perfil de ${child.name}`}
            >
              <span className="avatar-circle">{child.avatar}</span>
              <div className="child-info">
                <span className="child-name">{child.name.split(" ")[0]}</span>
                <span className="child-grade">{child.grade}</span>
              </div>
            </button>
            
            {/* Edit Profile button (only active profile) */}
            {activeChildId === child.id && (
              <button
                type="button"
                className="btn-edit-profile"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditChild(child);
                }}
                title={`Editar perfil de ${child.name}`}
                style={{
                  position: "absolute",
                  top: "-4px",
                  left: "-4px",
                  background: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "0.55rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.4)",
                  zIndex: 10,
                  transition: "var(--transition-smooth)"
                }}
              >
                ✏️
              </button>
            )}

            {/* Delete Profile button (only active profile) */}
            {activeChildId === child.id && (
              <button
                type="button"
                className="btn-delete-profile"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Tem a certeza de que deseja eliminar o perfil e todos os horários de ${child.name}?`)) {
                    onDeleteChild(child.id);
                  }
                }}
                title={`Excluir perfil de ${child.name}`}
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "0.55rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                  zIndex: 10,
                  transition: "var(--transition-smooth)"
                }}
              >
                🗑️
              </button>
            )}
          </div>
        ))}

        {/* Plus button to open root level Add Profile Modal */}
        <button 
          className="add-child-btn"
          onClick={onOpenAddModal}
          title="Adicionar Perfil de Filho"
        >
          ＋
        </button>
      </div>

      {/* User Login Info Header */}
      {currentUser && (
        <div className="user-profile-badge">
          <div className="user-info-text">
            <span className="user-welcome">Encarregado:</span>
            <span className="user-profile-name" title={currentUser.email}>{currentUser.name.split(" ")[0]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* Botão de Cópia de Segurança & Migração */}
            <button 
              onClick={onOpenBackupModal} 
              className="btn-logout" 
              title="Cópia de Segurança / Importar e Exportar Dados"
              style={{ padding: "4px 8px", fontSize: "0.85rem", background: "rgba(6, 182, 212, 0.08)", border: "1px solid rgba(6, 182, 212, 0.25)", color: "#06b6d4", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              💾
            </button>

            {/* Botão de Terminar Sessão */}
            <button 
              onClick={onLogout} 
              className="btn-logout" 
              title="Terminar Sessão (Sair)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logout-icon">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
