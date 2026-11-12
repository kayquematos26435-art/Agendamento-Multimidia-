import React, { useState, useMemo } from 'react';
import {
  SchoolBooking,
  MultimediaResource,
  ShiftType,
  ClassPeriod,
} from '../types';
import {
  SUGGESTED_DISCIPLINES,
  SUGGESTED_CLASSES,
  SHIFT_CLASSES,
} from '../data/mockData';
import { checkBookingConflicts } from '../utils/conflictChecker';
import { SHIFT_LABELS, CATEGORY_LABELS } from '../utils/formatters';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Laptop,
  Building2,
  BookOpen,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface NewBookingModalProps {
  initialDate?: string;
  initialShift?: ShiftType;
  initialPeriod?: number;
  initialResourceOrSpaceId?: string;
  existingBooking?: SchoolBooking | null;
  resources: MultimediaResource[];
  periods: ClassPeriod[];
  bookings: SchoolBooking[];
  onSave: (bookingsToCreate: Omit<SchoolBooking, 'id' | 'createdDate'>[]) => void;
  onUpdate?: (updated: SchoolBooking) => void;
  onDelete?: (bookingId: string) => void;
  onClose: () => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  initialDate,
  initialShift,
  initialPeriod,
  initialResourceOrSpaceId,
  existingBooking,
  resources,
  periods,
  bookings,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const isEditing = Boolean(existingBooking);

  // Form states
  const [teacherName, setTeacherName] = useState(existingBooking?.teacherName || '');
  const [discipline, setDiscipline] = useState(existingBooking?.discipline || SUGGESTED_DISCIPLINES[0]);
  const [shift, setShift] = useState<ShiftType>(existingBooking?.shift || initialShift || 'morning');

  const availableClassesForShift = useMemo(() => {
    return SHIFT_CLASSES[shift] || SUGGESTED_CLASSES;
  }, [shift]);

  const [gradeClass, setGradeClass] = useState(() => {
    if (existingBooking?.gradeClass) return existingBooking.gradeClass;
    const initialClasses = SHIFT_CLASSES[initialShift || 'morning'];
    return initialClasses ? initialClasses[0] : SUGGESTED_CLASSES[0];
  });

  const [date, setDate] = useState(existingBooking?.date || initialDate || new Date().toISOString().split('T')[0]);
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>(
    existingBooking?.periods || (initialPeriod ? [initialPeriod] : [1, 2])
  );

  // When shift changes, ensure selected gradeClass belongs to the current shift
  const handleShiftChange = (newShift: ShiftType) => {
    setShift(newShift);
    const classesForNewShift = SHIFT_CLASSES[newShift];
    if (classesForNewShift && !classesForNewShift.includes(gradeClass)) {
      setGradeClass(classesForNewShift[0]);
    }
  };

  // Resources state: separates spaces from portable equipment
  const spaces = useMemo(() => resources.filter((r) => r.isSpace), [resources]);
  const equipments = useMemo(() => resources.filter((r) => !r.isSpace), [resources]);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(() => {
    if (existingBooking?.spaceId) return existingBooking.spaceId;
    if (initialResourceOrSpaceId && spaces.some((s) => s.id === initialResourceOrSpaceId)) {
      return initialResourceOrSpaceId;
    }
    const salaAula = spaces.find((s) => s.id === 'res-esp-sala-aula');
    return salaAula ? salaAula.id : spaces[0]?.id || '';
  });

  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(() => {
    if (existingBooking?.resourceIds) return existingBooking.resourceIds;
    if (initialResourceOrSpaceId && equipments.some((e) => e.id === initialResourceOrSpaceId)) {
      return [initialResourceOrSpaceId];
    }
    // Default: choose first available equipment
    return equipments.length > 0 ? [equipments[0].id] : [];
  });

  const [pedagogicalGoal, setPedagogicalGoal] = useState(existingBooking?.pedagogicalGoal || '');
  const [repeatWeeks, setRepeatWeeks] = useState<number>(1); // 1 = only this date, >1 = weekly recurring

  // Available periods for the current shift
  const currentShiftPeriods = useMemo(() => {
    return periods.filter((p) => p.shift === shift);
  }, [periods, shift]);

  // Map of resource IDs to names for conflict messages
  const resourceNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    resources.forEach((r) => {
      map[r.id] = r.name;
    });
    return map;
  }, [resources]);

  // Collision checking in real-time
  const conflictResult = useMemo(() => {
    if (!date || selectedPeriods.length === 0 || (selectedResourceIds.length === 0 && !selectedSpaceId)) {
      return { hasConflict: false, conflicts: [], summaryMessage: '' };
    }

    return checkBookingConflicts({
      date,
      shift,
      periods: selectedPeriods,
      resourceIds: selectedResourceIds,
      spaceId: selectedSpaceId || undefined,
      excludeBookingId: existingBooking?.id,
      bookings,
      resourceNameMap,
    });
  }, [
    date,
    shift,
    selectedPeriods,
    selectedResourceIds,
    selectedSpaceId,
    existingBooking,
    bookings,
    resourceNameMap,
  ]);

  const handlePeriodToggle = (periodNum: number) => {
    if (selectedPeriods.includes(periodNum)) {
      if (selectedPeriods.length > 1) {
        setSelectedPeriods(selectedPeriods.filter((p) => p !== periodNum).sort((a, b) => a - b));
      }
    } else {
      setSelectedPeriods([...selectedPeriods, periodNum].sort((a, b) => a - b));
    }
  };

  const handleResourceToggle = (resId: string) => {
    if (selectedResourceIds.includes(resId)) {
      setSelectedResourceIds(selectedResourceIds.filter((id) => id !== resId));
    } else {
      setSelectedResourceIds([...selectedResourceIds, resId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherName.trim()) {
      alert('Por favor, informe o nome do docente solicitante.');
      return;
    }

    if (selectedPeriods.length === 0) {
      alert('Selecione ao menos um horário/aula para o agendamento.');
      return;
    }

    if (selectedResourceIds.length === 0 && !selectedSpaceId) {
      alert('Selecione ao menos um equipamento ou espaço multimídia.');
      return;
    }

    if (conflictResult.hasConflict) {
      const confirmForce = window.confirm(
        'Atenção: Existe um conflito de horário para este recurso. Deseja prosseguir mesmo assim ou revisar os horários?'
      );
      if (!confirmForce) return;
    }

    if (isEditing && existingBooking && onUpdate) {
      onUpdate({
        ...existingBooking,
        teacherName: teacherName.trim(),
        discipline,
        gradeClass,
        date,
        shift,
        periods: selectedPeriods,
        resourceIds: selectedResourceIds,
        spaceId: selectedSpaceId || undefined,
        pedagogicalGoal: pedagogicalGoal.trim(),
      });
      onClose();
      return;
    }

    // Creating new booking(s) - handle recurrence if requested
    const bookingsToCreate: Omit<SchoolBooking, 'id' | 'createdDate'>[] = [];
    const baseDate = new Date(`${date}T12:00:00`);

    for (let week = 0; week < repeatWeeks; week++) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + week * 7);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      bookingsToCreate.push({
        teacherName: teacherName.trim(),
        discipline,
        gradeClass,
        date: targetDateStr,
        shift,
        periods: selectedPeriods,
        resourceIds: selectedResourceIds,
        spaceId: selectedSpaceId || undefined,
        pedagogicalGoal: pedagogicalGoal.trim() || 'Apoio audiovisual e multimídia às atividades pedagógicas da disciplina.',
        status: 'confirmed',
      });
    }

    onSave(bookingsToCreate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              {isEditing ? 'Editar Agendamento Multimídia' : 'Novo Agendamento Multimídia Escolar'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Defina os dados da aula, horários e selecione os recursos audiovisuais necessários.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Conflict Alert Banner */}
        {conflictResult.hasConflict && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Aviso de Conflito de Horário: </span>
              {conflictResult.summaryMessage}
              <div className="mt-1 text-amber-800">
                Altere o dia, a aula ou o equipamento para evitar sobreposição na escola.
              </div>
            </div>
          </div>
        )}

        {!conflictResult.hasConflict && selectedResourceIds.length > 0 && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center gap-2 text-xs text-emerald-800 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Recursos e horários livres! Nenhum conflito identificado.</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto grow">
          {/* Section 1: Professor & Turma */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              1. Identificação do Docente e Turma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Docente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Profa. Mariana Costa"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Componente Curricular / Disciplina
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {SUGGESTED_DISCIPLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turma Atendida ({shift === 'morning' ? 'Matutino' : shift === 'afternoon' ? 'Vespertino' : 'Noturno'}) *
                </label>
                <select
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                >
                  {availableClassesForShift.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: Data, Turno e Aulas */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              2. Data, Turno e Horários das Aulas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data da Aula / Uso *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turno Escolar *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['morning', 'afternoon', 'night'] as ShiftType[]).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => handleShiftChange(st)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                        shift === st
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-xs'
                          : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st === 'morning' ? 'Matutino' : st === 'afternoon' ? 'Vespertino' : 'Noturno'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Class Period Checkboxes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Aulas Necessárias ({SHIFT_LABELS[shift]}):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {currentShiftPeriods.map((p) => {
                  const isChecked = selectedPeriods.includes(p.periodNumber);
                  return (
                    <button
                      type="button"
                      key={p.periodNumber}
                      onClick={() => handlePeriodToggle(p.periodNumber)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">
                        {p.periodNumber}ª Aula
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isChecked ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {p.startTime} - {p.endTime}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 3: Espaço ou Sala */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              3. Local / Espaço de Realização
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {spaces.map((sp) => {
                const isSelected = selectedSpaceId === sp.id;
                return (
                  <button
                    type="button"
                    key={sp.id}
                    onClick={() => setSelectedSpaceId(sp.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">
                        {sp.name} {sp.id === 'res-esp-sala-aula' ? `(Turma ${gradeClass})` : ''}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{sp.patrimonyNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{sp.specs}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 4: Equipamentos Multimídia (Múltipla Seleção) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-indigo-600" />
                4. Equipamentos Solicitados (Múltipla Escolha)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {selectedResourceIds.length} selecionado(s)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Marque todos os itens necessários para a sua atividade (você pode combinar projetor + som + cabos):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {equipments.map((res) => {
                const isChecked = selectedResourceIds.includes(res.id);
                return (
                  <div
                    key={res.id}
                    onClick={() => handleResourceToggle(res.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Handled by parent div
                      className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {res.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {res.patrimonyNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {res.specs}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span>{CATEGORY_LABELS[res.category]}</span>
                        <span aria-hidden="true">·</span>
                        <span>{res.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 5: Objetivo Pedagógico */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              5. Finalidade / Objetivo Pedagógico da Aula
            </label>
            <textarea
              rows={2}
              placeholder="Descreva resumidamente como o equipamento será utilizado no plano de aula (ex: Apresentação de seminários sobre sustentabilidade com slides)..."
              value={pedagogicalGoal}
              onChange={(e) => setPedagogicalGoal(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Recurrence Option (Only for new bookings) */}
          {!isEditing && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Repetir Agendamento Semanalmente?
                </span>
                <span className="text-[11px] text-slate-500">
                  Cria reservas automáticas para as semanas seguintes no mesmo dia e horário.
                </span>
              </div>
              <select
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 font-medium"
              >
                <option value={1}>Apenas nesta data (Sem repetição)</option>
                <option value={2}>Repetir por 2 semanas</option>
                <option value={3}>Repetir por 3 semanas</option>
                <option value={4}>Repetir por 4 semanas (1 mês)</option>
              </select>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            {isEditing && existingBooking && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Deseja realmente excluir o agendamento de "${existingBooking.teacherName}" (${existingBooking.gradeClass})? Os recursos e horários serão liberados.`
                    )
                  ) {
                    onDelete(existingBooking.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Agendamento</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {isEditing ? 'Salvar Alterações' : repeatWeeks > 1 ? `Confirmar ${repeatWeeks} Agendamentos` : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>
    </div>
  );
};
