import React, { useState, useEffect } from "react";
import ChildSelector from "./components/ChildSelector";
import ScheduleGrid from "./components/ScheduleGrid";
import ClassModal from "./components/ClassModal";
import AuthScreen from "./components/AuthScreen";
import ImportScheduleModal from "./components/ImportScheduleModal";
import { INITIAL_CHILDREN } from "./data/schoolData";

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
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao ler utilizador ativo do localStorage:", e);
    }
    return null; // Sem sessão iniciada por defeito
  });

  // Lista de filhos carregada dinamicamente com base no utilizador com sessão ativa
  const [childrenList, setChildrenList] = useState([]);
  const [activeChildId, setActiveChildId] = useState("");

  // Efeito para carregar a lista de filhos sempre que o utilizador ativo mudar
  useEffect(() => {
    if (!currentUser) {
      setChildrenList([]);
      setActiveChildId("");
      return;
    }

    const userChildrenKey = `schoolsync_children_user_${currentUser.id}`;
    let loadedChildren = null;

    try {
      // 1. Verificar se já existem dados guardados para este utilizador específico
      const saved = localStorage.getItem(userChildrenKey);
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          loadedChildren = parsed;
        }
      }

      // 2. Se for uma conta nova e não tiver dados, verificar se existem dados legados (migração)
      if (!loadedChildren) {
        const legacySaved = localStorage.getItem("schoolsync_children");
        if (legacySaved && legacySaved !== "undefined") {
          const parsedLegacy = JSON.parse(legacySaved);
          if (parsedLegacy.length > 0) {
            loadedChildren = parsedLegacy;
            console.log("SchoolSync: Migração de dados anteriores realizada com sucesso!");
            
            // Renomear a chave legado para evitar migrações repetidas no futuro
            localStorage.setItem("schoolsync_children_migrated", legacySaved);
            localStorage.removeItem("schoolsync_children");
          }
        }
      }
    } catch (e) {
      console.error("Erro ao ler dados de filhos no carregamento:", e);
    }

    // 3. Se ainda assim não houver nada, definir o estado inicial
    if (!loadedChildren) {
      if (currentUser.email === "l12johnsilva@gmail.com") {
        loadedChildren = INITIAL_CHILDREN;
      } else {
        loadedChildren = []; // Contas novas de outros utilizadores arrancarão em branco
      }
    }

    // 4. Apenas para o administrador l12johnsilva@gmail.com, sincronizamos os perfis padrão (INITIAL_CHILDREN) com o código
    let finalChildren = [...loadedChildren];
    if (currentUser.email === "l12johnsilva@gmail.com" && finalChildren.length > 0) {
      INITIAL_CHILDREN.forEach((initialChild) => {
        const index = finalChildren.findIndex((c) => c.id === initialChild.id);
        if (index !== -1) {
          // Atualiza horários e temas dos perfis padrão com a versão mais recente do código
          finalChildren[index] = initialChild;
        } else {
          // Garante que os perfis padrão estão sempre lá
          finalChildren.push(initialChild);
        }
      });
    }

    setChildrenList(finalChildren);
    setActiveChildId(finalChildren[0]?.id || "");
  }, [currentUser]);

  // Persistir alterações de filhos na chave específica do utilizador ativo
  useEffect(() => {
    if (!currentUser || childrenList.length === 0) return;

    try {
      const userChildrenKey = `schoolsync_children_user_${currentUser.id}`;
      localStorage.setItem(userChildrenKey, JSON.stringify(childrenList));
    } catch (e) {
      console.error("Erro ao gravar dados de filhos no localStorage:", e);
    }
  }, [childrenList, currentUser]);

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

  // Estados para criação de novo perfil (Gerido a nível de raiz para evitar bugs de Stacking Context)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newClassroom, setNewClassroom] = useState("");
  const [newAvatar, setNewAvatar] = useState("👦");
  const [newTheme, setNewTheme] = useState("lucas");

  const handleCreateChild = (e) => {
    e.preventDefault();
    if (!newName || !newYear || !newClassroom) return;
    
    const formattedGrade = `${newYear}° ${newClassroom.trim().toUpperCase()}`;
    const newChild = {
      id: newName.toLowerCase().trim().replace(/\s+/g, "-"),
      name: newName,
      grade: formattedGrade,
      avatar: newAvatar,
      theme: newTheme,
      schedule: { 1: [], 2: [], 3: [], 4: [], 5: [] }
    };

    handleAddChild(newChild);
    
    // Limpar estados
    setNewName("");
    setNewYear("");
    setNewClassroom("");
    setNewAvatar("👦");
    setNewTheme("lucas");
    setShowAddModal(false);
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

    // Se eliminarmos o último perfil, limpamos explicitamente o item de localStorage
    if (childrenList.length === 1) {
      try {
        const userChildrenKey = `schoolsync_children_user_${currentUser.id}`;
        localStorage.removeItem(userChildrenKey);
      } catch (e) {
        console.error("Erro ao remover chave de filhos do localStorage:", e);
      }
    }
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

      {/* Modal de Adicionar Perfil de Filho (Sobreposição Absoluta - z-index 999999) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: "400px" }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            <div className="modal-header">
              <h3 className="gradient-text" style={{ fontSize: "1.3rem" }}>Adicionar Perfil</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>Crie um novo perfil para consultar horários</p>
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
                Confirmar Perfil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
