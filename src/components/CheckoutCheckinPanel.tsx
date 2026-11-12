import React, { useState, useMemo } from 'react';
import { SchoolBooking, MultimediaResource, SchoolConfig } from '../types';
import { formatDateBR, SHIFT_LABELS } from '../utils/formatters';
import {
  PackageCheck,
  PackageOpen,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  AlertCircle,
  X,
  Search,
  Trash2,
} from 'lucide-react';

interface CheckoutCheckinPanelProps {
  bookings: SchoolBooking[];
  resources: MultimediaResource[];
  schoolConfig: SchoolConfig;
  onUpdateBooking: (updated: SchoolBooking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onOpenReceipt: (booking: SchoolBooking) => void;
}

export const CheckoutCheckinPanel: React.FC<CheckoutCheckinPanelProps> = ({
  bookings,
  resources,
  schoolConfig,
  onUpdateBooking,
  onDeleteBooking,
  onOpenReceipt,
}) => {
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [operatorName, setOperatorName] = useState(
    schoolConfig.labResponsible || 'Monitor(a) de Tecnologia'
  );
  const [searchFilter, setSearchFilter] = useState('');

  // Return modal state
  const [returnBookingModal, setReturnBookingModal] = useState<SchoolBooking | null>(null);
  const [returnChecklistCables, setReturnChecklistCables] = useState(true);
  const [returnChecklistCondition, setReturnChecklistCondition] = useState(true);
  const [returnChecklistRemote, setReturnChecklistRemote] = useState(true);
  const [returnObservations, setReturnObservations] = useState('');

  const resourceMap = useMemo(() => {
    const map = new Map<string, MultimediaResource>();
    resources.forEach((r) => map.set(r.id, r));
    return map;
  }, [resources]);

  // Bookings for the target date
  const dateBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (b.date !== targetDate) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesName = b.teacherName.toLowerCase().includes(q);
        const matchesClass = b.gradeClass.toLowerCase().includes(q);
        const matchesDisc = b.discipline.toLowerCase().includes(q);
        if (!matchesName && !matchesClass && !matchesDisc) return false;
      }
      return true;
    });
  }, [bookings, targetDate, searchFilter]);

  const awaitingCheckout = dateBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
  const inUse = dateBookings.filter((b) => b.status === 'in_use');
  const returned = dateBookings.filter((b) => b.status === 'returned');

  // Handle Check-out (dispatch equipment to teacher)
  const handleCheckout = (booking: SchoolBooking) => {
    onUpdateBooking({
      ...booking,
      status: 'in_use',
      checkedOutAt: new Date().toISOString(),
      checkedOutBy: operatorName.trim() || 'Monitor de Mídias',
    });
  };

  // Open Return (Check-in) modal
  const openReturnModal = (booking: SchoolBooking) => {
    setReturnBookingModal(booking);
    setReturnChecklistCables(true);
    setReturnChecklistCondition(true);
    setReturnChecklistRemote(true);
    setReturnObservations('');
  };

  // Submit return
  const handleConfirmReturn = () => {
    if (!returnBookingModal) return;

    let notes = 'Devolução conferida e aprovada.';
    if (!returnChecklistCables) notes += ' [Alerta: Cabos/adaptadores pendentes de devolução].';
    if (!returnChecklistCondition) notes += ' [Alerta: Equipamento requer inspeção por avaria].';
    if (!returnChecklistRemote) notes += ' [Alerta: Controle remoto não entregue].';
    if (returnObservations.trim()) notes += ` Obs: ${returnObservations.trim()}`;

    onUpdateBooking({
      ...returnBookingModal,
      status: 'returned',
      returnedAt: new Date().toISOString(),
      returnNotes: notes,
    });

    setReturnBookingModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Operator Settings */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Balcão de Atendimento & Retiradas (Portaria / Sala de Mídias)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle de entrega física, recolhimento dos equipamentos e emissão do Termo de Cautela.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                Data de Consulta
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase">
                Operador / Atendente
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Nome do monitor"
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Search inside today's bookings */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por professor, disciplina ou turma..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Total do dia: <strong>{dateBookings.length} agendamentos</strong> ({inUse.length} em uso)
          </div>
        </div>
      </div>

      {/* 3 Columns: Awaiting Checkout -> In Use -> Returned */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Aguardando Retirada */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <PackageOpen className="w-4 h-4 text-indigo-700" />
              <h3 className="font-bold text-xs text-indigo-950 uppercase tracking-wide">
                Aguardando Retirada
              </h3>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
              {awaitingCheckout.length}
            </span>
          </div>

          <div className="space-y-3">
            {awaitingCheckout.map((b) => {
              const spaceObj = b.spaceId ? resourceMap.get(b.spaceId) : null;
              const equipObjs = b.resourceIds
                .map((id) => resourceMap.get(id))
                .filter(Boolean) as MultimediaResource[];

              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{b.teacherName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {b.gradeClass} · {b.discipline}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      {b.periods.map((p) => `${p}ª`).join(', ')} aula
                    </span>
                  </div>

                  {/* Resources summary */}
                  <div className="bg-slate-50 p-2 rounded-lg text-xs space-y-1">
                    {spaceObj && (
                      <div className="text-indigo-900 font-semibold text-[11px]">
                        📍 {spaceObj.name}
                      </div>
                    )}
                    {equipObjs.map((e) => (
                      <div key={e.id} className="text-slate-700 text-[11px] flex justify-between">
                        <span>⚡ {e.name}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{e.patrimonyNumber}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenReceipt(b)}
                        className="text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-1 font-medium cursor-pointer"
                        title="Ver Termo de Cautela"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Termo
                      </button>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Deseja realmente excluir o agendamento de "${b.teacherName}" (${b.gradeClass})? Os recursos serão liberados.`
                            )
                          ) {
                            onDeleteBooking(b.id);
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 font-medium cursor-pointer transition-colors"
                        title="Excluir Agendamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    </div>

                    <button
                      onClick={() => handleCheckout(b)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      Registrar Saída
                    </button>
                  </div>
                </div>
              );
            })}

            {awaitingCheckout.length === 0 && (
              <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                Nenhuma retirada pendente para este dia.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Em Uso no Momento (Retirados) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                Em Uso no Momento
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
              {inUse.length}
            </span>
          </div>

          <div className="space-y-3">
            {inUse.map((b) => {
              const spaceObj = b.spaceId ? resourceMap.get(b.spaceId) : null;
              const equipObjs = b.resourceIds
                .map((id) => resourceMap.get(id))
                .filter(Boolean) as MultimediaResource[];

              const checkoutTimeStr = b.checkedOutAt
                ? new Date(b.checkedOutAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : 'Horário não registrado';

              return (
                <div
                  key={b.id}
                  className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{b.teacherName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {b.gradeClass} · {b.discipline}
                      </p>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Retirado às {checkoutTimeStr}
                    </span>
                  </div>

                  <div className="bg-amber-50/50 p-2 rounded-lg text-xs space-y-1 border border-amber-100">
                    {spaceObj && (
                      <div className="text-slate-900 font-semibold text-[11px]">
                        📍 {spaceObj.name}
                      </div>
                    )}
                    {equipObjs.map((e) => (
                      <div key={e.id} className="text-slate-700 text-[11px] flex justify-between">
                        <span>⚡ {e.name}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{e.patrimonyNumber}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onOpenReceipt(b)}
                      className="text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Ver Termo
                    </button>

                    <button
                      onClick={() => openReturnModal(b)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Receber Devolução
                    </button>
                  </div>
                </div>
              );
            })}

            {inUse.length === 0 && (
              <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                Nenhum equipamento em uso no momento.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Devolvidos Hoje */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-xs text-emerald-950 uppercase tracking-wide">
                Devolvidos Hoje
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
              {returned.length}
            </span>
          </div>

          <div className="space-y-3">
            {returned.map((b) => {
              const returnTimeStr = b.returnedAt
                ? new Date(b.returnedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : 'Concluído';

              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1.5 opacity-85"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{b.teacherName}</h4>
                      <p className="text-[11px] text-slate-500">
                        {b.gradeClass} · {b.discipline}
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Devolvido às {returnTimeStr}
                    </span>
                  </div>

                  {b.returnNotes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      {b.returnNotes}
                    </p>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onOpenReceipt(b)}
                      className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      Comprovante de Devolução
                    </button>
                  </div>
                </div>
              );
            })}

            {returned.length === 0 && (
              <div className="p-6 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                Nenhuma devolução realizada nesta data ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return / Check-in Modal with Inspection Checklist */}
      {returnBookingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Registrar Devolução de Equipamento
              </h3>
              <button
                onClick={() => setReturnBookingModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-900">{returnBookingModal.teacherName}</div>
                <div className="text-slate-600">
                  {returnBookingModal.gradeClass} · {returnBookingModal.discipline}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2">
                  Checklist de Conferência e Conservação:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={returnChecklistCables}
                      onChange={(e) => setReturnChecklistCables(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-slate-700">
                      Todos os cabos (HDMI/VGA/Força/Extensões) foram devolvidos
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={returnChecklistCondition}
                      onChange={(e) => setReturnChecklistCondition(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-slate-700">
                      Equipamento íntegro, sem avarias físicas ou danos na lente
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={returnChecklistRemote}
                      onChange={(e) => setReturnChecklistRemote(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-slate-700">
                      Controle remoto / passador laser entregue com pilhas
                    </span>
                  </label>
                </div>
              </div>

              {/* Extra notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações de Devolução (Opcional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tudo entregue em ordem; lâmpada resfriada adequadamente."
                  value={returnObservations}
                  onChange={(e) => setReturnObservations(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnBookingModal(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar Devolução
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
