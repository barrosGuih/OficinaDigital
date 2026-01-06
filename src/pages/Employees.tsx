import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Car, Send, Wrench, LogOut, Search, Clock, ChevronRight } from 'lucide-react';

export const EmployeePage: React.FC = () => {
  const { vehicles, addService, services } = useData();
  
  // CORREÇÃO 1: Usar a chave correta que você definiu no AuthContext
  const user = JSON.parse(localStorage.getItem('@OficinaDigital:user') || '{}');

  const [isNewVehicle, setIsNewVehicle] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    manualPlate: '', 
    description: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!isNewVehicle && !formData.vehicleId) return alert("Selecione o veículo!");
    if (isNewVehicle && !formData.manualPlate) return alert("Digite a placa!");
    
    // CORREÇÃO 2: Verificar se temos o ID do mecânico real
    if (!user.id) {
      return alert("Erro: Sessão expirada. Saia e entre novamente no sistema.");
    }

    try {
      console.log("Tentando enviar serviço para o banco...");

      // Montando o objeto exatamente como o seu Backend e o Prisma esperam
      const novoServico = {
        vehicleId: isNewVehicle ? null : formData.vehicleId, // Prisma prefere null a undefined
        tempPlate: isNewVehicle ? formData.manualPlate.toUpperCase() : null,
        description: formData.description,
        totalCost: 0,
        status: 'pending_approval' as any,
        mechanicId: user.id, // ID REAL DO USUÁRIO LOGADO
        startDate: new Date().toISOString(),
        partsUsed: [],
        notes: "Lançado via celular"
      };

      console.log("Dados que estão sendo enviados:", novoServico);

      await addService(novoServico);
      
      alert("✅ SERVIÇO ENVIADO COM SUCESSO!");
      
      // Limpar formulário
      setFormData({ vehicleId: '', manualPlate: '', description: '' });
      setIsNewVehicle(false);
    } catch (error) {
      console.error("Erro no handleSave:", error);
      alert("Erro ao salvar. Verifique se o servidor está ligado.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">
            MECÂNICA <span className="text-orange-500">LEÔNCIO</span>
          </h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Funcionário: {user.name || 'Não identificado'}
          </p>
        </div>
        <button 
          onClick={() => { localStorage.clear(); window.location.href='/login'; }} 
          className="bg-white p-3 rounded-2xl shadow-sm text-slate-400"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-6">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h2 className="font-black italic uppercase tracking-tighter flex items-center gap-2 text-sm">
            <Plus className="text-orange-500" size={20} /> Registrar Entrada
          </h2>
          <button 
            type="button"
            onClick={() => setIsNewVehicle(!isNewVehicle)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              isNewVehicle ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isNewVehicle ? '✓ Placa Manual' : '+ Veículo Novo?'}
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Identificação do Veículo</label>
            <div className="relative">
              <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              
              {isNewVehicle ? (
                <input 
                  required
                  placeholder="DIGITE A PLACA"
                  className="w-full pl-12 pr-4 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl outline-none font-black text-slate-700"
                  value={formData.manualPlate}
                  onChange={e => setFormData({...formData, manualPlate: e.target.value})}
                />
              ) : (
                <select 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 appearance-none shadow-inner"
                  value={formData.vehicleId}
                  onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                >
                  <option value="">Selecione o carro...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Serviço Realizado</label>
            <textarea 
              required
              rows={3}
              placeholder="Descreva o que foi feito..."
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 shadow-inner"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-600 shadow-xl transition-all flex items-center justify-center gap-3 tracking-widest uppercase italic">
            <Send size={22} />
            ENVIAR PARA O CHEFE
          </button>
        </form>
      </div>

      {/* FEEDBACK */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Últimos Lançamentos</p>
        {services.filter(s => s.status === 'pending_approval').slice(0, 3).map(s => (
          <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500"><Clock size={16}/></div>
               <div>
                  <p className="text-xs font-black italic uppercase leading-none">{s.description}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">{s.tempPlate || 'Placa cadastrada'}</p>
               </div>
            </div>
            <ChevronRight size={16} className="text-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
};