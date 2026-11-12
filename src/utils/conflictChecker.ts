import { SchoolBooking, ShiftType } from '../types';

export interface ConflictCheckParams {
  date: string;
  shift: ShiftType;
  periods: number[];
  resourceIds: string[];
  spaceId?: string;
  excludeBookingId?: string;
  bookings: SchoolBooking[];
  resourceNameMap: Record<string, string>;
}

export interface ConflictItem {
  resourceId: string;
  resourceName: string;
  booking: SchoolBooking;
  conflictingPeriods: number[];
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictItem[];
  summaryMessage: string;
}

export function checkBookingConflicts(params: ConflictCheckParams): ConflictResult {
  const { date, shift, periods, resourceIds, spaceId, excludeBookingId, bookings, resourceNameMap } = params;

  // Active bookings on the same date and shift
  const activeBookings = bookings.filter((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.status === 'cancelled' || b.status === 'returned') return false;
    return b.date === date && b.shift === shift;
  });

  const conflicts: ConflictItem[] = [];

  // Check all requested resources (both equipments and space)
  const allRequestedItems = [...resourceIds];
  if (spaceId) {
    allRequestedItems.push(spaceId);
  }

  for (const booking of activeBookings) {
    // Check if periods overlap
    const overlappingPeriods = booking.periods.filter((p) => periods.includes(p));
    if (overlappingPeriods.length === 0) continue;

    // Check if any resource or space conflicts
    const bookingItems = [...booking.resourceIds];
    if (booking.spaceId) {
      bookingItems.push(booking.spaceId);
    }

    for (const resId of allRequestedItems) {
      if (bookingItems.includes(resId)) {
        conflicts.push({
          resourceId: resId,
          resourceName: resourceNameMap[resId] || 'Recurso',
          booking,
          conflictingPeriods: overlappingPeriods,
        });
      }
    }
  }

  if (conflicts.length === 0) {
    return {
      hasConflict: false,
      conflicts: [],
      summaryMessage: 'Horário e recursos totalmente disponíveis para agendamento.',
    };
  }

  const conflictingResourceNames = Array.from(new Set(conflicts.map((c) => c.resourceName))).join(', ');
  const teachersInvolved = Array.from(new Set(conflicts.map((c) => c.booking.teacherName))).join(', ');

  const summaryMessage = `Conflito detectado: ${conflictingResourceNames} já reservado(s) pelo(s) professor(es) ${teachersInvolved} nas aulas selecionadas.`;

  return {
    hasConflict: true,
    conflicts,
    summaryMessage,
  };
}
