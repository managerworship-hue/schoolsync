import React, { useState, useEffect } from "react";
import ChildSelector from "./components/ChildSelector";
import ScheduleGrid from "./components/ScheduleGrid";
import ClassModal from "./components/ClassModal";
import AuthScreen from "./components/AuthScreen";
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

    // 3. Se ainda assim não houver nada, usar os dados padrão (INITIAL_CHILDREN) como template
    if (!loadedChildren) {
      loadedChildren = INITIAL_CHILDREN;
    }

    // 4. Garantir sincronização dos dados padrão (INITIAL_CHILDREN) com atualizações mais recentes do código
    const merged = [...loadedChildren];
    INITIAL_CHILDREN.forEach((initialChild) => {
      const index = merged.findIndex((c) => c.id === initialChild.id);
      if (index !== -1) {
        // Atualiza horários e temas dos perfis padrão
        merged[index] = initialChild;
      } else {
        // Garante que os perfis padrão estão sempre lá
        merged.push(initialChild);
      }
    });

    setChildrenList(merged);
    setActiveChildId(merged[0]?.id || "");
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
      />

      <div className="dashboard-grid">
        {/* Painel Central: Grelha Semanal de Horário (Largura Total) */}
        <ScheduleGrid
          activeChild={activeChild}
          onSelectClass={(classItem, dayName) => {
            setSelectedClass(classItem);
            setSelectedDayName(dayName);
          }}
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
    </div>
  );
}
