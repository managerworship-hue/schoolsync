import React, { useState, useEffect } from "react";
import ChildSelector from "./components/ChildSelector";
import ScheduleGrid from "./components/ScheduleGrid";
import ClassModal from "./components/ClassModal";
import AuthScreen from "./components/AuthScreen";
import ImportScheduleModal from "./components/ImportScheduleModal";

export default function App() {
  // Pull-to-Refresh States
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Efeito Pull-to-Refresh para iOS e Android
  useEffect(() => {
    let startY = 0;
    let active = false;

    const handleTouchStart = (e) => {
      // Ativa apenas no topo absoluto da página e com 1 dedo
      if (window.scrollY === 0 && e.touches.length === 1) {
        startY = e.touches[0].pageY;
        active = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!active || refreshing) return;
      
      const currentY = e.touches[0].pageY;
      const diff = currentY - startY;

      if (diff > 0) {
        // Bloquear recarga de sistema padrão para permitir a nossa animação nativa customizada
        if (e.cancelable) e.preventDefault();
        
        // Aplicar resistência de arrasto
        const resistance = Math.min(diff * 0.45, 80);
        setPullDistance(resistance);
      } else {
        active = false;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!active || refreshing) return;
      active = false;

      // Limiar de ativação a 60px
      if (pullDistance >= 60) {
        setRefreshing(true);
        setPullDistance(60);
        
        // Forçar atualização do Service Worker e recarregar a página de forma limpa
        setTimeout(() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              console.log("SchoolSync PWA: A atualizar recursos de cache...");
              reg.update().then(() => {
                window.location.reload();
              }).catch(() => {
                window.location.reload();
              });
            }).catch(() => {
              window.location.reload();
            });
          } else {
            window.location.reload();
          }
        }, 850);
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, refreshing]);

  // Estado do utilizador com sessão ativa
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("schoolsync_current_user");
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        // Segurança extra: se for o utilizador eliminado, não deixa iniciar sessão
        if (parsed && parsed.email === "l12johnsilva@gmail.com") {
          localStorage.removeItem("schoolsync_current_user");
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.error("Erro ao ler utilizador ativo do localStorage:", e);
    }
    return null; // Sem sessão iniciada por defeito
  });

  // Lista de filhos carregada dinamicamente com base no utilizador com sessão ativa
  const [childrenList, setChildrenList] = useState([]);
  const [activeChildId, setActiveChildId] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Ano Letivo configurável e sincronizado
  const [schoolYear, setSchoolYear] = useState("2025/2026");

  // Carregar Ano Letivo sempre que o utilizador ativo mudar
  useEffect(() => {
    if (!currentUser) return;
    try {
      const myKey = `schoolsync_school_year_user_${currentUser.id}`;
      const saved = localStorage.getItem(myKey);
      if (saved && saved !== "undefined" && saved !== "null") {
        setSchoolYear(saved);
      } else {
        setSchoolYear("2025/2026");
      }
    } catch (e) {
      console.error("Erro ao ler Ano Letivo:", e);
    }
  }, [currentUser]);

  // Persistir e sincronizar em tempo real o Ano Letivo entre Lejon e Valdenilda
  useEffect(() => {
    if (!currentUser) return;
    try {
      const myKey = `schoolsync_school_year_user_${currentUser.id}`;
      localStorage.setItem(myKey, schoolYear);

      // Sincronização em tempo real entre lejonzsilva@gmail.com e santanavaldenilda@gmail.com
      if (currentUser.email === "lejonzsilva@gmail.com") {
        const otherKey = "schoolsync_school_year_user_user-santanavaldenilda_gmail_com";
        localStorage.setItem(otherKey, schoolYear);
      } else if (currentUser.email === "santanavaldenilda@gmail.com") {
        const otherKey = "schoolsync_school_year_user_user-lejonzsilva_gmail_com";
        localStorage.setItem(otherKey, schoolYear);
      }
    } catch (e) {
      console.error("Erro ao persistir/sincronizar Ano Letivo:", e);
    }
  }, [schoolYear, currentUser]);

  const handleEditSchoolYear = () => {
    const val = prompt("Introduza o Ano Letivo desejado (ex: 2025/2026):", schoolYear);
    if (val && val.trim()) {
      setSchoolYear(val.trim());
    }
  };

  // Efeito executado uma única vez ao iniciar a aplicação para migrações
  useEffect(() => {
    try {
      // --- MIGRAÇÃO V2: Copiar dados de lejonzsilva@gmail.com para santanavaldenilda@gmail.com ---
      // Esta cópia força a substituição dos dados no destino pelos mais recentes.
      const hasMigrated = localStorage.getItem("schoolsync_migration_lejon_to_valdenilda_v2");
      if (!hasMigrated) {
        const sourceKey = "schoolsync_children_user_user-lejonzsilva_gmail_com";
        const targetKey = "schoolsync_children_user_user-santanavaldenilda_gmail_com";
        const sourceData = localStorage.getItem(sourceKey);
        
        if (sourceData && sourceData !== "undefined" && sourceData !== "null") {
          localStorage.setItem(targetKey, sourceData);
          console.log("SchoolSync Migration V2: Copiados dados de lejonzsilva@gmail.com para santanavaldenilda@gmail.com.");
        }
        localStorage.setItem("schoolsync_migration_lejon_to_valdenilda_v2", "true");
      }
    } catch (e) {
      console.error("Erro ao efetuar migração de dados:", e);
    }
  }, []);

  // Efeito para carregar a lista de filhos sempre que o utilizador ativo mudar
  useEffect(() => {
    if (!currentUser) {
      setChildrenList([]);
      setActiveChildId("");
      setIsLoaded(false);
      return;
    }

    const userChildrenKey = `schoolsync_children_user_${currentUser.id}`;
    let loadedChildren = [];

    try {
      // Verificar se já existem dados guardados para este utilizador específico
      const saved = localStorage.getItem(userChildrenKey);
      if (saved && saved !== "undefined" && saved !== "null") {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loadedChildren = parsed;
        }
      }
    } catch (e) {
      console.error("Erro ao ler dados de filhos no carregamento:", e);
    }

    // Lógica especial de Sincronização entre lejonzsilva@gmail.com e santanavaldenilda@gmail.com no carregamento
    const isLejon = currentUser.email === "lejonzsilva@gmail.com";
    const isValdenilda = currentUser.email === "santanavaldenilda@gmail.com";
    const isSpecialUser = isLejon || isValdenilda;

    if (isSpecialUser && loadedChildren.length === 0) {
      const otherUserId = isLejon ? "user-santanavaldenilda_gmail_com" : "user-lejonzsilva_gmail_com";
      const otherKey = `schoolsync_children_user_${otherUserId}`;
      try {
        const otherData = localStorage.getItem(otherKey);
        if (otherData && otherData !== "undefined" && otherData !== "null") {
          const parsedOther = JSON.parse(otherData);
          if (parsedOther && parsedOther.length > 0) {
            loadedChildren = parsedOther;
            console.log(`SchoolSync: Copiados dados iniciais de ${isLejon ? "Valdenilda" : "Lejon"} para ${currentUser.email}`);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar dados sincronizados do parceiro:", e);
      }
    }

    // Todos os utilizadores arrancam em branco por defeito (exceto os especiais se houver dados do outro)
    setChildrenList(loadedChildren);
    setActiveChildId(loadedChildren[0]?.id || "");
    setIsLoaded(true);
  }, [currentUser]);

  // Persistir alterações de filhos na chave específica do utilizador ativo e sincronizar em tempo real
  useEffect(() => {
    if (!currentUser || !isLoaded) return;

    try {
      const userChildrenKey = `schoolsync_children_user_${currentUser.id}`;
      const dataStr = JSON.stringify(childrenList);
      localStorage.setItem(userChildrenKey, dataStr);

      // Sincronização em tempo real entre lejonzsilva@gmail.com e santanavaldenilda@gmail.com
      if (currentUser.email === "lejonzsilva@gmail.com") {
        const otherKey = "schoolsync_children_user_user-santanavaldenilda_gmail_com";
        localStorage.setItem(otherKey, dataStr);
      } else if (currentUser.email === "santanavaldenilda@gmail.com") {
        const otherKey = "schoolsync_children_user_user-lejonzsilva_gmail_com";
        localStorage.setItem(otherKey, dataStr);
      }
    } catch (e) {
      console.error("Erro ao gravar e sincronizar dados de filhos no localStorage:", e);
    }
  }, [childrenList, currentUser, isLoaded]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDayName, setSelectedDayName] = useState("");

  // Atualizar tema de cor no body dinamicamente com base no filho selecionado
  useEffect(() => {
    const activeChild = childrenList.find((c) => c.id === activeChildId);
    if (activeChild && activeChild.theme) {
      document.body.setAttribute("data-theme", activeChild.theme);
    } else {
      document.body.removeAttribute("data-theme");
    }
  }, [activeChildId, childrenList]);

  // Callback de sucesso no login/registo
  const handleLoginSuccess = (user, rememberMe) => {
    setCurrentUser(user);
    if (rememberMe) {
      try {
        localStorage.setItem("schoolsync_current_user", JSON.stringify(user));
      } catch (e) {
        console.error("Erro ao gravar sessão no localStorage:", e);
      }
    }
  };

  // Callback de Logout (Sair)
  const handleLogout = () => {
    try {
      localStorage.removeItem("schoolsync_current_user");
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  // Garantia de segurança para o perfil ativo
  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0] || {
    id: "default",
    name: "Estudante",
    grade: "2025/2026",
    theme: "lucas",
    schedule: { 1: [], 2: [], 3: [], 4: [], 5: [] }
  };

  const handleAddChild = (newChild) => {
    setChildrenList((prev) => [...prev, newChild]);
    setActiveChildId(newChild.id);
  };

  // Estados para criação e edição de perfil (Gerido a nível de raiz para evitar bugs de Stacking Context)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupInputText, setBackupInputText] = useState("");
  const [backupError, setBackupError] = useState("");
  const [editingChild, setEditingChild] = useState(null);
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newClassroom, setNewClassroom] = useState("");
  const [newSchool, setNewSchool] = useState("");
  const [newAvatar, setNewAvatar] = useState("👦");
  const [newTheme, setNewTheme] = useState("lucas");

  const handleStartEditChild = (child) => {
    setEditingChild(child);
    setNewName(child.name);
    setNewSchool(child.school || "");
    setNewAvatar(child.avatar || "👦");
    setNewTheme(child.theme || "lucas");

    // Parse grade (e.g., "8° C")
    const match = (child.grade || "").match(/^(\d+)°\s*(.*)$/);
    if (match) {
      setNewYear(match[1]);
      setNewClassroom(match[2]);
    } else {
      setNewYear("");
      setNewClassroom("");
    }

    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setNewName("");
    setNewYear("");
    setNewClassroom("");
    setNewSchool("");
    setNewAvatar("👦");
    setNewTheme("lucas");
    setEditingChild(null);
    setShowAddModal(false);
  };

  const handleCreateChild = (e) => {
    e.preventDefault();
    if (!newName || !newYear || !newClassroom) return;
    
    const formattedGrade = `${newYear}° ${newClassroom.trim().toUpperCase()}`;

    if (editingChild) {
      // Editar perfil existente
      setChildrenList((prevList) =>
        prevList.map((c) =>
          c.id === editingChild.id
            ? {
                ...c,
                name: newName,
                grade: formattedGrade,
                school: newSchool.trim() || "Escola a definir",
                avatar: newAvatar,
                theme: newTheme,
              }
            : c
        )
      );
    } else {
      // Criar novo perfil
      const newChild = {
        id: newName.toLowerCase().trim().replace(/\s+/g, "-"),
        name: newName,
        grade: formattedGrade,
        school: newSchool.trim() || "Escola a definir",
        avatar: newAvatar,
        theme: newTheme,
        schedule: { 1: [], 2: [], 3: [], 4: [], 5: [] }
      };
      handleAddChild(newChild);
    }
    
    // Limpar estados e fechar
    handleCloseAddModal();
  };

  // Callback para excluir o perfil de um filho
  const handleDeleteChild = (childId) => {
    setChildrenList((prevList) => {
      const filtered = prevList.filter((child) => child.id !== childId);
      // Atualiza o perfil ativo caso o perfil excluído fosse o selecionado
      if (activeChildId === childId) {
        setActiveChildId(filtered[0]?.id || "");
      }
      return filtered;
    });
  };

  // Callback para limpar todo o horário da criança ativa (deixa a grelha em branco)
  const handleClearSchedule = () => {
    setChildrenList((prevList) =>
      prevList.map((child) => {
        if (child.id === activeChildId) {
          return {
            ...child,
            schedule: { 1: [], 2: [], 3: [], 4: [], 5: [] }
          };
        }
        return child;
      })
    );
  };

  // Estado para controlar a exibição do Modal de Importação de Horário
  const [showImportModal, setShowImportModal] = useState(false);

  // Callback ao importar com sucesso o horário analisado pela IA
  const handleImportSuccess = (childId, newSchedule) => {
    setChildrenList((prevList) =>
      prevList.map((child) => {
        if (child.id === childId) {
          return {
            ...child,
            schedule: newSchedule
          };
        }
        return child;
      })
    );
  };

  // Markup do Indicador Pull-to-Refresh Nativo (iOS / Android)
  const pullToRefreshIndicator = (pullDistance > 0 || refreshing) && (
    <div 
      style={{
        position: "fixed",
        top: `${Math.max(12, pullDistance - 20)}px`,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999999,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.25)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: Math.min(pullDistance / 50, 1),
        transition: refreshing ? "none" : "top 0.15s ease-out, opacity 0.15s ease-out"
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{
          width: "20px",
          height: "20px",
          color: refreshing ? "#10b981" : "#06b6d4",
          transform: `rotate(${pullDistance * 6.5}deg)`,
          animation: refreshing ? "spinPull 0.8s linear infinite" : "none",
          transition: refreshing ? "none" : "transform 0.1s linear"
        }}
      >
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
      
      <style>{`
        @keyframes spinPull {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Se não estiver autenticado, exibe o ecrã de Login/Registo
  if (!currentUser) {
    return (
      <>
        {pullToRefreshIndicator}
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="app-container">
      {pullToRefreshIndicator}
      {/* Seletor Superior de Perfil */}
      <ChildSelector
        childrenList={childrenList}
        activeChildId={activeChildId}
        onSelectChild={setActiveChildId}
        onOpenAddModal={() => setShowAddModal(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onDeleteChild={handleDeleteChild}
        onEditChild={handleStartEditChild}
        schoolYear={schoolYear}
        onEditSchoolYear={handleEditSchoolYear}
        onOpenBackupModal={() => setShowBackupModal(true)}
      />

      <div className="dashboard-grid">
        {/* Painel Central: Grelha Semanal de Horário (Largura Total) */}
        <ScheduleGrid
          activeChild={activeChild}
          onSelectClass={(classItem, dayName) => {
            setSelectedClass(classItem);
            setSelectedDayName(dayName);
          }}
          onOpenImportModal={() => setShowImportModal(true)}
          onClearSchedule={handleClearSchedule}
        />
      </div>

      {/* Modal de Detalhes da Disciplina Selecionada */}
      {selectedClass && (
        <ClassModal
          classItem={selectedClass}
          dayName={selectedDayName}
          onClose={() => setSelectedClass(null)}
        />
      )}

      {/* Modal de Importação de Horário via IA (Print/Ficheiro) */}
      {showImportModal && (
        <ImportScheduleModal
          activeChild={activeChild}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* Modal de Adicionar/Editar Perfil de Filho (Sobreposição Absoluta - z-index 999999) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: "400px" }}>
            <button className="modal-close" onClick={handleCloseAddModal}>×</button>
            <div className="modal-header">
              <h3 className="gradient-text" style={{ fontSize: "1.3rem" }}>
                {editingChild ? "Editar Perfil" : "Adicionar Perfil"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                {editingChild ? `Atualize o perfil de ${editingChild.name}` : "Crie um novo perfil para consultar horários"}
              </p>
            </div>
            
            <form onSubmit={handleCreateChild} className="modal-body" style={{ gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nome Completo do Filho</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Pedro Silva" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Ano Escolar (Número)</label>
                  <input 
                    type="number"
                    min="1"
                    max="12"
                    className="form-input" 
                    placeholder="Ex: 7" 
                    value={newYear} 
                    onChange={(e) => setNewYear(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Turma (Letra)</label>
                  <input 
                    type="text" 
                    maxLength="5"
                    className="form-input" 
                    placeholder="Ex: C" 
                    value={newClassroom} 
                    onChange={(e) => setNewClassroom(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nome da Escola</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Escola Secundária de Esmoriz" 
                  value={newSchool} 
                  onChange={(e) => setNewSchool(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Avatar</label>
                  <select 
                    className="form-select" 
                    value={newAvatar} 
                    onChange={(e) => setNewAvatar(e.target.value)}
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
                    value={newTheme} 
                    onChange={(e) => setNewTheme(e.target.value)}
                  >
                    <option value="lucas">Ciano & Esmeralda</option>
                    <option value="sofia">Violeta & Rosa</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem", width: "100%" }}>
                {editingChild ? "Guardar Alterações" : "Confirmar Perfil"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Cópia de Segurança / Importar e Exportar Dados */}
      {showBackupModal && (
        <div className="modal-overlay" style={{ zIndex: 999999 }}>
          <div className="glass-panel modal-content" style={{ maxWidth: "500px", width: "95vw" }}>
            <button className="modal-close" onClick={() => {
              setShowBackupModal(false);
              setBackupInputText("");
              setBackupError("");
            }}>×</button>
            <div className="modal-header">
              <h3 className="gradient-text" style={{ fontSize: "1.3rem" }}>
                💾 Cópia de Segurança & Migração
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
                Exporte ou cole dados de perfis e horários sem limites de tamanho.
              </p>
            </div>
            
            <div className="modal-body" style={{ gap: "1.2rem", marginTop: "0.5rem" }}>
              {/* Secção de Exportação */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>📋 Exportar Dados Atuais</label>
                <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
                  Copie o código abaixo para guardar uma cópia de segurança dos seus dados.
                </p>
                <textarea
                  readOnly
                  value={JSON.stringify(childrenList)}
                  onClick={(e) => e.target.select()}
                  style={{
                    width: "100%",
                    height: "80px",
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    color: "var(--color-text-secondary)",
                    padding: "8px",
                    resize: "none",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: "0.4rem", width: "100%", padding: "0.5rem", fontSize: "0.8rem" }}
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(childrenList));
                    alert("Cópia de segurança copiada para a Área de Transferência!");
                  }}
                >
                  Copiar Dados para Área de Transferência
                </button>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", my: "0.5rem" }} />

              {/* Secção de Importação */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "700" }}>📥 Importar / Colar Backup</label>
                <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
                  Cole o código de backup completo no campo abaixo para restaurar ou copiar dados para esta conta.
                </p>
                <textarea
                  placeholder="Cole aqui o texto completo de backup..."
                  value={backupInputText}
                  onChange={(e) => {
                    setBackupInputText(e.target.value);
                    setBackupError("");
                  }}
                  style={{
                    width: "100%",
                    height: "100px",
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    background: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    color: "var(--color-text-primary)",
                    padding: "8px",
                    resize: "vertical",
                    outline: "none"
                  }}
                />
                {backupError && (
                  <div style={{ color: "#f87171", fontSize: "0.72rem", marginTop: "0.3rem", fontWeight: "600" }}>
                    ❌ {backupError}
                  </div>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  style={{ 
                    marginTop: "0.5rem", 
                    width: "100%", 
                    padding: "0.6rem", 
                    fontSize: "0.85rem",
                    background: "var(--color-primary)",
                    fontWeight: "700"
                  }}
                  onClick={() => {
                    if (!backupInputText.trim()) {
                      setBackupError("O campo de colagem está vazio.");
                      return;
                    }
                    try {
                      const parsed = JSON.parse(backupInputText);
                      if (Array.isArray(parsed)) {
                        setChildrenList(parsed);
                        setShowBackupModal(false);
                        setBackupInputText("");
                        alert("Dados importados e aplicados com sucesso!");
                      } else {
                        setBackupError("Formato inválido. Certifique-se de que colou o conteúdo completo.");
                      }
                    } catch (e) {
                      setBackupError("Erro ao processar dados. O código pode estar incompleto ou corrompido.");
                    }
                  }}
                >
                  Confirmar e Importar Dados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
