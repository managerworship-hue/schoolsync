export const INITIAL_CHILDREN = [
  {
    id: "joao-pedro",
    name: "João Pedro",
    grade: "8° C",
    avatar: "👨‍🎓",
    theme: "lucas",
    schedule: {
      // 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta
      1: [
        { id: "jp-mat-1", subject: "Matemática", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "jp-ing-1", subject: "Inglês", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "jp-ing-2", subject: "Inglês", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "jp-por-1", subject: "Português", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "jp-por-2", subject: "Português", time: "12:00 - 13:00", room: "", teacher: "", email: "" }
      ],
      2: [
        { id: "jp-dta-1", subject: "DTA", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "jp-ef-1", subject: "Educação Física", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "jp-cn-1", subject: "Ciências Naturais", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "jp-fq-1", subject: "Física e Química", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "jp-mat-2", subject: "Matemática", time: "13:30 - 14:30", room: "", teacher: "", email: "" },
        { id: "jp-mat-3", subject: "Matemática", time: "14:30 - 15:30", room: "", teacher: "", email: "" }
      ],
      3: [
        { id: "jp-geo-1", subject: "Geografia", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "jp-geo-2", subject: "Geografia", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "jp-ing-3", subject: "Inglês", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "jp-por-3", subject: "Português", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "jp-por-4", subject: "Português", time: "12:00 - 13:00", room: "", teacher: "", email: "" }
      ],
      4: [
        { id: "jp-tic-1", subject: "TIC", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "jp-tic-2", subject: "TIC", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "jp-fra-1", subject: "Francês", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "jp-ev-1", subject: "Educação Visual", time: "13:30 - 14:30", room: "", teacher: "", email: "" },
        { id: "jp-ev-2", subject: "Educação Visual", time: "14:30 - 15:30", room: "", teacher: "", email: "" },
        { id: "jp-fq-2", subject: "Física e Química", time: "15:30 - 16:30", room: "", teacher: "", email: "" },
        { id: "jp-fq-3", subject: "Física e Química", time: "16:30 - 17:30", room: "", teacher: "", email: "" }
      ],
      5: [
        { id: "jp-ef-2", subject: "Educação Física", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "jp-ef-3", subject: "Educação Física", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "jp-mat-4", subject: "Matemática", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "jp-fra-2", subject: "Francês", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "jp-cn-2", subject: "Ciências Naturais", time: "13:30 - 14:30", room: "", teacher: "", email: "" },
        { id: "jp-cn-3", subject: "Ciências Naturais", time: "14:30 - 15:30", room: "", teacher: "", email: "" },
        { id: "jp-geo-3", subject: "Geografia", time: "15:30 - 16:30", room: "", teacher: "", email: "" },
        { id: "jp-geo-4", subject: "Geografia", time: "16:30 - 17:30", room: "", teacher: "", email: "" }
      ]
    }
  },
  {
    id: "maria-eduarda",
    name: "Maria Eduarda",
    grade: "11° A",
    avatar: "👩‍🎓",
    theme: "sofia",
    schedule: {
      1: [
        { id: "me-fil-1", subject: "Filosofia", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "me-fil-2", subject: "Filosofia", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "me-bg-1", subject: "Biologia e Geologia", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "me-bg-2", subject: "Biologia e Geologia", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "me-fq-1", subject: "Física e Química A", time: "13:00 - 14:00", room: "", teacher: "", email: "" },
        { id: "me-fq-2", subject: "Física e Química A", time: "14:00 - 15:00", room: "", teacher: "", email: "" },
        { id: "me-mat-1", subject: "Matemática A", time: "15:00 - 16:00", room: "", teacher: "", email: "" },
        { id: "me-cd-1", subject: "Cidadania e Desenvolvimento", time: "16:00 - 17:00", room: "", teacher: "", email: "" }
      ],
      2: [
        { id: "me-bg-3", subject: "Biologia e Geologia", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "me-bg-4", subject: "Biologia e Geologia", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "me-por-1", subject: "Português", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "me-por-2", subject: "Português", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "me-ing-1", subject: "Inglês", time: "13:00 - 14:00", room: "", teacher: "", email: "" },
        { id: "me-ef-1", subject: "Educação Física", time: "14:00 - 15:00", room: "", teacher: "", email: "" },
        { id: "me-fq-3", subject: "Física e Química A", time: "15:00 - 16:00", room: "", teacher: "", email: "" },
        { id: "me-fq-4", subject: "Física e Química A", time: "16:00 - 17:00", room: "", teacher: "", email: "" }
      ],
      3: [
        { id: "me-ef-2", subject: "Educação Física", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "me-ef-3", subject: "Educação Física", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "me-fq-5", subject: "Física e Química A", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "me-mat-2", subject: "Matemática A", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "me-mat-3", subject: "Matemática A", time: "12:00 - 13:00", room: "", teacher: "", email: "" }
      ],
      4: [
        { id: "me-por-3", subject: "Português", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "me-por-4", subject: "Português", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "me-mat-4", subject: "Matemática A", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "me-mat-5", subject: "Matemática A", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "me-bg-5", subject: "Biologia e Geologia", time: "12:00 - 13:00", room: "", teacher: "", email: "" },
        { id: "me-fil-3", subject: "Filosofia", time: "14:00 - 15:00", room: "", teacher: "", email: "" }
      ],
      5: [
        { id: "me-ing-2", subject: "Inglês", time: "08:00 - 09:00", room: "", teacher: "", email: "" },
        { id: "me-ing-3", subject: "Inglês", time: "09:00 - 10:00", room: "", teacher: "", email: "" },
        { id: "me-bg-6", subject: "Biologia e Geologia", time: "10:00 - 11:00", room: "", teacher: "", email: "" },
        { id: "me-bg-7", subject: "Biologia e Geologia", time: "11:00 - 12:00", room: "", teacher: "", email: "" },
        { id: "me-dt-1", subject: "Direção de Turma", time: "12:00 - 13:00", room: "", teacher: "", email: "" },
        { id: "me-fq-6", subject: "Física e Química A", time: "14:00 - 15:00", room: "", teacher: "", email: "" },
        { id: "me-fq-7", subject: "Física e Química A", time: "15:00 - 16:00", room: "", teacher: "", email: "" }
      ]
    }
  }
];
