import React, { useState } from "react";

export default function TaskPlanner({ activeChild, childTasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState("tpc");
  const [dueDate, setDueDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Obter disciplinas exclusivas da criança de forma dinâmica a partir do horário
  const childSubjects = React.useMemo(() => {
    if (!activeChild || !activeChild.schedule) return [];
    const subjects = new Set();
    Object.values(activeChild.schedule).forEach(dayClasses => {
      dayClasses.forEach(classItem => {
        subjects.add(classItem.subject);
      });
    });
    return Array.from(subjects).sort();
  }, [activeChild]);

  // Define disciplina inicial por defeito
  React.useEffect(() => {
    if (childSubjects.length > 0) {
      setSelectedSubject(childSubjects[0]);
    }
  }, [childSubjects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle || !dueDate || !selectedSubject) return;

    onAddTask({
      subject: selectedSubject,
      title: taskTitle,
      type: taskType,
      dueDate,
      completed: false
    });

    setTaskTitle("");
    setDueDate("");
  };

  // Ordenar tarefas: por fazer primeiro, seguidas pelas concluídas
  const sortedTasks = [...childTasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="glass-panel planner-section" style={{ padding: "1.5rem" }}>
      <div className="planner-header">
        <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>📝</span> Planeador de Tarefas
        </h2>
        <span className="current-time-badge" style={{ fontSize: "0.75rem" }}>
          {childTasks.filter(t => !t.completed).length} Pendentes
        </span>
      </div>

      {/* Lista de Tarefas */}
      <div className="task-list">
        {sortedTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--color-text-muted)" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🎉</span>
            <p style={{ fontSize: "0.85rem", fontWeight: "500" }}>Tudo em dia!</p>
            <p style={{ fontSize: "0.75rem" }}>Nenhum teste ou TPC pendente de momento.</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
              <div className="task-left">
                <div 
                  className="task-checkbox glow-effect" 
                  onClick={() => onToggleTask(task.id)}
                />
                <div className="task-content">
                  <span className="task-title">{task.title}</span>
                  <div className="task-meta">
                    <span className={`task-tag ${task.type}`}>{task.type}</span>
                    <span>•</span>
                    <span style={{ color: "var(--color-primary)", fontWeight: "500" }}>{task.subject}</span>
                    <span>•</span>
                    <span className="task-due">📅 {task.dueDate}</span>
                  </div>
                </div>
              </div>
              <button 
                className="task-delete-btn"
                onClick={() => onDeleteTask(task.id)}
                title="Eliminar Tarefa"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Formulário Rápido de Adição */}
      <div style={{ borderTop: "1px solid var(--color-card-border)", paddingTop: "1.2rem", marginTop: "0.5rem" }}>
        <h3 style={{ fontSize: "0.95rem", marginBottom: "0.8rem", color: "var(--color-text-secondary)" }}>
          Nova Tarefa / Avaliação
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Resolver ficha de preparação..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Disciplina</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {childSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              >
                <option value="tpc">TPC</option>
                <option value="trabalho">Trabalho</option>
                <option value="teste">Teste / Exame</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Data de Entrega / Realização</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.2rem" }}>
            Criar Lembrete
          </button>
        </form>
      </div>
    </div>
  );
}
