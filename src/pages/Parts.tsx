import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Plus, Search, Package, AlertCircle, 
  Droplets, Disc, Settings, Trash2, Edit3, X, 
  TrendingUp, DollarSign, BarChart3, Layers
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: Layers },
  { id: 'Peças', label: 'Peças', icon: Settings, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Pneus', label: 'Pneus', icon: Disc, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Óleos', label: 'Óleos', icon: Droplets, color: 'text-orange-600', bg: 'bg-orange-50' },
];

export const Parts: React.FC = () => {
  const { parts, addPart, deletePart } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado do formulário com campos de preço
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Peças',
    quantity: 0,
    minQuantity: 5,
    purchasePrice: 0, // Preço de Compra
    markup: 30,       // Porcentagem de Lucro (Padrão 30%)
    supplier: '',
  });

  // Cálculo automático do valor de venda para exibição no formulário
  const sellingPricePreview = formData.purchasePrice * (1 + formData.markup / 100);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      ...formData,
      id: uuidv4(),
      price: sellingPricePreview, // O "price" final salvo é o valor de venda
      location: 'A1',
    };
    addPart(newItem);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', category: 'Peças', quantity: 0, minQuantity: 5, purchasePrice: 0, markup: 30, supplier: '' });
  };

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-orange-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            CONTROLE DE ESTOQUE
          </h1>
          <p className="text-slate-500 font-medium">Gestão de insumos e precificação inteligente</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={22} strokeWidth={3} />
          ADICIONAR ITEM
        </button>
      </div>

      {/* MÉTRICAS EM LARANJA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Investimento Total" 
          value={`R$ ${parts.reduce((acc, p) => acc + (p.purchasePrice || 0) * p.quantity, 0).toLocaleString()}`}
          icon={<DollarSign className="text-orange-600" />}
          label="Custo de aquisição"
        />
        <MetricCard 
          title="Potencial de Venda" 
          value={`R$ ${parts.reduce((acc, p) => acc + (p.price * p.quantity), 0).toLocaleString()}`}
          icon={<TrendingUp className="text-orange-600" />}
          label="Retorno previsto"
        />
        <MetricCard 
          title="Alerta de Reposição" 
          value={parts.filter(p => p.quantity <= p.minQuantity).length.toString()}
          icon={<AlertCircle className="text-red-500" />}
          label="Itens abaixo do mínimo"
        />
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-orange-50">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeCategory === cat.id ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome, código ou fornecedor..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Produto</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-center">Qtd</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Custo Unit.</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Markup</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider">Venda Unit.</th>
              <th className="px-6 py-4 font-bold text-sm uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredParts.map((part) => (
              <tr key={part.id} className="hover:bg-orange-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                      {part.category === 'Pneus' ? <Disc size={20} /> : part.category === 'Óleos' ? <Droplets size={20} /> : <Settings size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{part.name}</p>
                      <p className="text-xs text-slate-400 font-mono uppercase">{part.code} | {part.supplier}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center">
                    <span className={`font-bold ${part.quantity <= part.minQuantity ? 'text-red-500' : 'text-slate-700'}`}>
                      {part.quantity}
                    </span>
                    <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full ${part.quantity <= part.minQuantity ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: '60%' }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-500">
                  R$ {Number(part.purchasePrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-black">
                    +{part.markup}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-black text-slate-900 text-lg">
                    R$ {Number(part.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-orange-600 transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => deletePart(part.id)} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL COM CÁLCULO DE MARKUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-orange-500 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black tracking-tight">NOVO ITEM NO ESTOQUE</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nome do Produto</label>
                <input required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 outline-none font-medium"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Categoria</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none bg-white font-medium"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Peças</option><option>Pneus</option><option>Óleos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Qtd Inicial</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none font-medium"
                    value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                </div>
              </div>

              {/* SEÇÃO DE PRECIFICAÇÃO */}
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-orange-700 uppercase mb-1 text-[10px]">Preço de Compra (R$)</label>
                    <input type="number" step="0.01" className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-700"
                      value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-orange-700 uppercase mb-1 text-[10px]">Markup (%)</label>
                    <input type="number" className="w-full px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-orange-500 font-bold text-slate-700"
                      value={formData.markup} onChange={e => setFormData({...formData, markup: Number(e.target.value)})} />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-orange-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-orange-800 uppercase">Sugestão de Venda:</span>
                  <span className="text-xl font-black text-orange-600">
                    R$ {sellingPricePreview.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 shadow-lg transition-all active:scale-95 uppercase tracking-wider">
                Confirmar Entrada
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon, label }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-all">
    <div className="absolute right-[-10px] top-[-10px] opacity-5 group-hover:opacity-10 transition-opacity uppercase font-black text-6xl italic pointer-events-none">
      {title}
    </div>
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-orange-50 rounded-lg">{icon}</div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
    </div>
  </div>
);