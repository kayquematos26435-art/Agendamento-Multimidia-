import React, { useState } from 'react';
import { SchoolConfig } from '../types';
import { Settings, X, School, RotateCcw } from 'lucide-react';

interface SchoolSettingsModalProps {
  config: SchoolConfig;
  onSave: (newConfig: SchoolConfig) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  config,
  onSave,
  onResetData,
  onClose,
}) => {
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [inepCode, setInepCode] = useState(config.inepCode);
  const [cityState, setCityState] = useState(config.cityState);
  const [labResponsible, setLabResponsible] = useState(config.labResponsible);
  const [autoApprove, setAutoApprove] = useState(config.autoApprove);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      alert('O nome da escola não pode ficar vazio.');
      return;
    }

    onSave({
      schoolName: schoolName.trim(),
      inepCode: inepCode.trim(),
      cityState: cityState.trim(),
      labResponsible: labResponsible.trim(),
      autoApprove,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Configurações da Unidade Escolar</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nome da Unidade Escolar *
            </label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ex: Colégio Estadual Cívico-Militar Professor José Carneiro de Brito"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Aparece no cabeçalho e nos Termos de Cautela e Comprovantes de Agendamento.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Código INEP Escolar
              </label>
              <input
                type="text"
                value={inepCode}
                onChange={(e) => setInepCode(e.target.value)}
                placeholder="Ex: 17024891"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Município / UF
              </label>
              <input
                type="text"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="Ex: Palmas - TO"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Setor / Responsável pela Coordenação de Mídias
            </label>
            <input
              type="text"
              value={labResponsible}
              onChange={(e) => setLabResponsible(e.target.value)}
              placeholder="Ex: Coordenação de Tecnologia e Mídias Educacionais"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="font-semibold text-slate-900 block">
                  Aprovação Automática Imediata
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Novos agendamentos sem conflito entram diretamente como confirmados.
                </span>
              </div>
            </label>
          </div>

          <hr className="border-slate-200 pt-2" />

          {/* Reset Demo Data */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-900 block text-xs">
                Restaurar Dados de Exemplo
              </span>
              <span className="text-[11px] text-rose-700 block">
                Restaura inventário e agendamentos padrão da escola.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Tem certeza? Isso recarregará o catálogo e reservas iniciais de demonstração.')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 border border-rose-300 bg-white text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
