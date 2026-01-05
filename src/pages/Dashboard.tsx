import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Car, Wrench, AlertCircle, DollarSign, TrendingUp, 
  FileText, Download, Package, Users, ArrowUpRight, 
  ArrowDownRight, PlusCircle, History
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell 
} from 'recharts';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard: React.FC = () => {
  const { vehicles, services, parts } = useData();

  // --- CÁLCULOS FINANCEIROS REAIS ---
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Serviços deste mês
    const monthlyServices = services.filter(s => 
      isWithinInterval(new Date(s.startDate), { start: monthStart, end: monthEnd })
    );

    // Receita (Venda)
    const revenue = monthlyServices
      .filter(s => s.status === 'completed')
      .reduce((acc, s) => acc + s.totalCost, 0);

    // Custo estimado (Peças em estoque)
    const stockValue = parts.reduce((acc, p) => acc + (p.purchasePrice * p.quantity), 0);
    
    // Itens críticos
    const lowStock = parts.filter(p => p.quantity <= p.minQuantity).length;

    return {
      revenue,
      stockValue,
      lowStock,
      activeOS: services.filter(s => s.status === 'in-progress').length,
      pendingOS: services.filter(s => s.status === 'pending').length,
    };
  }, [services, parts]);

  // Dados fictícios para o gráfico de pizza/barras de categorias
  const categoryData = [
    { name: 'Pneus', value: 400, color: '#f97316' },
    { name: 'Óleos', value: 300, color: '#8b5cf6' },
    { name: 'Peças', value: 300, color: '#3b82f6' },
    { name: 'Mão de Obra', value: 200, color: '#10b981' },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            Dashboard Executivo
          </h1>
          <p className="text-slate-500 font-medium">Gestão em tempo real • {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <History size={18} />
            Histórico
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
            <PlusCircle size={18} />
            Nova Entrada
          </button>
        </div>
      </div>

      {/* GRID DE MÉTRICAS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Faturamento Mensal" 
          value={`R$ ${stats.revenue.toLocaleString()}`} 
          icon={<DollarSign size={24}/>}
          trend="+12%"
          trendUp={true}
          color="orange"
        />
        <MetricCard 
          label="Ordens em Execução" 
          value={stats.activeOS} 
          icon={<Wrench size={24}/>}
          trend={`${stats.pendingOS} aguardando`}
          trendUp={false}
          color="blue"
        />
        <MetricCard 
          label="Valor em Estoque" 
          value={`R$ ${stats.stockValue.toLocaleString()}`} 
          icon={<Package size={24}/>}
          trend="Custo de compra"
          trendUp={true}
          color="purple"
        />
        <MetricCard 
          label="Alertas de Estoque" 
          value={stats.lowStock} 
          icon={<AlertCircle size={24}/>}
          trend="Reposição imediata"
          trendUp={false}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO DE FATURAMENTO (ÁREA) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
              <TrendingUp className="text-orange-500" /> Fluxo de Caixa Mensal
            </h3>
            <select className="bg-slate-50 border-none rounded-lg text-xs font-bold p-2 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CENTRAL DE RELATÓRIOS (NOVO) */}
        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl">
          <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2 text-orange-400">
            <FileText /> Central de Relatórios
          </h3>
          <div className="space-y-4">
            <ReportButton 
              title="Faturamento Prefeitura" 
              desc="OS finalizadas agrupadas por entidade"
              onClick={() => alert('Gerando PDF de faturamento...')}
            />
            <ReportButton 
              title="Inventário de Peças" 
              desc="Lista completa com preço de custo/venda"
              onClick={() => alert('Exportando planilha de estoque...')}
            />
            <ReportButton 
              title="Produtividade Mecânicos" 
              desc="Horas trabalhadas e serviços concluídos"
              onClick={() => alert('Compilando dados de equipe...')}
            />
            <ReportButton 
              title="Giro de Pneus e Óleos" 
              desc="Consumo médio dos últimos 30 dias"
              onClick={() => alert('Analisando giro de estoque...')}
            />
          </div>
          
          <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-xs font-bold text-slate-400 uppercase mb-4">Uso de Espaço (Arquivos)</p>
            <div className="flex items-center gap-4">
               <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 w-[65%]" />
               </div>
               <span className="text-xs font-black">65%</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-bold">4.2 GB de 10 GB utilizados</p>
          </div>
        </div>

      </div>

      {/* LISTA DE ATIVIDADES RECENTES */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
            <History className="text-orange-500" /> Atividade Recente da Oficina
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhe</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {services.slice(0, 5).map((s, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Car size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">O.S. Aberta</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900">{s.description}</p>
                    <p className="text-xs text-slate-400 font-medium tracking-tight">Veículo: {vehicles.find(v => v.id === s.vehicleId)?.plate}</p>
                  </td>
                  <td className="px-8 py-5 text-center text-sm font-bold text-slate-500">
                    {format(new Date(s.startDate), "dd MMM, HH:mm", { locale: ptBR })}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-orange-500 hover:text-orange-700 font-black text-xs uppercase tracking-widest">Ver Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- SUBCOMPONENTES AUXILIARES ---

const MetricCard = ({ label, value, icon, trend, trendUp, color }: any) => {
  const colors: any = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
          {trendUp ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

const ReportButton = ({ title, desc, onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 hover:border-orange-500/50 transition-all group"
  >
    <div className="flex justify-between items-center mb-1">
      <p className="text-sm font-black text-slate-200 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{title}</p>
      <Download size={14} className="text-slate-500 group-hover:text-white" />
    </div>
    <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
  </button>
);