import React, { useState, useEffect } from "react";
import ChildSelector from "./components/ChildSelector";
import ScheduleGrid from "./components/ScheduleGrid";
import TaskPlanner from "./components/TaskPlanner";
import ClassModal from "./components/ClassModal";
import { INITIAL_CHILDREN, INITIAL_TASKS } from "./data/schoolData";

export default function App() {
  // Inicialização de estado carregando do localStorage se existir
  const [childrenList, setChildrenList] = useState(() => {
    const saved = localStorage.getItem("schoolsync_children");
    return saved ? JSON.parse(saved) : INITIAL_CHILDREN;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("schoolsync_tasks");
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [activeChildId, setActiveChildId] = useState(() => {
    return childrenList[0]?.id || "";
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDayName, setSelectedDayName] = useState("");

  // Persistir crianças e tarefas sempre que alteradas
  useEffect(() => {
    localStorage.setItem("schoolsync_children", JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem("schoolsync_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Atualizar tema de cor no body dinamicamente
  useEffect(() => {
    const activeChild = childrenList.find((c) => c.id === activeChildId);
    if (activeChild) {
      document.body.setAttribute("data-theme", activeChild.theme);
    }
  }, [activeChildId, childrenList]);

  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];
  const activeChildTasks = tasks.filter((t) => t.childId === activeChildId);

  // Manipuladores de estado para Tarefas
  const handleAddTask = (newTaskData) => {
    const newTask = {
      ...newTaskData,
      id: "task-" + Date.now(),
      childId: activeChildId,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
        {/* Painel Esquerdo: Grelha Semanal de Horário */}
        <ScheduleGrid
          activeChild={activeChild}
          onSelectClass={(classItem, dayName) => {
            setSelectedClass(classItem);
            setSelectedDayName(dayName);
          }}
        />

        {/* Painel Direito: Planeador de Tarefas e Testes */}
        <TaskPlanner
          activeChild={activeChild}
          childTasks={activeChildTasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>

      {/* Modal de Detalhes da Disciplina Selecionada */}
      {selectedClass && (
        <ClassModal
          classItem={selectedClass}
          dayName={selectedDayName}
          childTasks={activeChildTasks}
          onClose={() => setSelectedClass(null)}
          onAddTask={(newTaskData) => {
            handleAddTask(newTaskData);
            // Mantemos o modal aberto para que o utilizador veja a lista atualizada
          }}
        />
      )}
    </div>
  );
}
