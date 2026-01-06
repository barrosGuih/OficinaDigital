import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, Part, Service, WorkshopDocument, Bid } from '../types';
import { io } from 'socket.io-client';

// ⚠️ CERTIFIQUE-SE QUE ESTE IP É O MESMO DO SEU IPCONFIG
const API_URL = 'http://192.168.100.10:3333'; 

// Inicializa o Socket para tempo real
const socket = io(API_URL);

interface DataContextType {
  vehicles: Vehicle[];
  parts: Part[];
  services: Service[];
  documents: WorkshopDocument[];
  bids: Bid[];
  loading: boolean;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addPart: (part: Omit<Part, 'id'>) => Promise<void>;
  updatePart: (part: Part) => Promise<void>;
  deletePart: (id: string) => Promise<void>;
  addService: (service: Omit<Service, 'id' | 'startDate'>) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  approveService: (id: string, totalCost: number) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addDocument: (doc: Omit<WorkshopDocument, 'id' | 'uploadDate'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  addBid: (bid: Bid) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [documents, setDocuments] = useState<WorkshopDocument[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CARREGAR DADOS INICIAIS E CONFIGURAR OUVINTES EM TEMPO REAL
  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        const [resVehicles, resParts, resServices, resDocs] = await Promise.all([
          fetch(`${API_URL}/vehicles`),
          fetch(`${API_URL}/parts`),
          fetch(`${API_URL}/services`),
          fetch(`${API_URL}/documents`)
        ]);

        if (resVehicles.ok) setVehicles(await resVehicles.json());
        if (resParts.ok) setParts(await resParts.json());
        if (resServices.ok) setServices(await resServices.json());
        if (resDocs.ok) setDocuments(await resDocs.json());
        
      } catch (error) {
        console.error("Erro ao carregar dados do banco:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();

    // --- CONFIGURAÇÃO DO SOCKET (ATUALIZAÇÃO SEM F5) ---
    
    // Escuta quando um funcionário envia um novo serviço
    socket.on("novo-servico-full", (novoServico: Service) => {
      setServices(prev => [novoServico, ...prev]);
    });

    // Escuta quando o patrão aprova/altera um serviço
    socket.on("servico-atualizado", (servicoAtualizado: Service) => {
      setServices(prev => prev.map(s => s.id === servicoAtualizado.id ? servicoAtualizado : s));
    });

    return () => {
      socket.off("novo-servico-full");
      socket.off("servico-atualizado");
    };
  }, []);

  // --- OPERAÇÕES VEÍCULOS ---
  const addVehicle = async (v: Omit<Vehicle, 'id' | 'createdAt'>) => {
    const res = await fetch(`${API_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
    if (res.ok) {
      const saved = await res.json();
      setVehicles(prev => [saved, ...prev]);
    }
  };

  const updateVehicle = async (v: Vehicle) => {
    const res = await fetch(`${API_URL}/vehicles/${v.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
    if (res.ok) {
      setVehicles(prev => prev.map(item => item.id === v.id ? v : item));
    }
  };

  const deleteVehicle = async (id: string) => {
    const res = await fetch(`${API_URL}/vehicles/${id}`, { method: 'DELETE' });
    if (res.ok) setVehicles(prev => prev.filter(item => item.id !== id));
  };

  // --- OPERAÇÕES PEÇAS (ESTOQUE) ---
  const addPart = async (p: Omit<Part, 'id'>) => {
    const res = await fetch(`${API_URL}/parts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    if (res.ok) {
      const saved = await res.json();
      setParts(prev => [saved, ...prev]);
    }
  };

  const updatePart = async (p: Part) => {
    const res = await fetch(`${API_URL}/parts/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    if (res.ok) {
      setParts(prev => prev.map(item => item.id === p.id ? p : item));
    }
  };

  const deletePart = async (id: string) => {
    const res = await fetch(`${API_URL}/parts/${id}`, { method: 'DELETE' });
    if (res.ok) setParts(prev => prev.filter(item => item.id !== id));
  };

  // --- OPERAÇÕES SERVIÇOS (O.S) ---
  const addService = async (s: Omit<Service, 'id' | 'startDate'>) => {
    const res = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s)
    });
    // Nota: A atualização da lista local acontece via Socket (novo-servico-full)
    // Mas mantemos aqui como segurança se o socket falhar
    if (res.ok) {
      const saved = await res.json();
      setServices(prev => {
        const exists = prev.find(item => item.id === saved.id);
        if (exists) return prev;
        return [saved, ...prev];
      });
    }
  };

  // FUNÇÃO DE APROVAÇÃO (Onde você coloca o preço e finaliza)
  const approveService = async (id: string, totalCost: number) => {
    const res = await fetch(`${API_URL}/services/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalCost, status: 'completed' })
    });
    
    if (res.ok) {
      const updated = await res.json();
      setServices(prev => prev.map(item => item.id === id ? updated : item));
    }
  };

  const updateService = async (s: Service) => {
    const res = await fetch(`${API_URL}/services/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s)
    });
    if (res.ok) {
      setServices(prev => prev.map(item => item.id === s.id ? s : item));
    }
  };

  const deleteService = async (id: string) => {
    const res = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
    if (res.ok) setServices(prev => prev.filter(item => item.id !== id));
  };

  // --- OPERAÇÕES DOCUMENTOS ---
  const addDocument = async (d: Omit<WorkshopDocument, 'id' | 'uploadDate'>) => {
    const res = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    if (res.ok) {
      const saved = await res.json();
      setDocuments(prev => [saved, ...prev]);
    }
  };

  const deleteDocument = async (id: string) => {
    const res = await fetch(`${API_URL}/documents/${id}`, { method: 'DELETE' });
    if (res.ok) setDocuments(prev => prev.filter(item => item.id !== id));
  };

  const addBid = async (b: Bid) => {
    setBids([...bids, b]);
  };

  return (
    <DataContext.Provider value={{
      vehicles, parts, services, documents, bids, loading,
      addVehicle, updateVehicle, deleteVehicle,
      addPart, updatePart, deletePart,
      addService, updateService, approveService, deleteService,
      addDocument, deleteDocument,
      addBid
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};