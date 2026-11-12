import React, { useState, useMemo } from 'react';
import { SchoolBooking, MultimediaResource, ShiftType, ClassPeriod } from '../types';
import {
  SHIFT_LABELS,
  formatDateBR,
  formatDateExtensive,
  getWeekDays,
  CATEGORY_LABELS,
} from '../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Laptop,
  CheckCircle2,
  FileText,
  Trash2,
  Edit,
  ArrowUpRight,
} from 'lucide-react';

interface TimetableGridProps {
  bookings: SchoolBooking[];
  resources: MultimediaResource[];
  periods: ClassPeriod[];
  onOpenNewBooking: (date?: string, shift?: ShiftType, period?: number, resourceId?: string) => void;
  onSelectBookingForReceipt: (booking: SchoolBooking) => void;
  onEditBooking: (booking: SchoolBooking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onUpdateBookingStatus: (bookingId: string, newStatus: SchoolBooking['status']) => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  bookings,
  resources,
  periods,
  onOpenNewBooking,
  onSelectBookingForReceipt,
  onEditBooking,
  onDeleteBooking,
  onUpdateBookingStatus,
}) => {
  // Current viewing date anchor (defaults to today)
  const [currentCenterDate, setCurrentCenterDate] = useState<Date>(new Date());
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<string>('all');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<SchoolBooking | null>(null);

  const weekDays = useMemo(() => getWeekDays(currentCenterDate), [currentCenterDate]);

  // Navigate week
  const handlePrevWeek = () => {
    const next = new Date(currentCenterDate);
    next.setDate(next.getDate() - 7);
    setCurrentCenterDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentCenterDate);
    next.setDate(next.getDate() + 7);
    setCurrentCenterDate(next);
  };

  const handleGoToday = () => {
    setCurrentCenterDate(new Date());
  };

  // Periods for the selected shift
  const shiftPeriods = useMemo(() => {
    return periods.filter((p) => p.shift === selectedShift);
  }, [periods, selectedShift]);

  // Lookup resource by ID
  const resourceMap = useMemo(() => {
    const map = new Map<string, MultimediaResource>();
    resources.forEach((r) => map.set(r.id, r));
    return map;
  }, [resources]);

  // Filter bookings according to active filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (b.shift !== selectedShift) return false;
      if (selectedResourceFilter !== 'all') {
        const matchesEquip = b.resourceIds.includes(selectedResourceFilter);
        const matchesSpace = b.spaceId === selectedResourceFilter;
        if (!matchesEquip && !matchesSpace) return false;
      }
      return true;
    });
  }, [bookings, selectedShift, selectedResourceFilter]);

  // Helper to find bookings for a specific day and class period
  const getBookingsForCell = (dateStr: string, periodNum: number) => {
    return filteredBookings.filter(
      (b) => b.date === dateStr && b.periods.includes(periodNum)
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Week Date Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Semana Atual (Hoje)
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
              title="Próxima semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs font-medium text-slate-500 ml-2">
              Período: <strong className="text-slate-800">{weekDays[0].label}</strong> até{' '}
              <strong className="text-slate-800">{weekDays[weekDays.length - 1].label}</strong>
            </span>
          </div>

          {/* Shift Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['morning', 'afternoon', 'night'] as ShiftType[]).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedShift(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedShift === st
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'morning' ? '☀️ Matutino' : st === 'afternoon' ? '⛅ Vespertino' : '🌙 Noturno'}
              </button>
            ))}
          </div>

          {/* Resource Filter Dropdown & New Booking Button */}
          <div className="flex items-center gap-3">
            <select
              value={selectedResourceFilter}
              onChange={(e) => setSelectedResourceFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">Todos os Recursos Multimídia</option>
              <optgroup label="Salas e Espaços">
                {resources
                  .filter((r) => r.isSpace)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Equipamentos Multimídia">
                {resources
                  .filter((r) => !r.isSpace)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </optgroup>
            </select>

            <button
              onClick={() => onOpenNewBooking()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Recurso</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Timetable Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[850px]">
            {/* Table Header: Week Days */}
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                <th className="p-3 w-32 border-r border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Aulas / Horários
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.date}
                    className={`p-3 border-r border-slate-200 text-center last:border-r-0 ${
                      day.isToday ? 'bg-indigo-50/70' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-slate-600 uppercase">
                        {day.dayName}
                      </span>
                      <span
                        className={`text-sm font-extrabold mt-0.5 ${
                          day.isToday ? 'text-indigo-600' : 'text-slate-900'
                        }`}
                      >
                        {day.label}
                      </span>
                      {day.isToday && (
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                          Hoje
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Shift Periods */}
            <tbody className="divide-y divide-slate-200">
              {shiftPeriods.map((period) => (
                <tr key={period.periodNumber} className="hover:bg-slate-50/40 transition-colors">
                  {/* Period Time Column */}
                  <td className="p-3 bg-slate-50 border-r border-slate-200 align-top">
                    <div className="font-bold text-xs text-slate-900">
                      {period.periodNumber}ª Aula
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {period.startTime} - {period.endTime}
                    </div>
                  </td>

                  {/* Day Columns */}
                  {weekDays.map((day) => {
                    const cellBookings = getBookingsForCell(day.date, period.periodNumber);

                    return (
                      <td
                        key={day.date}
                        className={`p-2 border-r border-slate-200 last:border-r-0 align-top min-h-[90px] ${
                          day.isToday ? 'bg-indigo-50/15' : ''
                        }`}
                      >
                        {cellBookings.length > 0 ? (
                          <div className="space-y-1.5">
                            {cellBookings.map((b) => {
                              const spaceObj = b.spaceId ? resourceMap.get(b.spaceId) : null;
                              const equipObjs = b.resourceIds
                                .map((id) => resourceMap.get(id))
                                .filter(Boolean) as MultimediaResource[];

                              const isFirstPeriodOfBooking = b.periods[0] === period.periodNumber;

                              return (
                                <div
                                  key={b.id}
                                  onClick={() => setSelectedBookingDetails(b)}
                                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-md ${
                                    b.status === 'in_use'
                                      ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
                                      : b.status === 'returned'
                                      ? 'bg-slate-50 border-slate-200 opacity-70'
                                      : 'bg-indigo-50/80 border-indigo-200 hover:border-indigo-300'
                                  }`}
                                >
                                  {/* Teacher & Class */}
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="font-bold text-slate-900 leading-tight">
                                      {b.teacherName}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {b.status === 'in_use' && (
                                        <span className="text-[10px] text-amber-700 font-bold">
                                          Em Uso
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (
                                            window.confirm(
                                              `Deseja excluir o agendamento de "${b.teacherName}" (${b.gradeClass})? Os recursos e horários serão liberados.`
                                            )
                                          ) {
                                            onDeleteBooking(b.id);
                                          }
                                        }}
                                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Excluir agendamento"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                                    {b.gradeClass} · {b.discipline}
                                  </div>

                                  {/* Space or Equipments */}
                                  <div className="mt-1 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                                    {spaceObj ? (
                                      <div className="font-medium text-indigo-950">
                                        📍 {spaceObj.name}
                                      </div>
                                    ) : null}
                                    {equipObjs.length > 0 && (
                                      <div className="line-clamp-1 text-slate-600">
                                        ⚡ {equipObjs.map((e) => e.name.split(' (')[0]).join(', ')}
                                      </div>
                                    )}
                                  </div>

                                  {b.periods.length > 1 && isFirstPeriodOfBooking && (
                                    <div className="text-[10px] text-slate-400 mt-1">
                                      Aula dupla ({b.periods.join('ª e ')}ª)
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Empty Time Slot */
                          <button
                            type="button"
                            onClick={() =>
                              onOpenNewBooking(
                                day.date,
                                selectedShift,
                                period.periodNumber,
                                selectedResourceFilter !== 'all' ? selectedResourceFilter : undefined
                              )
                            }
                            className="w-full h-full min-h-[64px] border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all group cursor-pointer p-2"
                            title="Clique para agendar recurso nesta aula"
                          >
                            <Plus className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                              Livre / Agendar
                            </span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Drawer / Modal */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400">
                  Agendamento #{selectedBookingDetails.id.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedBookingDetails.teacherName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">Componente & Turma:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedBookingDetails.discipline}
                  </span>
                  <div className="text-slate-600 font-medium">
                    {selectedBookingDetails.gradeClass}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Data & Aulas:</span>
                  <span className="font-bold text-slate-900">
                    {formatDateBR(selectedBookingDetails.date)} ({SHIFT_LABELS[selectedBookingDetails.shift]})
                  </span>
                  <div className="text-slate-600">
                    {selectedBookingDetails.periods.map((p) => `${p}ª Aula`).join(', ')}
                  </div>
                </div>
              </div>

              {/* Local & Equipamentos */}
              <div>
                <span className="text-slate-500 block text-[11px] mb-1 font-semibold uppercase">
                  Espaço e Equipamentos Vinculados:
                </span>
                <div className="space-y-1.5">
                  {selectedBookingDetails.spaceId ? (
                    <div className="p-2 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        📍 {resourceMap.get(selectedBookingDetails.spaceId)?.name || 'Espaço Solicitado'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {resourceMap.get(selectedBookingDetails.spaceId)?.patrimonyNumber}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md border border-slate-200 text-slate-600">
                      Sala Comum da Turma ({selectedBookingDetails.gradeClass})
                    </div>
                  )}

                  {selectedBookingDetails.resourceIds.map((resId) => {
                    const res = resourceMap.get(resId);
                    if (!res) return null;
                    return (
                      <div
                        key={res.id}
                        className="p-2 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-800">⚡ {res.name}</div>
                          <div className="text-[10px] text-slate-500">{res.specs}</div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 shrink-0">
                          {res.patrimonyNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Objetivo pedagógico */}
              <div>
                <span className="text-slate-500 block text-[11px] mb-1 font-semibold uppercase">
                  Objetivo Pedagógico / Atividade:
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-700 italic">
                  "{selectedBookingDetails.pedagogicalGoal || 'Sem descrição pedagógica detalhada.'}"
                </p>
              </div>

              {/* Quick Status Bar */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 font-medium">Status Atual:</span>
                <div className="flex items-center gap-1.5">
                  {selectedBookingDetails.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        onUpdateBookingStatus(selectedBookingDetails.id, 'in_use');
                        setSelectedBookingDetails(null);
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Registrar Saída (Check-out)
                    </button>
                  )}

                  {selectedBookingDetails.status === 'in_use' && (
                    <button
                      onClick={() => {
                        onUpdateBookingStatus(selectedBookingDetails.id, 'returned');
                        setSelectedBookingDetails(null);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                    >
                      Registrar Devolução (Check-in)
                    </button>
                  )}

                  {selectedBookingDetails.status === 'returned' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Devolvido
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Deseja realmente excluir o agendamento de "${selectedBookingDetails.teacherName}" (${selectedBookingDetails.gradeClass})? Os recursos e horários serão liberados.`
                    )
                  ) {
                    onDeleteBooking(selectedBookingDetails.id);
                    setSelectedBookingDetails(null);
                  }
                }}
                className="px-3 py-1.5 border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                title="Excluir este agendamento"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Excluir Agendamento</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const b = selectedBookingDetails;
                    setSelectedBookingDetails(null);
                    onEditBooking(b);
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Editar
                </button>

                <button
                  onClick={() => {
                    const b = selectedBookingDetails;
                    setSelectedBookingDetails(null);
                    onSelectBookingForReceipt(b);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Termo de Cautela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
