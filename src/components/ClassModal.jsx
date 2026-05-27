import React, { useState } from "react";

export default function ClassModal({ classItem, dayName, childTasks, onClose, onAddTask }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState("tpc");
  const [dueDate, setDueDate] = useState("");

  if (!classItem) return null;

  const subjectTasks = childTasks.filter(t => t.subject.toLowerCase() === classItem.subject.toLowerCase());

  const handleSubmitTask = (e) => {
    e.preventDefault();
    if (!taskTitle || !dueDate) return;

    onAddTask({
      subject: classItem.subject,
      title: taskTitle,
      type: taskType,
      dueDate,
      completed: false
    });

    setTaskTitle("");
    setDueDate("");
  };

  const getTeacherInitials = (name) => {
    const parts = name.replace("Prof.ª ", "").replace("Prof. ", "").split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0] ? parts[0][0].toUpperCase() : "P";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <span className="task-tag" style={{ marginBottom: "0.5rem", display: "inline-block" }}>
            {dayName}
          </span>
          <h2 className="modal-subject gradient-text">{classItem.subject}</h2>
          <div className="modal-time-place">
            <span>⏰ {classItem.time}</span>
            <span>📍 {classItem.room}</span>
          </div>
        </div>

        <div className="modal-body">
          {/* Informações do Professor */}
          <div>
            <h4 className="info-section-title">Docente Responsável</h4>
            <div className="teacher-card">
              <div className="teacher-avatar">
                {getTeacherInitials(classItem.teacher)}
              </div>
              <div className="teacher-details">
                <span className="teacher-name">{classItem.teacher}</span>
                <span className="teacher-email">
                  <a href={`mailto:${classItem.email}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                    {classItem.email}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Tarefas e Testes Associados */}
          <div>
            <h4 className="info-section-title">Tarefas & Avaliações Pendentes ({subjectTasks.length})</h4>
            {subjectTasks.length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", italic: "true" }}>
                Sem trabalhos de casa ou testes pendentes para esta disciplina.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                {subjectTasks.map(task => (
                  <div key={task.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "between",
                    padding: "0.6rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.04)"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", flex: 1 }}>
                      <span style={{ fontSize: "0.8rem", textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "var(--color-text-muted)" : "var(--color-text-primary)", fontWeight: "500" }}>
                        {task.title}
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>
                        Limite: {task.dueDate}
                      </span>
                    </div>
                    <span className={`task-tag ${task.type}`} style={{ fontSize: "0.6rem", padding: "1px 4px" }}>
                      {task.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adicionar Nova Tarefa Rápida */}
          <div style={{ borderTop: "1px solid var(--color-card-border)", paddingTop: "1rem" }}>
            <h4 className="info-section-title">Registar Nova Tarefa</h4>
            
            <form onSubmit={handleSubmitTask} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Resolver exercícios pág 42..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />

              <div className="form-row">
                <div className="form-group">
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
                
                <div className="form-group">
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                ＋ Adicionar à Agenda
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
