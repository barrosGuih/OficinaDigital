import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Plus, Search, Filter, Wrench, Calendar, 
  ChevronRight, ClipboardList, Clock, CheckCircle2, 
  AlertCircle, X, Car, DollarSign, User as UserIcon, Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Service } from '../types';

// TEMPLATES DE SERVIÇOS COMUNS
const SERVICE_TEMPLATES = [
  { name: 'Troca de Óleo e Filtro', price: 250.00, icon: '🛢️' },
  { name: 'Alinhamento e Balanceamento', price: 120.00, icon: '⚖️' },
  { name: 'Revisão de Freios', price: 450.00, icon: '🛑' },
  { name: 'Limpeza de Ar Condicionado', price: 180.00, icon: '❄️' },
  { name: 'Diagnóstico por Scanner', price: 150.00, icon: '💻' },
  { name: 'Revisão Geral (Checklist)', price: 300.00, icon: '📋' },
];

export const Services: React.FC = () => {
  const { services, vehicles, addService, deleteService, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeClient, setActiveClient] = useState('Todos'); // Para o filtro de prefeituras

  // ESTADO DO FORMULÁRIO
  const [formData, setFormData] = useState({
    vehicleId: '',
    description: '',
    totalCost: 0,
    status: 'pending' as Service['status'],
    notes: ''
  });

  // GERA LISTA DE CLIENTES/PREFEITURAS PARA AS ABAS
  const clients = useMemo(() => {
    const list = vehicles.map(v => v.ownerName);
    return ['Todos', ...Array.from(new Set(list))];
  }, [vehicles]);

  const handleAddTemplate = (template: typeof SERVICE_TEMPLATES[0]) => {
    setFormData({ ...formData, description: template.name, totalCost: template.price });
  };

  // FUNÇÃO DE SALVAMENTO INTEGRADA AO BACKEND
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return alert('Selecione um veículo!');

    try {
      // O addService agora é uma Promise que envia para o localhost:3333
      await addService({
        vehicleId: formData.vehicleId,
        description: formData.description,
        totalCost: formData.totalCost,
        status: formData.status,
        notes: formData.notes,
        mechanicId: 'admin-leoncio' // ID fixo ou vindo do AuthContext
      });
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert("Erro ao salvar serviço no banco de dados.");
    }
  };

  const resetForm = () => {
    setFormData({ vehicleId: '', description: '', totalCost: 0, status: 'pending', notes: '' });
  };

  const getVehicleInfo = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.brand} ${v.model} [${v.plate}]` : 'Desconhecido';
  };

  const getOwnerName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.ownerName : '';
  };

  // FILTRAGEM POR BUSCA E POR ABA DE CLIENTE
  const filteredServices = services.filter(s => {
    const vehicleInfo = getVehicleInfo(s.vehicleId);
    const ownerName = getOwnerName(s.vehicleId);
    
    const matchesSearch = s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClient = activeClient === 'Todos' || ownerName === activeClient;

    return matchesSearch && matchesClient;
  });

  if (loading) return <div className="p-10 text-orange-500 font-black italic animate-pulse">CARREGANDO ORDENS DE SERVIÇO...</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic uppercase tracking-tighter">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            ORDENS DE SERVIÇO
          </h1>
          <p className="text-slate-500 font-medium">Controle de manutenções e fluxo da oficina</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={22} strokeWidth={3} />
          ABRIR NOVA O.S.
        </button>
      </div>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Clock className="text-orange-500"/>} label="Em Aberto" value={services.filter(s => s.status === 'pending' || s.status === 'in-progress').length} />
        <StatCard icon={<CheckCircle2 className="text-emerald-500"/>} label="Concluídos" value={services.filter(s => s.status === 'completed').length} />
        <StatCard icon={<DollarSign className="text-blue-500"/>} label="Faturamento OS" value={`R$ ${services.reduce((acc, s) => acc + s.totalCost, 0).toLocaleString()}`} />
        <StatCard icon={<ClipboardList className="text-slate-500"/>} label="Total Geral" value={services.length} />
      </div>

      {/* ABAS DE CLIENTES/PREFEITURAS */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {clients.map(c => (
          <button 
            key={c} 
            onClick={() => setActiveClient(c)} 
            className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 ${
              activeClient === c 
              ? 'bg-orange-500 border-orange-500 text-white shadow-md' 
              : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FILTRO DE BUSCA */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por serviço, placa ou modelo do veículo..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all font-bold text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA DE SERVIÇOS (CARDS) */}
      <div className="grid grid-cols-1 gap-4">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              service.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
              service.status === 'in-progress' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
            }`}>
              <Wrench size={28} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none italic">{service.description}</h3>
                <StatusBadge status={service.status} />
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span className="flex items-center gap-1.5"><Car size={14} /> {getVehicleInfo(service.vehicleId)}</span>
                <span className="flex items-center gap-1.5 text-orange-500"><Building2 size={14} /> {getOwnerName(service.vehicleId)}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {format(new Date(service.startDate), "dd 'de' MMMM", { locale: ptBR })}</span>
              </div>
            </div>

            <div className="text-center md:text-right px-8 border-x border-slate-50 min-w-[200px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor do Serviço</p>
              <p className="text-2xl font-black text-slate-900">R$ {service.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="flex gap-2">
               <button onClick={() => deleteService(service.id)} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                <X size={20} />
              </button>
              <button className="p-4 bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white rounded-2xl transition-all active:scale-90">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE NOVA O.S. (RESTAURADO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-orange-500 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tighter italic uppercase">ABERTURA DE ORDEM DE SERVIÇO</h2>
                <p className="text-orange-100 text-sm font-bold uppercase tracking-widest mt-1 pr-10">Preencha os dados ou escolha um modelo pronto abaixo</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LADO ESQUERDO: FORMULÁRIO */}
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Veículo do Cliente</label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        required
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 appearance-none"
                        value={formData.vehicleId}
                        onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                      >
                        <option value="">Selecionar Veículo...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.plate} - {v.ownerName} ({v.brand} {v.model})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Descrição do Serviço</label>
                    <input 
                      required
                      placeholder="Ex: Troca de pastilhas de freio dianteiras"
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Valor Total (R$)</label>
                      <input 
                        type="number"
                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-black text-slate-700 text-xl"
                        value={formData.totalCost}
                        onChange={e => setFormData({...formData, totalCost: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Status Inicial</label>
                      <select 
                        className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                      >
                        <option value="pending">⏳ Pendente</option>
                        <option value="in-progress">🔧 Em Execução</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-500 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 tracking-widest">
                  <ClipboardList />
                  GERAR ORDEM DE SERVIÇO
                </button>
              </form>

              {/* LADO DIREITO: TEMPLATES */}
              <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Wrench size={16} className="text-orange-500" />
                  Modelos Rápidos
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {SERVICE_TEMPLATES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddTemplate(item)}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-orange-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">{item.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Preço Sugerido: R$ {item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <Plus size={18} className="text-slate-300 group-hover:text-orange-500" />
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

// COMPONENTES AUXILIARES (ORIGINAIS)
const StatCard = ({ icon, label, value }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: Service['status'] }) => {
  const config = {
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