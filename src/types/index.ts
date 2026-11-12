export type ResourceCategory = 
  | 'projector' 
  | 'audio' 
  | 'computer' 
  | 'space' 
  | 'accessory' 
  | 'robotics';

export type ResourceStatus = 'available' | 'in_use' | 'maintenance' | 'reserved';

export type ResourceCondition = 'excellent' | 'good' | 'needs_attention';

export interface MultimediaResource {
  id: string;
  name: string;
  category: ResourceCategory;
  patrimonyNumber: string; // Ex: SED-2024-041 (Tombo escolar)
  brandModel: string;
  location: string; // Ex: Armário Multimídia 01, Bloco A
  specs: string; // Ex: 3800 Lumens, HDMI/VGA, Full HD
  condition: ResourceCondition;
  isSpace: boolean; // Se é uma sala ou um equipamento móvel
  capacity?: number; // Para salas/espaços
  status: ResourceStatus;
  notes?: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface ClassPeriod {
  periodNumber: number; // 1 to 5
  shift: ShiftType;
  startTime: string; // "07:15"
  endTime: string;   // "08:05"
  label: string;     // "1ª Aula (07:15 - 08:05)"
}

export type BookingStatus = 'confirmed' | 'pending' | 'in_use' | 'returned' | 'cancelled';

export interface SchoolBooking {
  id: string;
  teacherName: string;
  discipline: string;
  gradeClass: string; // Ex: "13.01", "62.01"
  date: string; // YYYY-MM-DD
  shift: ShiftType;
  periods: number[]; // Ex: [1, 2]
  resourceIds: string[]; // Equipamentos selecionados
  spaceId?: string; // Sala específica (opcional, senão sala regular da turma)
  pedagogicalGoal: string; // Ex: "Exibição do documentário Vidas Secas e debate sociológico"
  status: BookingStatus;
  checkedOutAt?: string; // ISO string
  checkedOutBy?: string; // Responsável pela entrega
  returnedAt?: string;   // ISO string
  returnNotes?: string;  // Checklist / observações de conservação
  createdDate: string;
}

export interface SchoolConfig {
  schoolName: string;
  inepCode: string;
  cityState: string;
  labResponsible: string;
  autoApprove: boolean;
}
