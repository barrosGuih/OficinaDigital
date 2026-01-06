import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AutContext'; // Verifique se o nome é AutContext ou AuthContext
import { Wrench, AlertCircle, Loader2, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. O login deve retornar os dados do usuário (id, name, role)
      const user = await login(email, password);

      // 2. Lógica de Redirecionamento baseada no ROLE do Banco de Dados
      if (user.role === 'admin') {
        navigate('/dashboard'); // Admin vai para o Dashboard
      } else if (user.role === 'mechanic') {
        navigate('/employees'); // Mecânico vai para a página de lançamentos
      } else {
        navigate('/'); // Outros casos
      }

    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      {/* Background decorativo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-orange-900/10 overflow-hidden z-10 border border-white animate-in zoom-in duration-300">
        {/* Banner Superior */}
        <div className="bg-orange-500 p-10 text-center relative">
          <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
            <Wrench className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Automecânica Leôncio</h1>
          <p className="text-orange-100 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 opacity-80">Gestão Digital de Alta Performance</p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 animate-bounce">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-bold uppercase italic text-[11px]">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Acesso do Usuário</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-600 transition-all shadow-inner placeholder:text-slate-300"
                    placeholder="email@oficina.com"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1 block">Senha Privada</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-600 transition-all shadow-inner placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-orange-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100 group italic uppercase tracking-widest"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  AUTENTICAR ACESSO
                  <Wrench className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button 
                type="button"
                className="text-[9px] font-black text-slate-300 hover:text-orange-500 uppercase tracking-[0.2em] transition-colors"
              >
                Esqueci minhas credenciais
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};