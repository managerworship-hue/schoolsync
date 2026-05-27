import React from "react";

export default function ClassModal({ classItem, dayName, onClose }) {
  if (!classItem) return null;

  const getTeacherInitials = (name) => {
    if (!name) return "?";
    const parts = name.replace("Prof.ª ", "").replace("Prof. ", "").split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0] ? parts[0][0].toUpperCase() : "?";
  };

  const hasTeacher = !!classItem.teacher;
  const hasRoom = !!classItem.room;

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
          </div>
        </div>

        <div className="modal-body">
          {/* Informações do Professor */}
          <div>
            <h4 className="info-section-title">Docente Responsável</h4>
            <div className="teacher-card">
              <div className="teacher-avatar" style={{ background: hasTeacher ? "var(--color-primary)" : "rgba(255,255,255,0.05)", color: hasTeacher ? "white" : "var(--color-text-muted)" }}>
                {getTeacherInitials(classItem.teacher)}
              </div>
              <div className="teacher-details">
                <span className="teacher-name" style={{ color: hasTeacher ? "var(--color-text-primary)" : "var(--color-text-muted)", fontStyle: hasTeacher ? "normal" : "italic" }}>
                  {hasTeacher ? classItem.teacher : "Docente a identificar"}
                </span>
                {classItem.email && (
                  <span className="teacher-email">
                    <a href={`mailto:${classItem.email}`} style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                      {classItem.email}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
