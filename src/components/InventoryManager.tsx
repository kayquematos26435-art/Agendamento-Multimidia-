import React, { useState, useMemo } from 'react';
import { MultimediaResource, ResourceCategory, ResourceCondition, ResourceStatus } from '../types';
import { CATEGORY_LABELS, CONDITION_LABELS } from '../utils/formatters';
import {
  Laptop,
  Search,
  Plus,
  Wrench,
  CheckCircle,
  AlertCircle,
  Building2,
  Tv,
  Volume2,
  Cpu,
  Cable,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

interface InventoryManagerProps {
  resources: MultimediaResource[];
  onAddResource: (resource: Omit<MultimediaResource, 'id'>) => void;
  onUpdateResource: (resource: MultimediaResource) => void;
  onDeleteResource: (resourceId: string) => void;
  onToggleStatus: (resourceId: string, newStatus: ResourceStatus) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onToggleStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<MultimediaResource | null>(null);

  // Form states for New / Edit Resource
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ResourceCategory>('projector');
  const [formPatrimony, setFormPatrimony] = useState('');
  const [formBrandModel, setFormBrandModel] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formCondition, setFormCondition] = useState<ResourceCondition>('excellent');
  const [formIsSpace, setFormIsSpace] = useState(false);
  const [formCapacity, setFormCapacity] = useState<number | undefined>(undefined);
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setEditingResource(null);
    setFormName('');
    setFormCategory('projector');
    setFormPatrimony(`TOMBO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setFormBrandModel('');
    setFormLocation('Armário A - Sala de Tecnologia');
    setFormSpecs('');
    setFormCondition('excellent');
    setFormIsSpace(false);
    setFormCapacity(undefined);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (res: MultimediaResource) => {
    setEditingResource(res);
    setFormName(res.name);
    setFormCategory(res.category);
    setFormPatrimony(res.patrimonyNumber);
    setFormBrandModel(res.brandModel);
    setFormLocation(res.location);
    setFormSpecs(res.specs);
    setFormCondition(res.condition);
    setFormIsSpace(res.isSpace);
    setFormCapacity(res.capacity);
    setFormNotes(res.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPatrimony.trim()) {
      alert('Nome e número de patrimônio são obrigatórios.');
      return;
    }

    if (editingResource) {
      onUpdateResource({
        ...editingResource,
        name: formName.trim(),
        category: formCategory,
        patrimonyNumber: formPatrimony.trim(),
        brandModel: formBrandModel.trim(),
        location: formLocation.trim(),
        specs: formSpecs.trim(),
        condition: formCondition,
        isSpace: formIsSpace,
        capacity: formIsSpace ? formCapacity || 40 : undefined,
        notes: formNotes.trim(),
      });
    } else {
      onAddResource({
        name: formName.trim(),
        category: formCategory,
        patrimonyNumber: formPatrimony.trim(),
        brandModel: formBrandModel.trim(),
        location: formLocation.trim(),
        specs: formSpecs.trim(),
        condition: formCondition,
        isSpace: formIsSpace,
        capacity: formIsSpace ? formCapacity || 40 : undefined,
        status: 'available',
        notes: formNotes.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (selectedCategory !== 'all' && res.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(q);
        const matchesTombo = res.patrimonyNumber.toLowerCase().includes(q);
        const matchesLoc = res.location.toLowerCase().includes(q);
        const matchesModel = res.brandModel.toLowerCase().includes(q);
        if (!matchesName && !matchesTombo && !matchesLoc && !matchesModel) {
          return false;
        }
      }
      return true;
    });
  }, [resources, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case 'projector':
        return <Tv className="w-4 h-4 text-indigo-600" />;
      case 'audio':
        return <Volume2 className="w-4 h-4 text-emerald-600" />;
      case 'computer':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'space':
        return <Building2 className="w-4 h-4 text-violet-600" />;
      case 'robotics':
        return <Cpu className="w-4 h-4 text-amber-600" />;
      case 'accessory':
        return <Cable className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, Tombo Escolar (patrimônio), localização..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Add New Resource Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Recurso</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 mt-3 pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({resources.length})
          </button>
          {(['space', 'audio', 'computer', 'projector', 'robotics', 'accessory'] as ResourceCategory[])
            .filter((cat) => resources.some((r) => r.category === cat))
            .map((cat) => {
              const count = resources.filter((r) => r.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{CATEGORY_LABELS[cat]} ({count})</span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          return (
            <div
              key={res.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header: Name & Tombo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {getCategoryIcon(res.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug">
                        {res.name}
                      </h4>
                      <span className="text-[11px] font-mono font-medium text-slate-500">
                        {res.patrimonyNumber}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="text-right">
                    {res.status === 'available' && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Disponível
                      </span>
                    )}
                    {res.status === 'in_use' && (
                      <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Em Uso
                      </span>
                    )}
                    {res.status === 'maintenance' && (
                      <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" /> Manutenção
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs and Location */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 text-[11px] font-medium shrink-0">Modelo:</span>
                    <span className="font-medium text-slate-800">{res.brandModel || 'Padrão'}</span>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 text-[11px] font-medium shrink-0">Local:</span>
                    <span className="text-slate-700">{res.location}</span>
                  </div>

                  <div className="flex items-start gap-1">
                    <span className="text-slate-400 text-[11px] font-medium shrink-0">Detalhes:</span>
                    <span className="text-slate-600 line-clamp-2">{res.specs}</span>
                  </div>

                  {res.notes && (
                    <div className="p-2 bg-slate-50 rounded-md text-[11px] text-slate-500 italic mt-2">
                      Obs: {res.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Status Control & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {res.status !== 'maintenance' ? (
                    <button
                      onClick={() => onToggleStatus(res.id, 'maintenance')}
                      className="text-[11px] text-slate-500 hover:text-amber-700 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Marcar como em manutenção preventiva/corretiva"
                    >
                      Enviar p/ Manutenção
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleStatus(res.id, 'available')}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Retornar recurso para disponibilidade"
                    >
                      Liberar p/ Uso
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(res)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                    title="Editar informações do recurso"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja remover o recurso "${res.name}" do inventário escolar?`)) {
                        onDeleteResource(res.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Excluir do catálogo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          <p className="text-sm font-semibold">Nenhum recurso encontrado com os filtros atuais.</p>
          <p className="text-xs text-slate-400 mt-1">Tente pesquisar com outro termo ou limpe a busca.</p>
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingResource ? 'Editar Recurso Multimídia' : 'Cadastrar Novo Recurso Escolar'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Equipamento / Espaço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Projetor Epson PowerLite X49"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nº de Patrimônio / Tombo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TOMBO-2024-041"
                    value={formPatrimony}
                    onChange={(e) => setFormPatrimony(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ResourceCategory;
                      setFormCategory(cat);
                      setFormIsSpace(cat === 'space');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="projector">Projetor / Datashow</option>
                    <option value="audio">Áudio & Som</option>
                    <option value="computer">Informática & TVs</option>
                    <option value="space">Sala / Espaço Físico</option>
                    <option value="robotics">Robótica & Maker</option>
                    <option value="accessory">Cabos & Conectividade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Marca / Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Epson / BenQ / Frahm"
                    value={formBrandModel}
                    onChange={(e) => setFormBrandModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Localização Usual / Guarda
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Armário Multimídia A"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Especificações Técnicas / Acessórios Acompanhantes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: 3600 Lumens, HDMI, controle remoto, cabo de força e bolsa de transporte..."
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Estado de Conservação
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as ResourceCondition)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="excellent">Excelente (Novo/Revisado)</option>
                    <option value="good">Bom estado</option>
                    <option value="needs_attention">Requer atenção</option>
                  </select>
                </div>

                {formIsSpace && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Capacidade (Lugares)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 40"
                      value={formCapacity || ''}
                      onChange={(e) => setFormCapacity(Number(e.target.value) || undefined)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observações Internas (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Lâmpada trocada em março de 2026..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingResource ? 'Salvar Dados' : 'Cadastrar Recurso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
