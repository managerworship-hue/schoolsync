export const INITIAL_CHILDREN = [
  {
    id: "lucas",
    name: "Lucas Silva",
    grade: "7º Ano - Turma B",
    avatar: "👦",
    theme: "lucas",
    schedule: {
      // 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta
      1: [
        { id: "l-mat-1", subject: "Matemática", time: "08:30 - 09:20", room: "Sala 12", teacher: "Prof. Alberto Santos", email: "alberto.santos@escola.pt" },
        { id: "l-mat-2", subject: "Matemática", time: "09:25 - 10:15", room: "Sala 12", teacher: "Prof. Alberto Santos", email: "alberto.santos@escola.pt" },
        { id: "l-ing-1", subject: "Inglês", time: "10:30 - 11:20", room: "Sala 8", teacher: "Prof.ª Clara Sousa", email: "clara.sousa@escola.pt" },
        { id: "l-cie-1", subject: "Ciências Naturais", time: "11:25 - 12:15", room: "Laboratório 1", teacher: "Prof.ª Rita Lima", email: "rita.lima@escola.pt" },
        { id: "l-por-1", subject: "Português", time: "13:30 - 14:20", room: "Sala 5", teacher: "Prof.ª Fernanda Costa", email: "fernanda.costa@escola.pt" },
        { id: "l-his-1", subject: "História", time: "14:25 - 15:15", room: "Sala 10", teacher: "Prof. João Pires", email: "joao.pires@escola.pt" }
      ],
      2: [
        { id: "l-ef-1", subject: "Educação Física", time: "08:30 - 09:20", room: "Ginásio B", teacher: "Prof. Nelson Rocha", email: "nelson.rocha@escola.pt" },
        { id: "l-ef-2", subject: "Educação Física", time: "09:25 - 10:15", room: "Ginásio B", teacher: "Prof. Nelson Rocha", email: "nelson.rocha@escola.pt" },
        { id: "l-por-2", subject: "Português", time: "10:30 - 11:20", room: "Sala 5", teacher: "Prof.ª Fernanda Costa", email: "fernanda.costa@escola.pt" },
        { id: "l-geo-1", subject: "Geografia", time: "11:25 - 12:15", room: "Sala 14", teacher: "Prof.ª Maria Neves", email: "maria.neves@escola.pt" },
        { id: "l-tic-1", subject: "TIC", time: "13:30 - 14:20", room: "Sala Informática 2", teacher: "Prof.ª Carla Simões", email: "carla.simoes@escola.pt" },
        { id: "l-tic-2", subject: "TIC", time: "14:25 - 15:15", room: "Sala Informática 2", teacher: "Prof.ª Carla Simões", email: "carla.simoes@escola.pt" }
      ],
      3: [
        { id: "l-mat-3", subject: "Matemática", time: "08:30 - 09:20", room: "Sala 12", teacher: "Prof. Alberto Santos", email: "alberto.santos@escola.pt" },
        { id: "l-cie-2", subject: "Ciências Naturais", time: "09:25 - 10:15", room: "Laboratório 1", teacher: "Prof.ª Rita Lima", email: "rita.lima@escola.pt" },
        { id: "l-his-2", subject: "História", time: "10:30 - 11:20", room: "Sala 10", teacher: "Prof. João Pires", email: "joao.pires@escola.pt" },
        { id: "l-por-3", subject: "Português", time: "11:25 - 12:15", room: "Sala 5", teacher: "Prof.ª Fernanda Costa", email: "fernanda.costa@escola.pt" }
      ],
      4: [
        { id: "l-ing-2", subject: "Inglês", time: "08:30 - 09:20", room: "Sala 8", teacher: "Prof.ª Clara Sousa", email: "clara.sousa@escola.pt" },
        { id: "l-ing-3", subject: "Inglês", time: "09:25 - 10:15", room: "Sala 8", teacher: "Prof.ª Clara Sousa", email: "clara.sousa@escola.pt" },
        { id: "l-cie-3", subject: "Ciências Naturais", time: "10:30 - 11:20", room: "Laboratório 1", teacher: "Prof.ª Rita Lima", email: "rita.lima@escola.pt" },
        { id: "l-mat-4", subject: "Matemática", time: "11:25 - 12:15", room: "Sala 12", teacher: "Prof. Alberto Santos", email: "alberto.santos@escola.pt" },
        { id: "l-geo-2", subject: "Geografia", time: "13:30 - 14:20", room: "Sala 14", teacher: "Prof.ª Maria Neves", email: "maria.neves@escola.pt" }
      ],
      5: [
        { id: "l-por-4", subject: "Português", time: "08:30 - 09:20", room: "Sala 5", teacher: "Prof.ª Fernanda Costa", email: "fernanda.costa@escola.pt" },
        { id: "l-por-5", subject: "Português", time: "09:25 - 10:15", room: "Sala 5", teacher: "Prof.ª Fernanda Costa", email: "fernanda.costa@escola.pt" },
        { id: "l-his-3", subject: "História", time: "10:30 - 11:20", room: "Sala 10", teacher: "Prof. João Pires", email: "joao.pires@escola.pt" },
        { id: "l-geo-3", subject: "Geografia", time: "11:25 - 12:15", room: "Sala 14", teacher: "Prof.ª Maria Neves", email: "maria.neves@escola.pt" },
        { id: "l-ef-3", subject: "Educação Física", time: "13:30 - 14:20", room: "Bloco Desportivo", teacher: "Prof. Nelson Rocha", email: "nelson.rocha@escola.pt" }
      ]
    }
  },
  {
    id: "sofia",
    name: "Sofia Silva",
    grade: "10º Ano - Ciências e Tecnologias",
    avatar: "👧",
    theme: "sofia",
    schedule: {
      1: [
        { id: "s-fq-1", subject: "Física e Química A", time: "08:30 - 09:20", room: "Sala 21", teacher: "Prof.ª Helena Martins", email: "helena.martins@escola.pt" },
        { id: "s-fq-2", subject: "Física e Química A", time: "09:25 - 10:15", room: "Sala 21", teacher: "Prof.ª Helena Martins", email: "helena.martins@escola.pt" },
        { id: "s-mat-1", subject: "Matemática A", time: "10:30 - 11:20", room: "Sala 24", teacher: "Prof. Rui Brandão", email: "rui.brandao@escola.pt" },
        { id: "s-por-1", subject: "Português", time: "11:25 - 12:15", room: "Sala 17", teacher: "Prof.ª Teresa Barbosa", email: "teresa.barbosa@escola.pt" },
        { id: "s-bg-1", subject: "Biologia e Geologia", time: "13:30 - 14:20", room: "Laboratório 2", teacher: "Prof. Carlos Ribeiro", email: "carlos.ribeiro@escola.pt" },
        { id: "s-fil-1", subject: "Filosofia", time: "14:25 - 15:15", room: "Sala 19", teacher: "Prof.ª Luísa Castro", email: "luisa.castro@escola.pt" }
      ],
      2: [
        { id: "s-bg-2", subject: "Biologia e Geologia", time: "08:30 - 09:20", room: "Laboratório 2", teacher: "Prof. Carlos Ribeiro", email: "carlos.ribeiro@escola.pt" },
        { id: "s-bg-3", subject: "Biologia e Geologia", time: "09:25 - 10:15", room: "Laboratório 2", teacher: "Prof. Carlos Ribeiro", email: "carlos.ribeiro@escola.pt" },
        { id: "s-mat-2", subject: "Matemática A", time: "10:30 - 11:20", room: "Sala 24", teacher: "Prof. Rui Brandão", email: "rui.brandao@escola.pt" },
        { id: "s-fil-2", subject: "Filosofia", time: "11:25 - 12:15", room: "Sala 19", teacher: "Prof.ª Luísa Castro", email: "luisa.castro@escola.pt" },
        { id: "s-ef-1", subject: "Educação Física", time: "13:30 - 14:20", room: "Campo Exterior", teacher: "Prof.ª Sofia Pereira", email: "sofia.pereira@escola.pt" },
        { id: "s-ef-2", subject: "Educação Física", time: "14:25 - 15:15", room: "Campo Exterior", teacher: "Prof.ª Sofia Pereira", email: "sofia.pereira@escola.pt" }
      ],
      3: [
        { id: "s-fq-3", subject: "Física e Química A", time: "08:30 - 09:20", room: "Laboratório Química", teacher: "Prof.ª Helena Martins", email: "helena.martins@escola.pt" },
        { id: "s-fq-4", subject: "Física e Química A", time: "09:25 - 10:15", room: "Laboratório Química", teacher: "Prof.ª Helena Martins", email: "helena.martins@escola.pt" },
        { id: "s-por-2", subject: "Português", time: "10:30 - 11:20", room: "Sala 17", teacher: "Prof.ª Teresa Barbosa", email: "teresa.barbosa@escola.pt" },
        { id: "s-mat-3", subject: "Matemática A", time: "11:25 - 12:15", room: "Sala 24", teacher: "Prof. Rui Brandão", email: "rui.brandao@escola.pt" }
      ],
      4: [
        { id: "s-mat-4", subject: "Matemática A", time: "08:30 - 09:20", room: "Sala 24", teacher: "Prof. Rui Brandão", email: "rui.brandao@escola.pt" },
        { id: "s-mat-5", subject: "Matemática A", time: "09:25 - 10:15", room: "Sala 24", teacher: "Prof. Rui Brandão", email: "rui.brandao@escola.pt" },
        { id: "s-por-3", subject: "Português", time: "10:30 - 11:20", room: "Sala 17", teacher: "Prof.ª Teresa Barbosa", email: "teresa.barbosa@escola.pt" },
        { id: "s-fil-3", subject: "Filosofia", time: "11:25 - 12:15", room: "Sala 19", teacher: "Prof.ª Luísa Castro", email: "luisa.castro@escola.pt" },
        { id: "s-bg-4", subject: "Biologia e Geologia", time: "13:30 - 14:20", room: "Laboratório 2", teacher: "Prof. Carlos Ribeiro", email: "carlos.ribeiro@escola.pt" }
      ],
      5: [
        { id: "s-fq-5", subject: "Física e Química A", time: "08:30 - 09:20", room: "Sala 21", teacher: "Prof.ª Helena Martins", email: "helena.martins@escola.pt" },
        { id: "s-por-4", subject: "Português", time: "09:25 - 10:15", room: "Sala 17", teacher: "Prof.ª Teresa Barbosa", email: "teresa.barbosa@escola.pt" },
        { id: "s-mat-6", subject: "Matemática A", time: "10:30 - 11:20", room: "Sala 24", teacher: "Prof. Rui Brandão", email: "rui.brandao@escola.pt" },
        { id: "s-ef-3", subject: "Educação Física", time: "11:25 - 12:15", room: "Pavilhão Gimnodesportivo", teacher: "Prof.ª Sofia Pereira", email: "sofia.pereira@escola.pt" }
      ]
    }
  }
];

export const INITIAL_TASKS = [
  { id: "t1", childId: "lucas", subject: "Matemática", title: "Ficha de trabalho de Álgebra", type: "tpc", dueDate: "2026-05-29", completed: false },
  { id: "t2", childId: "lucas", subject: "História", title: "Mini-teste sobre Descobrimentos", type: "teste", dueDate: "2026-06-01", completed: false },
  { id: "t3", childId: "lucas", subject: "Inglês", title: "Ler capítulo 4 do livro", type: "tpc", dueDate: "2026-05-28", completed: true },
  { id: "t4", childId: "sofia", subject: "Matemática A", title: "Ficha de Geometria no Espaço", type: "tpc", dueDate: "2026-05-29", completed: false },
  { id: "t5", childId: "sofia", subject: "Física e Química A", title: "Relatório da atividade laboratorial de calorimetria", type: "trabalho", dueDate: "2026-06-02", completed: false },
  { id: "t6", childId: "sofia", subject: "Biologia e Geologia", title: "Teste Global do 3º Período", type: "teste", dueDate: "2026-06-04", completed: false }
];
