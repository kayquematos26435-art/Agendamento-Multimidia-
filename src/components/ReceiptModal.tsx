import React from 'react';
import { SchoolBooking, MultimediaResource, SchoolConfig, ClassPeriod } from '../types';
import { formatDateExtensive, SHIFT_LABELS } from '../utils/formatters';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  booking: SchoolBooking;
  resources: MultimediaResource[];
  schoolConfig: SchoolConfig;
  periods: ClassPeriod[];
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  booking,
  resources,
  schoolConfig,
  periods,
  onClose,
}) => {
  const bookedResources = resources.filter((r) => booking.resourceIds.includes(r.id));
  const bookedSpace = booking.spaceId ? resources.find((r) => r.id === booking.spaceId) : null;
  const periodLabels = booking.periods
    .map((p) => {
      const match = periods.find((cp) => cp.shift === booking.shift && cp.periodNumber === p);
      return match ? match.label : `${p}ª Aula`;
    })
    .join(', ');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Actions Bar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm tracking-wide">
              Termo de Cautela e Comprovante de Agendamento
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Termo
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 space-y-6 text-slate-800 font-sans print:p-0 print:space-y-4">
          {/* Official Document Header */}
          <div className="text-center border-b border-slate-300 pb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Estado do Tocantins · Secretaria da Educação
            </p>
            <h1 className="text-lg font-bold text-slate-900 mt-1 uppercase">
              {schoolConfig.schoolName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Código INEP: {schoolConfig.inepCode} · {schoolConfig.cityState}
            </p>
            <div className="mt-3 inline-block bg-slate-100 border border-slate-200 px-4 py-1 text-xs font-bold text-slate-800 tracking-wider uppercase">
              TERMO DE CAUTELA, RESPONSABILIDADE E AGENDAMENTO MULTIMÍDIA
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Controle Nº: {booking.id.toUpperCase()} · Emissão: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Teacher & Class Information */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="block text-slate-500 text-[11px] font-medium uppercase">
                Docente Solicitante
              </span>
              <span className="block text-sm font-bold text-slate-900 mt-0.5">
                {booking.teacherName}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="block text-slate-500 text-[11px] font-medium uppercase">
                Turma & Componente Curricular
              </span>
              <span className="block text-sm font-bold text-slate-900 mt-0.5">
                {booking.gradeClass} · {booking.discipline}
              </span>
              <span className="block text-slate-600 text-[11px] mt-0.5">
                {SHIFT_LABELS[booking.shift]}
              </span>
            </div>
          </div>

          {/* Booking Schedule Details */}
          <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Data do Agendamento:</span>
              <span className="font-semibold text-slate-900">
                {formatDateExtensive(booking.date)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Aulas / Horários:</span>
              <span className="font-semibold text-slate-900">{periodLabels}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Local de Utilização:</span>
              <span className="font-semibold text-slate-900">
                {bookedSpace ? bookedSpace.name : `Sala Comum da Turma (${booking.gradeClass})`}
              </span>
            </div>
          </div>

          {/* Pedagogical Goal */}
          <div className="text-xs">
            <span className="block text-slate-500 font-medium uppercase text-[11px] mb-1">
              Finalidade / Objetivo Pedagógico:
            </span>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 italic">
              "{booking.pedagogicalGoal || 'Uso pedagógico de apoio audiovisual às aulas.'}"
            </div>
          </div>

          {/* Resources & Equipment Table */}
          <div className="text-xs">
            <span className="block text-slate-500 font-medium uppercase text-[11px] mb-1.5">
              Equipamentos Sob Responsabilidade do Solicitante:
            </span>
            <table className="w-full border-collapse border border-slate-200 text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-2 border border-slate-200 font-semibold">Tombo / Patrimônio</th>
                  <th className="p-2 border border-slate-200 font-semibold">Equipamento / Modelo</th>
                  <th className="p-2 border border-slate-200 font-semibold">Estado de Entrega</th>
                </tr>
              </thead>
              <tbody>
                {bookedResources.map((res) => (
                  <tr key={res.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-medium text-slate-900 border border-slate-200">
                      {res.patrimonyNumber}
                    </td>
                    <td className="p-2 border border-slate-200">
                      <div className="font-medium text-slate-900">{res.name}</div>
                      <div className="text-[11px] text-slate-500">{res.brandModel}</div>
                    </td>
                    <td className="p-2 border border-slate-200 text-emerald-700 font-medium">
                      Conferido e Funcionando
                    </td>
                  </tr>
                ))}
                {bookedSpace && (
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <td className="p-2 font-mono font-medium text-slate-900 border border-slate-200">
                      {bookedSpace.patrimonyNumber}
                    </td>
                    <td className="p-2 border border-slate-200">
                      <div className="font-medium text-slate-900">{bookedSpace.name}</div>
                      <div className="text-[11px] text-slate-500">Espaço Físico / Sala Dedicada</div>
                    </td>
                    <td className="p-2 border border-slate-200 text-emerald-700 font-medium">
                      Liberado para Uso
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Legal / Institutional Declaration */}
          <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
            O(A) docente acima qualificado declara ter recebido os equipamentos multimídia listados em
            perfeito estado de funcionamento, com seus respectivos cabos e acessórios, comprometendo-se
            a zelar por sua integridade física e devolvê-los pontualmente ao término do horário agendado
            ao setor de tecnologia educacional desta unidade escolar.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center border-t border-slate-200">
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1.5 pb-6"></div>
              <p className="font-semibold text-slate-900">{booking.teacherName}</p>
              <p className="text-[11px] text-slate-500">Docente Solicitante</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1.5 pb-6"></div>
              <p className="font-semibold text-slate-900">{schoolConfig.labResponsible}</p>
              <p className="text-[11px] text-slate-500">Responsável pela Entrega / Mídias</p>
            </div>
          </div>

          {booking.status === 'returned' && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>Devolução Registrada:</strong> {booking.returnNotes || 'Sem avarias relatadas.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
