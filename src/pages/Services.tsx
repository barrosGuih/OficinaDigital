import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Plus, Search, Filter, Wrench, Calendar, 
  ChevronRight, ClipboardList, Clock, CheckCircle2, 
  AlertCircle, X, Car, DollarSign, User as UserIcon, Building2,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Service } from '../types';

const SERVICE_TEMPLATES = [
  { name: 'Troca de Óleo e Filtro', price: 250.00, icon: '🛢️' },
  { name: 'Alinhamento e Balanceamento', price: 120.00, icon: '⚖️' },
  { name: 'Revisão de Freios', price: 450.00, icon: '🛑' },
  { name: 'Limpeza de Ar Condicionado', price: 180.00, icon: '❄️' },
  { name: 'Diagnóstico por Scanner', price: 150.00, icon: '💻' },
  { name: 'Revisão Geral (Checklist)', price: 300.00, icon: '📋' },
];

export const Services: React.FC = () => {
  // ADICIONADO: approveService do DataContext
  const { services, vehicles, addService, deleteService, approveService, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeClient, setActiveClient] = useState('Todos');

  const [formData, setFormData] = useState({
    vehicleId: '',
    description: '',
    totalCost: 0,
    status: 'pending' as Service['status'],
    notes: ''
  });

  const clients = useMemo(() => {
    const list = vehicles.map(v => v.ownerName);
    return ['Todos', ...Array.from(new Set(list))];
  }, [vehicles]);

  const handleAddTemplate = (template: typeof SERVICE_TEMPLATES[0]) => {
    setFormData({ ...formData, description: template.name, totalCost: template.price });
  };

  // FUNÇÃO PARA VOCÊ APROVAR O QUE O FUNCIONÁRIO MANDOU
  const handleApprove = async (id: string) => {
    const valor = prompt("Qual o valor final deste serviço?");
    if (valor && !isNaN(Number(valor))) {
      try {
        await approveService(id, Number(valor));
        alert("Serviço aprovado e preço definido!");
      } catch (e) {
        alert("Erro ao aprovar serviço.");
      }
    } else {
      alert("Valor inválido.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return alert('Selecione um veículo!');

    try {
      await addService({
        vehicleId: formData.vehicleId,
        description: formData.description,
        totalCost: formData.totalCost,
        status: formData.status,
        notes: formData.notes,
        mechanicId: 'admin' 
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert("Erro ao salvar serviço.");
    }
  };

  const resetForm = () => {
    setFormData({ vehicleId: '', description: '', totalCost: 0, status: 'pending', notes: '' });
  };

  // AJUSTADO: Se não tiver vehicleId, tenta usar o tempPlate (placa manual)
  const getVehicleInfo = (service: Service) => {
    if (!service.vehicleId && service.tempPlate) {
      return `NOVO: ${service.tempPlate}`;
    }
    const v = vehicles.find(v => v.id === service.vehicleId);
    return v ? `${v.brand} ${v.model} [${v.plate}]` : 'Desconhecido';
  };

  const getOwnerName = (service: Service) => {
    const v = vehicles.find(v => v.id === service.vehicleId);
    return v ? v.ownerName : (service.tempPlate ? 'Aguardando Cadastro' : '');
  };

  const filteredServices = services.filter(s => {
    const vehicleInfo = getVehicleInfo(s);
    const ownerName = getOwnerName(s);
    const matchesSearch = s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = activeClient === 'Todos' || ownerName === activeClient;
    return matchesSearch && matchesClient;
  });

  if (loading) return <div className="p-10 text-orange-500 font-black italic animate-pulse">CARREGANDO...</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            ORDENS DE SERVIÇO
          </h1>
          <p className="text-slate-500 font-medium italic">Gerenciamento e Aprovação de Serviços</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
        >
          <Plus size={22} strokeWidth={3} />
          NOVA O.S. (ADMIN)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="text-orange-500"/>} label="Aguardando Você" value={services.filter(s => s.status === 'pending_approval').length} />
        <StatCard icon={<Wrench className="text-blue-500"/>} label="Em Execução" value={services.filter(s => s.status === 'in-progress' || s.status === 'pending').length} />
        <StatCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Concluídos" value={services.filter(s => s.status === 'completed').length} />
        <StatCard icon={<DollarSign className="text-slate-900"/>} label="Receita OS" value={`R$ ${services.reduce((acc, s) => acc + (s.totalCost || 0), 0).toLocaleString()}`} />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por placa, serviço ou funcionário..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredServices.map((service) => (
          <div key={service.id} className={`bg-white rounded-3xl border ${service.status === 'pending_approval' ? 'border-orange-400 border-2' : 'border-slate-100'} p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 group`}>
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              service.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
              service.status === 'pending_approval' ? 'bg-orange-500 text-white animate-pulse' : 'bg-orange-50 text-orange-600'
            }`}>
              <Wrench size={28} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none italic">{service.description}</h3>
                <StatusBadge status={service.status as any} />
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span className="flex items-center gap-1.5"><Car size={14} /> {getVehicleInfo(service)}</span>
                <span className="flex items-center gap-1.5 text-orange-500"><Building2 size={14} /> {getOwnerName(service)}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {format(new Date(service.startDate), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
              </div>
            </div>

            <div className="text-center md:text-right px-8 border-x border-slate-50 min-w-[200px]">
              {service.status === 'pending_approval' ? (
                <button 
                  onClick={() => handleApprove(service.id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg flex items-center gap-2"
                >
                  <Check size={14} strokeWidth={4} />
                  Dar Preço e Aprovar
                </button>
              ) : (
                <>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor do Serviço</p>
                  <p className="text-2xl font-black text-slate-900">R$ {service.totalCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </>
              )}
            </div>

            <div className="flex gap-2">
               <button onClick={() => deleteService(service.id)} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
              <button className="p-4 bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white rounded-2xl transition-all">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE NOVA O.S. (ADMIN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-orange-500 p-8 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black italic uppercase">Abertura de O.S. Direta</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-4">
                  <select 
                    required
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold"
                    value={formData.vehicleId}
                    onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                  >
                    <option value="">Selecione o Veículo...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plate} - {v.ownerName}</option>
                    ))}
                  </select>

                  <input 
                    required
                    placeholder="Descrição do serviço"
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number"
                      placeholder="Valor R$"
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-700"
                      value={formData.totalCost}
                      onChange={e => setFormData({...formData, totalCost: Number(e.target.value)})}
                    />
                    <select 
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl font-bold"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="pending">⏳ Pendente</option>
                      <option value="in-progress">🔧 Em Execução</option>
                      <option value="completed">✅ Concluído</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-500 shadow-xl transition-all flex items-center justify-center gap-3">
                  <ClipboardList />
                  CRIAR ORDEM DE SERVIÇO
                </button>
              </form>

              <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Templates Rápidos</h3>
                <div className="grid grid-cols-1 gap-3">
                  {SERVICE_TEMPLATES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddTemplate(item)}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-orange-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      </div>
                      <Plus size={18} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: 'pending_approval' | 'pending' | 'in-progress' | 'completed' | 'cancelled' }) => {
  const config = {
    pending_approval: { label: 'Aguardando Patrão', bg: 'bg-orange-500', text: 'text-white', icon: <AlertCircle size={12}/> },
    pending: { label: 'Pendente', bg: 'bg-orange-100', text: 'text-orange-700', icon: <Clock size={12}/> },
    'in-progress': { label: 'Executando', bg: 'bg-blue-100', text: 'text-blue-700', icon: <Wrench size={12}/> },
    completed: { label: 'Finalizado', bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 size={12}/> },
    cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle size={12}/> },
  };

  const current = config[status] || config.pending;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${current.bg} ${current.text}`}>
      {current.icon}
      {current.label}
    </span>
  );
};