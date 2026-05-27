import React, { useState, useEffect } from "react";

export default function ScheduleGrid({ activeChild, onSelectClass, onOpenImportModal }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  const daysOfWeek = [
    { index: 1, name: "Segunda", shortName: "Seg" },
    { index: 2, name: "Terça", shortName: "Ter" },
    { index: 3, name: "Quarta", shortName: "Qua" },
    { index: 4, name: "Quinta", shortName: "Qui" },
    { index: 5, name: "Sexta", shortName: "Sex" },
  ];

  // Identificar dia da semana atual (1-5), se for fim-de-semana, consideramos 1 (Segunda)
  const systemDay = currentTime.getDay(); 
  const isWeekend = systemDay === 0 || systemDay === 6;
  const activeDayIndex = isWeekend ? 1 : systemDay;

  const [selectedDayTab, setSelectedDayTab] = useState(activeDayIndex);

  // Sincroniza o seletor de dia mobile se a criança mudar ou o dia do sistema mudar
  useEffect(() => {
    setSelectedDayTab(activeDayIndex);
  }, [activeChild, activeDayIndex]);

  // Atualiza a hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Monitoriza o redimensionamento do ecrã para alternar o layout de forma fluida
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Slots de tempos extraídos de forma dinâmica a partir do horário ativo
  const allTimeSlots = React.useMemo(() => {
    if (!activeChild || !activeChild.schedule) return [];
    const slots = new Set();
    Object.values(activeChild.schedule).forEach((dayClasses) => {
      dayClasses.forEach((classItem) => {
        slots.add(classItem.time);
      });
    });

    // Ordenar os slots horários por hora de início
    return Array.from(slots).sort((a, b) => {
      const timeA = a.split(" - ")[0];
      const timeB = b.split(" - ")[0];
      return timeA.localeCompare(timeB);
    });
  }, [activeChild]);

  if (activeChild.id === "default") {
    return (
      <div className="glass-panel schedule-section" style={{ padding: "4rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
        <span style={{ fontSize: "3.5rem", display: "block", animation: "float 4s ease-in-out infinite" }}>👋</span>
        <h2 className="gradient-text" style={{ fontSize: "1.6rem", fontWeight: "800", margin: 0 }}>Bem-vindo ao Horário Escolar!</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto", lineHeight: "1.5" }}>
          Atualmente não tem nenhum perfil registado. Comece por clicar no botão <strong style={{ color: "var(--color-primary)", fontSize: "1.1rem" }}>＋</strong> no cabeçalho superior para adicionar o perfil do seu filho, indicar o ano escolar e a turma!
        </p>
        <div style={{ display: "inline-block", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px dashed var(--color-card-border)", fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>
          PWA Automática • Otimizado para iOS e Android
        </div>
      </div>
    );
  }

  // Verifica se o perfil ativo tem um horário em branco/vazio
  const isEmptySchedule = allTimeSlots.length === 0;

  if (isEmptySchedule) {
    return (
      <div className="glass-panel schedule-section animate-fade-in" style={{ padding: "4.5rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.2rem" }}>
        <span style={{ fontSize: "3.5rem", display: "block", animation: "float 4s ease-in-out infinite" }}>📅</span>
        <h2 className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: "800", margin: 0 }}>Horário em Branco para {activeChild.name}</h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.92rem", maxWidth: "480px", margin: "0 auto", lineHeight: "1.6" }}>
          Este perfil ainda não tem disciplinas nem horários registados. Pode preenchê-lo instantaneamente enviando um print ou foto do horário escolar!
        </p>
        
        <button 
          onClick={onOpenImportModal} 
          className="btn-primary glow-effect" 
          style={{ 
            padding: "0.75rem 1.8rem", 
            fontSize: "0.92rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            borderRadius: "12px", 
            border: "none", 
            cursor: "pointer", 
            fontWeight: "600",
            marginTop: "0.5rem"
          }}
        >
          <span>📤</span> Importar Horário (Print / Foto)
        </button>

        <div style={{ display: "inline-block", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px dashed var(--color-card-border)", fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
          Digitalização Inteligente via IA • Mapeamento automático de aulas
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel schedule-section" style={{ padding: "1.5rem" }}>
      <div className="schedule-header" style={{ marginBottom: isMobile ? "0.5rem" : "1.2rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📅</span> Horário — <span className="gradient-text">{activeChild.name}</span>
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
            {activeChild.grade} {isWeekend && "• (Modo Fim-de-Semana)"}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Botão de Re-importar na cabeceira */}
          <button
            onClick={onOpenImportModal}
            className="btn-import-header"
            title="Importar Novo Print de Horário"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--color-card-border)",
              color: "var(--color-text-primary)",
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.78rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "var(--transition-smooth)"
            }}
          >
            <span>📤</span> <span className="import-text-desktop">Importar Print</span>
          </button>

          <div className="current-time-badge">
            <span className="live-indicator"></span>
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>

      {isMobile ? (
        /* ==================== LAYOUT MOBILE (iOS e Android) ==================== */
        <div>
          {/* Seletor de Dia Mobile (Sem quebras de página ou wraps horizontais) */}
          <div className="mobile-day-tabs">
            {daysOfWeek.map((day) => (
              <button
                key={day.index}
                className={`mobile-day-tab ${selectedDayTab === day.index ? "active" : ""}`}
                onClick={() => setSelectedDayTab(day.index)}
              >
                {day.shortName}
              </button>
            ))}
          </div>

          {/* Lista Vertical de Disciplinas do Dia Selecionado */}
          <div className="mobile-class-list">
            {(() => {
              const activeDayClasses = activeChild.schedule[selectedDayTab] || [];
              const dayName = daysOfWeek.find(d => d.index === selectedDayTab)?.name || "Segunda";

              if (activeDayClasses.length === 0) {
                return (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-muted)" }}>
                    <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🏖️</span>
                    <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>Sem aulas agendadas</p>
                    <p style={{ fontSize: "0.75rem" }}>Este dia está livre para descanso ou estudo autónomo.</p>
                  </div>
                );
              }

              return allTimeSlots.map((slot) => {
                const classItem = activeDayClasses.find(c => c.time === slot);
                const isCurrent = classItem && isClassNow(selectedDayTab, slot);

                if (classItem) {
                  return (
                    <div
                      key={classItem.id}
                      className={`mobile-class-row glow-effect ${isCurrent ? "active" : ""}`}
                      onClick={() => onSelectClass(classItem, dayName)}
                      style={{
                        borderLeftColor: "var(--color-primary)",
                      }}
                    >
                      {/* Eixo da hora (Esquerda) */}
                      <div className="mobile-class-time">
                        <span style={{ color: "var(--color-text-primary)" }}>{slot.split(" - ")[0]}</span>
                        <span style={{ opacity: 0.4, fontWeight: "normal", fontSize: "0.65rem" }}>às</span>
                        <span style={{ color: "var(--color-text-primary)" }}>{slot.split(" - ")[1]}</span>
                      </div>
                      
                      {/* Conteúdo da aula (Direita) */}
                      <div className="mobile-class-details">
                        {isCurrent && <div className="mobile-indicator-badge">A decorrer agora</div>}
                        <div className="mobile-class-subject">{classItem.subject}</div>
                        <div className="mobile-class-meta">
                          <span>📍 {classItem.room || "Sala a definir"}</span>
                          {classItem.teacher && (
                            <>
                              <span>•</span>
                              <span>👤 {classItem.teacher.replace("Prof.ª ", "").replace("Prof. ", "")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Renderização discreta de intervalos para não sobrecarregar visualmente
                  return (
                    <div 
                      key={`empty-mobile-${selectedDayTab}-${slot}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0.5rem 1rem",
                        background: "rgba(255, 255, 255, 0.005)",
                        borderRadius: "8px",
                        border: "1px dashed rgba(255, 255, 255, 0.02)",
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)"
                      }}
                    >
                      <span style={{ width: "80px", fontWeight: "600" }}>{slot.split(" - ")[0]}</span>
                      <span>☕ Intervalo</span>
                    </div>
                  );
                }
              });
            })()}
          </div>
        </div>
      ) : (
        /* ==================== LAYOUT DESKTOP (Tabela Completa) ==================== */
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
                        {classItem.room && <span className="class-room">{classItem.room}</span>}
                      </div>
                    );
                  } else {
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
      )}
    </div>
  );
}
