import React, { useState, useEffect } from "react";
import ChildSelector from "./components/ChildSelector";
import ScheduleGrid from "./components/ScheduleGrid";
import ClassModal from "./components/ClassModal";
import AuthScreen from "./components/AuthScreen";
import ImportScheduleModal from "./components/ImportScheduleModal";
import { INITIAL_CHILDREN } from "./data/schoolData";

export default function App() {
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

  // Se não estiver autenticado, exibe o ecrã de Login/Registo
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Seletor Superior de Perfil */}
      <ChildSelector
        childrenList={childrenList}
        activeChildId={activeChildId}
        onSelectChild={setActiveChildId}
        onAddChild={handleAddChild}
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
    </div>
  );
}
