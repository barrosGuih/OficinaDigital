import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  DollarSign, Car, Wrench, AlertCircle, 
  TrendingUp, Clock, CheckCircle2, Search,
  Filter, Calendar, Building2, ChevronRight,
  Package, User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { services, vehicles, parts, loading } = useData();
  const [activeTab, setActiveTab] = useState('Geral');

  // --- TRAVAS DE SEGURANÇA PARA DADOS (EVITA TELA BRANCA) ---
  const safeServices = services || [];
  const safeVehicles = vehicles || [];
  const safeParts = parts || [];

  // --- CÁLCULOS DE MÉTRICAS (COM PROTEÇÃO) ---
  const metrics = useMemo(() => {
    const revenue = safeServices
      .filter(s => s.status === 'completed')
      .reduce((acc, s) => acc + (Number(s.totalCost) || 0), 0);

    const pendingPrice = safeServices.filter(s => s.status === 'pending_approval').length;
    const inProgress = safeServices.filter(s => s.status === 'in-progress' || s.status === 'pending').length;
    const lowStock = safeParts.filter(p => p.quantity <= p.minQuantity).length;

    return { revenue, pendingPrice, inProgress, lowStock };
  }, [safeServices, safeParts]);

  // --- FILTRO DE CLIENTES / PREFEITURAS ---
  const clients = useMemo(() => {
    const list = safeVehicles.map(v => v.ownerName).filter(Boolean);
    return ['Geral', ...Array.from(new Set(list))];
  }, [safeVehicles]);

  const filteredServices = useMemo(() => {
    if (activeTab === 'Geral') return safeServices.slice(0, 6);
    return safeServices.filter(s => {
      const v = safeVehicles.find(veh => veh.id === s.vehicleId);
      return v?.ownerName === activeTab;
    }).slice(0, 6);
  }, [activeTab, safeServices, safeVehicles]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Wrench className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-orange-500 font-black italic uppercase tracking-tighter">Sincronizando Oficina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">
            DASHBOARD <span className="text-orange-500 text-2xl">| GESTÃO REAL-TIME</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Mecânica Leôncio - Controle de Alta Performance</p>
        </div>
        
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full scrollbar-hide">
          {clients.map(client => (
            <button
              key={client}
              onClick={() => setActiveTab(client)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                activeTab === client ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {client}
            </button>
          ))}
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Faturamento OS" 
          value={`R$ ${metrics.revenue.toLocaleString('pt-BR')}`} 
          icon={<DollarSign size={24} />} 
          trend="+12%"
          color="text-emerald-500"
        />
        <StatCard 
          label="Aprovação Pendente" 
          value={metrics.pendingPrice} 
          icon={<AlertCircle size={24} />} 
          color="text-orange-500"
          alert={metrics.pendingPrice > 0}
        />
        <StatCard 
          label="Veículos na Oficina" 
          value={metrics.inProgress} 
          icon={<Clock size={24} />} 
          color="text-blue-500"
        />
        <StatCard 
          label="Peças p/ Reposição" 
          value={metrics.lowStock} 
          icon={<Package size={24} />} 
          color="text-red-500"
          alert={metrics.lowStock > 0}
        />
      </div>

      {/* GRID DE CONTEÚDO (Serviços Recentes e Alertas) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LISTA DE SERVIÇOS RECENTES */}
        <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic uppercase text-slate-900 tracking-tighter flex items-center gap-3">
              <div className="w-2 h-6 bg-orange-500 rounded-full" />
              Últimas Atividades {activeTab !== 'Geral' && `- ${activeTab}`}
            </h3>
            <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline">Ver tudo</button>
          </div>

          <div className="space-y-4">
            {filteredServices.length > 0 ? filteredServices.map((s) => (
              <div key={s.id} className="flex items-center gap-6 p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-orange-200 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  s.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <Wrench size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 uppercase italic truncate">{s.description}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <Car size={12} /> {safeVehicles.find(v => v.id === s.vehicleId)?.plate || 'S/ PLACA'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-orange-500 uppercase tracking-widest">
                      <UserIcon size={12} /> {safeVehicles.find(v => v.id === s.vehicleId)?.ownerName || 'AVULSO'}
                    </span>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none">R$ {Number(s.totalCost || 0).toLocaleString('pt-BR')}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                    {s.startDate ? format(new Date(s.startDate), 'dd MMM', { locale: ptBR }) : '--'}
                  </p>
                </div>
                
                <ChevronRight className="text-slate-300 group-hover:text-orange-500 transition-colors" />
              </div>
            )) : (
              <div className="py-10 text-center text-slate-400 font-bold uppercase text-xs italic">Nenhum serviço encontrado.</div>
            )}
          </div>
        </div>

        {/* COLUNA LATERAL: ALERTAS E ESTOQUE */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
            <TrendingUp className="absolute top-[-20px] right-[-20px] w-40 h-40 text-white/5" />
            <h3 className="text-lg font-black italic uppercase mb-6 tracking-tighter">Status do Estoque</h3>
            
            <div className="space-y-6 relative z-10">
              {safeParts.filter(p => p.quantity <= p.minQuantity).slice(0, 3).map(p => (
                <div key={p.id} className="border-b border-white/10 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-black text-sm uppercase italic">{p.name}</p>
                    <span className="bg-red-500 text-[8px] px-2 py-1 rounded-full">CRÍTICO</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full" 
                      style={{ width: `${(p.quantity / p.minQuantity) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/50 font-bold uppercase mt-2">Restam apenas {p.quantity} unidades</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
             <h3 className="text-lg font-black italic uppercase mb-4 tracking-tighter text-slate-900 italic">Lembretes</h3>
             <div className="space-y-4">
                <ReminderItem text="Fazer backup dos documentos" time="Hoje" />
                <ReminderItem text="Revisar notas da prefeitura" time="Amanhã" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ label, value, icon, color, trend, alert }: any) => (
  <div className={`bg-white p-6 rounded-[35px] border-2 ${alert ? 'border-orange-500 animate-pulse' : 'border-slate-50'} shadow-sm flex items-center gap-5 transition-all hover:scale-[1.02]`}>
    <div className={`p-4 rounded-2xl bg-slate-50 ${color}`}>
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
      <p className={`text-xl font-black leading-none truncate ${alert ? 'text-orange-600' : 'text-slate-900'}`}>{value}</p>
      {trend && <span className="text-[8px] font-black text-emerald-500 mt-1 inline-block">{trend} vs mês ant.</span>}
    </div>
  </div>
);

const ReminderItem = ({ text, time }: any) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
    <div className="w-2 h-2 bg-orange-500 rounded-full" />
    <div className="flex-1">
      <p className="text-xs font-bold text-slate-700">{text}</p>
      <p className="text-[9px] font-black text-slate-400 uppercase">{time}</p>
    </div>
  </div>
);