import React from "react";

export default function ClassModal({ classItem, dayName, onClose }) {
  if (!classItem) return null;

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
        </div>
      </div>
    </div>
  );
}
