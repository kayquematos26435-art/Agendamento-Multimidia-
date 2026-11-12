import { ShiftType, BookingStatus, ResourceCategory, ResourceCondition } from '../types';

export const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: 'Matutino (Manhã)',
  afternoon: 'Vespertino (Tarde)',
  night: 'Noturno (Noite)',
};

export const SHIFT_SHORT_LABELS: Record<ShiftType, string> = {
  morning: 'Matutino',
  afternoon: 'Vespertino',
  night: 'Noturno',
};

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  projector: 'Projetores / Datashow',
  audio: 'Sons & Microfones',
  computer: 'Informática & TVs',
  space: 'Salas & Espaços',
  accessory: 'Cabos & Conectividade',
  robotics: 'Robótica & Maker',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendente de Aprovação',
  in_use: 'Em Uso (Retirado)',
  returned: 'Devolvido / Concluído',
  cancelled: 'Cancelado',
};

export const CONDITION_LABELS: Record<ResourceCondition, string> = {
  excellent: 'Excelente (Novo/Revisado)',
  good: 'Bom estado de conservação',
  needs_attention: 'Requer atenção/manutenção',
};

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateExtensive(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getWeekDays(centerDate: Date = new Date()): { date: string; label: string; dayName: string; isToday: boolean }[] {
  const current = new Date(centerDate);
  const day = current.getDay();
  // We want Monday (1) to Friday (5), or Monday to Saturday
  const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diffToMonday));

  const days = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const fullDayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    days.push({
      date: dateStr,
      label: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
      dayName: dayNames[i],
      fullDayName: fullDayNames[i],
      isToday: dateStr === todayStr,
    });
  }

  return days;
}
