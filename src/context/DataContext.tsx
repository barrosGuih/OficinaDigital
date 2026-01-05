import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, Part, Service, WorkshopDocument, Bid } from '../types';

// URL do seu Backend
const API_URL = 'http://localhost:3333';

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

  // 1. CARREGAR TODOS OS DADOS DO BANCO AO INICIAR
  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        // Faz todas as chamadas em paralelo para ser mais rápido
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
    if (res.ok) setParts(prev => prev.map(item => item.id === p.id ? p : item));
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
    if (res.ok) {
      const saved = await res.json();
      setServices(prev => [saved, ...prev]);
    }
  };

  const updateService = async (s: Service) => {
    const res = await fetch(`${API_URL}/services/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s)
    });
    if (res.ok) setServices(prev => prev.map(item => item.id === s.id ? s : item));
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

  // Bids (Lances/Licitações) - Pode manter local por enquanto ou criar rota se precisar
  const addBid = async (b: Bid) =>{
    setBids([...bids, b])};

  return (
    <DataContext.Provider value={{
      vehicles, parts, services, documents, bids, loading,
      addVehicle, updateVehicle, deleteVehicle,
      addPart, updatePart, deletePart,
      addService, updateService, deleteService,
      addDocument, deleteDocument,
      addBid
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};