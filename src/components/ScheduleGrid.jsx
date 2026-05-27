import React, { useState, useEffect } from "react";

export default function ScheduleGrid({ activeChild, onSelectClass }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Atualiza a hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const daysOfWeek = [
    { index: 1, name: "Segunda" },
    { index: 2, name: "Terça" },
    { index: 3, name: "Quarta" },
    { index: 4, name: "Quinta" },
    { index: 5, name: "Sexta" },
  ];

  // Identificar dia da semana atual (1-5), se for fim-de-semana, consideramos 1 (Segunda) para exibição mas sem marcar como aula ativa
  const systemDay = currentTime.getDay(); 
  const isWeekend = systemDay === 0 || systemDay === 6;
  const activeDayIndex = isWeekend ? 1 : systemDay;

  // Formata hora do sistema para exibição
  const formattedTime = currentTime.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Função para verificar se a aula está a decorrer agora
  const isClassNow = (dayIndex, timeRange) => {
    if (isWeekend) return false;
    if (systemDay !== dayIndex) return false;

    try {
      const [startStr, endStr] = timeRange.split(" - ");
      const [startH, startM] = startStr.split(":").map(Number);
      const [endH, endM] = endStr.split(":").map(Number);

      const currentH = currentTime.getHours();
      const currentM = currentTime.getMinutes();

      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;
      const currentTotal = currentH * 60 + currentM;

      return currentTotal >= startTotal && currentTotal <= endTotal;
    } catch (e) {
      return false;
    }
  };

  // Obter todos os slots horários únicos ordenados para o eixo Y do calendário
  const allTimeSlots = [
    "08:30 - 09:20",
    "09:25 - 10:15",
    "10:30 - 11:20",
    "11:25 - 12:15",
    "13:30 - 14:20",
    "14:25 - 15:15"
  ];

  return (
    <div className="glass-panel schedule-section" style={{ padding: "1.5rem" }}>
      <div className="schedule-header">
        <div>
          <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📅</span> Horário Semanal — <span className="gradient-text">{activeChild.name}</span>
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
            {activeChild.grade} {isWeekend && "• (Modo Fim-de-Semana)"}
          </p>
        </div>

        <div className="current-time-badge">
          <span className="live-indicator"></span>
          <span>{formattedTime}</span>
        </div>
      </div>

      <div className="timetable-container">
        {/* Eixo do Tempo (Esquerda) */}
        <div className="time-axis">
          {allTimeSlots.map((slot) => (
            <div key={slot} className="time-marker">
              {slot.split(" - ")[0]}
            </div>
          ))}
        </div>

        {/* Colunas dos Dias da Semana */}
        {daysOfWeek.map((day) => {
          const dayClasses = activeChild.schedule[day.index] || [];
          const isToday = systemDay === day.index;

          return (
            <div 
              key={day.index} 
              className={`day-column ${isToday ? "active-day" : ""}`}
            >
              <div className="day-title">{day.name}</div>
              
              {/* Mapeia as aulas programadas nos slots oficiais */}
              {allTimeSlots.map((slot) => {
                const classItem = dayClasses.find(c => c.time === slot);
                const isCurrent = classItem && isClassNow(day.index, slot);

                if (classItem) {
                  return (
                    <div
                      key={classItem.id}
                      className={`class-card glow-effect ${isCurrent ? "current-class" : ""}`}
                      onClick={() => onSelectClass(classItem, day.name)}
                      style={{
                        borderLeftColor: "var(--color-primary)",
                      }}
                    >
                      <span className="class-subject">{classItem.subject}</span>
                      <span className="class-time">{classItem.time}</span>
                      <span className="class-room">{classItem.room}</span>
                    </div>
                  );
                } else {
                  // Renderiza um bloco vazio estilizado caso não haja aula no slot
                  return (
                    <div 
                      key={`empty-${day.index}-${slot}`} 
                      className="class-card" 
                      style={{ 
                        opacity: 0.15, 
                        borderLeft: "4px solid transparent", 
                        cursor: "default",
                        pointerEvents: "none" 
                      }}
                    >
                      <span className="class-subject" style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Intervalo</span>
                    </div>
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
