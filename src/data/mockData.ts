import { MultimediaResource, ClassPeriod, SchoolBooking, SchoolConfig, ShiftType } from '../types';

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  schoolName: 'Colégio Estadual Cívico-Militar Professor José Carneiro de Brito',
  inepCode: '17001859',
  cityState: 'Tocantinópolis - TO',
  labResponsible: 'Coordenadoria de Mídias e Tecnologia Educacional',
  autoApprove: true,
};

export const DEFAULT_PERIODS: ClassPeriod[] = [
  // Matutino
  { periodNumber: 1, shift: 'morning', startTime: '07:15', endTime: '08:05', label: '1ª Aula (07:15 - 08:05)' },
  { periodNumber: 2, shift: 'morning', startTime: '08:05', endTime: '08:55', label: '2ª Aula (08:05 - 08:55)' },
  { periodNumber: 3, shift: 'morning', startTime: '08:55', endTime: '09:45', label: '3ª Aula (08:55 - 09:45)' },
  { periodNumber: 4, shift: 'morning', startTime: '10:00', endTime: '10:50', label: '4ª Aula (10:00 - 10:50)' },
  { periodNumber: 5, shift: 'morning', startTime: '10:50', endTime: '11:40', label: '5ª Aula (10:50 - 11:40)' },
  // Vespertino
  { periodNumber: 1, shift: 'afternoon', startTime: '13:00', endTime: '13:50', label: '1ª Aula (13:00 - 13:50)' },
  { periodNumber: 2, shift: 'afternoon', startTime: '13:50', endTime: '14:40', label: '2ª Aula (13:50 - 14:40)' },
  { periodNumber: 3, shift: 'afternoon', startTime: '14:40', endTime: '15:30', label: '3ª Aula (14:40 - 15:30)' },
  { periodNumber: 4, shift: 'afternoon', startTime: '15:45', endTime: '16:35', label: '4ª Aula (15:45 - 16:35)' },
  { periodNumber: 5, shift: 'afternoon', startTime: '16:35', endTime: '17:25', label: '5ª Aula (16:35 - 17:25)' },
  // Noturno
  { periodNumber: 1, shift: 'night', startTime: '19:00', endTime: '19:45', label: '1ª Aula (19:00 - 19:45)' },
  { periodNumber: 2, shift: 'night', startTime: '19:45', endTime: '20:30', label: '2ª Aula (19:45 - 20:30)' },
  { periodNumber: 3, shift: 'night', startTime: '20:45', endTime: '21:30', label: '3ª Aula (20:45 - 21:30)' },
  { periodNumber: 4, shift: 'night', startTime: '21:30', endTime: '22:15', label: '4ª Aula (21:30 - 22:15)' },
];

export const INITIAL_RESOURCES: MultimediaResource[] = [
  // Espaços e Salas
  {
    id: 'res-esp-sala-aula',
    name: 'Sala de Aula',
    category: 'space',
    patrimonyNumber: 'ESP-2024-011',
    brandModel: 'Sala de Aula Regular / Ambiente Pedagógico',
    location: 'Bloco de Aulas',
    specs: 'Carteiras individuais, lousa branca, pontos de tomada elétrica e ambiente arejado.',
    condition: 'excellent',
    isSpace: true,
    capacity: 40,
    status: 'available',
    notes: 'Espaço para aulas convencionais e atividades curriculares com apoio multimídia.',
  },
  {
    id: 'res-esp-biblioteca',
    name: 'Biblioteca',
    category: 'space',
    patrimonyNumber: 'ESP-2024-012',
    brandModel: 'Biblioteca e Centro de Pesquisa Escolar',
    location: 'Bloco Pedagógico - Térreo',
    specs: 'Mesas coletivas para estudo, acervo literário e didático, ambiente silencioso e climatizado.',
    condition: 'excellent',
    isSpace: true,
    capacity: 50,
    status: 'available',
    notes: 'Ideal para pesquisas orientadas, círculos de leitura e seminários bibliográficos.',
  },
  {
    id: 'res-esp-labin',
    name: 'Laboratório de Informática (LabIn)',
    category: 'space',
    patrimonyNumber: 'ESP-2023-002',
    brandModel: 'Laboratório Educacional ProInfo',
    location: 'Bloco B - 1º Andar',
    specs: '32 computadores conectados à internet banda larga, lousa branca e ambiente climatizado.',
    condition: 'good',
    isSpace: true,
    capacity: 35,
    status: 'available',
    notes: 'Acesso controlado com chave na coordenação pedagógica.',
  },
  {
    id: 'res-esp-patio',
    name: 'Pátio Escolar',
    category: 'space',
    patrimonyNumber: 'ESP-2024-010',
    brandModel: 'Área Ampla de Convivência e Eventos',
    location: 'Área Central Coberta',
    specs: 'Espaço para grandes atividades, assembleias, projetos ao ar livre, gincanas e apresentações culturais.',
    condition: 'excellent',
    isSpace: true,
    capacity: 250,
    status: 'available',
    notes: 'Ponto de energia disponível próximo às arquibancadas e ao palco.',
  },

  // Equipamentos Multimídia: Projetores / Data Shows
  {
    id: 'res-proj-datashow-01',
    name: 'Data Show 01 (Projetor Epson)',
    category: 'projector',
    patrimonyNumber: 'TOMBO-2024-101',
    brandModel: 'Epson PowerLite X49 (3600 Lumens)',
    location: 'Armário A - Sala de Tecnologia',
    specs: 'Resolução XGA 3600 Lumens, conexões HDMI, VGA e USB, acompanha controle remoto, cabo HDMI e maleta.',
    condition: 'excellent',
    isSpace: false,
    status: 'available',
    notes: 'Excelente nitidez para projeção em sala de aula iluminada.',
  },
  {
    id: 'res-proj-datashow-02',
    name: 'Data Show 02 (Projetor BenQ)',
    category: 'projector',
    patrimonyNumber: 'TOMBO-2024-102',
    brandModel: 'BenQ MW560 WXGA (4000 Lumens)',
    location: 'Armário A - Sala de Tecnologia',
    specs: 'Alto brilho WXGA, 2 portas HDMI, saída de áudio P2, acompanha bolsa de transporte e extensões.',
    condition: 'excellent',
    isSpace: false,
    status: 'available',
    notes: 'Ideal para apresentações e exibição de vídeos.',
  },

  // Equipamentos de Áudio & Som
  {
    id: 'res-aud-frahm',
    name: 'Caixa de Som Amplificada',
    category: 'audio',
    patrimonyNumber: 'TOMBO-2023-205',
    brandModel: 'Frahm Connect 300W Bluetooth/Aux',
    location: 'Bancada B - Sala de Tecnologia',
    specs: 'Bateria recarregável interna (duração 4h), Bluetooth 5.0, entrada P10 e auxiliar P2.',
    condition: 'excellent',
    isSpace: false,
    status: 'available',
  },
  {
    id: 'res-aud-mic',
    name: 'Kit Microfones Sem Fio',
    category: 'audio',
    patrimonyNumber: 'TOMBO-2024-032',
    brandModel: 'Dylan U-300 Pro UHF Duplo',
    location: 'Estojo Preto 02 - Gaveta de Áudio',
    specs: '2 microfones de mão sem fio, base receptora bivolt, pilhas recarregáveis e cabo P10.',
    condition: 'excellent',
    isSpace: false,
    status: 'available',
  },

  // Computadores & Dispositivos Móveis
  {
    id: 'res-comp-chromebooks',
    name: 'Carrinho de Chromebooks Educacionais',
    category: 'computer',
    patrimonyNumber: 'TOMBO-2024-500',
    brandModel: 'Carrinho de Recarga Móvel c/ 30 Chromebooks Samsung',
    location: 'Sala de Tecnologia - Tranca Eletrônica',
    specs: '30 Chromebooks com ChromeOS integrado ao Google Sala de Aula, conexão Wi-Fi dedicada.',
    condition: 'excellent',
    isSpace: false,
    status: 'available',
  },
  {
    id: 'res-comp-tv',
    name: 'Smart TV 65" 4K em Suporte Pedestal Móvel',
    category: 'computer',
    patrimonyNumber: 'TOMBO-2024-009',
    brandModel: 'LG UHD ThinQ AI 65" c/ Suporte com Rodinhas',
    location: 'Corredor Central - Estação Multimídia',
    specs: 'Espelhamento sem fio (AirPlay/Miracast), YouTube, Wi-Fi 5GHz e 3 portas HDMI.',
    condition: 'excellent',
    isSpace: false,
    status: 'available',
  },
];

// Helper to get formatted dates relative to today
const getRelativeDate = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

export const INITIAL_BOOKINGS: SchoolBooking[] = [
  // Hoje - Matutino
  {
    id: 'book-001',
    teacherName: 'Prof. Carlos Eduardo Silva',
    discipline: 'Matemática e Geometria',
    gradeClass: '13.01',
    date: getRelativeDate(0),
    shift: 'morning',
    periods: [1, 2],
    resourceIds: ['res-proj-datashow-01'],
    spaceId: 'res-esp-sala-aula',
    pedagogicalGoal: 'Uso do Data Show na Sala de Aula com software GeoGebra projetado para aula prática sobre Geometria Espacial.',
    status: 'in_use',
    checkedOutAt: new Date(Date.now() - 3600000).toISOString(),
    checkedOutBy: 'Mariana (Monitora de Mídias)',
    createdDate: getRelativeDate(-2),
  },
  {
    id: 'book-002',
    teacherName: 'Profa. Mariana Costa',
    discipline: 'História do Brasil',
    gradeClass: '33.01',
    date: getRelativeDate(0),
    shift: 'morning',
    periods: [3, 4],
    resourceIds: ['res-aud-frahm', 'res-aud-mic'],
    spaceId: 'res-esp-patio', // Pátio Escolar
    pedagogicalGoal: 'Seminário temático e apresentações culturais dos alunos no Pátio Escolar com amplificação de som.',
    status: 'confirmed',
    createdDate: getRelativeDate(-3),
  },
  // Hoje - Vespertino
  {
    id: 'book-003',
    teacherName: 'Prof. André Santos',
    discipline: 'Biologia e Meio Ambiente',
    gradeClass: '62.01',
    date: getRelativeDate(0),
    shift: 'afternoon',
    periods: [2, 3],
    resourceIds: ['res-comp-chromebooks'],
    spaceId: 'res-esp-biblioteca', // Biblioteca
    pedagogicalGoal: 'Pesquisa orientada com Chromebooks e acervo bibliográfico na Biblioteca sobre o Bioma Cerrado.',
    status: 'confirmed',
    createdDate: getRelativeDate(-1),
  },
  // Amanhã - Matutino
  {
    id: 'book-004',
    teacherName: 'Profa. Juliana Lima',
    discipline: 'Língua Portuguesa e Literatura',
    gradeClass: '14.01',
    date: getRelativeDate(1),
    shift: 'morning',
    periods: [2, 3],
    resourceIds: ['res-comp-tv'],
    spaceId: 'res-esp-sala-aula',
    pedagogicalGoal: 'Exibição da adaptação audiovisual da obra "O Cortiço" na Sala de Aula com debate estético e social subsequente.',
    status: 'confirmed',
    createdDate: getRelativeDate(-1),
  },
  // Amanhã - Vespertino
  {
    id: 'book-005',
    teacherName: 'Prof. Ricardo Mendes',
    discipline: 'Redação',
    gradeClass: '82.01',
    date: getRelativeDate(1),
    shift: 'afternoon',
    periods: [3, 4, 5],
    resourceIds: ['res-comp-chromebooks'],
    spaceId: 'res-esp-labin', // LabIn
    pedagogicalGoal: 'Oficina de produção textual dissertativo-argumentativa com pesquisa de repertório sociocultural nos Chromebooks.',
    status: 'confirmed',
    createdDate: getRelativeDate(-2),
  },
  // Depois de amanhã
  {
    id: 'book-006',
    teacherName: 'Profa. Patrícia Alencar',
    discipline: 'Química Geral',
    gradeClass: '23.01',
    date: getRelativeDate(2),
    shift: 'morning',
    periods: [4, 5],
    resourceIds: ['res-proj-datashow-02'],
    spaceId: 'res-esp-labin', // LabIn
    pedagogicalGoal: 'Simulação virtual PhET de reações químicas com projeção em tela ampla no LabIn.',
    status: 'confirmed',
    createdDate: getRelativeDate(-1),
  },
  // Histórico concluído
  {
    id: 'book-007',
    teacherName: 'Prof. Lucas Ferreira',
    discipline: 'Física',
    gradeClass: '34.01',
    date: getRelativeDate(-1),
    shift: 'morning',
    periods: [1, 2],
    resourceIds: ['res-aud-frahm'],
    spaceId: 'res-esp-patio',
    pedagogicalGoal: 'Demonstração experimental sobre Acústica, Frequências Sonoras e Propagação de Ondas no Pátio.',
    status: 'returned',
    checkedOutAt: new Date(Date.now() - 86400000 - 3600000).toISOString(),
    checkedOutBy: 'Mariana (Monitora)',
    returnedAt: new Date(Date.now() - 86400000).toISOString(),
    returnNotes: 'Equipamento devolvido em perfeito estado com carregador conferido.',
    createdDate: getRelativeDate(-4),
  },
];

export const SUGGESTED_DISCIPLINES = [
  'Língua Portuguesa',
  'Redação',
  'Matemática',
  'História',
  'Geografia',
  'Biologia / Ciências',
  'Física',
  'Química',
  'Língua Inglesa',
  'Artes',
  'Educação Física',
  'Filosofia / Sociologia',
];

// Turmas Matutino (conforme matriz escolar)
export const MORNING_CLASSES = [
  '13.01',
  '13.02',
  '23.01',
  '33.01',
  '14.01',
  '24.01',
  '34.01',
];

// Turmas Vespertino (conforme matriz escolar)
export const AFTERNOON_CLASSES = [
  '62.01',
  '62.02',
  '72.01',
  '82.01',
  '92.01',
];

// Turmas Noturno
export const NIGHT_CLASSES = [
  'Turma EJA - Noite',
  '13.03 - Noturno',
];

export const SHIFT_CLASSES: Record<ShiftType, string[]> = {
  morning: MORNING_CLASSES,
  afternoon: AFTERNOON_CLASSES,
  night: NIGHT_CLASSES,
};

export const SUGGESTED_CLASSES = [
  ...MORNING_CLASSES,
  ...AFTERNOON_CLASSES,
  ...NIGHT_CLASSES,
];

