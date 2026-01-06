import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Plus, Search, Filter, Car, User, Phone, 
  Hash, Calendar, Paintbrush, X, ChevronRight, 
  Building2, Trash2, Info, AlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Vehicle } from '../types';

export const Vehicles: React.FC = () => {
  const { vehicles, addVehicle, deleteVehicle } = useData();
  
  // ESTADOS
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | Vehicle['status']>('all');

  // ESTADO DO FORMULÁRIO (VEÍCULO + CLIENTE)
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    color: '',
    ownerName: '', // Nome do Cliente ou Prefeitura
    ownerPhone: '',
    status: 'waiting' as Vehicle['status'],
  });

  // FILTRAGEM
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [vehicles, searchTerm, filterStatus]);

  // SALVAR NOVO CADASTRO
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVehicle: Vehicle = {
      id: uuidv4(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    addVehicle(newVehicle);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      plate: '', model: '', brand: '', year: 2024, color: '',
      ownerName: '', ownerPhone: '', status: 'waiting'
    });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            FROTA E CLIENTES
          </h1>
          <p className="text-slate-500 font-medium">Controle unificado de veículos e proprietários</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-orange-200 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={24} strokeWidth={3} />
          CADASTRAR VEÍCULO
        </button>
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total de Veículos" value={vehicles.length} color="slate" />
        <StatCard label="Em Manutenção" value={vehicles.filter(v => v.status === 'in-service').length} color="orange" />
        <StatCard label="Prontos para Entrega" value={vehicles.filter(v => v.status === 'ready').length} color="emerald" />
        <StatCard label="Aguardando" value={vehicles.filter(v => v.status === 'waiting').length} color="blue" />
      </div>

      {/* BUSCA E FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            placeholder="Buscar por placa, cliente ou modelo..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {['all', 'waiting', 'in-service', 'ready', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterStatus === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE VEÍCULOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all flex flex-col sm:flex-row gap-6 relative group">
            
            {/* PLACA E ICONE */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl min-w-[120px] text-white shadow-inner">
              <Car size={32} className="text-orange-500 mb-2" />
              <p className="font-black text-lg tracking-tighter">{vehicle.plate.toUpperCase()}</p>
              <div className="h-0.5 w-full bg-orange-500/30 my-1" />
              <p className="text-[10px] font-bold text-slate-400">BRASIL</p>
            </div>

            {/* INFO VEÍCULO E DONO */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase leading-none">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{vehicle.year} • {vehicle.color}</p>
                </div>
                <StatusBadge status={vehicle.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Proprietário</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{vehicle.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Contato</p>
                    <p className="text-sm font-bold text-slate-700">{vehicle.ownerPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÃO DE AÇÃO / DELETAR */}
            <div className="flex sm:flex-col justify-end gap-2">
               <button 
                onClick={() => deleteVehicle(vehicle.id)}
                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
              <button className="p-3 bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white rounded-xl transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CADASTRO (VEÍCULO + CLIENTE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-orange-500 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight uppercase italic">Novo Cadastro</h2>
                <p className="text-orange-100 text-sm font-bold uppercase tracking-widest mt-1">Veículo e Proprietário</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              
              {/* SEÇÃO: CLIENTE / ENTIDADE */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Building2 size={14} /> Dados do Proprietário (Pessoa ou Prefeitura)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required placeholder="Nome Completo ou Razão Social" 
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                  <input required placeholder="Telefone / WhatsApp" 
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} />
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* SEÇÃO: VEÍCULO */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Car size={14} /> Especificações do Veículo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <input required placeholder="Placa (Ex: ABC1D23)" 
                      className="w-full px-5 py-3 bg-slate-900 text-white border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-black uppercase"
                      value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value.toUpperCase()})} />
                  </div>
                  <input required placeholder="Marca (Ex: Toyota)" 
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  <input required placeholder="Modelo (Ex: Corolla)" 
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input type="number" placeholder="Ano" 
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})} />
                  <input placeholder="Cor" 
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                    value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  <select className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-500"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="waiting">Aguardando</option>
                    <option value="in-service">Em Serviço</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-slate-800 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                CONFIRMAR CADASTRO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTES AUXILIARES
const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => {
  const colors: any = {
    slate: 'bg-slate-50 text-slate-900 border-slate-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };
  return (
    <div className={`p-5 rounded-3xl border-2 shadow-sm ${colors[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">{label}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Vehicle['status'] }) => {
  const config = {
    'in-service': { label: 'Em Serviço', bg: 'bg-orange-100 text-orange-700' },
    waiting: { label: 'Aguardando', bg: 'bg-blue-100 text-blue-700' },
    ready: { label: 'Pronto', bg: 'bg-emerald-100 text-emerald-700' },
    delivered: { label: 'Entregue', bg: 'bg-slate-100 text-slate-500' },
  };
  const current = config[status] || { label: 'Desconhecido', bg: 'bg-gray-100' };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${current.bg}`}>
      {current.label}
    </span>
  );
};