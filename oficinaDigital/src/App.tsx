import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AutContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { EmployeePage } from './pages/Employees';

// IMPORTAÇÕES PARA NOTIFICAÇÃO
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';

// Conecta ao seu servidor Node
const socket = io("http://192.168.100.10:3333");

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuth();

  // --- LÓGICA DE NOTIFICAÇÃO PARA O ADMIN ---
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      socket.on("novo-servico", (data) => {
        // 1. Toca o som de alerta (Plim!)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Erro ao tocar som:", e));

        // 2. Mostra o balão de notificação bonitão
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-2xl rounded-[24px] pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-orange-500`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-black text-white uppercase italic tracking-tighter">
                    🔔 NOVO SERVIÇO CHEGOU!
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {data.description} (Placa: {data.plate})
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-800">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-black text-orange-500 hover:text-orange-400 focus:outline-none"
              >
                OK
              </button>
            </div>
          </div>
        ));
      });
    }

    return () => { socket.off("novo-servico"); };
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Outlet />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          {/* TOASTER É O QUE PERMITE MOSTRAR OS BALÕES NA TELA */}
          <Toaster position="top-right" /> 
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<Services />} />
              <Route path="/employees" element={<EmployeePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/employees" replace />;
};

export default App;