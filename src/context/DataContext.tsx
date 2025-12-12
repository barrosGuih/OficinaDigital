import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vehicle, Part, Service, WorkshopDocument, Bid } from '../types';
import { MOCK_VEHICLES, MOCK_PARTS, MOCK_SERVICES, MOCK_DOCUMENTS, MOCK_BIDS } from '../services/mockData';

interface DataContextType {
  vehicles: Vehicle[];
  parts: Part[];
  services: Service[];
  documents: WorkshopDocument[];
  bids: Bid[];
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  addPart: (part: Part) => void;
  updatePart: (part: Part) => void;
  deletePart: (id: string) => void;
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  deleteService: (id: string) => void;
  addDocument: (doc: WorkshopDocument) => void;
  deleteDocument: (id: string) => void;
  addBid: (bid: Bid) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or Mock Data
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const stored = localStorage.getItem('oficina_vehicles');
    return stored ? JSON.parse(stored) : MOCK_VEHICLES;
  });

  const [parts, setParts] = useState<Part[]>(() => {
    const stored = localStorage.getItem('oficina_parts');
    return stored ? JSON.parse(stored) : MOCK_PARTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const stored = localStorage.getItem('oficina_services');
    return stored ? JSON.parse(stored) : MOCK_SERVICES;
  });

  const [documents, setDocuments] = useState<WorkshopDocument[]>(() => {
    const stored = localStorage.getItem('oficina_documents');
    return stored ? JSON.parse(stored) : MOCK_DOCUMENTS;
  });

  const [bids, setBids] = useState<Bid[]>(() => {
    const stored = localStorage.getItem('oficina_bids');
    return stored ? JSON.parse(stored) : MOCK_BIDS;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => localStorage.setItem('oficina_vehicles', JSON.stringify(vehicles)), [vehicles]);
  useEffect(() => localStorage.setItem('oficina_parts', JSON.stringify(parts)), [parts]);
  useEffect(() => localStorage.setItem('oficina_services', JSON.stringify(services)), [services]);
  useEffect(() => localStorage.setItem('oficina_documents', JSON.stringify(documents)), [documents]);
  useEffect(() => localStorage.setItem('oficina_bids', JSON.stringify(bids)), [bids]);

  // CRUD Operations
  const addVehicle = (v: Vehicle) => setVehicles([...vehicles, v]);
  const updateVehicle = (v: Vehicle) => setVehicles(vehicles.map(item => item.id === v.id ? v : item));
  const deleteVehicle = (id: string) => setVehicles(vehicles.filter(item => item.id !== id));

  const addPart = (p: Part) => setParts([...parts, p]);
  const updatePart = (p: Part) => setParts(parts.map(item => item.id === p.id ? p : item));
  const deletePart = (id: string) => setParts(parts.filter(item => item.id !== id));

  const addService = (s: Service) => setServices([...services, s]);
  const updateService = (s: Service) => setServices(services.map(item => item.id === s.id ? s : item));
  const deleteService = (id: string) => setServices(services.filter(item => item.id !== id));

  const addDocument = (d: WorkshopDocument) => setDocuments([...documents, d]);
  const deleteDocument = (id: string) => setDocuments(documents.filter(item => item.id !== id));

  const addBid = (b: Bid) => setBids([...bids, b]);

  return (
    <DataContext.Provider value={{
      vehicles, parts, services, documents, bids,
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
