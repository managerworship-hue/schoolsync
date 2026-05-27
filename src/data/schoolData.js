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
        { id: "jp-mat-1", subject: "Matemática", time: "08:00 - 09:00", room: "Sala A.74", teacher: "Prof. Carlos Neves", email: "carlos.neves@escola.pt" },
        { id: "jp-ing-1", subject: "Inglês", time: "09:00 - 10:00", room: "Sala A.74", teacher: "Prof.ª Maria Graça Rocha", email: "maria.rocha@escola.pt" },
        { id: "jp-ing-2", subject: "Inglês", time: "10:00 - 11:00", room: "Sala A.74", teacher: "Prof.ª Maria Graça Rocha", email: "maria.rocha@escola.pt" },
        { id: "jp-por-1", subject: "Português", time: "11:00 - 12:00", room: "Sala A.74", teacher: "Prof.ª Fernanda Barbosa", email: "fernanda.barbosa@escola.pt" },
        { id: "jp-por-2", subject: "Português", time: "12:00 - 13:00", room: "Sala A.74", teacher: "Prof.ª Fernanda Barbosa", email: "fernanda.barbosa@escola.pt" }
      ],
      2: [
        { id: "jp-dta-1", subject: "DTA", time: "08:00 - 09:00", room: "Sala A.74", teacher: "Prof.ª Ana Castro", email: "ana.castro@escola.pt" },
        { id: "jp-ef-1", subject: "Educação Física", time: "09:00 - 10:00", room: "Ginásio A.GIN3", teacher: "Prof. Ricardo Santos", email: "ricardo.santos@escola.pt" },
        { id: "jp-cn-1", subject: "Ciências Naturais", time: "10:00 - 11:00", room: "Sala A.62", teacher: "Prof.ª Isabel Abreu", email: "isabel.abreu@escola.pt" },
        { id: "jp-fq-1", subject: "Física e Química", time: "11:00 - 12:00", room: "Sala A.45", teacher: "Prof.ª Rosa Pais", email: "rosa.pais@escola.pt" },
        { id: "jp-mat-2", subject: "Matemática", time: "13:30 - 14:30", room: "Sala A.74", teacher: "Prof. Carlos Neves", email: "carlos.neves@escola.pt" },
        { id: "jp-mat-3", subject: "Matemática", time: "14:30 - 15:30", room: "Sala A.74", teacher: "Prof. Carlos Neves", email: "carlos.neves@escola.pt" }
      ],
      3: [
        { id: "jp-geo-1", subject: "Geografia", time: "08:00 - 09:00", room: "Sala A.74", teacher: "Prof.ª Carla Silva", email: "carla.silva@escola.pt" },
        { id: "jp-geo-2", subject: "Geografia", time: "09:00 - 10:00", room: "Sala A.74", teacher: "Prof.ª Carla Silva", email: "carla.silva@escola.pt" },
        { id: "jp-ing-3", subject: "Inglês", time: "10:00 - 11:00", room: "Sala A.74", teacher: "Prof.ª Maria Graça Rocha", email: "maria.rocha@escola.pt" },
        { id: "jp-por-3", subject: "Português", time: "11:00 - 12:00", room: "Sala A.74", teacher: "Prof.ª Fernanda Barbosa", email: "fernanda.barbosa@escola.pt" },
        { id: "jp-por-4", subject: "Português", time: "12:00 - 13:00", room: "Sala A.74", teacher: "Prof.ª Fernanda Barbosa", email: "fernanda.barbosa@escola.pt" }
      ],
      4: [
        { id: "jp-tic-1", subject: "TIC", time: "09:00 - 10:00", room: "Sala A.16", teacher: "Prof. Nelson Costa", email: "nelson.costa@escola.pt" },
        { id: "jp-tic-2", subject: "TIC", time: "10:00 - 11:00", room: "Sala A.16", teacher: "Prof. Nelson Costa", email: "nelson.costa@escola.pt" },
        { id: "jp-fra-1", subject: "Francês", time: "11:00 - 12:00", room: "Sala A.74", teacher: "Prof.ª Helena Fonseca", email: "helena.fonseca@escola.pt" },
        { id: "jp-ev-1", subject: "Educação Visual", time: "13:30 - 14:30", room: "Sala A.21", teacher: "Prof. João Silva", email: "joao.silva@escola.pt" },
        { id: "jp-ev-2", subject: "Educação Visual", time: "14:30 - 15:30", room: "Sala A.21", teacher: "Prof. João Silva", email: "joao.silva@escola.pt" },
        { id: "jp-fq-2", subject: "Física e Química", time: "15:30 - 16:30", room: "Sala A.74", teacher: "Prof.ª Rosa Pais", email: "rosa.pais@escola.pt" },
        { id: "jp-fq-3", subject: "Física e Química", time: "16:30 - 17:30", room: "Sala A.74", teacher: "Prof.ª Rosa Pais", email: "rosa.pais@escola.pt" }
      ],
      5: [
        { id: "jp-ef-2", subject: "Educação Física", time: "08:00 - 09:00", room: "Ginásio A.GIN1", teacher: "Prof. Ricardo Santos", email: "ricardo.santos@escola.pt" },
        { id: "jp-ef-3", subject: "Educação Física", time: "09:00 - 10:00", room: "Ginásio A.GIN1", teacher: "Prof. Ricardo Santos", email: "ricardo.santos@escola.pt" },
        { id: "jp-mat-4", subject: "Matemática", time: "10:00 - 11:00", room: "Sala A.74", teacher: "Prof. Carlos Neves", email: "carlos.neves@escola.pt" },
        { id: "jp-fra-2", subject: "Francês", time: "11:00 - 12:00", room: "Sala A.74", teacher: "Prof.ª Helena Fonseca", email: "helena.fonseca@escola.pt" },
        { id: "jp-cn-2", subject: "Ciências Naturais", time: "13:30 - 14:30", room: "Sala A.74", teacher: "Prof.ª Isabel Abreu", email: "isabel.abreu@escola.pt" },
        { id: "jp-cn-3", subject: "Ciências Naturais", time: "14:30 - 15:30", room: "Sala A.74", teacher: "Prof.ª Isabel Abreu", email: "isabel.abreu@escola.pt" },
        { id: "jp-geo-3", subject: "Geografia", time: "15:30 - 16:30", room: "Sala A.74", teacher: "Prof.ª Carla Silva", email: "carla.silva@escola.pt" },
        { id: "jp-geo-4", subject: "Geografia", time: "16:30 - 17:30", room: "Sala A.74", teacher: "Prof.ª Carla Silva", email: "carla.silva@escola.pt" }
      ]
    }
  }
];
