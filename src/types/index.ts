export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mechanic' | 'receptionist';
  avatar?: string;
}

export interface Service {
  id: string;
  vehicleId?: string;    // Fica opcional agora
  tempPlate?: string; 
  description: string;
  mechanicId: string;
  status: 'pending_approval' | 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  totalCost: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  ownerName: string;
  ownerPhone: string;
  status: 'in-service' | 'waiting' | 'ready' | 'delivered';
  createdAt: string;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;         // Este será o PREÇO DE VENDA final
  purchasePrice: number; // Adicionado: Preço que você pagou
  markup: number;        // Adicionado: Porcentagem de lucro
  supplier: string;
  location: string;
}

// Atualizado para aceitar EXATAMENTE as categorias que usamos no layout
export type DocumentCategory = 'nfe' | 'contrato' | 'rh' | 'outros';

export interface WorkshopDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: string;
  category: DocumentCategory; // Usando o tipo específico acima
}

export interface BidItem {
  id: string;
  partName: string;
  quantity: number;
  targetPrice: number;
  status: 'open' | 'closed' | 'awarded';
  matchedInventoryId?: string;
}

export interface Bid {
  id: string;
  title: string;
  description: string;
  deadline: string;
  items: BidItem[];
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
}