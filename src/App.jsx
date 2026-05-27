import React, { useState, useEffect } from "react";
import ChildSelector from "./components/ChildSelector";
import ScheduleGrid from "./components/ScheduleGrid";
import ClassModal from "./components/ClassModal";
import { INITIAL_CHILDREN } from "./data/schoolData";

export default function App() {
  // Inicialização de estado carregando de forma ultra-segura do localStorage (evita crashes no iOS PWA/Private Mode)
  const [childrenList, setChildrenList] = useState(() => {
    try {
      const saved = localStorage.getItem("schoolsync_children");
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed; // Se houver perfis ativos, mantém
      }
    } catch (e) {
      console.error("Erro ao ler children do localStorage:", e);
    }
    return INITIAL_CHILDREN; // Se estiver vazio (como no arranque ou após reset), carrega os novos dados reais
  });

  const [activeChildId, setActiveChildId] = useState(() => {
    return childrenList[0]?.id || "";
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDayName, setSelectedDayName] = useState("");

  // Persistir crianças sempre que alteradas
  useEffect(() => {
    try {
      localStorage.setItem("schoolsync_children", JSON.stringify(childrenList));
    } catch (e) {
      console.error("Erro ao gravar children no localStorage:", e);
    }
  }, [childrenList]);

  // Atualizar tema de cor no body dinamicamente com salvaguarda
  useEffect(() => {
    const activeChild = childrenList.find((c) => c.id === activeChildId);
    if (activeChild && activeChild.theme) {
      document.body.setAttribute("data-theme", activeChild.theme);
    }
  }, [activeChildId, childrenList]);

  // Garantia absoluta de que activeChild nunca é nulo ou indefinido para evitar ecrã preto no React
  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0] || {
    id: "default",
    name: "Estudante",
    grade: "2025/2026",
    theme: "lucas",
    schedule: { 1: [], 2: [], 3: [], 4: [], 5: [] }
  };

  // Manipulador para adicionar Novo Filho
  const handleAddChild = (newChild) => {
    setChildrenList((prev) => [...prev, newChild]);
    setActiveChildId(newChild.id);
  };

  return (
    <div className="app-container">
      {/* Seletor Superior de Perfil */}
      <ChildSelector
        childrenList={childrenList}
        activeChildId={activeChildId}
        onSelectChild={setActiveChildId}
        onAddChild={handleAddChild}
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
