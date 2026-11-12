import React, { useMemo } from 'react';
import { SchoolBooking, MultimediaResource, SchoolConfig } from '../types';
import { SHIFT_LABELS, formatDateBR } from '../utils/formatters';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  Award,
  BookOpen,
  Laptop,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ReportsDashboardProps {
  bookings: SchoolBooking[];
  resources: MultimediaResource[];
  schoolConfig: SchoolConfig;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  bookings,
  resources,
  schoolConfig,
}) => {
  const resourceMap = useMemo(() => {
    const map = new Map<string, MultimediaResource>();
    resources.forEach((r) => map.set(r.id, r));
    return map;
  }, [resources]);

  // General metrics
  const totalBookings = bookings.length;
  const activeOrCompletedBookings = bookings.filter((b) => b.status !== 'cancelled');
  const totalClassesGiven = activeOrCompletedBookings.reduce((sum, b) => sum + b.periods.length, 0);

  // Teacher ranking
  const teacherStats = useMemo(() => {
    const counts: Record<string, { count: number; classes: number; discipline: string }> = {};
    activeOrCompletedBookings.forEach((b) => {
      if (!counts[b.teacherName]) {
        counts[b.teacherName] = { count: 0, classes: 0, discipline: b.discipline };
      }
      counts[b.teacherName].count += 1;
      counts[b.teacherName].classes += b.periods.length;
    });

    return Object.entries(counts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [activeOrCompletedBookings]);

  // Discipline ranking
  const disciplineStats = useMemo(() => {
    const counts: Record<string, number> = {};
    activeOrCompletedBookings.forEach((b) => {
      counts[b.discipline] = (counts[b.discipline] || 0) + b.periods.length;
    });

    return Object.entries(counts)
      .map(([discipline, classes]) => ({ discipline, classes }))
      .sort((a, b) => b.classes - a.classes);
  }, [activeOrCompletedBookings]);

  // Resource popularity ranking
  const resourceStats = useMemo(() => {
    const counts: Record<string, number> = {};
    activeOrCompletedBookings.forEach((b) => {
      b.resourceIds.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
      if (b.spaceId) {
        counts[b.spaceId] = (counts[b.spaceId] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([id, usageCount]) => ({
        id,
        name: resourceMap.get(id)?.name || 'Recurso',
        patrimony: resourceMap.get(id)?.patrimonyNumber || '',
        category: resourceMap.get(id)?.category || 'projector',
        usageCount,
      }))
      .sort((a, b) => b.usageCount - a.usageCount);
  }, [activeOrCompletedBookings, resourceMap]);

  // Shift breakdown
  const shiftStats = useMemo(() => {
    const morning = activeOrCompletedBookings.filter((b) => b.shift === 'morning').length;
    const afternoon = activeOrCompletedBookings.filter((b) => b.shift === 'afternoon').length;
    const night = activeOrCompletedBookings.filter((b) => b.shift === 'night').length;
    return { morning, afternoon, night };
  }, [activeOrCompletedBookings]);

  // Export to CSV functionality
  const handleExportCSV = () => {
    const headers = [
      'ID Agendamento',
      'Data',
      'Turno',
      'Aulas',
      'Docente',
      'Disciplina',
      'Turma',
      'Espaço',
      'Equipamentos',
      'Status',
      'Objetivo Pedagógico',
    ];

    const rows = bookings.map((b) => {
      const spaceName = b.spaceId ? resourceMap.get(b.spaceId)?.name || '' : 'Sala da Turma';
      const equipNames = b.resourceIds
        .map((id) => resourceMap.get(id)?.name || id)
        .join('; ');

      return [
        `"${b.id}"`,
        `"${formatDateBR(b.date)}"`,
        `"${SHIFT_LABELS[b.shift]}"`,
        `"${b.periods.join(', ')}"`,
        `"${b.teacherName}"`,
        `"${b.discipline}"`,
        `"${b.gradeClass}"`,
        `"${spaceName}"`,
        `"${equipNames}"`,
        `"${b.status}"`,
        `"${(b.pedagogicalGoal || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos_multimidia_${schoolConfig.schoolName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Relatórios e Indicadores de Uso Multimídia Pedagógico
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de integração de tecnologias nas práticas pedagógicas de {schoolConfig.schoolName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimir Relatório
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar Dados (CSV)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Agendamentos
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalBookings}</div>
          <div className="text-[11px] text-slate-500 mt-1">Registros no histórico escolar</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Aulas Atendidas
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalClassesGiven}</div>
          <div className="text-[11px] text-slate-500 mt-1">Horas-aula com suporte audiovisual</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Recursos no Catálogo
            </span>
            <Laptop className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{resources.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Equipamentos e salas cadastradas</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Docentes Ativos
            </span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{teacherStats.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Professores utilizando a plataforma</div>
        </div>
      </div>

      {/* Two columns: Teacher ranking & Discipline distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most active teachers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            Docentes com Maior Engajamento em Recursos Audiovisuais
          </h3>

          <div className="space-y-3">
            {teacherStats.slice(0, 5).map((t, idx) => (
              <div
                key={t.name}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.discipline}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-indigo-700">
                    {t.count} agendamento{t.count > 1 ? 's' : ''}
                  </span>
                  <div className="text-[10px] text-slate-400">{t.classes} aulas atendidas</div>
                </div>
              </div>
            ))}

            {teacherStats.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Sem dados suficientes.</p>
            )}
          </div>
        </div>

        {/* Componentes Curriculares / Disciplinas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Aulas Audiovisuais por Componente Curricular
          </h3>

          <div className="space-y-2.5">
            {disciplineStats.slice(0, 6).map((d) => {
              const maxClasses = disciplineStats[0]?.classes || 1;
              const percentage = Math.round((d.classes / maxClasses) * 100);

              return (
                <div key={d.discipline} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{d.discipline}</span>
                    <span className="font-bold text-indigo-700">{d.classes} aulas</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {disciplineStats.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Sem dados registrados.</p>
            )}
          </div>
        </div>
      </div>

      {/* Equipment Demand & Shift Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Popularity Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Laptop className="w-4 h-4 text-indigo-600" />
            Ranking de Recursos e Equipamentos Mais Solicitados
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-2">Recurso / Espaço</th>
                  <th className="pb-2">Tombo / Patrimônio</th>
                  <th className="pb-2 text-right">Total Utilizações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resourceStats.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-900">{item.name}</td>
                    <td className="py-2.5 font-mono text-slate-500 text-[11px]">{item.patrimony}</td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">
                      {item.usageCount} vez{item.usageCount > 1 ? 'es' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shift distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              Distribuição por Turno Escolar
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">☀️ Turno Matutino</span>
                  <span className="font-extrabold text-indigo-700">{shiftStats.morning} reservas</span>
                </div>
                <div className="text-[11px] text-slate-500">1ª à 5ª aula (Manhã)</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">⛅ Turno Vespertino</span>
                  <span className="font-extrabold text-indigo-700">{shiftStats.afternoon} reservas</span>
                </div>
                <div className="text-[11px] text-slate-500">1ª à 5ª aula (Tarde)</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">🌙 Turno Noturno</span>
                  <span className="font-extrabold text-indigo-700">{shiftStats.night} reservas</span>
                </div>
                <div className="text-[11px] text-slate-500">EJA / Ensino Médio Regular</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Relatório gerado automaticamente · Atualizado em tempo real
          </div>
        </div>
      </div>
    </div>
  );
};
