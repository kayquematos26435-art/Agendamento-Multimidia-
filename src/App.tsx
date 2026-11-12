/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SchoolBooking,
  MultimediaResource,
  SchoolConfig,
  ShiftType,
} from './types';
import {
  INITIAL_RESOURCES,
  INITIAL_BOOKINGS,
  DEFAULT_SCHOOL_CONFIG,
  DEFAULT_PERIODS,
} from './data/mockData';
import { TimetableGrid } from './components/TimetableGrid';
import { NewBookingModal } from './components/NewBookingModal';
import { InventoryManager } from './components/InventoryManager';
import { CheckoutCheckinPanel } from './components/CheckoutCheckinPanel';
import { ReportsDashboard } from './components/ReportsDashboard';
import { ReceiptModal } from './components/ReceiptModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import {
  CalendarDays,
  Package,
  Layers,
  BarChart3,
  Plus,
  Settings,
  Printer,
  Sparkles,
  School,
  CheckCircle2,
  Tv,
} from 'lucide-react';

type ActiveTab = 'grade' | 'inventario' | 'balcao' | 'relatorios';

export default function App() {
  // Persistent state in localStorage
  const [resources, setResources] = useState<MultimediaResource[]>(() => {
    const saved = localStorage.getItem('edumidia_resources_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved resources', e);
      }
    }
    return INITIAL_RESOURCES;
  });

  const [bookings, setBookings] = useState<SchoolBooking[]>(() => {
    const saved = localStorage.getItem('edumidia_bookings_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved bookings', e);
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('edumidia_config_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
    return DEFAULT_SCHOOL_CONFIG;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('edumidia_resources_v4', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('edumidia_bookings_v5', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('edumidia_config_v2', JSON.stringify(schoolConfig));
  }, [schoolConfig]);

  // Current tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('grade');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalPrefill, setBookingModalPrefill] = useState<{
    date?: string;
    shift?: ShiftType;
    period?: number;
    resourceId?: string;
  }>({});
  const [editingBooking, setEditingBooking] = useState<SchoolBooking | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<SchoolBooking | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Success notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Determine current school shift based on actual local time
  const currentHour = new Date().getHours();
  const currentShiftLabel =
    currentHour < 12
      ? 'Turno Matutino Ativo'
      : currentHour < 18
      ? 'Turno Vespertino Ativo'
      : 'Turno Noturno Ativo';

  // Handler: Open new booking modal (optionally prefilled)
  const handleOpenNewBooking = (
    date?: string,
    shift?: ShiftType,
    period?: number,
    resourceId?: string
  ) => {
    setEditingBooking(null);
    setBookingModalPrefill({ date, shift, period, resourceId });
    setIsBookingModalOpen(true);
  };

  // Handler: Open editing
  const handleEditBooking = (booking: SchoolBooking) => {
    setEditingBooking(booking);
    setBookingModalPrefill({});
    setIsBookingModalOpen(true);
  };

  // Handler: Save new bookings (including recurrence)
  const handleSaveBookings = (newBookingsData: Omit<SchoolBooking, 'id' | 'createdDate'>[]) => {
    const created: SchoolBooking[] = newBookingsData.map((data, idx) => ({
      ...data,
      id: `book-${Date.now()}-${idx}`,
      createdDate: new Date().toISOString().split('T')[0],
    }));

    setBookings((prev) => [...created, ...prev]);
    showToast(
      created.length > 1
        ? `${created.length} agendamentos recorrentes criados com sucesso!`
        : 'Agendamento multimídia cadastrado com sucesso!'
    );
  };

  // Handler: Update existing booking
  const handleUpdateBooking = (updated: SchoolBooking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast('Agendamento atualizado com sucesso!');
  };

  // Handler: Delete booking
  const handleDeleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    showToast('Agendamento removido.');
  };

  // Handler: Quick status update
  const handleUpdateBookingStatus = (bookingId: string, newStatus: SchoolBooking['status']) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        const copy = { ...b, status: newStatus };
        if (newStatus === 'in_use' && !copy.checkedOutAt) {
          copy.checkedOutAt = new Date().toISOString();
          copy.checkedOutBy = schoolConfig.labResponsible || 'Monitor';
        }
        if (newStatus === 'returned' && !copy.returnedAt) {
          copy.returnedAt = new Date().toISOString();
        }
        return copy;
      })
    );
    showToast(
      newStatus === 'in_use'
        ? 'Saída do equipamento registrada (Em uso).'
        : newStatus === 'returned'
        ? 'Devolução do equipamento registrada.'
        : 'Status atualizado.'
    );
  };

  // Handler: Inventory operations
  const handleAddResource = (resourceData: Omit<MultimediaResource, 'id'>) => {
    const newRes: MultimediaResource = {
      ...resourceData,
      id: `res-${Date.now()}`,
    };
    setResources((prev) => [...prev, newRes]);
    showToast(`Recurso "${newRes.name}" adicionado ao inventário!`);
  };

  const handleUpdateResource = (updated: MultimediaResource) => {
    setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    showToast(`Dados de "${updated.name}" atualizados.`);
  };

  const handleDeleteResource = (resourceId: string) => {
    setResources((prev) => prev.filter((r) => r.id !== resourceId));
    showToast('Recurso removido do catálogo escolar.');
  };

  const handleToggleResourceStatus = (resourceId: string, newStatus: MultimediaResource['status']) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, status: newStatus } : r))
    );
    showToast(
      newStatus === 'maintenance'
        ? 'Recurso enviado para manutenção preventiva/corretiva.'
        : 'Recurso disponibilizado para novos agendamentos.'
    );
  };

  // Reset to default sample data
  const handleResetData = () => {
    setResources(INITIAL_RESOURCES);
    setBookings(INITIAL_BOOKINGS);
    setSchoolConfig(DEFAULT_SCHOOL_CONFIG);
    localStorage.removeItem('edumidia_resources');
    localStorage.removeItem('edumidia_resources_v3');
    localStorage.removeItem('edumidia_resources_v4');
    localStorage.removeItem('edumidia_bookings');
    localStorage.removeItem('edumidia_bookings_v2');
    localStorage.removeItem('edumidia_bookings_v3');
    localStorage.removeItem('edumidia_bookings_v4');
    localStorage.removeItem('edumidia_bookings_v5');
    localStorage.removeItem('edumidia_config');
    localStorage.removeItem('edumidia_config_v2');
    showToast('Dados restaurados para o padrão de demonstração escolar.');
  };

  // Open official receipt modal
  const handleOpenReceipt = (booking: SchoolBooking) => {
    setReceiptBooking(booking);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Institutional Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 no-print sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Brand and School Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold tracking-tight text-white">
                    EduMídia
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                    Multimídia Escolar
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-xs sm:max-w-md font-medium text-slate-300">
                    {schoolConfig.schoolName}
                  </span>
                  <span className="hidden md:inline" aria-hidden="true">·</span>
                  <span className="hidden md:inline text-slate-400">{schoolConfig.cityState}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden lg:inline text-[11px] text-slate-400 font-medium mr-2">
                {currentShiftLabel}
              </span>

              <button
                onClick={() => handleOpenNewBooking()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Agendamento</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Configurações da Escola"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-1">
              <button
                onClick={() => setActiveTab('grade')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'grade'
                    ? 'text-white bg-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-indigo-400" />
                <span>Grade Semanal & Horários</span>
              </button>

              <button
                onClick={() => setActiveTab('balcao')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'balcao'
                    ? 'text-white bg-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Balcão de Retiradas & Cautelas</span>
                {bookings.filter((b) => b.status === 'in_use').length > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                    {bookings.filter((b) => b.status === 'in_use').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('inventario')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'inventario'
                    ? 'text-white bg-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Catálogo & Inventário</span>
                <span className="text-slate-400 text-[11px] font-normal">
                  ({resources.length})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'relatorios'
                    ? 'text-white bg-slate-800 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>Relatórios Pedagógicos</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full grow">
        {activeTab === 'grade' && (
          <TimetableGrid
            bookings={bookings}
            resources={resources}
            periods={DEFAULT_PERIODS}
            onOpenNewBooking={handleOpenNewBooking}
            onSelectBookingForReceipt={handleOpenReceipt}
            onEditBooking={handleEditBooking}
            onDeleteBooking={handleDeleteBooking}
            onUpdateBookingStatus={handleUpdateBookingStatus}
          />
        )}

        {activeTab === 'balcao' && (
          <CheckoutCheckinPanel
            bookings={bookings}
            resources={resources}
            schoolConfig={schoolConfig}
            onUpdateBooking={handleUpdateBooking}
            onDeleteBooking={handleDeleteBooking}
            onOpenReceipt={handleOpenReceipt}
          />
        )}

        {activeTab === 'inventario' && (
          <InventoryManager
            resources={resources}
            onAddResource={handleAddResource}
            onUpdateResource={handleUpdateResource}
            onDeleteResource={handleDeleteResource}
            onToggleStatus={handleToggleResourceStatus}
          />
        )}

        {activeTab === 'relatorios' && (
          <ReportsDashboard
            bookings={bookings}
            resources={resources}
            schoolConfig={schoolConfig}
          />
        )}
      </main>

      {/* Modals */}
      {isBookingModalOpen && (
        <NewBookingModal
          initialDate={bookingModalPrefill.date}
          initialShift={bookingModalPrefill.shift}
          initialPeriod={bookingModalPrefill.period}
          initialResourceOrSpaceId={bookingModalPrefill.resourceId}
          existingBooking={editingBooking}
          resources={resources}
          periods={DEFAULT_PERIODS}
          bookings={bookings}
          onSave={handleSaveBookings}
          onUpdate={handleUpdateBooking}
          onDelete={handleDeleteBooking}
          onClose={() => {
            setIsBookingModalOpen(false);
            setEditingBooking(null);
          }}
        />
      )}

      {isReceiptModalOpen && receiptBooking && (
        <ReceiptModal
          booking={receiptBooking}
          resources={resources}
          schoolConfig={schoolConfig}
          periods={DEFAULT_PERIODS}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setReceiptBooking(null);
          }}
        />
      )}

      {isSettingsOpen && (
        <SchoolSettingsModal
          config={schoolConfig}
          onSave={(newCfg) => {
            setSchoolConfig(newCfg);
            showToast('Configurações da escola salvas.');
          }}
          onResetData={handleResetData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>EduMídia</strong> · Sistema Integrado de Agendamento e Gestão Multimídia Escolar
          </div>
          <div className="text-slate-400">
            {schoolConfig.schoolName} · {schoolConfig.cityState}
          </div>
        </div>
      </footer>
    </div>
  );
}
